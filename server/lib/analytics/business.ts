import type { AnalyticsContext } from './types.js';
import { supabaseAdmin } from '../../db/index.js';
import { newStripeClient } from '../stripe.js';

/**
 * KPIs ampliados de la pestaña BUSINESS.
 *
 * Devuelve un objeto que se fusiona (spread) sobre el objeto `business` base
 * del endpoint. Las claves que devuelva aquí estarán disponibles en el
 * frontend como `data.business.<clave>`.
 *
 * Aquí va toda la lógica de Stripe ampliada (subscriptions, invoices,
 * refunds, disputes) además de los KPIs no-Stripe de negocio.
 */

/** Normaliza el importe de un item de subscripción a base mensual. */
function normalizeToMonthly(amount: number, interval: string, intervalCount: number): number {
  const count = intervalCount || 1;
  switch (interval) {
    case 'day':
      return (amount * 30) / count;
    case 'week':
      return (amount * 52) / 12 / count;
    case 'month':
      return amount / count;
    case 'year':
      return amount / 12 / count;
    default:
      return amount;
  }
}

/** Clave YYYY-MM de una fecha. */
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function computeBusinessExtras(ctx: AnalyticsContext): Promise<Record<string, any>> {
  const out: Record<string, any> = {};
  const now = ctx.now || new Date();
  const windowStart = ctx.windowStart;

  // ---------------------------------------------------------------------------
  // 1. KPIs de clientes (Supabase) — siempre disponibles
  // ---------------------------------------------------------------------------
  const clients = ctx.allClientData || [];
  const lostStatuses = ['archived', 'inactive', 'cancelled', 'canceled', 'lost'];
  out.lostClients = clients.filter((c: any) => {
    const st = String(c.status || '').toLowerCase();
    return lostStatuses.includes(st);
  }).length;

  // Distribución de estados de cliente
  const statusCounts: Record<string, number> = {};
  clients.forEach((c: any) => {
    const st = String(c.status || 'unknown').toLowerCase();
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });
  out.clientStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Altas vs bajas por mes (últimos 6 meses) + crecimiento acumulado
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  const signupsByMonth: Record<string, number> = {};
  months.forEach((m) => (signupsByMonth[m] = 0));
  clients.forEach((c: any) => {
    if (!c.created_at) return;
    const k = monthKey(new Date(c.created_at));
    if (k in signupsByMonth) signupsByMonth[k]++;
  });
  // Bajas: aproximación por status perdido (sin fecha de baja fiable) -> 0 por mes salvo total
  out.clientGrowthByMonth = months.map((m) => ({
    month: m,
    signups: signupsByMonth[m] || 0,
    losses: 0,
  }));
  let cumulative = clients.filter(
    (c: any) => c.created_at && new Date(c.created_at) < new Date(months[0] + '-01')
  ).length;
  out.cumulativeClientGrowth = months.map((m) => {
    cumulative += signupsByMonth[m] || 0;
    return { month: m, total: cumulative };
  });

  // Vida media del cliente en meses (antigüedad media de clientes con fecha)
  const ages = clients
    .filter((c: any) => c.created_at)
    .map((c: any) => (now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  out.avgClientLifetimeMonths = ages.length
    ? Math.round((ages.reduce((a: number, b: number) => a + b, 0) / ages.length) * 10) / 10
    : 0;

  // ---------------------------------------------------------------------------
  // 2. KPIs operativos (Supabase: messages, client_checkin_submissions)
  // ---------------------------------------------------------------------------
  try {
    const clientIds = ctx.clientIds || [];
    // Revisiones de check-in pendientes
    if (clientIds.length) {
      const { count: pendingReviews } = await supabaseAdmin
        .from('client_checkin_submissions')
        .select('id', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .is('reviewed_at', null);
      out.pendingCheckinReviews = pendingReviews || 0;
    } else {
      out.pendingCheckinReviews = 0;
    }
  } catch (e) {
    console.error('business: pendingCheckinReviews', e);
    out.pendingCheckinReviews = 0;
  }

  try {
    const managerId = ctx.managerId;
    const clientIds = ctx.clientIds || [];
    // Mensajes de la ventana
    const { data: windowMsgs } = await supabaseAdmin
      .from('messages')
      .select('sender_id, receiver_id, created_at')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: true });

    const msgs = (windowMsgs || []).filter(
      (m: any) =>
        m.sender_id === managerId ||
        m.receiver_id === managerId ||
        clientIds.includes(m.sender_id) ||
        clientIds.includes(m.receiver_id)
    );
    out.messagesSent = msgs.filter((m: any) => m.sender_id === managerId).length;
    out.messagesReceived = msgs.filter((m: any) => m.receiver_id === managerId).length;

    // Tiempo medio de respuesta del coach: por cada conversación, primer mensaje
    // de cliente seguido de respuesta del coach.
    const byClient: Record<string, any[]> = {};
    msgs.forEach((m: any) => {
      const clientId = m.sender_id === managerId ? m.receiver_id : m.sender_id;
      if (!clientId) return;
      (byClient[clientId] ||= []).push(m);
    });
    const latencies: number[] = [];
    Object.values(byClient).forEach((conv) => {
      conv.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      let pendingClientMsg: number | null = null;
      conv.forEach((m) => {
        const ts = new Date(m.created_at).getTime();
        if (m.sender_id !== managerId) {
          if (pendingClientMsg === null) pendingClientMsg = ts;
        } else if (pendingClientMsg !== null) {
          latencies.push((ts - pendingClientMsg) / (1000 * 60 * 60)); // horas
          pendingClientMsg = null;
        }
      });
    });
    out.avgCoachResponseHours = latencies.length
      ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10
      : 0;
  } catch (e) {
    console.error('business: messages KPIs', e);
    out.messagesSent = 0;
    out.messagesReceived = 0;
    out.avgCoachResponseHours = 0;
  }

  // ---------------------------------------------------------------------------
  // 3. KPIs de Stripe — dependen de integración conectada
  // ---------------------------------------------------------------------------
  const stripeDefaults = {
    stripeConnected: false,
    mrr: 0,
    arr: 0,
    netRevenue: 0,
    arpu: 0,
    avgTicket: 0,
    activeSubscriptions: 0,
    activeTrials: 0,
    trialConversionRate: 0,
    subscriptionChurnRate: 0,
    failedPayments: 0,
    refundsAmount: 0,
    refundsCount: 0,
    openDisputes: 0,
    upcomingRenewalsCount: 0,
    upcomingRenewalsAmount: 0,
    pendingInvoicesAmount: 0,
    mrrGrowth: [] as any[],
    revenueByPlan: [] as any[],
    subscriptionStatusDistribution: [] as any[],
    successfulVsFailedPayments: [] as any[],
  };
  Object.assign(out, stripeDefaults);

  const integrations = ctx.integrations;
  if (integrations?.stripe_enabled && integrations?.stripe_secret_key) {
    try {
      const stripe = newStripeClient(integrations.stripe_secret_key);
      out.stripeConnected = true;

      const windowStartTs = Math.floor(windowStart.getTime() / 1000);
      const next30 = Math.floor((now.getTime() + 30 * 24 * 60 * 60 * 1000) / 1000);
      const nowTs = Math.floor(now.getTime() / 1000);

      // --- Subscriptions ---
      let mrr = 0;
      let activeSubs = 0;
      let activeTrials = 0;
      let canceledInWindow = 0;
      let totalSubsConsidered = 0;
      let trialsConverted = 0;
      let trialsTotal = 0;
      let upcomingRenewalsCount = 0;
      let upcomingRenewalsAmount = 0;
      const planRevenue: Record<string, number> = {};
      const statusDist: Record<string, number> = {};

      for await (const sub of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
        totalSubsConsidered++;
        const st = sub.status;
        statusDist[st] = (statusDist[st] || 0) + 1;

        // Cancelaciones en la ventana
        if (sub.canceled_at && sub.canceled_at >= windowStartTs) canceledInWindow++;

        // Trials: total iniciados y convertidos
        if (sub.trial_start) {
          trialsTotal++;
          if (st === 'active' || st === 'past_due') trialsConverted++;
        }
        if (st === 'trialing') activeTrials++;

        if (st === 'active' || st === 'trialing' || st === 'past_due') {
          let subMonthly = 0;
          for (const item of sub.items.data) {
            const price = item.price;
            const qty = item.quantity || 1;
            const unit = (price.unit_amount || 0) / 100;
            const interval = price.recurring?.interval || 'month';
            const intervalCount = price.recurring?.interval_count || 1;
            const monthly = normalizeToMonthly(unit * qty, interval, intervalCount);
            subMonthly += monthly;
            const planName =
              (price.nickname as string) ||
              (typeof price.product === 'string' ? price.product : (price.product as any)?.name) ||
              'Plan';
            planRevenue[planName] = (planRevenue[planName] || 0) + monthly;
          }
          if (st === 'active') {
            activeSubs++;
            mrr += subMonthly;
          }
          // Renovaciones próximas 30 días
          const periodEnd = (sub as any).current_period_end;
          if (periodEnd && periodEnd >= nowTs && periodEnd <= next30 && !sub.cancel_at_period_end) {
            upcomingRenewalsCount++;
            upcomingRenewalsAmount += subMonthly;
          }
        }
      }

      out.mrr = Math.round(mrr * 100) / 100;
      out.arr = Math.round(mrr * 12 * 100) / 100;
      out.activeSubscriptions = activeSubs;
      out.activeTrials = activeTrials;
      // Churn de suscripción = cancelaciones en la ventana / suscripciones que
      // estaban vivas al inicio de la ventana (activas ahora + las canceladas
      // durante la ventana). NO sobre todas las subs de la historia.
      const subsAtWindowStart = activeSubs + canceledInWindow;
      out.subscriptionChurnRate = subsAtWindowStart
        ? Math.round((canceledInWindow / subsAtWindowStart) * 1000) / 10
        : 0;
      // Conversión trial→pago = trials que ya pagan / trials YA RESUELTOS
      // (se excluyen los trials aún en curso, que todavía no han convertido
      // ni fallado y por tanto no deben lastrar el ratio).
      const resolvedTrials = trialsTotal - activeTrials;
      out.trialConversionRate = resolvedTrials > 0
        ? Math.round((trialsConverted / resolvedTrials) * 1000) / 10
        : 0;
      out.upcomingRenewalsCount = upcomingRenewalsCount;
      out.upcomingRenewalsAmount = Math.round(upcomingRenewalsAmount * 100) / 100;
      out.revenueByPlan = Object.entries(planRevenue).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }));
      out.subscriptionStatusDistribution = Object.entries(statusDist).map(([name, value]) => ({
        name,
        value,
      }));

      // --- Charges (ingreso bruto, ticket medio, exitosos/fallidos) ---
      let grossRevenue = 0;
      let succeededCount = 0;
      let failedCount = 0;
      for await (const charge of stripe.charges.list({
        limit: 100,
        created: { gte: windowStartTs },
      })) {
        if (charge.status === 'succeeded' && charge.paid && !charge.refunded) {
          succeededCount++;
          grossRevenue += (charge.amount || 0) / 100;
        } else if (charge.status === 'failed') {
          failedCount++;
        } else if (charge.status === 'succeeded') {
          succeededCount++;
          grossRevenue += (charge.amount || 0) / 100;
        }
      }
      out.avgTicket = succeededCount
        ? Math.round((grossRevenue / succeededCount) * 100) / 100
        : 0;
      out.successfulVsFailedPayments = [
        { name: 'succeeded', value: succeededCount },
        { name: 'failed', value: failedCount },
      ];

      // --- Refunds ---
      let refundsAmount = 0;
      let refundsCount = 0;
      for await (const refund of stripe.refunds.list({
        limit: 100,
        created: { gte: windowStartTs },
      })) {
        refundsCount++;
        refundsAmount += (refund.amount || 0) / 100;
      }
      out.refundsCount = refundsCount;
      out.refundsAmount = Math.round(refundsAmount * 100) / 100;

      // Ingreso neto = bruto - reembolsos
      out.netRevenue = Math.round((grossRevenue - refundsAmount) * 100) / 100;
      // ARPU = ingreso neto NORMALIZADO a un mes / clientes activos. Se
      // normaliza (netRevenue / windowDays * 30) para que el ARPU no cambie
      // al variar la ventana — siempre es "ingreso mensual por cliente".
      const monthlyNetRevenue = ctx.windowDays > 0
        ? (out.netRevenue / ctx.windowDays) * 30
        : 0;
      out.arpu = ctx.activeClients
        ? Math.round((monthlyNetRevenue / ctx.activeClients) * 100) / 100
        : 0;

      // --- Disputas abiertas en la ventana ---
      let openDisputes = 0;
      for await (const dispute of stripe.disputes.list({ limit: 100, created: { gte: windowStartTs } })) {
        const openStatuses = [
          'warning_needs_response',
          'warning_under_review',
          'needs_response',
          'under_review',
        ];
        if (openStatuses.includes(dispute.status)) openDisputes++;
      }
      out.openDisputes = openDisputes;

      // --- Invoices: pagos fallidos / dunning + facturas pendientes ---
      let failedPayments = 0;
      let pendingInvoicesAmount = 0;
      for await (const inv of stripe.invoices.list({ limit: 100 })) {
        if (inv.status === 'open') {
          pendingInvoicesAmount += (inv.amount_due || 0) / 100;
          if ((inv.attempt_count || 0) > 0 || inv.next_payment_attempt) {
            failedPayments++;
          }
        } else if (inv.status === 'uncollectible') {
          failedPayments++;
        }
      }
      out.failedPayments = failedPayments;
      out.pendingInvoicesAmount = Math.round(pendingInvoicesAmount * 100) / 100;

      // --- Crecimiento de MRR por mes (aprox. con invoices pagadas) ---
      const mrrByMonth: Record<string, number> = {};
      months.forEach((m) => (mrrByMonth[m] = 0));
      const sixMonthsAgoTs = Math.floor(
        new Date(months[0] + '-01').getTime() / 1000
      );
      for await (const inv of stripe.invoices.list({
        limit: 100,
        status: 'paid',
        created: { gte: sixMonthsAgoTs },
      })) {
        const created = (inv as any).created;
        if (!created) continue;
        const k = monthKey(new Date(created * 1000));
        if (k in mrrByMonth) {
          mrrByMonth[k] += (inv.amount_paid || 0) / 100;
        }
      }
      out.mrrGrowth = months.map((m) => ({
        month: m,
        mrr: Math.round(mrrByMonth[m] * 100) / 100,
      }));
    } catch (e) {
      console.error('business: Stripe KPIs', e);
      Object.assign(out, stripeDefaults);
    }
  }

  return out;
}
