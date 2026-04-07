DO $$ 
BEGIN 
    -- 1. Add language column to nutrition_templates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nutrition_templates' AND column_name='language') THEN
        ALTER TABLE public.nutrition_templates ADD COLUMN language TEXT DEFAULT 'en';
    END IF;

    -- 2. Add language column to training_templates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_templates' AND column_name='language') THEN
        ALTER TABLE public.training_templates ADD COLUMN language TEXT DEFAULT 'en';
    END IF;

    -- 3. Add unique constraints to prevent duplicates by key/language
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nutrition_templates_key_language_key') THEN
        ALTER TABLE public.nutrition_templates ADD CONSTRAINT nutrition_templates_key_language_key UNIQUE (key, language);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'training_templates_key_language_key') THEN
        ALTER TABLE public.training_templates ADD CONSTRAINT training_templates_key_language_key UNIQUE (key, language);
    END IF;
END $$;
