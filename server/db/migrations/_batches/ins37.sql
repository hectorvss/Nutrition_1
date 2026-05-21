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