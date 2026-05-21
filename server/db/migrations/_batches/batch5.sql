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