// Cobros coach→cliente. El coach cobra a SUS clientes con SU PROPIA cuenta
// Stripe (la secret key guardada en `integrations.stripe_secret_key`). Este
// router crea los objetos en esa cuenta (payment links / invoices), guarda un
// espejo local en `client_billing` para listarlos y enviar recordatorios por
// chat, y refresca el estado on-read (no dependemos de webhooks por-coach).
import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';
import { newStripeClient } from '../lib/stripe.js';
import { safeErr } from '../lib/http.js';
import type Stripe from 'stripe';

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Auth: mismo patrón que el resto de rutas de manager ────────────────────
const verifyManager = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });
    // Confirma rol MANAGER
    const { data: profile } = await supabaseAdmin
      .from('users').select('role').eq('id', data.user.id).maybeSingle();
    if (!profile || profile.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Forbidden: manager only' });
    }
    req.user = data.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Auth error' });
  }
};
router.use(verifyManager);

// ── Helper: cliente Stripe del coach (su propia cuenta) ────────────────────
async function getCoachStripe(managerId: string): Promise<{ stripe: Stripe } | { error: string; code: number }> {
  const { data: integ } = await supabaseAdmin
    .from('integrations')
    .select('stripe_enabled, stripe_secret_key')
    .eq('user_id', managerId)
    .maybeSingle();
  if (!integ?.stripe_secret_key) {
    return { error: 'stripe_not_connected', code: 400 };
  }
  return { stripe: newStripeClient(integ.stripe_secret_key) };
}

// ── Helper: verifica que el cliente pertenece al coach ─────────────────────
async function getOwnedClient(managerId: string, clientId: string) {
  if (!UUID_RE.test(String(clientId))) return null;
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, manager_id')
    .eq('id', clientId)
    .eq('manager_id', managerId)
    .maybeSingle();
  return data || null;
}

// ── Helper: find-or-create Stripe Customer en la cuenta del coach ──────────
async function ensureStripeCustomer(stripe: Stripe, row: any, client: { email?: string; full_name?: string }): Promise<string> {
  if (row?.stripe_customer_id) return row.stripe_customer_id;
  const customer = await stripe.customers.create({
    email: client.email || undefined,
    name: client.full_name || undefined,
    metadata: { client_id: row?.client_id || '' },
  });
  return customer.id;
}

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

// ── GET / — lista de cobros del coach + KPIs ───────────────────────────────
router.get('/', async (req: any, res) => {
  try {
    // `stripeConnected` se calcula por adelantado: el listado NO necesita
    // Stripe (lee el espejo local), pero la UI lo usa para el empty-state.
    const { data: integ } = await supabaseAdmin
      .from('integrations')
      .select('stripe_secret_key')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const stripeConnected = !!integ?.stripe_secret_key;

    const { data: rows, error } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('manager_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;

    const list = rows || [];

    // El nombre del cliente vive en `profiles.full_name` (NO en `users`),
    // así que lo resolvemos en una segunda consulta y lo fusionamos. Esto
    // evita el embed PostgREST roto que devolvía 500.
    const clientIds = Array.from(new Set(list.map((r: any) => r.client_id).filter(Boolean)));
    const nameById: Record<string, { full_name?: string; email?: string }> = {};
    if (clientIds.length > 0) {
      const [{ data: profiles }, { data: users }] = await Promise.all([
        supabaseAdmin.from('profiles').select('user_id, full_name').in('user_id', clientIds),
        supabaseAdmin.from('users').select('id, email').in('id', clientIds),
      ]);
      for (const u of (users || [])) nameById[u.id] = { ...(nameById[u.id] || {}), email: u.email };
      for (const p of (profiles || [])) nameById[p.user_id] = { ...(nameById[p.user_id] || {}), full_name: p.full_name };
    }
    const withClient = list.map((r: any) => ({
      ...r,
      client: { id: r.client_id, full_name: nameById[r.client_id]?.full_name, email: nameById[r.client_id]?.email },
    }));

    // KPIs: MRR de clientes (suscripciones activas normalizadas a mensual),
    // nº activas, pendientes/impagadas.
    let mrrCents = 0;
    let activeCount = 0;
    let pendingCount = 0;
    for (const r of list) {
      if (r.kind === 'recurring' && (r.status === 'active' || r.status === 'trialing')) {
        activeCount++;
        const monthly = r.interval === 'year' ? Math.round(r.amount_cents / 12) : r.amount_cents;
        mrrCents += monthly;
      }
      if (r.status === 'pending' || r.status === 'past_due') pendingCount++;
    }

    res.json({
      items: withClient,
      kpis: {
        mrrCents,
        currency: list[0]?.currency || 'eur',
        activeSubscriptions: activeCount,
        pendingOrOverdue: pendingCount,
        total: list.length,
      },
      stripeConnected,
    });
  } catch (error: any) {
    console.error('Error listing client billing:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── POST / — crea un cobro (recurring | one_time | invoice) ────────────────
router.post('/', async (req: any, res) => {
  try {
    const {
      client_id, kind, amount, currency, interval, description, days_until_due,
      // Control extra: días de prueba, cantidad de unidades, intervalo
      // personalizado (cada N períodos) y códigos promocionales en el link.
      trial_days, quantity, interval_count, allow_promotion_codes,
    } = req.body;

    // Validaciones
    const validKinds = ['recurring', 'one_time', 'invoice'];
    if (!validKinds.includes(kind)) {
      return res.status(400).json({ error: 'kind must be recurring|one_time|invoice' });
    }
    const client = await getOwnedClient(req.user.id, client_id);
    if (!client) return res.status(403).json({ error: 'Client does not belong to this coach' });

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 1_000_000) {
      return res.status(400).json({ error: 'amount must be a positive number (in main currency units)' });
    }
    const amountCents = Math.round(amountNum * 100);
    const safeCurrency = (typeof currency === 'string' && /^[a-z]{3}$/i.test(currency)) ? currency.toLowerCase() : 'eur';
    const safeInterval = ['month', 'year', 'week', 'day'].includes(interval) ? interval : 'month';
    const safeDesc = typeof description === 'string' ? description.slice(0, 300) : null;
    // Control fino (todos con tope sano):
    const qtyNum = Number(quantity);
    const safeQty = Number.isFinite(qtyNum) && qtyNum >= 1 && qtyNum <= 999 ? Math.round(qtyNum) : 1;
    const trialNum = Number(trial_days);
    const safeTrialDays = Number.isFinite(trialNum) && trialNum > 0 && trialNum <= 365 ? Math.round(trialNum) : 0;
    const icNum = Number(interval_count);
    const safeIntervalCount = Number.isFinite(icNum) && icNum >= 1 && icNum <= 52 ? Math.round(icNum) : 1;
    const allowPromos = allow_promotion_codes === true;

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error, message: 'Conecta tu cuenta de Stripe en Ajustes → Integraciones para poder cobrar a tus clientes.' });
    const { stripe } = conn;

    const productName = safeDesc || `Coaching — ${client.full_name || client.email}`;

    let payment_url: string | null = null;
    let stripe_subscription_id: string | null = null;
    let stripe_payment_link_id: string | null = null;
    let stripe_invoice_id: string | null = null;
    let stripe_price_id: string | null = null;
    let stripe_product_id: string | null = null;
    let stripe_customer_id: string | null = null;
    let status = 'pending';
    let current_period_end: string | null = null;

    if (kind === 'recurring' || kind === 'one_time') {
      // Producto + precio + payment link (URL compartible por chat).
      const product = await stripe.products.create({ name: productName });
      stripe_product_id = product.id;
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amountCents,
        currency: safeCurrency,
        ...(kind === 'recurring'
          ? { recurring: { interval: safeInterval as any, interval_count: safeIntervalCount, ...(safeTrialDays > 0 ? { trial_period_days: safeTrialDays } : {}) } }
          : {}),
      });
      stripe_price_id = price.id;
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: safeQty }],
        metadata: { client_id: client.id, manager_id: req.user.id },
        allow_promotion_codes: allowPromos,
        after_completion: {
          type: 'redirect',
          redirect: { url: `${frontendUrl()}/?payment=success` },
        },
      });
      stripe_payment_link_id = link.id;
      payment_url = link.url;
    } else {
      // invoice: requiere customer. Creamos invoice item + invoice y finalize.
      stripe_customer_id = await ensureStripeCustomer(stripe, { client_id: client.id }, client);
      await stripe.invoiceItems.create({
        customer: stripe_customer_id,
        amount: amountCents,
        currency: safeCurrency,
        description: productName,
      });
      const dueDays = Number(days_until_due);
      const invoice = await stripe.invoices.create({
        customer: stripe_customer_id,
        collection_method: 'send_invoice',
        days_until_due: Number.isFinite(dueDays) && dueDays > 0 && dueDays <= 90 ? Math.round(dueDays) : 7,
        description: safeDesc || undefined,
        metadata: { client_id: client.id, manager_id: req.user.id },
      });
      const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
      stripe_invoice_id = finalized.id;
      payment_url = finalized.hosted_invoice_url || null;
      status = finalized.status === 'paid' ? 'paid' : 'pending';
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('client_billing')
      .insert({
        manager_id: req.user.id,
        client_id: client.id,
        kind,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_payment_link_id,
        stripe_invoice_id,
        stripe_price_id,
        stripe_product_id,
        payment_url,
        description: safeDesc,
        amount_cents: amountCents,
        currency: safeCurrency,
        interval: kind === 'recurring' ? safeInterval : null,
        status,
        current_period_end,
      })
      .select()
      .single();
    if (error) throw error;

    res.json(inserted);
  } catch (error: any) {
    console.error('Error creating client billing:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── PATCH /:id/price — cambia el importe de un cobro ───────────────────────
// recurring/one_time → crea un Price nuevo, regenera el payment link y, si ya
// hay una suscripción viva, le cambia el item (con prorrateo). Las facturas
// finalizadas no se pueden editar en Stripe: hay que anularla y crear otra.
router.patch('/:id/price', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });

    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('id', id)
      .eq('manager_id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'Billing record not found' });

    if (row.kind === 'invoice') {
      return res.status(400).json({ error: 'invoice_immutable', message: 'Una factura finalizada no se puede editar. Cancélala y crea un cobro nuevo.' });
    }
    if (['canceled', 'void'].includes(row.status)) {
      return res.status(400).json({ error: 'Cannot edit a canceled charge' });
    }

    const amountNum = Number(req.body?.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 1_000_000) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    const amountCents = Math.round(amountNum * 100);

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
    const { stripe } = conn;

    // Reutiliza el producto si existe; si no, crea uno.
    let productId = row.stripe_product_id;
    if (!productId) {
      const product = await stripe.products.create({ name: row.description || 'Coaching' });
      productId = product.id;
    }
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: amountCents,
      currency: row.currency || 'eur',
      ...(row.kind === 'recurring' ? { recurring: { interval: (row.interval || 'month') as any } } : {}),
    });

    const updates: any = { amount_cents: amountCents, stripe_price_id: newPrice.id, stripe_product_id: productId };

    // Si ya hay una suscripción activa, cámbiale el precio in-place (prorrateo).
    if (row.stripe_subscription_id) {
      const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id) as any;
      const itemId = sub?.items?.data?.[0]?.id;
      if (itemId) {
        await stripe.subscriptions.update(row.stripe_subscription_id, {
          items: [{ id: itemId, price: newPrice.id }],
          proration_behavior: 'create_prorations',
        });
      }
    } else if (row.stripe_payment_link_id) {
      // Desactiva el link antiguo y crea uno nuevo con el precio actualizado.
      try { await stripe.paymentLinks.update(row.stripe_payment_link_id, { active: false }); } catch { /* noop */ }
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: newPrice.id, quantity: 1 }],
        metadata: { client_id: row.client_id, manager_id: req.user.id },
        after_completion: { type: 'redirect', redirect: { url: `${frontendUrl()}/?payment=success` } },
      });
      updates.stripe_payment_link_id = link.id;
      updates.payment_url = link.url;
    }

    await supabaseAdmin.from('client_billing').update(updates).eq('id', id);
    const { data: fresh } = await supabaseAdmin.from('client_billing').select('*').eq('id', id).maybeSingle();
    res.json(fresh);
  } catch (error: any) {
    console.error('Error updating billing price:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── POST /:id/remind — envía un mensaje al cliente con el link de pago ─────
router.post('/:id/remind', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });

    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('id', id)
      .eq('manager_id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'Billing record not found' });
    if (!row.payment_url) return res.status(400).json({ error: 'This charge has no shareable payment link' });

    // Tarjeta de pago enriquecida (igual que la tarjeta de feedback/check-in):
    // se inserta en `messages` con attachment_type='payment' + payload con los
    // datos del cobro, y el render del chat muestra una tarjeta con botón
    // "Pagar ahora". `content` lleva la nota del coach (opcional).
    const custom = typeof req.body?.message === 'string' ? req.body.message.slice(0, 1000).trim() : '';
    const { error: msgErr } = await supabaseAdmin.from('messages').insert({
      sender_id: req.user.id,
      receiver_id: row.client_id,
      content: custom || null,
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
    if (msgErr) throw msgErr;

    await supabaseAdmin
      .from('client_billing')
      .update({ last_reminder_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── POST /:id/sync — refresca estado desde Stripe (best-effort) ────────────
router.post('/:id/sync', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('id', id)
      .eq('manager_id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'Billing record not found' });

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
    const { stripe } = conn;

    // En el SDK v20 (Basil) `current_period_end` se movió de la raíz de la
    // suscripción a `items.data[].current_period_end`. Como pineamos la
    // apiVersion a acacia (2024-12-18) el wire response aún lo trae en la
    // raíz, pero leemos AMBOS para no romper si la apiVersion sube.
    const subPeriodEnd = (sub: any): string | null => {
      const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
      return ts ? new Date(ts * 1000).toISOString() : null;
    };

    const updates: any = {};
    if (row.stripe_subscription_id) {
      const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id) as any;
      updates.status = sub.status;
      updates.current_period_end = subPeriodEnd(sub);
    } else if (row.stripe_invoice_id) {
      const inv = await stripe.invoices.retrieve(row.stripe_invoice_id);
      updates.status = inv.status === 'paid' ? 'paid' : inv.status === 'void' ? 'void' : inv.status === 'uncollectible' ? 'uncollectible' : 'pending';
    } else if (row.stripe_payment_link_id) {
      // Un payment link recurrente genera una suscripción al pagarse. Buscamos
      // la última suscripción/sesión asociada vía metadata para reflejar estado.
      const sessions = await stripe.checkout.sessions.list({ payment_link: row.stripe_payment_link_id, limit: 1 });
      const sess = sessions.data[0];
      if (sess?.subscription) {
        const subId = typeof sess.subscription === 'string' ? sess.subscription : sess.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId) as any;
        updates.stripe_subscription_id = subId;
        updates.status = sub.status;
        updates.current_period_end = subPeriodEnd(sub);
      } else if (sess?.payment_status === 'paid') {
        updates.status = 'paid';
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from('client_billing').update(updates).eq('id', id);
    }
    const { data: fresh } = await supabaseAdmin.from('client_billing').select('*').eq('id', id).maybeSingle();
    res.json(fresh);
  } catch (error: any) {
    console.error('Error syncing billing record:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── POST /:id/cancel — cancela suscripción / anula invoice ─────────────────
router.post('/:id/cancel', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { data: row } = await supabaseAdmin
      .from('client_billing')
      .select('*')
      .eq('id', id)
      .eq('manager_id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'Billing record not found' });

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
    const { stripe } = conn;

    try {
      if (row.stripe_subscription_id) {
        await stripe.subscriptions.cancel(row.stripe_subscription_id);
      } else if (row.stripe_invoice_id && row.status !== 'paid') {
        await stripe.invoices.voidInvoice(row.stripe_invoice_id);
      }
      if (row.stripe_payment_link_id) {
        // Desactiva el link para que no se pueda volver a usar.
        await stripe.paymentLinks.update(row.stripe_payment_link_id, { active: false });
      }
    } catch (stripeErr) {
      console.error('Stripe cancel partial failure:', stripeErr);
    }

    await supabaseAdmin
      .from('client_billing')
      .update({ status: row.stripe_invoice_id && row.status !== 'paid' ? 'void' : 'canceled' })
      .eq('id', id);

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Error cancelling billing record:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── GET /stripe/subscriptions — candidatos para importar ───────────────────
// Lista las suscripciones EXISTENTES en la cuenta Stripe del coach que aún no
// están espejadas en client_billing, con email/nombre del customer, importe e
// intervalo, para que el coach las importe y las asocie a un cliente.
router.get('/stripe/subscriptions', async (req: any, res) => {
  try {
    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error, message: 'Conecta tu cuenta de Stripe en Ajustes → Integraciones.' });
    const { stripe } = conn;

    // Suscripciones ya importadas (para excluirlas).
    const { data: existing } = await supabaseAdmin
      .from('client_billing')
      .select('stripe_subscription_id')
      .eq('manager_id', req.user.id)
      .not('stripe_subscription_id', 'is', null);
    const already = new Set((existing || []).map((r: any) => r.stripe_subscription_id));

    const subs = await stripe.subscriptions.list({ status: 'all', limit: 50, expand: ['data.customer'] });
    const candidates = subs.data
      .filter(s => !already.has(s.id))
      .map(s => {
        const item = (s as any).items?.data?.[0];
        const price = item?.price;
        const cust: any = s.customer;
        const periodEndTs = (s as any).current_period_end ?? item?.current_period_end;
        return {
          stripe_subscription_id: s.id,
          status: s.status,
          customer_email: typeof cust === 'object' ? (cust?.email || null) : null,
          customer_name: typeof cust === 'object' ? (cust?.name || null) : null,
          stripe_customer_id: typeof cust === 'object' ? cust?.id : cust,
          amount_cents: price?.unit_amount ?? 0,
          currency: price?.currency || 'eur',
          interval: price?.recurring?.interval || 'month',
          interval_count: price?.recurring?.interval_count || 1,
          stripe_price_id: price?.id || null,
          stripe_product_id: typeof price?.product === 'string' ? price?.product : (price?.product?.id || null),
          current_period_end: periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null,
          description: (typeof price?.product === 'object' ? price?.product?.name : null) || null,
        };
      });

    res.json({ candidates });
  } catch (error: any) {
    console.error('Error listing Stripe subscriptions:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── POST /import — importa una suscripción existente y la asocia a un cliente ─
router.post('/import', async (req: any, res) => {
  try {
    const { client_id, stripe_subscription_id } = req.body;
    if (typeof stripe_subscription_id !== 'string' || !stripe_subscription_id.startsWith('sub_')) {
      return res.status(400).json({ error: 'Invalid stripe_subscription_id' });
    }
    const client = await getOwnedClient(req.user.id, client_id);
    if (!client) return res.status(403).json({ error: 'Client does not belong to this coach' });

    // Evita duplicados.
    const { data: dup } = await supabaseAdmin
      .from('client_billing')
      .select('id')
      .eq('manager_id', req.user.id)
      .eq('stripe_subscription_id', stripe_subscription_id)
      .maybeSingle();
    if (dup) return res.status(409).json({ error: 'already_imported', message: 'Esta suscripción ya está importada.' });

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
    const { stripe } = conn;

    const sub = await stripe.subscriptions.retrieve(stripe_subscription_id, { expand: ['items.data.price.product', 'customer'] }) as any;
    const item = sub.items?.data?.[0];
    const price = item?.price;
    const periodEndTs = sub.current_period_end ?? item?.current_period_end;
    const cust: any = sub.customer;

    const { data: inserted, error } = await supabaseAdmin
      .from('client_billing')
      .insert({
        manager_id: req.user.id,
        client_id: client.id,
        kind: 'recurring',
        stripe_customer_id: typeof cust === 'object' ? cust?.id : cust,
        stripe_subscription_id: sub.id,
        stripe_price_id: price?.id || null,
        stripe_product_id: typeof price?.product === 'string' ? price?.product : (price?.product?.id || null),
        description: (typeof price?.product === 'object' ? price?.product?.name : null) || null,
        amount_cents: price?.unit_amount ?? 0,
        currency: price?.currency || 'eur',
        interval: price?.recurring?.interval || 'month',
        status: sub.status,
        current_period_end: periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null,
      })
      .select()
      .single();
    if (error) throw error;

    res.json(inserted);
  } catch (error: any) {
    console.error('Error importing subscription:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

export default router;
