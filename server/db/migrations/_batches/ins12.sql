INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_glute_focus',
  'Glute Focus',
  '4-day program centered on glute and lower-body development with a high frequency of hip extension work.',
  'Intermediate',
  'Lower Body',
  4,
  '{
    "name": "Glute Focus",
    "level": "Intermediate",
    "focus": "Glutes and Lower Body",
    "frequency": 4,
    "duration": 60,
    "description": "4-day program centered on glute and lower-body development with a high frequency of hip extension work.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Heavy Glutes", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Glute Bridge", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Glute activation." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Hip mobility." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "6-8", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-2-1", "notes": "Heavy, two-second pause at the top." },
          { "id": "e4", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Stretch the glutes and hamstrings." },
          { "id": "e5", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Lean torso forward for more glute." }
        ]},
        { "id": "b3", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e6", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." },
          { "id": "e7", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Calves." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w2", "name": "Quads", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b6", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8-10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Full depth." },
          { "id": "e11", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Feet low for more quad." },
          { "id": "e12", "name": "Walking Lunges", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Long stride for glute." }
        ]},
        { "id": "b7", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e13", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "1-1-1", "notes": "Pause at the top." },
          { "id": "e14", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Squeeze the glute." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Glute Volume", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Glute Bridge", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Activation." }
        ]},
        { "id": "b10", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e17", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "12-15", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Long sets, constant tension." },
          { "id": "e18", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Stability first." },
          { "id": "e19", "name": "Step-Up Bodyweight", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "High box for more glute." }
        ]},
        { "id": "b11", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e20", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e21", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the hip." }
        ]}
      ]},
      { "id": "w4", "name": "Posterior Chain", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e22", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b14", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e23", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Hip-hinge dominant." },
          { "id": "e24", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "1", "rest": "90s", "intensity": "RPE 9", "tempo": "2-2-1", "notes": "Long pause at the top." },
          { "id": "e25", "name": "Seated Leg Curl", "type": "Isolation", "sets": "3", "reps": "12-15", "rir": "1", "rest": "60s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Hamstrings." }
        ]},
        { "id": "b15", "name": "Isolation", "type": "main", "exercises": [
          { "id": "e26", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": "2-1-1", "notes": "Soleus." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e27", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 7. twf_gym_fat_loss  |  Recomposition and Fat Loss (4 days)
-- ----------------------------------------------------------------------------