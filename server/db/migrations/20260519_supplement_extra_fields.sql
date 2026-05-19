-- Add brand, primary ingredient, macronutrients and quality rating to supplements.
-- These fields are captured in the SupplementCreate form but had no columns to land in.
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS primary_ingredient text;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS calories numeric;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS protein numeric;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS carbs numeric;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS fats numeric;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS quality_rating int;
