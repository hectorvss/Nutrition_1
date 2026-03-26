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
                    { "id": "b1", "name": "Warm-up", "exercises": [{ "id": "ex_jj", "exerciseName": "Jumping Jacks", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "b2", "name": "Torso (Push)", "exercises": [{ "id": "ex_dbp", "exerciseName": "Dumbbell Bench Press", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "b3", "name": "Legs", "exercises": [{ "id": "ex_bbs", "exerciseName": "Barbell Back Squat", "sets": "3", "reps": "10", "rir": "2", "rest": "120s" }] }
                ]
            },
            {
                "id": "workout_b",
                "name": "Full Body B – Pull Focus",
                "blocks": [
                    { "id": "b4", "name": "Warm-up", "exercises": [{ "id": "ex_jr", "exerciseName": "Jump Rope", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "b5", "name": "Torso (Pull)", "exercises": [{ "id": "ex_lp", "exerciseName": "Lat Pulldown", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "b6", "name": "Legs", "exercises": [{ "id": "ex_lpr", "exerciseName": "Leg Press", "sets": "3", "reps": "12", "rir": "2", "rest": "120s" }] }
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
                    { "id": "ua1", "name": "Warm-up", "exercises": [{ "id": "ex_jr2", "exerciseName": "Jump Rope", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "ua2", "name": "Chest & Shoulders", "exercises": [
                        { "id": "ex_dbp2", "exerciseName": "Dumbbell Bench Press", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_dsp", "exerciseName": "Dumbbell Shoulder Press", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "ua3", "name": "Back", "exercises": [{ "id": "ex_scr", "exerciseName": "Seated Cable Row", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "ua4", "name": "Arms", "exercises": [
                        { "id": "ex_dc", "exerciseName": "Dumbbell Curl", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_tp", "exerciseName": "Triceps Pushdown", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_a",
                "name": "Lower A",
                "blocks": [
                    { "id": "la1", "name": "Warm-up", "exercises": [{ "id": "ex_bws", "exerciseName": "Bodyweight Squat", "sets": "2", "reps": "15", "rir": "3", "rest": "30s" }] },
                    { "id": "la2", "name": "Quads", "exercises": [
                        { "id": "ex_bbs2", "exerciseName": "Barbell Back Squat", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" },
                        { "id": "ex_le", "exerciseName": "Leg Extension", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "la3", "name": "Hamstrings & Glutes", "exercises": [{ "id": "ex_rdl", "exerciseName": "Romanian Deadlift", "sets": "3", "reps": "10", "rir": "2", "rest": "120s" }] },
                    { "id": "la4", "name": "Calves", "exercises": [{ "id": "ex_scr2", "exerciseName": "Standing Calf Raise", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "upper_b",
                "name": "Upper B",
                "blocks": [
                    { "id": "ub1", "name": "Warm-up", "exercises": [{ "id": "ex_jr3", "exerciseName": "Jump Rope", "sets": "2", "reps": "30s", "rir": "0", "rest": "30s" }] },
                    { "id": "ub2", "name": "Back", "exercises": [
                        { "id": "ex_lp2", "exerciseName": "Lat Pulldown", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr", "exerciseName": "Chest Supported Row", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "ub3", "name": "Chest", "exercises": [{ "id": "ex_idp", "exerciseName": "Incline Dumbbell Press", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "ub4", "name": "Shoulders", "exercises": [{ "id": "ex_lr", "exerciseName": "Lateral Raise", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "ub5", "name": "Arms", "exercises": [
                        { "id": "ex_hc", "exerciseName": "Hammer Curl", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_ote", "exerciseName": "Overhead Triceps Extension", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_b",
                "name": "Lower B",
                "blocks": [
                    { "id": "lb1", "name": "Warm-up", "exercises": [{ "id": "ex_wl", "exerciseName": "Walking Lunges", "sets": "2", "reps": "12", "rir": "3", "rest": "30s" }] },
                    { "id": "lb2", "name": "Hamstrings & Glutes", "exercises": [
                        { "id": "ex_rdl2", "exerciseName": "Romanian Deadlift", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" },
                        { "id": "ex_ht", "exerciseName": "Hip Thrust", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "lb3", "name": "Quads", "exercises": [{ "id": "ex_lpr2", "exerciseName": "Leg Press", "sets": "3", "reps": "12", "rir": "2", "rest": "90s" }] },
                    { "id": "lb4", "name": "Calves", "exercises": [{ "id": "ex_scr3", "exerciseName": "Seated Calf Raise", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] }
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
                    { "id": "us1", "name": "Warm-up", "exercises": [{ "id": "ex_jr4", "exerciseName": "Jump Rope", "sets": "2", "reps": "45s", "rir": "0", "rest": "30s" }] },
                    { "id": "us2", "name": "Chest", "exercises": [{ "id": "ex_bbp", "exerciseName": "Barbell Bench Press", "sets": "5", "reps": "5", "rir": "2", "rest": "150s" }] },
                    { "id": "us3", "name": "Back", "exercises": [
                        { "id": "ex_wpu", "exerciseName": "Weighted Pull-Up", "sets": "4", "reps": "6", "rir": "2", "rest": "120s" },
                        { "id": "ex_brow", "exerciseName": "Barbell Row", "sets": "4", "reps": "8", "rir": "2", "rest": "120s" }
                    ]},
                    { "id": "us4", "name": "Shoulders", "exercises": [{ "id": "ex_sdsp", "exerciseName": "Seated Dumbbell Shoulder Press", "sets": "3", "reps": "8", "rir": "2", "rest": "90s" }] },
                    { "id": "us5", "name": "Arms", "exercises": [
                        { "id": "ex_bc", "exerciseName": "Barbell Curl", "sets": "3", "reps": "10", "rir": "2", "rest": "60s" },
                        { "id": "ex_sc", "exerciseName": "Skull Crushers", "sets": "3", "reps": "10", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_strength",
                "name": "Lower Strength",
                "blocks": [
                    { "id": "ls1", "name": "Warm-up", "exercises": [{ "id": "ex_bws2", "exerciseName": "Bodyweight Squat", "sets": "2", "reps": "15", "rir": "3", "rest": "30s" }] },
                    { "id": "ls2", "name": "Quads", "exercises": [{ "id": "ex_bbs3", "exerciseName": "Barbell Back Squat", "sets": "5", "reps": "5", "rir": "2", "rest": "150s" }] },
                    { "id": "ls3", "name": "Posterior Chain", "exercises": [{ "id": "ex_rdl3", "exerciseName": "Romanian Deadlift", "sets": "4", "reps": "6", "rir": "2", "rest": "150s" }] },
                    { "id": "ls4", "name": "Glutes", "exercises": [{ "id": "ex_ht2", "exerciseName": "Hip Thrust", "sets": "3", "reps": "8", "rir": "2", "rest": "120s" }] },
                    { "id": "ls5", "name": "Calves", "exercises": [{ "id": "ex_scr4", "exerciseName": "Standing Calf Raise", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "push_hypertrophy",
                "name": "Push Hypertrophy",
                "blocks": [
                    { "id": "ph1", "name": "Warm-up", "exercises": [{ "id": "ex_ac", "exerciseName": "Arm Circles", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "ph2", "name": "Chest", "exercises": [
                        { "id": "ex_idp2", "exerciseName": "Incline Dumbbell Press", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_cfm", "exerciseName": "Chest Fly Machine", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ph3", "name": "Shoulders", "exercises": [
                        { "id": "ex_lr2", "exerciseName": "Lateral Raise", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" },
                        { "id": "ex_cfr", "exerciseName": "Cable Front Raise", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "ph4", "name": "Triceps", "exercises": [{ "id": "ex_rpd", "exerciseName": "Rope Pushdown", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "pull_hypertrophy",
                "name": "Pull Hypertrophy",
                "blocks": [
                    { "id": "puh1", "name": "Warm-up", "exercises": [{ "id": "ex_bpa", "exerciseName": "Band Pull-Apart", "sets": "2", "reps": "20", "rir": "0", "rest": "20s" }] },
                    { "id": "puh2", "name": "Back", "exercises": [
                        { "id": "ex_lp3", "exerciseName": "Lat Pulldown", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr2", "exerciseName": "Chest Supported Row", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_sacr", "exerciseName": "Single Arm Cable Row", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "puh3", "name": "Rear Delts", "exercises": [{ "id": "ex_rpd2", "exerciseName": "Reverse Pec Deck", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "puh4", "name": "Biceps", "exercises": [{ "id": "ex_dhc", "exerciseName": "Dumbbell Hammer Curl", "sets": "4", "reps": "12", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "lower_hypertrophy",
                "name": "Lower Hypertrophy",
                "blocks": [
                    { "id": "lh1", "name": "Warm-up", "exercises": [{ "id": "ex_wl2", "exerciseName": "Walking Lunges", "sets": "2", "reps": "12", "rir": "3", "rest": "30s" }] },
                    { "id": "lh2", "name": "Quads", "exercises": [
                        { "id": "ex_lpr3", "exerciseName": "Leg Press", "sets": "4", "reps": "12", "rir": "2", "rest": "90s" },
                        { "id": "ex_le2", "exerciseName": "Leg Extension", "sets": "3", "reps": "15", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "lh3", "name": "Hamstrings", "exercises": [{ "id": "ex_slc", "exerciseName": "Seated Leg Curl", "sets": "4", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "lh4", "name": "Glutes", "exercises": [{ "id": "ex_bss", "exerciseName": "Bulgarian Split Squat", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "lh5", "name": "Calves", "exercises": [{ "id": "ex_slc2", "exerciseName": "Seated Calf Raise", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
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
                    { "id": "ua1h", "name": "Warm-up", "exercises": [{ "id": "ex_jr5", "exerciseName": "Jump Rope", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "ua2h", "name": "Chest", "exercises": [
                        { "id": "ex_idp3", "exerciseName": "Incline Dumbbell Press", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_mcp", "exerciseName": "Machine Chest Press", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ua3h", "name": "Back", "exercises": [
                        { "id": "ex_lp4", "exerciseName": "Lat Pulldown", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_csr3", "exerciseName": "Chest Supported Row", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "ua4h", "name": "Shoulders", "exercises": [{ "id": "ex_lr3", "exerciseName": "Lateral Raise", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "ua5h", "name": "Arms", "exercises": [
                        { "id": "ex_cc", "exerciseName": "Cable Curl", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_rpd3", "exerciseName": "Rope Pushdown", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_a_hyper",
                "name": "Lower A",
                "blocks": [
                    { "id": "la1h", "name": "Warm-up", "exercises": [{ "id": "ex_bws3", "exerciseName": "Bodyweight Squat", "sets": "2", "reps": "15", "rir": "3", "rest": "20s" }] },
                    { "id": "la2h", "name": "Quads", "exercises": [
                        { "id": "ex_lpr4", "exerciseName": "Leg Press", "sets": "4", "reps": "12", "rir": "2", "rest": "90s" },
                        { "id": "ex_le3", "exerciseName": "Leg Extension", "sets": "3", "reps": "15", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "la3h", "name": "Hamstrings", "exercises": [{ "id": "ex_slc3", "exerciseName": "Seated Leg Curl", "sets": "4", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "la4h", "name": "Glutes", "exercises": [{ "id": "ex_bss2", "exerciseName": "Bulgarian Split Squat", "sets": "3", "reps": "10", "rir": "2", "rest": "90s" }] },
                    { "id": "la5h", "name": "Calves", "exercises": [{ "id": "ex_scr5", "exerciseName": "Seated Calf Raise", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
                ]
            },
            {
                "id": "push_hyper",
                "name": "Push",
                "blocks": [
                    { "id": "puh1h", "name": "Warm-up", "exercises": [{ "id": "ex_ac2", "exerciseName": "Arm Circles", "sets": "2", "reps": "30s", "rir": "0", "rest": "20s" }] },
                    { "id": "puh2h", "name": "Chest", "exercises": [
                        { "id": "ex_fdp", "exerciseName": "Flat Dumbbell Press", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_ccf", "exerciseName": "Cable Chest Fly", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "puh3h", "name": "Shoulders", "exercises": [
                        { "id": "ex_sdsp2", "exerciseName": "Seated Dumbbell Shoulder Press", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_clr", "exerciseName": "Cable Lateral Raise", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }
                    ]},
                    { "id": "puh4h", "name": "Triceps", "exercises": [
                        { "id": "ex_ote2", "exerciseName": "Overhead Triceps Extension", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_tp2", "exerciseName": "Triceps Pushdown", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "pull_hyper",
                "name": "Pull",
                "blocks": [
                    { "id": "phh1h", "name": "Warm-up", "exercises": [{ "id": "ex_bpa2", "exerciseName": "Band Pull-Apart", "sets": "2", "reps": "20", "rir": "0", "rest": "20s" }] },
                    { "id": "phh2h", "name": "Back", "exercises": [
                        { "id": "ex_pua", "exerciseName": "Pull-Up Assisted", "sets": "4", "reps": "8", "rir": "2", "rest": "90s" },
                        { "id": "ex_scr6", "exerciseName": "Seated Cable Row", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" },
                        { "id": "ex_sadr", "exerciseName": "Single Arm Dumbbell Row", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }
                    ]},
                    { "id": "phh3h", "name": "Rear Delts", "exercises": [{ "id": "ex_rpd4", "exerciseName": "Reverse Pec Deck", "sets": "3", "reps": "15", "rir": "2", "rest": "60s" }] },
                    { "id": "phh4h", "name": "Biceps", "exercises": [
                        { "id": "ex_hc2", "exerciseName": "Hammer Curl", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" },
                        { "id": "ex_pcm", "exerciseName": "Preacher Curl Machine", "sets": "3", "reps": "12", "rir": "2", "rest": "60s" }
                    ]}
                ]
            },
            {
                "id": "lower_b_hyper",
                "name": "Lower B",
                "blocks": [
                    { "id": "lb1h", "name": "Warm-up", "exercises": [{ "id": "ex_wl3", "exerciseName": "Walking Lunges", "sets": "2", "reps": "12", "rir": "3", "rest": "20s" }] },
                    { "id": "lb2h", "name": "Posterior Chain", "exercises": [
                        { "id": "ex_rdl4", "exerciseName": "Romanian Deadlift", "sets": "4", "reps": "10", "rir": "2", "rest": "120s" },
                        { "id": "ex_ht3", "exerciseName": "Hip Thrust", "sets": "4", "reps": "10", "rir": "2", "rest": "90s" }
                    ]},
                    { "id": "lb3h", "name": "Quads", "exercises": [{ "id": "ex_hsq", "exerciseName": "Hack Squat", "sets": "3", "reps": "12", "rir": "2", "rest": "90s" }] },
                    { "id": "lb4h", "name": "Hamstrings", "exercises": [{ "id": "ex_llc", "exerciseName": "Lying Leg Curl", "sets": "3", "reps": "12", "rir": "2", "rest": "75s" }] },
                    { "id": "lb5h", "name": "Calves", "exercises": [{ "id": "ex_scr6", "exerciseName": "Standing Calf Raise", "sets": "4", "reps": "15", "rir": "2", "rest": "60s" }] }
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
                    { "id": "m1", "name": "Warm-up", "exercises": [{ "id": "ex_wte", "exerciseName": "Walk Treadmill Easy", "sets": "1", "reps": "5 min", "rir": null, "rest": "0s" }] },
                    { "id": "m2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_ccw", "exerciseName": "Cat Cow", "sets": "2", "reps": "10", "rir": "3", "rest": "20s" },
                        { "id": "ex_tr", "exerciseName": "Thoracic Rotation", "sets": "2", "reps": "10", "rir": "3", "rest": "20s" },
                        { "id": "ex_wgs", "exerciseName": "World’s Greatest Stretch", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_dsh", "exerciseName": "Deep Squat Hold", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]},
                    { "id": "m3", "name": "Activation Block", "exercises": [
                        { "id": "ex_gb", "exerciseName": "Glute Bridge", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_bd", "exerciseName": "Bird Dog", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_db", "exerciseName": "Dead Bug", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "m4", "name": "Cool Down", "exercises": [
                        { "id": "ex_cp", "exerciseName": "Child’s Pose", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_bds", "exerciseName": "Breathing Drill Supine", "sets": "2", "reps": "60s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "upper_recovery",
                "name": "Upper Recovery",
                "blocks": [
                    { "id": "ur1", "name": "Warm-up", "exercises": [{ "id": "ex_ac3", "exerciseName": "Arm Circles", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }] },
                    { "id": "ur2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_bpa3", "exerciseName": "Band Pull-Apart", "sets": "3", "reps": "15", "rir": "3", "rest": "30s" },
                        { "id": "ex_ws", "exerciseName": "Wall Slides", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_spu", "exerciseName": "Scapular Push-Up", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_dps", "exerciseName": "Doorway Pec Stretch", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]},
                    { "id": "ur3", "name": "Light Strength Block", "exercises": [
                        { "id": "ex_scrl", "exerciseName": "Seated Cable Row Light", "sets": "2", "reps": "15", "rir": "4", "rest": "45s" },
                        { "id": "ex_dser", "exerciseName": "Dumbbell Shoulder External Rotation", "sets": "2", "reps": "12", "rir": "4", "rest": "45s" }
                    ]},
                    { "id": "ur4", "name": "Cool Down", "exercises": [
                        { "id": "ex_ns", "exerciseName": "Neck Stretch", "sets": "2", "reps": "20s", "rir": null, "rest": "20s" },
                        { "id": "ex_uts", "exerciseName": "Upper Trap Stretch", "sets": "2", "reps": "20s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "lower_recovery",
                "name": "Lower Recovery",
                "blocks": [
                    { "id": "lr1", "name": "Warm-up", "exercises": [{ "id": "ex_wte2", "exerciseName": "Walk Treadmill Easy", "sets": "1", "reps": "5 min", "rir": null, "rest": "0s" }] },
                    { "id": "lr2", "name": "Mobility Block", "exercises": [
                        { "id": "ex_lwb", "exerciseName": "Walking Lunges Bodyweight", "sets": "2", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_hfs", "exerciseName": "Hip Flexor Stretch", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_hss", "exerciseName": "Hamstring Stretch Supine", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_add", "exerciseName": "Ankle Dorsiflexion Drill", "sets": "2", "reps": "12", "rir": "3", "rest": "20s" }
                    ]},
                    { "id": "lr3", "name": "Activation Block", "exercises": [
                        { "id": "ex_bws4", "exerciseName": "Bodyweight Squat", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" },
                        { "id": "ex_sub", "exerciseName": "Step-Up Bodyweight", "sets": "3", "reps": "10", "rir": "3", "rest": "30s" },
                        { "id": "ex_crb", "exerciseName": "Calf Raise Bodyweight", "sets": "3", "reps": "15", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "lr4", "name": "Cool Down", "exercises": [
                        { "id": "ex_f4s", "exerciseName": "Figure 4 Stretch", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_sff", "exerciseName": "Seated Forward Fold", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }
                    ]}
                ]
            },
            {
                "id": "flow_core",
                "name": "Flow + Core",
                "blocks": [
                    { "id": "fc1", "name": "Warm-up", "exercises": [{ "id": "ex_mip", "exerciseName": "March in Place", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" }] },
                    { "id": "fc2", "name": "Flow Block", "exercises": [
                        { "id": "ex_iw", "exerciseName": "Inchworm", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_ddcf", "exerciseName": "Down Dog to Cobra Flow", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" },
                        { "id": "ex_ss", "exerciseName": "Spiderman Stretch", "sets": "2", "reps": "8", "rir": "3", "rest": "20s" }
                    ]},
                    { "id": "fc3", "name": "Core Stability", "exercises": [
                        { "id": "ex_plnk", "exerciseName": "Plank", "sets": "3", "reps": "30s", "rir": null, "rest": "30s" },
                        { "id": "ex_splnk", "exerciseName": "Side Plank", "sets": "2", "reps": "20s", "rir": null, "rest": "30s" },
                        { "id": "ex_pp", "exerciseName": "Pallof Press", "sets": "3", "reps": "12", "rir": "3", "rest": "30s" }
                    ]},
                    { "id": "fc4", "name": "Cool Down", "exercises": [
                        { "id": "ex_cp2", "exerciseName": "Child’s Pose", "sets": "2", "reps": "30s", "rir": null, "rest": "20s" },
                        { "id": "ex_bdse", "exerciseName": "Breathing Drill Seated", "sets": "2", "reps": "60s", "rir": null, "rest": "20s" }
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
