INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_crossfit_strength_skill',
  'CrossFit Strength and Skill',
  '4-day program balancing barbell strength development with practice of advanced gymnastics skills.',
  'Advanced',
  'Strength and Skill',
  4,
  '{
    "name": "CrossFit Strength and Skill",
    "level": "Advanced",
    "focus": "Strength and Gymnastics",
    "frequency": 4,
    "duration": 65,
    "description": "4-day program balancing barbell strength development with practice of advanced gymnastics skills.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Squat and Handstand", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare hips and knees." },
          { "id": "e2", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulders." }
        ]},
        { "id": "b2", "name": "Strength", "type": "main", "exercises": [
          { "id": "e3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy triples, stay braced." }
        ]},
        { "id": "b3", "name": "Skill - Handstand", "type": "main", "exercises": [
          { "id": "e4", "name": "Wall Handstand Hold", "type": "Isolation", "sets": "5", "reps": "30s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Tight body, active shoulders." },
          { "id": "e5", "name": "Wall Handstand Push-Up", "type": "Compound", "sets": "4", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Partial range if needed." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." }
        ]}
      ]},
      { "id": "w2", "name": "Press and Strict Pull-Up", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Warm up the upper back." }
        ]},
        { "id": "b6", "name": "Strength", "type": "main", "exercises": [
          { "id": "e8", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "150s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy strict press." }
        ]},
        { "id": "b7", "name": "Skill - Vertical Pull", "type": "main", "exercises": [
          { "id": "e9", "name": "Weighted Pull-Up", "type": "Compound", "sets": "5", "reps": "4", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Strict weighted pull-up." },
          { "id": "e10", "name": "Assisted Dips", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Control the descent." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Deadlift and Core", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the spine." }
        ]},
        { "id": "b10", "name": "Strength", "type": "main", "exercises": [
          { "id": "e13", "name": "Romanian Deadlift", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "180s", "intensity": "85% 1RM", "tempo": "2-0-1", "notes": "Heavy hip hinge." }
        ]},
        { "id": "b11", "name": "Skill - Toes to Bar", "type": "main", "exercises": [
          { "id": "e14", "name": "Hanging Knee Raise", "type": "Isolation", "sets": "5", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progression toward toes to bar." },
          { "id": "e15", "name": "Hollow Hold", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Bodyweight", "tempo": null, "notes": "Lower back pinned to the floor." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e16", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Weightlifting and Mixed Skill", "blocks": [
        { "id": "b13", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Full-body mobility." }
        ]},
        { "id": "b14", "name": "Lift Technique", "type": "main", "exercises": [
          { "id": "e18", "name": "Power Clean", "type": "Compound", "sets": "6", "reps": "2", "rir": "2", "rest": "150s", "intensity": "80% 1RM", "tempo": null, "notes": "Technical doubles, bar speed." },
          { "id": "e19", "name": "Push Press", "type": "Compound", "sets": "5", "reps": "3", "rir": "2", "rest": "120s", "intensity": "80% 1RM", "tempo": null, "notes": "Explosive leg drive." }
        ]},
        { "id": "b15", "name": "Skill", "type": "main", "exercises": [
          { "id": "e20", "name": "Wall Handstand Hold", "type": "Isolation", "sets": "4", "reps": "40s", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": null, "notes": "Build inverted endurance." },
          { "id": "e21", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s", "intensity": "RPE 7", "tempo": "2-0-1", "notes": "Pulling volume." }
        ]},
        { "id": "b16", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Breathe and relax." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 12. twf_functional_athletic  |  Functional Athletic Performance (4 days)
-- ----------------------------------------------------------------------------