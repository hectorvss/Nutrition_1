INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_functional_athletic',
  'Functional Athletic Performance',
  '4-day program for athletes combining power, strength, plyometrics and agility to improve overall performance.',
  'Intermediate',
  'Athletic Performance',
  4,
  '{
    "name": "Functional Athletic Performance",
    "level": "Intermediate",
    "focus": "Athleticism and Power",
    "frequency": 4,
    "duration": 60,
    "description": "4-day program for athletes combining power, strength, plyometrics and agility to improve overall performance.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Lower Body Power", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Dynamic hip mobility." },
          { "id": "e2", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Wake up the nervous system." }
        ]},
        { "id": "b2", "name": "Plyometrics", "type": "main", "exercises": [
          { "id": "e3", "name": "Box Jumps", "type": "Compound", "sets": "5", "reps": "4", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "Maximum intent, soft landing." }
        ]},
        { "id": "b3", "name": "Strength", "type": "main", "exercises": [
          { "id": "e4", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Explosive concentric." },
          { "id": "e5", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral stability." },
          { "id": "e6", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstring health." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Upper Body Power", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b6", "name": "Power", "type": "main", "exercises": [
          { "id": "e9", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Leg-to-arm power transfer." }
        ]},
        { "id": "b7", "name": "Strength", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "5", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": "2-0-X", "notes": "Explosive push." },
          { "id": "e11", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance the push." },
          { "id": "e12", "name": "Pull-Up Assisted", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pull." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Agility and Conditioning", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Coordination and pulse." }
        ]},
        { "id": "b10", "name": "Agility", "type": "main", "exercises": [
          { "id": "e15", "name": "Agility Ladder Sprint", "type": "Compound", "sets": "6", "reps": "20s", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Fast feet, change of direction." },
          { "id": "e16", "name": "Shuttle Run", "type": "Compound", "sets": "6", "reps": "20m", "rir": "2", "rest": "60s", "intensity": "RPE 9", "tempo": null, "notes": "Accelerate and brake with control." }
        ]},
        { "id": "b11", "name": "Conditioning", "type": "main", "exercises": [
          { "id": "e17", "name": "Kettlebell Swing", "type": "Compound", "sets": "4", "reps": "20", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": null, "notes": "Power-endurance circuit." },
          { "id": "e18", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Finish the round with intensity." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w4", "name": "Total Strength and Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Posterior chain." },
          { "id": "e22", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical push." },
          { "id": "e23", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral strength." }
        ]},
        { "id": "b15", "name": "Anti-Rotation Core", "type": "main", "exercises": [
          { "id": "e24", "name": "Pallof Press", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-2", "notes": "Resist the rotation." },
          { "id": "e25", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e26", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 13. twf_calisthenics_foundations  |  Calisthenics Foundations (3 days)
-- ----------------------------------------------------------------------------