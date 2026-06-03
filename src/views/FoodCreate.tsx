import React, { useState } from 'react';
import { useFoodContext } from '../context/FoodContext';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

interface FoodCreateProps {
  onBack: () => void;
}

export default function FoodCreate({ onBack }: FoodCreateProps) {
  const { addFood } = useFoodContext();
  const { t } = useLanguage();
  const FOOD_CATEGORIES = ['Protein', 'Carbs', 'Fruit', 'Vegetables', 'Fats', 'Dairy', 'Grains'];
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Protein');
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const [brand, setBrand] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await addFood({
        name: name.trim(),
        category,
        brand: brand.trim() || undefined,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fats: parseFloat(fats) || 0,
        servingSize: `${servingAmount}${servingUnit}`,
      });
      onBack();
    } catch (err: any) {
      console.error('Error saving food:', err);
      // Generic alert replaced with inline error state to avoid blocking the UI
      setError(err?.message || t('food_save_error', { defaultValue: 'Error al guardar el alimento. Inténtalo de nuevo.' }));
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={onBack}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {t('back_to_library')}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 dark:text-white font-bold">{t('add_new_food')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[16px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('create_custom_food_title')}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('food_form_desc')}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">info</span>
                  {t('basic_information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">{t('food_name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-sm"
                      placeholder={t('food_name_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">{t('category_label')}</label>
                    <Select
                      value={category}
                      onChange={(val) => setCategory(val)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-sm"
                    >
                      {FOOD_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      {t('brand_label')} <span className="text-slate-500 dark:text-slate-400 font-normal">{t('optional_label')}</span>
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-sm"
                      placeholder={t('brand_label')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">{t('standard_serving')}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={servingAmount}
                        onChange={e => setServingAmount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-sm"
                        placeholder="100"
                      />
                      <Select value={servingUnit} onChange={(val) => setServingUnit(val)} className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-sm font-medium">
                        <option>g</option>
                        <option>ml</option>
                        <option>oz</option>
                        <option>cup</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Macronutrients */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">pie_chart</span>
                  {t('macronutrients')} <span className="text-slate-500 dark:text-slate-400 text-xs normal-case font-normal ml-1">{t('per_serving')}</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: t('calories'), unit: 'kcal', val: calories, set: setCalories },
                    { label: t('protein'), unit: 'g', val: protein, set: setProtein },
                    { label: t('carbs'), unit: 'g', val: carbs, set: setCarbs },
                    { label: t('fats'), unit: 'g', val: fats, set: setFats }
                  ].map((macro) => (
                    <div key={macro.label} className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{macro.label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={macro.val}
                          onChange={e => macro.set(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-emerald-500 focus:ring-emerald-500 font-bold text-lg text-slate-900 dark:text-white"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{macro.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Micronutrients */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">science</span>
                    {t('technical_data')}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">{t('optional_label')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50/30 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                  {[
                    { label: t('fiber'), unit: 'g' },
                    { label: t('sugar'), unit: 'g' },
                    { label: t('sodium'), unit: 'mg' }
                  ].map((micro, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase">{micro.label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{micro.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isSaving ? t('saving_dots') : t('save_to_database')}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-right mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
