INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_ppl',
  'Empuje / Tiron / Pierna',
  'Clasico Push/Pull/Legs de 6 dias, cada patron entrenado dos veces por semana para un volumen alto y crecimiento equilibrado.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Empuje / Tiron / Pierna",
    "level": "Advanced",
    "focus": "Hipertrofia",
    "frequency": 6,
    "duration": 70,
    "description": "Clasico Push/Pull/Legs de 6 dias, cada patron entrenado dos veces por semana para un volumen alto y crecimiento equilibrado.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Empuje", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza los hombros en ambos sentidos." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa el manguito rotador." }
        ]},
        { "id": "b2", "name": "Pecho", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Trabajo pesado, mantente solido." },
          { "id": "e4", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Enfoca el pectoral superior." },
          { "id": "e5", "name": "Cruce de poleas", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aprieta en la linea media." }
        ]},
        { "id": "b3", "name": "Hombros y Triceps", "type": "main", "exercises": [
          { "id": "e6", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Core firme, sin arquear la lumbar." },
          { "id": "e7", "name": "Elevaciones laterales", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Series largas, controla el peso." },
          { "id": "e8", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos quietos apuntando al techo." },
          { "id": "e9", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Separa la cuerda al final." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e10", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pectoral suavemente." }
        ]}
      ]},
      { "id": "w2", "name": "Tiron", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e11", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b6", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e12", "name": "Dominada lastrada", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Recorrido completo, sin balanceo." },
          { "id": "e13", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda neutra, tira con los codos." },
          { "id": "e14", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lleva la barra al pecho alto." }
        ]},
        { "id": "b7", "name": "Deltoide posterior y Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Aprieta los omoplatos." },
          { "id": "e16", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Sin impulso de cadera." },
          { "id": "e17", "name": "Curl martillo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Trabaja el braquial." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Alarga la columna y respira." }
        ]}
      ]},
      { "id": "w3", "name": "Pierna", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b10", "name": "Patron de fuerza", "type": "main", "exercises": [
          { "id": "e20", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Pesada y profunda." },
          { "id": "e21", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Estira el isquio en la bajada." }
        ]},
        { "id": "b11", "name": "Volumen", "type": "main", "exercises": [
          { "id": "e22", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pies a la anchura de hombros." },
          { "id": "e23", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte arriba." },
          { "id": "e24", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pausa arriba y abajo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w4", "name": "Empuje (Volumen)", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa los hombros." }
        ]},
        { "id": "b14", "name": "Pecho y Hombros", "type": "main", "exercises": [
          { "id": "e27", "name": "Press plano con mancuernas", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien abajo." },
          { "id": "e28", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pectoral." },
          { "id": "e29", "name": "Elevacion lateral en polea", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Tension constante." }
        ]},
        { "id": "b15", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e30", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira la cabeza larga." },
          { "id": "e31", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el pectoral." }
        ]}
      ]},
      { "id": "w5", "name": "Tiron (Volumen)", "blocks": [
        { "id": "b17", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e33", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b18", "name": "Espalda", "type": "main", "exercises": [
          { "id": "e34", "name": "Remo en polea sentado", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lleva los codos atras." },
          { "id": "e35", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Rango completo por lado." },
          { "id": "e36", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira arriba del todo." }
        ]},
        { "id": "b19", "name": "Biceps y Deltoide posterior", "type": "main", "exercises": [
          { "id": "e37", "name": "Curl en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tension constante." },
          { "id": "e38", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Series largas para deltoide posterior." }
        ]},
        { "id": "b20", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e39", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w6", "name": "Pierna (Volumen)", "blocks": [
        { "id": "b21", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e40", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activa gluteo y cuadriceps." }
        ]},
        { "id": "b22", "name": "Cuadriceps y Gluteo", "type": "main", "exercises": [
          { "id": "e41", "name": "Sentadilla hack", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "120s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Profundidad controlada." },
          { "id": "e42", "name": "Hip thrust", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pausa apretando el gluteo." },
          { "id": "e43", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estabilidad ante todo." }
        ]},
        { "id": "b23", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e44", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e45", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Controla la fase negativa." },
          { "id": "e46", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b24", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e47", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5", "saturday": "w6" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();