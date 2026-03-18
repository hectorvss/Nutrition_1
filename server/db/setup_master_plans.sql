-- Nutrition Master Plans Schema

-- 1. Master Plans Table (Metadata)
CREATE TABLE IF NOT EXISTS public.nutrition_master_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein_pct INTEGER NOT NULL,
    carbs_pct INTEGER NOT NULL,
    fats_pct INTEGER NOT NULL,
    meal_structure_label TEXT, -- e.g., '3+2'
    is_global BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Master Plan Meals
CREATE TABLE IF NOT EXISTS public.nutrition_master_plan_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.nutrition_master_plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    icon_name TEXT NOT NULL, -- e.g., 'Sunrise', 'Sun', 'Moon', 'Cookie'
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Master Plan Meal Foods (Example Mode)
CREATE TABLE IF NOT EXISTS public.nutrition_master_plan_meal_foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES public.nutrition_master_plan_meals(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id), -- Optional link to food library
    name TEXT NOT NULL,
    calories NUMERIC NOT NULL,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fats NUMERIC NOT NULL,
    serving_size TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL
);

-- 4. Master Plan General Blocks (General Mode)
CREATE TABLE IF NOT EXISTS public.nutrition_master_plan_general_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES public.nutrition_master_plan_meals(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    example TEXT,
    amount NUMERIC NOT NULL,
    color TEXT,
    order_index INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE public.nutrition_master_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_master_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_master_plan_meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_master_plan_general_blocks ENABLE ROW LEVEL SECURITY;

-- Policies (Publicly viewable, Manager manageable)
CREATE POLICY "Anyone can view master plans" ON public.nutrition_master_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can view master plan meals" ON public.nutrition_master_plan_meals FOR SELECT USING (true);
CREATE POLICY "Anyone can view master plan foods" ON public.nutrition_master_plan_meal_foods FOR SELECT USING (true);
CREATE POLICY "Anyone can view master plan general blocks" ON public.nutrition_master_plan_general_blocks FOR SELECT USING (true);

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
