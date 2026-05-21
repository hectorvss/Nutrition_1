INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_running_5k',
  '5K Running Plan',
  '4-day program to prepare for a 5K, combining easy runs, speed intervals, a long run and supporting strength work.',
  'Beginner',
  'Running',
  4,
  '{
    "name": "5K Running Plan",
    "level": "Beginner",
    "focus": "5K Endurance",
    "frequency": 4,
    "duration": 45,
    "description": "4-day program to prepare for a 5K, combining easy runs, speed intervals, a long run and supporting strength work.",
    "schedule": ["M", null, "W", null, "F", "S", null],
    "workouts": [
      { "id": "w1", "name": "Easy Run", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Brisk Walk", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse gradually." },
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "1", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Dynamic hip mobility." }
        ]},
        { "id": "b2", "name": "Continuous Run", "type": "main", "exercises": [
          { "id": "e3", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "25min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Conversational pace, aerobic base." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e4", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the legs." }
        ]}
      ]},
      { "id": "w2", "name": "Speed Intervals", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e5", "name": "Easy Continuous Run", "type": "Compound", "sets": "1", "reps": "10min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Easy jog before the intervals." }
        ]},
        { "id": "b5", "name": "Intervals", "type": "main", "exercises": [
          { "id": "e6", "name": "Running Interval", "type": "Compound", "sets": "6", "reps": "400m", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": null, "notes": "5K pace, easy jog on the recovery." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Runner Strength", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the legs." }
        ]},
        { "id": "b8", "name": "Supporting Strength", "type": "main", "exercises": [
          { "id": "e9", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Unilateral leg stability." },
          { "id": "e10", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Strengthen the glute." },
          { "id": "e11", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Calf endurance." }
        ]},
        { "id": "b9", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "40s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Trunk stability while running." },
          { "id": "e13", "name": "Bird Dog", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "30s", "intensity": "RPE 6", "tempo": "2-1-2", "notes": "Coordination and anti-rotation." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w4", "name": "Long Run", "blocks": [
        { "id": "b11", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e15", "name": "Brisk Walk", "type": "Compound", "sets": "1", "reps": "5min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up gradually." }
        ]},
        { "id": "b12", "name": "Long Run", "type": "main", "exercises": [
          { "id": "e16", "name": "Long Continuous Run", "type": "Compound", "sets": "1", "reps": "40min", "rir": "3", "rest": "0s", "intensity": "RPE 5", "tempo": null, "notes": "Comfortable pace, builds endurance." }
        ]},
        { "id": "b13", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3", "saturday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 17. twf_hiit_conditioning  |  HIIT Conditioning (3 days)
-- ----------------------------------------------------------------------------