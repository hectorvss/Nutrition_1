INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fullbody_beginner',
  'Cuerpo Completo Principiante',
  'Programa de cuerpo completo de 3 dias para principiantes, centrado en aprender los patrones basicos con tecnica y progresion segura.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Cuerpo Completo Principiante",
    "level": "Beginner",
    "focus": "Fuerza general",
    "frequency": 3,
    "duration": 50,
    "description": "Programa de cuerpo completo de 3 dias para principiantes, centrado en aprender los patrones basicos con tecnica y progresion segura.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Activacion general del cuerpo." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Practica el patron de sentadilla." }
        ]},
        { "id": "b2", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla trasera con barra", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioriza la tecnica sobre el peso." },
          { "id": "e4", "name": "Press de banca con mancuernas", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Codos a 45 grados del torso." },
          { "id": "e5", "name": "Remo en polea sentado", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Tira con la espalda, no con los brazos." },
          { "id": "e6", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Peso corporal", "tempo": null, "notes": "Gluteos y abdomen apretados." }
        ]},
        { "id": "b3", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Gato-camello", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Moviliza la columna con calma." }
        ]}
      ]},
      { "id": "w2", "name": "Cuerpo Completo B", "blocks": [
        { "id": "b4", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Comba", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." },
          { "id": "e9", "name": "Aperturas con banda", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Activa la espalda alta." }
        ]},
        { "id": "b5", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e10", "name": "Prensa de pierna", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Empuje firme con los talones." },
          { "id": "e11", "name": "Jalon al pecho", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Lleva la barra al pecho alto." },
          { "id": "e12", "name": "Press de hombro con mancuernas", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Sin arquear la espalda baja." },
          { "id": "e13", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "Peso corporal", "tempo": "2-1-1", "notes": "Aprieta el gluteo arriba." }
        ]},
        { "id": "b6", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w3", "name": "Cuerpo Completo C", "blocks": [
        { "id": "b7", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e15", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento suave." }
        ]},
        { "id": "b8", "name": "Bloque Principal", "type": "main", "exercises": [
          { "id": "e16", "name": "Peso muerto rumano", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Cadera atras, espalda recta." },
          { "id": "e17", "name": "Press de pecho en maquina", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Recorrido completo." },
          { "id": "e18", "name": "Remo con mancuerna a una mano", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "75s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Apoyate bien en el banco." },
          { "id": "e19", "name": "Curl con mancuernas", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Sin balanceo." }
        ]},
        { "id": "b9", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Estiramiento de isquios tumbado", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Suave y mantenido." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();