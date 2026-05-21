INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_hypertrophy_ul',
  'Upper/Lower Hypertrophy',
  '4-day upper/lower split built to maximize muscle growth with moderate-high volume and sets taken close to failure.',
  'Intermediate',
  'Upper/Lower Split',
  4,
  '{
    "name": "Upper/Lower Hypertrophy",
    "level": "Intermediate",
    "focus": "Hypertrophy",
    "frequency": 4,
    "duration": 65,
    "description": "4-day upper/lower split built to maximize muscle growth with moderate-high volume and sets taken close to failure.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Upper A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise heart rate progressively." },
          { "id": "e2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Prime upper back and rotator cuff." }
        ]},
        { "id": "b2", "name": "Chest and Back", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Bench Press", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Retract scapulae, control the descent." },
          { "id": "e4", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Torso at 45 degrees, pull to the navel." },
          { "id": "e5", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Get a deep chest stretch on the eccentric." }
        ]},
        { "id": "b3", "name": "Shoulders and Arms", "type": "main", "exercises": [
          { "id": "e6", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lead with the elbows, no swinging." },
          { "id": "e7", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10-12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Keep elbows pinned to your sides." },
          { "id": "e8", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-0-1", "notes": "Lock out the elbow each rep." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e9", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe deep and relax the shoulders." }
        ]}
      ]},
      { "id": "w2", "name": "Lower A", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e10", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Warm up hips and knees." },
          { "id": "e11", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility prep." }
        ]},
        { "id": "b6", "name": "Quads and Hamstrings", "type": "main", "exercises": [
          { "id": "e12", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth, knees tracking over toes." },
          { "id": "e13", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hips back, bar close to the legs." },
          { "id": "e14", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Do not lock the knees at the top." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e15", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the hamstring at the top." },
          { "id": "e16", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Full range, pause at the bottom." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing, stay steady." }
        ]}
      ]},
      { "id": "w3", "name": "Upper B", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General activation." }
        ]},
        { "id": "b10", "name": "Back and Chest", "type": "main", "exercises": [
          { "id": "e19", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Drive the chest to the bar." },
          { "id": "e20", "name": "Machine Chest Press", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze the chest at the end of the range." },
          { "id": "e21", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Tall chest, do not shrug." }
        ]},
        { "id": "b11", "name": "Shoulders and Arms", "type": "main", "exercises": [
          { "id": "e22", "name": "Seated Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Full range, no abrupt lockout." },
          { "id": "e23", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Target the rear delts." },
          { "id": "e24", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Neutral grip, no swinging." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e25", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]},
      { "id": "w4", "name": "Lower B", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e26", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate glutes and quads." }
        ]},
        { "id": "b14", "name": "Hamstrings and Glutes", "type": "main", "exercises": [
          { "id": "e27", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Pause at the top squeezing the glutes." },
          { "id": "e28", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Slight forward torso lean." },
          { "id": "e29", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Squeeze hard at the peak." }
        ]},
        { "id": "b15", "name": "Quads and Calves", "type": "main", "exercises": [
          { "id": "e30", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "One-second pause at the top." },
          { "id": "e31", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Get a good stretch at the bottom." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e32", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute and hip." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 2. twf_gym_ppl  |  Push / Pull / Legs (6 days)
-- ----------------------------------------------------------------------------