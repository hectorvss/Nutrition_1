INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_wod_classic',
  'CrossFit WOD Clasico',
  'Programa funcional de 5 dias con calentamiento, fuerza y un WOD diario combinando halterofilia, gimnasticos y acondicionamiento.',
  'Intermediate',
  'CrossFit',
  5,
  '{
    "name": "CrossFit WOD Clasico",
    "level": "Intermediate",
    "focus": "Fitness funcional",
    "frequency": 5,
    "duration": 60,
    "description": "Programa funcional de 5 dias con calentamiento, fuerza y un WOD diario combinando halterofilia, gimnasticos y acondicionamiento.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Lunes - Fuerza y WOD", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso y coordina." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara cadera y rodilla." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "5x5 progresivo, tecnica solida." }
        ]},
        { "id": "b3", "name": "WOD - AMRAP 15 min", "type": "main", "exercises": [
          { "id": "e4", "name": "Thruster con mancuernas", "type": "Compound", "sets": "1", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "AMRAP 15: rota entre los tres ejercicios." },
          { "id": "e5", "name": "Dominadas asistidas", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Maximas rondas posibles en 15 min." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "8", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Ritmo sostenible, sin parar." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Martes - Halterofilia", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Estiramiento del mundo", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad global." }
        ]},
        { "id": "b6", "name": "Tecnica de Levantamiento", "type": "main", "exercises": [
          { "id": "e9", "name": "Cargada de potencia (power clean)", "type": "Compound", "sets": "6", "reps": "3", "rir": "3", "rest": "120s", "intensity": "70% 1RM", "tempo": null, "notes": "Velocidad y tecnica, no fallo." },
          { "id": "e10", "name": "Push press", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Impulso de pierna explosivo." }
        ]},
        { "id": "b7", "name": "WOD - 5 Rondas Por Tiempo", "type": "main", "exercises": [
          { "id": "e11", "name": "Swing con kettlebell", "type": "Compound", "sets": "5", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "5 rondas lo mas rapido posible." },
          { "id": "e12", "name": "Saltos al cajon", "type": "Compound", "sets": "5", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Extension completa de cadera arriba." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre hombros y pecho." }
        ]}
      ]},
      { "id": "w3", "name": "Miercoles - Gimnasticos", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Saltos de tijera", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general." }
        ]},
        { "id": "b10", "name": "Habilidad", "type": "main", "exercises": [
          { "id": "e15", "name": "Dominadas asistidas", "type": "Compound", "sets": "5", "reps": "6", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Practica de tiron vertical estricto." },
          { "id": "e16", "name": "Fondos en paralelas asistidos", "type": "Compound", "sets": "4", "reps": "8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Control en el descenso." }
        ]},
        { "id": "b11", "name": "WOD - EMOM 12 min", "type": "main", "exercises": [
          { "id": "e17", "name": "Flexiones", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto par: flexiones." },
          { "id": "e18", "name": "Zancadas caminando", "type": "Compound", "sets": "6", "reps": "16", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minuto impar: zancadas." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w4", "name": "Jueves - Fuerza y WOD", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e21", "name": "Peso muerto rumano", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Cadena posterior pesada." }
        ]},
        { "id": "b15", "name": "WOD - 21-15-9", "type": "main", "exercises": [
          { "id": "e22", "name": "Thruster con mancuernas", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Esquema descendente 21-15-9.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]},
          { "id": "e23", "name": "Burpees", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alterna con los thrusters por tiempo.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]}
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sin rebotes." }
        ]}
      ]},
      { "id": "w5", "name": "Viernes - Metcon Largo", "blocks": [
        { "id": "b17", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b18", "name": "WOD - AMRAP 20 min", "type": "main", "exercises": [
          { "id": "e26", "name": "Remo en maquina", "type": "Compound", "sets": "1", "reps": "250m", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "AMRAP 20: rota entre las cuatro estaciones." },
          { "id": "e27", "name": "Swing con kettlebell", "type": "Compound", "sets": "1", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Bisagra de cadera potente." },
          { "id": "e28", "name": "Saltos al cajon", "type": "Compound", "sets": "1", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Aterrizaje suave." },
          { "id": "e29", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo constante toda la pieza." }
        ]},
        { "id": "b19", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();