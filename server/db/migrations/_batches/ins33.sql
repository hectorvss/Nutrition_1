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