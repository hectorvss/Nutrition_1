INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_engine',
  'CrossFit Engine',
  '4-day program focused on building aerobic capacity and endurance with long metcons and monostructural intervals.',
  'Intermediate',
  'Conditioning',
  4,
  '{
    "name": "CrossFit Engine",
    "level": "Intermediate",
    "focus": "Aerobic Capacity",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program focused on building aerobic capacity and endurance with long metcons and monostructural intervals.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Long Intervals", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "500m", "rir": null, "rest": "60s", "intensity": "Light", "tempo": null, "notes": "Easy progressive pace." }
        ]},
        { "id": "b2", "name": "Aerobic Block", "type": "main", "exercises": [
          { "id": "e2", "name": "Rowing Machine", "type": "Compound", "sets": "5", "reps": "500m", "rir": "2", "rest": "120s", "intensity": "RPE 7", "tempo": null, "notes": "5x500m at threshold pace, consistent." },
          { "id": "e3", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "90s", "rir": "2", "rest": "60s", "intensity": "RPE 6", "tempo": null, "notes": "Active recovery between sets." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w2", "name": "Mixed Metcon", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Jumping Jacks", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b5", "name": "Intervals", "type": "main", "exercises": [
          { "id": "e6", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "30s on / 30s off format." },
          { "id": "e7", "name": "Kettlebell Swing", "type": "Compound", "sets": "8", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Alternate with the burpees." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w3", "name": "Sustained Effort", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle activation." }
        ]},
        { "id": "b8", "name": "Long Metcon - 30 min", "type": "main", "exercises": [
          { "id": "e10", "name": "Rowing Machine", "type": "Compound", "sets": "1", "reps": "400m", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Conversational pace, rotate stations." },
          { "id": "e11", "name": "Walking Lunges", "type": "Compound", "sets": "1", "reps": "20", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Keep moving." },
          { "id": "e12", "name": "Push-Up", "type": "Compound", "sets": "1", "reps": "15", "rir": "3", "rest": "0s", "intensity": "RPE 6", "tempo": null, "notes": "Firm chest, controlled pace." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w4", "name": "Sprints and Short Intervals", "blocks": [
        { "id": "b10", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate and coordinate." }
        ]},
        { "id": "b11", "name": "Short Intervals", "type": "main", "exercises": [
          { "id": "e15", "name": "Rowing Machine", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "All-out 15s sprints." },
          { "id": "e16", "name": "Box Jumps", "type": "Compound", "sets": "6", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 8", "tempo": null, "notes": "Explosive leg power." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and recover." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 11. twf_crossfit_strength_skill  |  CrossFit Strength and Skill (4 days)
-- ----------------------------------------------------------------------------