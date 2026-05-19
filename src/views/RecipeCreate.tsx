import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useClient } from '../context/ClientContext';
import Select from '../components/ui/Select';
import { fetchWithAuth } from '../api';

interface Ingredient { name: string; amount: string; unit: string; }
interface Step { title: string; text: string; }

// Daily-calorie baseline a recipe is authored for. The per-client scale ratio
// is clientPlanKcal / SCALE_REFERENCE_KCAL.
const SCALE_REFERENCE_KCAL = 2000;

const unitShort = (u: string): string => {
  const v = (u || '').toLowerCase();
  if (v === 'grams' || v === 'gram' || v === 'g') return 'g';
  if (v === 'unit' || v === 'units') return ' u';
  return v ? ' ' + v : '';
};

/** Sum the daily calories of a nutrition plan's data_json (single-day or weekly). */
const computePlanKcal = (dataJson: any): number => {
  let dj = dataJson;
  if (typeof dj === 'string') {
    try { dj = JSON.parse(dj); } catch { return 0; }
  }
  if (!dj || typeof dj !== 'object') return 0;
  let meals: any[] = [];
  if (Array.isArray(dj.meals)) {
    meals = dj.meals;
  } else if (dj.days && typeof dj.days === 'object') {
    const firstDay: any = Object.values(dj.days)[0];
    meals = (firstDay && firstDay.meals) || [];
  }
  let total = 0;
  meals.forEach((m: any) => {
    (m?.items || []).forEach((it: any) => {
      total += (Number(it?.calories) || 0) * (Number(it?.quantity) || 1);
    });
  });
  return Math.round(total);
};

interface RecipeCreateProps {
  recipeId?: string;
  onBack: () => void;
}

const emptyIngredient = (): Ingredient => ({ name: '', amount: '', unit: 'grams' });
const emptyStep = (): Step => ({ title: '', text: '' });

export default function RecipeCreate({ recipeId, onBack }: RecipeCreateProps) {
  const { t } = useLanguage();
  const isEditMode = !!recipeId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Lunch / Dinner');
  const [prepTime, setPrepTime] = useState<string>('');
  const [servings, setServings] = useState<string>('1');
  const [imageUrl, setImageUrl] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [tagsText, setTagsText] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<Step[]>([emptyStep()]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client Scale Preview state
  const { clients } = useClient();
  const [scaleClientId, setScaleClientId] = useState('');
  const [clientPlanKcal, setClientPlanKcal] = useState<number | null>(null);
  const [scaleLoading, setScaleLoading] = useState(false);

  // Load the selected client's nutrition plan and derive their daily kcal target.
  useEffect(() => {
    if (!scaleClientId) { setClientPlanKcal(null); return; }
    let cancelled = false;
    setScaleLoading(true);
    (async () => {
      try {
        const plan = await fetchWithAuth(`/manager/clients/${scaleClientId}/nutrition-plan`);
        if (!cancelled) setClientPlanKcal(plan ? computePlanKcal(plan.data_json) : 0);
      } catch {
        if (!cancelled) setClientPlanKcal(0);
      } finally {
        if (!cancelled) setScaleLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [scaleClientId]);

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
        setCategory(r.category || 'Lunch / Dinner');
        setPrepTime(r.prep_time != null ? String(r.prep_time) : '');
        setServings(r.servings != null ? String(r.servings) : '1');
        setImageUrl(r.image_url || '');
        setCalories(r.calories != null ? String(r.calories) : '');
        setProtein(r.protein != null ? String(r.protein) : '');
        setCarbs(r.carbs != null ? String(r.carbs) : '');
        setFats(r.fats != null ? String(r.fats) : '');
        setTagsText(Array.isArray(r.tags) ? r.tags.join(', ') : '');
        setIngredients(
          Array.isArray(r.ingredients) && r.ingredients.length
            ? r.ingredients.map((i: any) => ({
                name: i.name || '',
                amount: i.amount != null ? String(i.amount) : '',
                unit: i.unit || 'grams',
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
  // donut: circumference 439.8, offset shrinks as calories grow (cap at 1000 kcal)
  const calNum = num(calories);

  // Per-client scale: ratio of the client's plan target vs the recipe baseline.
  const scaleRatio = clientPlanKcal && clientPlanKcal > 0 ? clientPlanKcal / SCALE_REFERENCE_KCAL : null;
  const scaledIngredients = ingredients
    .filter(i => i.name.trim() && i.amount.trim() && !Number.isNaN(Number(i.amount)) && Number(i.amount) > 0)
    .map(i => ({ name: i.name.trim(), unit: i.unit, original: Number(i.amount) }));
  const donutOffset = 439.8 * (1 - Math.min(calNum, 1000) / 1000);

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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      title,
      description,
      category,
      image_url: imageUrl,
      prep_time: prepTime === '' ? null : Number(prepTime),
      servings: servings === '' ? null : Number(servings),
      calories: calories === '' ? null : Number(calories),
      protein: protein === '' ? null : Number(protein),
      carbs: carbs === '' ? null : Number(carbs),
      fats: fats === '' ? null : Number(fats),
      tags: tagsText.split(',').map(s => s.trim()).filter(Boolean),
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
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
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50 text-slate-500 font-bold">
        {t('loading_library')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {t('back_to_library')}
              </button>
              <h2 className="text-3xl font-bold text-slate-900">
                {isEditMode ? t('edit_recipe') : t('create_recipe')}
              </h2>
              {error && <p className="text-sm text-red-500 font-bold mt-2">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-bold"
              >
                {t('save_draft')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold"
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
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">info</span>
                  {t('basic_information')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('recipe_title')}</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                      placeholder={t('recipe_title_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('recipe_card_sample_desc')}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('category_label')}</label>
                      <Select
                        value={category}
                        onChange={setCategory}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                      >
                        <option value="Lunch / Dinner">{t('lunch_dinner_option')}</option>
                        <option value="Breakfast">{t('breakfast_option')}</option>
                        <option value="Snack">{t('snack_option')}</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('prep_time')}</label>
                      <input
                        type="number"
                        value={prepTime}
                        onChange={e => setPrepTime(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('recipe_servings_sample')}</label>
                      <input
                        type="number"
                        value={servings}
                        onChange={e => setServings(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('lunch_tag')}</label>
                    <input
                      type="text"
                      value={tagsText}
                      onChange={e => setTagsText(e.target.value)}
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                      placeholder="vegan, quick, summer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('recipe_image')}</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all mb-3"
                      placeholder="https://..."
                    />
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 transition-all">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="max-h-40 rounded-xl object-cover" />
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[28px] text-emerald-500">add</span>
                          </div>
                          <span className="text-sm font-bold text-slate-600">{t('click_upload')}</span>
                          <span className="text-xs text-slate-400 mt-1">{t('image_upload_specs')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                <div className="space-y-4">
                  {ingredients.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 group hover:border-emerald-500/30 transition-all">
                      <span className="material-symbols-outlined text-slate-300 cursor-move">drag_indicator</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 placeholder-slate-400"
                          value={item.name}
                          onChange={e => updateIngredient(idx, { name: e.target.value })}
                          placeholder={t('food_item')}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          className="w-full rounded-xl border-slate-200 bg-white py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                          value={item.amount}
                          onChange={e => updateIngredient(idx, { amount: e.target.value })}
                        />
                      </div>
                      <div className="w-32">
                        <Select
                          value={item.unit}
                          onChange={(v) => updateIngredient(idx, { unit: v })}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="grams">grams</option>
                          <option value="ml">ml</option>
                          <option value="cup">cup</option>
                          <option value="tbsp">tbsp</option>
                          <option value="unit">unit</option>
                        </Select>
                      </div>
                      <button
                        onClick={() => removeIngredient(idx)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Guide */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                    <div key={idx} className="relative flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/20">{idx + 1}</div>
                        <div className="w-0.5 h-full bg-slate-200 rounded-full"></div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 focus:ring-0"
                            value={step.title}
                            onChange={e => updateStep(idx, { title: e.target.value })}
                            placeholder={t('recipe_title')}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeStep(idx)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                          className="w-full rounded-2xl border-slate-200 bg-white text-sm p-4 focus:ring-2 focus:ring-emerald-500 min-h-[100px] font-medium"
                          value={step.text}
                          onChange={e => updateStep(idx, { text: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Stats */}
            <div className="lg:w-96 space-y-8">
              {/* Nutrition Stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">{t('nutrition_per_serving')}</h3>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-400 uppercase tracking-widest">{t('base_recipe')}</span>
                </div>
                <div className="p-8">
                  <div className="flex justify-center mb-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                        <circle className="text-emerald-500" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset={donutOffset} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{calNum}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('kcal_short')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('kcal_short')}</label>
                      <input
                        type="number"
                        value={calories}
                        onChange={e => setCalories(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {[
                      { label: t('protein'), value: protein, setter: setProtein, color: 'bg-emerald-500', percent: pct(macroProtein) },
                      { label: t('carbs'), value: carbs, setter: setCarbs, color: 'bg-blue-500', percent: pct(macroCarbs) },
                      { label: t('fats'), value: fats, setter: setFats, color: 'bg-amber-400', percent: pct(macroFats) }
                    ].map((macro, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center text-sm font-bold mb-2">
                          <span className="text-slate-500">{macro.label}</span>
                          <input
                            type="number"
                            value={macro.value}
                            onChange={e => macro.setter(e.target.value)}
                            className="w-20 rounded-xl border-slate-200 bg-slate-50 py-1.5 px-2 text-sm text-right font-bold focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${macro.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client Scale Preview */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">science</span>
                    {t('client_scale_preview')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{t('scale_preview_desc')}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('select_client')}</label>
                    <Select
                      value={scaleClientId}
                      onChange={(v) => setScaleClientId(v)}
                      placeholder={t('select_client')}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-bold text-slate-900"
                      options={clients.map(c => ({ value: c.id, label: c.name }))}
                    />
                  </div>

                  {!scaleClientId ? (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center text-xs font-medium text-slate-400">
                      {t('scale_select_client_hint')}
                    </div>
                  ) : scaleLoading ? (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center text-xs font-medium text-slate-400">
                      {t('loading')}
                    </div>
                  ) : !scaleRatio ? (
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-center text-xs font-medium text-amber-600">
                      {t('scale_no_plan')}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('scaled_values')}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                          {t('scale_ratio_label', { ratio: scaleRatio.toFixed(2) })}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mb-4">
                        {t('scale_client_target', { kcal: clientPlanKcal ?? 0 })}
                      </p>
                      <div className="space-y-4">
                        {scaledIngredients.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-500">{ing.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="line-through text-slate-300 text-xs">{ing.original}{unitShort(ing.unit)}</span>
                              <span className="text-emerald-600">{Math.round(ing.original * scaleRatio)}{unitShort(ing.unit)}</span>
                            </div>
                          </div>
                        ))}
                        {calNum > 0 && (
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-500">{t('calories')}</span>
                            <div className="flex items-center gap-2">
                              <span className="line-through text-slate-300 text-xs">{calNum}</span>
                              <span className="text-emerald-600">{Math.round(calNum * scaleRatio)} kcal</span>
                            </div>
                          </div>
                        )}
                        {scaledIngredients.length === 0 && calNum === 0 && (
                          <p className="text-xs text-slate-400 font-medium">{t('scale_no_data')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled
                    title={t('scale_apply_soon')}
                    className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed"
                  >
                    {t('apply_scale')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
