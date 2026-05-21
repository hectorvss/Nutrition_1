-- ============================================================================
-- Migration: 20260521_rebuild_legacy_training_templates.sql
-- Rebuilds 8 legacy low-quality training templates to the rich v2 schema
-- (see 20260521_seed_training_templates_v2.sql). Each template is upgraded in
-- Spanish ('es') and English ('en') -> 16 rows total.
--
-- Templates: twf_beginner_fullbody, twf_athletic, twf_bodyweight_home,
--   twf_fat_loss_circuit, twf_hypertrophy_ppl, twf_powerlifting,
--   twf_strength_5x5, twf_upper_lower
--
-- Idempotent via ON CONFLICT (key, language) DO UPDATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. twf_beginner_fullbody  |  Beginner Full Body (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_beginner_fullbody',
  'Cuerpo Completo para Principiantes',
  'Rutina de cuerpo completo de 3 dias para iniciarse en el gimnasio aprendiendo los patrones basicos con cargas moderadas.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Cuerpo Completo para Principiantes",
    "level": "Beginner",
    "focus": "Acondicionamiento general",
    "frequency": 3,
    "duration": 50,
    "description": "Rutina de cuerpo completo de 3 dias para iniciarse en el gimnasio aprendiendo los patrones basicos con cargas moderadas.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la temperatura corporal de forma suave." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Practica el patron antes de cargar." }
        ]},
        { "id": "b2", "name": "Patrones Basicos", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla con barra", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioriza la tecnica sobre el peso." },
          { "id": "e4", "name": "Press de banca con barra", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Baja la barra controlada hasta el pecho." },
          { "id": "e5", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Mantente erguido y junta las escapulas." }
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e6", "name": "Press de hombro en maquina", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Recorrido completo sin bloquear de golpe." },
          { "id": "e7", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Cadera neutra, abdomen apretado." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de cuadriceps de pie", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez, sin rebotes." }
        ]}
      ]},
      { "id": "w2", "name": "Cuerpo Completo B", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general de todo el cuerpo." },
          { "id": "e10", "name": "Puente de gluteo", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa la cadena posterior." }
        ]},
        { "id": "b6", "name": "Patrones Basicos", "type": "main", "exercises": [
          { "id": "e11", "name": "Peso muerto rumano con barra", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Cadera atras, espalda recta." },
          { "id": "e12", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Controla las mancuernas en todo el rango." },
          { "id": "e13", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Lleva la barra al pecho con control." }
        ]},
        { "id": "b7", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e14", "name": "Curl con mancuernas", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Sin balanceo del torso." },
          { "id": "e15", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Codos fijos al costado." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de espalda gato-camello", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Movimiento lento y respirado." }
        ]}
      ]},
      { "id": "w3", "name": "Cuerpo Completo C", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Eliptica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento cardiovascular suave." },
          { "id": "e18", "name": "Zancadas sin peso", "type": "Compound", "sets": "2", "reps": "10", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las piernas." }
        ]},
        { "id": "b10", "name": "Patrones Basicos", "type": "main", "exercises": [
          { "id": "e19", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "No bloquees las rodillas arriba." },
          { "id": "e20", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Aprieta el pecho al final." },
          { "id": "e21", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Apoya la mano libre en el banco." }
        ]},
        { "id": "b11", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e22", "name": "Elevaciones laterales", "type": "Isolation", "sets": "2", "reps": "12-15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "1-0-1", "notes": "Sube con los codos, sin impulso." },
          { "id": "e23", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Rango completo con pausa abajo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_beginner_fullbody',
  'Beginner Full Body',
  '3-day full body routine to start training in the gym while learning the basic movement patterns with moderate loads.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Beginner Full Body",
    "level": "Beginner",
    "focus": "General conditioning",
    "frequency": 3,
    "duration": 50,
    "description": "3-day full body routine to start training in the gym while learning the basic movement patterns with moderate loads.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gently raise body temperature." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Practice the pattern before loading." }
        ]},
        { "id": "b2", "name": "Basic Patterns", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioritize technique over load." },
          { "id": "e4", "name": "Barbell Bench Press", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Lower the bar under control to the chest." },
          { "id": "e5", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Stay upright and squeeze the shoulder blades." }
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e6", "name": "Machine Shoulder Press", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Full range without slamming the lockout." },
          { "id": "e7", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Neutral hips, brace the core." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Standing Quad Stretch", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "One side at a time, no bouncing." }
        ]}
      ]},
      { "id": "w2", "name": "Full Body B", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General full-body activation." },
          { "id": "e10", "name": "Glute Bridge", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the posterior chain." }
        ]},
        { "id": "b6", "name": "Basic Patterns", "type": "main", "exercises": [
          { "id": "e11", "name": "Barbell Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Hips back, flat back." },
          { "id": "e12", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Control the dumbbells through the full range." },
          { "id": "e13", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Bring the bar to the chest with control." }
        ]},
        { "id": "b7", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e14", "name": "Dumbbell Curl", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "No torso swing." },
          { "id": "e15", "name": "Triceps Pushdown", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Cat-Camel Back Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Slow movement with steady breathing." }
        ]}
      ]},
      { "id": "w3", "name": "Full Body C", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Elliptical", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gentle cardiovascular warm-up." },
          { "id": "e18", "name": "Bodyweight Lunge", "type": "Compound", "sets": "2", "reps": "10", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prime the legs." }
        ]},
        { "id": "b10", "name": "Basic Patterns", "type": "main", "exercises": [
          { "id": "e19", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Do not lock the knees at the top." },
          { "id": "e20", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Squeeze the chest at the end." },
          { "id": "e21", "name": "Single-Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Support the free hand on the bench." }
        ]},
        { "id": "b11", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e22", "name": "Lateral Raise", "type": "Isolation", "sets": "2", "reps": "12-15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "1-0-1", "notes": "Lead with the elbows, no momentum." },
          { "id": "e23", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Full range with a pause at the bottom." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 2. twf_athletic  |  Athletic Performance (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_athletic',
  'Rendimiento Atletico',
  'Programa de 4 dias orientado a potencia, velocidad y explosividad combinando trabajo pliometrico con fuerza compuesta.',
  'Advanced',
  'Athletic Performance',
  4,
  '{
    "name": "Rendimiento Atletico",
    "level": "Advanced",
    "focus": "Potencia y explosividad",
    "frequency": 4,
    "duration": 70,
    "description": "Programa de 4 dias orientado a potencia, velocidad y explosividad combinando trabajo pliometrico con fuerza compuesta.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Potencia Tren Inferior", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Carrera suave", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la temperatura corporal." },
          { "id": "e2", "name": "Skipping y talones al gluteo", "type": "Compound", "sets": "2", "reps": "20m", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Tecnica de carrera y activacion neural." },
          { "id": "e3", "name": "Sentadilla con salto baja altura", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Ligero", "tempo": null, "notes": "Aterrizaje suave para preparar el sistema nervioso." }
        ]},
        { "id": "b2", "name": "Pliometria", "type": "main", "exercises": [
          { "id": "e4", "name": "Salto al cajon", "type": "Compound", "sets": "5", "reps": "3", "rir": null, "rest": "120s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Maxima velocidad de despegue, recuperacion completa." },
          { "id": "e5", "name": "Salto horizontal", "type": "Compound", "sets": "4", "reps": "4", "rir": null, "rest": "120s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Busca distancia con aterrizaje controlado." }
        ]},
        { "id": "b3", "name": "Fuerza Explosiva", "type": "main", "exercises": [
          { "id": "e6", "name": "Cargada de potencia", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "75-85% 1RM", "tempo": "X", "notes": "Triple extension agresiva.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "3", "intensity": "70% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "80% 1RM", "rest": "180s" },
            { "set": 4, "reps": "3", "rir": "2", "intensity": "82% 1RM", "rest": "180s" },
            { "set": 5, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" }
          ]},
          { "id": "e7", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Sube con la maxima velocidad posible." },
          { "id": "e8", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibrio unilateral y estabilidad." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja la cadera tras el trabajo de potencia." }
        ]}
      ]},
      { "id": "w2", "name": "Potencia Tren Superior", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e11", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Prepara hombros y manguito rotador." }
        ]},
        { "id": "b6", "name": "Pliometria de Empuje", "type": "main", "exercises": [
          { "id": "e12", "name": "Lanzamiento de balon medicinal sobre cabeza", "type": "Compound", "sets": "5", "reps": "4", "rir": null, "rest": "90s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Transfiere fuerza desde la cadera." },
          { "id": "e13", "name": "Flexion pliometrica", "type": "Compound", "sets": "4", "reps": "5", "rir": null, "rest": "90s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Despegue explosivo de las manos." }
        ]},
        { "id": "b7", "name": "Fuerza de Empuje y Traccion", "type": "main", "exercises": [
          { "id": "e14", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Fase concentrica explosiva." },
          { "id": "e15", "name": "Dominadas lastradas", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Tira con potencia hacia la barra." },
          { "id": "e16", "name": "Press militar con barra", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w3", "name": "Velocidad y Agilidad", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Movilidad dinamica", "type": "Compound", "sets": "1", "reps": "6min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Rutina de movilidad de cadera, tobillo y tronco." },
          { "id": "e19", "name": "Sprints progresivos", "type": "Compound", "sets": "3", "reps": "30m", "rir": null, "rest": "60s", "intensity": "Submaximo", "tempo": null, "notes": "Acelera de forma gradual hasta el 80%." }
        ]},
        { "id": "b10", "name": "Esprints y Cambios de Direccion", "type": "main", "exercises": [
          { "id": "e20", "name": "Sprint maximo 20 metros", "type": "Compound", "sets": "6", "reps": "1", "rir": null, "rest": "120s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Aceleracion al maximo, recuperacion completa." },
          { "id": "e21", "name": "Carrera en escalera de agilidad", "type": "Compound", "sets": "5", "reps": "1", "rir": null, "rest": "75s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Pies rapidos y coordinacion." },
          { "id": "e22", "name": "Drill en T de agilidad", "type": "Compound", "sets": "4", "reps": "1", "rir": null, "rest": "120s", "intensity": "Maxima intencion", "tempo": "X", "notes": "Cambios de direccion bajos y explosivos." }
        ]},
        { "id": "b11", "name": "Core y Estabilidad", "type": "main", "exercises": [
          { "id": "e23", "name": "Giro ruso con balon medicinal", "type": "Isolation", "sets": "3", "reps": "16", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Rotacion controlada del tronco." },
          { "id": "e24", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Cadera alta y alineada." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w4", "name": "Fuerza Total", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular suave." },
          { "id": "e27", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." }
        ]},
        { "id": "b14", "name": "Fuerza Compuesta", "type": "main", "exercises": [
          { "id": "e28", "name": "Peso muerto con barra", "type": "Compound", "sets": "4", "reps": "4", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "1-0-X", "notes": "Tira con intencion, espalda neutra." },
          { "id": "e29", "name": "Sentadilla frontal con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Codos altos, tronco erguido." },
          { "id": "e30", "name": "Empuje de trineo", "type": "Compound", "sets": "4", "reps": "20m", "rir": null, "rest": "120s", "intensity": "Pesado", "tempo": null, "notes": "Pasos potentes y constantes." }
        ]},
        { "id": "b15", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e31", "name": "Zancadas caminando con mancuernas", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Paso largo y estable." },
          { "id": "e32", "name": "Paseo del granjero", "type": "Compound", "sets": "3", "reps": "30m", "rir": null, "rest": "90s", "intensity": "Pesado", "tempo": null, "notes": "Agarre firme y postura erguida." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e33", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo y la cadera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_athletic',
  'Athletic Performance',
  '4-day program focused on power, speed and explosiveness combining plyometric work with compound strength.',
  'Advanced',
  'Athletic Performance',
  4,
  '{
    "name": "Athletic Performance",
    "level": "Advanced",
    "focus": "Power and explosiveness",
    "frequency": 4,
    "duration": 70,
    "description": "4-day program focused on power, speed and explosiveness combining plyometric work with compound strength.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Lower Body Power", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Easy Jog", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Raise body temperature." },
          { "id": "e2", "name": "A-Skips and Butt Kicks", "type": "Compound", "sets": "2", "reps": "20m", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Running drills and neural activation." },
          { "id": "e3", "name": "Low Box Jump", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Light", "tempo": null, "notes": "Soft landings to prime the nervous system." }
        ]},
        { "id": "b2", "name": "Plyometrics", "type": "main", "exercises": [
          { "id": "e4", "name": "Box Jump", "type": "Compound", "sets": "5", "reps": "3", "rir": null, "rest": "120s", "intensity": "Max intent", "tempo": "X", "notes": "Maximal take-off speed, full recovery." },
          { "id": "e5", "name": "Broad Jump", "type": "Compound", "sets": "4", "reps": "4", "rir": null, "rest": "120s", "intensity": "Max intent", "tempo": "X", "notes": "Chase distance with a controlled landing." }
        ]},
        { "id": "b3", "name": "Explosive Strength", "type": "main", "exercises": [
          { "id": "e6", "name": "Power Clean", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "75-85% 1RM", "tempo": "X", "notes": "Aggressive triple extension.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "3", "intensity": "70% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "80% 1RM", "rest": "180s" },
            { "set": 4, "reps": "3", "rir": "2", "intensity": "82% 1RM", "rest": "180s" },
            { "set": 5, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" }
          ]},
          { "id": "e7", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Drive up as fast as possible." },
          { "id": "e8", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral balance and stability." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the hips after power work." }
        ]}
      ]},
      { "id": "w2", "name": "Upper Body Power", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e11", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b6", "name": "Push Plyometrics", "type": "main", "exercises": [
          { "id": "e12", "name": "Overhead Medicine Ball Throw", "type": "Compound", "sets": "5", "reps": "4", "rir": null, "rest": "90s", "intensity": "Max intent", "tempo": "X", "notes": "Transfer force from the hips." },
          { "id": "e13", "name": "Plyometric Push-Up", "type": "Compound", "sets": "4", "reps": "5", "rir": null, "rest": "90s", "intensity": "Max intent", "tempo": "X", "notes": "Explosive hand take-off." }
        ]},
        { "id": "b7", "name": "Push and Pull Strength", "type": "main", "exercises": [
          { "id": "e14", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Explosive concentric phase." },
          { "id": "e15", "name": "Weighted Pull-Up", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-X", "notes": "Pull powerfully toward the bar." },
          { "id": "e16", "name": "Barbell Overhead Press", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Brace the core, no lumbar arch." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w3", "name": "Speed and Agility", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Dynamic Mobility", "type": "Compound", "sets": "1", "reps": "6min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Hip, ankle and trunk mobility routine." },
          { "id": "e19", "name": "Build-Up Sprints", "type": "Compound", "sets": "3", "reps": "30m", "rir": null, "rest": "60s", "intensity": "Submaximal", "tempo": null, "notes": "Accelerate gradually up to 80%." }
        ]},
        { "id": "b10", "name": "Sprints and Change of Direction", "type": "main", "exercises": [
          { "id": "e20", "name": "20-Meter Max Sprint", "type": "Compound", "sets": "6", "reps": "1", "rir": null, "rest": "120s", "intensity": "Max intent", "tempo": "X", "notes": "Maximal acceleration, full recovery." },
          { "id": "e21", "name": "Agility Ladder Run", "type": "Compound", "sets": "5", "reps": "1", "rir": null, "rest": "75s", "intensity": "Max intent", "tempo": "X", "notes": "Fast feet and coordination." },
          { "id": "e22", "name": "T-Drill Agility", "type": "Compound", "sets": "4", "reps": "1", "rir": null, "rest": "120s", "intensity": "Max intent", "tempo": "X", "notes": "Low, explosive direction changes." }
        ]},
        { "id": "b11", "name": "Core and Stability", "type": "main", "exercises": [
          { "id": "e23", "name": "Medicine Ball Russian Twist", "type": "Isolation", "sets": "3", "reps": "16", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Controlled trunk rotation." },
          { "id": "e24", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Hips high and aligned." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w4", "name": "Total Strength", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gentle cardiovascular activation." },
          { "id": "e27", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prime hips and knees." }
        ]},
        { "id": "b14", "name": "Compound Strength", "type": "main", "exercises": [
          { "id": "e28", "name": "Barbell Deadlift", "type": "Compound", "sets": "4", "reps": "4", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "1-0-X", "notes": "Pull with intent, neutral back." },
          { "id": "e29", "name": "Barbell Front Squat", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "High elbows, upright torso." },
          { "id": "e30", "name": "Sled Push", "type": "Compound", "sets": "4", "reps": "20m", "rir": null, "rest": "120s", "intensity": "Heavy", "tempo": null, "notes": "Powerful, consistent strides." }
        ]},
        { "id": "b15", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e31", "name": "Dumbbell Walking Lunge", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Long, stable stride." },
          { "id": "e32", "name": "Farmer Carry", "type": "Compound", "sets": "3", "reps": "30m", "rir": null, "rest": "90s", "intensity": "Heavy", "tempo": null, "notes": "Firm grip and tall posture." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e33", "name": "Figure-4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 3. twf_bodyweight_home  |  Bodyweight Home Training (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_bodyweight_home',
  'Calistenia en Casa',
  'Rutina de 3 dias sin material basada en progresiones de calistenia para ganar fuerza y control corporal en casa.',
  'Beginner',
  'Bodyweight',
  3,
  '{
    "name": "Calistenia en Casa",
    "level": "Beginner",
    "focus": "Fuerza con peso corporal",
    "frequency": 3,
    "duration": 45,
    "description": "Rutina de 3 dias sin material basada en progresiones de calistenia para ganar fuerza y control corporal en casa.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Empuje", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca." },
          { "id": "e2", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros en ambos sentidos." }
        ]},
        { "id": "b2", "name": "Fuerza de Empuje", "type": "main", "exercises": [
          { "id": "e3", "name": "Flexiones (progresion: rodillas a estandar)", "type": "Compound", "sets": "4", "reps": "8-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cuerpo en linea recta, baja el pecho casi al suelo." },
          { "id": "e4", "name": "Fondos entre sillas", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Codos cerca del cuerpo, hombros estables." },
          { "id": "e5", "name": "Flexion pica", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cadera alta, simula un press de hombro." }
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e6", "name": "Flexion diamante", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Manos juntas para enfatizar el triceps." },
          { "id": "e7", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Abdomen y gluteo apretados." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de pecho de pie", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Entrelaza las manos detras y abre el pecho." }
        ]}
      ]},
      { "id": "w2", "name": "Traccion y Core", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Trote en el sitio", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e10", "name": "Gato-camello", "type": "Compound", "sets": "2", "reps": "10", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b6", "name": "Fuerza de Traccion", "type": "main", "exercises": [
          { "id": "e11", "name": "Remo invertido bajo mesa", "type": "Compound", "sets": "4", "reps": "8-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cuerpo recto, lleva el pecho al borde." },
          { "id": "e12", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Eleva brazos y piernas, pausa arriba." },
          { "id": "e13", "name": "Puente de gluteo", "type": "Compound", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Aprieta el gluteo en el tope." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Elevacion de rodillas tumbado", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Controla la bajada, sin impulso." },
          { "id": "e15", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Cadera alta y alineada cada lado." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de espalda del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Relaja la espalda y respira hondo." }
        ]}
      ]},
      { "id": "w3", "name": "Pierna", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la temperatura corporal." },
          { "id": "e18", "name": "Sentadilla sin peso lenta", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Practica el patron antes del trabajo principal." }
        ]},
        { "id": "b10", "name": "Fuerza de Pierna", "type": "main", "exercises": [
          { "id": "e19", "name": "Sentadilla con peso corporal", "type": "Compound", "sets": "4", "reps": "15-20", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa, talones en el suelo." },
          { "id": "e20", "name": "Zancada inversa", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Rodilla trasera casi al suelo, control." },
          { "id": "e21", "name": "Sentadilla bulgara (pie atras en silla)", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Progresion hacia la sentadilla a una pierna." }
        ]},
        { "id": "b11", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e22", "name": "Elevacion de gemelo a una pierna", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." },
          { "id": "e23", "name": "Puente de gluteo a una pierna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Cadera nivelada durante todo el movimiento." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Estiramiento de cuadriceps de pie", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez, sin rebotes." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_bodyweight_home',
  'Bodyweight Home Training',
  '3-day no-equipment routine built on calisthenics progressions to build strength and body control at home.',
  'Beginner',
  'Bodyweight',
  3,
  '{
    "name": "Bodyweight Home Training",
    "level": "Beginner",
    "focus": "Bodyweight strength",
    "frequency": 3,
    "duration": 45,
    "description": "3-day no-equipment routine built on calisthenics progressions to build strength and body control at home.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate." },
          { "id": "e2", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulders both directions." }
        ]},
        { "id": "b2", "name": "Push Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Push-Up (progression: knees to standard)", "type": "Compound", "sets": "4", "reps": "8-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Body in a straight line, chest near the floor." },
          { "id": "e4", "name": "Chair Dips", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Elbows close to the body, stable shoulders." },
          { "id": "e5", "name": "Pike Push-Up", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Hips high, mimic a shoulder press." }
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e6", "name": "Diamond Push-Up", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Hands together to emphasize the triceps." },
          { "id": "e7", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Brace abs and glutes." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Standing Chest Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Clasp hands behind and open the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Pull and Core", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Jog in Place", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e10", "name": "Cat-Camel", "type": "Compound", "sets": "2", "reps": "10", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b6", "name": "Pull Strength", "type": "main", "exercises": [
          { "id": "e11", "name": "Inverted Row Under Table", "type": "Compound", "sets": "4", "reps": "8-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight body, bring chest to the edge." },
          { "id": "e12", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Lift arms and legs, pause at the top." },
          { "id": "e13", "name": "Glute Bridge", "type": "Compound", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Squeeze the glutes at the top." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Lying Knee Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Control the descent, no momentum." },
          { "id": "e15", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Hips high and aligned each side." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Child Pose Back Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Relax the back and breathe deep." }
        ]}
      ]},
      { "id": "w3", "name": "Legs", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise body temperature." },
          { "id": "e18", "name": "Slow Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Practice the pattern before main work." }
        ]},
        { "id": "b10", "name": "Leg Strength", "type": "main", "exercises": [
          { "id": "e19", "name": "Bodyweight Squat", "type": "Compound", "sets": "4", "reps": "15-20", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth, heels on the floor." },
          { "id": "e20", "name": "Reverse Lunge", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back knee near the floor, controlled." },
          { "id": "e21", "name": "Bulgarian Split Squat (rear foot on chair)", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Progression toward the pistol squat." }
        ]},
        { "id": "b11", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e22", "name": "Single-Leg Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range with a pause at the bottom." },
          { "id": "e23", "name": "Single-Leg Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Keep hips level throughout." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Standing Quad Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "One side at a time, no bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 4. twf_fat_loss_circuit  |  Fat Loss Circuit (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_fat_loss_circuit',
  'Circuito Quema Grasa',
  'Programa de 4 dias en formato circuito con descansos cortos para maximizar el gasto calorico y conservar masa muscular.',
  'Intermediate',
  'Circuit Training',
  4,
  '{
    "name": "Circuito Quema Grasa",
    "level": "Intermediate",
    "focus": "Perdida de grasa",
    "frequency": 4,
    "duration": 50,
    "description": "Programa de 4 dias en formato circuito con descansos cortos para maximizar el gasto calorico y conservar masa muscular.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Circuito Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca de forma progresiva." },
          { "id": "e2", "name": "Movilidad dinamica", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Prepara cadera, hombros y tobillos." }
        ]},
        { "id": "b2", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla goblet", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Encadena con el siguiente ejercicio sin pausa larga." },
          { "id": "e4", "name": "Flexiones", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Mantiene el cuerpo en linea recta." },
          { "id": "e5", "name": "Remo con mancuerna", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Tira hacia la cadera con control." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 9", "tempo": "X", "notes": "Descanso largo solo al cerrar la vuelta del circuito." }
        ]},
        { "id": "b3", "name": "Finalizador", "type": "main", "exercises": [
          { "id": "e7", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Ritmo alto y constante." },
          { "id": "e8", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Core firme entre rondas." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de cuerpo completo", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones y respira hondo." }
        ]}
      ]},
      { "id": "w2", "name": "Circuito Tren Inferior", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento cardiovascular." },
          { "id": "e11", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa cadera y rodillas." }
        ]},
        { "id": "b6", "name": "Circuito de Pierna", "type": "main", "exercises": [
          { "id": "e12", "name": "Zancada caminando", "type": "Compound", "sets": "4", "reps": "16", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Encadena sin pausa larga." },
          { "id": "e13", "name": "Peso muerto rumano con mancuernas", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cadera atras, espalda recta." },
          { "id": "e14", "name": "Sentadilla con salto", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 9", "tempo": "X", "notes": "Aterrizaje suave y controlado." },
          { "id": "e15", "name": "Step-up al cajon", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Descanso largo al cerrar el circuito." }
        ]},
        { "id": "b7", "name": "Finalizador", "type": "main", "exercises": [
          { "id": "e16", "name": "Saltos de patinador", "type": "Compound", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Salto lateral amplio." },
          { "id": "e17", "name": "Sentadilla isometrica en pared", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Muslos paralelos al suelo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Circuito Tren Superior", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e20", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "15s", "intensity": "Ligero", "tempo": null, "notes": "Prepara los hombros." }
        ]},
        { "id": "b10", "name": "Circuito de Empuje y Traccion", "type": "main", "exercises": [
          { "id": "e21", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Encadena con el siguiente ejercicio." },
          { "id": "e22", "name": "Jalon al pecho", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Lleva la barra al pecho con control." },
          { "id": "e23", "name": "Press de pecho con mancuernas", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Recorrido completo." },
          { "id": "e24", "name": "Battle ropes", "type": "Compound", "sets": "4", "reps": "30s", "rir": null, "rest": "90s", "intensity": "RPE 9", "tempo": "X", "notes": "Descanso largo al cerrar el circuito." }
        ]},
        { "id": "b11", "name": "Finalizador", "type": "main", "exercises": [
          { "id": "e25", "name": "Curl con mancuernas", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Sin balanceo del torso." },
          { "id": "e26", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w4", "name": "Circuito HIIT Total", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e28", "name": "Comba", "type": "Compound", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Eleva pulsaciones progresivamente." },
          { "id": "e29", "name": "Movilidad dinamica", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Prepara todo el cuerpo." }
        ]},
        { "id": "b14", "name": "Intervalos de Alta Intensidad", "type": "main", "exercises": [
          { "id": "e30", "name": "Burpees", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Trabajo 30s / descanso 30s." },
          { "id": "e31", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Ritmo alto y constante." },
          { "id": "e32", "name": "Sentadilla con salto", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Aterrizaje suave en cada repeticion." }
        ]},
        { "id": "b15", "name": "Core Finalizador", "type": "main", "exercises": [
          { "id": "e33", "name": "Plancha con toque de hombro", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Cadera estable, sin balanceo." },
          { "id": "e34", "name": "Elevacion de piernas tumbado", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Controla la bajada." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e35", "name": "Estiramiento de cuerpo completo", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones y respira hondo." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_fat_loss_circuit',
  'Fat Loss Circuit',
  '4-day circuit-style program with short rest periods to maximize calorie burn while preserving muscle mass.',
  'Intermediate',
  'Circuit Training',
  4,
  '{
    "name": "Fat Loss Circuit",
    "level": "Intermediate",
    "focus": "Fat loss",
    "frequency": 4,
    "duration": 50,
    "description": "4-day circuit-style program with short rest periods to maximize calorie burn while preserving muscle mass.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body Circuit A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate progressively." },
          { "id": "e2", "name": "Dynamic Mobility", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Prime hips, shoulders and ankles." }
        ]},
        { "id": "b2", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e3", "name": "Goblet Squat", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Move to the next exercise with no long pause." },
          { "id": "e4", "name": "Push-Up", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Keep the body in a straight line." },
          { "id": "e5", "name": "Dumbbell Row", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pull to the hip under control." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 9", "tempo": "X", "notes": "Long rest only when closing the circuit round." }
        ]},
        { "id": "b3", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e7", "name": "Mountain Climbers", "type": "Compound", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "High, steady pace." },
          { "id": "e8", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Brace the core between rounds." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Full Body Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lower heart rate and breathe deep." }
        ]}
      ]},
      { "id": "w2", "name": "Lower Body Circuit", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular warm-up." },
          { "id": "e11", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prime hips and knees." }
        ]},
        { "id": "b6", "name": "Leg Circuit", "type": "main", "exercises": [
          { "id": "e12", "name": "Walking Lunge", "type": "Compound", "sets": "4", "reps": "16", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Chain with no long pause." },
          { "id": "e13", "name": "Dumbbell Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Hips back, flat back." },
          { "id": "e14", "name": "Jump Squat", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 9", "tempo": "X", "notes": "Soft, controlled landing." },
          { "id": "e15", "name": "Box Step-Up", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Long rest when closing the circuit." }
        ]},
        { "id": "b7", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e16", "name": "Skater Jumps", "type": "Compound", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Wide lateral jump." },
          { "id": "e17", "name": "Wall Sit", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Thighs parallel to the floor." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Upper Body Circuit", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e20", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "15s", "intensity": "Light", "tempo": null, "notes": "Prime the shoulders." }
        ]},
        { "id": "b10", "name": "Push and Pull Circuit", "type": "main", "exercises": [
          { "id": "e21", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Chain with the next exercise." },
          { "id": "e22", "name": "Lat Pulldown", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Bring the bar to the chest with control." },
          { "id": "e23", "name": "Dumbbell Chest Press", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "20s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full range of motion." },
          { "id": "e24", "name": "Battle Ropes", "type": "Compound", "sets": "4", "reps": "30s", "rir": null, "rest": "90s", "intensity": "RPE 9", "tempo": "X", "notes": "Long rest when closing the circuit." }
        ]},
        { "id": "b11", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e25", "name": "Dumbbell Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No torso swing." },
          { "id": "e26", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w4", "name": "Total HIIT Circuit", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e28", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate progressively." },
          { "id": "e29", "name": "Dynamic Mobility", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Prime the whole body." }
        ]},
        { "id": "b14", "name": "High-Intensity Intervals", "type": "main", "exercises": [
          { "id": "e30", "name": "Burpees", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Work 30s / rest 30s." },
          { "id": "e31", "name": "Mountain Climbers", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "High, steady pace." },
          { "id": "e32", "name": "Jump Squat", "type": "Compound", "sets": "5", "reps": "30s", "rir": null, "rest": "30s", "intensity": "RPE 9", "tempo": "X", "notes": "Soft landing on every rep." }
        ]},
        { "id": "b15", "name": "Core Finisher", "type": "main", "exercises": [
          { "id": "e33", "name": "Plank Shoulder Tap", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Stable hips, no swaying." },
          { "id": "e34", "name": "Lying Leg Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Control the descent." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e35", "name": "Full Body Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lower heart rate and breathe deep." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 5. twf_hypertrophy_ppl  |  Push/Pull/Legs Hypertrophy (6 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hypertrophy_ppl',
  'Hipertrofia Empuje/Tiron/Pierna',
  'Rutina PPL de 6 dias con alto volumen y rangos de 8-15 repeticiones cerca del fallo para maximizar la hipertrofia.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Hipertrofia Empuje/Tiron/Pierna",
    "level": "Advanced",
    "focus": "Hipertrofia",
    "frequency": 6,
    "duration": 70,
    "description": "Rutina PPL de 6 dias con alto volumen y rangos de 8-15 repeticiones cerca del fallo para maximizar la hipertrofia.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Empuje", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito rotador." }
        ]},
        { "id": "b2", "name": "Pecho y Hombro", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Escapulas retraidas, controla la bajada." },
          { "id": "e4", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el pectoral en la fase excentrica." },
          { "id": "e5", "name": "Press de hombro con mancuernas sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Recorrido completo sin bloquear de golpe." }
        ]},
        { "id": "b3", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e6", "name": "Aperturas en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pecho en el centro." },
          { "id": "e7", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Sube con los codos, sin balanceo." },
          { "id": "e8", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo en cada repeticion." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w2", "name": "Tiron", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general de la espalda." },
          { "id": "e11", "name": "Colgarse de la barra", "type": "Compound", "sets": "2", "reps": "20s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Decompresion y activacion del agarre." }
        ]},
        { "id": "b6", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e12", "name": "Dominadas", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Lleva el pecho a la barra." },
          { "id": "e13", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso a 45 grados, tira al ombligo." },
          { "id": "e14", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pecho alto, no encojas los hombros." }
        ]},
        { "id": "b7", "name": "Espalda Alta y Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Trabaja el deltoides posterior." },
          { "id": "e16", "name": "Curl con barra", "type": "Isolation", "sets": "4", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e17", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Agarre neutro, sin balanceo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Estiramiento de dorsal colgado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja la espalda y respira hondo." }
        ]}
      ]},
      { "id": "w3", "name": "Pierna", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e20", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Calienta cadera y rodillas." }
        ]},
        { "id": "b10", "name": "Cuadriceps y Femoral", "type": "main", "exercises": [
          { "id": "e21", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa, rodillas alineadas." },
          { "id": "e22", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadera atras, barra pegada a la pierna." },
          { "id": "e23", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No bloquees las rodillas arriba." }
        ]},
        { "id": "b11", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e24", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e25", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae el isquio arriba." },
          { "id": "e26", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w4", "name": "Empuje (Volumen)", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e28", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e29", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Prepara hombros y manguito." }
        ]},
        { "id": "b14", "name": "Pecho y Hombro", "type": "main", "exercises": [
          { "id": "e30", "name": "Press inclinado con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Enfasis en el pectoral superior." },
          { "id": "e31", "name": "Press de pecho en maquina", "type": "Compound", "sets": "4", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pecho al final del recorrido." },
          { "id": "e32", "name": "Press Arnold con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Rota las mancuernas durante el empuje." }
        ]},
        { "id": "b15", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e33", "name": "Elevaciones laterales en polea", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Tension constante en el deltoides." },
          { "id": "e34", "name": "Press frances con barra Z", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos, estira el triceps." },
          { "id": "e35", "name": "Fondos en paralelas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco vertical para enfatizar el triceps." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e36", "name": "Estiramiento de triceps sobre cabeza", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un brazo cada vez, suave." }
        ]}
      ]},
      { "id": "w5", "name": "Tiron (Volumen)", "blocks": [
        { "id": "b17", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e37", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e38", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Prepara espalda alta." }
        ]},
        { "id": "b18", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e39", "name": "Jalon al pecho", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Lleva la barra al pecho con control." },
          { "id": "e40", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Apoya la mano libre en el banco." },
          { "id": "e41", "name": "Pullover en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el dorsal." }
        ]},
        { "id": "b19", "name": "Espalda Alta y Biceps", "type": "main", "exercises": [
          { "id": "e42", "name": "Encogimientos con mancuernas", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa arriba apretando el trapecio." },
          { "id": "e43", "name": "Curl inclinado con mancuernas", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el biceps abajo." },
          { "id": "e44", "name": "Curl concentrado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contraccion maxima en el pico." }
        ]},
        { "id": "b20", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e45", "name": "Estiramiento de dorsal colgado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja la espalda y respira hondo." }
        ]}
      ]},
      { "id": "w6", "name": "Pierna (Volumen)", "blocks": [
        { "id": "b21", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e46", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e47", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa gluteo y cuadriceps." }
        ]},
        { "id": "b22", "name": "Femoral y Gluteo", "type": "main", "exercises": [
          { "id": "e48", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pausa arriba apretando el gluteo." },
          { "id": "e49", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco ligeramente adelantado." },
          { "id": "e50", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte en el tope." }
        ]},
        { "id": "b23", "name": "Cuadriceps y Gemelo", "type": "main", "exercises": [
          { "id": "e51", "name": "Sentadilla hack", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Recorrido completo y controlado." },
          { "id": "e52", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e53", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Estira bien abajo." }
        ]},
        { "id": "b24", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e54", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo y la cadera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5", "saturday": "w6" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hypertrophy_ppl',
  'Push/Pull/Legs Hypertrophy',
  '6-day PPL routine with high volume and 8-15 rep ranges taken close to failure to maximize hypertrophy.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Push/Pull/Legs Hypertrophy",
    "level": "Advanced",
    "focus": "Hypertrophy",
    "frequency": 6,
    "duration": 70,
    "description": "6-day PPL routine with high volume and 8-15 rep ranges taken close to failure to maximize hypertrophy.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b2", "name": "Chest and Shoulders", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Retract scapulae, control the descent." },
          { "id": "e4", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep chest stretch on the eccentric." },
          { "id": "e5", "name": "Seated Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full range without slamming the lockout." }
        ]},
        { "id": "b3", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e6", "name": "Cable Fly", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest at the center." },
          { "id": "e7", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lead with the elbows, no swinging." },
          { "id": "e8", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow each rep." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w2", "name": "Pull", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General back activation." },
          { "id": "e11", "name": "Bar Hang", "type": "Compound", "sets": "2", "reps": "20s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Decompression and grip activation." }
        ]},
        { "id": "b6", "name": "Back", "type": "main", "exercises": [
          { "id": "e12", "name": "Pull-Up", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Bring the chest to the bar." },
          { "id": "e13", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso at 45 degrees, pull to the navel." },
          { "id": "e14", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Chest tall, do not shrug the shoulders." }
        ]},
        { "id": "b7", "name": "Upper Back and Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Work the rear delts." },
          { "id": "e16", "name": "Barbell Curl", "type": "Isolation", "sets": "4", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." },
          { "id": "e17", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Neutral grip, no swinging." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Hanging Lat Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the back and breathe deep." }
        ]}
      ]},
      { "id": "w3", "name": "Legs", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e20", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Warm up hips and knees." }
        ]},
        { "id": "b10", "name": "Quads and Hamstrings", "type": "main", "exercises": [
          { "id": "e21", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth, knees tracking the toes." },
          { "id": "e22", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hips back, bar close to the legs." },
          { "id": "e23", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Do not lock the knees at the top." }
        ]},
        { "id": "b11", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e24", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e25", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the hamstring at the top." },
          { "id": "e26", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range, pause at the bottom." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w4", "name": "Push (Volume)", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e28", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e29", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b14", "name": "Chest and Shoulders", "type": "main", "exercises": [
          { "id": "e30", "name": "Incline Barbell Press", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Emphasis on the upper chest." },
          { "id": "e31", "name": "Machine Chest Press", "type": "Compound", "sets": "4", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest at the end of the range." },
          { "id": "e32", "name": "Dumbbell Arnold Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Rotate the dumbbells through the press." }
        ]},
        { "id": "b15", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e33", "name": "Cable Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Constant tension on the delt." },
          { "id": "e34", "name": "EZ-Bar Skullcrusher", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Fixed elbows, stretch the triceps." },
          { "id": "e35", "name": "Parallel Bar Dips", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Upright torso to emphasize the triceps." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e36", "name": "Overhead Triceps Stretch", "type": "Isolation", "sets": "2", "reps": "25s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One arm at a time, gentle." }
        ]}
      ]},
      { "id": "w5", "name": "Pull (Volume)", "blocks": [
        { "id": "b17", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e37", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e38", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime the upper back." }
        ]},
        { "id": "b18", "name": "Back", "type": "main", "exercises": [
          { "id": "e39", "name": "Lat Pulldown", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Bring the bar to the chest with control." },
          { "id": "e40", "name": "Single-Arm Dumbbell Row", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Support the free hand on the bench." },
          { "id": "e41", "name": "Cable Pullover", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep lat stretch." }
        ]},
        { "id": "b19", "name": "Upper Back and Biceps", "type": "main", "exercises": [
          { "id": "e42", "name": "Dumbbell Shrug", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pause at the top, squeeze the traps." },
          { "id": "e43", "name": "Incline Dumbbell Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep biceps stretch at the bottom." },
          { "id": "e44", "name": "Concentration Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Maximal peak contraction." }
        ]},
        { "id": "b20", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e45", "name": "Hanging Lat Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the back and breathe deep." }
        ]}
      ]},
      { "id": "w6", "name": "Legs (Volume)", "blocks": [
        { "id": "b21", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e46", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e47", "name": "Bodyweight Walking Lunge", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b22", "name": "Hamstrings and Glutes", "type": "main", "exercises": [
          { "id": "e48", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pause at the top squeezing the glutes." },
          { "id": "e49", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Slight forward torso lean." },
          { "id": "e50", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the top." }
        ]},
        { "id": "b23", "name": "Quads and Calves", "type": "main", "exercises": [
          { "id": "e51", "name": "Hack Squat", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full, controlled range of motion." },
          { "id": "e52", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e53", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Get a deep stretch at the bottom." }
        ]},
        { "id": "b24", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e54", "name": "Figure-4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5", "saturday": "w6" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 6. twf_powerlifting  |  Powerlifting Strength (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_powerlifting',
  'Fuerza para Powerlifting',
  'Programa de 4 dias centrado en sentadilla, press de banca y peso muerto con series pesadas en rampa y descansos largos.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "Fuerza para Powerlifting",
    "level": "Advanced",
    "focus": "Fuerza maxima",
    "frequency": 4,
    "duration": 80,
    "description": "Programa de 4 dias centrado en sentadilla, press de banca y peso muerto con series pesadas en rampa y descansos largos.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Sentadilla Pesada", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular suave." },
          { "id": "e2", "name": "Movilidad de cadera y tobillo", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Prepara las articulaciones para cargas altas." },
          { "id": "e3", "name": "Sentadilla con barra vacia", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Ligero", "tempo": null, "notes": "Rampa de aproximacion ligera al peso de trabajo." }
        ]},
        { "id": "b2", "name": "Levantamiento Principal", "type": "main", "exercises": [
          { "id": "e4", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "3", "rir": "1", "rest": "240s", "intensity": "75-90% 1RM", "tempo": "2-1-X", "notes": "Series en rampa hasta un triple pesado.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "4", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "80% 1RM", "rest": "210s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "240s" },
            { "set": 4, "reps": "3", "rir": "1", "intensity": "88% 1RM", "rest": "240s" },
            { "set": 5, "reps": "3", "rir": "1", "intensity": "90% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Accesorios de Fuerza", "type": "main", "exercises": [
          { "id": "e5", "name": "Sentadilla con pausa", "type": "Compound", "sets": "3", "reps": "5", "rir": "2", "rest": "180s", "intensity": "70% 1RM", "tempo": "2-3-1", "notes": "Tres segundos de pausa en el fondo." },
          { "id": "e6", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen accesorio para cuadriceps." },
          { "id": "e7", "name": "Plancha con peso", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Refuerza el core anti-extension." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez tras el trabajo pesado." }
        ]}
      ]},
      { "id": "w2", "name": "Press de Banca Pesado", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e10", "name": "Aperturas con banda", "type": "Isolation", "sets": "3", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta hombros y manguito rotador." },
          { "id": "e11", "name": "Press de banca con barra vacia", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Ligero", "tempo": null, "notes": "Rampa de aproximacion." }
        ]},
        { "id": "b6", "name": "Levantamiento Principal", "type": "main", "exercises": [
          { "id": "e12", "name": "Press de banca con barra", "type": "Compound", "sets": "5", "reps": "3", "rir": "1", "rest": "240s", "intensity": "75-90% 1RM", "tempo": "2-1-X", "notes": "Pausa en el pecho, series en rampa.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "4", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "80% 1RM", "rest": "210s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "240s" },
            { "set": 4, "reps": "3", "rir": "1", "intensity": "88% 1RM", "rest": "240s" },
            { "set": 5, "reps": "3", "rir": "1", "intensity": "90% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Accesorios de Fuerza", "type": "main", "exercises": [
          { "id": "e13", "name": "Press de banca cerrado", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Agarre cerrado para reforzar el bloqueo." },
          { "id": "e14", "name": "Press militar con barra", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar." },
          { "id": "e15", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el volumen de empuje con traccion." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w3", "name": "Peso Muerto Pesado", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular suave." },
          { "id": "e18", "name": "Puente de gluteo", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa la cadena posterior." },
          { "id": "e19", "name": "Peso muerto con barra vacia", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Ligero", "tempo": null, "notes": "Rampa de aproximacion al peso de trabajo." }
        ]},
        { "id": "b10", "name": "Levantamiento Principal", "type": "main", "exercises": [
          { "id": "e20", "name": "Peso muerto con barra", "type": "Compound", "sets": "5", "reps": "2", "rir": "1", "rest": "270s", "intensity": "78-92% 1RM", "tempo": "1-0-X", "notes": "Reset entre repeticiones, series en rampa.", "setDetails": [
            { "set": 1, "reps": "2", "rir": "4", "intensity": "78% 1RM", "rest": "210s" },
            { "set": 2, "reps": "2", "rir": "3", "intensity": "83% 1RM", "rest": "240s" },
            { "set": 3, "reps": "2", "rir": "2", "intensity": "87% 1RM", "rest": "270s" },
            { "set": 4, "reps": "2", "rir": "1", "intensity": "90% 1RM", "rest": "270s" },
            { "set": 5, "reps": "2", "rir": "1", "intensity": "92% 1RM", "rest": "270s" }
          ]}
        ]},
        { "id": "b11", "name": "Accesorios de Fuerza", "type": "main", "exercises": [
          { "id": "e21", "name": "Peso muerto deficit", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "180s", "intensity": "70% 1RM", "tempo": "2-0-1", "notes": "Refuerza la fuerza desde el suelo." },
          { "id": "e22", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Volumen para isquios y gluteo." },
          { "id": "e23", "name": "Dominadas lastradas", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Fuerza de espalda para sostener la barra." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w4", "name": "Volumen y Tecnica", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e26", "name": "Movilidad dinamica", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Prepara cadera, hombros y tronco." }
        ]},
        { "id": "b14", "name": "Trabajo de Volumen", "type": "main", "exercises": [
          { "id": "e27", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "180s", "intensity": "70-75% 1RM", "tempo": "2-0-1", "notes": "Series rectas enfocadas en la tecnica.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "3", "intensity": "70% 1RM", "rest": "180s" },
            { "set": 2, "reps": "5", "rir": "3", "intensity": "72% 1RM", "rest": "180s" },
            { "set": 3, "reps": "5", "rir": "3", "intensity": "74% 1RM", "rest": "180s" },
            { "set": 4, "reps": "5", "rir": "2", "intensity": "75% 1RM", "rest": "180s" }
          ]},
          { "id": "e28", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "150s", "intensity": "70-75% 1RM", "tempo": "2-1-1", "notes": "Series rectas con pausa controlada en el pecho." },
          { "id": "e29", "name": "Peso muerto con barra", "type": "Compound", "sets": "3", "reps": "5", "rir": "3", "rest": "180s", "intensity": "70% 1RM", "tempo": "1-0-1", "notes": "Tecnica perfecta a velocidad de barra rapida." }
        ]},
        { "id": "b15", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e30", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Refuerza el bloqueo de cadera." },
          { "id": "e31", "name": "Face pull en polea", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "1-1-1", "notes": "Salud de hombros y espalda alta." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo y la cadera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_powerlifting',
  'Powerlifting Strength',
  '4-day program centered on the squat, bench press and deadlift with heavy ramping sets and long rest periods.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "Powerlifting Strength",
    "level": "Advanced",
    "focus": "Maximal strength",
    "frequency": 4,
    "duration": 80,
    "description": "4-day program centered on the squat, bench press and deadlift with heavy ramping sets and long rest periods.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Heavy Squat", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gentle cardiovascular activation." },
          { "id": "e2", "name": "Hip and Ankle Mobility", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Prepare the joints for heavy loads." },
          { "id": "e3", "name": "Empty Bar Squat", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Light", "tempo": null, "notes": "Light approach ramp to working weight." }
        ]},
        { "id": "b2", "name": "Main Lift", "type": "main", "exercises": [
          { "id": "e4", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "3", "rir": "1", "rest": "240s", "intensity": "75-90% 1RM", "tempo": "2-1-X", "notes": "Ramping sets up to a heavy triple.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "4", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "80% 1RM", "rest": "210s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "240s" },
            { "set": 4, "reps": "3", "rir": "1", "intensity": "88% 1RM", "rest": "240s" },
            { "set": 5, "reps": "3", "rir": "1", "intensity": "90% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Strength Accessories", "type": "main", "exercises": [
          { "id": "e5", "name": "Paused Squat", "type": "Compound", "sets": "3", "reps": "5", "rir": "2", "rest": "180s", "intensity": "70% 1RM", "tempo": "2-3-1", "notes": "Three-second pause in the hole." },
          { "id": "e6", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Accessory volume for the quads." },
          { "id": "e7", "name": "Weighted Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Reinforce the anti-extension core." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time after heavy work." }
        ]}
      ]},
      { "id": "w2", "name": "Heavy Bench Press", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e10", "name": "Band Pull-Apart", "type": "Isolation", "sets": "3", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up shoulders and rotator cuff." },
          { "id": "e11", "name": "Empty Bar Bench Press", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Light", "tempo": null, "notes": "Approach ramp." }
        ]},
        { "id": "b6", "name": "Main Lift", "type": "main", "exercises": [
          { "id": "e12", "name": "Barbell Bench Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "1", "rest": "240s", "intensity": "75-90% 1RM", "tempo": "2-1-X", "notes": "Pause on the chest, ramping sets.", "setDetails": [
            { "set": 1, "reps": "3", "rir": "4", "intensity": "75% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "3", "intensity": "80% 1RM", "rest": "210s" },
            { "set": 3, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "240s" },
            { "set": 4, "reps": "3", "rir": "1", "intensity": "88% 1RM", "rest": "240s" },
            { "set": 5, "reps": "3", "rir": "1", "intensity": "90% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Strength Accessories", "type": "main", "exercises": [
          { "id": "e13", "name": "Close-Grip Bench Press", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Close grip to reinforce the lockout." },
          { "id": "e14", "name": "Barbell Overhead Press", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Brace the core, no lumbar arch." },
          { "id": "e15", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance push volume with pulling." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w3", "name": "Heavy Deadlift", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gentle cardiovascular activation." },
          { "id": "e18", "name": "Glute Bridge", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the posterior chain." },
          { "id": "e19", "name": "Empty Bar Deadlift", "type": "Compound", "sets": "3", "reps": "5", "rir": null, "rest": "60s", "intensity": "Light", "tempo": null, "notes": "Approach ramp to working weight." }
        ]},
        { "id": "b10", "name": "Main Lift", "type": "main", "exercises": [
          { "id": "e20", "name": "Barbell Deadlift", "type": "Compound", "sets": "5", "reps": "2", "rir": "1", "rest": "270s", "intensity": "78-92% 1RM", "tempo": "1-0-X", "notes": "Reset between reps, ramping sets.", "setDetails": [
            { "set": 1, "reps": "2", "rir": "4", "intensity": "78% 1RM", "rest": "210s" },
            { "set": 2, "reps": "2", "rir": "3", "intensity": "83% 1RM", "rest": "240s" },
            { "set": 3, "reps": "2", "rir": "2", "intensity": "87% 1RM", "rest": "270s" },
            { "set": 4, "reps": "2", "rir": "1", "intensity": "90% 1RM", "rest": "270s" },
            { "set": 5, "reps": "2", "rir": "1", "intensity": "92% 1RM", "rest": "270s" }
          ]}
        ]},
        { "id": "b11", "name": "Strength Accessories", "type": "main", "exercises": [
          { "id": "e21", "name": "Deficit Deadlift", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "180s", "intensity": "70% 1RM", "tempo": "2-0-1", "notes": "Reinforce strength off the floor." },
          { "id": "e22", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Volume for hamstrings and glutes." },
          { "id": "e23", "name": "Weighted Pull-Up", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back strength to hold the bar." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w4", "name": "Volume and Technique", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e26", "name": "Dynamic Mobility", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Prepare hips, shoulders and trunk." }
        ]},
        { "id": "b14", "name": "Volume Work", "type": "main", "exercises": [
          { "id": "e27", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "180s", "intensity": "70-75% 1RM", "tempo": "2-0-1", "notes": "Straight sets focused on technique.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "3", "intensity": "70% 1RM", "rest": "180s" },
            { "set": 2, "reps": "5", "rir": "3", "intensity": "72% 1RM", "rest": "180s" },
            { "set": 3, "reps": "5", "rir": "3", "intensity": "74% 1RM", "rest": "180s" },
            { "set": 4, "reps": "5", "rir": "2", "intensity": "75% 1RM", "rest": "180s" }
          ]},
          { "id": "e28", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "150s", "intensity": "70-75% 1RM", "tempo": "2-1-1", "notes": "Straight sets with a controlled chest pause." },
          { "id": "e29", "name": "Barbell Deadlift", "type": "Compound", "sets": "3", "reps": "5", "rir": "3", "rest": "180s", "intensity": "70% 1RM", "tempo": "1-0-1", "notes": "Perfect technique at fast bar speed." }
        ]},
        { "id": "b15", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e30", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Reinforce the hip lockout." },
          { "id": "e31", "name": "Cable Face Pull", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "1-1-1", "notes": "Shoulder and upper-back health." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Figure-4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 7. twf_strength_5x5  |  5x5 Strength (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_strength_5x5',
  'Fuerza 5x5',
  'Programa clasico de fuerza de 3 dias con series rectas de 5x5 en los basicos para progresar de forma lineal.',
  'Intermediate',
  'Strength 5x5',
  3,
  '{
    "name": "Fuerza 5x5",
    "level": "Intermediate",
    "focus": "Fuerza",
    "frequency": 3,
    "duration": 60,
    "description": "Programa clasico de fuerza de 3 dias con series rectas de 5x5 en los basicos para progresar de forma lineal.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Entreno A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular suave." },
          { "id": "e2", "name": "Sentadilla con barra vacia", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Ligero", "tempo": null, "notes": "Aproximacion progresiva al peso de trabajo." },
          { "id": "e3", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito rotador." }
        ]},
        { "id": "b2", "name": "Levantamientos Principales", "type": "main", "exercises": [
          { "id": "e4", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, mismo peso en las 5 series." },
          { "id": "e5", "name": "Press de banca con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, controla la bajada al pecho." },
          { "id": "e6", "name": "Remo con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, torso a 45 grados." }
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e7", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Core firme para sostener los basicos." },
          { "id": "e8", "name": "Curl con mancuernas", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo accesorio de brazo." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de cuadriceps de pie", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez, sin rebotes." }
        ]}
      ]},
      { "id": "w2", "name": "Entreno B", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e11", "name": "Peso muerto con barra vacia", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Ligero", "tempo": null, "notes": "Aproximacion al peso de trabajo." },
          { "id": "e12", "name": "Movilidad de cadera", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Prepara la cadera para el peso muerto." }
        ]},
        { "id": "b6", "name": "Levantamientos Principales", "type": "main", "exercises": [
          { "id": "e13", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, mismo peso en las 5 series." },
          { "id": "e14", "name": "Press militar con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, core firme sin arquear." },
          { "id": "e15", "name": "Peso muerto con barra", "type": "Compound", "sets": "1", "reps": "5", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Una serie pesada de 5 tras aproximacion." }
        ]},
        { "id": "b7", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e16", "name": "Dominadas asistidas", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen de traccion para la espalda." },
          { "id": "e17", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo accesorio de triceps." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Entreno C", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e20", "name": "Press de banca con barra vacia", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Ligero", "tempo": null, "notes": "Aproximacion al peso de trabajo." },
          { "id": "e21", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito rotador." }
        ]},
        { "id": "b10", "name": "Levantamientos Principales", "type": "main", "exercises": [
          { "id": "e22", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, mismo peso en las 5 series." },
          { "id": "e23", "name": "Press de banca con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, controla la bajada al pecho." },
          { "id": "e24", "name": "Remo con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Series rectas, torso a 45 grados." }
        ]},
        { "id": "b11", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e25", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." },
          { "id": "e26", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Agarre neutro, sin balanceo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_strength_5x5',
  '5x5 Strength',
  'Classic 3-day strength program with straight 5x5 sets on the big lifts for linear progression.',
  'Intermediate',
  'Strength 5x5',
  3,
  '{
    "name": "5x5 Strength",
    "level": "Intermediate",
    "focus": "Strength",
    "frequency": 3,
    "duration": 60,
    "description": "Classic 3-day strength program with straight 5x5 sets on the big lifts for linear progression.",
    "schedule": ["M", null, "T", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Workout A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Gentle cardiovascular activation." },
          { "id": "e2", "name": "Empty Bar Squat", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Light", "tempo": null, "notes": "Progressive approach to working weight." },
          { "id": "e3", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b2", "name": "Main Lifts", "type": "main", "exercises": [
          { "id": "e4", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, same weight across all 5." },
          { "id": "e5", "name": "Barbell Bench Press", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, control the descent to the chest." },
          { "id": "e6", "name": "Barbell Row", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, torso at 45 degrees." }
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e7", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Brace the core to support the big lifts." },
          { "id": "e8", "name": "Dumbbell Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Accessory arm work." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Standing Quad Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time, no bouncing." }
        ]}
      ]},
      { "id": "w2", "name": "Workout B", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e11", "name": "Empty Bar Deadlift", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Light", "tempo": null, "notes": "Approach to working weight." },
          { "id": "e12", "name": "Hip Mobility", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Prepare the hips for the deadlift." }
        ]},
        { "id": "b6", "name": "Main Lifts", "type": "main", "exercises": [
          { "id": "e13", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, same weight across all 5." },
          { "id": "e14", "name": "Barbell Overhead Press", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, brace the core, no arching." },
          { "id": "e15", "name": "Barbell Deadlift", "type": "Compound", "sets": "1", "reps": "5", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "One heavy set of 5 after the approach." }
        ]},
        { "id": "b7", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e16", "name": "Assisted Pull-Up", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pulling volume for the back." },
          { "id": "e17", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Accessory triceps work." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Workout C", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e20", "name": "Empty Bar Bench Press", "type": "Compound", "sets": "2", "reps": "5", "rir": null, "rest": "45s", "intensity": "Light", "tempo": null, "notes": "Approach to working weight." },
          { "id": "e21", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b10", "name": "Main Lifts", "type": "main", "exercises": [
          { "id": "e22", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, same weight across all 5." },
          { "id": "e23", "name": "Barbell Bench Press", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, control the descent to the chest." },
          { "id": "e24", "name": "Barbell Row", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Straight sets, torso at 45 degrees." }
        ]},
        { "id": "b11", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e25", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range, pause at the bottom." },
          { "id": "e26", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Neutral grip, no swinging." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 8. twf_upper_lower  |  Upper/Lower Split (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_upper_lower',
  'Rutina Torso/Pierna',
  'Rutina equilibrada torso/pierna de 4 dias que combina fuerza en los basicos con volumen de hipertrofia.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Rutina Torso/Pierna",
    "level": "Intermediate",
    "focus": "Fuerza e hipertrofia",
    "frequency": 4,
    "duration": 60,
    "description": "Rutina equilibrada torso/pierna de 4 dias que combina fuerza en los basicos con volumen de hipertrofia.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso Fuerza", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito rotador." }
        ]},
        { "id": "b2", "name": "Empuje y Traccion Pesados", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "5-6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Enfasis en fuerza, controla la bajada." },
          { "id": "e4", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso a 45 grados, tira al ombligo." },
          { "id": "e5", "name": "Press militar con barra", "type": "Compound", "sets": "3", "reps": "6-8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar." }
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e6", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lleva la barra al pecho con control." },
          { "id": "e7", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e8", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo en cada repeticion." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna Fuerza", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e11", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Calienta cadera y rodillas." }
        ]},
        { "id": "b6", "name": "Patrones Pesados", "type": "main", "exercises": [
          { "id": "e12", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "5-6", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Profundidad completa, rodillas alineadas." },
          { "id": "e13", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadera atras, barra pegada a la pierna." },
          { "id": "e14", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No bloquees las rodillas arriba." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e15", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae el isquio arriba." },
          { "id": "e16", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Torso Hipertrofia", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca." },
          { "id": "e19", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Prepara hombros y espalda alta." }
        ]},
        { "id": "b10", "name": "Pecho y Espalda", "type": "main", "exercises": [
          { "id": "e20", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el pectoral en la excentrica." },
          { "id": "e21", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pecho alto, no encojas los hombros." },
          { "id": "e22", "name": "Aperturas en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pecho en el centro." }
        ]},
        { "id": "b11", "name": "Hombros y Brazos", "type": "main", "exercises": [
          { "id": "e23", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Sube con los codos, sin balanceo." },
          { "id": "e24", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Agarre neutro, sin balanceo." },
          { "id": "e25", "name": "Press frances con barra Z", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos, estira el triceps." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e26", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave en cada lado." }
        ]}
      ]},
      { "id": "w4", "name": "Pierna Hipertrofia", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e27", "name": "Bicicleta estatica", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Activacion cardiovascular." },
          { "id": "e28", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa gluteo y cuadriceps." }
        ]},
        { "id": "b14", "name": "Femoral y Gluteo", "type": "main", "exercises": [
          { "id": "e29", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pausa arriba apretando el gluteo." },
          { "id": "e30", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco ligeramente adelantado." },
          { "id": "e31", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte en el tope." }
        ]},
        { "id": "b15", "name": "Cuadriceps y Gemelo", "type": "main", "exercises": [
          { "id": "e32", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e33", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Estira bien abajo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e34", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo y la cadera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_upper_lower',
  'Upper/Lower Split',
  'Balanced 4-day upper/lower routine combining strength on the big lifts with hypertrophy volume.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Upper/Lower Split",
    "level": "Intermediate",
    "focus": "Strength and hypertrophy",
    "frequency": 4,
    "duration": 60,
    "description": "Balanced 4-day upper/lower routine combining strength on the big lifts with hypertrophy volume.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Upper Strength", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "4min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "General activation." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and rotator cuff." }
        ]},
        { "id": "b2", "name": "Heavy Push and Pull", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "5-6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Strength emphasis, control the descent." },
          { "id": "e4", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso at 45 degrees, pull to the navel." },
          { "id": "e5", "name": "Barbell Overhead Press", "type": "Compound", "sets": "3", "reps": "6-8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Brace the core, no lumbar arch." }
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e6", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Bring the bar to the chest with control." },
          { "id": "e7", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." },
          { "id": "e8", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow each rep." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w2", "name": "Lower Strength", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e11", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Warm up hips and knees." }
        ]},
        { "id": "b6", "name": "Heavy Patterns", "type": "main", "exercises": [
          { "id": "e12", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "5-6", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full depth, knees tracking the toes." },
          { "id": "e13", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hips back, bar close to the legs." },
          { "id": "e14", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Do not lock the knees at the top." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e15", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the hamstring at the top." },
          { "id": "e16", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range, pause at the bottom." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Lying Hamstring Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Upper Hypertrophy", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate." },
          { "id": "e19", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime shoulders and upper back." }
        ]},
        { "id": "b10", "name": "Chest and Back", "type": "main", "exercises": [
          { "id": "e20", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep chest stretch on the eccentric." },
          { "id": "e21", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Chest tall, do not shrug the shoulders." },
          { "id": "e22", "name": "Cable Fly", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest at the center." }
        ]},
        { "id": "b11", "name": "Shoulders and Arms", "type": "main", "exercises": [
          { "id": "e23", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lead with the elbows, no swinging." },
          { "id": "e24", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Neutral grip, no swinging." },
          { "id": "e25", "name": "EZ-Bar Skullcrusher", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Fixed elbows, stretch the triceps." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e26", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w4", "name": "Lower Hypertrophy", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e27", "name": "Stationary Bike", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Cardiovascular activation." },
          { "id": "e28", "name": "Bodyweight Walking Lunge", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b14", "name": "Hamstrings and Glutes", "type": "main", "exercises": [
          { "id": "e29", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pause at the top squeezing the glutes." },
          { "id": "e30", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Slight forward torso lean." },
          { "id": "e31", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the top." }
        ]},
        { "id": "b15", "name": "Quads and Calves", "type": "main", "exercises": [
          { "id": "e32", "name": "Leg Extension", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e33", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Get a deep stretch at the bottom." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e34", "name": "Figure-4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();
