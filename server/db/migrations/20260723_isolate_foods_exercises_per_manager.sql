-- ============================================================================
-- 20260723 — Multi-tenant isolation for the foods & exercises catalogs.
--
-- Applied to the DB via Supabase migration `isolate_foods_exercises_per_manager`.
-- Kept here so the repo remains the source of truth for the schema.
--
-- Before: both tables had a single permissive policy (FOR ALL USING
-- role='MANAGER'), so ANY manager could UPDATE/DELETE ANY row — including the
-- shared global catalog and other managers' custom items. Foods & exercises
-- are mutated directly from the browser with the user session, so RLS is the
-- real guard.
--
-- After: global rows (manager_id IS NULL) are read-only for everyone; each
-- manager can only INSERT/UPDATE/DELETE rows they own. Reads stay broad enough
-- that a client still sees their own manager's custom items (the client app
-- resolves exercises by id from the live catalog). Editing a global is handled
-- client-side as copy-on-write (source_food_id / source_exercise_id).
--
-- Seeding keeps working: it runs through the service role, which bypasses RLS.
-- ============================================================================

ALTER TABLE foods
  ADD COLUMN IF NOT EXISTS source_food_id uuid REFERENCES foods(id) ON DELETE SET NULL;

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_exercise_id uuid REFERENCES exercises(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_foods_manager_id ON foods(manager_id);
CREATE INDEX IF NOT EXISTS idx_foods_source_food_id ON foods(source_food_id);
CREATE INDEX IF NOT EXISTS idx_exercises_manager_id ON exercises(manager_id);
CREATE INDEX IF NOT EXISTS idx_exercises_source_exercise_id ON exercises(source_exercise_id);

-- ── FOODS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Managers can manage foods" ON foods;
DROP POLICY IF EXISTS "Anyone can view foods" ON foods;

CREATE POLICY "foods_select_scoped" ON foods
  FOR SELECT
  USING (
    manager_id IS NULL
    OR manager_id = auth.uid()
    OR manager_id = (SELECT u.manager_id FROM users u WHERE u.id = auth.uid())
  );

CREATE POLICY "foods_insert_own" ON foods
  FOR INSERT
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "foods_update_own" ON foods
  FOR UPDATE
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "foods_delete_own" ON foods
  FOR DELETE
  USING (manager_id = auth.uid());

-- ── EXERCISES ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Managers can manage exercises" ON exercises;
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;

CREATE POLICY "exercises_select_scoped" ON exercises
  FOR SELECT
  USING (
    manager_id IS NULL
    OR manager_id = auth.uid()
    OR manager_id = (SELECT u.manager_id FROM users u WHERE u.id = auth.uid())
  );

CREATE POLICY "exercises_insert_own" ON exercises
  FOR INSERT
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "exercises_update_own" ON exercises
  FOR UPDATE
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "exercises_delete_own" ON exercises
  FOR DELETE
  USING (manager_id = auth.uid());
