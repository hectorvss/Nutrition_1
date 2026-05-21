INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_calisthenics_foundations',
  'Calisthenics Foundations',
  '3-day program to get started with bodyweight training, building basic push, pull and leg strength.',
  'Beginner',
  'Calisthenics',
  3,
  '{
    "name": "Calisthenics Foundations",
    "level": "Beginner",
    "focus": "Bodyweight Strength",
    "frequency": 3,
    "duration": 45,
    "description": "3-day program to get started with bodyweight training, building basic push, pull and leg strength.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Push", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." },
          { "id": "e2", "name": "Scapular Push-Up", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the serratus." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Incline Push-Up", "type": "Compound", "sets": "4", "reps": "10-12", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Hands elevated to reduce difficulty." },
          { "id": "e4", "name": "Bench Dips", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Do not let the shoulder drop too far." },
          { "id": "e5", "name": "Pike Push-Up", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Progression toward the handstand press." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Glutes and abs braced." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w2", "name": "Pull", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b6", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e9", "name": "Inverted Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "75s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Adjust body angle to your level." },
          { "id": "e10", "name": "Pull-Up Assisted", "type": "Compound", "sets": "3", "reps": "6-8", "rir": "3", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Use a band or assistance." },
          { "id": "e11", "name": "Band Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Complementary biceps work." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e12", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e13", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the back." }
        ]}
      ]},
      { "id": "w3", "name": "Legs and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e14", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b10", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e15", "name": "Bodyweight Squat", "type": "Compound", "sets": "4", "reps": "15-20", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Full depth." },
          { "id": "e16", "name": "Step-Up Bodyweight", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Controlled unilateral work." },
          { "id": "e17", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Squeeze the glute at the top." },
          { "id": "e18", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "45s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e19", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 14. twf_calisthenics_skills  |  Calisthenics Skills (4 days)
-- ----------------------------------------------------------------------------