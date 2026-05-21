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