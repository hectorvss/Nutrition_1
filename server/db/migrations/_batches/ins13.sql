INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fat_loss',
  'Recomposicion y Perdida de Grasa',
  'Programa de 4 dias que combina trabajo de hipertrofia para preservar musculo con bloques de acondicionamiento metabolico.',
  'Intermediate',
  'Fat Loss',
  4,
  '{
    "name": "Recomposicion y Perdida de Grasa",
    "level": "Intermediate",
    "focus": "Perdida de grasa",
    "frequency": 4,
    "duration": 55,
    "description": "Programa de 4 dias que combina trabajo de hipertrofia para preservar musculo con bloques de acondicionamiento metabolico.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso + Cardio", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e2", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Manten el estimulo de hipertrofia." },
          { "id": "e3", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda ancha." },
          { "id": "e4", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Sin arquear la lumbar." }
        ]},
        { "id": "b3", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e5", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Circuito sin descanso entre ejercicios." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Core firme." },
          { "id": "e7", "name": "Comba", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Descansa al final de la ronda." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el pectoral." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna + Cardio", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Cuadriceps y gluteo." },
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Zancadas caminando", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo unilateral." }
        ]},
        { "id": "b7", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e13", "name": "Sentadilla sin peso", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo alto." },
          { "id": "e14", "name": "Marcha en el sitio", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 7", "tempo": null, "notes": "Recuperacion activa." },
          { "id": "e15", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Cierra la ronda fuerte." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Cuerpo Completo + HIIT", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e18", "name": "Sentadilla goblet", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pierna global." },
          { "id": "e19", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e20", "name": "Press de banca con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pecho." }
        ]},
        { "id": "b11", "name": "HIIT", "type": "main", "exercises": [
          { "id": "e21", "name": "Burpees", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Formato 20s on / 40s off." },
          { "id": "e22", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Alterna con los burpees." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y baja pulsaciones." }
        ]}
      ]},
      { "id": "w4", "name": "Torso + Core", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e25", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pectoral superior." },
          { "id": "e26", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e27", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Hombro." }
        ]},
        { "id": "b15", "name": "Circuito de Core", "type": "main", "exercises": [
          { "id": "e28", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Anti-extension." },
          { "id": "e29", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." },
          { "id": "e30", "name": "Bicho muerto (dead bug)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "Peso corporal", "tempo": "2-0-2", "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e31", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();