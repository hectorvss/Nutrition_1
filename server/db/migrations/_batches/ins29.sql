INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_home_no_equipment',
  'En Casa Sin Material',
  'Programa de 3 dias de cuerpo completo entrenable en casa sin ningun equipamiento, ideal para mantenerse en forma en cualquier sitio.',
  'Beginner',
  'Home Workout',
  3,
  '{
    "name": "En Casa Sin Material",
    "level": "Beginner",
    "focus": "Cuerpo completo en casa",
    "frequency": 3,
    "duration": 35,
    "description": "Programa de 3 dias de cuerpo completo entrenable en casa sin ningun equipamiento, ideal para mantenerse en forma en cualquier sitio.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Cuerpo Completo A", "blocks": [
        { "id": "b1", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." },
          { "id": "e2", "name": "Sentadilla sin peso", "type": "Compound", "sets": "1", "reps": "15", "rir": null, "rest": "20s", "intensity": "Peso corporal", "tempo": null, "notes": "Prepara las piernas." }
        ]},
        { "id": "b2", "name": "Circuito de Fuerza", "type": "main", "exercises": [
          { "id": "e3", "name": "Sentadilla sin peso", "type": "Compound", "sets": "3", "reps": "15-20", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Profundidad completa." },
          { "id": "e4", "name": "Flexiones", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Apoya en rodillas si hace falta." },
          { "id": "e5", "name": "Puente de gluteo", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Aprieta el gluteo." },
          { "id": "e6", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Trabaja la espalda baja." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e7", "name": "Plancha", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cuerpo en linea recta." }
        ]},
        { "id": "b4", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Respira y relaja." }
        ]}
      ]},
      { "id": "w2", "name": "Cuerpo Completo B", "blocks": [
        { "id": "b5", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Marcha en el sitio", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Calentamiento suave." }
        ]},
        { "id": "b6", "name": "Circuito de Fuerza", "type": "main", "exercises": [
          { "id": "e10", "name": "Zancadas en el sitio", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Cada pierna, control en la bajada." },
          { "id": "e11", "name": "Flexion en plano inclinado", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Manos en una mesa o silla estable." },
          { "id": "e12", "name": "Fondos en silla", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Triceps con apoyo." },
          { "id": "e13", "name": "Elevacion de gemelo con peso corporal", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Rango completo." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Bicho muerto (dead bug)", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "Peso corporal", "tempo": "2-0-2", "notes": "Lumbar pegada al suelo." }
        ]},
        { "id": "b8", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Estiramiento de flexor de cadera", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Un lado cada vez." }
        ]}
      ]},
      { "id": "w3", "name": "Cardio y Core", "blocks": [
        { "id": "b9", "name": "Calentamiento", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Saltos de tijera", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Sube el pulso." }
        ]},
        { "id": "b10", "name": "Circuito Metabolico", "type": "main", "exercises": [
          { "id": "e17", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Ritmo sostenible." },
          { "id": "e18", "name": "Escaladores (mountain climbers)", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Cadera estable." },
          { "id": "e19", "name": "Sentadilla con salto", "type": "Compound", "sets": "4", "reps": "20s", "rir": "2", "rest": "40s", "intensity": "RPE 8", "tempo": null, "notes": "Aterrizaje suave." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e20", "name": "Plancha lateral", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Peso corporal", "tempo": null, "notes": "Cada lado." },
          { "id": "e21", "name": "Encogimientos abdominales", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Sin tirar del cuello." }
        ]},
        { "id": "b12", "name": "Estiramientos", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Postura del nino", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Ligero", "tempo": null, "notes": "Baja pulsaciones." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'es'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();