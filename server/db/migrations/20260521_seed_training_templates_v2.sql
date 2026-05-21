-- ============================================================================
-- Migration: 20260521_seed_training_templates_v2.sql
-- Seeds 20 fully-developed, exercise-science-sound training templates into
-- public.training_templates. Each template is inserted TWICE: once in Spanish
-- ('es') and once in English ('en'), sharing the same `key`. The UNIQUE
-- constraint is (key, language) -> 40 rows total.
--
-- Categories:
--   Gym/strength (8): twf_gym_hypertrophy_ul, twf_gym_ppl,
--     twf_gym_fullbody_beginner, twf_gym_strength_531, twf_gym_powerbuilding,
--     twf_gym_glute_focus, twf_gym_fat_loss, twf_gym_arms_priority
--   CrossFit/functional (4): twf_crossfit_wod_classic, twf_crossfit_engine,
--     twf_crossfit_strength_skill, twf_functional_athletic
--   Bodyweight/calisthenics (3): twf_calisthenics_foundations,
--     twf_calisthenics_skills, twf_home_no_equipment
--   Endurance/conditioning (2): twf_running_5k, twf_hiit_conditioning
--   Other modalities (3): twf_mobility_recovery, twf_kettlebell_complex,
--     twf_hyrox_prep
--
-- Idempotent via ON CONFLICT (key, language) DO UPDATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. twf_gym_hypertrophy_ul  |  Upper/Lower Hypertrophy (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_hypertrophy_ul',
  'Hipertrofia Torso/Pierna',
  'Rutina torso/pierna de 4 dias para maximizar el crecimiento muscular con volumen moderado-alto y trabajo cercano al fallo.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Hipertrofia Torso/Pierna",
    "level": "Intermediate",
    "focus": "Hipertrofia",
    "frequency": 4,
    "duration": 65,
    "description": "Rutina torso/pierna de 4 dias para maximizar el crecimiento muscular con volumen moderado-alto y trabajo cercano al fallo.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca de forma progresiva." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta y los manguitos rotadores." }
        ]},
        { "id": "b2", "name": "Pecho y Espalda", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Escapulas retraidas, controla la bajada." },
          { "id": "e4", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso a 45 grados, tira hacia el ombligo." },
          { "id": "e5", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el pectoral en la fase excentrica." }
        ]},
        { "id": "b3", "name": "Hombros y Brazos", "type": "main", "exercises": [
          { "id": "e6", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Sube con los codos, sin balanceo." },
          { "id": "e7", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e8", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo en cada repeticion." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna A", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Calienta cadera y rodillas." },
          { "id": "e11", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global previa." }
        ]},
        { "id": "b6", "name": "Cuadriceps y Femoral", "type": "main", "exercises": [
          { "id": "e12", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa, rodillas alineadas." },
          { "id": "e13", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadera atras, barra pegada a la pierna." },
          { "id": "e14", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No bloquees las rodillas arriba." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e15", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae el isquio arriba." },
          { "id": "e16", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "No rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Torso B", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Espalda y Pecho", "type": "main", "exercises": [
          { "id": "e19", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Lleva el pecho a la barra." },
          { "id": "e20", "name": "Press de pecho en maquina", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pecho al final del recorrido." },
          { "id": "e21", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pecho alto, no encojas los hombros." }
        ]},
        { "id": "b11", "name": "Hombros y Brazos", "type": "main", "exercises": [
          { "id": "e22", "name": "Press de hombro con mancuernas sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Recorrido completo sin bloquear de golpe." },
          { "id": "e23", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Trabaja el deltoides posterior." },
          { "id": "e24", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Agarre neutro, sin balanceo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave en cada lado." }
        ]}
      ]},
      { "id": "w4", "name": "Pierna B", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activacion de gluteo y cuadriceps." }
        ]},
        { "id": "b14", "name": "Femoral y Gluteo", "type": "main", "exercises": [
          { "id": "e27", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pausa arriba apretando el gluteo." },
          { "id": "e28", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco ligeramente adelantado." },
          { "id": "e29", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte en el tope." }
        ]},
        { "id": "b15", "name": "Cuadriceps y Gemelo", "type": "main", "exercises": [
          { "id": "e30", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e31", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Estira bien abajo." }
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
  'twf_gym_hypertrophy_ul',
  'Upper/Lower Hypertrophy',
  '4-day upper/lower split built to maximize muscle growth with moderate-high volume and sets taken close to failure.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Upper/Lower Hypertrophy",
    "level": "Intermediate",
    "focus": "Hypertrophy",
    "frequency": 4,
    "duration": 65,
    "description": "4-day upper/lower split built to maximize muscle growth with moderate-high volume and sets taken close to failure.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Upper A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate progressively." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime upper back and rotator cuff." }
        ]},
        { "id": "b2", "name": "Chest and Back", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Retract scapulae, control the descent." },
          { "id": "e4", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso at 45 degrees, pull to the navel." },
          { "id": "e5", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep chest stretch on the eccentric." }
        ]},
        { "id": "b3", "name": "Shoulders and Arms", "type": "main", "exercises": [
          { "id": "e6", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lead with the elbows, no swinging." },
          { "id": "e7", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." },
          { "id": "e8", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow each rep." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w2", "name": "Lower A", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Warm up hips and knees." },
          { "id": "e11", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility prep." }
        ]},
        { "id": "b6", "name": "Quads and Hamstrings", "type": "main", "exercises": [
          { "id": "e12", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth, knees tracking over toes." },
          { "id": "e13", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hips back, bar close to the legs." },
          { "id": "e14", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Do not lock the knees at the top." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e15", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the hamstring at the top." },
          { "id": "e16", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range, pause at the bottom." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Upper B", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Back and Chest", "type": "main", "exercises": [
          { "id": "e19", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Drive the chest to the bar." },
          { "id": "e20", "name": "Machine Chest Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest at the end of the range." },
          { "id": "e21", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tall chest, do not shrug." }
        ]},
        { "id": "b11", "name": "Shoulders and Arms", "type": "main", "exercises": [
          { "id": "e22", "name": "Seated Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full range, no abrupt lockout." },
          { "id": "e23", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Target the rear delts." },
          { "id": "e24", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Neutral grip, no swinging." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w4", "name": "Lower B", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b14", "name": "Hamstrings and Glutes", "type": "main", "exercises": [
          { "id": "e27", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pause at the top squeezing the glutes." },
          { "id": "e28", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Slight forward torso lean." },
          { "id": "e29", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the peak." }
        ]},
        { "id": "b15", "name": "Quads and Calves", "type": "main", "exercises": [
          { "id": "e30", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e31", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Get a good stretch at the bottom." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 2. twf_gym_ppl  |  Push / Pull / Legs (6 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_ppl',
  'Empuje / Tiron / Pierna',
  'Clasico Push/Pull/Legs de 6 dias, cada patron entrenado dos veces por semana para un volumen alto y crecimiento equilibrado.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Empuje / Tiron / Pierna",
    "level": "Advanced",
    "focus": "Hipertrofia",
    "frequency": 6,
    "duration": 70,
    "description": "Clasico Push/Pull/Legs de 6 dias, cada patron entrenado dos veces por semana para un volumen alto y crecimiento equilibrado.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Empuje", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros en ambos sentidos." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa el manguito rotador." }
        ]},
        { "id": "b2", "name": "Pecho", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo pesado, mantente solido." },
          { "id": "e4", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Enfoca el pectoral superior." },
          { "id": "e5", "name": "Cruce de poleas", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aprieta en la linea media." }
        ]},
        { "id": "b3", "name": "Hombros y Triceps", "type": "main", "exercises": [
          { "id": "e6", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar." },
          { "id": "e7", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Series largas, controla el peso." },
          { "id": "e8", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos quietos apuntando al techo." },
          { "id": "e9", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Separa la cuerda al final." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e10", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral suavemente." }
        ]}
      ]},
      { "id": "w2", "name": "Tiron", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e11", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b6", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e12", "name": "Dominada lastrada", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Recorrido completo, sin balanceo." },
          { "id": "e13", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda neutra, tira con los codos." },
          { "id": "e14", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lleva la barra al pecho alto." }
        ]},
        { "id": "b7", "name": "Deltoide posterior y Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aprieta los omoplatos." },
          { "id": "e16", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Sin impulso de cadera." },
          { "id": "e17", "name": "Curl martillo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Trabaja el braquial." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Alarga la columna y respira." }
        ]}
      ]},
      { "id": "w3", "name": "Pierna", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b10", "name": "Patron de fuerza", "type": "main", "exercises": [
          { "id": "e20", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Pesada y profunda." },
          { "id": "e21", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Estira el isquio en la bajada." }
        ]},
        { "id": "b11", "name": "Volumen", "type": "main", "exercises": [
          { "id": "e22", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pies a la anchura de hombros." },
          { "id": "e23", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte arriba." },
          { "id": "e24", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pausa arriba y abajo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w4", "name": "Empuje (Volumen)", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa los hombros." }
        ]},
        { "id": "b14", "name": "Pecho y Hombros", "type": "main", "exercises": [
          { "id": "e27", "name": "Press plano con mancuernas", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien abajo." },
          { "id": "e28", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pectoral." },
          { "id": "e29", "name": "Elevacion lateral en polea", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Tension constante." }
        ]},
        { "id": "b15", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e30", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira la cabeza larga." },
          { "id": "e31", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el pectoral." }
        ]}
      ]},
      { "id": "w5", "name": "Tiron (Volumen)", "blocks": [
        { "id": "b17", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e33", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b18", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e34", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lleva los codos atras." },
          { "id": "e35", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Rango completo por lado." },
          { "id": "e36", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira arriba del todo." }
        ]},
        { "id": "b19", "name": "Biceps y Deltoide posterior", "type": "main", "exercises": [
          { "id": "e37", "name": "Curl en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tension constante." },
          { "id": "e38", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Series largas para deltoide posterior." }
        ]},
        { "id": "b20", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e39", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w6", "name": "Pierna (Volumen)", "blocks": [
        { "id": "b21", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e40", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa gluteo y cuadriceps." }
        ]},
        { "id": "b22", "name": "Cuadriceps y Gluteo", "type": "main", "exercises": [
          { "id": "e41", "name": "Sentadilla hack", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "120s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Profundidad controlada." },
          { "id": "e42", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pausa apretando el gluteo." },
          { "id": "e43", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estabilidad ante todo." }
        ]},
        { "id": "b23", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e44", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e45", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Controla la fase negativa." },
          { "id": "e46", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b24", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e47", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
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
  'twf_gym_ppl',
  'Push / Pull / Legs',
  'Classic 6-day push/pull/legs split, training each pattern twice a week for high volume and balanced growth.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Push / Pull / Legs",
    "level": "Advanced",
    "focus": "Hypertrophy",
    "frequency": 6,
    "duration": 70,
    "description": "Classic 6-day push/pull/legs split, training each pattern twice a week for high volume and balanced growth.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize shoulders in both directions." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the rotator cuff." }
        ]},
        { "id": "b2", "name": "Chest", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Heavy work, stay tight." },
          { "id": "e4", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Target the upper chest." },
          { "id": "e5", "name": "Cable Chest Fly", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Squeeze at the midline." }
        ]},
        { "id": "b3", "name": "Shoulders and Triceps", "type": "main", "exercises": [
          { "id": "e6", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Firm core, no lower-back arch." },
          { "id": "e7", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Long sets, control the weight." },
          { "id": "e8", "name": "Skull Crushers", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows still pointing up." },
          { "id": "e9", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Spread the rope at the end." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e10", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest gently." }
        ]}
      ]},
      { "id": "w2", "name": "Pull", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e11", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b6", "name": "Back", "type": "main", "exercises": [
          { "id": "e12", "name": "Weighted Pull-Up", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full range, no swinging." },
          { "id": "e13", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Neutral spine, pull with the elbows." },
          { "id": "e14", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Bring the bar to the upper chest." }
        ]},
        { "id": "b7", "name": "Rear Delts and Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Squeeze the shoulder blades." },
          { "id": "e16", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No hip drive." },
          { "id": "e17", "name": "Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Work the brachialis." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the spine and breathe." }
        ]}
      ]},
      { "id": "w3", "name": "Legs", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b10", "name": "Strength Pattern", "type": "main", "exercises": [
          { "id": "e20", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Heavy and deep." },
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Stretch the hamstring on the way down." }
        ]},
        { "id": "b11", "name": "Volume", "type": "main", "exercises": [
          { "id": "e22", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Feet shoulder-width apart." },
          { "id": "e23", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the top." },
          { "id": "e24", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pause top and bottom." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w4", "name": "Push (Volume)", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the shoulders." }
        ]},
        { "id": "b14", "name": "Chest and Shoulders", "type": "main", "exercises": [
          { "id": "e27", "name": "Flat Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch well at the bottom." },
          { "id": "e28", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest." },
          { "id": "e29", "name": "Cable Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Constant tension." }
        ]},
        { "id": "b15", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e30", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch the long head." },
          { "id": "e31", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the chest." }
        ]}
      ]},
      { "id": "w5", "name": "Pull (Volume)", "blocks": [
        { "id": "b17", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e33", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b18", "name": "Back", "type": "main", "exercises": [
          { "id": "e34", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Drive the elbows back." },
          { "id": "e35", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full range per side." },
          { "id": "e36", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full stretch at the top." }
        ]},
        { "id": "b19", "name": "Biceps and Rear Delts", "type": "main", "exercises": [
          { "id": "e37", "name": "Cable Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Constant tension." },
          { "id": "e38", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Long sets for the rear delts." }
        ]},
        { "id": "b20", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e39", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w6", "name": "Legs (Volume)", "blocks": [
        { "id": "b21", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e40", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b22", "name": "Quads and Glutes", "type": "main", "exercises": [
          { "id": "e41", "name": "Hack Squat", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "120s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Controlled depth." },
          { "id": "e42", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pause squeezing the glutes." },
          { "id": "e43", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stability first." }
        ]},
        { "id": "b23", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e44", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e45", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Control the negative." },
          { "id": "e46", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b24", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e47", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5", "saturday": "w6" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 3. twf_gym_fullbody_beginner  |  Beginner Full Body (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fullbody_beginner',
  'Cuerpo Completo Principiante',
  'Programa de cuerpo completo de 3 dias para principiantes, centrado en aprender los patrones basicos con tecnica y progresion segura.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Cuerpo Completo Principiante",
    "level": "Beginner",
    "focus": "Fuerza general",
    "frequency": 3,
    "duration": 50,
    "description": "Programa de cuerpo completo de 3 dias para principiantes, centrado en aprender los patrones basicos con tecnica y progresion segura.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general del cuerpo." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Practica el patron de sentadilla." }
        ]},
        { "id": "b2", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioriza la tecnica sobre el peso." },
          { "id": "e4", "name": "Press de banca con mancuernas", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Codos a 45 grados del torso." },
          { "id": "e5", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Tira con la espalda, no con los brazos." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Gluteos y abdomen apretados." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna con calma." }
        ]}
      ]},
      { "id": "w2", "name": "Cuerpo Completo B", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Comba", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." },
          { "id": "e9", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." }
        ]},
        { "id": "b5", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e10", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Empuje firme con los talones." },
          { "id": "e11", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Lleva la barra al pecho alto." },
          { "id": "e12", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Sin arquear la espalda baja." },
          { "id": "e13", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "Peso corporal", "tempo": "2-1-1", "notes": "Aprieta el gluteo arriba." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w3", "name": "Cuerpo Completo C", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e15", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento suave." }
        ]},
        { "id": "b8", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e16", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Cadera atras, espalda recta." },
          { "id": "e17", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Recorrido completo." },
          { "id": "e18", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "75s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Apoyate bien en el banco." },
          { "id": "e19", "name": "Curl con mancuernas", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Sin balanceo." }
        ]},
        { "id": "b9", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave y mantenido." }
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
  'twf_gym_fullbody_beginner',
  'Beginner Full Body',
  '3-day full-body program for beginners, focused on learning the basic movement patterns with good technique and safe progression.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Beginner Full Body",
    "level": "Beginner",
    "focus": "General Strength",
    "frequency": 3,
    "duration": 50,
    "description": "3-day full-body program for beginners, focused on learning the basic movement patterns with good technique and safe progression.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General full-body activation." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Practice the squat pattern." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioritize technique over weight." },
          { "id": "e4", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Elbows at 45 degrees from the torso." },
          { "id": "e5", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Pull with the back, not the arms." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Glutes and abs braced." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine calmly." }
        ]}
      ]},
      { "id": "w2", "name": "Full Body B", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e9", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b5", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Drive firmly through the heels." },
          { "id": "e11", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Bring the bar to the upper chest." },
          { "id": "e12", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Do not arch the lower back." },
          { "id": "e13", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "Bodyweight", "tempo": "2-1-1", "notes": "Squeeze the glute at the top." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w3", "name": "Full Body C", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e15", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Gentle warm-up." }
        ]},
        { "id": "b8", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e16", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Hips back, flat back." },
          { "id": "e17", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Full range of motion." },
          { "id": "e18", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "75s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Brace well on the bench." },
          { "id": "e19", "name": "Dumbbell Curl", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "No swinging." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle and held." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 4. twf_gym_strength_531  |  5/3/1 Strength (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_strength_531',
  'Fuerza 5/3/1',
  'Programa de fuerza estilo 5/3/1 de 4 dias en torno a los cuatro grandes levantamientos, con series principales en rampa y trabajo accesorio.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "Fuerza 5/3/1",
    "level": "Advanced",
    "focus": "Fuerza maxima",
    "frequency": 4,
    "duration": 70,
    "description": "Programa de fuerza estilo 5/3/1 de 4 dias en torno a los cuatro grandes levantamientos, con series principales en rampa y trabajo accesorio.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Dia de Sentadilla", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b2", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Tres series en rampa, ultima al maximo de reps.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e4", "name": "Prensa de pierna", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen para cuadriceps." },
          { "id": "e5", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el isquio." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Core anti-extension." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Dia de Press de Banca", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito." }
        ]},
        { "id": "b6", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e9", "name": "Press de banca con barra", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-1-1", "notes": "Pausa breve en el pecho cada repeticion.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e10", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen para pectoral superior." },
          { "id": "e11", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el empuje con tiron." },
          { "id": "e12", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Apoyo al press." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral." }
        ]}
      ]},
      { "id": "w3", "name": "Dia de Peso Muerto", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b10", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e15", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Reset de la barra entre repeticiones en la serie pesada.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b11", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e16", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo unilateral." },
          { "id": "e17", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Fuerza de tiron vertical." },
          { "id": "e18", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w4", "name": "Dia de Press Militar", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b14", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e21", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "180s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "210s" }
          ]}
        ]},
        { "id": "b15", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e22", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen de espalda." },
          { "id": "e23", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Salud y tamano del deltoide." },
          { "id": "e24", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Accesorio de brazo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
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
  'twf_gym_strength_531',
  '5/3/1 Strength',
  '4-day 5/3/1-style strength program built around the four big lifts, with ramped top sets and supporting accessory work.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "5/3/1 Strength",
    "level": "Advanced",
    "focus": "Maximal Strength",
    "frequency": 4,
    "duration": 70,
    "description": "4-day 5/3/1-style strength program built around the four big lifts, with ramped top sets and supporting accessory work.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Squat Day", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b2", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Three ramped sets, last one for max reps.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e4", "name": "Leg Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volume for the quads." },
          { "id": "e5", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance the hamstrings." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Anti-extension core work." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Bench Day", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate shoulders and cuff." }
        ]},
        { "id": "b6", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e9", "name": "Barbell Bench Press", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-1-1", "notes": "Brief pause on the chest every rep.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e10", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volume for the upper chest." },
          { "id": "e11", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance pushing with pulling." },
          { "id": "e12", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Support for the bench press." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Deadlift Day", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b10", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e15", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Reset the bar between reps on the heavy set.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b11", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e16", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." },
          { "id": "e17", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pulling strength." },
          { "id": "e18", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Overhead Press Day", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b14", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e21", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "180s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Firm core, no lower-back arch.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "210s" }
          ]}
        ]},
        { "id": "b15", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e22", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back volume." },
          { "id": "e23", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Delt health and size." },
          { "id": "e24", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Arm accessory." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 5. twf_gym_powerbuilding  |  Powerbuilding (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_powerbuilding',
  'Powerbuilding',
  'Hibrido de 4 dias que combina levantamientos pesados de fuerza al inicio de la sesion con trabajo accesorio de hipertrofia.',
  'Intermediate',
  'Powerbuilding',
  4,
  '{
    "name": "Powerbuilding",
    "level": "Intermediate",
    "focus": "Fuerza e hipertrofia",
    "frequency": 4,
    "duration": 75,
    "description": "Hibrido de 4 dias que combina levantamientos pesados de fuerza al inicio de la sesion con trabajo accesorio de hipertrofia.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso Pesado", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." },
          { "id": "e2", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "180s", "intensity": "80-85% 1RM", "tempo": "2-1-1", "notes": "Trabajo pesado, mantente solido y explosivo." }
        ]},
        { "id": "b3", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e4", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el empuje pesado." },
          { "id": "e5", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pectoral superior." },
          { "id": "e6", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Amplitud de la espalda." },
          { "id": "e7", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Trabajo de brazo." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna Pesada", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "210s", "intensity": "80-85% 1RM", "tempo": "2-0-1", "notes": "Profundidad completa, mantente firme." }
        ]},
        { "id": "b7", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de cuadriceps." },
          { "id": "e13", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aislamiento del isquio." },
          { "id": "e14", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w3", "name": "Torso Volumen", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b10", "name": "Fuerza ligera", "type": "main", "exercises": [
          { "id": "e17", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Press pesado de hombro." }
        ]},
        { "id": "b11", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e18", "name": "Press de pecho en maquina", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de pecho." },
          { "id": "e19", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de espalda." },
          { "id": "e20", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Deltoide lateral." },
          { "id": "e21", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Biceps." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w4", "name": "Pierna Volumen", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e23", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa el tren inferior." }
        ]},
        { "id": "b14", "name": "Fuerza ligera", "type": "main", "exercises": [
          { "id": "e24", "name": "Peso muerto rumano", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Bisagra de cadera pesada." }
        ]},
        { "id": "b15", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e25", "name": "Sentadilla hack", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Volumen de cuadriceps." },
          { "id": "e26", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Gluteo." },
          { "id": "e27", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aislamiento." },
          { "id": "e28", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e29", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
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
  'twf_gym_powerbuilding',
  'Powerbuilding',
  '4-day hybrid program pairing heavy strength lifts at the start of each session with hypertrophy accessory work.',
  'Intermediate',
  'Powerbuilding',
  4,
  '{
    "name": "Powerbuilding",
    "level": "Intermediate",
    "focus": "Strength and Hypertrophy",
    "frequency": 4,
    "duration": 75,
    "description": "4-day hybrid program pairing heavy strength lifts at the start of each session with hypertrophy accessory work.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Heavy Upper", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." },
          { "id": "e2", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulders." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "180s", "intensity": "80-85% 1RM", "tempo": "2-1-1", "notes": "Heavy work, stay tight and explosive." }
        ]},
        { "id": "b3", "name": "Hypertrophy", "type": "main", "exercises": [
          { "id": "e4", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance the heavy press." },
          { "id": "e5", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Upper chest." },
          { "id": "e6", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Back width." },
          { "id": "e7", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Arm work." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Heavy Lower", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "210s", "intensity": "80-85% 1RM", "tempo": "2-0-1", "notes": "Full depth, stay braced." }
        ]},
        { "id": "b7", "name": "Hypertrophy", "type": "main", "exercises": [
          { "id": "e11", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Posterior chain." },
          { "id": "e12", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Quad volume." },
          { "id": "e13", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstring isolation." },
          { "id": "e14", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w3", "name": "Upper Volume", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b10", "name": "Light Strength", "type": "main", "exercises": [
          { "id": "e17", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Heavy shoulder press." }
        ]},
        { "id": "b11", "name": "Hypertrophy", "type": "main", "exercises": [
          { "id": "e18", "name": "Machine Chest Press", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Chest volume." },
          { "id": "e19", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Back volume." },
          { "id": "e20", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Side delt." },
          { "id": "e21", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Biceps." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w4", "name": "Lower Volume", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e23", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the lower body." }
        ]},
        { "id": "b14", "name": "Light Strength", "type": "main", "exercises": [
          { "id": "e24", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Heavy hip hinge." }
        ]},
        { "id": "b15", "name": "Hypertrophy", "type": "main", "exercises": [
          { "id": "e25", "name": "Hack Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Quad volume." },
          { "id": "e26", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Glutes." },
          { "id": "e27", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Isolation." },
          { "id": "e28", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleus." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e29", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 6. twf_gym_glute_focus  |  Glute Focus (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_glute_focus',
  'Enfasis en Gluteo',
  'Programa de 4 dias centrado en el desarrollo del gluteo y el tren inferior, con alta frecuencia de extension de cadera.',
  'Intermediate',
  'Lower Body',
  4,
  '{
    "name": "Enfasis en Gluteo",
    "level": "Intermediate",
    "focus": "Gluteo y tren inferior",
    "frequency": 4,
    "duration": 60,
    "description": "Programa de 4 dias centrado en el desarrollo del gluteo y el tren inferior, con alta frecuencia de extension de cadera.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Gluteo Pesado", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Puente de gluteo", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activacion del gluteo." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad de cadera." }
        ]},
        { "id": "b2", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e3", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-2-1", "notes": "Pesado, pausa de dos segundos arriba." },
          { "id": "e4", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Estira el gluteo y el isquio." },
          { "id": "e5", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco adelantado para mas gluteo." }
        ]},
        { "id": "b3", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e6", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Isquios." },
          { "id": "e7", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Gemelo." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w2", "name": "Cuadriceps", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e10", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa." },
          { "id": "e11", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pies bajos para mas cuadriceps." },
          { "id": "e12", "name": "Zancadas caminando", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Paso largo para gluteo." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e13", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa arriba." },
          { "id": "e14", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Aprieta el gluteo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w3", "name": "Gluteo Volumen", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Puente de gluteo", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activacion." }
        ]},
        { "id": "b10", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e17", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Series largas, tension constante." },
          { "id": "e18", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estabilidad ante todo." },
          { "id": "e19", "name": "Subida al cajon", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Cajon alto para mas gluteo." }
        ]},
        { "id": "b11", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e20", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Isquios." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e21", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja la cadera." }
        ]}
      ]},
      { "id": "w4", "name": "Cadena Posterior", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e22", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b14", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e23", "name": "Peso muerto rumano", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Bisagra de cadera dominante." },
          { "id": "e24", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-2-1", "notes": "Pausa larga arriba." },
          { "id": "e25", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Isquios." }
        ]},
        { "id": "b15", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e26", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
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
  'twf_gym_glute_focus',
  'Glute Focus',
  '4-day program centered on glute and lower-body development with a high frequency of hip extension work.',
  'Intermediate',
  'Lower Body',
  4,
  '{
    "name": "Glute Focus",
    "level": "Intermediate",
    "focus": "Glutes and Lower Body",
    "frequency": 4,
    "duration": 60,
    "description": "4-day program centered on glute and lower-body development with a high frequency of hip extension work.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Heavy Glutes", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Glute Bridge", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Glute activation." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-2-1", "notes": "Heavy, two-second pause at the top." },
          { "id": "e4", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Stretch the glutes and hamstrings." },
          { "id": "e5", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lean torso forward for more glute." }
        ]},
        { "id": "b3", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e6", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." },
          { "id": "e7", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Calves." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w2", "name": "Quads", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth." },
          { "id": "e11", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Feet low for more quad." },
          { "id": "e12", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Long stride for glute." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e13", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pause at the top." },
          { "id": "e14", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Squeeze the glute." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Glute Volume", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Glute Bridge", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activation." }
        ]},
        { "id": "b10", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e17", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Long sets, constant tension." },
          { "id": "e18", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stability first." },
          { "id": "e19", "name": "Step-Up Bodyweight", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "High box for more glute." }
        ]},
        { "id": "b11", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e20", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e21", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the hip." }
        ]}
      ]},
      { "id": "w4", "name": "Posterior Chain", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e22", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b14", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e23", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hip-hinge dominant." },
          { "id": "e24", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-2-1", "notes": "Long pause at the top." },
          { "id": "e25", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." }
        ]},
        { "id": "b15", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e26", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleus." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 7. twf_gym_fat_loss  |  Recomposition and Fat Loss (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fat_loss',
  'Recomposicion y Perdida de Grasa',
  'Programa de 4 dias que combina trabajo de hipertrofia para preservar musculo con bloques de acondicionamiento metabolico.',
  'Intermediate',
  'Fat Loss',
  4,
  '{
    "name": "Recomposicion y Perdida de Grasa",
    "level": "Intermediate",
    "focus": "Perdida de grasa",
    "frequency": 4,
    "duration": 55,
    "description": "Programa de 4 dias que combina trabajo de hipertrofia para preservar musculo con bloques de acondicionamiento metabolico.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso + Cardio", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e2", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Manten el estimulo de hipertrofia." },
          { "id": "e3", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda ancha." },
          { "id": "e4", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Sin arquear la lumbar." }
        ]},
        { "id": "b3", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e5", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Circuito sin descanso entre ejercicios." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Core firme." },
          { "id": "e7", "name": "Comba", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Descansa al final de la ronda." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el pectoral." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna + Cardio", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cuadriceps y gluteo." },
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Zancadas caminando", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo unilateral." }
        ]},
        { "id": "b7", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e13", "name": "Sentadilla sin peso", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo alto." },
          { "id": "e14", "name": "Marcha en el sitio", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 7", "tempo": null, "notes": "Recuperacion activa." },
          { "id": "e15", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Cierra la ronda fuerte." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Cuerpo Completo + HIIT", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e18", "name": "Sentadilla goblet", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pierna global." },
          { "id": "e19", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e20", "name": "Press de banca con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pecho." }
        ]},
        { "id": "b11", "name": "HIIT", "type": "main", "exercises": [
          { "id": "e21", "name": "Burpees", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Formato 20s on / 40s off." },
          { "id": "e22", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Alterna con los burpees." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y baja pulsaciones." }
        ]}
      ]},
      { "id": "w4", "name": "Torso + Core", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e25", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pectoral superior." },
          { "id": "e26", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e27", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Hombro." }
        ]},
        { "id": "b15", "name": "Circuito de Core", "type": "main", "exercises": [
          { "id": "e28", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Anti-extension." },
          { "id": "e29", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." },
          { "id": "e30", "name": "Bicho muerto (dead bug)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "Peso corporal", "tempo": "2-0-2", "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e31", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
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
  'twf_gym_fat_loss',
  'Recomposition and Fat Loss',
  '4-day program combining hypertrophy work to preserve muscle with metabolic conditioning blocks.',
  'Intermediate',
  'Fat Loss',
  4,
  '{
    "name": "Recomposition and Fat Loss",
    "level": "Intermediate",
    "focus": "Fat Loss",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program combining hypertrophy work to preserve muscle with metabolic conditioning blocks.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Upper + Cardio", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e2", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Maintain the hypertrophy stimulus." },
          { "id": "e3", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Build back width." },
          { "id": "e4", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "No lower-back arch." }
        ]},
        { "id": "b3", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e5", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Circuit with no rest between exercises." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Firm core." },
          { "id": "e7", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Rest at the end of the round." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Lower + Cardio", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e10", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Quads and glutes." },
          { "id": "e11", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Posterior chain." },
          { "id": "e12", "name": "Walking Lunges", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." }
        ]},
        { "id": "b7", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e13", "name": "Bodyweight Squat", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "High pace." },
          { "id": "e14", "name": "March in Place", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 7", "tempo": null, "notes": "Active recovery." },
          { "id": "e15", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Finish the round strong." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Full Body + HIIT", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Strength", "type": "main", "exercises": [
          { "id": "e18", "name": "Goblet Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Whole-leg work." },
          { "id": "e19", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back." },
          { "id": "e20", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Chest." }
        ]},
        { "id": "b11", "name": "HIIT", "type": "main", "exercises": [
          { "id": "e21", "name": "Burpees", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "20s on / 40s off format." },
          { "id": "e22", "name": "Mountain Climbers", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Alternate with the burpees." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and bring the pulse down." }
        ]}
      ]},
      { "id": "w4", "name": "Upper + Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e25", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Upper chest." },
          { "id": "e26", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back." },
          { "id": "e27", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Shoulder." }
        ]},
        { "id": "b15", "name": "Core Circuit", "type": "main", "exercises": [
          { "id": "e28", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Anti-extension." },
          { "id": "e29", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." },
          { "id": "e30", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e31", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 8. twf_gym_arms_priority  |  Arms Priority (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_arms_priority',
  'Prioridad Brazos',
  'Rutina de 4 dias que prioriza el desarrollo de biceps y triceps con alta frecuencia, sin descuidar el resto del cuerpo.',
  'Intermediate',
  'Specialization',
  4,
  '{
    "name": "Prioridad Brazos",
    "level": "Intermediate",
    "focus": "Brazos",
    "frequency": 4,
    "duration": 60,
    "description": "Rutina de 4 dias que prioriza el desarrollo de biceps y triceps con alta frecuencia, sin descuidar el resto del cuerpo.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Brazos A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza codo y hombro." }
        ]},
        { "id": "b2", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e2", "name": "Curl con barra", "type": "Isolation", "sets": "4", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e3", "name": "Curl en banco predicador (maquina)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien abajo." },
          { "id": "e4", "name": "Curl martillo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Trabaja el braquial." }
        ]},
        { "id": "b3", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e5", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "4", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos quietos." },
          { "id": "e6", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Separa la cuerda al final." },
          { "id": "e7", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira la cabeza larga." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e10", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa." },
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de cuadriceps." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e13", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Isquios." },
          { "id": "e14", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w3", "name": "Brazos B", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta el codo y el hombro." }
        ]},
        { "id": "b10", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e17", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo." },
          { "id": "e18", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Cabeza larga." },
          { "id": "e19", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira al maximo." }
        ]},
        { "id": "b11", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e20", "name": "Curl en polea", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tension constante." },
          { "id": "e21", "name": "Curl con mancuernas", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Supina bien arriba." },
          { "id": "e22", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Series largas para el braquial." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja hombros y biceps." }
        ]}
      ]},
      { "id": "w4", "name": "Torso", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b14", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e25", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pecho." },
          { "id": "e26", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e27", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hombro." }
        ]},
        { "id": "b15", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e28", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Deltoide lateral." },
          { "id": "e29", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Deltoide posterior." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
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
  'twf_gym_arms_priority',
  'Arms Priority',
  '4-day program that prioritizes biceps and triceps development with high frequency while still training the rest of the body.',
  'Intermediate',
  'Specialization',
  4,
  '{
    "name": "Arms Priority",
    "level": "Intermediate",
    "focus": "Arms",
    "frequency": 4,
    "duration": 60,
    "description": "4-day program that prioritizes biceps and triceps development with high frequency while still training the rest of the body.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Arms A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize elbow and shoulder." }
        ]},
        { "id": "b2", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e2", "name": "Barbell Curl", "type": "Isolation", "sets": "4", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." },
          { "id": "e3", "name": "Preacher Curl Machine", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch well at the bottom." },
          { "id": "e4", "name": "Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Work the brachialis." }
        ]},
        { "id": "b3", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e5", "name": "Skull Crushers", "type": "Isolation", "sets": "4", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows still." },
          { "id": "e6", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Spread the rope at the end." },
          { "id": "e7", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch the long head." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w2", "name": "Legs", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth." },
          { "id": "e11", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Posterior chain." },
          { "id": "e12", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Quad volume." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e13", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." },
          { "id": "e14", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w3", "name": "Arms B", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up elbow and shoulder." }
        ]},
        { "id": "b10", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e17", "name": "Triceps Pushdown", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow." },
          { "id": "e18", "name": "Skull Crushers", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Long head." },
          { "id": "e19", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Maximum stretch." }
        ]},
        { "id": "b11", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e20", "name": "Cable Curl", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Constant tension." },
          { "id": "e21", "name": "Dumbbell Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Supinate well at the top." },
          { "id": "e22", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Long sets for the brachialis." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax shoulders and biceps." }
        ]}
      ]},
      { "id": "w4", "name": "Upper Body", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b14", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e25", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Chest." },
          { "id": "e26", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back." },
          { "id": "e27", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Shoulders." }
        ]},
        { "id": "b15", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e28", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Side delt." },
          { "id": "e29", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Rear delt." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 9. twf_crossfit_wod_classic  |  Classic CrossFit WOD (5 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_wod_classic',
  'CrossFit WOD Clasico',
  'Programa funcional de 5 dias con calentamiento, fuerza y un WOD diario combinando halterofilia, gimnasticos y acondicionamiento.',
  'Intermediate',
  'CrossFit',
  5,
  '{
    "name": "CrossFit WOD Clasico",
    "level": "Intermediate",
    "focus": "Fitness funcional",
    "frequency": 5,
    "duration": 60,
    "description": "Programa funcional de 5 dias con calentamiento, fuerza y un WOD diario combinando halterofilia, gimnasticos y acondicionamiento.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Lunes - Fuerza y WOD", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso y coordina." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "5x5 progresivo, tecnica solida." }
        ]},
        { "id": "b3", "name": "WOD - AMRAP 15 min", "type": "main", "exercises": [
          { "id": "e4", "name": "Thruster con mancuernas", "type": "Compound", "sets": "1", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "AMRAP 15: rota entre los tres ejercicios." },
          { "id": "e5", "name": "Dominadas asistidas", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Maximas rondas posibles en 15 min." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "8", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Ritmo sostenible, sin parar." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Martes - Halterofilia", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b6", "name": "Tecnica de Levantamiento", "type": "main", "exercises": [
          { "id": "e9", "name": "Cargada de potencia (power clean)", "type": "Compound", "sets": "6", "reps": "3", "rir": "3", "rest": "120s", "intensity": "70% 1RM", "tempo": null, "notes": "Velocidad y tecnica, no fallo." },
          { "id": "e10", "name": "Push press", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Impulso de pierna explosivo." }
        ]},
        { "id": "b7", "name": "WOD - 5 Rondas Por Tiempo", "type": "main", "exercises": [
          { "id": "e11", "name": "Swing con kettlebell", "type": "Compound", "sets": "5", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "5 rondas lo mas rapido posible." },
          { "id": "e12", "name": "Saltos al cajon", "type": "Compound", "sets": "5", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Extension completa de cadera arriba." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre hombros y pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Miercoles - Gimnasticos", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Habilidad", "type": "main", "exercises": [
          { "id": "e15", "name": "Dominadas asistidas", "type": "Compound", "sets": "5", "reps": "6", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Practica de tiron vertical estricto." },
          { "id": "e16", "name": "Fondos en paralelas asistidos", "type": "Compound", "sets": "4", "reps": "8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Control en el descenso." }
        ]},
        { "id": "b11", "name": "WOD - EMOM 12 min", "type": "main", "exercises": [
          { "id": "e17", "name": "Flexiones", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto par: flexiones." },
          { "id": "e18", "name": "Zancadas caminando", "type": "Compound", "sets": "6", "reps": "16", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto impar: zancadas." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w4", "name": "Jueves - Fuerza y WOD", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e21", "name": "Peso muerto rumano", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Cadena posterior pesada." }
        ]},
        { "id": "b15", "name": "WOD - 21-15-9", "type": "main", "exercises": [
          { "id": "e22", "name": "Thruster con mancuernas", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Esquema descendente 21-15-9.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]},
          { "id": "e23", "name": "Burpees", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alterna con los thrusters por tiempo.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]}
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w5", "name": "Viernes - Metcon Largo", "blocks": [
        { "id": "b17", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b18", "name": "WOD - AMRAP 20 min", "type": "main", "exercises": [
          { "id": "e26", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "250m", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "AMRAP 20: rota entre las cuatro estaciones." },
          { "id": "e27", "name": "Swing con kettlebell", "type": "Compound", "sets": "1", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Bisagra de cadera potente." },
          { "id": "e28", "name": "Saltos al cajon", "type": "Compound", "sets": "1", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Aterrizaje suave." },
          { "id": "e29", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo constante toda la pieza." }
        ]},
        { "id": "b19", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_wod_classic',
  'Classic CrossFit WOD',
  '5-day functional program with warm-up, strength and a daily WOD blending weightlifting, gymnastics and conditioning.',
  'Intermediate',
  'CrossFit',
  5,
  '{
    "name": "Classic CrossFit WOD",
    "level": "Intermediate",
    "focus": "Functional Fitness",
    "frequency": 5,
    "duration": 60,
    "description": "5-day functional program with warm-up, strength and a daily WOD blending weightlifting, gymnastics and conditioning.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Monday - Strength and WOD", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise pulse and coordination." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Progressive 5x5, solid technique." }
        ]},
        { "id": "b3", "name": "WOD - AMRAP 15 min", "type": "main", "exercises": [
          { "id": "e4", "name": "Dumbbell Thruster", "type": "Compound", "sets": "1", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "AMRAP 15: rotate through the three exercises." },
          { "id": "e5", "name": "Pull-Up Assisted", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "As many rounds as possible in 15 min." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "8", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Sustainable pace, do not stop." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Tuesday - Weightlifting", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b6", "name": "Lift Technique", "type": "main", "exercises": [
          { "id": "e9", "name": "Power Clean", "type": "Compound", "sets": "6", "reps": "3", "rir": "3", "rest": "120s", "intensity": "70% 1RM", "tempo": null, "notes": "Speed and technique, never to failure." },
          { "id": "e10", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Explosive leg drive." }
        ]},
        { "id": "b7", "name": "WOD - 5 Rounds For Time", "type": "main", "exercises": [
          { "id": "e11", "name": "Kettlebell Swing", "type": "Compound", "sets": "5", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "5 rounds as fast as possible." },
          { "id": "e12", "name": "Box Jumps", "type": "Compound", "sets": "5", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Full hip extension at the top." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open shoulders and chest." }
        ]}
      ]},
      { "id": "w3", "name": "Wednesday - Gymnastics", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Skill", "type": "main", "exercises": [
          { "id": "e15", "name": "Pull-Up Assisted", "type": "Compound", "sets": "5", "reps": "6", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Strict vertical pulling practice." },
          { "id": "e16", "name": "Assisted Dips", "type": "Compound", "sets": "4", "reps": "8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Control the descent." }
        ]},
        { "id": "b11", "name": "WOD - EMOM 12 min", "type": "main", "exercises": [
          { "id": "e17", "name": "Push-Up", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Even minute: push-ups." },
          { "id": "e18", "name": "Walking Lunges", "type": "Compound", "sets": "6", "reps": "16", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Odd minute: lunges." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w4", "name": "Thursday - Strength and WOD", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Heavy posterior chain." }
        ]},
        { "id": "b15", "name": "WOD - 21-15-9", "type": "main", "exercises": [
          { "id": "e22", "name": "Dumbbell Thruster", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Descending 21-15-9 scheme.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]},
          { "id": "e23", "name": "Burpees", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate with thrusters, for time.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]}
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w5", "name": "Friday - Long Metcon", "blocks": [
        { "id": "b17", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b18", "name": "WOD - AMRAP 20 min", "type": "main", "exercises": [
          { "id": "e26", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "250m", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "AMRAP 20: rotate through the four stations." },
          { "id": "e27", "name": "Kettlebell Swing", "type": "Compound", "sets": "1", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Powerful hip hinge." },
          { "id": "e28", "name": "Box Jumps", "type": "Compound", "sets": "1", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Soft landing." },
          { "id": "e29", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Steady pace the whole piece." }
        ]},
        { "id": "b19", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 10. twf_crossfit_engine  |  CrossFit Engine (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_engine',
  'CrossFit Engine',
  'Programa de 4 dias centrado en construir capacidad aerobica y resistencia con metcons largos e intervalos de monoestructural.',
  'Intermediate',
  'Conditioning',
  4,
  '{
    "name": "CrossFit Engine",
    "level": "Intermediate",
    "focus": "Capacidad aerobica",
    "frequency": 4,
    "duration": 55,
    "description": "Programa de 4 dias centrado en construir capacidad aerobica y resistencia con metcons largos e intervalos de monoestructural.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Intervalos Largos", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "500m", "rir": null, "rest": "60s", "intensity": "Ligero", "tempo": null, "notes": "Ritmo facil y progresivo." }
        ]},
        { "id": "b2", "name": "Bloque Aerobico", "type": "main", "exercises": [
          { "id": "e2", "name": "Remo en maquina", "type": "Compound", "sets": "5", "reps": "500m", "rir": "2", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "5x500m a ritmo umbral, consistente." },
          { "id": "e3", "name": "Comba", "type": "Compound", "sets": "3", "reps": "90s", "rir": "2", "rest": "60s", "intensity": "RPE 6", "tempo": null, "notes": "Recuperacion activa entre series." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w2", "name": "Metcon Mixto", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b5", "name": "Intervalos", "type": "main", "exercises": [
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Formato 30s on / 30s off." },
          { "id": "e7", "name": "Swing con kettlebell", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Alterna con los burpees." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]},
      { "id": "w3", "name": "Esfuerzo Sostenido", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activacion suave." }
        ]},
        { "id": "b8", "name": "Metcon Largo - 30 min", "type": "main", "exercises": [
          { "id": "e10", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "400m", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Ritmo conversacional, rota estaciones." },
          { "id": "e11", "name": "Zancadas caminando", "type": "Compound", "sets": "1", "reps": "20", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Mantente moviendote." },
          { "id": "e12", "name": "Flexiones", "type": "Compound", "sets": "1", "reps": "15", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Pecho firme, ritmo controlado." }
        ]},
        { "id": "b9", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w4", "name": "Sprints e Intervalos Cortos", "blocks": [
        { "id": "b10", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa y coordina." }
        ]},
        { "id": "b11", "name": "Intervalos Cortos", "type": "main", "exercises": [
          { "id": "e15", "name": "Remo en maquina", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "Sprints de 15s al maximo." },
          { "id": "e16", "name": "Saltos al cajon", "type": "Compound", "sets": "6", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Potencia explosiva de pierna." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y recupera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_engine',
  'CrossFit Engine',
  '4-day program focused on building aerobic capacity and endurance with long metcons and monostructural intervals.',
  'Intermediate',
  'Conditioning',
  4,
  '{
    "name": "CrossFit Engine",
    "level": "Intermediate",
    "focus": "Aerobic Capacity",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program focused on building aerobic capacity and endurance with long metcons and monostructural intervals.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Long Intervals", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "500m", "rir": null, "rest": "60s", "intensity": "Light", "tempo": null, "notes": "Easy progressive pace." }
        ]},
        { "id": "b2", "name": "Aerobic Block", "type": "main", "exercises": [
          { "id": "e2", "name": "Rowing Machine", "type": "Compound", "sets": "5", "reps": "500m", "rir": "2", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "5x500m at threshold pace, consistent." },
          { "id": "e3", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "90s", "rir": "2", "rest": "60s", "intensity": "RPE 6", "tempo": null, "notes": "Active recovery between sets." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w2", "name": "Mixed Metcon", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b5", "name": "Intervals", "type": "main", "exercises": [
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "30s on / 30s off format." },
          { "id": "e7", "name": "Kettlebell Swing", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate with the burpees." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w3", "name": "Sustained Effort", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle activation." }
        ]},
        { "id": "b8", "name": "Long Metcon - 30 min", "type": "main", "exercises": [
          { "id": "e10", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "400m", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Conversational pace, rotate stations." },
          { "id": "e11", "name": "Walking Lunges", "type": "Compound", "sets": "1", "reps": "20", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Keep moving." },
          { "id": "e12", "name": "Push-Up", "type": "Compound", "sets": "1", "reps": "15", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Firm chest, controlled pace." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w4", "name": "Sprints and Short Intervals", "blocks": [
        { "id": "b10", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate and coordinate." }
        ]},
        { "id": "b11", "name": "Short Intervals", "type": "main", "exercises": [
          { "id": "e15", "name": "Rowing Machine", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "All-out 15s sprints." },
          { "id": "e16", "name": "Box Jumps", "type": "Compound", "sets": "6", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Explosive leg power." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and recover." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 11. twf_crossfit_strength_skill  |  CrossFit Strength and Skill (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_strength_skill',
  'CrossFit Fuerza y Habilidad',
  'Programa de 4 dias que equilibra el desarrollo de fuerza con barra y la practica de habilidades gimnasticas avanzadas.',
  'Advanced',
  'Strength and Skill',
  4,
  '{
    "name": "CrossFit Fuerza y Habilidad",
    "level": "Advanced",
    "focus": "Fuerza y gimnasticos",
    "frequency": 4,
    "duration": 65,
    "description": "Programa de 4 dias que equilibra el desarrollo de fuerza con barra y la practica de habilidades gimnasticas avanzadas.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Sentadilla y Handstand", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." },
          { "id": "e2", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Triples pesados, mantente firme." }
        ]},
        { "id": "b3", "name": "Habilidad - Pino", "type": "main", "exercises": [
          { "id": "e4", "name": "Pino contra la pared", "type": "Isolation", "sets": "5", "reps": "30s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Cuerpo apretado, hombros activos." },
          { "id": "e5", "name": "Flexion en pino contra la pared", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Rango parcial si hace falta." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Press y Dominada Estricta", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e8", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "150s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Press estricto pesado." }
        ]},
        { "id": "b7", "name": "Habilidad - Tiron Vertical", "type": "main", "exercises": [
          { "id": "e9", "name": "Dominada lastrada", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Dominada estricta con lastre." },
          { "id": "e10", "name": "Fondos en paralelas asistidos", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Control en el descenso." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Peso Muerto y Core", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b10", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e13", "name": "Peso muerto rumano", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Bisagra de cadera pesada." }
        ]},
        { "id": "b11", "name": "Habilidad - Toes to Bar", "type": "main", "exercises": [
          { "id": "e14", "name": "Elevacion de rodillas colgado", "type": "Isolation", "sets": "5", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progresion hacia toes to bar." },
          { "id": "e15", "name": "Plancha hueca (hollow hold)", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Peso corporal", "tempo": null, "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w4", "name": "Halterofilia y Habilidad Mixta", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b14", "name": "Tecnica de Levantamiento", "type": "main", "exercises": [
          { "id": "e18", "name": "Cargada de potencia (power clean)", "type": "Compound", "sets": "6", "reps": "2", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": null, "notes": "Dobles tecnicos, velocidad de barra." },
          { "id": "e19", "name": "Push press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": null, "notes": "Impulso de pierna explosivo." }
        ]},
        { "id": "b15", "name": "Habilidad", "type": "main", "exercises": [
          { "id": "e20", "name": "Pino contra la pared", "type": "Isolation", "sets": "4", "reps": "40s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Mejora la resistencia invertida." },
          { "id": "e21", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Volumen de tiron." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
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
  'twf_crossfit_strength_skill',
  'CrossFit Strength and Skill',
  '4-day program balancing barbell strength development with practice of advanced gymnastics skills.',
  'Advanced',
  'Strength and Skill',
  4,
  '{
    "name": "CrossFit Strength and Skill",
    "level": "Advanced",
    "focus": "Strength and Gymnastics",
    "frequency": 4,
    "duration": 65,
    "description": "4-day program balancing barbell strength development with practice of advanced gymnastics skills.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Squat and Handstand", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." },
          { "id": "e2", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulders." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy triples, stay braced." }
        ]},
        { "id": "b3", "name": "Skill - Handstand", "type": "main", "exercises": [
          { "id": "e4", "name": "Wall Handstand Hold", "type": "Isolation", "sets": "5", "reps": "30s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Tight body, active shoulders." },
          { "id": "e5", "name": "Wall Handstand Push-Up", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Partial range if needed." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Press and Strict Pull-Up", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e8", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "150s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy strict press." }
        ]},
        { "id": "b7", "name": "Skill - Vertical Pull", "type": "main", "exercises": [
          { "id": "e9", "name": "Weighted Pull-Up", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Strict weighted pull-up." },
          { "id": "e10", "name": "Assisted Dips", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Control the descent." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Deadlift and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b10", "name": "Strength", "type": "main", "exercises": [
          { "id": "e13", "name": "Romanian Deadlift", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy hip hinge." }
        ]},
        { "id": "b11", "name": "Skill - Toes to Bar", "type": "main", "exercises": [
          { "id": "e14", "name": "Hanging Knee Raise", "type": "Isolation", "sets": "5", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progression toward toes to bar." },
          { "id": "e15", "name": "Hollow Hold", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Bodyweight", "tempo": null, "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Weightlifting and Mixed Skill", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b14", "name": "Lift Technique", "type": "main", "exercises": [
          { "id": "e18", "name": "Power Clean", "type": "Compound", "sets": "6", "reps": "2", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": null, "notes": "Technical doubles, bar speed." },
          { "id": "e19", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": null, "notes": "Explosive leg drive." }
        ]},
        { "id": "b15", "name": "Skill", "type": "main", "exercises": [
          { "id": "e20", "name": "Wall Handstand Hold", "type": "Isolation", "sets": "4", "reps": "40s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Build inverted endurance." },
          { "id": "e21", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Pulling volume." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 12. twf_functional_athletic  |  Functional Athletic Performance (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_functional_athletic',
  'Rendimiento Atletico Funcional',
  'Programa de 4 dias para atletas que combina potencia, fuerza, pliometria y agilidad para mejorar el rendimiento general.',
  'Intermediate',
  'Athletic Performance',
  4,
  '{
    "name": "Rendimiento Atletico Funcional",
    "level": "Intermediate",
    "focus": "Atletismo y potencia",
    "frequency": 4,
    "duration": 60,
    "description": "Programa de 4 dias para atletas que combina potencia, fuerza, pliometria y agilidad para mejorar el rendimiento general.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Potencia Tren Inferior", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad dinamica de cadera." },
          { "id": "e2", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa el sistema nervioso." }
        ]},
        { "id": "b2", "name": "Pliometria", "type": "main", "exercises": [
          { "id": "e3", "name": "Saltos al cajon", "type": "Compound", "sets": "5", "reps": "4", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "Maxima intencion, aterrizaje suave." }
        ]},
        { "id": "b3", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e4", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Concentrica explosiva." },
          { "id": "e5", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Estabilidad unilateral." },
          { "id": "e6", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Salud del isquio." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Potencia Tren Superior", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." }
        ]},
        { "id": "b6", "name": "Potencia", "type": "main", "exercises": [
          { "id": "e9", "name": "Push press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Transferencia de potencia pierna-brazo." }
        ]},
        { "id": "b7", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Empuje explosivo." },
          { "id": "e11", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el empuje." },
          { "id": "e12", "name": "Dominadas asistidas", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Tiron vertical." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Agilidad y Acondicionamiento", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Comba", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Coordinacion y pulso." }
        ]},
        { "id": "b10", "name": "Agilidad", "type": "main", "exercises": [
          { "id": "e15", "name": "Sprint en escalera de agilidad", "type": "Compound", "sets": "6", "reps": "20s", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Pies rapidos, cambios de direccion." },
          { "id": "e16", "name": "Carrera lanzadera", "type": "Compound", "sets": "6", "reps": "20m", "rir": "2", "rest": "60s", "intensity": "RPE 9", "tempo": null, "notes": "Acelera y frena con control." }
        ]},
        { "id": "b11", "name": "Acondicionamiento", "type": "main", "exercises": [
          { "id": "e17", "name": "Swing con kettlebell", "type": "Compound", "sets": "4", "reps": "20", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": null, "notes": "Circuito de potencia-resistencia." },
          { "id": "e18", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Cierra la ronda con intensidad." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w4", "name": "Fuerza Total y Core", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e21", "name": "Peso muerto rumano", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Cadena posterior." },
          { "id": "e22", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Empuje vertical." },
          { "id": "e23", "name": "Zancadas caminando", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Fuerza unilateral." }
        ]},
        { "id": "b15", "name": "Core Anti-rotacion", "type": "main", "exercises": [
          { "id": "e24", "name": "Press Pallof", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-2", "notes": "Resiste la rotacion." },
          { "id": "e25", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e26", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
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
  'twf_functional_athletic',
  'Functional Athletic Performance',
  '4-day program for athletes combining power, strength, plyometrics and agility to improve overall performance.',
  'Intermediate',
  'Athletic Performance',
  4,
  '{
    "name": "Functional Athletic Performance",
    "level": "Intermediate",
    "focus": "Athleticism and Power",
    "frequency": 4,
    "duration": 60,
    "description": "4-day program for athletes combining power, strength, plyometrics and agility to improve overall performance.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Lower Body Power", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Dynamic hip mobility." },
          { "id": "e2", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Wake up the nervous system." }
        ]},
        { "id": "b2", "name": "Plyometrics", "type": "main", "exercises": [
          { "id": "e3", "name": "Box Jumps", "type": "Compound", "sets": "5", "reps": "4", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "Maximum intent, soft landing." }
        ]},
        { "id": "b3", "name": "Strength", "type": "main", "exercises": [
          { "id": "e4", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Explosive concentric." },
          { "id": "e5", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral stability." },
          { "id": "e6", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstring health." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Upper Body Power", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b6", "name": "Power", "type": "main", "exercises": [
          { "id": "e9", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Leg-to-arm power transfer." }
        ]},
        { "id": "b7", "name": "Strength", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Explosive push." },
          { "id": "e11", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance the push." },
          { "id": "e12", "name": "Pull-Up Assisted", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pull." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Agility and Conditioning", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Coordination and pulse." }
        ]},
        { "id": "b10", "name": "Agility", "type": "main", "exercises": [
          { "id": "e15", "name": "Agility Ladder Sprint", "type": "Compound", "sets": "6", "reps": "20s", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Fast feet, change of direction." },
          { "id": "e16", "name": "Shuttle Run", "type": "Compound", "sets": "6", "reps": "20m", "rir": "2", "rest": "60s", "intensity": "RPE 9", "tempo": null, "notes": "Accelerate and brake with control." }
        ]},
        { "id": "b11", "name": "Conditioning", "type": "main", "exercises": [
          { "id": "e17", "name": "Kettlebell Swing", "type": "Compound", "sets": "4", "reps": "20", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": null, "notes": "Power-endurance circuit." },
          { "id": "e18", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Finish the round with intensity." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w4", "name": "Total Strength and Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Posterior chain." },
          { "id": "e22", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical push." },
          { "id": "e23", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral strength." }
        ]},
        { "id": "b15", "name": "Anti-Rotation Core", "type": "main", "exercises": [
          { "id": "e24", "name": "Pallof Press", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-2", "notes": "Resist the rotation." },
          { "id": "e25", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e26", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 13. twf_calisthenics_foundations  |  Calisthenics Foundations (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_calisthenics_foundations',
  'Fundamentos de Calistenia',
  'Programa de 3 dias para iniciarse en el entrenamiento con peso corporal, construyendo fuerza basica de empuje, tiron y pierna.',
  'Beginner',
  'Calisthenics',
  3,
  '{
    "name": "Fundamentos de Calistenia",
    "level": "Beginner",
    "focus": "Fuerza con peso corporal",
    "frequency": 3,
    "duration": 45,
    "description": "Programa de 3 dias para iniciarse en el entrenamiento con peso corporal, construyendo fuerza basica de empuje, tiron y pierna.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Empuje", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." },
          { "id": "e2", "name": "Flexion escapular", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa el serrato." }
        ]},
        { "id": "b2", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e3", "name": "Flexion en plano inclinado", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Manos elevadas para reducir la dificultad." },
          { "id": "e4", "name": "Fondos en banco", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "No bajes en exceso el hombro." },
          { "id": "e5", "name": "Pica (pike push-up)", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Progresion hacia el press invertido." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Gluteos y abdomen apretados." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w2", "name": "Tiron", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." }
        ]},
        { "id": "b6", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e9", "name": "Remo invertido en barra", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Ajusta el angulo del cuerpo a tu nivel." },
          { "id": "e10", "name": "Dominadas asistidas", "type": "Compound", "sets": "3", "reps": "6-8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Usa banda o asistencia." },
          { "id": "e11", "name": "Curl con banda", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Trabajo de biceps complementario." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Bicho muerto (dead bug)", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "Peso corporal", "tempo": "2-0-2", "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Alarga la espalda." }
        ]}
      ]},
      { "id": "w3", "name": "Pierna y Core", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b10", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e15", "name": "Sentadilla sin peso", "type": "Compound", "sets": "4", "reps": "15-20", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Profundidad completa." },
          { "id": "e16", "name": "Subida al cajon", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Trabajo unilateral controlado." },
          { "id": "e17", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Aprieta el gluteo arriba." },
          { "id": "e18", "name": "Elevacion de gemelo con peso corporal", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e19", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
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
  'twf_calisthenics_foundations',
  'Calisthenics Foundations',
  '3-day program to get started with bodyweight training, building basic push, pull and leg strength.',
  'Beginner',
  'Calisthenics',
  3,
  '{
    "name": "Calisthenics Foundations",
    "level": "Beginner",
    "focus": "Bodyweight Strength",
    "frequency": 3,
    "duration": 45,
    "description": "3-day program to get started with bodyweight training, building basic push, pull and leg strength.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." },
          { "id": "e2", "name": "Scapular Push-Up", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the serratus." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Incline Push-Up", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Hands elevated to reduce difficulty." },
          { "id": "e4", "name": "Bench Dips", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Do not let the shoulder drop too far." },
          { "id": "e5", "name": "Pike Push-Up", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Progression toward the handstand press." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Glutes and abs braced." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Pull", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b6", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e9", "name": "Inverted Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Adjust body angle to your level." },
          { "id": "e10", "name": "Pull-Up Assisted", "type": "Compound", "sets": "3", "reps": "6-8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Use a band or assistance." },
          { "id": "e11", "name": "Band Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Complementary biceps work." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the back." }
        ]}
      ]},
      { "id": "w3", "name": "Legs and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b10", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e15", "name": "Bodyweight Squat", "type": "Compound", "sets": "4", "reps": "15-20", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Full depth." },
          { "id": "e16", "name": "Step-Up Bodyweight", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Controlled unilateral work." },
          { "id": "e17", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Squeeze the glute at the top." },
          { "id": "e18", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e19", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 14. twf_calisthenics_skills  |  Calisthenics Skills (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_calisthenics_skills',
  'Calistenia: Habilidades',
  'Programa de 4 dias para progresar en dominadas, fondos y habilidades de calistenia mediante progresiones estructuradas.',
  'Intermediate',
  'Calisthenics',
  4,
  '{
    "name": "Calistenia: Habilidades",
    "level": "Intermediate",
    "focus": "Habilidades con peso corporal",
    "frequency": 4,
    "duration": 55,
    "description": "Programa de 4 dias para progresar en dominadas, fondos y habilidades de calistenia mediante progresiones estructuradas.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Dominadas", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." },
          { "id": "e2", "name": "Suspension en barra", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara el agarre y el hombro." }
        ]},
        { "id": "b2", "name": "Progresion de Dominada", "type": "main", "exercises": [
          { "id": "e3", "name": "Dominada estricta", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Recorrido completo, sin balanceo." },
          { "id": "e4", "name": "Dominada negativa", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Bajada lenta de 5 segundos." },
          { "id": "e5", "name": "Remo invertido en barra", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de tiron horizontal." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Alarga la espalda." }
        ]}
      ]},
      { "id": "w2", "name": "Fondos", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Flexion escapular", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa el serrato y el hombro." }
        ]},
        { "id": "b5", "name": "Progresion de Fondo", "type": "main", "exercises": [
          { "id": "e8", "name": "Fondo en paralelas estricto", "type": "Compound", "sets": "5", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Hombros abajo, profundidad controlada." },
          { "id": "e9", "name": "Fondo negativo", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Bajada lenta de 5 segundos." },
          { "id": "e10", "name": "Flexion diamante", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen para triceps." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Core y Pierna", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b8", "name": "Habilidad de Core", "type": "main", "exercises": [
          { "id": "e13", "name": "Elevacion de piernas colgado", "type": "Isolation", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progresion hacia toes to bar." },
          { "id": "e14", "name": "Plancha hueca (hollow hold)", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Peso corporal", "tempo": null, "notes": "Tension de cuerpo entero." }
        ]},
        { "id": "b9", "name": "Pierna", "type": "main", "exercises": [
          { "id": "e15", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo unilateral." },
          { "id": "e16", "name": "Progresion de sentadilla a una pierna", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Usa apoyo segun tu nivel." }
        ]},
        { "id": "b10", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w4", "name": "Empuje y Tiron Mixto", "blocks": [
        { "id": "b11", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b12", "name": "Bloque Mixto", "type": "main", "exercises": [
          { "id": "e19", "name": "Dominada estricta", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen de tiron vertical." },
          { "id": "e20", "name": "Fondo en paralelas estricto", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen de empuje." },
          { "id": "e21", "name": "Flexion en pino contra la pared", "type": "Compound", "sets": "3", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Empuje vertical avanzado." },
          { "id": "e22", "name": "Remo invertido en barra", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tiron horizontal." }
        ]},
        { "id": "b13", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
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
  'twf_calisthenics_skills',
  'Calisthenics: Skills',
  '4-day program to progress pull-ups, dips and calisthenics skills through structured progressions.',
  'Intermediate',
  'Calisthenics',
  4,
  '{
    "name": "Calisthenics: Skills",
    "level": "Intermediate",
    "focus": "Bodyweight Skills",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program to progress pull-ups, dips and calisthenics skills through structured progressions.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Pull-Ups", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." },
          { "id": "e2", "name": "Bar Hang", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare grip and shoulder." }
        ]},
        { "id": "b2", "name": "Pull-Up Progression", "type": "main", "exercises": [
          { "id": "e3", "name": "Strict Pull-Up", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full range, no swinging." },
          { "id": "e4", "name": "Negative Pull-Up", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Slow 5-second descent." },
          { "id": "e5", "name": "Inverted Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Horizontal pulling volume." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the back." }
        ]}
      ]},
      { "id": "w2", "name": "Dips", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Scapular Push-Up", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the serratus and shoulder." }
        ]},
        { "id": "b5", "name": "Dip Progression", "type": "main", "exercises": [
          { "id": "e8", "name": "Strict Parallel Dip", "type": "Compound", "sets": "5", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Shoulders down, controlled depth." },
          { "id": "e9", "name": "Negative Dip", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Slow 5-second descent." },
          { "id": "e10", "name": "Diamond Push-Up", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Triceps volume." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Core and Legs", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b8", "name": "Core Skill", "type": "main", "exercises": [
          { "id": "e13", "name": "Hanging Leg Raise", "type": "Isolation", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progression toward toes to bar." },
          { "id": "e14", "name": "Hollow Hold", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Bodyweight", "tempo": null, "notes": "Whole-body tension." }
        ]},
        { "id": "b9", "name": "Legs", "type": "main", "exercises": [
          { "id": "e15", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." },
          { "id": "e16", "name": "Pistol Squat Progression", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Use support to match your level." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Mixed Push and Pull", "blocks": [
        { "id": "b11", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b12", "name": "Mixed Block", "type": "main", "exercises": [
          { "id": "e19", "name": "Strict Pull-Up", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pulling volume." },
          { "id": "e20", "name": "Strict Parallel Dip", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pushing volume." },
          { "id": "e21", "name": "Wall Handstand Push-Up", "type": "Compound", "sets": "3", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Advanced vertical push." },
          { "id": "e22", "name": "Inverted Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Horizontal pull." }
        ]},
        { "id": "b13", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 15. twf_home_no_equipment  |  Home No-Equipment (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_home_no_equipment',
  'En Casa Sin Material',
  'Programa de 3 dias de cuerpo completo entrenable en casa sin ningun equipamiento, ideal para mantenerse en forma en cualquier sitio.',
  'Beginner',
  'Home Workout',
  3,
  '{
    "name": "En Casa Sin Material",
    "level": "Beginner",
    "focus": "Cuerpo completo en casa",
    "frequency": 3,
    "duration": 35,
    "description": "Programa de 3 dias de cuerpo completo entrenable en casa sin ningun equipamiento, ideal para mantenerse en forma en cualquier sitio.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "1", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las piernas." }
        ]},
        { "id": "b2", "name": "Circuito de Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla sin peso", "type": "Compound", "sets": "3", "reps": "15-20", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Profundidad completa." },
          { "id": "e4", "name": "Flexiones", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Apoya en rodillas si hace falta." },
          { "id": "e5", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Aprieta el gluteo." },
          { "id": "e6", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Trabaja la espalda baja." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e7", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cuerpo en linea recta." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w2", "name": "Cuerpo Completo B", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento suave." }
        ]},
        { "id": "b6", "name": "Circuito de Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Zancadas en el sitio", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Cada pierna, control en la bajada." },
          { "id": "e11", "name": "Flexion en plano inclinado", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Manos en una mesa o silla estable." },
          { "id": "e12", "name": "Fondos en silla", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Triceps con apoyo." },
          { "id": "e13", "name": "Elevacion de gemelo con peso corporal", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Bicho muerto (dead bug)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "Peso corporal", "tempo": "2-0-2", "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w3", "name": "Cardio y Core", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b10", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e17", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo sostenible." },
          { "id": "e18", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Cadera estable." },
          { "id": "e19", "name": "Sentadilla con salto", "type": "Compound", "sets": "4", "reps": "20s", "rir": "2", "rest": "40s", "intensity": "RPE 8", "tempo": null, "notes": "Aterrizaje suave." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e20", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." },
          { "id": "e21", "name": "Encogimientos abdominales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Sin tirar del cuello." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
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
  'twf_home_no_equipment',
  'Home No-Equipment',
  '3-day full-body program that can be done at home with no equipment, ideal for staying fit anywhere.',
  'Beginner',
  'Home Workout',
  3,
  '{
    "name": "Home No-Equipment",
    "level": "Beginner",
    "focus": "Full Body at Home",
    "frequency": 3,
    "duration": 35,
    "description": "3-day full-body program that can be done at home with no equipment, ideal for staying fit anywhere.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "1", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b2", "name": "Strength Circuit", "type": "main", "exercises": [
          { "id": "e3", "name": "Bodyweight Squat", "type": "Compound", "sets": "3", "reps": "15-20", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Full depth." },
          { "id": "e4", "name": "Push-Up", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Drop to knees if needed." },
          { "id": "e5", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Squeeze the glute." },
          { "id": "e6", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Work the lower back." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e7", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Body in a straight line." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w2", "name": "Full Body B", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle warm-up." }
        ]},
        { "id": "b6", "name": "Strength Circuit", "type": "main", "exercises": [
          { "id": "e10", "name": "Stationary Lunge", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Each leg, control the descent." },
          { "id": "e11", "name": "Incline Push-Up", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Hands on a stable table or chair." },
          { "id": "e12", "name": "Chair Dips", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Supported triceps work." },
          { "id": "e13", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Cardio and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b10", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e17", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Sustainable pace." },
          { "id": "e18", "name": "Mountain Climbers", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Stable hips." },
          { "id": "e19", "name": "Jump Squat", "type": "Compound", "sets": "4", "reps": "20s", "rir": "2", "rest": "40s", "intensity": "RPE 8", "tempo": null, "notes": "Soft landing." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e20", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." },
          { "id": "e21", "name": "Crunch", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Do not pull on the neck." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 16. twf_running_5k  |  5K Running Plan (4 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_running_5k',
  'Plan de Carrera 5K',
  'Programa de 4 dias para preparar un 5K combinando rodajes suaves, series de velocidad, tirada larga y trabajo de fuerza de soporte.',
  'Beginner',
  'Running',
  4,
  '{
    "name": "Plan de Carrera 5K",
    "level": "Beginner",
    "focus": "Resistencia para 5K",
    "frequency": 4,
    "duration": 45,
    "description": "Programa de 4 dias para preparar un 5K combinando rodajes suaves, series de velocidad, tirada larga y trabajo de fuerza de soporte.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Rodaje Suave", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Caminata rapida", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Eleva el pulso de forma gradual." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad dinamica de cadera." }
        ]},
        { "id": "b2", "name": "Carrera Continua", "type": "main", "exercises": [
          { "id": "e3", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "25min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Ritmo conversacional, base aerobica." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w2", "name": "Series de Velocidad", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Trote facil previo a las series." }
        ]},
        { "id": "b5", "name": "Intervalos", "type": "main", "exercises": [
          { "id": "e6", "name": "Intervalo de carrera", "type": "Compound", "sets": "6", "reps": "400m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo de 5K, trote suave en la recuperacion." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w3", "name": "Fuerza de Corredor", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa las piernas." }
        ]},
        { "id": "b8", "name": "Fuerza de Soporte", "type": "main", "exercises": [
          { "id": "e9", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Estabilidad de pierna unilateral." },
          { "id": "e10", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Fortalece el gluteo." },
          { "id": "e11", "name": "Elevacion de gemelo con peso corporal", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Resistencia del gemelo." }
        ]},
        { "id": "b9", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Estabilidad del tronco al correr." },
          { "id": "e13", "name": "Perro-pajaro (bird dog)", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "30s", "intensity": "RPE 6", "tempo": "2-1-2", "notes": "Coordinacion y antirotacion." }
        ]},
        { "id": "b10", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w4", "name": "Tirada Larga", "blocks": [
        { "id": "b11", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e15", "name": "Caminata rapida", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Entra en calor poco a poco." }
        ]},
        { "id": "b12", "name": "Carrera Larga", "type": "main", "exercises": [
          { "id": "e16", "name": "Carrera continua larga", "type": "Compound", "sets": "1", "reps": "40min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Ritmo comodo, construye resistencia." }
        ]},
        { "id": "b13", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_running_5k',
  '5K Running Plan',
  '4-day program to prepare for a 5K, combining easy runs, speed intervals, a long run and supporting strength work.',
  'Beginner',
  'Running',
  4,
  '{
    "name": "5K Running Plan",
    "level": "Beginner",
    "focus": "5K Endurance",
    "frequency": 4,
    "duration": 45,
    "description": "4-day program to prepare for a 5K, combining easy runs, speed intervals, a long run and supporting strength work.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Easy Run", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Brisk Walk", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse gradually." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Dynamic hip mobility." }
        ]},
        { "id": "b2", "name": "Continuous Run", "type": "main", "exercises": [
          { "id": "e3", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "25min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Conversational pace, aerobic base." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w2", "name": "Speed Intervals", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Easy jog before the intervals." }
        ]},
        { "id": "b5", "name": "Intervals", "type": "main", "exercises": [
          { "id": "e6", "name": "Running Interval", "type": "Compound", "sets": "6", "reps": "400m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "5K pace, easy jog on the recovery." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Runner Strength", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the legs." }
        ]},
        { "id": "b8", "name": "Supporting Strength", "type": "main", "exercises": [
          { "id": "e9", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Unilateral leg stability." },
          { "id": "e10", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Strengthen the glute." },
          { "id": "e11", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Calf endurance." }
        ]},
        { "id": "b9", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Trunk stability while running." },
          { "id": "e13", "name": "Bird Dog", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "30s", "intensity": "RPE 6", "tempo": "2-1-2", "notes": "Coordination and anti-rotation." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w4", "name": "Long Run", "blocks": [
        { "id": "b11", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e15", "name": "Brisk Walk", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up gradually." }
        ]},
        { "id": "b12", "name": "Long Run", "type": "main", "exercises": [
          { "id": "e16", "name": "Long Continuous Run", "type": "Compound", "sets": "1", "reps": "40min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Comfortable pace, builds endurance." }
        ]},
        { "id": "b13", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 17. twf_hiit_conditioning  |  HIIT Conditioning (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hiit_conditioning',
  'Acondicionamiento HIIT',
  'Programa de 3 dias de entrenamiento interválico de alta intensidad para mejorar la capacidad cardiovascular y quemar calorias.',
  'Intermediate',
  'HIIT',
  3,
  '{
    "name": "Acondicionamiento HIIT",
    "level": "Intermediate",
    "focus": "Acondicionamiento de alta intensidad",
    "frequency": 3,
    "duration": 35,
    "description": "Programa de 3 dias de entrenamiento interválico de alta intensidad para mejorar la capacidad cardiovascular y quemar calorias.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "HIIT Cuerpo Completo", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las piernas." }
        ]},
        { "id": "b2", "name": "Intervalos Tabata", "type": "main", "exercises": [
          { "id": "e3", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Formato Tabata 20s on / 10s off." },
          { "id": "e4", "name": "Sentadilla con salto", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Segundo bloque Tabata." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e5", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]},
      { "id": "w2", "name": "HIIT Circuito", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e6", "name": "Comba", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Coordinacion y pulso." }
        ]},
        { "id": "b5", "name": "Circuito EMOM 16 min", "type": "main", "exercises": [
          { "id": "e7", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 1 del bloque." },
          { "id": "e8", "name": "Zancadas en el sitio", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 2 del bloque." },
          { "id": "e9", "name": "Flexiones", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 3 del bloque." },
          { "id": "e10", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 9", "tempo": null, "notes": "Minuto 4 del bloque." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w3", "name": "HIIT Sprints", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento progresivo." }
        ]},
        { "id": "b8", "name": "Sprints", "type": "main", "exercises": [
          { "id": "e13", "name": "Sprint en sitio (high knees)", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "Maxima intensidad en cada sprint." }
        ]},
        { "id": "b9", "name": "Finisher de Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Core firme." },
          { "id": "e15", "name": "Encogimientos abdominales", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Ritmo controlado." }
        ]},
        { "id": "b10", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y recupera." }
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
  'twf_hiit_conditioning',
  'HIIT Conditioning',
  '3-day high-intensity interval training program to improve cardiovascular capacity and burn calories.',
  'Intermediate',
  'HIIT',
  3,
  '{
    "name": "HIIT Conditioning",
    "level": "Intermediate",
    "focus": "High-Intensity Conditioning",
    "frequency": 3,
    "duration": 35,
    "description": "3-day high-intensity interval training program to improve cardiovascular capacity and burn calories.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body HIIT", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b2", "name": "Tabata Intervals", "type": "main", "exercises": [
          { "id": "e3", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Tabata 20s on / 10s off format." },
          { "id": "e4", "name": "Jump Squat", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Second Tabata block." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e5", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w2", "name": "HIIT Circuit", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e6", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Coordination and pulse." }
        ]},
        { "id": "b5", "name": "EMOM Circuit 16 min", "type": "main", "exercises": [
          { "id": "e7", "name": "Mountain Climbers", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 1 of the block." },
          { "id": "e8", "name": "Stationary Lunge", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 2 of the block." },
          { "id": "e9", "name": "Push-Up", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 3 of the block." },
          { "id": "e10", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 9", "tempo": null, "notes": "Minute 4 of the block." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w3", "name": "HIIT Sprints", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Progressive warm-up." }
        ]},
        { "id": "b8", "name": "Sprints", "type": "main", "exercises": [
          { "id": "e13", "name": "High Knees Sprint", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "Maximum intensity on every sprint." }
        ]},
        { "id": "b9", "name": "Core Finisher", "type": "main", "exercises": [
          { "id": "e14", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Firm core." },
          { "id": "e15", "name": "Crunch", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Controlled pace." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and recover." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 18. twf_mobility_recovery  |  Mobility and Recovery (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_mobility_recovery',
  'Movilidad y Recuperacion',
  'Programa de 3 dias de movilidad articular, estabilidad y trabajo regenerativo para mejorar el rango de movimiento y favorecer la recuperacion.',
  'All Levels',
  'Mobility',
  3,
  '{
    "name": "Movilidad y Recuperacion",
    "level": "All Levels",
    "focus": "Movilidad y recuperacion",
    "frequency": 3,
    "duration": 35,
    "description": "Programa de 3 dias de movilidad articular, estabilidad y trabajo regenerativo para mejorar el rango de movimiento y favorecer la recuperacion.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Movilidad de Cadera y Tren Inferior", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Marcha en el sitio", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Sube la temperatura corporal." }
        ]},
        { "id": "b2", "name": "Bloque de Movilidad", "type": "main", "exercises": [
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "3-1-3", "notes": "Movilidad global de cadera y torso." },
          { "id": "e3", "name": "Sentadilla profunda con pausa", "type": "Compound", "sets": "3", "reps": "30s", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": null, "notes": "Mantente abajo y respira." },
          { "id": "e4", "name": "Movilidad de tobillo en pared", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "2-1-2", "notes": "Rodilla sobre la punta del pie." }
        ]},
        { "id": "b3", "name": "Estabilidad", "type": "main", "exercises": [
          { "id": "e5", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-2-1", "notes": "Activacion del gluteo." },
          { "id": "e6", "name": "Perro-pajaro (bird dog)", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Control y antirotacion." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." },
          { "id": "e8", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w2", "name": "Movilidad de Columna y Hombro", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b6", "name": "Bloque de Movilidad", "type": "main", "exercises": [
          { "id": "e10", "name": "Gato-camello", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "3-0-3", "notes": "Moviliza la columna con calma." },
          { "id": "e11", "name": "Rotacion toracica", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Abre el pecho con cada giro." },
          { "id": "e12", "name": "Deslizamiento en pared", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Lumbar y brazos pegados a la pared." }
        ]},
        { "id": "b7", "name": "Estabilidad", "type": "main", "exercises": [
          { "id": "e13", "name": "Flexion escapular", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-1", "notes": "Activa el serrato." },
          { "id": "e14", "name": "Rotacion externa de hombro con mancuerna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Salud del manguito rotador." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral." },
          { "id": "e16", "name": "Estiramiento de cuello", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave en cada direccion." }
        ]}
      ]},
      { "id": "w3", "name": "Flujo y Recuperacion", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Marcha en el sitio", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Entra en calor suavemente." }
        ]},
        { "id": "b10", "name": "Flujo de Movilidad", "type": "main", "exercises": [
          { "id": "e18", "name": "Gusano (inchworm)", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Flujo dinamico de cuerpo completo." },
          { "id": "e19", "name": "Flujo perro abajo a cobra", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Coordina respiracion y movimiento." },
          { "id": "e20", "name": "Estiramiento de spiderman", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Abre la cadera en cada paso." }
        ]},
        { "id": "b11", "name": "Respiracion y Regeneracion", "type": "main", "exercises": [
          { "id": "e21", "name": "Ejercicio de respiracion tumbado", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Muy ligero", "tempo": null, "notes": "Respiracion diafragmatica lenta." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja y respira." },
          { "id": "e23", "name": "Flexion sentada hacia delante", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Alarga la cadena posterior." }
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
  'twf_mobility_recovery',
  'Mobility and Recovery',
  '3-day program of joint mobility, stability and regenerative work to improve range of motion and support recovery.',
  'All Levels',
  'Mobility',
  3,
  '{
    "name": "Mobility and Recovery",
    "level": "All Levels",
    "focus": "Mobility and Recovery",
    "frequency": 3,
    "duration": 35,
    "description": "3-day program of joint mobility, stability and regenerative work to improve range of motion and support recovery.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Hip and Lower Body Mobility", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "March in Place", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Raise body temperature." }
        ]},
        { "id": "b2", "name": "Mobility Block", "type": "main", "exercises": [
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "3-1-3", "notes": "Global hip and torso mobility." },
          { "id": "e3", "name": "Deep Squat Hold", "type": "Compound", "sets": "3", "reps": "30s", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": null, "notes": "Stay down and breathe." },
          { "id": "e4", "name": "Ankle Dorsiflexion Drill", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "2-1-2", "notes": "Knee over the toes." }
        ]},
        { "id": "b3", "name": "Stability", "type": "main", "exercises": [
          { "id": "e5", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-2-1", "notes": "Glute activation." },
          { "id": "e6", "name": "Bird Dog", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Control and anti-rotation." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." },
          { "id": "e8", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w2", "name": "Spine and Shoulder Mobility", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b6", "name": "Mobility Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Cat Cow", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "3-0-3", "notes": "Mobilize the spine calmly." },
          { "id": "e11", "name": "Thoracic Rotation", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Open the chest with each rotation." },
          { "id": "e12", "name": "Wall Slides", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Lower back and arms against the wall." }
        ]},
        { "id": "b7", "name": "Stability", "type": "main", "exercises": [
          { "id": "e13", "name": "Scapular Push-Up", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-1", "notes": "Activate the serratus." },
          { "id": "e14", "name": "Dumbbell Shoulder External Rotation", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Rotator cuff health." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." },
          { "id": "e16", "name": "Neck Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle in each direction." }
        ]}
      ]},
      { "id": "w3", "name": "Flow and Recovery", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "March in Place", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up gently." }
        ]},
        { "id": "b10", "name": "Mobility Flow", "type": "main", "exercises": [
          { "id": "e18", "name": "Inchworm", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Dynamic full-body flow." },
          { "id": "e19", "name": "Down Dog to Cobra Flow", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Coordinate breath and movement." },
          { "id": "e20", "name": "Spiderman Stretch", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Open the hip with each step." }
        ]},
        { "id": "b11", "name": "Breathing and Regeneration", "type": "main", "exercises": [
          { "id": "e21", "name": "Breathing Drill Supine", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Very Light", "tempo": null, "notes": "Slow diaphragmatic breathing." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax and breathe." },
          { "id": "e23", "name": "Seated Forward Fold", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the posterior chain." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 19. twf_kettlebell_complex  |  Kettlebell Complexes (3 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_kettlebell_complex',
  'Complejos con Kettlebell',
  'Programa de 3 dias basado en complejos y flujos con kettlebell para desarrollar fuerza, potencia y acondicionamiento de forma eficiente.',
  'Intermediate',
  'Kettlebell',
  3,
  '{
    "name": "Complejos con Kettlebell",
    "level": "Intermediate",
    "focus": "Fuerza y acondicionamiento con kettlebell",
    "frequency": 3,
    "duration": 45,
    "description": "Programa de 3 dias basado en complejos y flujos con kettlebell para desarrollar fuerza, potencia y acondicionamiento de forma eficiente.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Potencia de Cadera", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad de cadera." },
          { "id": "e2", "name": "Swing con kettlebell ligero", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Practica el patron de bisagra." }
        ]},
        { "id": "b2", "name": "Fuerza Explosiva", "type": "main", "exercises": [
          { "id": "e3", "name": "Swing con kettlebell", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "X-0-1", "notes": "Extension de cadera explosiva." },
          { "id": "e4", "name": "Arrancada con kettlebell", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Por brazo, recibe la pesa sin golpe." }
        ]},
        { "id": "b3", "name": "Complejo", "type": "main", "exercises": [
          { "id": "e5", "name": "Complejo de kettlebell: clean, sentadilla frontal y press", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "6 secuencias por brazo sin soltar la pesa." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Fuerza Total", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las piernas." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e8", "name": "Sentadilla goblet con kettlebell", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso erguido, profundidad completa." },
          { "id": "e9", "name": "Press de hombro con kettlebell", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Por brazo, core firme." },
          { "id": "e10", "name": "Remo con kettlebell", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Por brazo, tira con la espalda." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e11", "name": "Paseo del granjero con kettlebell", "type": "Compound", "sets": "3", "reps": "30m", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Tronco estable, hombros abajo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Acondicionamiento con Kettlebell", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b10", "name": "Circuito EMOM 18 min", "type": "main", "exercises": [
          { "id": "e14", "name": "Swing con kettlebell", "type": "Compound", "sets": "6", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 1 de cada bloque." },
          { "id": "e15", "name": "Sentadilla goblet con kettlebell", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 2 de cada bloque." },
          { "id": "e16", "name": "Empuje y arrastre de kettlebell", "type": "Compound", "sets": "6", "reps": "30s", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto 3 de cada bloque." }
        ]},
        { "id": "b11", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e17", "name": "Swing con kettlebell", "type": "Compound", "sets": "1", "reps": "50", "rir": "1", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "50 swings en el menor numero de series." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
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
  'twf_kettlebell_complex',
  'Kettlebell Complexes',
  '3-day program built on kettlebell complexes and flows to develop strength, power and conditioning efficiently.',
  'Intermediate',
  'Kettlebell',
  3,
  '{
    "name": "Kettlebell Complexes",
    "level": "Intermediate",
    "focus": "Kettlebell Strength and Conditioning",
    "frequency": 3,
    "duration": 45,
    "description": "3-day program built on kettlebell complexes and flows to develop strength, power and conditioning efficiently.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Hip Power", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." },
          { "id": "e2", "name": "Light Kettlebell Swing", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Practice the hinge pattern." }
        ]},
        { "id": "b2", "name": "Explosive Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Kettlebell Swing", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "X-0-1", "notes": "Explosive hip extension." },
          { "id": "e4", "name": "Kettlebell Snatch", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Per arm, receive the bell without banging." }
        ]},
        { "id": "b3", "name": "Complex", "type": "main", "exercises": [
          { "id": "e5", "name": "Kettlebell Complex: Clean, Front Squat and Press", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "6 sequences per arm without putting the bell down." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Total Strength", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e8", "name": "Kettlebell Goblet Squat", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Tall torso, full depth." },
          { "id": "e9", "name": "Kettlebell Shoulder Press", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Per arm, firm core." },
          { "id": "e10", "name": "Kettlebell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Per arm, pull with the back." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e11", "name": "Kettlebell Farmer Walk", "type": "Compound", "sets": "3", "reps": "30m", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Stable trunk, shoulders down." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Kettlebell Conditioning", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b10", "name": "EMOM Circuit 18 min", "type": "main", "exercises": [
          { "id": "e14", "name": "Kettlebell Swing", "type": "Compound", "sets": "6", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 1 of each block." },
          { "id": "e15", "name": "Kettlebell Goblet Squat", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 2 of each block." },
          { "id": "e16", "name": "Kettlebell Push and Drag", "type": "Compound", "sets": "6", "reps": "30s", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 3 of each block." }
        ]},
        { "id": "b11", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e17", "name": "Kettlebell Swing", "type": "Compound", "sets": "1", "reps": "50", "rir": "1", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "50 swings in as few sets as possible." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 20. twf_hyrox_prep  |  HYROX Preparation (5 days)
-- ----------------------------------------------------------------------------
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hyrox_prep',
  'Preparacion HYROX',
  'Programa de 5 dias especifico para HYROX que combina fuerza, resistencia a la carrera y las estaciones funcionales propias de la competicion.',
  'Advanced',
  'HYROX',
  5,
  '{
    "name": "Preparacion HYROX",
    "level": "Advanced",
    "focus": "Hibrido HYROX",
    "frequency": 5,
    "duration": 70,
    "description": "Programa de 5 dias especifico para HYROX que combina fuerza, resistencia a la carrera y las estaciones funcionales propias de la competicion.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Fuerza de Piernas", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Entra en calor para la sesion." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad de cadera." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Base de fuerza para las estaciones." },
          { "id": "e4", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior fuerte." },
          { "id": "e5", "name": "Zancadas caminando", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para las zancadas con carga." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Estaciones Funcionales", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b5", "name": "Simulacro de Estaciones", "type": "main", "exercises": [
          { "id": "e8", "name": "Empuje de trineo", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Pasos cortos y potentes." },
          { "id": "e9", "name": "Arrastre de trineo", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Tronco bajo, tira con la pierna." },
          { "id": "e10", "name": "Paseo del granjero con kettlebell", "type": "Compound", "sets": "4", "reps": "40m", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Agarre firme, hombros abajo." },
          { "id": "e11", "name": "Zancadas con saco bulgaro", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para las lunges con carga." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w3", "name": "Resistencia a la Carrera", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Trote facil previo." }
        ]},
        { "id": "b8", "name": "Intervalos de Carrera", "type": "main", "exercises": [
          { "id": "e14", "name": "Intervalo de carrera", "type": "Compound", "sets": "8", "reps": "1000m", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo objetivo de HYROX, consistente." }
        ]},
        { "id": "b9", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w4", "name": "Hibrido Run-Estacion", "blocks": [
        { "id": "b10", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Trote de activacion." }
        ]},
        { "id": "b11", "name": "Simulacro Compromiso", "type": "main", "exercises": [
          { "id": "e17", "name": "Intervalo de carrera", "type": "Compound", "sets": "5", "reps": "1000m", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alterna carrera y estacion sin descanso." },
          { "id": "e18", "name": "Swing con kettlebell", "type": "Compound", "sets": "5", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Estacion tras cada 1000m." },
          { "id": "e19", "name": "Burpees con salto largo", "type": "Compound", "sets": "5", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Especifico de los burpee broad jumps." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]},
      { "id": "w5", "name": "Fuerza de Empuje y Core", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e21", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e22", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Resistencia para el wall ball." },
          { "id": "e23", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para el remo de competicion." },
          { "id": "e24", "name": "Lanzamiento de balon medicinal a pared", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Patron de wall ball." }
        ]},
        { "id": "b15", "name": "Core", "type": "main", "exercises": [
          { "id": "e25", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Estabilidad para las estaciones." },
          { "id": "e26", "name": "Press Pallof", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-2", "notes": "Antirotacion." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hyrox_prep',
  'HYROX Preparation',
  '5-day HYROX-specific program combining strength, running endurance and the functional stations featured in the competition.',
  'Advanced',
  'HYROX',
  5,
  '{
    "name": "HYROX Preparation",
    "level": "Advanced",
    "focus": "HYROX Hybrid",
    "frequency": 5,
    "duration": 70,
    "description": "5-day HYROX-specific program combining strength, running endurance and the functional stations featured in the competition.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Leg Strength", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up for the session." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Strength base for the stations." },
          { "id": "e4", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Strong posterior chain." },
          { "id": "e5", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the loaded lunges." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Functional Stations", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b5", "name": "Station Simulation", "type": "main", "exercises": [
          { "id": "e8", "name": "Sled Push", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Short, powerful steps." },
          { "id": "e9", "name": "Sled Pull", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Low torso, pull with the legs." },
          { "id": "e10", "name": "Kettlebell Farmer Walk", "type": "Compound", "sets": "4", "reps": "40m", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Firm grip, shoulders down." },
          { "id": "e11", "name": "Sandbag Lunges", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the loaded lunges." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w3", "name": "Running Endurance", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Easy jog beforehand." }
        ]},
        { "id": "b8", "name": "Running Intervals", "type": "main", "exercises": [
          { "id": "e14", "name": "Running Interval", "type": "Compound", "sets": "8", "reps": "1000m", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "HYROX target pace, consistent." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w4", "name": "Run-Station Hybrid", "blocks": [
        { "id": "b10", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Activation jog." }
        ]},
        { "id": "b11", "name": "Compromised Simulation", "type": "main", "exercises": [
          { "id": "e17", "name": "Running Interval", "type": "Compound", "sets": "5", "reps": "1000m", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate running and a station with no rest." },
          { "id": "e18", "name": "Kettlebell Swing", "type": "Compound", "sets": "5", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Station after every 1000m." },
          { "id": "e19", "name": "Burpee Broad Jump", "type": "Compound", "sets": "5", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Specific to the burpee broad jumps." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w5", "name": "Push Strength and Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e21", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e22", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Endurance for the wall balls." },
          { "id": "e23", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the competition row." },
          { "id": "e24", "name": "Wall Ball Throw", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Wall ball pattern." }
        ]},
        { "id": "b15", "name": "Core", "type": "main", "exercises": [
          { "id": "e25", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Stability for the stations." },
          { "id": "e26", "name": "Pallof Press", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-2", "notes": "Anti-rotation." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();
