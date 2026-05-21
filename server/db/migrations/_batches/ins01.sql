INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_hypertrophy_ul',
  'Hipertrofia Torso/Pierna',
  'Rutina torso/pierna de 4 dias para maximizar el crecimiento muscular con volumen moderado-alto y trabajo cercano al fallo.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Hipertrofia Torso/Pierna",
    "level": "Intermediate",
    "focus": "Hipertrofia",
    "frequency": 4,
    "duration": 65,
    "description": "Rutina torso/pierna de 4 dias para maximizar el crecimiento muscular con volumen moderado-alto y trabajo cercano al fallo.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Torso A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Eleva la frecuencia cardiaca de forma progresiva." },
          { "id": "e2", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta y los manguitos rotadores." }
        ]},
        { "id": "b2", "name": "Pecho y Espalda", "type": "main", "exercises": [
          { "id": "e3", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Escapulas retraidas, controla la bajada." },
          { "id": "e4", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso a 45 grados, tira hacia el ombligo." },
          { "id": "e5", "name": "Press inclinado con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien el pectoral en la fase excentrica." }
        ]},
        { "id": "b3", "name": "Hombros y Brazos", "type": "main", "exercises": [
          { "id": "e6", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Sube con los codos, sin balanceo." },
          { "id": "e7", "name": "Curl con barra", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e8", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo en cada repeticion." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira hondo y relaja los hombros." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna A", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Calienta cadera y rodillas." },
          { "id": "e11", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global previa." }
        ]},
        { "id": "b6", "name": "Cuadriceps y Femoral", "type": "main", "exercises": [
          { "id": "e12", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa, rodillas alineadas." },
          { "id": "e13", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadera atras, barra pegada a la pierna." },
          { "id": "e14", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No bloquees las rodillas arriba." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e15", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae el isquio arriba." },
          { "id": "e16", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo, pausa abajo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "No rebotes, mantente estable." }
        ]}
      ]},
      { "id": "w3", "name": "Torso B", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Espalda y Pecho", "type": "main", "exercises": [
          { "id": "e19", "name": "Dominadas asistidas", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Lleva el pecho a la barra." },
          { "id": "e20", "name": "Press de pecho en maquina", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Aprieta el pecho al final del recorrido." },
          { "id": "e21", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Pecho alto, no encojas los hombros." }
        ]},
        { "id": "b11", "name": "Hombros y Brazos", "type": "main", "exercises": [
          { "id": "e22", "name": "Press de hombro con mancuernas sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Recorrido completo sin bloquear de golpe." },
          { "id": "e23", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Trabaja el deltoides posterior." },
          { "id": "e24", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Agarre neutro, sin balanceo." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave en cada lado." }
        ]}
      ]},
      { "id": "w4", "name": "Pierna B", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Zancadas caminando sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Activacion de gluteo y cuadriceps." }
        ]},
        { "id": "b14", "name": "Femoral y Gluteo", "type": "main", "exercises": [
          { "id": "e27", "name": "Hip thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pausa arriba apretando el gluteo." },
          { "id": "e28", "name": "Sentadilla bulgara", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tronco ligeramente adelantado." },
          { "id": "e29", "name": "Curl femoral tumbado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Contrae fuerte en el tope." }
        ]},
        { "id": "b15", "name": "Cuadriceps y Gemelo", "type": "main", "exercises": [
          { "id": "e30", "name": "Extension de cuadriceps", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pausa de un segundo arriba." },
          { "id": "e31", "name": "Elevacion de gemelo sentado", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Estira bien abajo." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo y la cadera." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();