import { Router } from 'express';
import type Stripe from 'stripe';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager, type AuthedRequest } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';
import { newStripeClient } from '../lib/stripe.js';

const errMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));
import dotenv from 'dotenv';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY
  ? newStripeClient(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.warn('[stripe] STRIPE_SECRET_KEY is not set — billing endpoints will return 503.');
}

const router = Router();

router.use((req, res, next) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured on this server.' });
  }
  next();
});

// 1. Create Checkout Session
router.post('/create-checkout-session', verifyManager, async (req: AuthedRequest, res) => {
  const { priceId, userId, userEmail } = req.body;

  if (!priceId || !userId) {
    return res.status(400).json({ error: 'Missing priceId or userId' });
  }

  // Ensure the authenticated manager can only create sessions for themselves
  if (req.user?.id !== userId) {
    return res.status(403).json({ error: 'Forbidden: userId mismatch' });
  }

  try {
    // Check if customer already exists
    const { data: subData } = await supabaseAdmin
      .from('manager_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId = subData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe!.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await stripe!.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (error: unknown) {
    logger.error('stripe.checkout.create_failed', { err: errMessage(error) });
    res.status(500).json({ error: errMessage(error) });
  }
});

// 2. Webhook Handler
// Note: This requires the raw body to be passed from the main index.ts
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  let event;

  try {
    event = stripe!.webhooks.constructEvent(
      req.body, // This MUST be the raw body (Buffer)
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: unknown) {
    logger.error('stripe.webhook.signature_failed', { err: errMessage(err) });
    return res.status(400).send(`Webhook Error: ${errMessage(err)}`);
  }

  logger.info('stripe.webhook.received', { eventId: event.id, type: event.type });

  // Idempotency guard: skip events we have already fully processed.
  const { data: alreadyProcessed } = await supabaseAdmin
    .from('stripe_processed_events')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (alreadyProcessed) {
    logger.info('stripe.webhook.duplicate', { eventId: event.id });
    return res.json({ received: true, duplicate: true });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId && subscriptionId) {
          const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items?.data?.[0]?.price?.id;

          await supabaseAdmin.from('manager_subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_tier: priceId ? getPlanTier(priceId) : 'professional',
            status: subscription.status,
            current_period_end: subscriptionPeriodEnd(subscription),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: subData } = await supabaseAdmin
          .from('manager_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (subData?.user_id) {
          await supabaseAdmin.from('manager_subscriptions').update({
            status: subscription.status,
            current_period_end: subscriptionPeriodEnd(subscription),
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
    }

    // Record the event as processed ONLY after successful handling, so a failed
    // event is retried by Stripe instead of being silently dropped as a duplicate.
    await supabaseAdmin.from('stripe_processed_events').insert({ event_id: event.id });

    logger.info('stripe.webhook.processed', { eventId: event.id, type: event.type });
    res.json({ received: true });
  } catch (error: unknown) {
    logger.error('stripe.webhook.handler_failed', { eventId: event.id, type: event.type, err: errMessage(error) });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Resolves the subscription period end across Stripe API versions.
// Newer versions moved current_period_end onto the subscription item.
// `any` aqui es intencional: la firma admite tanto el shape antiguo
// (Stripe.Subscription con current_period_end en la raiz) como el nuevo
// (con current_period_end dentro de items.data[0]). Tipar estrictamente
// rompe segun la version de @types/stripe instalada.
function subscriptionPeriodEnd(subscription: any): string | null {
  const raw = subscription?.current_period_end
    ?? subscription?.items?.data?.[0]?.current_period_end;
  if (!raw || typeof raw !== 'number') return null;
  return new Date(raw * 1000).toISOString();
}

// Helper to map Price IDs to Tiers
function getPlanTier(priceId: string): string {
  const priceToTier: Record<string, string> = {
    // Monthly
    "price_1TCN9vCR4WvolxlpwC33dk8J": "professional",
    "price_1TCNAHCR4WvolxlpwpLRfmwX": "scale",
    "price_1TCNAcCR4WvolxlptLzNYdsz": "unlimited",
    // Annual (20% discount)
    "price_1TCf4PCR4Wvolxlp3MoDzi0J": "professional",
    "price_1TCf52CR4WvolxlpcMMLOVpv": "scale",
    "price_1TCf5cCR4WvolxlpWGhpOgnI": "unlimited"
  };

  return priceToTier[priceId] || 'professional';
}

export default router;
