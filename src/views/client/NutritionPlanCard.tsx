import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const NutritionPlanCard = ({ plan }: { plan: any }) => {
  const { t } = useLanguage();
  // Hooks must run unconditionally — declared before any early return.
  const [selectedDay, setSelectedDay] = useState('monday');

  if (!plan) return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
      <Utensils className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('no_nutrition_plan_assigned')}</p>
    </div>
  );

  const data = plan.data_json || {};
  const isWeekly = data.type === 'weekly';

  const currentDayData = isWeekly ? (data.days?.[selectedDay] || {}) : data;
  const meals = currentDayData.meals || [];

  let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0;
  meals.forEach((m: any) => {
    (m.items || []).forEach((i: any) => {
      const qty = i.quantity || 1;
      totalKcal += (i.calories || 0) * qty;
      totalP += (i.protein || 0) * qty;
      totalC += (i.carbs || 0) * qty;
      totalF += (i.fats || 0) * qty;
    });
  });

  if (totalKcal === 0 && (totalP > 0 || totalC > 0 || totalF > 0)) {
    totalKcal = (totalP * 4) + (totalC * 4) + (totalF * 9);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('current_nutritional_plan')}</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{plan.name || t('personalized_plan')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">{t('active')}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('calories'), value: Math.round(totalKcal), unit: 'kcal', color: 'text-orange-500' },
            { label: t('protein'), value: Math.round(totalP), unit: 'g', color: 'text-blue-500' },
            { label: t('carbs'), value: Math.round(totalC), unit: 'g', color: 'text-emerald-500' },
            { label: t('fats'), value: Math.round(totalF), unit: 'g', color: 'text-amber-500' },
          ].map((macro, i) => (
            <div key={i} className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{macro.label}</p>
              <div className="flex flex-col">
                <span className={`text-lg font-black tracking-tighter ${macro.color}`}>{macro.value}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">{macro.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {isWeekly && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex-1 min-w-[50px] ${
                  selectedDay === d
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {meals.map((meal: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">{meal.iconName === 'Sunrise' ? 'wb_twilight' : meal.iconName === 'Sun' ? 'sunny' : meal.iconName === 'Moon' ? 'dark_mode' : 'restaurant'}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{meal.name}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{meal.time || '--:--'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 dark:text-white">{(meal.categories || []).map((c: any) => `${c.amount}g ${c.label.slice(0,1)}`).join(' / ')}</p>
              </div>
            </div>
          ))}
          {meals.length === 0 && (
            <p className="text-center text-[10px] text-slate-400 italic py-2 uppercase tracking-widest">{t('no_meals_defined_day')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionPlanCard;
