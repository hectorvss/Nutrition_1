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
