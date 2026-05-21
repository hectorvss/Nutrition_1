INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_hiit_conditioning',
  'HIIT Conditioning',
  '3-day high-intensity interval training program to improve cardiovascular capacity and burn calories.',
  'Intermediate',
  'HIIT',
  3,
  '{
    "name": "HIIT Conditioning",
    "level": "Intermediate",
    "focus": "High-Intensity Conditioning",
    "frequency": 3,
    "duration": 35,
    "description": "3-day high-intensity interval training program to improve cardiovascular capacity and burn calories.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body HIIT", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b2", "name": "Tabata Intervals", "type": "main", "exercises": [
          { "id": "e3", "name": "Burpees", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Tabata 20s on / 10s off format." },
          { "id": "e4", "name": "Jump Squat", "type": "Compound", "sets": "8", "reps": "20s", "rir": "1", "rest": "10s", "intensity": "RPE 9", "tempo": null, "notes": "Second Tabata block." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e5", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]},
      { "id": "w2", "name": "HIIT Circuit", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e6", "name": "Jump Rope", "type": "Compound", "sets": "3", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Coordination and pulse." }
        ]},
        { "id": "b5", "name": "EMOM Circuit 16 min", "type": "main", "exercises": [
          { "id": "e7", "name": "Mountain Climbers", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 1 of the block." },
          { "id": "e8", "name": "Stationary Lunge", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 2 of the block." },
          { "id": "e9", "name": "Push-Up", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 8", "tempo": null, "notes": "Minute 3 of the block." },
          { "id": "e10", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "40s", "rir": "1", "rest": "20s", "intensity": "RPE 9", "tempo": null, "notes": "Minute 4 of the block." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w3", "name": "HIIT Sprints", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Progressive warm-up." }
        ]},
        { "id": "b8", "name": "Sprints", "type": "main", "exercises": [
          { "id": "e13", "name": "High Knees Sprint", "type": "Compound", "sets": "10", "reps": "15s", "rir": "1", "rest": "45s", "intensity": "RPE 9", "tempo": null, "notes": "Maximum intensity on every sprint." }
        ]},
        { "id": "b9", "name": "Core Finisher", "type": "main", "exercises": [
          { "id": "e14", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Firm core." },
          { "id": "e15", "name": "Crunch", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "1-0-1", "notes": "Controlled pace." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and recover." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 18. twf_mobility_recovery  |  Mobility and Recovery (3 days)
-- ----------------------------------------------------------------------------