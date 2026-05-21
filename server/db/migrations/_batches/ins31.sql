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