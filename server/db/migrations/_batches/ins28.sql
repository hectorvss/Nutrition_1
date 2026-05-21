INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_calisthenics_skills',
  'Calisthenics: Skills',
  '4-day program to progress pull-ups, dips and calisthenics skills through structured progressions.',
  'Intermediate',
  'Calisthenics',
  4,
  '{
    "name": "Calisthenics: Skills",
    "level": "Intermediate",
    "focus": "Bodyweight Skills",
    "frequency": 4,
    "duration": 55,
    "description": "4-day program to progress pull-ups, dips and calisthenics skills through structured progressions.",
    "schedule": ["M", "T", null, "T", "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Pull-Ups", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Activate the upper back." },
          { "id": "e2", "name": "Bar Hang", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "30s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare grip and shoulder." }
        ]},
        { "id": "b2", "name": "Pull-Up Progression", "type": "main", "exercises": [
          { "id": "e3", "name": "Strict Pull-Up", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Full range, no swinging." },
          { "id": "e4", "name": "Negative Pull-Up", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Slow 5-second descent." },
          { "id": "e5", "name": "Inverted Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Horizontal pulling volume." }
        ]},
        { "id": "b3", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e6", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the back." }
        ]}
      ]},
      { "id": "w2", "name": "Dips", "blocks": [
        { "id": "b4", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e7", "name": "Scapular Push-Up", "type": "Isolation", "sets": "2", "reps": "12", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Activate the serratus and shoulder." }
        ]},
        { "id": "b5", "name": "Dip Progression", "type": "main", "exercises": [
          { "id": "e8", "name": "Strict Parallel Dip", "type": "Compound", "sets": "5", "reps": "6", "rir": "2", "rest": "150s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Shoulders down, controlled depth." },
          { "id": "e9", "name": "Negative Dip", "type": "Compound", "sets": "3", "reps": "4", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "5-0-0", "notes": "Slow 5-second descent." },
          { "id": "e10", "name": "Diamond Push-Up", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Triceps volume." }
        ]},
        { "id": "b6", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e11", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." }
        ]}
      ]},
      { "id": "w3", "name": "Core and Legs", "blocks": [
        { "id": "b7", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e12", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": null, "rest": "20s", "intensity": "Bodyweight", "tempo": null, "notes": "Prepare the knees." }
        ]},
        { "id": "b8", "name": "Core Skill", "type": "main", "exercises": [
          { "id": "e13", "name": "Hanging Leg Raise", "type": "Isolation", "sets": "4", "reps": "10", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "2-0-2", "notes": "Progression toward toes to bar." },
          { "id": "e14", "name": "Hollow Hold", "type": "Isolation", "sets": "4", "reps": "30s", "rir": null, "rest": "60s", "intensity": "Bodyweight", "tempo": null, "notes": "Whole-body tension." }
        ]},
        { "id": "b9", "name": "Legs", "type": "main", "exercises": [
          { "id": "e15", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Unilateral work." },
          { "id": "e16", "name": "Pistol Squat Progression", "type": "Compound", "sets": "3", "reps": "6", "rir": "2", "rest": "90s", "intensity": "RPE 8", "tempo": "3-0-1", "notes": "Use support to match your level." }
        ]},
        { "id": "b10", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e17", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "No bouncing." }
        ]}
      ]},
      { "id": "w4", "name": "Mixed Push and Pull", "blocks": [
        { "id": "b11", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e18", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b12", "name": "Mixed Block", "type": "main", "exercises": [
          { "id": "e19", "name": "Strict Pull-Up", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Vertical pulling volume." },
          { "id": "e20", "name": "Strict Parallel Dip", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Pushing volume." },
          { "id": "e21", "name": "Wall Handstand Push-Up", "type": "Compound", "sets": "3", "reps": "5", "rir": "3", "rest": "120s", "intensity": "RPE 8", "tempo": "2-0-1", "notes": "Advanced vertical push." },
          { "id": "e22", "name": "Inverted Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "1", "rest": "75s", "intensity": "RPE 9", "tempo": "2-0-1", "notes": "Horizontal pull." }
        ]},
        { "id": "b13", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e23", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle on each side." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "tuesday": "w2", "thursday": "w3", "friday": "w4" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 15. twf_home_no_equipment  |  Home No-Equipment (3 days)
-- ----------------------------------------------------------------------------