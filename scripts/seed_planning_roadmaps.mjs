/**
 * Fills every planning_templates row with a real roadmap (nutrition + training
 * blocks, goals, milestones) inside data_json, so the templates open populated
 * in the planning editor instead of empty.
 *
 * Run:  node scripts/seed_planning_roadmaps.mjs
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// --- env ---
const env = {};
for (const line of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing Supabase env'); process.exit(1); }
const db = createClient(url, key);

// --- phase content library (4 phases per goal type, bilingual) ---
// p = [nutTitle, nutObjective, kcal, macros, traTitle, traObjective, traFocus]
const L = {
  fat_loss: {
    es: [
      ['Adaptación metabólica', 'Estabilizar hábitos y calorías de mantenimiento antes del déficit.', 'Mantenimiento', '40P / 35C / 25G', 'Base de fuerza', 'Recuperar técnica y fuerza con cargas moderadas.', 'Fuerza full-body'],
      ['Déficit progresivo', 'Crear un déficit moderado priorizando proteína y saciedad.', 'Déficit -15%', '45P / 30C / 25G', 'Fuerza y acondicionamiento', 'Mantener la fuerza y subir el gasto con circuitos.', 'Fuerza + metcon'],
      ['Definición intensiva', 'Maximizar la pérdida de grasa sin perder masa muscular.', 'Déficit -20%', '45P / 30C / 25G', 'Intensificación', 'Preservar masa magra con trabajo pesado y cardio.', 'Fuerza + cardio'],
      ['Reverse y mantenimiento', 'Subir calorías de forma controlada y consolidar el peso.', 'Reverse → Mantenimiento', '40P / 35C / 25G', 'Mantenimiento', 'Consolidar fuerza y hábitos a largo plazo.', 'Fuerza general'],
    ],
    en: [
      ['Metabolic adaptation', 'Stabilise habits and maintenance calories before the deficit.', 'Maintenance', '40P / 35C / 25F', 'Strength base', 'Rebuild technique and strength with moderate loads.', 'Full-body strength'],
      ['Progressive deficit', 'Create a moderate deficit prioritising protein and satiety.', '-15% deficit', '45P / 30C / 25F', 'Strength & conditioning', 'Hold strength and raise output with circuits.', 'Strength + metcon'],
      ['Intensive cut', 'Maximise fat loss while preserving muscle mass.', '-20% deficit', '45P / 30C / 25F', 'Intensification', 'Preserve lean mass with heavy work and cardio.', 'Strength + cardio'],
      ['Reverse & maintenance', 'Raise calories in a controlled way and lock in the new weight.', 'Reverse → Maintenance', '40P / 35C / 25F', 'Maintenance', 'Consolidate strength and long-term habits.', 'General strength'],
    ],
  },
  muscle_gain: {
    es: [
      ['Fundamentos', 'Asegurar proteína suficiente y un ligero superávit.', 'Superávit +5%', '30P / 50C / 20G', 'Base de hipertrofia', 'Construir técnica y volumen de entrenamiento.', 'Hipertrofia full-body'],
      ['Volumen', 'Sostener un superávit limpio para maximizar la ganancia.', 'Superávit +10%', '30P / 50C / 20G', 'Sobrecarga progresiva', 'Aumentar cargas y volumen de forma progresiva.', 'Hipertrofia split'],
      ['Intensificación', 'Mantener el superávit y afinar la calidad muscular.', 'Superávit +8%', '32P / 48C / 20G', 'Pico de fuerza', 'Trabajar rangos de fuerza para potenciar el músculo.', 'Fuerza-hipertrofia'],
      ['Consolidación', 'Estabilizar el peso ganado y mantener calidad.', 'Mantenimiento', '30P / 45C / 25G', 'Mantenimiento', 'Consolidar las ganancias y prevenir lesiones.', 'Hipertrofia general'],
    ],
    en: [
      ['Foundations', 'Secure enough protein and a slight surplus.', '+5% surplus', '30P / 50C / 20F', 'Hypertrophy base', 'Build technique and training volume.', 'Full-body hypertrophy'],
      ['Volume', 'Hold a clean surplus to maximise muscle gain.', '+10% surplus', '30P / 50C / 20F', 'Progressive overload', 'Increase loads and volume progressively.', 'Hypertrophy split'],
      ['Intensification', 'Keep the surplus and refine muscle quality.', '+8% surplus', '32P / 48C / 20F', 'Strength peak', 'Train strength ranges to drive muscle growth.', 'Strength-hypertrophy'],
      ['Consolidation', 'Stabilise the gained weight and keep quality.', 'Maintenance', '30P / 45C / 25F', 'Maintenance', 'Lock in the gains and prevent injuries.', 'General hypertrophy'],
    ],
  },
  body_recomposition: {
    es: [
      ['Recalibración', 'Comer en mantenimiento con proteína alta.', 'Mantenimiento', '40P / 35C / 25G', 'Base de fuerza', 'Construir una base sólida de fuerza y técnica.', 'Fuerza full-body'],
      ['Recomposición A', 'Déficit ligero en días de descanso, mantenimiento al entrenar.', 'Cíclico ±10%', '42P / 33C / 25G', 'Hipertrofia', 'Estimular músculo con volumen moderado-alto.', 'Hipertrofia split'],
      ['Recomposición B', 'Mantener el reparto cíclico y subir intensidad.', 'Cíclico ±10%', '42P / 33C / 25G', 'Fuerza-hipertrofia', 'Combinar fuerza pesada e hipertrofia.', 'Fuerza + hipertrofia'],
      ['Consolidación', 'Estabilizar en mantenimiento y valorar resultados.', 'Mantenimiento', '40P / 35C / 25G', 'Mantenimiento', 'Consolidar composición corporal y rendimiento.', 'Fuerza general'],
    ],
    en: [
      ['Recalibration', 'Eat at maintenance with high protein.', 'Maintenance', '40P / 35C / 25F', 'Strength base', 'Build a solid base of strength and technique.', 'Full-body strength'],
      ['Recomposition A', 'Light deficit on rest days, maintenance on training days.', 'Cyclic ±10%', '42P / 33C / 25F', 'Hypertrophy', 'Stimulate muscle with moderate-high volume.', 'Hypertrophy split'],
      ['Recomposition B', 'Keep the cyclic split and raise intensity.', 'Cyclic ±10%', '42P / 33C / 25F', 'Strength-hypertrophy', 'Combine heavy strength and hypertrophy.', 'Strength + hypertrophy'],
      ['Consolidation', 'Stabilise at maintenance and assess results.', 'Maintenance', '40P / 35C / 25F', 'Maintenance', 'Consolidate body composition and performance.', 'General strength'],
    ],
  },
  performance: {
    es: [
      ['Acumulación', 'Cubrir el gasto con energía suficiente para entrenar.', 'Mantenimiento alto', '25P / 55C / 20G', 'Acumulación', 'Acumular volumen de trabajo y base general.', 'Fuerza + capacidad'],
      ['Transformación', 'Sostener el rendimiento con buena disponibilidad de carbohidratos.', 'Mantenimiento alto', '25P / 55C / 20G', 'Transformación', 'Convertir el volumen en fuerza y potencia.', 'Fuerza-potencia'],
      ['Realización', 'Optimizar energía y recuperación para el pico.', 'Mantenimiento', '25P / 55C / 20G', 'Pico de rendimiento', 'Afinar potencia y técnica de competición.', 'Potencia + técnica'],
      ['Mantenimiento', 'Recuperar y mantener el nivel adquirido.', 'Mantenimiento', '28P / 50C / 22G', 'Descarga y mantenimiento', 'Descargar fatiga y sostener el rendimiento.', 'Fuerza general'],
    ],
    en: [
      ['Accumulation', 'Cover output with enough energy to train.', 'High maintenance', '25P / 55C / 20F', 'Accumulation', 'Accumulate work volume and a general base.', 'Strength + capacity'],
      ['Transformation', 'Sustain performance with good carbohydrate availability.', 'High maintenance', '25P / 55C / 20F', 'Transformation', 'Turn volume into strength and power.', 'Strength-power'],
      ['Realisation', 'Optimise energy and recovery for the peak.', 'Maintenance', '25P / 55C / 20F', 'Performance peak', 'Sharpen power and competition technique.', 'Power + technique'],
      ['Maintenance', 'Recover and keep the level reached.', 'Maintenance', '28P / 50C / 22F', 'Deload & maintenance', 'Shed fatigue and sustain performance.', 'General strength'],
    ],
  },
  endurance_focus: {
    es: [
      ['Base aeróbica', 'Asegurar carbohidratos e hidratación para el volumen base.', 'Mantenimiento', '20P / 60C / 20G', 'Base aeróbica', 'Construir base aeróbica con rodajes suaves.', 'Resistencia base'],
      ['Construcción', 'Subir carbohidratos para soportar tiradas y tempo.', 'Mantenimiento alto', '20P / 62C / 18G', 'Tempo y umbral', 'Trabajar umbral y ritmo objetivo.', 'Tempo + umbral'],
      ['Específico', 'Carga de carbohidratos en sesiones clave.', 'Mantenimiento alto', '18P / 64C / 18G', 'Trabajo específico', 'Sesiones específicas de carrera y ritmo.', 'Series + ritmo'],
      ['Tapering', 'Reducir volumen manteniendo energía para competir.', 'Carga de carbohidratos', '18P / 65C / 17G', 'Afinamiento', 'Reducir volumen y llegar fresco a la meta.', 'Tapering'],
    ],
    en: [
      ['Aerobic base', 'Secure carbohydrates and hydration for base volume.', 'Maintenance', '20P / 60C / 20F', 'Aerobic base', 'Build an aerobic base with easy runs.', 'Base endurance'],
      ['Build', 'Raise carbohydrates to support long runs and tempo.', 'High maintenance', '20P / 62C / 18F', 'Tempo & threshold', 'Work threshold and goal pace.', 'Tempo + threshold'],
      ['Specific', 'Carbohydrate fuelling on key sessions.', 'High maintenance', '18P / 64C / 18F', 'Specific work', 'Specific race and pace sessions.', 'Intervals + pace'],
      ['Tapering', 'Cut volume while keeping energy for race day.', 'Carb loading', '18P / 65C / 17F', 'Taper', 'Reduce volume and arrive fresh at the finish.', 'Tapering'],
    ],
  },
  health: {
    es: [
      ['Activación', 'Ordenar comidas y mejorar la calidad de la dieta.', 'Mantenimiento', '30P / 45C / 25G', 'Activación', 'Crear el hábito de moverse con sesiones cortas.', 'Movilidad + fuerza'],
      ['Progresión', 'Afinar porciones y hábitos según objetivos.', 'Mantenimiento', '30P / 45C / 25G', 'Progresión', 'Subir carga y variedad de ejercicios.', 'Fuerza funcional'],
      ['Consolidación', 'Consolidar una alimentación sostenible.', 'Mantenimiento', '30P / 45C / 25G', 'Consolidación', 'Consolidar fuerza, movilidad y energía diaria.', 'Fuerza + movilidad'],
      ['Mantenimiento', 'Mantener los hábitos adquiridos a largo plazo.', 'Mantenimiento', '30P / 45C / 25G', 'Mantenimiento', 'Sostener actividad regular y bienestar.', 'Salud general'],
    ],
    en: [
      ['Activation', 'Organise meals and improve diet quality.', 'Maintenance', '30P / 45C / 25F', 'Activation', 'Build the habit of moving with short sessions.', 'Mobility + strength'],
      ['Progression', 'Fine-tune portions and habits to the goal.', 'Maintenance', '30P / 45C / 25F', 'Progression', 'Raise load and exercise variety.', 'Functional strength'],
      ['Consolidation', 'Consolidate a sustainable way of eating.', 'Maintenance', '30P / 45C / 25F', 'Consolidation', 'Consolidate strength, mobility and daily energy.', 'Strength + mobility'],
      ['Maintenance', 'Keep the acquired habits long term.', 'Maintenance', '30P / 45C / 25F', 'Maintenance', 'Sustain regular activity and wellbeing.', 'General health'],
    ],
  },
  metabolic_reset: {
    es: [
      ['Reverse inicial', 'Subir calorías de forma gradual desde el déficit.', 'Reverse +5%/sem', '35P / 40C / 25G', 'Reactivación', 'Reactivar el entrenamiento con cargas moderadas.', 'Fuerza full-body'],
      ['Estabilización', 'Estabilizar en el nuevo mantenimiento metabólico.', 'Mantenimiento', '32P / 43C / 25G', 'Estabilización', 'Consolidar fuerza con el nuevo aporte energético.', 'Fuerza general'],
      ['Consolidación', 'Mantener el mantenimiento recuperado.', 'Mantenimiento', '32P / 43C / 25G', 'Consolidación', 'Sostener rendimiento y energía estable.', 'Fuerza general'],
      ['Mantenimiento', 'Sostener el metabolismo recuperado a largo plazo.', 'Mantenimiento', '30P / 45C / 25G', 'Mantenimiento', 'Mantener actividad y rendimiento.', 'Fuerza general'],
    ],
    en: [
      ['Initial reverse', 'Raise calories gradually out of the deficit.', 'Reverse +5%/wk', '35P / 40C / 25F', 'Reactivation', 'Reactivate training with moderate loads.', 'Full-body strength'],
      ['Stabilisation', 'Stabilise at the new metabolic maintenance.', 'Maintenance', '32P / 43C / 25F', 'Stabilisation', 'Consolidate strength with the new energy intake.', 'General strength'],
      ['Consolidation', 'Hold the recovered maintenance.', 'Maintenance', '32P / 43C / 25F', 'Consolidation', 'Sustain stable performance and energy.', 'General strength'],
      ['Maintenance', 'Sustain the recovered metabolism long term.', 'Maintenance', '30P / 45C / 25F', 'Maintenance', 'Keep activity and performance.', 'General strength'],
    ],
  },
};
const GOALS = {
  es: { primary: 'Progreso medible y sostenible', secondary: 'Adherencia y consistencia semanal' },
  en: { primary: 'Measurable, sustainable progress', secondary: 'Weekly adherence and consistency' },
};

// Pick P phase indices, always keeping the final "consolidation" phase (index 3).
function pickPhases(P) {
  if (P >= 4) return [0, 1, 2, 3];
  if (P === 3) return [0, 1, 3];
  if (P === 2) return [0, 3];
  return [3];
}

function buildRoadmap(tpl) {
  const lang = tpl.language === 'en' ? 'en' : 'es';
  const lib = (L[tpl.goal_type] || L.health)[lang];
  const weeks = tpl.duration_weeks || 12;
  const idxs = pickPhases(Math.max(1, Math.min(tpl.phases || 3, 4)));
  const n = idxs.length;
  const per = Math.floor(weeks / n);

  const nutrition = [], training = [], milestones = [];
  let acc = 0;
  idxs.forEach((pi, i) => {
    const p = lib[pi];
    const startWeek = acc + 1;
    const span = i === n - 1 ? weeks - acc : per;
    const endWeek = acc + span;
    acc = endWeek;
    const nutColor = 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400';
    const traColor = 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400';
    nutrition.push({
      id: `nut-${i}`, type: 'nutrition', title: p[0], startWeek, endWeek, duration: span, order: i, colorToken: nutColor,
      kcal: p[2], macros: p[3],
      stratData: {
        summary: p[1], primaryObjective: p[1], secondaryObjectives: [GOALS[lang].secondary],
        kpis: [lang === 'es' ? 'Adherencia ≥ 90%' : 'Adherence ≥ 90%', lang === 'es' ? 'Proteína diaria objetivo' : 'Daily protein target'],
        successCriteria: [lang === 'es' ? 'Progreso semanal según lo previsto' : 'Weekly progress on track'],
        coachNotes: '', risksAndConstraints: [lang === 'es' ? 'Ajustar según check-ins' : 'Adjust based on check-ins'],
        kcal: p[2], macros: p[3], freq: lang === 'es' ? 'Diario' : 'Daily', water: '2-3 L',
      },
    });
    training.push({
      id: `tra-${i}`, type: 'training', title: p[4], startWeek, endWeek, duration: span, order: i, colorToken: traColor,
      focus: p[6],
      stratData: {
        summary: p[5], primaryObjective: p[5], secondaryObjectives: [GOALS[lang].secondary],
        kpis: [lang === 'es' ? 'Sesiones completadas' : 'Sessions completed', lang === 'es' ? 'Progresión de cargas' : 'Load progression'],
        successCriteria: [lang === 'es' ? 'Técnica y progresión correctas' : 'Correct technique and progression'],
        coachNotes: '', risksAndConstraints: [lang === 'es' ? 'Priorizar la recuperación' : 'Prioritise recovery'],
        trainingFocus: p[6], sessions: '3-5/sem', deload: lang === 'es' ? 'Según fatiga' : 'As needed', intensityTargets: [],
      },
    });
    milestones.push({ id: `ms-${i}`, label: p[0], week: `${startWeek}`, status: i === 0 ? 'next' : 'future' });
  });

  const goals = [
    { id: 'g0', type: 'physical', label: GOALS[lang].primary, desc: '', value: 0, currentLabel: '', targetLabel: '' },
    { id: 'g1', type: 'training', label: GOALS[lang].secondary, desc: '', value: 0, currentLabel: '', targetLabel: '' },
  ];
  return { nutrition, training, goals, milestones };
}

const { data: rows, error } = await db
  .from('planning_templates')
  .select('id, name, goal_type, intensity, duration_weeks, phases, language, data_json');
if (error) { console.error(error); process.exit(1); }

let ok = 0;
for (const tpl of rows) {
  const rm = buildRoadmap(tpl);
  const data_json = {
    ...(tpl.data_json && typeof tpl.data_json === 'object' ? tpl.data_json : {}),
    type: 'roadmap-template',
    totalWeeks: tpl.duration_weeks || 12,
    currentWeek: 1,
    status: 'Draft',
    ...rm,
  };
  const { error: upErr } = await db.from('planning_templates')
    .update({ data_json, updated_at: new Date().toISOString() })
    .eq('id', tpl.id);
  if (upErr) { console.error('FAIL', tpl.name, upErr.message); continue; }
  ok++;
}
console.log(`Updated ${ok}/${rows.length} planning templates.`);
