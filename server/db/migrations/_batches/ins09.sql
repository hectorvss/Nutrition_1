INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_powerbuilding',
  'Powerbuilding',
  'Hibrido de 4 dias que combina levantamientos pesados de fuerza al inicio de la sesion con trabajo accesorio de hipertrofia.',
  'Intermediate',
  'Powerbuilding',
  4,
  '{
    "name": "Powerbuilding",
    "level": "Intermediate",
    "focus": "Fuerza e hipertrofia",
    "frequency": 4,
    "duration": 75,
    "description": "Hibrido de 4 dias que combina levantamientos pesados de fuerza al inicio de la sesion con trabajo accesorio de hipertrofia.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso Pesado", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." },
          { "id": "e2", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "180s", "intensity": "80-85% 1RM", "tempo": "2-1-1", "notes": "Trabajo pesado, mantente solido y explosivo." }
        ]},
        { "id": "b3", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e4", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el empuje pesado." },
          { "id": "e5", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pectoral superior." },
          { "id": "e6", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Amplitud de la espalda." },
          { "id": "e7", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Trabajo de brazo." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna Pesada", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "4-5", "rir": "2", "rest": "210s", "intensity": "80-85% 1RM", "tempo": "2-0-1", "notes": "Profundidad completa, mantente firme." }
        ]},
        { "id": "b7", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de cuadriceps." },
          { "id": "e13", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aislamiento del isquio." },
          { "id": "e14", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w3", "name": "Torso Volumen", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b10", "name": "Fuerza ligera", "type": "main", "exercises": [
          { "id": "e17", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Press pesado de hombro." }
        ]},
        { "id": "b11", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e18", "name": "Press de pecho en maquina", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de pecho." },
          { "id": "e19", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de espalda." },
          { "id": "e20", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Deltoide lateral." },
          { "id": "e21", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Biceps." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w4", "name": "Pierna Volumen", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e23", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa el tren inferior." }
        ]},
        { "id": "b14", "name": "Fuerza ligera", "type": "main", "exercises": [
          { "id": "e24", "name": "Peso muerto rumano", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Bisagra de cadera pesada." }
        ]},
        { "id": "b15", "name": "Hipertrofia", "type": "main", "exercises": [
          { "id": "e25", "name": "Sentadilla hack", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Volumen de cuadriceps." },
          { "id": "e26", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Gluteo." },
          { "id": "e27", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aislamiento." },
          { "id": "e28", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e29", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();