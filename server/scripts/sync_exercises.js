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

async function syncExercises() {
  console.log('--- Starting Exercise Synchronization ---');

  // Read setup_exercises.sql
  const sqlPath = join(__dirname, '../db/setup_exercises.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found at ${sqlPath}`);
    return;
  }

  const content = fs.readFileSync(sqlPath, 'utf8');
  
  const valuesIndex = content.toLowerCase().indexOf('values');
  if (valuesIndex === -1) {
    console.error('Could not find "values" in setup_exercises.sql');
    return;
  }

  const valuesStr = content.substring(valuesIndex + 6).trim().replace(/;$/, '');
  console.log('Total length of values string:', valuesStr.length);
  
  // Clean up start and end parentheses for the entire block
  let cleanedValues = valuesStr;
  if (cleanedValues.startsWith('(')) cleanedValues = cleanedValues.substring(1);
  if (cleanedValues.endsWith(')')) cleanedValues = cleanedValues.substring(0, cleanedValues.length - 1);

  // Split by the row separator
  const rows = cleanedValues.split(/\),\s*[\r\n]+\s*\(/).map(row => row.trim());

  console.log(`Extracted ${rows.length} rows from SQL...`);

  const exercises = rows.map(row => {
    // Regex to split by comma inside single quotes or not
    // This is a simplified parser for this specific file
    const parts = [];
    let current = '';
    let inQuote = false;
    let inArray = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === "'" && (i === 0 || row[i-1] !== '\\')) {
            inQuote = !inQuote;
        } else if (char === '{' && !inQuote) {
            inArray = true;
        } else if (char === '}' && !inQuote) {
            inArray = false;
        } else if (char === ',' && !inQuote && !inArray) {
            parts.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }
    parts.push(current.trim());

    // Clean up parts
    const cleanStr = (s) => {
        if (!s || s === 'null') return null;
        if (s.startsWith("'") && s.endsWith("'")) return s.substring(1, s.length - 1);
        return s;
    };

    const cleanArray = (s) => {
        if (!s || s === 'null' || s === "'{}'") return [];
        let inner = s;
        if (inner.startsWith("'{")) inner = inner.substring(2);
        else if (inner.startsWith("{")) inner = inner.substring(1);

        if (inner.endsWith("}'")) inner = inner.substring(0, inner.length - 2);
        else if (inner.endsWith("}")) inner = inner.substring(0, inner.length - 1);

        return inner.split(',').map(m => m.trim());
    };

    return {
      name: cleanStr(parts[0]),
      category: cleanStr(parts[1]),
      subcategory: cleanStr(parts[2]),
      video_url: cleanStr(parts[3]),
      description: cleanStr(parts[4]),
      type: cleanStr(parts[5]),
      muscle_groups: cleanArray(parts[6]),
      tools: cleanArray(parts[7]),
      difficulty_level: cleanStr(parts[8]),
      icon: cleanStr(parts[9]),
      language: 'es' // Default to Spanish as per setup_exercises.sql intent
    };
  });

  console.log(`Syncing ${exercises.length} exercises to Supabase...`);

  const batchSize = 50;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    const { error } = await supabase
      .from('exercises')
      .upsert(batch, { onConflict: 'name,language' });

    if (error) {
      console.error(`Error syncing batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`Synced batch ${i / batchSize + 1}`);
    }
  }

  console.log('--- Exercise Synchronization Complete ---');
}

syncExercises();
