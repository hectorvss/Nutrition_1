-- Add core exercises in English and Spanish

-- English Exercises
INSERT INTO public.exercises (name, category, subcategory, video_url, description, type, muscle_groups, tools, difficulty_level, icon, language)
VALUES 
    ('Bench Press', 'Strength', 'Horizontal Push', 'https://youtube.com/shorts/sQwh2Zaa6Hk', 'Classic barbell bench press for chest, triceps, and anterior deltoids.', 'Compound', ARRAY['Chest', 'Triceps', 'Shoulders'], ARRAY['Barbell', 'Bench'], 'Intermediate', 'fitness_center', 'en'),
    ('Conventional Squat', 'Strength', 'Knee Dominant', null, 'High bar barbell back squat concentrating on quadriceps and glutes.', 'Compound', ARRAY['Quadriceps', 'Glutes', 'Lower Back'], ARRAY['Barbell', 'Rack'], 'Intermediate', 'fitness_center', 'en'),
    ('Deadlift', 'Strength', 'Hip Dominant', null, 'Conventional barbell deadlift for posterior chain development.', 'Compound', ARRAY['Hamstrings', 'Glutes', 'Lower Back', 'Traps'], ARRAY['Barbell'], 'Intermediate', 'fitness_center', 'en')
ON CONFLICT (name, language) DO NOTHING;

-- Spanish Exercises
INSERT INTO public.exercises (name, category, subcategory, video_url, description, type, muscle_groups, tools, difficulty_level, icon, language)
VALUES 
    ('Press de Banca', 'Strength', 'Empuje horizontal', 'https://youtube.com/shorts/sQwh2Zaa6Hk', 'Press de banca clásico con barra para pectoral, tríceps y deltoides anterior.', 'Compound', ARRAY['Chest', 'Triceps', 'Shoulders'], ARRAY['Barbell', 'Bench'], 'Intermediate', 'fitness_center', 'es'),
    ('Sentadilla Convencional', 'Strength', 'Dominio de rodilla', null, 'Sentadilla con barra tras nuca (barra alta) enfocada en cuádriceps y glúteos.', 'Compound', ARRAY['Quadriceps', 'Glutes', 'Lower Back'], ARRAY['Barbell', 'Rack'], 'Intermediate', 'fitness_center', 'es'),
    ('Peso Muerto', 'Strength', 'Dominio de cadera', null, 'Peso muerto convencional con barra para el desarrollo de la cadena posterior.', 'Compound', ARRAY['Hamstrings', 'Glutes', 'Lower Back', 'Traps'], ARRAY['Barbell'], 'Intermediate', 'fitness_center', 'es')
ON CONFLICT (name, language) DO NOTHING;
