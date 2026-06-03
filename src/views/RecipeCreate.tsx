import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';
import ClientScalePreview from '../components/recipes/ClientScalePreview';
import { fetchWithAuth } from '../api';
import {
  CATEGORY_KEYS, categoryLabel,
  DIFFICULTY_KEYS, difficultyLabel,
  DIET_KEYS, dietLabel,
  ALLERGEN_KEYS, allergenLabel,
} from '../constants/recipeMeta';

interface Ingredient { name: string; amount: string; unit: string; note: string; }
interface Step { title: string; text: string; }

interface RecipeCreateProps {
  recipeId?: string;
  onBack: () => void;
}

const emptyIngredient = (): Ingredient => ({ name: '', amount: '', unit: 'g', note: '' });
const emptyStep = (): Step => ({ title: '', text: '' });

export default function RecipeCreate({ recipeId, onBack }: RecipeCreateProps) {
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const isEditMode = !!recipeId;

  // Básico
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('lunch_dinner');
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [prepTime, setPrepTime] = useState<string>('');
  const [cookTime, setCookTime] = useState<string>('');
  const [servings, setServings] = useState<string>('1');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsText, setTagsText] = useState('');
  // Macros
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  // Micronutrientes
  const [fiber, setFiber] = useState<string>('');
  const [sugar, setSugar] = useState<string>('');
  const [saturatedFat, setSaturatedFat] = useState<string>('');
  const [sodium, setSodium] = useState<string>('');
  // Dieta / alérgenos
  const [dietLabels, setDietLabels] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  // Equipo / tips / conservación
  const [equipmentText, setEquipmentText] = useState('');
  const [tipsText, setTipsText] = useState('');
  const [storage, setStorage] = useState('');
  // Listas
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<Step[]>([emptyStep()]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchWithAuth('/recipes/' + recipeId);
        if (cancelled || !r) return;
        setTitle(r.title || '');
        setDescription(r.description || '');
        setCategory(r.category || 'lunch_dinner');
        setDifficulty(r.difficulty || 'easy');
        setPrepTime(r.prep_time != null ? String(r.prep_time) : '');
        setCookTime(r.cook_time != null ? String(r.cook_time) : '');
        setServings(r.servings != null ? String(r.servings) : '1');
        setImageUrl(r.image_url || '');
        setTagsText(Array.isArray(r.tags) ? r.tags.join(', ') : '');
        setCalories(r.calories != null ? String(r.calories) : '');
        setProtein(r.protein != null ? String(r.protein) : '');
        setCarbs(r.carbs != null ? String(r.carbs) : '');
        setFats(r.fats != null ? String(r.fats) : '');
        setFiber(r.fiber != null ? String(r.fiber) : '');
        setSugar(r.sugar != null ? String(r.sugar) : '');
        setSaturatedFat(r.saturated_fat != null ? String(r.saturated_fat) : '');
        setSodium(r.sodium != null ? String(r.sodium) : '');
        setDietLabels(Array.isArray(r.diet_labels) ? r.diet_labels : []);
        setAllergens(Array.isArray(r.allergens) ? r.allergens : []);
        setEquipmentText(Array.isArray(r.equipment) ? r.equipment.join('\n') : '');
        setTipsText(Array.isArray(r.tips) ? r.tips.join('\n') : '');
        setStorage(r.storage || '');
        setIngredients(
          Array.isArray(r.ingredients) && r.ingredients.length
            ? r.ingredients.map((i: any) => ({
                name: i.name || '',
                amount: i.amount != null ? String(i.amount) : '',
                unit: i.unit || 'g',
                note: i.note || '',
              }))
            : [emptyIngredient()]
        );
        setSteps(
          Array.isArray(r.steps) && r.steps.length
            ? r.steps.map((s: any) => ({ title: s.title || '', text: s.text || '' }))
            : [emptyStep()]
        );
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error loading recipe');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [recipeId]);

  const num = (v: string) => (v === '' ? 0 : Number(v) || 0);

  const macroProtein = num(protein);
  const macroCarbs = num(carbs);
  const macroFats = num(fats);
  const macroTotal = macroProtein + macroCarbs + macroFats;
  const pct = (v: number) => (macroTotal > 0 ? Math.round((v / macroTotal) * 100) : 0);
  const calNum = num(calories);
  const donutOffset = 439.8 * (1 - Math.min(calNum, 1000) / 1000);
  const totalTime = num(prepTime) + num(cookTime);

  const updateIngredient = (idx: number, patch: Partial<Ingredient>) => {
    setIngredients(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const removeIngredient = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };
  const updateStep = (idx: number, patch: Partial<Step>) => {
    setSteps(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };
  const toggleIn = (list: string[], setter: (v: string[]) => void, key: string) => {
    setter(list.includes(key) ? list.filter(k => k !== key) : [...list, key]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t('recipe_title_required', { defaultValue: 'El nombre de la receta es obligatorio.' }));
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title,
      description,
      category,
      difficulty,
      image_url: imageUrl,
      prep_time: prepTime === '' ? null : Number(prepTime),
      cook_time: cookTime === '' ? null : Number(cookTime),
      servings: servings === '' ? null : Number(servings),
      calories: calories === '' ? null : Number(calories),
      protein: protein === '' ? null : Number(protein),
      carbs: carbs === '' ? null : Number(carbs),
      fats: fats === '' ? null : Number(fats),
      fiber: fiber === '' ? null : Number(fiber),
      sugar: sugar === '' ? null : Number(sugar),
      saturated_fat: saturatedFat === '' ? null : Number(saturatedFat),
      sodium: sodium === '' ? null : Number(sodium),
      diet_labels: dietLabels,
      allergens,
      equipment: equipmentText.split('\n').map(s => s.trim()).filter(Boolean),
      tips: tipsText.split('\n').map(s => s.trim()).filter(Boolean),
      storage,
      tags: tagsText.split(',').map(s => s.trim()).filter(Boolean),
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({ name: i.name, amount: i.amount, unit: i.unit, note: i.note })),
      steps: steps
        .filter(s => s.title.trim() || s.text.trim())
        .map(s => ({ title: s.title, text: s.text })),
    };
    try {
      await fetchWithAuth(isEditMode ? '/recipes/' + recipeId : '/recipes', {
        method: isEditMode ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      onBack();
    } catch (err: any) {
      setError(err.message || 'Error saving recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold">
        {t('loading_library')}
      </div>
    );
  }

  const fieldCls = 'w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all';
  const labelCls = 'block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2';
  const cardCls = 'bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8';

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {t('back_to_library')}
              </button>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? t('edit_recipe') : t('create_recipe')}
              </h2>
              {error && <p className="text-sm text-red-500 font-bold mt-2">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                {saving ? '...' : t('save_recipe')}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Form */}
            <div className="flex-1 space-y-8 pb-20">
              {/* Basic Info */}
              <div className={cardCls}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">info</span>
                  {t('basic_information')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>{t('recipe_title')}</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className={fieldCls}
                      placeholder={t('recipe_title_placeholder')}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{isEs ? 'Descripción' : 'Description'}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className={`${fieldCls} min-h-[80px]`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>{t('category_label')}</label>
                      <Select value={category} onChange={setCategory}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white outline-none p-4 text-sm font-medium">
                        {CATEGORY_KEYS.map(k => (
                          <option key={k} value={k}>{categoryLabel(k, language)}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className={labelCls}>{isEs ? 'Dificultad' : 'Difficulty'}</label>
                      <Select value={difficulty} onChange={setDifficulty}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white outline-none p-4 text-sm font-medium">
                        {DIFFICULTY_KEYS.map(k => (
                          <option key={k} value={k}>{difficultyLabel(k, language)}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelCls}>{isEs ? 'Preparación (min)' : 'Prep (min)'}</label>
                      <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)}
                        className={fieldCls} placeholder="15" />
                    </div>
                    <div>
                      <label className={labelCls}>{isEs ? 'Cocción (min)' : 'Cook (min)'}</label>
                      <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)}
                        className={fieldCls} placeholder="20" />
                    </div>
                    <div>
                      <label className={labelCls}>{t('recipe_servings_sample')}</label>
                      <input type="number" value={servings} onChange={e => setServings(e.target.value)}
                        className={fieldCls} placeholder="2" />
                    </div>
                  </div>
                  {totalTime > 0 && (
                    <p className="text-xs font-bold text-slate-400 -mt-2">
                      {isEs ? 'Tiempo total' : 'Total time'}: {totalTime} min
                    </p>
                  )}
                  <div>
                    <label className={labelCls}>{isEs ? 'Etiquetas (separadas por comas)' : 'Tags (comma separated)'}</label>
                    <input type="text" value={tagsText} onChange={e => setTagsText(e.target.value)}
                      className={fieldCls} placeholder={isEs ? 'rápido, batch cooking, verano' : 'quick, batch cooking, summer'} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('recipe_image')}</label>
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                      className={`${fieldCls} mb-3`} placeholder="https://..." />
                    {imageUrl && (
                      <img src={imageUrl} alt="" className="max-h-48 rounded-2xl object-cover w-full" />
                    )}
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className={cardCls}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">shopping_basket</span>
                    {t('ingredients_section')}
                  </h3>
                  <button
                    onClick={() => setIngredients(prev => [...prev, emptyIngredient()])}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    {t('add_item')}
                  </button>
                </div>
                <div className="space-y-3">
                  {ingredients.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-500/30 transition-all space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500"
                          value={item.name}
                          onChange={e => updateIngredient(idx, { name: e.target.value })}
                          placeholder={isEs ? 'Ingrediente' : 'Ingredient'}
                        />
                        <input
                          type="number"
                          className="w-20 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                          value={item.amount}
                          onChange={e => updateIngredient(idx, { amount: e.target.value })}
                          placeholder="0"
                        />
                        <Select
                          value={item.unit}
                          onChange={(v) => updateIngredient(idx, { unit: v })}
                          className="w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm font-bold"
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="ud">{isEs ? 'ud' : 'unit'}</option>
                          <option value="cda">{isEs ? 'cda' : 'tbsp'}</option>
                          <option value="cdta">{isEs ? 'cdta' : 'tsp'}</option>
                          <option value="taza">{isEs ? 'taza' : 'cup'}</option>
                          <option value="pizca">{isEs ? 'pizca' : 'pinch'}</option>
                        </Select>
                        <button
                          onClick={() => removeIngredient(idx)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500 rounded-xl border-slate-200 dark:border-slate-700 py-2 px-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                        value={item.note}
                        onChange={e => updateIngredient(idx, { note: e.target.value })}
                        placeholder={isEs ? 'Nota / preparación (ej. picado, a temperatura ambiente)' : 'Note / prep (e.g. diced, at room temperature)'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Guide */}
              <div className={cardCls}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">menu_book</span>
                    {t('preparation_guide')}
                  </h3>
                  <button
                    onClick={() => setSteps(prev => [...prev, emptyStep()])}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    {t('add_step')}
                  </button>
                </div>
                <div className="space-y-6">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/20">{idx + 1}</div>
                        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0"
                            value={step.title}
                            onChange={e => updateStep(idx, { title: e.target.value })}
                            placeholder={isEs ? 'Título del paso' : 'Step title'}
                          />
                          <button
                            onClick={() => removeStep(idx)}
                            className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <textarea
                          className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500 text-sm p-4 focus:ring-2 focus:ring-emerald-500 min-h-[90px] font-medium"
                          value={step.text}
                          onChange={e => updateStep(idx, { text: e.target.value })}
                          placeholder={isEs ? 'Describe el paso con detalle…' : 'Describe the step in detail…'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment, tips & storage */}
              <div className={cardCls}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">blender</span>
                  {isEs ? 'Equipo, consejos y conservación' : 'Equipment, tips & storage'}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>{isEs ? 'Utensilios necesarios (uno por línea)' : 'Equipment needed (one per line)'}</label>
                    <textarea
                      value={equipmentText}
                      onChange={e => setEquipmentText(e.target.value)}
                      className={`${fieldCls} min-h-[90px]`}
                      placeholder={isEs ? 'Sartén antiadherente\nBatidora\nBol' : 'Non-stick pan\nBlender\nMixing bowl'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{isEs ? 'Consejos del chef / sustituciones (uno por línea)' : "Chef's tips / substitutions (one per line)"}</label>
                    <textarea
                      value={tipsText}
                      onChange={e => setTipsText(e.target.value)}
                      className={`${fieldCls} min-h-[90px]`}
                      placeholder={isEs ? 'Sustituye el pollo por tofu para versión vegana\nAñade chili para un toque picante' : 'Swap chicken for tofu for a vegan version\nAdd chili for a spicy kick'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{isEs ? 'Conservación y meal-prep' : 'Storage & meal-prep'}</label>
                    <textarea
                      value={storage}
                      onChange={e => setStorage(e.target.value)}
                      className={`${fieldCls} min-h-[80px]`}
                      placeholder={isEs ? 'Se conserva 3 días en nevera en recipiente hermético. No apto para congelar.' : 'Keeps 3 days refrigerated in an airtight container. Not freezer-friendly.'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Stats */}
            <div className="lg:w-96 space-y-8">
              {/* Nutrition Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">{t('nutrition_per_serving')}</h3>
                </div>
                <div className="p-8">
                  <div className="flex justify-center mb-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-slate-100 dark:text-slate-800" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                        <circle className="text-emerald-500" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset={donutOffset} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{calNum}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('kcal_short')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('kcal_short')}</label>
                      <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    {[
                      { label: t('protein'), value: protein, setter: setProtein, color: 'bg-emerald-500', percent: pct(macroProtein) },
                      { label: t('carbs'), value: carbs, setter: setCarbs, color: 'bg-blue-500', percent: pct(macroCarbs) },
                      { label: t('fats'), value: fats, setter: setFats, color: 'bg-amber-400', percent: pct(macroFats) }
                    ].map((macro, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center text-sm font-bold mb-2">
                          <span className="text-slate-500 dark:text-slate-400">{macro.label}</span>
                          <input type="number" value={macro.value} onChange={e => macro.setter(e.target.value)}
                            className="w-20 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-2 text-sm text-right font-bold focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${macro.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Micronutrientes */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      {isEs ? 'Micronutrientes (por ración)' : 'Micronutrients (per serving)'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: isEs ? 'Fibra (g)' : 'Fiber (g)', value: fiber, setter: setFiber },
                        { label: isEs ? 'Azúcares (g)' : 'Sugar (g)', value: sugar, setter: setSugar },
                        { label: isEs ? 'Grasa sat. (g)' : 'Sat. fat (g)', value: saturatedFat, setter: setSaturatedFat },
                        { label: isEs ? 'Sodio (mg)' : 'Sodium (mg)', value: sodium, setter: setSodium },
                      ].map((m, i) => (
                        <div key={i}>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">{m.label}</label>
                          <input type="number" value={m.value} onChange={e => m.setter(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diet labels & allergens */}
              <div className={cardCls}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{isEs ? 'Apto para' : 'Suitable for'}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {DIET_KEYS.map(k => (
                    <button
                      key={k}
                      onClick={() => toggleIn(dietLabels, setDietLabels, k)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        dietLabels.includes(k)
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {dietLabel(k, language)}
                    </button>
                  ))}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{isEs ? 'Contiene alérgenos' : 'Contains allergens'}</h3>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_KEYS.map(k => (
                    <button
                      key={k}
                      onClick={() => toggleIn(allergens, setAllergens, k)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        allergens.includes(k)
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {allergenLabel(k, language)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Scale Preview */}
              <ClientScalePreview
                ingredients={ingredients}
                calories={calNum}
                recipeTitle={title}
                protein={macroProtein}
                carbs={macroCarbs}
                fats={macroFats}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
