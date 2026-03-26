-- 1. Create nutrition_templates table if not exists
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

-- 2. Enable RLS
ALTER TABLE public.nutrition_templates ENABLE ROW LEVEL SECURITY;

-- 3. Seed Templates with accurate data and multiplier mapping
-- Power Lifting (3100 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'power_lifting',
    'Power Lifting',
    3100,
    '{
        "mode": "example",
        "macros": { "p": 30, "c": 42, "f": 28 },
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 1.10, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9, "servingSize": "100g" },
                    { "name": "Milk", "multiplier": 3.50, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0, "servingSize": "100g" },
                    { "name": "Banana", "multiplier": 1.50, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3, "servingSize": "100g" },
                    { "name": "Peanut Butter", "multiplier": 0.35, "calories": 588, "protein": 25, "carbs": 20, "fats": 50, "servingSize": "100g" },
                    { "name": "Whey Protein", "multiplier": 0.40, "calories": 360, "protein": 80, "carbs": 5, "fats": 2, "servingSize": "100g" }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.30, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6, "servingSize": "100g" },
                    { "name": "Rice Cooked", "multiplier": 4.00, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3, "servingSize": "100g" },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2, "servingSize": "100g" },
                    { "name": "Olive Oil", "multiplier": 0.15, "calories": 884, "protein": 0, "carbs": 0, "fats": 100, "servingSize": "100g" }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Lean Beef", "multiplier": 2.50, "calories": 250, "protein": 26, "carbs": 0, "fats": 15, "servingSize": "100g" },
                    { "name": "Potato", "multiplier": 4.00, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1, "servingSize": "100g" },
                    { "name": "Vegetables Mix", "multiplier": 1.50, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2, "servingSize": "100g" },
                    { "name": "Avocado", "multiplier": 0.70, "calories": 160, "protein": 2, "carbs": 8.5, "fats": 14.7, "servingSize": "100g" },
                    { "name": "Greek Yogurt 0%", "multiplier": 2.00, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0, "servingSize": "100g" }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Mass Builder (2800 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'mass_builder',
    'Mass Builder',
    2800,
    '{
        "mode": "example",
        "macros": { "p": 30, "c": 45, "f": 25 },
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 1.00, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9, "servingSize": "100g" },
                    { "name": "Milk", "multiplier": 3.00, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0, "servingSize": "100g" },
                    { "name": "Banana", "multiplier": 1.50, "calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3, "servingSize": "100g" },
                    { "name": "Peanut Butter", "multiplier": 0.30, "calories": 588, "protein": 25, "carbs": 20, "fats": 50, "servingSize": "100g" }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.20, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6, "servingSize": "100g" },
                    { "name": "Rice Cooked", "multiplier": 3.50, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3, "servingSize": "100g" },
                    { "name": "Vegetables Mix", "multiplier": 2.00, "calories": 40, "protein": 2, "carbs": 8, "fats": 0.2, "servingSize": "100g" }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Lean Beef", "multiplier": 2.20, "calories": 250, "protein": 26, "carbs": 0, "fats": 15, "servingSize": "100g" },
                    { "name": "Potato", "multiplier": 3.50, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1, "servingSize": "100g" },
                    { "name": "Greek Yogurt 0%", "multiplier": 2.00, "calories": 54, "protein": 10, "carbs": 3.6, "fats": 0, "servingSize": "100g" }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;

-- Athlete Perform (2500 kcal)
INSERT INTO public.nutrition_templates (key, name, target_calories, data_json)
VALUES (
    'athlete_perform',
    'Athlete Perform',
    2500,
    '{
        "mode": "example",
        "macros": { "p": 30, "c": 50, "f": 20 },
        "meals": [
            {
                "id": 1,
                "name": "Breakfast",
                "time": "08:00 AM",
                "iconName": "Sunrise",
                "iconColor": "bg-orange-100 text-orange-600",
                "items": [
                    { "name": "Oats", "multiplier": 0.90, "calories": 389, "protein": 16.9, "carbs": 66.3, "fats": 6.9, "servingSize": "100g" },
                    { "name": "Milk", "multiplier": 3.00, "calories": 42, "protein": 3.4, "carbs": 4.8, "fats": 1.0, "servingSize": "100g" }
                ]
            },
            {
                "id": 2,
                "name": "Lunch",
                "time": "01:30 PM",
                "iconName": "Sun",
                "iconColor": "bg-yellow-100 text-yellow-600",
                "items": [
                    { "name": "Chicken Breast", "multiplier": 2.00, "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6, "servingSize": "100g" },
                    { "name": "Rice Cooked", "multiplier": 3.00, "calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3, "servingSize": "100g" }
                ]
            },
            {
                "id": 3,
                "name": "Dinner",
                "time": "08:30 PM",
                "iconName": "Moon",
                "iconColor": "bg-blue-100 text-blue-600",
                "items": [
                    { "name": "Salmon", "multiplier": 2.00, "calories": 208, "protein": 20, "carbs": 0, "fats": 13, "servingSize": "100g" },
                    { "name": "Potato", "multiplier": 3.00, "calories": 77, "protein": 2, "carbs": 17, "fats": 0.1, "servingSize": "100g" }
                ]
            }
        ]
    }'
) ON CONFLICT (key) DO UPDATE SET data_json = EXCLUDED.data_json;
