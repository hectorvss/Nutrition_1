INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_arms_priority',
  'Prioridad Brazos',
  'Rutina de 4 dias que prioriza el desarrollo de biceps y triceps con alta frecuencia, sin descuidar el resto del cuerpo.',
  'Intermediate',
  'Specialization',
  4,
  '{
    "name": "Prioridad Brazos",
    "level": "Intermediate",
    "focus": "Brazos",
    "frequency": 4,
    "duration": 60,
    "description": "Rutina de 4 dias que prioriza el desarrollo de biceps y triceps con alta frecuencia, sin descuidar el resto del cuerpo.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Brazos A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Circulos de brazos", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza codo y hombro." }
        ]},
        { "id": "b2", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e2", "name": "Curl con barra", "type": "Isolation", "sets": "4", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos fijos al costado." },
          { "id": "e3", "name": "Curl en banco predicador (maquina)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira bien abajo." },
          { "id": "e4", "name": "Curl martillo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Trabaja el braquial." }
        ]},
        { "id": "b3", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e5", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "4", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Codos quietos." },
          { "id": "e6", "name": "Extension de triceps en polea con cuerda", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Separa la cuerda al final." },
          { "id": "e7", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira la cabeza larga." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]},
      { "id": "w2", "name": "Pierna", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las rodillas." }
        ]},
        { "id": "b6", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e10", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Profundidad completa." },
          { "id": "e11", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior." },
          { "id": "e12", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Volumen de cuadriceps." }
        ]},
        { "id": "b7", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e13", "name": "Curl femoral sentado", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Isquios." },
          { "id": "e14", "name": "Elevacion de gemelo de pie", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w3", "name": "Brazos B", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta el codo y el hombro." }
        ]},
        { "id": "b10", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e17", "name": "Extension de triceps en polea", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Bloquea el codo." },
          { "id": "e18", "name": "Press frances (rompecraneos)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Cabeza larga." },
          { "id": "e19", "name": "Extension de triceps por encima de la cabeza", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Estira al maximo." }
        ]},
        { "id": "b11", "name": "Biceps", "type": "main", "exercises": [
          { "id": "e20", "name": "Curl en polea", "type": "Isolation", "sets": "4", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tension constante." },
          { "id": "e21", "name": "Curl con mancuernas", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Supina bien arriba." },
          { "id": "e22", "name": "Curl martillo con mancuerna", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Series largas para el braquial." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja hombros y biceps." }
        ]}
      ]},
      { "id": "w4", "name": "Torso", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Comba", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b14", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e25", "name": "Press de banca con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pecho." },
          { "id": "e26", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Espalda." },
          { "id": "e27", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hombro." }
        ]},
        { "id": "b15", "name": "Aislamiento", "type": "main", "exercises": [
          { "id": "e28", "name": "Elevaciones laterales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Deltoide lateral." },
          { "id": "e29", "name": "Pajaro en maquina (peck deck inverso)", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Deltoide posterior." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Estiramiento de trapecio superior", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave por lado." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();