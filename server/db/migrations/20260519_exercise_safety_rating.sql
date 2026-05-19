-- Add a safety rating (1-5) to exercises, captured in the ExerciseCreate form.
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS safety_rating int;
