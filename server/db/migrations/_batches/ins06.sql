INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_gym_fullbody_beginner',
  'Beginner Full Body',
  '3-day full-body program for beginners, focused on learning the basic movement patterns with good technique and safe progression.',
  'Beginner',
  'Full Body',
  3,
  '{
    "name": "Beginner Full Body",
    "level": "Beginner",
    "focus": "General Strength",
    "frequency": 3,
    "duration": 50,
    "description": "3-day full-body program for beginners, focused on learning the basic movement patterns with good technique and safe progression.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "General full-body activation." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "12", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Practice the squat pattern." }
        ]},
        { "id": "b2", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "8-10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Prioritize technique over weight." },
          { "id": "e4", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Elbows at 45 degrees from the torso." },
          { "id": "e5", "name": "Seated Cable Row", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Pull with the back, not the arms." },
          { "id": "e6", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "45s", "intensity": "Bodyweight", "tempo": null, "notes": "Glutes and abs braced." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine calmly." }
        ]}
      ]},
      { "id": "w2", "name": "Full Body B", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e8", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e9", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." }
        ]},
        { "id": "b5", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Drive firmly through the heels." },
          { "id": "e11", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Bring the bar to the upper chest." },
          { "id": "e12", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Do not arch the lower back." },
          { "id": "e13", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s", "intensity": "Bodyweight", "tempo": "2-1-1", "notes": "Squeeze the glute at the top." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e14", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w3", "name": "Full Body C", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e15", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "30s", "intensity": "Light", "tempo": null, "notes": "Gentle warm-up." }
        ]},
        { "id": "b8", "name": "Main Block", "type": "main", "exercises": [
          { "id": "e16", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "120s", "intensity": "RPE 6", "tempo": "3-0-1", "notes": "Hips back, flat back." },
          { "id": "e17", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "90s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Full range of motion." },
          { "id": "e18", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "75s", "intensity": "RPE 6", "tempo": "2-0-1", "notes": "Brace well on the bench." },
          { "id": "e19", "name": "Dumbbell Curl", "type": "Isolation", "sets": "2", "reps": "12", "rir": "2", "rest": "60s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "No swinging." }
        ]},
        { "id": "b9", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e20", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle and held." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 4. twf_gym_strength_531  |  5/3/1 Strength (4 days)
-- ----------------------------------------------------------------------------