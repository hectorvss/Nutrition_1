// Webhook por-coach: cada coach registra en SU cuenta de Stripe la URL
//   https://<app>/api/stripe/coach-webhook/<managerId>
// y pega el signing secret (whsec_...) en Ajustes → Integraciones. Aquí
// verificamos la firma con ESE secret y sincronizamos `client_billing` en
// tiempo real (pagos, renovaciones, cancelaciones) + notificamos al coach.
//
// El managerId va en la URL (no es secreto): la verificación de firma con el
// secret por-coach es lo que impide falsificar eventos. Sin Stripe Connect,
// éste es el patrón multi-tenant estándar.
import { Router } from 'express';
import type Stripe from 'stripe';
import { supabaseAdmin } from '../db/index.js';
import { newStripeClient } from '../lib/stripe.js';
import { logger } from '../lib/logger.js';
import { notifyManagerOfPayment, isPaid } from './client-billing.js';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const errMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

const periodEndIso = (sub: any): string | null => {
  const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
};

// Localiza la fila client_billing afectada por un objeto Stripe, restringida al
// coach del webhook (defensa multi-tenant).
async function findRow(managerId: string, opts: { subscriptionId?: string | null; invoiceId?: string | null; paymentLinkId?: string | null }) {
  const base = supabaseAdmin.from('client_billing').select('*').eq('manager_id', managerId);
  if (opts.subscriptionId) {
    const { data } = await base.eq('stripe_subscription_id', opts.subscriptionId).maybeSingle();
    if (data) return data;
  }
  if (opts.invoiceId) {
    const { data } = await supabaseAdmin.from('client_billing').select('*').eq('manager_id', managerId).eq('stripe_invoice_id', opts.invoiceId).maybeSingle();
    if (data) return data;
  }
  if (opts.paymentLinkId) {
    const { data } = await supabaseAdmin.from('client_billing').select('*').eq('manager_id', managerId).eq('stripe_payment_link_id', opts.paymentLinkId).maybeSingle();
    if (data) return data;
  }
  return null;
}

router.post('/:managerId', async (req: any, res) => {
  const managerId = String(req.params.managerId || '');
  if (!UUID_RE.test(managerId)) return res.status(400).send('Invalid manager id');

  // Resuelve el secret y la clave del coach.
  const { data: integ } = await supabaseAdmin
    .from('integrations')
    .select('stripe_secret_key, stripe_webhook_secret')
    .eq('user_id', managerId)
    .maybeSingle();
  if (!integ?.stripe_webhook_secret || !integ?.stripe_secret_key) {
    return res.status(400).send('Webhook not configured for this account');
  }

  const stripe = newStripeClient(integ.stripe_secret_key);
  const sig = req.headers['stripe-signature'] as string | undefined;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, integ.stripe_webhook_secret);
  } catch (err) {
    logger.error('coach_webhook.signature_failed', { managerId, err: errMessage(err) });
    return res.status(400).send(`Webhook Error: ${errMessage(err)}`);
  }

  // Idempotencia: la tabla stripe_processed_events (PK event_id) la comparte el
  // webhook de plataforma y TODOS los coaches. Los `evt_...` son únicos por
  // CUENTA, no globalmente, así que namespaceamos con el managerId para que el
  // evento de una cuenta nunca se descarte como duplicado de otra cuenta.
  const dedupKey = `coach:${managerId}:${event.id}`;
  const { data: dup } = await supabaseAdmin
    .from('stripe_processed_events')
    .select('event_id')
    .eq('event_id', dedupKey)
    .maybeSingle();
  if (dup) return res.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const paymentLinkId = (typeof s.payment_link === 'string' ? s.payment_link : s.payment_link?.id) || null;
        const subscriptionId = (typeof s.subscription === 'string' ? s.subscription : s.subscription?.id) || null;
        const row = await findRow(managerId, { subscriptionId, paymentLinkId });
        if (row) {
          const updates: any = {};
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
            updates.stripe_subscription_id = subscriptionId;
            updates.status = sub.status;
            updates.current_period_end = periodEndIso(sub);
          } else if (s.payment_status === 'paid') {
            updates.status = 'paid';
          }
          if (updates.status) {
            await supabaseAdmin.from('client_billing').update(updates).eq('id', row.id);
            if (isPaid(updates.status) && !isPaid(row.status)) {
              await notifyManagerOfPayment(managerId, row.client_id, { ...row, ...updates });
            }
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const row = await findRow(managerId, { subscriptionId: sub.id });
        if (row) {
          const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status;
          await supabaseAdmin.from('client_billing')
            .update({ status, current_period_end: periodEndIso(sub) })
            .eq('id', row.id);
          if (isPaid(status) && !isPaid(row.status)) {
            await notifyManagerOfPayment(managerId, row.client_id, { ...row, status });
          }
        }
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as any;
        const subscriptionId = (typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id) || null;
        const row = await findRow(managerId, { invoiceId: inv.id, subscriptionId });
        if (row) {
          const status = event.type === 'invoice.paid' ? (subscriptionId ? 'active' : 'paid') : 'past_due';
          await supabaseAdmin.from('client_billing').update({ status }).eq('id', row.id);
          if (event.type === 'invoice.paid' && !isPaid(row.status)) {
            await notifyManagerOfPayment(managerId, row.client_id, { ...row, status });
          }
        }
        break;
      }
    }

    await supabaseAdmin.from('stripe_processed_events').insert({ event_id: event.id });
    logger.info('coach_webhook.processed', { managerId, eventId: event.id, type: event.type });
    res.json({ received: true });
  } catch (error) {
    logger.error('coach_webhook.handler_failed', { managerId, eventId: event.id, type: event.type, err: errMessage(error) });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
