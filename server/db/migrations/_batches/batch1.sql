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
