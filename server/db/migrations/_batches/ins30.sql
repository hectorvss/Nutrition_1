INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_home_no_equipment',
  'Home No-Equipment',
  '3-day full-body program that can be done at home with no equipment, ideal for staying fit anywhere.',
  'Beginner',
  'Home Workout',
  3,
  '{
    "name": "Home No-Equipment",
    "level": "Beginner",
    "focus": "Full Body at Home",
    "frequency": 3,
    "duration": 35,
    "description": "3-day full-body program that can be done at home with no equipment, ideal for staying fit anywhere.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Full Body A", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." },
          { "id": "e2", "name": "Bodyweight Squat", "type": "Compound", "sets": "1", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the legs." }
        ]},
        { "id": "b2", "name": "Strength Circuit", "type": "main", "exercises": [
          { "id": "e3", "name": "Bodyweight Squat", "type": "Compound", "sets": "3", "reps": "15-20", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Full depth." },
          { "id": "e4", "name": "Push-Up", "type": "Compound", "sets": "3", "reps": "10-12", "rir": "2", "rest": "45s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Drop to knees if needed." },
          { "id": "e5", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-1-1", "notes": "Squeeze the glute." },
          { "id": "e6", "name": "Superman", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "1-1-1", "notes": "Work the lower back." }
        ]},
        { "id": "b3", "name": "Core", "type": "main", "exercises": [
          { "id": "e7", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Body in a straight line." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e8", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]},
      { "id": "w2", "name": "Full Body B", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle warm-up." }
        ]},
        { "id": "b6", "name": "Strength Circuit", "type": "main", "exercises": [
          { "id": "e10", "name": "Stationary Lunge", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Each leg, control the descent." },
          { "id": "e11", "name": "Incline Push-Up", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Hands on a stable table or chair." },
          { "id": "e12", "name": "Chair Dips", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "45s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Supported triceps work." },
          { "id": "e13", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "20", "rir": "1", "rest": "30s", "intensity": "RPE 8", "tempo": "2-1-1", "notes": "Full range." }
        ]},
        { "id": "b7", "name": "Core", "type": "main", "exercises": [
          { "id": "e14", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "30s", "intensity": "Bodyweight", "tempo": "2-0-2", "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w3", "name": "Cardio and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e16", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Raise the pulse." }
        ]},
        { "id": "b10", "name": "Metabolic Circuit", "type": "main", "exercises": [
          { "id": "e17", "name": "Burpees", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Sustainable pace." },
          { "id": "e18", "name": "Mountain Climbers", "type": "Compound", "sets": "4", "reps": "30s", "rir": "2", "rest": "30s", "intensity": "RPE 8", "tempo": null, "notes": "Stable hips." },
          { "id": "e19", "name": "Jump Squat", "type": "Compound", "sets": "4", "reps": "20s", "rir": "2", "rest": "40s", "intensity": "RPE 8", "tempo": null, "notes": "Soft landing." }
        ]},
        { "id": "b11", "name": "Core", "type": "main", "exercises": [
          { "id": "e20", "name": "Side Plank", "type": "Isolation", "sets": "3", "reps": "25s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Each side." },
          { "id": "e21", "name": "Crunch", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "30s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Do not pull on the neck." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Bring the pulse down." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 16. twf_running_5k  |  5K Running Plan (4 days)
-- ----------------------------------------------------------------------------