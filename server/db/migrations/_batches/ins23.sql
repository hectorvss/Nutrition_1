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