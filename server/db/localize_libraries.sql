-- 1. Preparar las tablas para multi-idioma
DO $$ 
BEGIN 
    -- Añadir columna language si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='foods' AND column_name='language') THEN
        ALTER TABLE public.foods ADD COLUMN language TEXT DEFAULT 'en';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='language') THEN
        ALTER TABLE public.exercises ADD COLUMN language TEXT DEFAULT 'en';
    END IF;

    -- Añadir restricciones únicas para evitar duplicados por idioma y permitir el ON CONFLICT
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'foods_name_language_key') THEN
        ALTER TABLE public.foods ADD CONSTRAINT foods_name_language_key UNIQUE (name, language);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exercises_name_language_key') THEN
        ALTER TABLE public.exercises ADD CONSTRAINT exercises_name_language_key UNIQUE (name, language);
    END IF;
END $$;

-- 2. Alimentos en Español
INSERT INTO public.foods (name, category, calories, protein, carbs, fats, serving_size, emoji, language)
VALUES 
    ('Pechuga de Pollo', 'Proteína', 165, 31, 0, 3.6, '100g', '🍗', 'es'),
    ('Arroz Blanco', 'Carbohidratos', 130, 2.7, 28, 0.3, '100g', '🍚', 'es'),
    ('Huevo Cocido', 'Proteína', 155, 13, 1.1, 11, '100g', '🥚', 'es'),
    ('Brócoli', 'Vegetales', 34, 2.8, 6.6, 0.4, '100g', '🥦', 'es'),
    ('Salmón', 'Proteína', 208, 20, 0, 13, '100g', '🐟', 'es'),
    ('Avena', 'Carbohidratos', 389, 16.9, 66, 6.9, '100g', '🥣', 'es'),
    ('Aguacate', 'Grasas', 160, 2, 8.5, 15, '100g', '🥑', 'es')
ON CONFLICT (name, language) DO NOTHING;

-- 3. Alimentos en Inglés (Espejo)
INSERT INTO public.foods (name, category, calories, protein, carbs, fats, serving_size, emoji, language)
VALUES 
    ('Chicken Breast', 'Protein', 165, 31, 0, 3.6, '100g', '🍗', 'en'),
    ('White Rice', 'Carbs', 130, 2.7, 28, 0.3, '100g', '🍚', 'en'),
    ('Boiled Egg', 'Protein', 155, 13, 1.1, 11, '100g', '🥚', 'en'),
    ('Broccoli', 'Vegetables', 34, 2.8, 6.6, 0.4, '100g', '🥦', 'en'),
    ('Salmon', 'Protein', 208, 20, 0, 13, '100g', '🐟', 'en'),
    ('Oats', 'Carbs', 389, 16.9, 66, 6.9, '100g', '🥣', 'en'),
    ('Avocado', 'Fats', 160, 2, 8.5, 15, '100g', '🥑', 'en')
ON CONFLICT (name, language) DO NOTHING;

-- 4. Ejercicios en Español
INSERT INTO public.exercises (name, category, difficulty_level, muscle_groups, type, language)
VALUES 
    ('Sentadilla con Barra', 'Strength', 'Intermediate', ARRAY['Quadriceps', 'Glutes'], 'Compound', 'es'),
    ('Press de Banca con Mancuernas', 'Strength', 'Beginner', ARRAY['Chest', 'Triceps'], 'Compound', 'es'),
    ('Peso Muerto Rumano', 'Strength', 'Intermediate', ARRAY['Hamstrings', 'Lower Back'], 'Compound', 'es'),
    ('Elevaciones Laterales', 'Strength', 'Beginner', ARRAY['Deltoids'], 'Isolation', 'es'),
    ('Dominadas', 'Strength', 'Advanced', ARRAY['Lats', 'Biceps'], 'Compound', 'es')
ON CONFLICT (name, language) DO NOTHING;

-- 5. Ejercicios en Inglés (Espejo)
INSERT INTO public.exercises (name, category, difficulty_level, muscle_groups, type, language)
VALUES 
    ('Barbell Back Squat', 'Strength', 'Intermediate', ARRAY['Quadriceps', 'Glutes'], 'Compound', 'en'),
    ('Dumbbell Bench Press', 'Strength', 'Beginner', ARRAY['Chest', 'Triceps'], 'Compound', 'en'),
    ('Romanian Deadlift', 'Strength', 'Intermediate', ARRAY['Hamstrings', 'Lower Back'], 'Compound', 'en'),
    ('Lateral Raises', 'Strength', 'Beginner', ARRAY['Deltoids'], 'Isolation', 'en'),
    ('Pull Ups', 'Strength', 'Advanced', ARRAY['Lats', 'Biceps'], 'Compound', 'en')
ON CONFLICT (name, language) DO NOTHING;
