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