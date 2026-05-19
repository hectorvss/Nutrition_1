-- Supplements catalog: a dedicated table (supplements do not fit the macro
-- model used by `foods`). Global rows have manager_id = NULL; managers may add
-- their own custom supplements.
CREATE TABLE IF NOT EXISTS public.supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  purpose text,
  recommended_dose text,
  timing text,
  notes text,
  emoji text,
  is_custom boolean DEFAULT false,
  manager_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  language text DEFAULT 'es',
  created_at timestamptz DEFAULT timezone('utc', now())
);

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read global and own supplements"
  ON public.supplements FOR SELECT
  USING (manager_id IS NULL OR auth.uid() = manager_id);

CREATE POLICY "Insert own supplements"
  ON public.supplements FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Update own supplements"
  ON public.supplements FOR UPDATE
  USING (auth.uid() = manager_id);

CREATE POLICY "Delete own supplements"
  ON public.supplements FOR DELETE
  USING (auth.uid() = manager_id);

CREATE INDEX IF NOT EXISTS idx_supplements_manager ON public.supplements(manager_id);
CREATE INDEX IF NOT EXISTS idx_supplements_category ON public.supplements(category);
