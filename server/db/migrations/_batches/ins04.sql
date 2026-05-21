INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_ppl',
  'Push / Pull / Legs',
  'Classic 6-day push/pull/legs split, training each pattern twice a week for high volume and balanced growth.',
  'Advanced',
  'Push/Pull/Legs',
  6,
  '{
    "name": "Push / Pull / Legs",
    "level": "Advanced",
    "focus": "Hypertrophy",
    "frequency": 6,
    "duration": 70,
    "description": "Classic 6-day push/pull/legs split, training each pattern twice a week for high volume and balanced growth.",
    "schedule": ["M", "T", "W", "T", "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize shoulders in both directions." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the rotator cuff." }
        ]},
        { "id": "b2", "name": "Chest", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Heavy work, stay tight." },
          { "id": "e4", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Target the upper chest." },
          { "id": "e5", "name": "Cable Chest Fly", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Squeeze at the midline." }
        ]},
        { "id": "b3", "name": "Shoulders and Triceps", "type": "main", "exercises": [
          { "id": "e6", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Firm core, no lower-back arch." },
          { "id": "e7", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Long sets, control the weight." },
          { "id": "e8", "name": "Skull Crushers", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows still pointing up." },
          { "id": "e9", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Spread the rope at the end." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e10", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest gently." }
        ]}
      ]},
      { "id": "w2", "name": "Pull", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e11", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b6", "name": "Back", "type": "main", "exercises": [
          { "id": "e12", "name": "Weighted Pull-Up", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full range, no swinging." },
          { "id": "e13", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Neutral spine, pull with the elbows." },
          { "id": "e14", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Bring the bar to the upper chest." }
        ]},
        { "id": "b7", "name": "Rear Delts and Biceps", "type": "main", "exercises": [
          { "id": "e15", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Squeeze the shoulder blades." },
          { "id": "e16", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "8-10", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "No hip drive." },
          { "id": "e17", "name": "Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Work the brachialis." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e18", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the spine and breathe." }
        ]}
      ]},
      { "id": "w3", "name": "Legs", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e19", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b10", "name": "Strength Pattern", "type": "main", "exercises": [
          { "id": "e20", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "180s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Heavy and deep." },
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Stretch the hamstring on the way down." }
        ]},
        { "id": "b11", "name": "Volume", "type": "main", "exercises": [
          { "id": "e22", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Feet shoulder-width apart." },
          { "id": "e23", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the top." },
          { "id": "e24", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pause top and bottom." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w4", "name": "Push (Volume)", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the shoulders." }
        ]},
        { "id": "b14", "name": "Chest and Shoulders", "type": "main", "exercises": [
          { "id": "e27", "name": "Flat Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch well at the bottom." },
          { "id": "e28", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest." },
          { "id": "e29", "name": "Cable Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Constant tension." }
        ]},
        { "id": "b15", "name": "Triceps", "type": "main", "exercises": [
          { "id": "e30", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stretch the long head." },
          { "id": "e31", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the chest." }
        ]}
      ]},
      { "id": "w5", "name": "Pull (Volume)", "blocks": [
        { "id": "b17", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e33", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b18", "name": "Back", "type": "main", "exercises": [
          { "id": "e34", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Drive the elbows back." },
          { "id": "e35", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full range per side." },
          { "id": "e36", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full stretch at the top." }
        ]},
        { "id": "b19", "name": "Biceps and Rear Delts", "type": "main", "exercises": [
          { "id": "e37", "name": "Cable Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Constant tension." },
          { "id": "e38", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Long sets for the rear delts." }
        ]},
        { "id": "b20", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e39", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w6", "name": "Legs (Volume)", "blocks": [
        { "id": "b21", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e40", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b22", "name": "Quads and Glutes", "type": "main", "exercises": [
          { "id": "e41", "name": "Hack Squat", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "120s", "intensity": "RPE 9", "tempo": "3-0-1", "notes": "Controlled depth." },
          { "id": "e42", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Pause squeezing the glutes." },
          { "id": "e43", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stability first." }
        ]},
        { "id": "b23", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e44", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e45", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Control the negative." },
          { "id": "e46", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15-20", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b24", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e47", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5", "saturday": "w6" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 3. twf_gym_fullbody_beginner  |  Beginner Full Body (3 days)
-- ----------------------------------------------------------------------------