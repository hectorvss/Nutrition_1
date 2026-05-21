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