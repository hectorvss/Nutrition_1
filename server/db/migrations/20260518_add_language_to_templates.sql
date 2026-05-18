-- The /manager/nutrition-templates API filters templates by language;
-- the column was missing, causing a 500. Mirrors exercises/foods.language.
ALTER TABLE public.nutrition_templates ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';
ALTER TABLE public.training_templates  ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';
