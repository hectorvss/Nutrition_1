INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hyrox_prep',
  'HYROX Preparation',
  '5-day HYROX-specific program combining strength, running endurance and the functional stations featured in the competition.',
  'Advanced',
  'HYROX',
  5,
  '{
    "name": "HYROX Preparation",
    "level": "Advanced",
    "focus": "HYROX Hybrid",
    "frequency": 5,
    "duration": 70,
    "description": "5-day HYROX-specific program combining strength, running endurance and the functional stations featured in the competition.",
    "schedule": ["M", "T", "W", "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Leg Strength", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up for the session." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": "2-0-1", "notes": "Strength base for the stations." },
          { "id": "e4", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Strong posterior chain." },
          { "id": "e5", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the loaded lunges." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Functional Stations", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b5", "name": "Station Simulation", "type": "main", "exercises": [
          { "id": "e8", "name": "Sled Push", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Short, powerful steps." },
          { "id": "e9", "name": "Sled Pull", "type": "Compound", "sets": "4", "reps": "25m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "Low torso, pull with the legs." },
          { "id": "e10", "name": "Kettlebell Farmer Walk", "type": "Compound", "sets": "4", "reps": "40m", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Firm grip, shoulders down." },
          { "id": "e11", "name": "Sandbag Lunges", "type": "Compound", "sets": "3", "reps": "20", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the loaded lunges." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e12", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w3", "name": "Running Endurance", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e13", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Easy jog beforehand." }
        ]},
        { "id": "b8", "name": "Running Intervals", "type": "main", "exercises": [
          { "id": "e14", "name": "Running Interval", "type": "Compound", "sets": "8", "reps": "1000m", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": null, "notes": "HYROX target pace, consistent." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w4", "name": "Run-Station Hybrid", "blocks": [
        { "id": "b10", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "8min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Activation jog." }
        ]},
        { "id": "b11", "name": "Compromised Simulation", "type": "main", "exercises": [
          { "id": "e17", "name": "Running Interval", "type": "Compound", "sets": "5", "reps": "1000m", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate running and a station with no rest." },
          { "id": "e18", "name": "Kettlebell Swing", "type": "Compound", "sets": "5", "reps": "20", "rir": "2", "rest": "0s", "intensity": "RPE 8", "tempo": null, "notes": "Station after every 1000m." },
          { "id": "e19", "name": "Burpee Broad Jump", "type": "Compound", "sets": "5", "reps": "10", "rir": "2", "rest": "0s", "intensity": "RPE 9", "tempo": null, "notes": "Specific to the burpee broad jumps." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w5", "name": "Push Strength and Core", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e21", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b14", "name": "Strength", "type": "main", "exercises": [
          { "id": "e22", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Endurance for the wall balls." },
          { "id": "e23", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Specific to the competition row." },
          { "id": "e24", "name": "Wall Ball Throw", "type": "Compound", "sets": "4", "reps": "15", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": null, "notes": "Wall ball pattern." }
        ]},
        { "id": "b15", "name": "Core", "type": "main", "exercises": [
          { "id": "e25", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Stability for the stations." },
          { "id": "e26", "name": "Pallof Press", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-2", "notes": "Anti-rotation." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "wednesday": "w3", "thursday": "w4", "friday": "w5" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();