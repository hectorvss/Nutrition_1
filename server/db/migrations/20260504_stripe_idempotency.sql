-- Stripe webhook idempotency: prevent replay attacks
-- Each processed event ID is stored so duplicate deliveries are ignored.

CREATE TABLE IF NOT EXISTS stripe_processed_events (
  event_id   TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo el backend (service role) escribe aqui. RLS con cero policies =
-- denegacion total para anon/authenticated; service role bypassa RLS.
ALTER TABLE stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- Auto-purge events older than 7 days to keep the table small.
-- Run manually or via a scheduled job:
-- DELETE FROM stripe_processed_events WHERE processed_at < now() - interval '7 days';
