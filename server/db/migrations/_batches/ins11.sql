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