INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fat_loss',
  'Recomposition and Fat Loss',
  '4-day program combining hypertrophy work to preserve muscle with metabolic conditioning blocks.',
  'Intermediate',
  'Fat Loss',
  4,
  '{
    "name": "Recomposition and Fat Loss",
    "level": "Intermediate",
    "focus": "Fat Loss",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program combining hypertrophy work to preserve muscle with metabolic conditioning blocks.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Upper + Cardio", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e2", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Maintain the hypertrophy stimulus." },
          { "id": "e3", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Build back width." },
          { "id": "e4", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "No lower-back arch." }
        ]},
        { "id": "b3", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e5", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Circuit with no rest between exercises." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Firm core." },
          { "id": "e7", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Rest at the end of the round." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Lower + Cardio", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e10", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Quads and glutes." },
          { "id": "e11", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Posterior chain." },
          { "id": "e12", "name": "Walking Lunges", "type": "Compound", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." }
        ]},
        { "id": "b7", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e13", "name": "Bodyweight Squat", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "High pace." },
          { "id": "e14", "name": "March in Place", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 7", "tempo": null, "notes": "Active recovery." },
          { "id": "e15", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "40s", "rir": "1", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Finish the round strong." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Full Body + HIIT", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Strength", "type": "main", "exercises": [
          { "id": "e18", "name": "Goblet Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Whole-leg work." },
          { "id": "e19", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back." },
          { "id": "e20", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Chest." }
        ]},
        { "id": "b11", "name": "HIIT", "type": "main", "exercises": [
          { "id": "e21", "name": "Burpees", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "20s on / 40s off format." },
          { "id": "e22", "name": "Mountain Climbers", "type": "Compound", "sets": "6", "reps": "20s", "rir": "1", "rest": "40s", "intensity": "RPE 9", "tempo": null, "notes": "Alternate with the burpees." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and bring the pulse down." }
        ]}
      ]},
      { "id": "w4", "name": "Upper + Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e24", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e25", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Upper chest." },
          { "id": "e26", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back." },
          { "id": "e27", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Shoulder." }
        ]},
        { "id": "b15", "name": "Core Circuit", "type": "main", "exercises": [
          { "id": "e28", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Anti-extension." },
          { "id": "e29", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." },
          { "id": "e30", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e31", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 8. twf_gym_arms_priority  |  Arms Priority (4 days)
-- ----------------------------------------------------------------------------