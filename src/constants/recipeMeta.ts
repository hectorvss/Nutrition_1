// Metadatos canónicos de receta — claves estables (nunca traducidas) + sus
// etiquetas bilingües. Lo consumen RecipeCreate (edición) y RecipeDetail
// (visualización) para que las fichas sean coherentes y "copiables" con alta
// fidelidad. Par de etiquetas: [es, en].

export type Lang = 'es' | 'en';

const pick = (pair: [string, string], lang: Lang) => pair[lang === 'es' ? 0 : 1];

// ── Dificultad ──────────────────────────────────────────────────────────
export const DIFFICULTY_KEYS = ['easy', 'medium', 'hard'] as const;
export type DifficultyKey = typeof DIFFICULTY_KEYS[number];

const DIFFICULTY_LABELS: Record<DifficultyKey, [string, string]> = {
  easy:   ['Fácil', 'Easy'],
  medium: ['Intermedia', 'Medium'],
  hard:   ['Avanzada', 'Hard'],
};
export const difficultyLabel = (k: string | null | undefined, lang: Lang): string =>
  k && DIFFICULTY_LABELS[k as DifficultyKey] ? pick(DIFFICULTY_LABELS[k as DifficultyKey], lang) : '';

// ── Categorías ──────────────────────────────────────────────────────────
export const CATEGORY_KEYS = [
  'breakfast', 'lunch_dinner', 'snack', 'high_protein', 'low_carb',
  'vegan', 'vegetarian', 'post_workout', 'detox', 'dessert',
] as const;
export type CategoryKey = typeof CATEGORY_KEYS[number];

const CATEGORY_LABELS: Record<CategoryKey, [string, string]> = {
  breakfast:    ['Desayuno', 'Breakfast'],
  lunch_dinner: ['Comida / Cena', 'Lunch / Dinner'],
  snack:        ['Snack', 'Snack'],
  high_protein: ['Alto en proteína', 'High protein'],
  low_carb:     ['Bajo en carbohidratos', 'Low carb'],
  vegan:        ['Vegano', 'Vegan'],
  vegetarian:   ['Vegetariano', 'Vegetarian'],
  post_workout: ['Post-entreno', 'Post-workout'],
  detox:        ['Detox', 'Detox'],
  dessert:      ['Postre saludable', 'Healthy dessert'],
};
export const categoryLabel = (k: string | null | undefined, lang: Lang): string => {
  if (!k) return '';
  return CATEGORY_LABELS[k as CategoryKey] ? pick(CATEGORY_LABELS[k as CategoryKey], lang) : k;
};

// ── Etiquetas dietéticas ────────────────────────────────────────────────
export const DIET_KEYS = [
  'vegan', 'vegetarian', 'pescatarian', 'gluten_free', 'dairy_free',
  'keto', 'low_carb', 'high_protein', 'paleo', 'sugar_free',
] as const;
export type DietKey = typeof DIET_KEYS[number];

const DIET_LABELS: Record<DietKey, [string, string]> = {
  vegan:        ['Vegano', 'Vegan'],
  vegetarian:   ['Vegetariano', 'Vegetarian'],
  pescatarian:  ['Pescetariano', 'Pescatarian'],
  gluten_free:  ['Sin gluten', 'Gluten-free'],
  dairy_free:   ['Sin lácteos', 'Dairy-free'],
  keto:         ['Keto', 'Keto'],
  low_carb:     ['Bajo en carbohidratos', 'Low carb'],
  high_protein: ['Alto en proteína', 'High protein'],
  paleo:        ['Paleo', 'Paleo'],
  sugar_free:   ['Sin azúcar añadido', 'No added sugar'],
};
export const dietLabel = (k: string, lang: Lang): string =>
  DIET_LABELS[k as DietKey] ? pick(DIET_LABELS[k as DietKey], lang) : k;

// ── Alérgenos ───────────────────────────────────────────────────────────
export const ALLERGEN_KEYS = [
  'gluten', 'dairy', 'egg', 'nuts', 'peanut', 'soy', 'fish', 'shellfish', 'sesame', 'mustard',
] as const;
export type AllergenKey = typeof ALLERGEN_KEYS[number];

const ALLERGEN_LABELS: Record<AllergenKey, [string, string]> = {
  gluten:    ['Gluten', 'Gluten'],
  dairy:     ['Lácteos', 'Dairy'],
  egg:       ['Huevo', 'Egg'],
  nuts:      ['Frutos secos', 'Tree nuts'],
  peanut:    ['Cacahuete', 'Peanut'],
  soy:       ['Soja', 'Soy'],
  fish:      ['Pescado', 'Fish'],
  shellfish: ['Marisco', 'Shellfish'],
  sesame:    ['Sésamo', 'Sesame'],
  mustard:   ['Mostaza', 'Mustard'],
};
export const allergenLabel = (k: string, lang: Lang): string =>
  ALLERGEN_LABELS[k as AllergenKey] ? pick(ALLERGEN_LABELS[k as AllergenKey], lang) : k;
