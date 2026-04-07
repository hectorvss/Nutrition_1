import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from root
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function syncFoods() {
  console.log('--- Starting Food Synchronization ---');

  // Read library.ts
  const libraryPath = join(__dirname, '../../src/constants/library.ts');
  if (!fs.existsSync(libraryPath)) {
    console.error(`Library file not found at ${libraryPath}`);
    return;
  }

  const content = fs.readFileSync(libraryPath, 'utf8');
  
  // Extract foodItems array using regex
  const match = content.match(/export const foodItems: FoodItem\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find foodItems array in library.ts');
    return;
  }

  // Parse the array string. Since it's TS, we'll do a simple conversion to JSON-compatible format.
  // Replacing single quotes with double quotes for keys and string values.
  let arrayStr = match[1]
    .replace(/(\w+):/g, '"$1":') // keys
    .replace(/'/g, '"') // string values
    .replace(/,(\s*[\}\]])/g, '$1'); // trailing commas

  let foodItems;
  try {
    foodItems = JSON.parse(arrayStr);
  } catch (e) {
    console.error('Failed to parse foodItems array. Manual parsing fallback...');
    // Fallback: very basic manual extraction
    foodItems = [];
    const itemRegex = /\{ id: "(.*?)", name: "(.*?)", calories: (.*?), protein: (.*?), carbs: (.*?), fats: (.*?), servingSize: "(.*?)" \}/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(arrayStr)) !== null) {
      foodItems.push({
        name: itemMatch[2],
        calories: parseFloat(itemMatch[3]),
        protein: parseFloat(itemMatch[4]),
        carbs: parseFloat(itemMatch[5]),
        fats: parseFloat(itemMatch[6]),
        serving_size: itemMatch[7],
        emoji: '🥣', // Default emoji
        language: 'es', // Default to Spanish based on user request/context
        is_custom: false
      });
    }
  }

  if (!foodItems || foodItems.length === 0) {
    console.error('No food items found to sync.');
    return;
  }

  // Prepare for upsert: mapping fields to DB schema
  const dbItems = foodItems.map(item => ({
    name: item.name,
    category: item.category || 'General',
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fats: item.fats,
    serving_size: item.serving_size || item.servingSize || '100g',
    emoji: item.emoji || '🥣',
    language: 'es', 
    is_custom: false
  }));

  console.log(`Syncing ${dbItems.length} items to Supabase...`);

  // Batch upsert (Supabase handles batching but we'll do it explicitly for safety)
  const batchSize = 100;
  for (let i = 0; i < dbItems.length; i += batchSize) {
    const batch = dbItems.slice(i, i + batchSize);
    const { error } = await supabase
      .from('foods')
      .upsert(batch, { onConflict: 'name' }); 

    if (error) {
      console.error(`Error syncing batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`Synced batch ${i / batchSize + 1}`);
    }
  }

  console.log('--- Food Synchronization Complete ---');
}

syncFoods();
