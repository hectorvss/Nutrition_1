/**
 * Shared search helpers for the library / picker UIs.
 *
 * Goal: searches in the exercise and food libraries (and inside the nutrition
 * / training planning pickers) must match the typed query against the item
 * NAME *and* against its category-style metadata — so typing "glúteos",
 * "compound", "proteínas", "principiante"… returns the right items even
 * when the literal name doesn't contain that word.
 *
 * Cross-language: a coach typing in Spanish should still match metadata
 * stored in English (and vice-versa). A small synonym map handles the most
 * common gym / nutrition terms; everything else is plain substring match.
 */

const ES_EN: Record<string, string[]> = {
  // ── Exercise terms ─────────────────────────────────────────────────────
  'compuesto': ['compound'], 'compuestos': ['compound'],
  'aislado': ['isolation'], 'aislados': ['isolation'], 'aislamiento': ['isolation'],
  'principiante': ['beginner'], 'principiantes': ['beginner'],
  'intermedio': ['intermediate'],
  'avanzado': ['advanced'],
  'fuerza': ['strength'],
  'cardio': ['cardio', 'conditioning'],
  'movilidad': ['mobility'],
  'calentamiento': ['warm-up', 'warm up', 'warmup'],
  'rehabilitacion': ['rehab'], 'rehabilitación': ['rehab'],
  'pecho': ['chest'],
  'espalda': ['back'],
  'hombro': ['shoulders'], 'hombros': ['shoulders'],
  'brazo': ['arms'], 'brazos': ['arms'],
  'biceps': ['biceps'], 'bíceps': ['biceps'],
  'triceps': ['triceps'], 'tríceps': ['triceps'],
  'pierna': ['legs', 'quads'], 'piernas': ['legs', 'quads'],
  'cuadriceps': ['quads', 'quadriceps'], 'cuádriceps': ['quads', 'quadriceps'],
  'femoral': ['hamstring', 'hamstrings'], 'femorales': ['hamstring', 'hamstrings'],
  'isquios': ['hamstring', 'hamstrings'], 'isquiotibial': ['hamstring', 'hamstrings'],
  'gluteo': ['glutes', 'glute'], 'glúteo': ['glutes', 'glute'],
  'gluteos': ['glutes'], 'glúteos': ['glutes'],
  'gemelo': ['calves', 'calf'], 'gemelos': ['calves'],
  'pantorrilla': ['calves', 'calf'], 'pantorrillas': ['calves'],
  'abdomen': ['core', 'abs'], 'abdominales': ['core', 'abs'], 'abdominal': ['core', 'abs'],
  'nucleo': ['core'], 'núcleo': ['core'],
  'antebrazo': ['forearms'], 'antebrazos': ['forearms'],
  'trapecio': ['traps', 'trapezius'], 'trapecios': ['traps'],
  'cuerpo completo': ['full body', 'full-body', 'fullbody'],
  'mancuerna': ['dumbbell'], 'mancuernas': ['dumbbell', 'dumbbells'],
  'barra': ['barbell'],
  'maquina': ['machine'], 'máquina': ['machine'],
  'polea': ['cable'], 'poleas': ['cable'],
  'peso corporal': ['bodyweight'],

  // ── Food / nutrition terms ─────────────────────────────────────────────
  'proteina': ['protein', 'proteína'], 'proteína': ['protein'], 'proteinas': ['protein'], 'proteínas': ['protein'],
  'carbohidrato': ['carbs', 'carbohidratos', 'carb'], 'carbohidratos': ['carbs', 'carbohydrates'],
  'carbo': ['carbs'], 'hidrato': ['carbs', 'carbohidratos'], 'hidratos': ['carbs', 'carbohidratos'],
  'grasa': ['fats', 'fat'], 'grasas': ['fats', 'fat'],
  'fruta': ['fruits', 'frutas'], 'frutas': ['fruits'],
  'verdura': ['vegetables', 'verduras'], 'verduras': ['vegetables'],
  'vegetal': ['vegetables'], 'vegetales': ['vegetables'],

  // ── Reverse: English → Spanish ─────────────────────────────────────────
  'compound': ['compuesto', 'compuestos'],
  'isolation': ['aislado', 'aislamiento'],
  'beginner': ['principiante'], 'intermediate': ['intermedio'], 'advanced': ['avanzado'],
  'strength': ['fuerza'], 'mobility': ['movilidad'],
  'chest': ['pecho'], 'back': ['espalda'], 'shoulders': ['hombros'],
  'arms': ['brazos'],
  'legs': ['piernas'], 'quads': ['cuádriceps', 'cuadriceps'],
  'hamstring': ['femoral', 'isquios'], 'hamstrings': ['femorales', 'isquios'],
  'glutes': ['glúteos', 'gluteos', 'glúteo'], 'glute': ['glúteo'],
  'calves': ['gemelos', 'pantorrillas'], 'calf': ['gemelo'],
  'core': ['núcleo', 'abdomen'], 'abs': ['abdominales'],
  'forearms': ['antebrazos'], 'traps': ['trapecios'],
  'full body': ['cuerpo completo'], 'fullbody': ['cuerpo completo'],
  'dumbbell': ['mancuerna'], 'dumbbells': ['mancuernas'],
  'barbell': ['barra'], 'machine': ['máquina', 'maquina'],
  'cable': ['polea'], 'bodyweight': ['peso corporal'],
  'protein': ['proteína', 'proteínas', 'proteina'],
  'carbs': ['carbohidratos', 'hidratos'], 'carbohydrates': ['carbohidratos'],
  'fats': ['grasas'], 'fat': ['grasa'],
  'fruits': ['frutas'], 'vegetables': ['verduras', 'vegetales'],
};

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const norm = (s: unknown): string =>
  typeof s === 'string' ? stripAccents(s.toLowerCase().trim()) : '';

/** Expand the query with its known synonyms (and their accent-free forms). */
function expandQuery(q: string): string[] {
  const base = norm(q);
  if (!base) return [];
  const out = new Set<string>([base]);
  // Look up synonyms by both the typed form and the accented form, so e.g.
  // typing "gluteos" (no accent) still finds the "glúteos" map entry.
  for (const [key, syns] of Object.entries(ES_EN)) {
    const nk = norm(key);
    if (nk === base) syns.forEach(s => out.add(norm(s)));
  }
  return Array.from(out);
}

/** True if any of the candidate strings contains any of the query tokens. */
function anyMatch(candidates: unknown[], tokens: string[]): boolean {
  for (const c of candidates) {
    if (Array.isArray(c)) {
      if (anyMatch(c, tokens)) return true;
      continue;
    }
    const n = norm(c);
    if (!n) continue;
    for (const t of tokens) if (t && n.includes(t)) return true;
  }
  return false;
}

/** Match an exercise against a free-text query — by name OR category-style metadata. */
export function matchExercise(ex: any, query: string): boolean {
  if (!query || !query.trim()) return true;
  const tokens = expandQuery(query);
  return anyMatch([
    ex?.name, ex?.category, ex?.subcategory, ex?.type, ex?.difficulty_level,
    ex?.difficultyLevel, ex?.muscle_groups, ex?.muscleGroups,
    ex?.secondary_muscles, ex?.secondaryMuscles, ex?.tools,
  ], tokens);
}

/**
 * Match a food against a free-text query — by name OR category. Also
 * recognises macro keywords (protein/carbs/fats/proteína/hidratos/grasas):
 * those match foods whose category matches the keyword OR whose dominant
 * macro is that one.
 */
export function matchFood(food: any, query: string): boolean {
  if (!query || !query.trim()) return true;
  const tokens = expandQuery(query);
  if (anyMatch([food?.name, food?.category, food?.subcategory], tokens)) return true;

  // Dominant-macro fallback: typing "proteínas" also surfaces high-protein
  // foods even when their category isn't strictly labelled that way.
  const p = Number(food?.protein) || 0;
  const c = Number(food?.carbs) || 0;
  const f = Number(food?.fats) || 0;
  if (p + c + f <= 0) return false;
  const dominant = p >= c && p >= f ? 'protein' : c >= f ? 'carbs' : 'fats';
  const macroSynonyms: Record<string, string[]> = {
    protein: ['protein', 'proteina', 'proteinas', 'proteína', 'proteínas'],
    carbs: ['carbs', 'carb', 'carbohidrato', 'carbohidratos', 'hidrato', 'hidratos', 'carbohydrate', 'carbohydrates'],
    fats: ['fats', 'fat', 'grasa', 'grasas'],
  };
  const wanted = macroSynonyms[dominant].map(norm);
  return tokens.some(t => wanted.includes(t));
}
