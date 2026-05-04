require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
);

const exerciseDictionary = {
  'Press plano': 'Bench Press',
  'barra': 'Barbell',
  'mancuernas': 'Dumbbells',
  'mancuerna': 'Dumbbell',
  'máquina': 'Machine',
  'en polea': 'Cable',
  'Sentadilla': 'Squat',
  'búlgara': 'Bulgarian',
  'Peso muerto': 'Deadlift',
  'rumano': 'Romanian',
  'convencional': 'Conventional',
  'Remo': 'Row',
  'Dominadas': 'Pull Ups',
  'Jalón': 'Lat Pulldown',
  'Push up': 'Push-up',
  'Flexiones': 'Push-ups',
  'Zancada': 'Lunge',
  'Zancadas': 'Lunges',
  'Elevación': 'Raise',
  'Elevaciones': 'Raises',
  'Curl': 'Curl',
  'Extensión': 'Extension',
  'Extensiones': 'Extensions',
  'Prensa 45º': '45 Leg Press',
  'Prensa horizontal': 'Horizontal Leg Press',
  'Hip thrust': 'Hip Thrust',
  'Aperturas': 'Flyes',
  'Cruces de polea': 'Cable Crossover',
  'Salto': 'Jump',
  'Saltos': 'Jumps',
  'Potencia': 'Power',
  'Movilidad': 'Mobility',
  'Calentamiento': 'Warm-up',
  'Activación': 'Activation',
  'Anti–extensión': 'Anti-extension',
  'Anti–rotación': 'Anti-rotation',
  'Strength': 'Fuerza',
  'Cardio': 'Cardio',
  'Mobility': 'Movilidad',
  'Empuje horizontal': 'Horizontal Push',
  'Empuje vertical': 'Vertical Push',
  'Tracción horizontal': 'Horizontal Pull',
  'Tracción vertical': 'Vertical Pull',
  'Dominio de rodilla': 'Knee Dominant',
  'Dominio de cadera': 'Hip Dominant',
  'deltoides': 'deltoids',
  'trapecio': 'traps',
  'isquios': 'hamstrings',
  'glúteo': 'glutes',
  'pectoral': 'chest',
  'dorsal': 'lats',
  'bíceps': 'biceps',
  'tríceps': 'triceps',
  'core': 'core',
  'piernas': 'legs'
};

function translateExercise(name) {
  let translated = name;
  const keys = Object.keys(exerciseDictionary).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, exerciseDictionary[key]);
  }
  return translated;
}

async function syncExercises() {
  console.log('Fetching Spanish exercises to translate to English...');
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('language', 'es');

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  console.log(`Found ${exercises.length} exercises to translate.`);

  const enExercises = exercises.map(ex => {
    const { id, created_at, ...rest } = ex;
    return {
      ...rest,
      name: translateExercise(ex.name),
      category: exerciseDictionary[ex.category] || ex.category,
      language: 'en'
    };
  });

  console.log('Sending English exercises to Supabase...');
  
  const chunkSize = 50;
  for (let i = 0; i < enExercises.length; i += chunkSize) {
    const chunk = enExercises.slice(i, i + chunkSize);
    const { error: upsertError } = await supabase
      .from('exercises')
      .upsert(chunk, { onConflict: 'name, language' });

    if (upsertError) {
      console.error(`Error syncing EN chunk ${i / chunkSize}:`, upsertError);
    } else {
      console.log(`Synced EN chunk ${i / chunkSize + 1}/${Math.ceil(enExercises.length / chunkSize)}`);
    }
  }

  console.log('Exercise globalization complete!');
}

syncExercises();
