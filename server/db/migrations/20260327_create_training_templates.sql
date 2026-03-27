-- 1. Create Training Templates Table
CREATE TABLE IF NOT EXISTS public.training_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    level TEXT,
    type TEXT,
    weekly_frequency INTEGER,
    data_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.training_templates ENABLE ROW LEVEL SECURITY;

-- 3. Ensure Exercises Exist in the Library (Fixed types to match Compound/Isolation check constraint)
INSERT INTO public.exercises (name, category, subcategory, type, difficulty_level, language, icon)
SELECT name, category, subcategory, type, level, lang, icon
FROM (VALUES 
    -- Common / Warm-up / Cardio
    ('Jumping Jacks', 'Cardio', 'Warm-up', 'Compound', 'Beginner', 'en', 'timer'),
    ('Jump Rope', 'Cardio', 'Warm-up', 'Compound', 'Beginner', 'en', 'timer'),
    ('Arm Circles', 'Cardio', 'Warm-up', 'Isolation', 'Beginner', 'en', 'timer'),
    ('Band Pull-Apart', 'Strength', 'Warm-up', 'Isolation', 'Beginner', 'en', 'timer'),
    ('Walk Treadmill Easy', 'Cardio', 'Warm-up', 'Compound', 'Beginner', 'en', 'directions_walk'),
    ('March in Place', 'Cardio', 'Warm-up', 'Compound', 'Beginner', 'en', 'directions_walk'),
    
    -- Chest
    ('Dumbbell Bench Press', 'Strength', 'Chest', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Barbell Bench Press', 'Strength', 'Chest', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Incline Dumbbell Press', 'Strength', 'Chest', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Flat Dumbbell Press', 'Strength', 'Chest', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Machine Chest Press', 'Strength', 'Chest', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Chest Fly Machine', 'Strength', 'Chest', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Cable Chest Fly', 'Strength', 'Chest', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    
    -- Back
    ('Lat Pulldown', 'Strength', 'Back', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Weighted Pull-Up', 'Strength', 'Back', 'Compound', 'Advanced', 'en', 'fitness_center'),
    ('Pull-Up Assisted', 'Strength', 'Back', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Barbell Row', 'Strength', 'Back', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Seated Cable Row', 'Strength', 'Back', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Chest Supported Row', 'Strength', 'Back', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Single Arm Cable Row', 'Strength', 'Back', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Single Arm Dumbbell Row', 'Strength', 'Back', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Seated Cable Row Light', 'Strength', 'Back', 'Compound', 'Beginner', 'en', 'fitness_center'),
    
    -- Shoulders
    ('Dumbbell Shoulder Press', 'Strength', 'Shoulders', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Seated Dumbbell Shoulder Press', 'Strength', 'Shoulders', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Lateral Raise', 'Strength', 'Shoulders', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Cable Lateral Raise', 'Strength', 'Shoulders', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    ('Cable Front Raise', 'Strength', 'Shoulders', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    ('Reverse Pec Deck', 'Strength', 'Shoulders', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    ('Dumbbell Shoulder External Rotation', 'Strength', 'Shoulders', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Wall Slides', 'Strength', 'Shoulders', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Scapular Push-Up', 'Strength', 'Shoulders', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    
    -- Legs (Quads)
    ('Barbell Back Squat', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Bodyweight Squat', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Leg Press', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Leg Extension', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Walking Lunges', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Walking Lunges Bodyweight', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Bulgarian Split Squat', 'Strength', 'Legs', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Hack Squat', 'Strength', 'Legs', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Step-Up Bodyweight', 'Strength', 'Legs', 'Compound', 'Beginner', 'en', 'fitness_center'),
    ('Romanian Deadlift', 'Strength', 'Legs', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Hip Thrust', 'Strength', 'Legs', 'Compound', 'Intermediate', 'en', 'fitness_center'),
    ('Seated Leg Curl', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Lying Leg Curl', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Glute Bridge', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Standing Calf Raise', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Seated Calf Raise', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Calf Raise Bodyweight', 'Strength', 'Legs', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    
    -- Mobility & Flex
    ('Cat Cow', 'Mobility', 'Spine', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Thoracic Rotation', 'Mobility', 'Spine', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('World’s Greatest Stretch', 'Mobility', 'Full Body', 'Compound', 'Beginner', 'en', 'self_improvement'),
    ('Deep Squat Hold', 'Mobility', 'Hips', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Bird Dog', 'Mobility', 'Core', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Dead Bug', 'Mobility', 'Core', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Child’s Pose', 'Mobility', 'Recovery', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Breathing Drill Supine', 'Mobility', 'Recovery', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Breathing Drill Seated', 'Mobility', 'Recovery', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Doorway Pec Stretch', 'Mobility', 'Chest', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Neck Stretch', 'Mobility', 'Neck', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Upper Trap Stretch', 'Mobility', 'Neck', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Hip Flexor Stretch', 'Mobility', 'Hips', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Hamstring Stretch Supine', 'Mobility', 'Legs', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Ankle Dorsiflexion Drill', 'Mobility', 'Ankle', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Figure 4 Stretch', 'Mobility', 'Hips', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Seated Forward Fold', 'Mobility', 'Legs', 'Isolation', 'Beginner', 'en', 'self_improvement'),
    ('Inchworm', 'Mobility', 'Flow', 'Compound', 'Beginner', 'en', 'self_improvement'),
    ('Down Dog to Cobra Flow', 'Mobility', 'Flow', 'Compound', 'Beginner', 'en', 'self_improvement'),
    ('Spiderman Stretch', 'Mobility', 'Flow', 'Compound', 'Beginner', 'en', 'self_improvement'),
    
    -- Core
    ('Plank', 'Strength', 'Core', 'Isolation', 'Beginner', 'en', 'timer'),
    ('Side Plank', 'Strength', 'Core', 'Isolation', 'Beginner', 'en', 'timer'),
    ('Pallof Press', 'Strength', 'Core', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    
    -- Arms
    ('Dumbbell Curl', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Barbell Curl', 'Strength', 'Arms', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    ('Cable Curl', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Preacher Curl Machine', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Hammer Curl', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Dumbbell Hammer Curl', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Triceps Pushdown', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Rope Pushdown', 'Strength', 'Arms', 'Isolation', 'Beginner', 'en', 'fitness_center'),
    ('Skull Crushers', 'Strength', 'Arms', 'Isolation', 'Intermediate', 'en', 'fitness_center'),
    ('Overhead Triceps Extension', 'Strength', 'Arms', 'Isolation', 'Intermediate', 'en', 'fitness_center')
) AS e(name, category, subcategory, type, level, lang, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM public.exercises WHERE name = e.name AND language = e.lang
) ON CONFLICT DO NOTHING;

-- 4. Seed "Fuerza Start" Template
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json)
VALUES (
    'strength_start',
    'Fuerza Start',
    'Foundation strength program focusing on compound lifts.',
    'Beginner',
    'Full Body',
    3,
    '{
        "name": "Fuerza Start",
        "level": "Beginner",
        "focus": "Full Body",
        "frequency": 3,
        "duration": 45,
        "schedule": ["M", null, "W", null, "F", null, null],
        "description": "Foundation strength program focusing on compound lifts.",
        "workouts": [
            {
                "id": "workout_a",
                "name": "Full Body A – Push Focus",
                "blocks": [
                    { "id": "b1", "name": "Warm-up", "exercises": [{ "id": "ex_jj", "name": "Jumping Jacks", "type": "Compound", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "b2", "name": "Torso (Push)", "exercises": [{ "id": "ex_dbp", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "b3", "name": "Legs", "exercises": [{ "id": "ex_bbs", "name": "Barbell Back Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "120s" }] }
                ]
            },
            {
                "id": "workout_b",
                "name": "Full Body B – Pull Focus",
                "blocks": [
                    { "id": "b4", "name": "Warm-up", "exercises": [{ "id": "ex_jr", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "b5", "name": "Torso (Pull)", "exercises": [{ "id": "ex_lp", "name": "Lat Pulldown", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "b6", "name": "Legs", "exercises": [{ "id": "ex_lpr", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "120s" }] }
                ]
            }
        ],
        "weeklySchedule": { "monday": "workout_a", "wednesday": "workout_b", "friday": "workout_a" }
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- 5. Seed "Fuerza Regular" Template
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json)
VALUES (
    'strength_regular',
    'Fuerza Regular',
    'Upper/Lower split designed for intermediate lifters.',
    'Intermediate',
    'Split',
    4,
    '{
        "name": "Fuerza Regular",
        "level": "Intermediate",
        "focus": "Upper/Lower Split",
        "frequency": 4,
        "duration": 60,
        "schedule": ["M", "T", null, "T", "F", null, null],
        "description": "Upper/Lower split designed for intermediate lifters.",
        "workouts": [
            {
                "id": "upper_a",
                "name": "Upper A",
                "blocks": [
                    { "id": "ua1", "name": "Warm-up", "exercises": [{ "id": "ex_jr2", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "ua2", "name": "Chest & Shoulders", "exercises": [
                        { "id": "ex_dbp2", "name": "Dumbbell Bench Press", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_dsp", "name": "Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "ua3", "name": "Back", "exercises": [{ "id": "ex_scr", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "ua4", "name": "Arms", "exercises": [
                        { "id": "ex_dc", "name": "Dumbbell Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_tp", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_a",
                "name": "Lower A",
                "blocks": [
                    { "id": "la1", "name": "Warm-up", "exercises": [{ "id": "ex_bws", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": "3", "rest": "30s" }] },
                    { "id": "la2", "name": "Quads", "exercises": [
                        { "id": "ex_bbs2", "name": "Barbell Back Squat", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" },
                        { "id": "ex_le", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "la3", "name": "Hamstrings & Glutes", "exercises": [{ "id": "ex_rdl", "name": "Romanian Deadlift", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "120s" }] },
                    { "id": "la4", "name": "Calves", "exercises": [{ "id": "ex_scr2", "name": "Standing Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "upper_b",
                "name": "Upper B",
                "blocks": [
                    { "id": "ub1", "name": "Warm-up", "exercises": [{ "id": "ex_jr3", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "ub2", "name": "Back", "exercises": [
                        { "id": "ex_lp2", "name": "Lat Pulldown", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr", "name": "Chest Supported Row", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "ub3", "name": "Chest", "exercises": [{ "id": "ex_idp", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "ub4", "name": "Shoulders", "exercises": [{ "id": "ex_lr", "name": "Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "ub5", "name": "Arms", "exercises": [
                        { "id": "ex_hc", "name": "Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_ote", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_b",
                "name": "Lower B",
                "blocks": [
                    { "id": "lb1", "name": "Warm-up", "exercises": [{ "id": "ex_wl", "name": "Walking Lunges", "type": "Compound", "sets": "2", "reps": "12", "rir": "3", "rest": "30s" }] },
                    { "id": "lb2", "name": "Hamstrings & Glutes", "exercises": [
                        { "id": "ex_rdl2", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" },
                        { "id": "ex_ht", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "lb3", "name": "Quads", "exercises": [{ "id": "ex_lpr2", "name": "Leg Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s" }] },
                    { "id": "lb4", "name": "Calves", "exercises": [{ "id": "ex_scr3", "name": "Seated Calf Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            }
        ],
        "weeklySchedule": {
            "monday": "upper_a",
            "tuesday": "lower_a",
            "thursday": "upper_b",
            "friday": "lower_b"
        }
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- 6. Seed "Fuerza Pro" Template
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json)
VALUES (
    'strength_pro',
    'Fuerza Pro',
    'Advanced strength and hypertrophy hybrid program.',
    'Advanced',
    'Hybrid',
    5,
    '{
        "name": "Fuerza Pro",
        "level": "Advanced",
        "focus": "Strength & Hypertrophy",
        "frequency": 5,
        "duration": 75,
        "schedule": ["M", "T", "W", "T", "F", null, null],
        "description": "Advanced strength and hypertrophy hybrid program.",
        "workouts": [
            {
                "id": "upper_strength",
                "name": "Upper Strength",
                "blocks": [
                    { "id": "us1", "name": "Warm-up", "exercises": [{ "id": "ex_jr4", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "45s", "rir": "0", "rest": "30s" }] },
                    { "id": "us2", "name": "Chest", "exercises": [{ "id": "ex_bbp", "name": "Barbell Bench Press", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s" }] },
                    { "id": "us3", "name": "Back", "exercises": [
                        { "id": "ex_wpu", "name": "Weighted Pull-Up", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "120s" },
                        { "id": "ex_brow", "name": "Barbell Row", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" }
                    ]},
                    { "id": "us4", "name": "Shoulders", "exercises": [{ "id": "ex_sdsp", "name": "Seated Dumbbell Shoulder Press", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "90s" }] },
                    { "id": "us5", "name": "Arms", "exercises": [
                        { "id": "ex_bc", "name": "Barbell Curl", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "60s" },
                        { "id": "ex_sc", "name": "Skull Crushers", "type": "Isolation", "sets": "3", "reps": "10", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_strength",
                "name": "Lower Strength",
                "blocks": [
                    { "id": "ls1", "name": "Warm-up", "exercises": [{ "id": "ex_bws2", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": "3", "rest": "30s" }] },
                    { "id": "ls2", "name": "Quads", "exercises": [{ "id": "ex_bbs3", "name": "Barbell Back Squat", "type": "Compound", "sets": "5", "reps": "5", "rir": "2", "rest": "150s" }] },
                    { "id": "ls3", "name": "Posterior Chain", "exercises": [{ "id": "ex_rdl3", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "6", "rir": "2", "rest": "150s" }] },
                    { "id": "ls4", "name": "Glutes", "exercises": [{ "id": "ex_ht2", "name": "Hip Thrust", "type": "Compound", "sets": "3", "reps": "8", "rir": "2", "rest": "120s" }] },
                    { "id": "ls5", "name": "Calves", "exercises": [{ "id": "ex_scr4", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "push_hypertrophy",
                "name": "Push Hypertrophy",
                "blocks": [
                    { "id": "ph1", "name": "Warm-up", "exercises": [{ "id": "ex_ac", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "ph2", "name": "Chest", "exercises": [
                        { "id": "ex_idp2", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_cfm", "name": "Chest Fly Machine", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ph3", "name": "Shoulders", "exercises": [
                        { "id": "ex_lr2", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" },
                        { "id": "ex_cfr", "name": "Cable Front Raise", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "ph4", "name": "Triceps", "exercises": [{ "id": "ex_rpd", "name": "Rope Pushdown", "type": "Isolation", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "pull_hypertrophy",
                "name": "Pull Hypertrophy",
                "blocks": [
                    { "id": "puh1", "name": "Warm-up", "exercises": [{ "id": "ex_bpa", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": "0", "rest": "20s" }] },
                    { "id": "puh2", "name": "Back", "exercises": [
                        { "id": "ex_lp3", "name": "Lat Pulldown", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr2", "name": "Chest Supported Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_sacr", "name": "Single Arm Cable Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "puh3", "name": "Rear Delts", "exercises": [{ "id": "ex_rpd2", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "puh4", "name": "Biceps", "exercises": [{ "id": "ex_dhc", "name": "Dumbbell Hammer Curl", "type": "Isolation", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "lower_hypertrophy",
                "name": "Lower Hypertrophy",
                "blocks": [
                    { "id": "lh1", "name": "Warm-up", "exercises": [{ "id": "ex_wl2", "name": "Walking Lunges", "type": "Compound", "sets": "2", "reps": "12", "rir": "3", "rest": "30s" }] },
                    { "id": "lh2", "name": "Quads", "exercises": [
                        { "id": "ex_lpr3", "name": "Leg Press", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s" },
                        { "id": "ex_le2", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "lh3", "name": "Hamstrings", "exercises": [{ "id": "ex_slc", "name": "Seated Leg Curl", "type": "Isolation", "sets": "4", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "lh4", "name": "Glutes", "exercises": [{ "id": "ex_bss", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "lh5", "name": "Calves", "exercises": [{ "id": "ex_slc2", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            }
        ],
        "weeklySchedule": {
            "monday": "upper_strength",
            "tuesday": "lower_strength",
            "wednesday": "push_hypertrophy",
            "thursday": "pull_hypertrophy",
            "friday": "lower_hypertrophy"
        }
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- 7. Seed "Hipertrofia" Template
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json)
VALUES (
    'hypertrophy_volume',
    'Hipertrofia',
    'Maximal hypertrophy focus with high volume training.',
    'Volume',
    'Growth',
    5,
    '{
        "name": "Hipertrofia",
        "level": "Volume",
        "focus": "Hypertrophy",
        "frequency": 5,
        "duration": 60,
        "schedule": ["M", "T", "W", null, "F", "S", null],
        "description": "Maximal hypertrophy focus with high volume training.",
        "workouts": [
            {
                "id": "upper_a_hyper",
                "name": "Upper A",
                "blocks": [
                    { "id": "ua1h", "name": "Warm-up", "exercises": [{ "id": "ex_jr5", "name": "Jump Rope", "type": "Compound", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "ua2h", "name": "Chest", "exercises": [
                        { "id": "ex_idp3", "name": "Incline Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_mcp", "name": "Machine Chest Press", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ua3h", "name": "Back", "exercises": [
                        { "id": "ex_lp4", "name": "Lat Pulldown", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr3", "name": "Chest Supported Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ua4h", "name": "Shoulders", "exercises": [{ "id": "ex_lr3", "name": "Lateral Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "ua5h", "name": "Arms", "exercises": [
                        { "id": "ex_cc", "name": "Cable Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_rpd3", "name": "Rope Pushdown", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_a_hyper",
                "name": "Lower A",
                "blocks": [
                    { "id": "la1h", "name": "Warm-up", "exercises": [{ "id": "ex_bws3", "name": "Bodyweight Squat", "type": "Compound", "sets": "2", "reps": "15", "rir": "3", "rest": "20s" }] },
                    { "id": "la2h", "name": "Quads", "exercises": [
                        { "id": "ex_lpr4", "name": "Leg Press", "type": "Compound", "sets": "4", "reps": "12", "rir": "2", "rest": "90s" },
                        { "id": "ex_le3", "name": "Leg Extension", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "la3h", "name": "Hamstrings", "exercises": [{ "id": "ex_slc3", "name": "Seated Leg Curl", "type": "Isolation", "sets": "4", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "la4h", "name": "Glutes", "exercises": [{ "id": "ex_bss2", "name": "Bulgarian Split Squat", "type": "Compound", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "la5h", "name": "Calves", "exercises": [{ "id": "ex_scr5", "name": "Seated Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "push_hyper",
                "name": "Push",
                "blocks": [
                    { "id": "puh1h", "name": "Warm-up", "exercises": [{ "id": "ex_ac2", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "puh2h", "name": "Chest", "exercises": [
                        { "id": "ex_fdp", "name": "Flat Dumbbell Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_ccf", "name": "Cable Chest Fly", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "puh3h", "name": "Shoulders", "exercises": [
                        { "id": "ex_sdsp2", "name": "Seated Dumbbell Shoulder Press", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_clr", "name": "Cable Lateral Raise", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "puh4h", "name": "Triceps", "exercises": [
                        { "id": "ex_ote2", "name": "Overhead Triceps Extension", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_tp2", "name": "Triceps Pushdown", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "pull_hyper",
                "name": "Pull",
                "blocks": [
                    { "id": "phh1h", "name": "Warm-up", "exercises": [{ "id": "ex_bpa2", "name": "Band Pull-Apart", "type": "Isolation", "sets": "2", "reps": "20", "rir": "0", "rest": "20s" }] },
                    { "id": "phh2h", "name": "Back", "exercises": [
                        { "id": "ex_pua", "name": "Pull-Up Assisted", "type": "Compound", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_scr6", "name": "Seated Cable Row", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_sadr", "name": "Single Arm Dumbbell Row", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "phh3h", "name": "Rear Delts", "exercises": [{ "id": "ex_rpd4", "name": "Reverse Pec Deck", "type": "Isolation", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "phh4h", "name": "Biceps", "exercises": [
                        { "id": "ex_hc2", "name": "Hammer Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_pcm", "name": "Preacher Curl Machine", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_b_hyper",
                "name": "Lower B",
                "blocks": [
                    { "id": "lb1h", "name": "Warm-up", "exercises": [{ "id": "ex_wl3", "name": "Walking Lunges", "type": "Compound", "sets": "2", "reps": "12", "rir": "3", "rest": "20s" }] },
                    { "id": "lb2h", "name": "Posterior Chain", "exercises": [
                        { "id": "ex_rdl4", "name": "Romanian Deadlift", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "120s" },
                        { "id": "ex_ht3", "name": "Hip Thrust", "type": "Compound", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "lb3h", "name": "Quads", "exercises": [{ "id": "ex_hsq", "name": "Hack Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "2", "rest": "90s" }] },
                    { "id": "lb4h", "name": "Hamstrings", "exercises": [{ "id": "ex_llc", "name": "Lying Leg Curl", "type": "Isolation", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "lb5h", "name": "Calves", "exercises": [{ "id": "ex_scr6", "name": "Standing Calf Raise", "type": "Isolation", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            }
        ],
        "weeklySchedule": {
            "monday": "upper_a_hyper",
            "tuesday": "lower_a_hyper",
            "wednesday": "push_hyper",
            "friday": "pull_hyper",
            "saturday": "lower_b_hyper"
        }
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- 8. Seed "Movilidad & Recuperación" Template
INSERT INTO public.training_templates (key, name, description, level, type, weekly_frequency, data_json)
VALUES (
    'mobility_recovery',
    'Movilidad & Recuperación',
    'Restorative program focusing on joint health and recovery.',
    'Restorative',
    'Mobility + Recovery',
    4,
    '{
        "name": "Movilidad & Recuperación",
        "level": "Restorative",
        "focus": "Mobility & Recovery",
        "frequency": 4,
        "duration": 45,
        "schedule": ["M", "T", null, "T", "F", null, null],
        "description": "Restorative program focusing on joint health and recovery.",
        "workouts": [
            {
                "id": "full_body_mobility",
                "name": "Full Body Mobility",
                "blocks": [
                    { "id": "m1", "name": "Warm-up", "exercises": [{ "id": "ex_wte", "name": "Walk Treadmill Easy", "type": "Compound", "sets": "1", "reps": "5 min", "rir": null, "rest": "0s" }] },
                    { "id": "m2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_ccw", "name": "Cat Cow", "type": "Isolation", "sets": "2", "reps": "10", "rir": "3", "rest": "20s" },
                        { "id": "ex_tr", "name": "Thoracic Rotation", "type": "Isolation", "sets": "2", "reps": "10", "rir": "3", "rest": "20s" },
                        { "id": "ex_wgs", "name": "World’s Greatest Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_dsh", "name": "Deep Squat Hold", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]},
                    { "id": "m3", "name": "Activation Block", "exercises": [
                        { "id": "ex_gb", "name": "Glute Bridge", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_bd", "name": "Bird Dog", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_db", "name": "Dead Bug", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "m4", "name": "Cool Down", "exercises": [
                        { "id": "ex_cp", "name": "Child’s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_bds", "name": "Breathing Drill Supine", "type": "Isolation", "sets": "2", "reps": "60s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "upper_recovery",
                "name": "Upper Recovery",
                "blocks": [
                    { "id": "ur1", "name": "Warm-up", "exercises": [{ "id": "ex_ac3", "name": "Arm Circles", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }] },
                    { "id": "ur2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_bpa3", "name": "Band Pull-Apart", "type": "Isolation", "sets": "3", "reps": "15", "rir": "3", "rest": "30s" },
                        { "id": "ex_ws", "name": "Wall Slides", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_spu", "name": "Scapular Push-Up", "type": "Isolation", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_dps", "name": "Doorway Pec Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]},
                    { "id": "ur3", "name": "Light Strength Block", "exercises": [
                        { "id": "ex_scrl", "name": "Seated Cable Row Light", "type": "Compound", "sets": "2", "reps": "15", "rir": "4", "rest": "45s" },
                        { "id": "ex_dser", "name": "Dumbbell Shoulder External Rotation", "type": "Isolation", "sets": "2", "reps": "12", "rir": "4", "rest": "45s" }
                    ]},
                    { "id": "ur4", "name": "Cool Down", "exercises": [
                        { "id": "ex_ns", "name": "Neck Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s" },
                        { "id": "ex_uts", "name": "Upper Trap Stretch", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "lower_recovery",
                "name": "Lower Recovery",
                "blocks": [
                    { "id": "lr1", "name": "Warm-up", "exercises": [{ "id": "ex_wte2", "name": "Walk Treadmill Easy", "type": "Compound", "sets": "1", "reps": "5 min", "rir": null, "rest": "0s" }] },
                    { "id": "lr2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_lwb", "name": "Walking Lunges Bodyweight", "type": "Compound", "sets": "2", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_hfs", "name": "Hip Flexor Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_hss", "name": "Hamstring Stretch Supine", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_add", "name": "Ankle Dorsiflexion Drill", "type": "Isolation", "sets": "2", "reps": "12", "rir": "3", "rest": "20s" }
                    ]},
                    { "id": "lr3", "name": "Activation Block", "exercises": [
                        { "id": "ex_bws4", "name": "Bodyweight Squat", "type": "Compound", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_sub", "name": "Step-Up Bodyweight", "type": "Compound", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_crb", "name": "Calf Raise Bodyweight", "type": "Isolation", "sets": "3", "reps": "15", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "lr4", "name": "Cool Down", "exercises": [
                        { "id": "ex_f4s", "name": "Figure 4 Stretch", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_sff", "name": "Seated Forward Fold", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "flow_core",
                "name": "Flow + Core",
                "blocks": [
                    { "id": "fc1", "name": "Warm-up", "exercises": [{ "id": "ex_mip", "name": "March in Place", "type": "Compound", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }] },
                    { "id": "fc2", "name": "Flow Block", "exercises": [
                        { "id": "ex_iw", "name": "Inchworm", "type": "Compound", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_ddcf", "name": "Down Dog to Cobra Flow", "type": "Compound", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_ss", "name": "Spiderman Stretch", "type": "Compound", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" }
                    ]},
                    { "id": "fc3", "name": "Core Stability", "exercises": [
                        { "id": "ex_plnk", "name": "Plank", "type": "Isolation", "sets": "3", "reps": "30s", "rir": null, "rest": "30s" },
                        { "id": "ex_splnk", "name": "Side Plank", "type": "Isolation", "sets": "2", "reps": "20s", "rir": null, "rest": "30s" },
                        { "id": "ex_pp", "name": "Pallof Press", "type": "Isolation", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "fc4", "name": "Cool Down", "exercises": [
                        { "id": "ex_cp2", "name": "Child’s Pose", "type": "Isolation", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_bdse", "name": "Breathing Drill Seated", "type": "Isolation", "sets": "2", "reps": "60s", "rir": null, "rest": "20s" }
                    ]}
                ]
            }
        ],
        "weeklySchedule": {
            "monday": "full_body_mobility",
            "tuesday": "upper_recovery",
            "thursday": "lower_recovery",
            "friday": "flow_core"
        }
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;
