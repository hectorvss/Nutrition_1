-- Phase 14 audit: prevent duplicate "Once" automation deliveries under concurrency.
-- The previous read-then-insert pattern on automation_logs has a TOCTOU race.
-- Recurring automations are NOT a problem (they should append to automation_logs every time),
-- so a unique constraint on automation_logs would break them. Use a dedicated tracker table instead.

CREATE TABLE IF NOT EXISTS automation_once_deliveries (
  automation_id  uuid NOT NULL,
  client_id      uuid NOT NULL,
  delivered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (automation_id, client_id)
);

-- Backfill from existing automation_logs so the migration is idempotent for already-sent "Once" rules.
INSERT INTO automation_once_deliveries (automation_id, client_id, delivered_at)
SELECT DISTINCT ON (automation_id, client_id) automation_id, client_id, MIN(sent_at)
FROM automation_logs
GROUP BY automation_id, client_id
ON CONFLICT (automation_id, client_id) DO NOTHING;
