INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_kettlebell_complex',
  'Kettlebell Complexes',
  '3-day program built on kettlebell complexes and flows to develop strength, power and conditioning efficiently.',
  'Intermediate',
  'Kettlebell',
  3,
  '{
    "name": "Kettlebell Complexes",
    "level": "Intermediate",
    "focus": "Kettlebell Strength and Conditioning",
    "frequency": 3,
    "duration": 45,
    "description": "3-day program built on kettlebell complexes and flows to develop strength, power and conditioning efficiently.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Hip Power", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." },
          { "id": "e2", "name": "Light Kettlebell Swing", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Practice the hinge pattern." }
        ]},
        { "id": "b2", "name": "Explosive Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Kettlebell Swing", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "X-0-1", "notes": "Explosive hip extension." },
          { "id": "e4", "name": "Kettlebell Snatch", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Per arm, receive the bell without banging." }
        ]},
        { "id": "b3", "name": "Complex", "type": "main", "exercises": [
          { "id": "e5", "name": "Kettlebell Complex: Clean, Front Squat and Press", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "6 sequences per arm without putting the bell down." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Total Strength", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e8", "name": "Kettlebell Goblet Squat", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Tall torso, full depth." },
          { "id": "e9", "name": "Kettlebell Shoulder Press", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Per arm, firm core." },
          { "id": "e10", "name": "Kettlebell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Per arm, pull with the back." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e11", "name": "Kettlebell Farmer Walk", "type": "Compound", "sets": "3", "reps": "30m", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Stable trunk, shoulders down." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Kettlebell Conditioning", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b10", "name": "EMOM Circuit 18 min", "type": "main", "exercises": [
          { "id": "e14", "name": "Kettlebell Swing", "type": "Compound", "sets": "6", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 1 of each block." },
          { "id": "e15", "name": "Kettlebell Goblet Squat", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 2 of each block." },
          { "id": "e16", "name": "Kettlebell Push and Drag", "type": "Compound", "sets": "6", "reps": "30s", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 3 of each block." }
        ]},
        { "id": "b11", "name": "Finisher", "type": "main", "exercises": [
          { "id": "e17", "name": "Kettlebell Swing", "type": "Compound", "sets": "1", "reps": "50", "rir": "1", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "50 swings in as few sets as possible." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 20. twf_hyrox_prep  |  HYROX Preparation (5 days)
-- ----------------------------------------------------------------------------