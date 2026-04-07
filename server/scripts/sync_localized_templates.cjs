require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Unified Dictionary for Templates
const dictionary = {
  // Meals
  'Breakfast': 'Desayuno',
  'Lunch': 'Comida',
  'Dinner': 'Cena',
  'Snack': 'Merienda',
  'Pre-workout': 'Pre-entreno',
  'Post-workout': 'Post-entreno',
  
  // Weights / Times
  'AM': 'AM',
  'PM': 'PM',
  'Mode': 'Modo',
  'Daily': 'Diario',
  
  // Template Names
  'Fat Loss': 'Pérdida de Grasa',
  'Mass Builder': 'Ganas de Masa Muscular',
  'Power Lifting': 'Powerlifting',
  'Cutting Phase': 'Fase de Definición',
  'Bulking Phase': 'Fase de Volumen',
  
  // Common Foods in Templates (Mapper)
  'Chicken Breast': 'Pechuga de Pollo',
  'Rice Cooked': 'Arroz Cocido',
  'Vegetables Mix': 'Mix de Verduras',
  'Olive Oil': 'Aceite de Oliva',
  'Peanut Butter': 'Mantequilla de Cacahuete',
  'Whey Protein': 'Proteína Whey',
  'Banana': 'Plátano',
  'Oats': 'Avena',
  'Milk': 'Leche',
  'Salmon': 'Salmón',
  'Potato': 'Patata',
  'Avocado': 'Aguacate',
  'Lean Beef': 'Ternera Magra',
  'Greek Yogurt': 'Yogur Griego 0%',
  'Sweet Potato': 'Batata/Boniato',
  'Mixed Nuts': 'Frutos Secos Variados'
};

function translateText(text) {
  if (!text) return text;
  let translated = text;
  const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, dictionary[key]);
  }
  return translated;
}

async function syncTemplates() {
  console.log('Mirroring and translating Nutrition Templates...');
  
  const { data: nTemplates, error: nError } = await supabase
    .from('nutrition_templates')
    .select('*')
    .eq('language', 'en');

  if (nError) {
    console.error('Error fetching nutrition templates:', nError);
  } else {
    for (const template of nTemplates) {
      const { id, created_at, updated_at, ...rest } = template;
      const esTemplate = {
        ...rest,
        name: translateText(template.name),
        description: translateText(template.description),
        language: 'es',
        data_json: {
          ...template.data_json,
          meals: (template.data_json.meals || []).map(m => ({
            ...m,
            name: translateText(m.name),
            items: (m.items || []).map(i => ({
              ...i,
              name: translateText(i.name)
            }))
          }))
        }
      };

      const { error: upsertError } = await supabase
        .from('nutrition_templates')
        .upsert(esTemplate, { onConflict: 'key, language' });

      if (upsertError) console.error(`Error syncing ES nutrition template ${template.key}:`, upsertError);
      else console.log(`Synced ES nutrition template: ${template.key}`);
    }
  }

  console.log('Mirroring and translating Training Templates...');
  const { data: tTemplates, error: tError } = await supabase
    .from('training_templates')
    .select('*')
    .eq('language', 'en');

  if (tError) {
    console.error('Error fetching training templates:', tError);
  } else {
    for (const template of tTemplates) {
      const { id, created_at, updated_at, ...rest } = template;
      const esTemplate = {
        ...rest,
        name: translateText(template.name),
        description: translateText(template.description),
        language: 'es',
        data_json: {
          ...template.data_json,
          name: translateText(template.data_json.name),
          workouts: (template.data_json.workouts || []).map(w => ({
            ...w,
            name: translateText(w.name),
            blocks: (w.blocks || []).map(b => ({
              ...b,
              name: translateText(b.name),
              exercises: (b.exercises || []).map(e => ({
                ...e,
                exerciseName: translateText(e.exerciseName || e.name),
                name: translateText(e.name || e.exerciseName)
              }))
            }))
          }))
        }
      };

      const { error: upsertError } = await supabase
        .from('training_templates')
        .upsert(esTemplate, { onConflict: 'key, language' });

      if (upsertError) console.error(`Error syncing ES training template ${template.key}:`, upsertError);
      else console.log(`Synced ES training template: ${template.key}`);
    }
  }

  console.log('Template globalization complete!');
}

syncTemplates();
