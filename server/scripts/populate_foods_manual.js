import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

const items = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving_size: '100g' },
  { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 4, fats: 5, serving_size: '170g' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving_size: '100g' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, serving_size: '100g' },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving_size: '100g' },
  { name: 'Oatmeal', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving_size: '100g' },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, serving_size: '100g' },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, serving_size: '100g' },
  { name: 'Almond Butter Creamy', calories: 645.5, protein: 20.79, carbs: 21.24, fats: 53.04, serving_size: '100g' },
  { name: 'Almond Milk', calories: 14.5, protein: 0.55, carbs: 0.34, fats: 1.22, serving_size: '100g' },
  { name: 'Apple Juice', calories: 48.4, protein: 0.09, carbs: 11.36, fats: 0.29, serving_size: '100g' },
  { name: 'Applesauce', calories: 51.6, protein: 0.27, carbs: 12.26, fats: 0.16, serving_size: '100g' },
  { name: 'Apricot', calories: 48.4, protein: 0.96, carbs: 10.24, fats: 0.4, serving_size: '100g' },
  { name: 'Arugula', calories: 31, protein: 1.65, carbs: 5.37, fats: 0.32, serving_size: '100g' },
  { name: 'Asparagus', calories: 28.1, protein: 1.44, carbs: 5.1, fats: 0.22, serving_size: '100g' },
  { name: 'Aubergine', calories: 29.4, protein: 1, carbs: 5.9, fats: 0.2, serving_size: '100g' },
  { name: 'Beef Breakfast Sausage', calories: 325, protein: 13.3, carbs: 3.37, fats: 28.7, serving_size: '100g' },
  { name: 'Beets', calories: 44.6, protein: 1.69, carbs: 8.79, fats: 0.3, serving_size: '100g' },
  { name: 'Belly Pork', calories: 380.5, protein: 15.2, carbs: -0.7, fats: 35.83, serving_size: '100g' },
  { name: 'Bison Ground', calories: 158.8, protein: 19.88, carbs: -0.15, fats: 8.88, serving_size: '100g' },
  { name: 'Blackberries', calories: 67.2, protein: 1.53, carbs: 14.57, fats: 0.31, serving_size: '100g' },
  { name: 'Blueberries', calories: 63.9, protein: 0.7, carbs: 14.57, fats: 0.31, serving_size: '100g' },
  { name: 'Bok Choy', calories: 20.2, protein: 1.02, carbs: 3.51, fats: 0.23, serving_size: '100g' },
  { name: 'Brazil Nuts', calories: 663.6, protein: 15.04, carbs: 21.64, fats: 57.43, serving_size: '100g' },
  { name: 'Brussels Sprouts', calories: 59.4, protein: 3.98, carbs: 9.62, fats: 0.56, serving_size: '100g' },
  { name: 'Buckwheat Dry', calories: 369.8, protein: 13.3, carbs: 71.5, fats: 3.4, serving_size: '100g' },
  { name: 'Butter Stick Salted', calories: 739.8, protein: 0, carbs: 0, fats: 82.2, serving_size: '100g' },
  { name: 'Buttermilk', calories: 42.8, protein: 3.46, carbs: 4.81, fats: 1.08, serving_size: '100g' },
  { name: 'Cabbage Green', calories: 31.4, protein: 0.96, carbs: 6.38, fats: 0.23, serving_size: '100g' },
  { name: 'Cantaloupe', calories: 37.5, protein: 0.82, carbs: 8.16, fats: 0.18, serving_size: '100g' },
  { name: 'Carrots Baby', calories: 40.8, protein: 0.8, carbs: 9.08, fats: 0.14, serving_size: '100g' },
  { name: 'Cashews', calories: 564.7, protein: 17.44, carbs: 36.29, fats: 38.86, serving_size: '100g' },
  { name: 'Catfish', calories: 131.7, protein: 16.47, carbs: 0, fats: 7.31, serving_size: '100g' },
  { name: 'Cauliflower', calories: 27.6, protein: 1.64, carbs: 4.72, fats: 0.24, serving_size: '100g' },
  { name: 'Celery', calories: 16.7, protein: 0.49, carbs: 3.32, fats: 0.16, serving_size: '100g' },
  { name: 'Cheddar Cheese', calories: 409, protein: 23.3, carbs: 2.44, fats: 34, serving_size: '100g' },
  { name: 'Cherries Dark Red', calories: 70.5, protein: 1.04, carbs: 16.16, fats: 0.19, serving_size: '100g' },
  { name: 'Chia Seeds', calories: 517.1, protein: 17.01, carbs: 38.27, fats: 32.89, serving_size: '100g' },
  { name: 'Chicken Thigh', calories: 187.9, protein: 17.11, carbs: -0.17, fats: 13.35, serving_size: '100g' },
  { name: 'Chickpeas', calories: 383, protein: 21.28, carbs: 60.36, fats: 6.27, serving_size: '100g' },
  { name: 'Chop Center Cut Pork', calories: 138.3, protein: 22.81, carbs: -0.56, fats: 5.48, serving_size: '100g' },
  { name: 'Chorizo Pork Sausage', calories: 340.6, protein: 19.3, carbs: 2.63, fats: 28.1, serving_size: '100g' },
  { name: 'Chuck Roast Beef', calories: 234.7, protein: 18.4, carbs: 0.22, fats: 17.8, serving_size: '100g' },
  { name: 'Coconut Flour', calories: 437.7, protein: 16.14, carbs: 58.9, fats: 15.28, serving_size: '100g' },
  { name: 'Coconut Oil', calories: 900, protein: 0, carbs: 0, fats: 100, serving_size: '100g' },
  { name: 'Cod', calories: 70.3, protein: 16.07, carbs: 0, fats: 0.67, serving_size: '100g' },
  { name: 'Corn Flour Masa Harina', calories: 376.1, protein: 7.56, carbs: 76.69, fats: 4.34, serving_size: '100g' },
  { name: 'Cottage Cheese', calories: 81.9, protein: 11, carbs: 4.31, fats: 2.3, serving_size: '100g' },
  { name: 'Crab', calories: 81.9, protein: 18.65, carbs: 0, fats: 0.81, serving_size: '100g' },
  { name: 'Cream Cheese Block', calories: 342.8, protein: 5.79, carbs: 4.56, fats: 33.49, serving_size: '100g' },
  { name: 'Cream Heavy', calories: 343.3, protein: 2.02, carbs: 3.8, fats: 35.56, serving_size: '100g' },
  { name: 'Cucumber', calories: 15.9, protein: 0.62, carbs: 2.95, fats: 0.18, serving_size: '100g' },
  { name: 'Eggplant', calories: 26.1, protein: 0.85, carbs: 5.4, fats: 0.12, serving_size: '100g' },
  { name: 'Feta Cheese', calories: 272.9, protein: 19.71, carbs: 5.58, fats: 19.08, serving_size: '100g' },
  { name: 'Figs', calories: 277.1, protein: 3.3, carbs: 63.9, fats: 0.92, serving_size: '100g' },
  { name: 'Flaxseed Ground', calories: 545.1, protein: 18.04, carbs: 34.36, fats: 37.28, serving_size: '100g' },
  { name: 'Garlic', calories: 142.7, protein: 6.62, carbs: 28.2, fats: 0.38, serving_size: '100g' },
  { name: 'Grade A Large Whole Egg', calories: 143.1, protein: 12.4, carbs: 0.96, fats: 9.96, serving_size: '100g' },
  { name: 'Grapes Green Seedless', calories: 80.1, protein: 0.9, carbs: 18.6, fats: 0.23, serving_size: '100g' },
  { name: 'Green Beans', calories: 24.1, protein: 1.04, carbs: 4.11, fats: 0.39, serving_size: '100g' },
  { name: 'Ground Beef', calories: 189.2, protein: 18.16, carbs: 0.22, fats: 12.85, serving_size: '100g' },
  { name: 'Ham Sliced', calories: 101.4, protein: 16.7, carbs: 0.27, fats: 3.73, serving_size: '100g' },
  { name: 'Kale', calories: 42.8, protein: 2.92, carbs: 4.42, fats: 1.49, serving_size: '100g' },
  { name: 'Kiwi', calories: 64.2, protein: 1.06, carbs: 14, fats: 0.44, serving_size: '100g' },
  { name: 'Lamb Ground', calories: 236.6, protein: 17.46, carbs: -0.25, fats: 18.64, serving_size: '100g' },
  { name: 'Lettuce Romaine', calories: 18.4, protein: 0.98, carbs: 3.37, fats: 0.11, serving_size: '100g' },
  { name: 'Macadamia Nuts', calories: 711.9, protein: 7.79, carbs: 24.09, fats: 64.93, serving_size: '100g' },
  { name: 'Mango', calories: 68.4, protein: 0.56, carbs: 15.26, fats: 0.57, serving_size: '100g' },
  { name: 'Milk', calories: 41.6, protein: 3.38, carbs: 4.89, fats: 0.95, serving_size: '100g' },
  { name: 'Mozzarella Cheese', calories: 296.2, protein: 23.7, carbs: 4.44, fats: 20.4, serving_size: '100g' },
  { name: 'Mushroom Portabella', calories: 32.4, protein: 2.75, carbs: 4.66, fats: 0.31, serving_size: '100g' },
  { name: 'Oat Milk', calories: 48.3, protein: 0.8, carbs: 5.1, fats: 2.75, serving_size: '100g' },
  { name: 'Olive Oil', calories: 900, protein: 0, carbs: 0, fats: 100, serving_size: '100g' },
  { name: 'Onions Yellow', calories: 38.2, protein: 0.83, carbs: 8.61, fats: 0.05, serving_size: '100g' },
  { name: 'Orange Juice', calories: 47.2, protein: 0.73, carbs: 10.34, fats: 0.32, serving_size: '100g' },
  { name: 'Parmesan Cheese Grated', calories: 420, protein: 29.6, carbs: 12.4, fats: 28, serving_size: '100g' },
  { name: 'Peaches', calories: 46.5, protein: 0.91, carbs: 10.1, fats: 0.27, serving_size: '100g' },
  { name: 'Peanut Butter Creamy', calories: 631.6, protein: 23.99, carbs: 22.7, fats: 49.43, serving_size: '100g' },
  { name: 'Pears Bartlett', calories: 63.4, protein: 0.38, carbs: 15.1, fats: 0.16, serving_size: '100g' },
  { name: 'Peppers Bell Green', calories: 23, protein: 0.72, carbs: 4.78, fats: 0.11, serving_size: '100g' },
  { name: 'Pineapple', calories: 60.1, protein: 0.46, carbs: 14.09, fats: 0.21, serving_size: '100g' },
  { name: 'Plantains', calories: 136.5, protein: 1.17, carbs: 30.95, fats: 0.89, serving_size: '100g' },
  { name: 'Pork Tenderloin', calories: 121.4, protein: 21.58, carbs: 0, fats: 3.9, serving_size: '100g' },
  { name: 'Potatoes Russet', calories: 83.4, protein: 2.27, carbs: 17.77, fats: 0.36, serving_size: '100g' },
  { name: 'Provolone Cheese', calories: 356.8, protein: 23.45, carbs: 2.45, fats: 28.13, serving_size: '100g' },
  { name: 'Raspberries', calories: 57.4, protein: 1.01, carbs: 12.9, fats: 0.19, serving_size: '100g' },
  { name: 'Rice White', calories: 358.7, protein: 7.04, carbs: 80.31, fats: 1.03, serving_size: '100g' },
  { name: 'Ripe Bananas', calories: 91.5, protein: 0.74, carbs: 21.55, fats: 0.26, serving_size: '100g' },
  { name: 'Salt Table', calories: 0, protein: 0, carbs: 0, fats: 0, serving_size: '100g' },
  { name: 'Sausage Italian Pork', calories: 317.2, protein: 18.2, carbs: 2.15, fats: 26.2, serving_size: '100g' },
  { name: 'Shrimp', calories: 71.4, protein: 15.57, carbs: 0.48, fats: 0.8, serving_size: '100g' },
  { name: 'Soy Milk', calories: 40.8, protein: 2.78, carbs: 3, fats: 1.96, serving_size: '100g' },
  { name: 'Spinach', calories: 27.6, protein: 2.91, carbs: 2.64, fats: 0.6, serving_size: '100g' },
  { name: 'Squash Zucchini', calories: 35.1, protein: 0.94, carbs: 7.44, fats: 0.18, serving_size: '100g' },
  { name: 'Strawberries', calories: 35.1, protein: 0.64, carbs: 7.63, fats: 0.22, serving_size: '100g' },
  { name: 'Sugar Granulated White', calories: 401.3, protein: 0, carbs: 99.6, fats: 0.32, serving_size: '100g' },
  { name: 'Swiss Cheese', calories: 392.8, protein: 27, carbs: 1.44, fats: 31, serving_size: '100g' },
  { name: 'Tilapia', calories: 98.3, protein: 19, carbs: 0, fats: 2.48, serving_size: '100g' },
  { name: 'Tomato Roma', calories: 21.9, protein: 0.7, carbs: 3.84, fats: 0.42, serving_size: '100g' },
  { name: 'Tuna', calories: 84.8, protein: 19, carbs: 0.08, fats: 0.94, serving_size: '100g' },
  { name: 'Turkey Ground', calories: 155.7, protein: 17.34, carbs: 0, fats: 9.59, serving_size: '100g' },
  { name: 'Whole Wheat Bread', calories: 253.6, protein: 12.3, carbs: 43.1, fats: 3.55, serving_size: '100g' }
];

async function populate() {
  console.log('Starting population with mapped items...');
  console.log(`Found ${items.length} items to insert.`);

  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await supabase.from('foods').insert(batch);
    if (error) {
      console.error(`Error inserting batch at ${i}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}`);
    }
  }

  console.log('Population complete!');
}

populate();
