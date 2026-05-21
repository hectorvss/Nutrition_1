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