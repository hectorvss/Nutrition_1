import { Router } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set. Cannot start without a valid Stripe key.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' as any,
});

const router = Router();

// 1. Create Checkout Session
router.post('/create-checkout-session', verifyManager, async (req: any, res) => {
  const { priceId, userId, userEmail } = req.body;

  if (!priceId || !userId) {
    return res.status(400).json({ error: 'Missing priceId or userId' });
  }

  // Ensure the authenticated manager can only create sessions for themselves
  if (req.user.id !== userId) {
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
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook Handler
// Note: This requires the raw body to be passed from the main index.ts
router.post('/webhook', async (req: any, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This MUST be the raw body (Buffer)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency guard: reject replayed events
  try {
    const { error: insertErr } = await supabaseAdmin
      .from('stripe_processed_events')
      .insert({ event_id: event.id });

    if (insertErr) {
      // Unique violation means already processed
      if (insertErr.code === '23505') {
        return res.json({ received: true, duplicate: true });
      }
      throw insertErr;
    }
  } catch (dedupErr: any) {
    if (dedupErr.code === '23505') {
      return res.json({ received: true, duplicate: true });
    }
    console.error('Dedup check failed:', dedupErr);
    return res.status(500).json({ error: 'Dedup check failed' });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const planTier = getPlanTier(subscription.items.data[0].price.id);

          await supabaseAdmin.from('manager_subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_tier: planTier,
            status: subscription.status,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
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
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Event Handler Error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

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
