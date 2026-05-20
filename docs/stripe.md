# Stripe en Nutrition_1

Cómo se integra Stripe (suscripciones SaaS, webhooks, planes) y cómo testearlo.

---

## Arquitectura

```
Frontend (BillingSettings.tsx)
   │
   │ 1. POST /api/stripe/create-checkout-session
   ▼
Backend (server/routes/stripe.ts)
   │
   │ 2. Crea Checkout Session via Stripe SDK
   ▼
Stripe Checkout (hosted page)
   │
   │ 3. Cliente paga
   ▼
Stripe → webhook → POST /api/stripe/webhook
   │
   │ 4. Firma verificada, idempotency check, upsert en BD
   ▼
Supabase: manager_subscriptions
```

---

## Endpoints

| Método | Ruta | Auth | Para qué |
|---|---|---|---|
| `POST` | `/api/stripe/create-checkout-session` | `verifyManager` | Crea la sesión de checkout y devuelve la URL hosted de Stripe. |
| `POST` | `/api/stripe/create-portal-session` | `verifyManager` | Abre el Customer Portal (cambiar método de pago, cancelar). |
| `POST` | `/api/stripe/webhook` | firma Stripe | Recibe eventos de Stripe y persiste el estado de la suscripción. |

---

## Eventos procesados

El handler en `server/routes/stripe.ts` escucha dos tipos:

| Evento | Acción |
|---|---|
| `checkout.session.completed` | Upsert en `manager_subscriptions` con `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `plan_tier`, `status`, `current_period_end`. |
| `customer.subscription.updated` / `customer.subscription.deleted` | Update del mismo registro: `status` y `current_period_end`. |

Cualquier otro evento se ignora (responde `200` igualmente para que Stripe no reintente).

---

## Tabla `manager_subscriptions`

```
user_id                  uuid    FK users.id
stripe_customer_id       text
stripe_subscription_id   text    unique
plan_tier                text    professional | scale | unlimited
status                   text    active | past_due | canceled | unpaid | …
current_period_end       timestamptz
updated_at               timestamptz
```

RLS activado, 1 policy. El backend escribe con service role.

---

## Mapeo Price ID → Plan Tier

Hardcodeado en `getPlanTier()` (líneas 172-186 de `server/routes/stripe.ts`):

| Price ID | Plan | Cadencia |
|---|---|---|
| `price_1TCN9vCR4WvolxlpwC33dk8J` | Professional | Mensual |
| `price_1TCNAHCR4WvolxlpwpLRfmwX` | Scale | Mensual |
| `price_1TCNAcCR4WvolxlptLzNYdsz` | Unlimited | Mensual |
| `price_1TCf4PCR4Wvolxlp3MoDzi0J` | Professional | Anual (-20%) |
| `price_1TCf52CR4WvolxlpcMMLOVpv` | Scale | Anual (-20%) |
| `price_1TCf5cCR4WvolxlpWGhpOgnI` | Unlimited | Anual (-20%) |

Si se añade un nuevo precio en Stripe, hay que añadirlo aquí también.

---

## Idempotency

Tabla `stripe_processed_events (event_id PK, processed_at)` (migración `20260504_stripe_idempotency.sql`).

Flujo del webhook:

1. `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` → verifica firma.
2. SELECT en `stripe_processed_events` por `event.id` → si existe, responde `{received:true, duplicate:true}` y aborta.
3. Procesa el evento (switch por `event.type`).
4. INSERT en `stripe_processed_events` **solo si** el procesamiento fue exitoso.
5. Si falla → 500 → Stripe reintenta (hasta 3 días por defecto).

Esto blinda contra:
- Reintentos manuales desde el dashboard de Stripe.
- Reentregas automáticas si Stripe no recibe el 200 a tiempo.
- Procesamiento concurrente del mismo evento.

Limpieza: la migración sugiere `DELETE FROM stripe_processed_events WHERE processed_at < now() - interval '7 days'` periódicamente. Aún no automatizado.

---

## Variables de entorno

```env
STRIPE_SECRET_KEY=sk_test_...        # secret API key (test en local, live en prod)
STRIPE_WEBHOOK_SECRET=whsec_...      # signing secret del endpoint del webhook
```

Si `STRIPE_SECRET_KEY` no está, el router responde `503` y loguea un warning al arrancar.

---

## Sandbox vs Producción

| | Sandbox (test mode) | Producción (live mode) |
|---|---|---|
| Secret key prefix | `sk_test_…` | `sk_live_…` |
| Webhook secret | El de tu endpoint `…/api/stripe/webhook` en modo test | El del mismo endpoint en modo live |
| Price IDs | Otros distintos (test mode tiene su propio catálogo) | Los hardcodeados en `getPlanTier()` |
| Tarjetas de prueba | `4242 4242 4242 4242` (any CVC, any future date) | Solo tarjetas reales |
| Dashboard URL | `dashboard.stripe.com/test/...` | `dashboard.stripe.com/...` |

**Importante:** los Price IDs hardcodeados son los de live mode. En local con `sk_test_*`, el flujo de checkout funciona pero el upsert puede asignar el tier por defecto (`professional`) porque los Price IDs reales no coinciden con los test. Para testing fiel en local, mantener una tabla paralela de price IDs test o usar metadata en la session.

---

## Cómo testear el webhook en local

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe   # o equivalente Windows/Linux
stripe login

# 2. Forward del webhook a tu backend local
stripe listen --forward-to localhost:3006/api/stripe/webhook
# → imprime un signing secret temporal whsec_xxx
# Pegarlo en .env como STRIPE_WEBHOOK_SECRET y reiniciar el backend.

# 3. Disparar un evento de prueba
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

Comprobar en Supabase:

```sql
SELECT * FROM stripe_processed_events ORDER BY processed_at DESC LIMIT 5;
SELECT * FROM manager_subscriptions    ORDER BY updated_at DESC LIMIT 5;
```

---

## Reintento manual desde el dashboard

Stripe → Developers → Webhooks → tu endpoint → click en un evento pasado → "Resend".
Resultado esperado: el segundo intento devuelve `200 {received:true, duplicate:true}` y NO duplica filas en `manager_subscriptions`. Verificable contando filas antes y después.

---

## Frontend

`src/views/Settings.tsx → BillingSettings` muestra el plan actual y los botones para:
- Subscribirse (`POST /api/stripe/create-checkout-session` + redirect a la URL devuelta).
- Abrir el portal (`POST /api/stripe/create-portal-session`).

El plan y el `status` se leen del backend desde `manager_subscriptions` cuando el componente monta.

---

## Logs estructurados

Eventos emitidos por `server/lib/logger.ts`:

| Event | Cuándo |
|---|---|
| `stripe.webhook.signature_failed` | `constructEvent` rechazó la firma. |
| `stripe.webhook.received` | Firma verificada. Incluye `eventId` y `type`. |
| `stripe.webhook.duplicate` | Idempotency check encontró el `event_id`. |
| `stripe.webhook.processed` | Procesamiento OK + INSERT en `stripe_processed_events`. |
| `stripe.webhook.handler_failed` | Excepción dentro del switch (Stripe reintentará). |

Filtrar en Vercel: `jq 'select(.event | startswith("stripe."))'`.
