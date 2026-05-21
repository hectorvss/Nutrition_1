INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_strength_skill',
  'CrossFit Fuerza y Habilidad',
  'Programa de 4 dias que equilibra el desarrollo de fuerza con barra y la practica de habilidades gimnasticas avanzadas.',
  'Advanced',
  'Strength and Skill',
  4,
  '{
    "name": "CrossFit Fuerza y Habilidad",
    "level": "Advanced",
    "focus": "Fuerza y gimnasticos",
    "frequency": 4,
    "duration": 65,
    "description": "Programa de 4 dias que equilibra el desarrollo de fuerza con barra y la practica de habilidades gimnasticas avanzadas.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Sentadilla y Handstand", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." },
          { "id": "e2", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Triples pesados, mantente firme." }
        ]},
        { "id": "b3", "name": "Habilidad - Pino", "type": "main", "exercises": [
          { "id": "e4", "name": "Pino contra la pared", "type": "Isolation", "sets": "5", "reps": "30s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Cuerpo apretado, hombros activos." },
          { "id": "e5", "name": "Flexion en pino contra la pared", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Rango parcial si hace falta." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Press y Dominada Estricta", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e8", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "150s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Press estricto pesado." }
        ]},
        { "id": "b7", "name": "Habilidad - Tiron Vertical", "type": "main", "exercises": [
          { "id": "e9", "name": "Dominada lastrada", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Dominada estricta con lastre." },
          { "id": "e10", "name": "Fondos en paralelas asistidos", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Control en el descenso." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Peso Muerto y Core", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b10", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e13", "name": "Peso muerto rumano", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Bisagra de cadera pesada." }
        ]},
        { "id": "b11", "name": "Habilidad - Toes to Bar", "type": "main", "exercises": [
          { "id": "e14", "name": "Elevacion de rodillas colgado", "type": "Isolation", "sets": "5", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progresion hacia toes to bar." },
          { "id": "e15", "name": "Plancha hueca (hollow hold)", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Peso corporal", "tempo": null, "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w4", "name": "Halterofilia y Habilidad Mixta", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b14", "name": "Tecnica de Levantamiento", "type": "main", "exercises": [
          { "id": "e18", "name": "Cargada de potencia (power clean)", "type": "Compound", "sets": "6", "reps": "2", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": null, "notes": "Dobles tecnicos, velocidad de barra." },
          { "id": "e19", "name": "Push press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": null, "notes": "Impulso de pierna explosivo." }
        ]},
        { "id": "b15", "name": "Habilidad", "type": "main", "exercises": [
          { "id": "e20", "name": "Pino contra la pared", "type": "Isolation", "sets": "4", "reps": "40s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Mejora la resistencia invertida." },
          { "id": "e21", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Volumen de tiron." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();