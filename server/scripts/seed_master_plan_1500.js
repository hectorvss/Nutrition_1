
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(supabaseUrl, supabaseServiceRole);

const PLAN_SLUG = 'nutrition_1500_fat_loss_basic';

async function seed() {
  console.log('Starting Master Plan Seeding...');

  // 1. Ensure Foods Exist
  const requiredFoods = [
    { name: 'Greek Yogurt 0%', calories: 60, protein: 10, carbs: 4.5, fats: 0.1, serving_size: '100g', category: 'Dairy' },
    { name: 'Oats', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving_size: '100g', category: 'Carbohydrates' },
    { name: 'Skyr 0%', calories: 63, protein: 11, carbs: 4, fats: 0.2, serving_size: '100g', category: 'Dairy' },
    { name: 'White Rice cooked', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving_size: '100g', category: 'Carbohydrates' },
    { name: 'Whey Protein', calories: 390, protein: 80, carbs: 6, fats: 5, serving_size: '100g', category: 'Supplements' },
    { name: 'Potato boiled', calories: 87, protein: 1.9, carbs: 20, fats: 0.1, serving_size: '100g', category: 'Carbohydrates' }
  ];

  for (const food of requiredFoods) {
    const { data: existing } = await supabase.from('foods').select('id').ilike('name', food.name).maybeSingle();
    if (!existing) {
      console.log(`Creating food: ${food.name}`);
      await supabase.from('foods').insert([food]);
    }
  }

  // Get all required food IDs
  const allFoods = await supabase.from('foods').select('id, name');
  const findFoodId = (name) => allFoods.data.find(f => f.name.toLowerCase().includes(name.toLowerCase()))?.id;

  // 2. Create Master Plan
  const { data: existingPlan } = await supabase.from('nutrition_master_plans').select('id').eq('slug', PLAN_SLUG).maybeSingle();
  let planId = existingPlan?.id;

  if (!planId) {
    console.log('Creating Master Plan...');
    const { data: newPlan, error } = await supabase.from('nutrition_master_plans').insert([{
      slug: PLAN_SLUG,
      name: 'Fat Loss Basic',
      calories: 1500,
      protein_pct: 32,
      carbs_pct: 38,
      fats_pct: 30,
      meal_structure_label: '3+2'
    }]).select().single();
    if (error) {
       console.error('Error creating plan:', error);
       return;
    }
    planId = newPlan.id;
  } else {
    console.log('Master Plan already exists, updating...');
    await supabase.from('nutrition_master_plans').update({
      name: 'Fat Loss Basic',
      calories: 1500,
      protein_pct: 32,
      carbs_pct: 38,
      fats_pct: 30,
      meal_structure_label: '3+2'
    }).eq('id', planId);
  }

  // 3. Clear existing meals for this plan to avoid duplicates
  await supabase.from('nutrition_master_plan_meals').delete().eq('plan_id', planId);

  // 4. Create Meals
  const mealsData = [
    { name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise', order_index: 0 },
    { name: 'Snack 1', time: '11:00 AM', icon_name: 'Cookie', order_index: 1 },
    { name: 'Lunch', time: '02:00 PM', icon_name: 'Sun', order_index: 2 },
    { name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie', order_index: 3 },
    { name: 'Dinner', time: '09:00 PM', icon_name: 'Moon', order_index: 4 }
  ];

  const { data: createdMeals, error: mealsError } = await supabase.from('nutrition_master_plan_meals').insert(
    mealsData.map(m => ({ ...m, plan_id: planId }))
  ).select();

  if (mealsError) {
    console.error('Error creating meals:', mealsError);
    return;
  }

  console.log('Meals created. Populating modes...');

  // Helper to get meal ID by name
  const getMealId = (name) => createdMeals.find(m => m.name === name).id;

  // 5. Populate Example Mode (Meal Foods)
  const exampleFoods = [
    // Breakfast
    { meal: 'Breakfast', food: 'Greek Yogurt 0%', quantity: 2, cals: 120, p: 20, c: 9, f: 0.2, size: '100g' },
    { meal: 'Breakfast', food: 'Oats', quantity: 0.4, cals: 155, p: 6.7, c: 26.4, f: 2.7, size: '100g' },
    { meal: 'Breakfast', food: 'Blueberries', quantity: 0.5, cals: 30, p: 0.3, c: 7.2, f: 0.1, size: '100g' },
    
    // Snack 1
    { meal: 'Snack 1', food: 'Apple', quantity: 1.2, cals: 65, p: 0.3, c: 15, f: 0.2, size: '100g' },
    { meal: 'Snack 1', food: 'Almonds', quantity: 0.1, cals: 58, p: 2, c: 2, f: 5, size: '100g' },
    
    // Lunch
    { meal: 'Lunch', food: 'Chicken Breast', quantity: 1.3, cals: 215, p: 40, c: 0, f: 4.7, size: '100g' },
    { meal: 'Lunch', food: 'White Rice cooked', quantity: 1.2, cals: 156, p: 3.2, c: 33.6, f: 0.3, size: '100g' },
    { meal: 'Lunch', food: 'Broccoli', quantity: 1, cals: 34, p: 2.8, c: 7, f: 0.4, size: '100g' },
    { meal: 'Lunch', food: 'Olive Oil', quantity: 0.05, cals: 45, p: 0, c: 0, f: 5, size: '100g' },
    
    // Snack 2
    { meal: 'Snack 2', food: 'Skyr 0%', quantity: 1.5, cals: 95, p: 16.5, c: 6, f: 0.3, size: '100g' },
    { meal: 'Snack 2', food: 'Whey Protein', quantity: 0.25, cals: 100, p: 20, c: 1.5, f: 1.2, size: '100g' },
    
    // Dinner
    { meal: 'Dinner', food: 'Salmon', quantity: 1.2, cals: 250, p: 24, c: 0, f: 15.6, size: '100g' },
    { meal: 'Dinner', food: 'Potato boiled', quantity: 1.5, cals: 130, p: 2.8, c: 30, f: 0.1, size: '100g' },
    { meal: 'Dinner', food: 'Olive Oil', quantity: 0.05, cals: 45, p: 0, c: 0, f: 5, size: '100g' }
  ];

  const mealFoodsToInsert = exampleFoods.map((ef, idx) => ({
    meal_id: getMealId(ef.meal),
    food_id: findFoodId(ef.food),
    name: ef.food,
    calories: ef.cals,
    protein: ef.p,
    carbs: ef.c,
    fats: ef.f,
    serving_size: ef.size,
    quantity: ef.quantity,
    order_index: idx
  }));

  await supabase.from('nutrition_master_plan_meal_foods').insert(mealFoodsToInsert);

  // 6. Populate General Mode (General Blocks)
  const generalBlocks = [
    { meal: 'Breakfast', label: 'Lean Protein Source', example: 'Greek Yogurt 0%, Egg whites', amount: 25, color: 'bg-blue-500' },
    { meal: 'Breakfast', label: 'Complex Carbs', example: 'Oats, Whole grain bread', amount: 30, color: 'bg-emerald-500' },
    
    { meal: 'Snack 1', label: 'Fruit', example: 'Apple, Berries', amount: 150, color: 'bg-pink-500' },
    { meal: 'Snack 1', label: 'Healthy Fats', example: 'Almonds, Walnuts', amount: 10, color: 'bg-amber-500' },
    
    { meal: 'Lunch', label: 'Lean Protein Source', example: 'Chicken Breast, Turkey', amount: 40, color: 'bg-blue-500' },
    { meal: 'Lunch', label: 'Starchy Carbs', example: 'Rice, Potato, Pasta', amount: 40, color: 'bg-emerald-500' },
    { meal: 'Lunch', label: 'Veg/Greens', example: 'Broccoli, Spinach', amount: 100, color: 'bg-green-500' },
    
    { meal: 'Snack 2', label: 'Protein Source', example: 'Whey Protein, Skyr', amount: 35, color: 'bg-blue-500' },
    
    { meal: 'Dinner', label: 'Protein (Fatty/Lean)', example: 'Salmon, Beef, White Fish', amount: 30, color: 'bg-blue-500' },
    { meal: 'Dinner', label: 'Starchy Carbs', example: 'Potato, Sweet Potato', amount: 35, color: 'bg-emerald-500' },
    { meal: 'Dinner', label: 'Veg/Greens', example: 'Zucchini, Asparagus', amount: 100, color: 'bg-green-500' }
  ];

  const generalBlocksToInsert = generalBlocks.map((gb, idx) => ({
    meal_id: getMealId(gb.meal),
    label: gb.label,
    example: gb.example,
    amount: gb.amount,
    color: gb.color,
    order_index: idx
  }));

  await supabase.from('nutrition_master_plan_general_blocks').insert(generalBlocksToInsert);

  console.log('Master Plan Seeding Complete!');
}

seed();
