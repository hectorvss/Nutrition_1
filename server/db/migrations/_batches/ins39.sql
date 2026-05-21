INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hyrox_prep',
  'Preparacion HYROX',
  'Programa de 5 dias especifico para HYROX que combina fuerza, resistencia a la carrera y las estaciones funcionales propias de la competicion.',
  'Advanced',
  'HYROX',
  5,
  '{
    "name": "Preparacion HYROX",
    "level": "Advanced",
    "focus": "Hibrido HYROX",
    "frequency": 5,
    "duration": 70,
    "description": "Programa de 5 dias especifico para HYROX que combina fuerza, resistencia a la carrera y las estaciones funcionales propias de la competicion.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Fuerza de Piernas", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Entra en calor para la sesion." },
          { "id": "e2", "name": "Estiramiento del mundo", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Movilidad de cadera." }
        ]},
        { "id": "b2", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Base de fuerza para las estaciones." },
          { "id": "e4", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Cadena posterior fuerte." },
          { "id": "e5", "name": "Zancadas caminando", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para las zancadas con carga." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w2", "name": "Estaciones Funcionales", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Comba", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b5", "name": "Simulacro de Estaciones", "type": "main", "exercises": [
          { "id": "e8", "name": "Empuje de trineo", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Pasos cortos y potentes." },
          { "id": "e9", "name": "Arrastre de trineo", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Tronco bajo, tira con la pierna." },
          { "id": "e10", "name": "Paseo del granjero con kettlebell", "type": "Compound", "sets": "4", "reps": "40m", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Agarre firme, hombros abajo." },
          { "id": "e11", "name": "Zancadas con saco bulgaro", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para las lunges con carga." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja las piernas." }
        ]}
      ]},
      { "id": "w3", "name": "Resistencia a la Carrera", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Trote facil previo." }
        ]},
        { "id": "b8", "name": "Intervalos de Carrera", "type": "main", "exercises": [
          { "id": "e14", "name": "Intervalo de carrera", "type": "Compound", "sets": "8", "reps": "1000m", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo objetivo de HYROX, consistente." }
        ]},
        { "id": "b9", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de figura 4", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Relaja el gluteo." }
        ]}
      ]},
      { "id": "w4", "name": "Hibrido Run-Estacion", "blocks": [
        { "id": "b10", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Carrera continua suave", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Ligero", "tempo": null, "notes": "Trote de activacion." }
        ]},
        { "id": "b11", "name": "Simulacro Compromiso", "type": "main", "exercises": [
          { "id": "e17", "name": "Intervalo de carrera", "type": "Compound", "sets": "5", "reps": "1000m", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alterna carrera y estacion sin descanso." },
          { "id": "e18", "name": "Swing con kettlebell", "type": "Compound", "sets": "5", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Estacion tras cada 1000m." },
          { "id": "e19", "name": "Burpees con salto largo", "type": "Compound", "sets": "5", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Especifico de los burpee broad jumps." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]},
      { "id": "w5", "name": "Fuerza de Empuje y Core", "blocks": [
        { "id": "b13", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e21", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calienta la espalda alta." }
        ]},
        { "id": "b14", "name": "Fuerza", "type": "main", "exercises": [
          { "id": "e22", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Resistencia para el wall ball." },
          { "id": "e23", "name": "Remo con barra", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Especifico para el remo de competicion." },
          { "id": "e24", "name": "Lanzamiento de balon medicinal a pared", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Patron de wall ball." }
        ]},
        { "id": "b15", "name": "Core", "type": "main", "exercises": [
          { "id": "e25", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Estabilidad para las estaciones." },
          { "id": "e26", "name": "Press Pallof", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-2", "notes": "Antirotacion." }
        ]},
        { "id": "b16", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Estiramiento de pecho en marco de puerta", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Abre el pecho." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();