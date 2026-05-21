INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_strength_531',
  '5/3/1 Strength',
  '4-day 5/3/1-style strength program built around the four big lifts, with ramped top sets and supporting accessory work.',
  'Advanced',
  'Powerlifting',
  4,
  '{
    "name": "5/3/1 Strength",
    "level": "Advanced",
    "focus": "Maximal Strength",
    "frequency": 4,
    "duration": 70,
    "description": "4-day 5/3/1-style strength program built around the four big lifts, with ramped top sets and supporting accessory work.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Squat Day", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b2", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Three ramped sets, last one for max reps.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b3", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e4", "name": "Leg Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volume for the quads." },
          { "id": "e5", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance the hamstrings." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "45s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Anti-extension core work." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Bench Day", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate shoulders and cuff." }
        ]},
        { "id": "b6", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e9", "name": "Barbell Bench Press", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-1-1", "notes": "Brief pause on the chest every rep.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b7", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e10", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Volume for the upper chest." },
          { "id": "e11", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Balance pushing with pulling." },
          { "id": "e12", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Support for the bench press." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Deadlift Day", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b10", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e15", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "210s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Reset the bar between reps on the heavy set.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "180s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "210s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "240s" }
          ]}
        ]},
        { "id": "b11", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e16", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." },
          { "id": "e17", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pulling strength." },
          { "id": "e18", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Overhead Press Day", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b14", "name": "Main Lift 5/3/1", "type": "main", "exercises": [
          { "id": "e21", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "5/3/1", "rir": "1", "rest": "180s", "intensity": "65-95% 1RM", "tempo": "2-0-1", "notes": "Firm core, no lower-back arch.", "setDetails": [
            { "set": 1, "reps": "5", "rir": "4", "intensity": "65% 1RM", "rest": "150s" },
            { "set": 2, "reps": "3", "rir": "2", "intensity": "85% 1RM", "rest": "180s" },
            { "set": 3, "reps": "1+", "rir": "1", "intensity": "95% 1RM", "rest": "210s" }
          ]}
        ]},
        { "id": "b15", "name": "Accessories", "type": "main", "exercises": [
          { "id": "e22", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Back volume." },
          { "id": "e23", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Delt health and size." },
          { "id": "e24", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Arm accessory." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 5. twf_gym_powerbuilding  |  Powerbuilding (4 days)
-- ----------------------------------------------------------------------------