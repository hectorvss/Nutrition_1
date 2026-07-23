import { z } from 'zod';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';
import {
  cancelBillingAction,
  pauseBillingAction,
  resumeBillingAction,
} from '../../routes/client-billing.js';

const UUID = z.string().uuid();

/** Resumen legible de un cobro para previews de aprobación. */
async function describeCharge(billingId: string, managerId: string): Promise<string> {
  const { data: row } = await supabaseAdmin
    .from('client_billing')
    .select('description, amount_cents, currency, interval, status, client_id')
    .eq('id', billingId)
    .eq('manager_id', managerId)
    .maybeSingle();
  if (!row) return 'Cobro no encontrado.';
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('user_id', row.client_id)
    .maybeSingle();
  return `${prof?.full_name || row.client_id} · ${row.description || 'Sin descripción'} · ${((row.amount_cents || 0) / 100).toFixed(2)} ${String(row.currency || 'eur').toUpperCase()}${row.interval ? `/${row.interval}` : ''} · estado: ${row.status}`;
}

export class GetBillingOverviewTool extends NulyTool<z.ZodType> {
  readonly name = 'get_billing_overview';
  readonly description =
    'Vista completa de cobros del coach: suscripciones y pagos por cliente (estado, importe, próximo cobro, recordatorios) + planes de precios. Úsala para preguntas de ingresos, morosos o estado de cobros.';
  readonly schema = z.object({
    client_id: UUID.optional().describe('Filtrar por un cliente concreto'),
    status: z.enum(['pending', 'active', 'paid', 'past_due', 'canceled']).optional(),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    let q = supabaseAdmin
      .from('client_billing')
      .select('id, client_id, kind, description, amount_cents, currency, interval, status, paused, cancel_at_period_end, current_period_end, last_reminder_at, created_at, users!client_id (profiles!user_id (full_name))')
      .eq('manager_id', ctx.managerId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (args.client_id) q = q.eq('client_id', args.client_id);
    if (args.status) q = q.eq('status', args.status);
    const [{ data: rows, error }, { data: plans }] = await Promise.all([
      q,
      supabaseAdmin
        .from('billing_plans')
        .select('id, name, amount_cents, currency, interval, archived')
        .eq('manager_id', ctx.managerId)
        .limit(50),
    ]);
    if (error) throw new Error(error.message);

    const charges = (rows || []).map((r: any) => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users;
      const p = Array.isArray(u?.profiles) ? u.profiles[0] : u?.profiles;
      return {
        billing_id: r.id,
        client_id: r.client_id,
        client_name: p?.full_name || null,
        kind: r.kind,
        description: r.description,
        amount_eur: (r.amount_cents || 0) / 100,
        currency: r.currency,
        interval: r.interval,
        status: r.status,
        paused: r.paused,
        cancels_at_period_end: r.cancel_at_period_end,
        current_period_end: r.current_period_end,
        last_reminder_at: r.last_reminder_at,
      };
    });

    const active = charges.filter(c => ['active', 'paid'].includes(String(c.status)));
    const monthlyRecurring = charges
      .filter(c => c.status === 'active' && c.interval === 'month')
      .reduce((sum, c) => sum + c.amount_eur, 0);
    const pending = charges.filter(c => ['pending', 'past_due'].includes(String(c.status)));

    return [
      JSON.stringify({
        summary: {
          total_charges: charges.length,
          active: active.length,
          mrr_eur_approx: Math.round(monthlyRecurring * 100) / 100,
          pending_or_past_due: pending.length,
        },
        charges,
        plans: (plans || []).filter((p: any) => !p.archived).map((p: any) => ({
          id: p.id, name: p.name, amount_eur: (p.amount_cents || 0) / 100, interval: p.interval,
        })),
      }),
    ];
  }
}

export class SendPaymentReminderTool extends NulyTool<z.ZodType> {
  readonly name = 'send_payment_reminder';
  readonly description =
    'Envía al cliente un recordatorio de pago por chat (tarjeta con botón "Pagar ahora" + nota opcional). Requiere aprobación del coach. Usa get_billing_overview antes para localizar el billing_id correcto.';
  readonly schema = z.object({
    billing_id: UUID,
    message: z.string().max(1000).optional().describe('Nota personal del coach que acompaña a la tarjeta de pago'),
  });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('description, amount_cents, currency, status, client_id, profiles:users!client_id (profiles!user_id (full_name))')
      .eq('id', args.billing_id)
      .eq('manager_id', ctx.managerId)
      .maybeSingle();
    if (!row) return 'Cobro no encontrado.';
    const u: any = Array.isArray((row as any).profiles) ? (row as any).profiles[0] : (row as any).profiles;
    const p = Array.isArray(u?.profiles) ? u.profiles[0] : u?.profiles;
    return (
      `**Enviar recordatorio de pago** a ${p?.full_name || row.client_id}:\n` +
      `- Cobro: ${row.description || '—'} · ${((row.amount_cents || 0) / 100).toFixed(2)} ${String(row.currency || 'eur').toUpperCase()} (estado: ${row.status})\n` +
      (args.message ? `- Nota: "${args.message}"` : '- Sin nota adicional')
    );
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    // Misma lógica que POST /manager/client-billing/:id/remind
    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('id', args.billing_id)
      .eq('manager_id', ctx.managerId)
      .maybeSingle();
    if (!row) return ['Cobro no encontrado o no pertenece a este coach.'];
    if (!row.payment_url) return ['Este cobro no tiene enlace de pago compartible — no se puede recordar por chat.'];

    const { error: msgErr } = await supabaseAdmin.from('messages').insert({
      sender_id: ctx.managerId,
      receiver_id: row.client_id,
      content: (args.message || '').trim(),
      attachment_type: 'payment',
      attachment_url: row.payment_url,
      payload: {
        billing_id: row.id,
        kind: row.kind,
        amount_cents: row.amount_cents,
        currency: row.currency,
        interval: row.interval,
        description: row.description,
        status: row.status,
      },
    });
    if (msgErr) throw new Error(msgErr.message);

    await supabaseAdmin
      .from('client_billing')
      .update({ last_reminder_at: new Date().toISOString() })
      .eq('id', args.billing_id);

    return ['Recordatorio de pago enviado al cliente por chat.', { kind: 'reminder_sent', billing_id: args.billing_id }];
  }
}

export class CancelSubscriptionTool extends NulyTool<z.ZodType> {
  readonly name = 'cancel_subscription';
  readonly description =
    'Cancela un cobro/suscripción de un cliente en Stripe (inmediata o a fin de ciclo). OPERACIÓN CON IMPACTO MONETARIO — siempre requiere aprobación. Usa get_billing_overview antes para localizar el billing_id.';
  readonly schema = z.object({
    billing_id: UUID,
    at_period_end: z.boolean().default(true).describe('true = a fin de ciclo (recomendado); false = inmediata'),
  });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    const desc = await describeCharge(args.billing_id, ctx.managerId);
    return `**Cancelar suscripción** (${args.at_period_end ? 'a fin de ciclo' : 'INMEDIATA'}):\n- ${desc}`;
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const result = await cancelBillingAction(ctx.managerId, args.billing_id, args.at_period_end);
    if (!result.ok) return [`No se pudo cancelar: ${result.error}`];
    return [
      result.scheduled
        ? 'Cancelación programada: la suscripción sigue activa hasta fin de ciclo.'
        : 'Suscripción cancelada.',
      { kind: 'billing_action', action: 'cancel', billing_id: args.billing_id, scheduled: !!result.scheduled },
    ];
  }
}

export class PauseSubscriptionTool extends NulyTool<z.ZodType> {
  readonly name = 'pause_subscription';
  readonly description =
    'Pausa el cobro de una suscripción activa de un cliente (Stripe deja de cobrar hasta reanudar). Requiere aprobación.';
  readonly schema = z.object({ billing_id: UUID });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    return `**Pausar suscripción:**\n- ${await describeCharge(args.billing_id, ctx.managerId)}`;
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const result = await pauseBillingAction(ctx.managerId, args.billing_id);
    if (!result.ok) return [`No se pudo pausar: ${result.error}`];
    return ['Suscripción pausada — Stripe no cobrará hasta reanudarla.', { kind: 'billing_action', action: 'pause', billing_id: args.billing_id }];
  }
}

export class ResumeSubscriptionTool extends NulyTool<z.ZodType> {
  readonly name = 'resume_subscription';
  readonly description = 'Reanuda el cobro de una suscripción pausada de un cliente. Requiere aprobación.';
  readonly schema = z.object({ billing_id: UUID });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    return `**Reanudar suscripción:**\n- ${await describeCharge(args.billing_id, ctx.managerId)}`;
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const result = await resumeBillingAction(ctx.managerId, args.billing_id);
    if (!result.ok) return [`No se pudo reanudar: ${result.error}`];
    return ['Suscripción reanudada — los cobros continúan con normalidad.', { kind: 'billing_action', action: 'resume', billing_id: args.billing_id }];
  }
}
