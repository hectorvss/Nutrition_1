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
