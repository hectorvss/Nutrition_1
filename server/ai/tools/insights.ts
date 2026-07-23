import { z } from 'zod';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';

const UUID = z.string().uuid();

export class ListCheckinsTool extends NulyTool<z.ZodType> {
  readonly name = 'list_checkins';
  readonly description =
    'Lista check-ins recientes de los clientes del coach (pendientes de revisar o todos). Devuelve id, cliente, fecha y si está revisado.';
  readonly schema = z.object({
    client_id: UUID.optional(),
    only_pending: z.boolean().default(false),
    limit: z.number().int().min(1).max(50).default(20),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    let q = supabaseAdmin
      .from('client_checkin_submissions')
      .select('id, client_id, submitted_at, reviewed_at, answers_json, users!client_id (manager_id, profiles!user_id (full_name))')
      .order('submitted_at', { ascending: false })
      .limit(args.limit);
    if (args.client_id) q = q.eq('client_id', args.client_id);
    if (args.only_pending) q = q.is('reviewed_at', null);
    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const rows = (data || [])
      .filter((r: any) => {
        const u = Array.isArray(r.users) ? r.users[0] : r.users;
        return u?.manager_id === ctx.managerId; // ownership
      })
      .map((r: any) => {
        const u = Array.isArray(r.users) ? r.users[0] : r.users;
        const p = Array.isArray(u?.profiles) ? u.profiles[0] : u?.profiles;
        return {
          id: r.id,
          client_id: r.client_id,
          client_name: p?.full_name || null,
          submitted_at: r.submitted_at,
          reviewed: !!r.reviewed_at,
        };
      });
    return [JSON.stringify({ count: rows.length, checkins: rows })];
  }
}

export class GetCheckinTool extends NulyTool<z.ZodType> {
  readonly name = 'get_checkin';
  readonly description =
    'Detalle completo de un check-in: respuestas del cliente (peso, adherencia, energía, notas…). Úsala antes de valorar el progreso o redactar feedback.';
  readonly schema = z.object({ checkin_id: UUID });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const { data, error } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('id, client_id, submitted_at, reviewed_at, answers_json, users!client_id (manager_id)')
      .eq('id', args.checkin_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const u: any = data && (Array.isArray(data.users) ? data.users[0] : data.users);
    if (!data || u?.manager_id !== ctx.managerId) return ['Ese check-in no existe o no pertenece a este coach.'];
    return [
      `Check-in del cliente ${data.client_id}, enviado ${data.submitted_at}${data.reviewed_at ? ' (ya revisado)' : ' (SIN revisar)'}.\n<client_data>\n${JSON.stringify(data.answers_json)}\n</client_data>`,
    ];
  }
}

export class GetBusinessMetricsTool extends NulyTool<z.ZodType> {
  readonly name = 'get_business_metrics';
  readonly description =
    'Métricas del negocio del coach: nº de clientes activos, check-ins pendientes, mensajes sin leer, entrenamientos registrados esta semana y cobros. Úsala para preguntas tipo "¿cómo va mi negocio?" o para el resumen del día.';
  readonly schema = z.object({});

  protected async run(_args: unknown, ctx: ToolCtx): Promise<[string, unknown?]> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [clients, pendingCheckins, unread, workouts, billing] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, status', { count: 'exact' })
        .eq('manager_id', ctx.managerId)
        .eq('role', 'CLIENT'),
      supabaseAdmin
        .from('client_checkin_submissions')
        .select('id, users!client_id (manager_id)', { count: 'exact' })
        .is('reviewed_at', null),
      supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', ctx.managerId)
        .or('is_read.eq.false,is_read.is.null'),
      supabaseAdmin
        .from('workout_logs')
        .select('id, users!client_id (manager_id)', { count: 'exact' })
        .gte('logged_at', weekAgo),
      supabaseAdmin
        .from('client_billing')
        .select('status, amount_cents:amount, currency')
        .eq('manager_id', ctx.managerId)
        .limit(200),
    ]);

    const own = (rows: any[] | null) =>
      (rows || []).filter((r: any) => {
        const u = Array.isArray(r.users) ? r.users[0] : r.users;
        return !r.users || u?.manager_id === ctx.managerId;
      }).length;

    const clientRows = clients.data || [];
    const metrics = {
      clients_total: clientRows.length,
      clients_active: clientRows.filter((c: any) => c.status === 'active').length,
      checkins_pending_review: own(pendingCheckins.data),
      unread_messages: unread.count || 0,
      workouts_last_7d: own(workouts.data),
      billing_rows: (billing.data || []).length,
    };
    return [JSON.stringify(metrics), { kind: 'metrics', metrics }];
  }
}
