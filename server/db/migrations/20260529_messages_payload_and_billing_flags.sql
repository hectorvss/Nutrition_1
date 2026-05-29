-- Rich chat cards (payment) store their metadata in messages.payload (jsonb).
-- public.messages previously had NO payload column, so the payment-card insert
-- (attachment_type='payment' + payload) was rejected by PostgREST and the
-- "send payment link via chat" action failed. Add the column.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS payload jsonb;

-- Subscription management flags surfaced in the Cobros UI and reconciled from
-- Stripe on sync (already applied in production; kept here for reproducibility).
ALTER TABLE public.client_billing
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paused boolean NOT NULL DEFAULT false;
