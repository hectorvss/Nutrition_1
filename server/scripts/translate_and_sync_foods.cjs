require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Dictionary for common nutrition terms translation
const dictionary = {
  'Almond': 'Almendra',
  'Butter': 'Mantequilla',
  'Creamy': 'Cremosa',
  'Milk': 'Leche',
  'Flour': 'Harina',
  'Cheese': 'Queso',
  'Pasteurized': 'Pasteurizado',
  'Processed': 'Procesado',
  'Process': 'Procesado',
  'Sliced': 'en lonchas',
  'Individually': 'Individualmente',
  'Wrapped': 'Envuelto',
  'Apple': 'Manzana',
  'Juice': 'Zumo',
  'Applesauce': 'Puré de manzana',
  'Apricot': 'Albaricoque',
  'Pitted': 'sin hueso',
  'Arugula': 'Rúcula',
  'Asparagus': 'Espárrago',
  'Aubergine': 'Berenjena',
  'Avocado': 'Aguacate',
  'Beef': 'Ternera',
  'Pork': 'Cerdo',
  'Chicken': 'Pollo',
  'Breast': 'Pechuga',
  'Drumstick': 'Muslo',
  'Thigh': 'Contramuslo',
  'Wing': 'Alita',
  'Ground': 'Picada',
  'Sausage': 'Salchicha',
  'Beans': 'Judías',
  'Canned': 'en conserva',
  'Rice': 'Arroz',
  'White': 'Blanco',
  'Brown': 'Integral',
  'Long Grain': 'Grano largo',
  'Lentils': 'Lentejas',
  'Broccoli': 'Brócoli',
  'Sprouts': 'Brotes',
  'Buckwheat': 'Trigo Sarraceno',
  'Buttermilk': 'Suero de leche',
  'Cabbage': 'Repollo',
  'Tomato': 'Tomate',
  'Cucumber': 'Pepino',
  'Egg': 'Huevo',
  'Large': 'Grande',
  'Yolk': 'Yema',
  'Salmon': 'Salmón',
  'Cod': 'Bacalao',
  'Tuna': 'Atún',
  'Shrimp': 'Gamba',
  'Yogurt': 'Yogur',
  'Greek': 'Griego',
  'Nonfat': 'Desnatado',
  'Whole': 'Entero',
  'Plain': 'Natural',
  'Fruit': 'Fruta',
  'Vegetable': 'Verdura',
  'Oil': 'Aceite',
  'Olive': 'Oliva',
  'Sunflower': 'Girasol',
  'Seed': 'Semilla',
  'Walnut': 'Nuez',
  'Peanut': 'Cacahuete',
  'Cashew': 'Anacardo',
  'Pistachio': 'Pistacho',
  'Honey': 'Miel',
  'Sugar': 'Azúcar',
  'Salt': 'Sal',
  'Pepper': 'Pimienta',
  'Garlic': 'Ajo',
  'Onion': 'Cebolla',
  'Potato': 'Patata',
  'Sweet Potato': 'Batata',
  'Spinach': 'Espinaca',
  'Kale': 'Col rizada',
  'Zucchini': 'Calabacín',
  'Mushroom': 'Champiñón',
  'Strawberries': 'Fresas',
  'Blueberries': 'Arándanos',
  'Blackberries': 'Moras',
  'Raspberries': 'Frambuesas',
  'Cherries': 'Cerezas',
  'Grape': 'Uva',
  'Orange': 'Naranja',
  'Lemon': 'Limón',
  'Lime': 'Lima',
  'Banana': 'Plátano',
  'Kiwi': 'Kiwi',
  'Mango': 'Mango',
  'Peach': 'Melocotón',
  'Pear': 'Pera',
  'Pineapple': 'Piña',
  'Watermelon': 'Sandía',
  'Melon': 'Melón',
  'Oats': 'Avena',
  'Bread': 'Pan',
  'Toast': 'Tostada',
  'Ham': 'Jamón',
  'Turkey': 'Pavo',
  'Salami': 'Salami',
  'Bacon': 'Bacon',
  'Lean': 'Magro',
  'Roast': 'Asado',
  'Steak': 'Filete',
  'Chop': 'Chuleta',
  'Ribs': 'Costillas',
  'Shoulder': 'Paleta',
  'Leg': 'Pierna',
  'Fish': 'Pescado',
  'Seafood': 'Marisco',
  'Crab': 'Cangrejo',
  'Lobster': 'Langosta',
  'Mussels': 'Mejillones',
  'Clams': 'Almejas',
  'Octopus': 'Pulpo',
  'Squid': 'Calamar',
  'Lettuce': 'Lechuga',
  'Carrot': 'Zanahoria',
  'Celery': 'Apio',
  'Bell': 'Pimiento',
  'Hot': 'Picante',
  'Sweet': 'Dulce',
  'Red': 'Rojo',
  'Green': 'Verde',
  'Yellow': 'Amarillo',
  'Raw': 'Crudo',
  'Cooked': 'Cocinado',
  'Fried': 'Frito',
  'Baked': 'Horneado',
  'Boiled': 'Hervido',
  'Grilled': 'a la plancha',
  'Steamed': 'al vapor',
  'Serving': 'Ración',
  'Size': 'Tamaño'
};

function translate(name) {
  let translated = name;
  // Sort keys by length descending to avoid partial replacements (e.g. "Butter" before "Buttermilk")
  const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, dictionary[key]);
  }
  return translated;
}

// Function to update Supabase
async function syncTransaltions() {
  console.log('Fetching foods to translate...');
  const { data: foods, error } = await supabase
    .from('foods')
    .select('*')
    .eq('language', 'es');

  if (error) {
    console.error('Error fetching foods:', error);
    return;
  }

  console.log(`Found ${foods.length} foods to translate.`);

  const updates = foods.map(f => {
    const translatedName = translate(f.name);
    return {
      ...f,
      name: translatedName,
      category: dictionary[f.category] || f.category
    };
  });

  console.log('Sending updates to Supabase...');
  
  // Update in chunks to avoid timeout
  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const { error: updateError } = await supabase
      .from('foods')
      .upsert(chunk, { onConflict: 'id' });

    if (updateError) {
      console.error(`Error updating chunk ${i / chunkSize}:`, updateError);
    } else {
      console.log(`Updated chunk ${i / chunkSize + 1}/${Math.ceil(updates.length / chunkSize)}`);
    }
  }

  console.log('Translation sync complete!');
  
  // also generate the localized library.ts content
  generateLibraryTS(updates);
}

function generateLibraryTS(foods) {
  const recipes = [
    { id: '1', title: 'Bol de Salmón y Quinoa', image: 'https://picsum.photos/seed/salmon/400/300', category: 'Alto en Proteína', prepTime: 25, calories: 450, protein: 38, carbs: 45, fats: 14, rating: 4.9, tags: ['Sin Gluten', 'Bajo en Carb'] },
    { id: '2', title: 'Batido Detox Verde', image: 'https://picsum.photos/seed/smoothie/400/300', category: 'Detox', prepTime: 5, calories: 180, protein: 5, carbs: 30, fats: 2, rating: 4.7, tags: ['Vegano', 'Crudo'] },
    { id: '3', title: 'Tostadas de Aguacate y Huevo', image: 'https://picsum.photos/seed/toast/400/300', category: 'Keto', prepTime: 15, calories: 320, protein: 12, carbs: 15, fats: 25, rating: 5.0, tags: ['Desayuno', 'Vegetariano'] },
    { id: '4', title: 'Ensalada Mediterránea', image: 'https://picsum.photos/seed/salad/400/300', category: 'Vegetariano', prepTime: 10, calories: 290, protein: 8, carbs: 20, fats: 18, rating: 4.5, tags: ['Almuerzo', 'Grasa Saludable'] },
    { id: '5', title: 'Pollo al Curry con Arroz', image: 'https://picsum.photos/seed/curry/400/300', category: 'Volumen', prepTime: 30, calories: 550, protein: 42, carbs: 65, fats: 12, rating: 4.8, tags: ['Cena', 'Energético'] },
    { id: '6', title: 'Tortilla de Espinacas', image: 'https://picsum.photos/seed/omelette/400/300', category: 'Ligero', prepTime: 10, calories: 240, protein: 18, carbs: 5, fats: 16, rating: 4.6, tags: ['Cena', 'Rápido'] }
  ];

  const supplements = [
    { id: '1', name: 'Proteína de Suero (Whey)', brand: 'Optimum Nutrition', serving: '1 cazo (30g)', primaryIngredient: 'Aislado de Proteína', bestTime: 'Post-entreno', score: 4.8, category: 'Recuperación' },
    { id: '2', name: 'Creatina Monohidrato', brand: 'Thorne', serving: '1 cazo (5g)', primaryIngredient: 'Creatina', bestTime: 'Cualquier momento', score: 5.0, category: 'Rendimiento' },
    { id: '3', name: 'Multivitamínico Diario', brand: 'Garden of Life', serving: '1 cápsula', primaryIngredient: 'Vitaminas A-K', bestTime: 'Mañana', score: 4.6, category: 'Bienestar' },
    { id: '4', name: 'Omega-3 Aceite de Pescado', brand: 'Nordic Naturals', serving: '2 perlas', primaryIngredient: 'EPA y DHA', bestTime: 'Con comidas', score: 4.9, category: 'Salud Cardiovascular' },
  ];

  const output = `import { Recipe, FoodItem, Supplement } from '../types/library';

export const recipes: Recipe[] = ${JSON.stringify(recipes, null, 2)};

export const foodItems: FoodItem[] = ${JSON.stringify(foods.map((f, i) => ({
    id: `import-${i+1}`,
    name: f.name,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fats: f.fats,
    servingSize: f.serving_size || '100g'
  })), null, 2)};

export const supplements: Supplement[] = ${JSON.stringify(supplements, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../../src/constants/library.ts'), output);
  console.log('Updated src/constants/library.ts with Spanish content');
}

syncTransaltions();
