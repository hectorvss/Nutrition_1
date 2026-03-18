import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Since we can't easily import the library.ts file directly due to ESM/TS issues in a simple script,
// we will parse the library.ts file content to extract the food items array.
const libraryPath = join(__dirname, '../../src/constants/library.ts');
const libraryContent = fs.readFileSync(libraryPath, 'utf8');

// Use regex to extract the foodItems array content
const foodItemsMatch = libraryContent.match(/export const foodItems: FoodItem\[\] = (\[[\s\S]*?\]);/);
if (!foodItemsMatch) {
  console.error('Could not find foodItems array in library.ts');
  process.exit(1);
}

// Clean up the match to make it valid JSON-ish or just eval it (dangerously but effectively for this task)
// For safety, we'll do some basic cleanup and try to parse.
let arrayString = foodItemsMatch[1];
// Remove comments and type annotations if any
arrayString = arrayString.replace(/\/\/.*$/gm, '');
// Note: This is a hacky way to extract the data without a full JS parser, but for this specific file it should work.
// Alternatively, we can just use a proper JS parser if needed, but let's try the simple way first.

async function populate() {
  console.log('Starting population...');
  
  // We'll extract the data manually from the string to avoid eval if possible
  const items = [];
  const itemRegex = /\{ id: '(.*?)', name: "(.*?)", calories: (.*?), protein: (.*?), carbs: (.*?), fats: (.*?), servingSize: '(.*?)' \}/g;
  // Update regex to handle both single and double quotes
  const flexibleItemRegex = /\{ id: ['"](.*?)['"], name: ['"](.*?)['"], calories: (.*?), protein: (.*?), carbs: (.*?), fats: (.*?), servingSize: ['"](.*?)['"] \}/g;
  
  let match;
  while ((match = flexibleItemRegex.exec(arrayString)) !== null) {
    items.push({
      name: match[2],
      calories: parseFloat(match[3]),
      protein: parseFloat(match[4]),
      carbs: parseFloat(match[5]),
      fats: parseFloat(match[6]),
      serving_size: match[7],
      is_custom: false
    });
  }

  console.log(`Found ${items.length} items to insert.`);

  if (items.length === 0) {
    console.error('No items found. Regex might have failed.');
    process.exit(1);
  }

  // Insert in batches of 50
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
