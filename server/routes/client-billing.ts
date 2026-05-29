// Cobros coach→cliente. El coach cobra a SUS clientes con SU PROPIA cuenta
// Stripe (la secret key guardada en `integrations.stripe_secret_key`). Este
// router crea los objetos en esa cuenta (payment links / invoices), guarda un
// espejo local en `client_billing` para listarlos y enviar recordatorios por
// chat, y refresca el estado on-read (no dependemos de webhooks por-coach).
import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';
import { newStripeClient } from '../lib/stripe.js';
import { safeErr } from '../lib/http.js';
import { sendPushToUser } from '../lib/push.js';
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
// OJO: `full_name` vive en `profiles`, NO en `users`. Seleccionarlo de `users`
// hacía fallar la query (columna inexistente) → devolvía null → "Client does
// not belong to this coach" para CUALQUIER cliente. Pedimos solo columnas
// válidas de `users` y resolvemos el nombre aparte.
async function getOwnedClient(managerId: string, clientId: string) {
  if (!UUID_RE.test(String(clientId))) return null;
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, manager_id')
    .eq('id', clientId)
    .eq('manager_id', managerId)
    .maybeSingle();
  if (!data) return null;
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('user_id', clientId)
    .maybeSingle();
  return { ...data, full_name: prof?.full_name || null };
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

// Estados que cuentan como "pagado/activo" para detectar la transición de
// un cobro pendiente a cobrado y avisar al coach.
const PAID_STATES = new Set(['active', 'trialing', 'paid']);
export const isPaid = (s?: string | null) => !!s && PAID_STATES.has(s);

// Notifica al coach (push, best-effort) que un cliente ha pagado. Resuelve el
// nombre del cliente para un mensaje legible. Nunca lanza.
export async function notifyManagerOfPayment(managerId: string, clientId: string, row: any) {
  try {
    const [{ data: prof }, { data: usr }] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name').eq('user_id', clientId).maybeSingle(),
      supabaseAdmin.from('users').select('email').eq('id', clientId).maybeSingle(),
    ]);
    const name = prof?.full_name || usr?.email || 'Un cliente';
    const amount = typeof row?.amount_cents === 'number'
      ? (row.amount_cents / 100).toLocaleString('es-ES', { style: 'currency', currency: (row.currency || 'eur').toUpperCase() })
      : '';
    await sendPushToUser(managerId, {
      title: '💳 Pago recibido',
      body: `${name} ha pagado${amount ? ` ${amount}` : ''}.`,
      url: '/?view=client-billing',
      prefKey: 'payments_push',
    });
  } catch (e) {
    console.error('notifyManagerOfPayment failed (non-fatal):', e);
  }
}

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

    // KPIs ampliados para un panel operativo (no sólo MRR):
    //  - MRR / ARR de clientes (suscripciones activas normalizadas a mes/año)
    //  - nº activas, pendientes/impagas + importe impago
    //  - clientes facturados (distintos), desglose por tipo de cobro
    //  - próximas renovaciones (14 días) como lista accionable
    let mrrCents = 0;
    let activeCount = 0;
    let pendingCount = 0;
    let overdueAmountCents = 0;
    const byKind = { recurring: 0, one_time: 0, invoice: 0 } as Record<string, number>;
    const billedClients = new Set<string>();
    const now = Date.now();
    const horizon = now + 14 * 86400000;
    const upcoming: any[] = [];

    for (const r of withClient) {
      byKind[r.kind] = (byKind[r.kind] || 0) + 1;
      const isLive = r.status === 'active' || r.status === 'trialing';
      if (isLive) billedClients.add(r.client_id);
      if (r.kind === 'recurring' && isLive) {
        activeCount++;
        const monthly = r.interval === 'year' ? Math.round(r.amount_cents / 12) : r.amount_cents;
        mrrCents += monthly;
      }
      if (r.status === 'pending' || r.status === 'past_due') {
        pendingCount++;
        overdueAmountCents += r.amount_cents || 0;
      }
      // Renovaciones próximas: recurrentes vivas con fin de periodo en ≤14 días.
      if (r.kind === 'recurring' && isLive && r.current_period_end) {
        const t = new Date(r.current_period_end).getTime();
        if (Number.isFinite(t) && t >= now && t <= horizon) {
          upcoming.push({
            id: r.id, client: r.client, amount_cents: r.amount_cents, currency: r.currency,
            interval: r.interval, current_period_end: r.current_period_end, payment_url: r.payment_url,
          });
        }
      }
    }
    upcoming.sort((a, b) => new Date(a.current_period_end).getTime() - new Date(b.current_period_end).getTime());

    res.json({
      items: withClient,
      kpis: {
        mrrCents,
        arrCents: mrrCents * 12,
        currency: list[0]?.currency || 'eur',
        activeSubscriptions: activeCount,
        pendingOrOverdue: pendingCount,
        overdueAmountCents,
        clientsBilled: billedClients.size,
        byKind,
        total: list.length,
      },
      upcomingRenewals: upcoming,
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
        // Guardamos el TOTAL que cobra Stripe (unitario × cantidad) para que
        // KPIs/MRR, la tarjeta del chat y la vista del cliente muestren el
        // importe real. Las facturas no aplican cantidad → total = unitario.
        amount_cents: (kind === 'recurring' || kind === 'one_time') ? amountCents * safeQty : amountCents,
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
      content: custom || '', // `messages.content` es NOT NULL → nunca null
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
    // Transición pendiente → pagado/activo: avisa al coach.
    if (updates.status && isPaid(updates.status) && !isPaid(row.status)) {
      await notifyManagerOfPayment(req.user.id, row.client_id, { ...row, ...updates });
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

    // Si es un link recurrente que YA generó una suscripción pero aún no se
    // ha sincronizado el id, lo resolvemos vía checkout sessions y lo
    // cancelamos — de lo contrario seguiría cobrando tras "cancelar".
    let subscriptionId: string | null = row.stripe_subscription_id || null;
    if (!subscriptionId && row.kind === 'recurring' && row.stripe_payment_link_id) {
      try {
        const sessions = await stripe.checkout.sessions.list({ payment_link: row.stripe_payment_link_id, limit: 1 });
        const sess = sessions.data[0];
        if (sess?.subscription) subscriptionId = typeof sess.subscription === 'string' ? sess.subscription : sess.subscription.id;
      } catch (lookupErr) {
        console.error('Stripe subscription lookup before cancel failed:', lookupErr);
      }
    }

    // Cancelar la suscripción es la operación con impacto monetario: si falla,
    // NO marcamos el cobro como cancelado (la BD mentiría y el cliente
    // seguiría pagando). El void de factura y la desactivación del link son
    // best-effort y no bloquean.
    let subscriptionCancelFailed = false;
    if (subscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionId);
      } catch (subErr) {
        subscriptionCancelFailed = true;
        console.error('Stripe subscription cancel FAILED:', subErr);
      }
    }
    try {
      if (!subscriptionId && row.stripe_invoice_id && row.status !== 'paid') {
        await stripe.invoices.voidInvoice(row.stripe_invoice_id);
      }
      if (row.stripe_payment_link_id) {
        await stripe.paymentLinks.update(row.stripe_payment_link_id, { active: false });
      }
    } catch (bestEffortErr) {
      console.error('Stripe cancel best-effort failure (link/invoice):', bestEffortErr);
    }

    if (subscriptionCancelFailed) {
      return res.status(502).json({ error: 'stripe_cancel_failed', message: 'No se pudo cancelar la suscripción en Stripe. Inténtalo de nuevo o revísalo en tu panel de Stripe.' });
    }

    await supabaseAdmin
      .from('client_billing')
      .update({ status: row.stripe_invoice_id && row.status !== 'paid' && !subscriptionId ? 'void' : 'canceled' })
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

    // La suscripción debe existir en la cuenta del coach; si no, devolvemos un
    // 404 claro en vez de un 500 críptico.
    let sub: any;
    try {
      sub = await stripe.subscriptions.retrieve(stripe_subscription_id, { expand: ['items.data.price.product', 'customer'] }) as any;
    } catch {
      return res.status(404).json({ error: 'subscription_not_found', message: 'No se encontró esa suscripción en tu cuenta de Stripe.' });
    }
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

// ════════════════════════════════════════════════════════════════════════
// PLANES — catálogo reutilizable (Product + Price + Payment Link en Stripe)
// El coach crea un plan UNA vez y lo asigna a muchos clientes. La asignación
// es una fila en client_billing con plan_id; el link de pago se comparte.
// ════════════════════════════════════════════════════════════════════════

// Crea Product + Price + Payment Link reutilizable para un plan en la cuenta
// del coach. Devuelve los ids + la url del link.
async function createStripePlanObjects(stripe: Stripe, p: {
  name: string; description?: string | null; kind: 'recurring' | 'one_time';
  amountCents: number; currency: string; interval?: string; intervalCount?: number;
  trialDays?: number; allowPromos?: boolean; managerId: string;
}) {
  const product = await stripe.products.create({ name: p.name, description: p.description || undefined });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: p.amountCents,
    currency: p.currency,
    ...(p.kind === 'recurring'
      ? { recurring: { interval: (p.interval || 'month') as any, interval_count: p.intervalCount || 1, ...(p.trialDays && p.trialDays > 0 ? { trial_period_days: p.trialDays } : {}) } }
      : {}),
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: !!p.allowPromos,
    metadata: { manager_id: p.managerId, plan: '1' },
    after_completion: { type: 'redirect', redirect: { url: `${frontendUrl()}/?payment=success` } },
  });
  return { productId: product.id, priceId: price.id, linkId: link.id, url: link.url };
}

// Crea la asignación de un plan a un cliente (fila client_billing) y, si se
// pide, envía la tarjeta de pago al chat. Reutiliza el link del plan.
async function assignPlanRow(managerId: string, plan: any, clientId: string, sendToChat: boolean) {
  const { data: inserted } = await supabaseAdmin
    .from('client_billing')
    .insert({
      manager_id: managerId,
      client_id: clientId,
      plan_id: plan.id,
      kind: plan.kind,
      stripe_payment_link_id: plan.stripe_payment_link_id,
      stripe_price_id: plan.stripe_price_id,
      stripe_product_id: plan.stripe_product_id,
      payment_url: plan.payment_url,
      description: plan.name,
      amount_cents: plan.amount_cents,
      currency: plan.currency,
      interval: plan.kind === 'recurring' ? plan.interval : null,
      status: 'pending',
    })
    .select()
    .single();
  if (sendToChat && plan.payment_url) {
    await supabaseAdmin.from('messages').insert({
      sender_id: managerId,
      receiver_id: clientId,
      content: '', // `messages.content` es NOT NULL → nunca null
      attachment_type: 'payment',
      attachment_url: plan.payment_url,
      payload: {
        billing_id: inserted?.id, plan_id: plan.id, kind: plan.kind,
        amount_cents: plan.amount_cents, currency: plan.currency,
        interval: plan.interval, description: plan.name, status: 'pending',
      },
    });
  }
  return inserted;
}

// GET /plans — catálogo + nº de suscriptores por plan.
router.get('/plans', async (req: any, res) => {
  try {
    const { data: plans } = await supabaseAdmin
      .from('billing_plans')
      .select('*')
      .eq('manager_id', req.user.id)
      .order('created_at', { ascending: false });
    const ids = (plans || []).map((p: any) => p.id);
    const counts: Record<string, { total: number; active: number }> = {};
    if (ids.length > 0) {
      const { data: cb } = await supabaseAdmin
        .from('client_billing')
        .select('plan_id, status')
        .eq('manager_id', req.user.id)
        .in('plan_id', ids);
      for (const r of (cb || [])) {
        if (!r.plan_id) continue;
        counts[r.plan_id] = counts[r.plan_id] || { total: 0, active: 0 };
        counts[r.plan_id].total++;
        if (r.status === 'active' || r.status === 'trialing') counts[r.plan_id].active++;
      }
    }
    res.json({ plans: (plans || []).map((p: any) => ({ ...p, subscribers: counts[p.id] || { total: 0, active: 0 } })) });
  } catch (error: any) {
    console.error('Error listing plans:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST /plans — crea un plan (objetos Stripe) + opcionalmente pre-asigna a clientes.
router.post('/plans', async (req: any, res) => {
  try {
    const { name, description, kind, amount, currency, interval, interval_count, trial_days, allow_promotion_codes, assign_client_ids } = req.body;
    if (kind !== 'recurring' && kind !== 'one_time') return res.status(400).json({ error: 'kind must be recurring|one_time' });
    const safeName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 120) : null;
    if (!safeName) return res.status(400).json({ error: 'name is required' });
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 1_000_000) return res.status(400).json({ error: 'invalid amount' });
    const amountCents = Math.round(amountNum * 100);
    const safeCurrency = (typeof currency === 'string' && /^[a-z]{3}$/i.test(currency)) ? currency.toLowerCase() : 'eur';
    const safeInterval = ['day', 'week', 'month', 'year'].includes(interval) ? interval : 'month';
    const ic = Number(interval_count); const safeIntervalCount = Number.isFinite(ic) && ic >= 1 && ic <= 52 ? Math.round(ic) : 1;
    const td = Number(trial_days); const safeTrial = Number.isFinite(td) && td > 0 && td <= 365 ? Math.round(td) : 0;
    const safeDesc = typeof description === 'string' ? description.slice(0, 500) : null;

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error, message: 'Conecta tu cuenta de Stripe en Ajustes → Integraciones.' });
    const { stripe } = conn;

    const obj = await createStripePlanObjects(stripe, {
      name: safeName, description: safeDesc, kind, amountCents, currency: safeCurrency,
      interval: safeInterval, intervalCount: safeIntervalCount, trialDays: safeTrial,
      allowPromos: allow_promotion_codes === true, managerId: req.user.id,
    });

    const { data: plan, error } = await supabaseAdmin
      .from('billing_plans')
      .insert({
        manager_id: req.user.id, name: safeName, description: safeDesc, kind,
        amount_cents: amountCents, currency: safeCurrency,
        interval: kind === 'recurring' ? safeInterval : null,
        interval_count: safeIntervalCount, trial_days: safeTrial,
        allow_promotion_codes: allow_promotion_codes === true,
        stripe_product_id: obj.productId, stripe_price_id: obj.priceId,
        stripe_payment_link_id: obj.linkId, payment_url: obj.url, active: true,
      })
      .select()
      .single();
    if (error) throw error;

    // Pre-asignación opcional a clientes (sólo los que pertenecen al coach).
    let assigned = 0;
    if (Array.isArray(assign_client_ids) && assign_client_ids.length > 0) {
      for (const cid of assign_client_ids.slice(0, 200)) {
        const client = await getOwnedClient(req.user.id, cid);
        if (client) { await assignPlanRow(req.user.id, plan, client.id, true); assigned++; }
      }
    }

    res.json({ plan, assigned });
  } catch (error: any) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// PATCH /plans/:id — edita nombre/descripcion/activo. Si cambia el importe,
// crea un Price + Payment Link nuevos y desactiva el link antiguo (Stripe no
// permite editar un precio existente).
router.patch('/plans/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { data: plan } = await supabaseAdmin.from('billing_plans').select('*').eq('id', id).eq('manager_id', req.user.id).maybeSingle();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const updates: any = {};
    if (typeof req.body.name === 'string' && req.body.name.trim()) updates.name = req.body.name.trim().slice(0, 120);
    if (typeof req.body.description === 'string') updates.description = req.body.description.slice(0, 500);
    if (typeof req.body.active === 'boolean') updates.active = req.body.active;

    const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : null;
    if (newAmount !== null && Number.isFinite(newAmount) && newAmount > 0 && Math.round(newAmount * 100) !== plan.amount_cents) {
      const conn = await getCoachStripe(req.user.id);
      if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
      const { stripe } = conn;
      const amountCents = Math.round(newAmount * 100);
      const price = await stripe.prices.create({
        product: plan.stripe_product_id,
        unit_amount: amountCents,
        currency: plan.currency,
        ...(plan.kind === 'recurring' ? { recurring: { interval: (plan.interval || 'month') as any, interval_count: plan.interval_count || 1 } } : {}),
      });
      try { if (plan.stripe_payment_link_id) await stripe.paymentLinks.update(plan.stripe_payment_link_id, { active: false }); } catch { /* noop */ }
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        allow_promotion_codes: !!plan.allow_promotion_codes,
        metadata: { manager_id: req.user.id, plan: '1' },
        after_completion: { type: 'redirect', redirect: { url: `${frontendUrl()}/?payment=success` } },
      });
      updates.amount_cents = amountCents;
      updates.stripe_price_id = price.id;
      updates.stripe_payment_link_id = link.id;
      updates.payment_url = link.url;
    }

    if (Object.keys(updates).length > 0) await supabaseAdmin.from('billing_plans').update(updates).eq('id', id);
    const { data: fresh } = await supabaseAdmin.from('billing_plans').select('*').eq('id', id).maybeSingle();
    res.json(fresh);
  } catch (error: any) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST /plans/:id/archive — archiva el plan (no borra asignaciones existentes).
router.post('/plans/:id/archive', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { data: plan } = await supabaseAdmin.from('billing_plans').select('*').eq('id', id).eq('manager_id', req.user.id).maybeSingle();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const conn = await getCoachStripe(req.user.id);
    if (!('error' in conn)) {
      const { stripe } = conn;
      try { if (plan.stripe_payment_link_id) await stripe.paymentLinks.update(plan.stripe_payment_link_id, { active: false }); } catch { /* noop */ }
      try { if (plan.stripe_product_id) await stripe.products.update(plan.stripe_product_id, { active: false }); } catch { /* noop */ }
    }
    await supabaseAdmin.from('billing_plans').update({ active: false }).eq('id', id);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Error archiving plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST /plans/:id/assign — asigna el plan a uno o varios clientes.
router.post('/plans/:id/assign', async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { data: plan } = await supabaseAdmin.from('billing_plans').select('*').eq('id', id).eq('manager_id', req.user.id).maybeSingle();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    if (!plan.active) return res.status(400).json({ error: 'plan_archived', message: 'Este plan está archivado.' });

    const ids: string[] = Array.isArray(req.body.client_ids) ? req.body.client_ids : [];
    const sendToChat = req.body.send_to_chat !== false;
    if (ids.length === 0) return res.status(400).json({ error: 'client_ids required' });

    let assigned = 0; const skipped: string[] = [];
    for (const cid of ids.slice(0, 200)) {
      const client = await getOwnedClient(req.user.id, cid);
      if (!client) { skipped.push(cid); continue; }
      // Evita duplicar una asignación viva del mismo plan al mismo cliente.
      const { data: dup } = await supabaseAdmin
        .from('client_billing')
        .select('id')
        .eq('manager_id', req.user.id).eq('client_id', cid).eq('plan_id', id)
        .not('status', 'in', '("canceled","void")')
        .maybeSingle();
      if (dup) { skipped.push(cid); continue; }
      await assignPlanRow(req.user.id, plan, cid, sendToChat);
      assigned++;
    }
    res.json({ assigned, skipped });
  } catch (error: any) {
    console.error('Error assigning plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// GET /plans/stripe/importable — products con precio en la cuenta del coach
// que aún no están importados como plan.
router.get('/plans/stripe/importable', async (req: any, res) => {
  try {
    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error, message: 'Conecta tu cuenta de Stripe en Ajustes → Integraciones.' });
    const { stripe } = conn;
    const { data: existing } = await supabaseAdmin.from('billing_plans').select('stripe_price_id').eq('manager_id', req.user.id).not('stripe_price_id', 'is', null);
    const already = new Set((existing || []).map((r: any) => r.stripe_price_id));
    const prices = await stripe.prices.list({ active: true, limit: 100, expand: ['data.product'] });
    const candidates = prices.data
      .filter(pr => !already.has(pr.id) && pr.unit_amount != null && (pr.product as any)?.active !== false)
      .map(pr => ({
        stripe_price_id: pr.id,
        stripe_product_id: typeof pr.product === 'string' ? pr.product : (pr.product as any)?.id,
        name: (typeof pr.product === 'object' ? (pr.product as any)?.name : null) || 'Plan',
        description: (typeof pr.product === 'object' ? (pr.product as any)?.description : null) || null,
        amount_cents: pr.unit_amount,
        currency: pr.currency,
        kind: pr.recurring ? 'recurring' : 'one_time',
        interval: pr.recurring?.interval || null,
        interval_count: pr.recurring?.interval_count || 1,
      }));
    res.json({ candidates });
  } catch (error: any) {
    console.error('Error listing importable prices:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST /plans/import — importa un Price de Stripe como plan (creando un payment
// link reutilizable si el producto no tiene uno aún).
router.post('/plans/import', async (req: any, res) => {
  try {
    const { stripe_price_id } = req.body;
    if (typeof stripe_price_id !== 'string' || !stripe_price_id.startsWith('price_')) return res.status(400).json({ error: 'Invalid stripe_price_id' });
    const { data: dup } = await supabaseAdmin.from('billing_plans').select('id').eq('manager_id', req.user.id).eq('stripe_price_id', stripe_price_id).maybeSingle();
    if (dup) return res.status(409).json({ error: 'already_imported' });

    const conn = await getCoachStripe(req.user.id);
    if ('error' in conn) return res.status(conn.code).json({ error: conn.error });
    const { stripe } = conn;

    const price = await stripe.prices.retrieve(stripe_price_id, { expand: ['product'] }) as any;
    if (price.unit_amount == null) return res.status(400).json({ error: 'price_without_amount', message: 'Ese precio no tiene importe fijo.' });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { manager_id: req.user.id, plan: '1' },
      after_completion: { type: 'redirect', redirect: { url: `${frontendUrl()}/?payment=success` } },
    });
    const { data: plan, error } = await supabaseAdmin
      .from('billing_plans')
      .insert({
        manager_id: req.user.id,
        name: (typeof price.product === 'object' ? price.product?.name : null) || 'Plan importado',
        description: (typeof price.product === 'object' ? price.product?.description : null) || null,
        kind: price.recurring ? 'recurring' : 'one_time',
        amount_cents: price.unit_amount,
        currency: price.currency || 'eur',
        interval: price.recurring?.interval || null,
        interval_count: price.recurring?.interval_count || 1,
        stripe_product_id: typeof price.product === 'string' ? price.product : price.product?.id,
        stripe_price_id: price.id,
        stripe_payment_link_id: link.id,
        payment_url: link.url,
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    res.json(plan);
  } catch (error: any) {
    console.error('Error importing plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ── Barrido automático (cron) ──────────────────────────────────────────────
// Como no hay webhooks por-coach, el cron diario sincroniza los cobros que
// siguen pendientes/impagos contra Stripe y avisa al coach de los que se han
// pagado desde la última pasada. Best-effort: agrupa por manager para leer su
// clave Stripe una sola vez. Devuelve el nº de pagos detectados.
export async function runBillingSyncSweep(): Promise<{ checked: number; paid: number }> {
  let checked = 0;
  let paid = 0;
  try {
    const { data: rows } = await supabaseAdmin
      .from('client_billing')
      .select('id, manager_id, client_id, status, stripe_subscription_id, stripe_invoice_id, stripe_payment_link_id, amount_cents, currency')
      .in('status', ['pending', 'past_due'])
      .or('stripe_subscription_id.not.is.null,stripe_invoice_id.not.is.null,stripe_payment_link_id.not.is.null')
      // Tope conservador: las llamadas a Stripe son secuenciales (timeout 8s
      // c/u); 100 filas mantiene el barrido dentro del presupuesto del cron.
      // Las filas no procesadas hoy se recogerán en la siguiente pasada.
      .order('current_period_end', { ascending: true, nullsFirst: true })
      .limit(100);
    if (!rows || rows.length === 0) return { checked: 0, paid: 0 };

    // Clave Stripe por manager (cacheada).
    const keyByManager: Record<string, string | null> = {};
    const getKey = async (managerId: string): Promise<string | null> => {
      if (managerId in keyByManager) return keyByManager[managerId];
      const { data } = await supabaseAdmin.from('integrations').select('stripe_secret_key').eq('user_id', managerId).maybeSingle();
      keyByManager[managerId] = data?.stripe_secret_key || null;
      return keyByManager[managerId];
    };

    for (const row of rows) {
      const key = await getKey(row.manager_id);
      if (!key) continue;
      const stripe = newStripeClient(key);
      checked++;
      try {
        let newStatus: string | null = null;
        let subId: string | null = null;
        let periodEnd: string | null = null;
        if (row.stripe_subscription_id) {
          const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id) as any;
          newStatus = sub.status;
          periodEnd = (sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end)
            ? new Date((sub.current_period_end ?? sub.items.data[0].current_period_end) * 1000).toISOString() : null;
        } else if (row.stripe_invoice_id) {
          const inv = await stripe.invoices.retrieve(row.stripe_invoice_id);
          newStatus = inv.status === 'paid' ? 'paid' : inv.status === 'void' ? 'void' : inv.status === 'uncollectible' ? 'uncollectible' : 'pending';
        } else if (row.stripe_payment_link_id) {
          const sessions = await stripe.checkout.sessions.list({ payment_link: row.stripe_payment_link_id, limit: 1 });
          const sess = sessions.data[0];
          if (sess?.subscription) {
            subId = typeof sess.subscription === 'string' ? sess.subscription : sess.subscription.id;
            const sub = await stripe.subscriptions.retrieve(subId) as any;
            newStatus = sub.status;
            periodEnd = (sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end)
              ? new Date((sub.current_period_end ?? sub.items.data[0].current_period_end) * 1000).toISOString() : null;
          } else if (sess?.payment_status === 'paid') {
            newStatus = 'paid';
          }
        }
        if (newStatus && newStatus !== row.status) {
          const updates: any = { status: newStatus };
          if (subId) updates.stripe_subscription_id = subId;
          if (periodEnd) updates.current_period_end = periodEnd;
          await supabaseAdmin.from('client_billing').update(updates).eq('id', row.id);
          if (isPaid(newStatus) && !isPaid(row.status)) {
            paid++;
            await notifyManagerOfPayment(row.manager_id, row.client_id, { ...row, ...updates });
          }
        }
      } catch (perRow) {
        console.error(`[billing sweep] sync failed for ${row.id}:`, perRow);
      }
    }
  } catch (e) {
    console.error('[billing sweep] failed:', e);
  }
  return { checked, paid };
}

export default router;
