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