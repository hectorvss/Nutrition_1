-- Create nutrition_templates table if not exists
CREATE TABLE IF NOT EXISTS public.nutrition_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_calories INTEGER NOT NULL,
    data_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_templates ENABLE ROW LEVEL SECURITY;

-- Seed Fat Loss Basic template (1500 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'fat_loss_basic',
    'Fat Loss Basic',
    1500,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Greek Yogurt 0%", "multiplier": 2.00, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 },
                    { "name": "Oats", "multiplier": 0.40, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Berries", "multiplier": 1.00, "calories": 50, "protein": 0.7, "carbs": 12, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.15, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 1.50, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Potato", "multiplier": 1.80, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "White Fish", "multiplier": 1.80, "calories": 105, "protein": 23, "carbs": 0, "fats": 0.8 },
                    { "name": "Rice Cooked", "multiplier": 1.20, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Salad / Vegetables", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 },
                    { "name": "Apple", "multiplier": 1.50, "calories": 52, "protein": 0.3, "carbs": 14, "fats": 0.2 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Active Maintain template (1800 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'active_maintain',
    'Active Maintain',
    1800,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 0.60, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 2.50, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.20, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.20, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Greek Yogurt 0%", "multiplier": 1.50, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 1.60, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 2.00, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Whole Egg", "multiplier": 1.00, "calories": 155, "protein": 13, "carbs": 1.1, "fats": 11 },
                    { "name": "Egg Whites", "multiplier": 1.80, "calories": 52, "protein": 11, "carbs": 0.7, "fats": 0.2 },
                    { "name": "Bread", "multiplier": 0.80, "calories": 247, "protein": 13, "carbs": 41, "fats": 3.4 },
                    { "name": "Salad / Vegetables", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Avocado", "multiplier": 0.30, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7 },
                    { "name": "Orange", "multiplier": 1.50, "calories": 47, "protein": 0.9, "carbs": 12, "fats": 0.1 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Moderate Gain template (2000 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'moderate_gain',
    'Moderate Gain',
    2000,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 0.70, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 2.50, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.20, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.20, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Whey Protein", "multiplier": 0.30, "calories": 360, "protein": 80, "carbs": 5, "fats": 2 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 1.70, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 2.20, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 },
                    { "name": "Apple", "multiplier": 1.50, "calories": 52, "protein": 0.3, "carbs": 14, "fats": 0.2 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Salmon", "multiplier": 1.80, "calories": 208, "protein": 20, "carbs": 0, "fats": 13 },
                    { "name": "Potato", "multiplier": 2.50, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Greek Yogurt 0%", "multiplier": 1.50, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Active Build template (2200 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'active_build',
    'Active Build',
    2200,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 0.80, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 2.50, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.20, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.25, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Whey Protein", "multiplier": 0.30, "calories": 360, "protein": 80, "carbs": 5, "fats": 2 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 1.80, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 2.50, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 },
                    { "name": "Apple", "multiplier": 1.50, "calories": 52, "protein": 0.3, "carbs": 14, "fats": 0.2 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Lean Beef", "multiplier": 1.80, "calories": 250, "protein": 26, "carbs": 0, "fats": 15 },
                    { "name": "Potato", "multiplier": 2.80, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Avocado", "multiplier": 0.40, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7 },
                    { "name": "Greek Yogurt 0%", "multiplier": 1.50, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Athlete Perform template (2500 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'athlete_perform',
    'Athlete Perform',
    2500,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 0.90, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 3.00, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.50, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.25, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Whey Protein", "multiplier": 0.30, "calories": 360, "protein": 80, "carbs": 5, "fats": 2 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.00, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 3.00, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.10, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Salmon", "multiplier": 2.00, "calories": 208, "protein": 20, "carbs": 0, "fats": 13 },
                    { "name": "Potato", "multiplier": 3.00, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Avocado", "multiplier": 0.50, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Mass Builder template (2800 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'mass_builder',
    'Mass Builder',
    2800,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 1.00, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 3.00, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.50, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.30, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Whey Protein", "multiplier": 0.30, "calories": 360, "protein": 80, "carbs": 5, "fats": 2 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.20, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 3.50, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.15, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Lean Beef", "multiplier": 2.20, "calories": 250, "protein": 26, "carbs": 0, "fats": 15 },
                    { "name": "Potato", "multiplier": 3.50, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Avocado", "multiplier": 0.60, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7 },
                    { "name": "Greek Yogurt 0%", "multiplier": 2.00, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Seed Power Lifting template (3100 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'power_lifting',
    'Power Lifting',
    3100,
    '{
        "mode": "example",
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 1.10, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9 },
                    { "name": "Milk", "multiplier": 3.50, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0 },
                    { "name": "Banana", "multiplier": 1.50, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3 },
                    { "name": "Peanut Butter", "multiplier": 0.35, "calories": 588, "protein": 25, "carbs": 20, "fats": 50 },
                    { "name": "Whey Protein", "multiplier": 0.40, "calories": 360, "protein": 80, "carbs": 5, "fats": 2 }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.30, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
                    { "name": "Rice Cooked", "multiplier": 4.00, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3 },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Olive Oil", "multiplier": 0.15, "calories": 884, "protein": 0, "carbs": 0, "fats": 100 }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Lean Beef", "multiplier": 2.50, "calories": 250, "protein": 26, "carbs": 0, "fats": 15 },
                    { "name": "Potato", "multiplier": 4.00, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1 },
                    { "name": "Vegetables Mix", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2 },
                    { "name": "Avocado", "multiplier": 0.70, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7 },
                    { "name": "Greek Yogurt 0%", "multiplier": 2.00, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0 }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;
