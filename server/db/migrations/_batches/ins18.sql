INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_wod_classic',
  'Classic CrossFit WOD',
  '5-day functional program with warm-up, strength and a daily WOD blending weightlifting, gymnastics and conditioning.',
  'Intermediate',
  'CrossFit',
  5,
  '{
    "name": "Classic CrossFit WOD",
    "level": "Intermediate",
    "focus": "Functional Fitness",
    "frequency": 5,
    "duration": 60,
    "description": "5-day functional program with warm-up, strength and a daily WOD blending weightlifting, gymnastics and conditioning.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Monday - Strength and WOD", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise pulse and coordination." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Progressive 5x5, solid technique." }
        ]},
        { "id": "b3", "name": "WOD - AMRAP 15 min", "type": "main", "exercises": [
          { "id": "e4", "name": "Dumbbell Thruster", "type": "Compound", "sets": "1", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "AMRAP 15: rotate through the three exercises." },
          { "id": "e5", "name": "Pull-Up Assisted", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "As many rounds as possible in 15 min." },
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "8", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Sustainable pace, do not stop." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Tuesday - Weightlifting", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b6", "name": "Lift Technique", "type": "main", "exercises": [
          { "id": "e9", "name": "Power Clean", "type": "Compound", "sets": "6", "reps": "3", "rir": "3", "rest": "120s", "intensity": "70% 1RM", "tempo": null, "notes": "Speed and technique, never to failure." },
          { "id": "e10", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "120s", "intensity": "75% 1RM", "tempo": null, "notes": "Explosive leg drive." }
        ]},
        { "id": "b7", "name": "WOD - 5 Rounds For Time", "type": "main", "exercises": [
          { "id": "e11", "name": "Kettlebell Swing", "type": "Compound", "sets": "5", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "5 rounds as fast as possible." },
          { "id": "e12", "name": "Box Jumps", "type": "Compound", "sets": "5", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Full hip extension at the top." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open shoulders and chest." }
        ]}
      ]},
      { "id": "w3", "name": "Wednesday - Gymnastics", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Skill", "type": "main", "exercises": [
          { "id": "e15", "name": "Pull-Up Assisted", "type": "Compound", "sets": "5", "reps": "6", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Strict vertical pulling practice." },
          { "id": "e16", "name": "Assisted Dips", "type": "Compound", "sets": "4", "reps": "8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Control the descent." }
        ]},
        { "id": "b11", "name": "WOD - EMOM 12 min", "type": "main", "exercises": [
          { "id": "e17", "name": "Push-Up", "type": "Compound", "sets": "6", "reps": "12", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Even minute: push-ups." },
          { "id": "e18", "name": "Walking Lunges", "type": "Compound", "sets": "6", "reps": "16", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Odd minute: lunges." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e19", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w4", "name": "Thursday - Strength and WOD", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e20", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e21", "name": "Romanian Deadlift", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Heavy posterior chain." }
        ]},
        { "id": "b15", "name": "WOD - 21-15-9", "type": "main", "exercises": [
          { "id": "e22", "name": "Dumbbell Thruster", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Descending 21-15-9 scheme.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]},
          { "id": "e23", "name": "Burpees", "type": "Compound", "sets": "3", "reps": "21-15-9", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate with thrusters, for time.", "setDetails": [
            { "set": 1, "reps": "21", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 2, "reps": "15", "rir": "2", "intensity": "RPE 8", "rest": "0s" },
            { "set": 3, "reps": "9", "rir": "1", "intensity": "RPE 9", "rest": "0s" }
          ]}
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e24", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w5", "name": "Friday - Long Metcon", "blocks": [
        { "id": "b17", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e25", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b18", "name": "WOD - AMRAP 20 min", "type": "main", "exercises": [
          { "id": "e26", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "250m", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "AMRAP 20: rotate through the four stations." },
          { "id": "e27", "name": "Kettlebell Swing", "type": "Compound", "sets": "1", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Powerful hip hinge." },
          { "id": "e28", "name": "Box Jumps", "type": "Compound", "sets": "1", "reps": "15", "rir": "2", "rest": "0s", "intensity": "RPE 7", "tempo": null, "notes": "Soft landing." },
          { "id": "e29", "name": "Burpees", "type": "Compound", "sets": "1", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Steady pace the whole piece." }
        ]},
        { "id": "b19", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e30", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 10. twf_crossfit_engine  |  CrossFit Engine (4 days)
-- ----------------------------------------------------------------------------