-- Phase 10: prevent duplicate plans (race condition fix)
-- Each (client, manager) pair can only have ONE nutrition plan and ONE training program.
-- Required for the upsert(onConflict) pattern in POST /clients/:id/nutrition-plan and /training-program.

-- Clean up any existing duplicates first (keep the most recent one per pair)
DELETE FROM nutrition_plans a
USING nutrition_plans b
WHERE a.client_id = b.client_id
  AND a.created_by = b.created_by
  AND a.id <> b.id
  AND a.updated_at < b.updated_at;

DELETE FROM training_programs a
USING training_programs b
WHERE a.client_id = b.client_id
  AND a.created_by = b.created_by
  AND a.id <> b.id
  AND a.updated_at < b.updated_at;

ALTER TABLE nutrition_plans
  DROP CONSTRAINT IF EXISTS nutrition_plans_client_manager_unique,
  ADD CONSTRAINT nutrition_plans_client_manager_unique UNIQUE (client_id, created_by);

ALTER TABLE training_programs
  DROP CONSTRAINT IF EXISTS training_programs_client_manager_unique,
  ADD CONSTRAINT training_programs_client_manager_unique UNIQUE (client_id, created_by);
