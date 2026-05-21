INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_strength_531',
  'Fuerza 5/3/1',
  'Programa de fuerza estilo 5/3/1 de 4 dias en torno a los cuatro grandes levantamientos, con series principales en rampa y trabajo accesorio.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "Fuerza 5/3/1",
    "level": "Advanced",
    "focus": "Fuerza maxima",
    "frequency": 4,
    "duration": 70,
    "description": "Programa de fuerza estilo 5/3/1 de 4 dias en torno a los cuatro grandes levantamientos, con series principales en rampa y trabajo accesorio.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Dia de Sentadilla", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b2", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Tres series en rampa, ultima al maximo de reps.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e4", "name": "Prensa de pierna", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen para cuadriceps." },
          { "id": "e5", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el isquio." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Core anti-extension." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Dia de Press de Banca", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa hombros y manguito." }
        ]},
        { "id": "b6", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e9", "name": "Press de banca con barra", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-1-1", "notes": "Pausa breve en el pecho cada repeticion.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e10", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen para pectoral superior." },
          { "id": "e11", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Equilibra el empuje con tiron." },
          { "id": "e12", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Apoyo al press." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral." }
        ]}
      ]},
      { "id": "w3", "name": "Dia de Peso Muerto", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna." }
        ]},
        { "id": "b10", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e15", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Reset de la barra entre repeticiones en la serie pesada.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b11", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e16", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo unilateral." },
          { "id": "e17", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Fuerza de tiron vertical." },
          { "id": "e18", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w4", "name": "Dia de Press Militar", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza el hombro." }
        ]},
        { "id": "b14", "name": "Levantamiento Principal 5/3/1", "type": "main", "exercises": [
          { "id": "e21", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "180s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "210s" }
          ]}
        ]},
        { "id": "b15", "name": "Accesorios", "type": "main", "exercises": [
          { "id": "e22", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volumen de espalda." },
          { "id": "e23", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Salud y tamano del deltoide." },
          { "id": "e24", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Accesorio de brazo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();