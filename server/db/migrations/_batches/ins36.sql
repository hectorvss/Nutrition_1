INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json, language)
VALUES (
  'twf_mobility_recovery',
  'Mobility and Recovery',
  '3-day program of joint mobility, stability and regenerative work to improve range of motion and support recovery.',
  'All Levels',
  'Mobility',
  3,
  '{
    "name": "Mobility and Recovery",
    "level": "All Levels",
    "focus": "Mobility and Recovery",
    "frequency": 3,
    "duration": 35,
    "description": "3-day program of joint mobility, stability and regenerative work to improve range of motion and support recovery.",
    "schedule": ["M", null, "W", null, "F", null, null],
    "workouts": [
      { "id": "w1", "name": "Hip and Lower Body Mobility", "blocks": [
        { "id": "b1", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e1", "name": "March in Place", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Raise body temperature." }
        ]},
        { "id": "b2", "name": "Mobility Block", "type": "main", "exercises": [
          { "id": "e2", "name": "World''s Greatest Stretch", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "3-1-3", "notes": "Global hip and torso mobility." },
          { "id": "e3", "name": "Deep Squat Hold", "type": "Compound", "sets": "3", "reps": "30s", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": null, "notes": "Stay down and breathe." },
          { "id": "e4", "name": "Ankle Dorsiflexion Drill", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "2-1-2", "notes": "Knee over the toes." }
        ]},
        { "id": "b3", "name": "Stability", "type": "main", "exercises": [
          { "id": "e5", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-2-1", "notes": "Glute activation." },
          { "id": "e6", "name": "Bird Dog", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Control and anti-rotation." }
        ]},
        { "id": "b4", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e7", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "One side at a time." },
          { "id": "e8", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax the glute." }
        ]}
      ]},
      { "id": "w2", "name": "Spine and Shoulder Mobility", "blocks": [
        { "id": "b5", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e9", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Mobilize the shoulder." }
        ]},
        { "id": "b6", "name": "Mobility Block", "type": "main", "exercises": [
          { "id": "e10", "name": "Cat Cow", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 3", "tempo": "3-0-3", "notes": "Mobilize the spine calmly." },
          { "id": "e11", "name": "Thoracic Rotation", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Open the chest with each rotation." },
          { "id": "e12", "name": "Wall Slides", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 4", "tempo": "2-1-2", "notes": "Lower back and arms against the wall." }
        ]},
        { "id": "b7", "name": "Stability", "type": "main", "exercises": [
          { "id": "e13", "name": "Scapular Push-Up", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-1", "notes": "Activate the serratus." },
          { "id": "e14", "name": "Dumbbell Shoulder External Rotation", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s", "intensity": "RPE 5", "tempo": "2-1-2", "notes": "Rotator cuff health." }
        ]},
        { "id": "b8", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e15", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Open the chest." },
          { "id": "e16", "name": "Neck Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Gentle in each direction." }
        ]}
      ]},
      { "id": "w3", "name": "Flow and Recovery", "blocks": [
        { "id": "b9", "name": "Warm-up", "type": "warmup", "exercises": [
          { "id": "e17", "name": "March in Place", "type": "Compound", "sets": "1", "reps": "3min", "rir": null, "rest": "0s", "intensity": "Light", "tempo": null, "notes": "Warm up gently." }
        ]},
        { "id": "b10", "name": "Mobility Flow", "type": "main", "exercises": [
          { "id": "e18", "name": "Inchworm", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Dynamic full-body flow." },
          { "id": "e19", "name": "Down Dog to Cobra Flow", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Coordinate breath and movement." },
          { "id": "e20", "name": "Spiderman Stretch", "type": "Compound", "sets": "3", "reps": "8", "rir": "3", "rest": "20s", "intensity": "RPE 4", "tempo": null, "notes": "Open the hip with each step." }
        ]},
        { "id": "b11", "name": "Breathing and Regeneration", "type": "main", "exercises": [
          { "id": "e21", "name": "Breathing Drill Supine", "type": "Isolation", "sets": "3", "reps": "60s", "rir": null, "rest": "20s", "intensity": "Very Light", "tempo": null, "notes": "Slow diaphragmatic breathing." }
        ]},
        { "id": "b12", "name": "Cooldown", "type": "cooldown", "exercises": [
          { "id": "e22", "name": "Child''s Pose", "type": "Isolation", "sets": "2", "reps": "45s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Relax and breathe." },
          { "id": "e23", "name": "Seated Forward Fold", "type": "Isolation", "sets": "2", "reps": "40s", "rir": null, "rest": "20s", "intensity": "Light", "tempo": null, "notes": "Lengthen the posterior chain." }
        ]}
      ]}
    ],
    "weeklySchedule": { "monday": "w1", "wednesday": "w2", "friday": "w3" }
  }',
  'en'
)
ON CONFLICT (key, language) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, level=EXCLUDED.level, type=EXCLUDED.type, weekly_frequency=EXCLUDED.weekly_frequency, data_json=EXCLUDED.data_json, updated_at=now();

-- ----------------------------------------------------------------------------
-- 19. twf_kettlebell_complex  |  Kettlebell Complexes (3 days)
-- ----------------------------------------------------------------------------