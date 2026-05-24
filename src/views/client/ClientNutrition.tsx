import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonText } from '../../components/ui/Skeleton';

export default function ClientNutrition() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'general' | 'example'>('general');
  const [viewState, setViewState] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  useEffect(() => {
    let mounted = true;
    const fetchMyPlans = async () => {
      try {
        const data = await fetchWithAuth('/client/plans');
        if (!mounted) return;
        if (data && data.nutrition && data.nutrition.length > 0) {
          const plan = data.nutrition[0];
          setNutritionPlan(plan);
          if (plan.data_json?.mode) setMode(plan.data_json.mode);
          // If it's a weekly plan, start in weekly view
          if (plan.data_json?.type === 'weekly') {
            setViewState('weekly');
          } else {
            setViewState('daily');
          }
        }
      } catch (err: any) {
        console.error('Error fetching client plans:', err);
        if (mounted) setLoadError(err?.message || t('error_loading_data'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchMyPlans();
    return () => { mounted = false; };
  }, []);

  // Loading state: instead of a global spinner, render the layout with
  // skeletons (day selector buttons, macro ring, and 4 meal cards) so the
  // page does not jump when the real plan arrives.
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]" aria-hidden="true">
        <div className="p-6 pb-2">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 sm:gap-6">
            <SkeletonCircle size={64} className="rounded-3xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-12 w-24 rounded-2xl" />
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6 pt-2">
          {/* Day selector placeholders */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-16 rounded-xl shrink-0" />
            ))}
          </div>
          {/* Macro ring card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-24 rounded-xl" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <SkeletonCircle size={120} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Meal card placeholders */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-5">
                  <SkeletonCircle size={56} className="rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="pl-[76px] space-y-2">
                  <SkeletonText lines={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6 text-rose-400">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('error_loading_data')}</h2>
        <p className="text-slate-500 max-w-sm">{loadError}</p>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <span className="material-symbols-outlined text-4xl">no_meals</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_nutrition_plan_assigned')}</h2>
        <p className="text-slate-500 max-w-sm">{t('coach_has_not_published_nutrition_plan')}</p>
      </div>
    );
  }

  const isWeekly = nutritionPlan.data_json?.type === 'weekly';
  // Monthly plans: weeks 2-4 may override the base week. Show the week of the
  // month that matches today's date.
  const weekOfMonth = Math.min(4, Math.max(1, Math.ceil(new Date().getDate() / 7)));
  const planWeekOverrides = nutritionPlan.data_json?.weekOverrides || {};
  const planDays = planWeekOverrides[weekOfMonth] || nutritionPlan.data_json?.days || {};
  
  const meals = isWeekly
    ? (planDays[selectedDay]?.meals || [])
    : (nutritionPlan.data_json?.meals || []);

  const planGoal: string = nutritionPlan.data_json?.goal || nutritionPlan.goal || '';

  const foodsToAvoid: any[] = Array.isArray(nutritionPlan.data_json?.foodsToAvoid)
    ? nutritionPlan.data_json.foodsToAvoid
    : (Array.isArray(nutritionPlan.data_json?.foods_to_avoid) ? nutritionPlan.data_json.foods_to_avoid : []);

  // Compute totals from food items AND from general-mode macro categories,
  // so the macro panel is correct regardless of which mode the plan uses.
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
  meals.forEach((m: any) => {
    (m.items || []).forEach((i: any) => {
      const qty = i.multiplier || i.quantity || 1;
      totalCalories += (i.calories || 0) * qty;
      totalProtein += (i.protein || 0) * qty;
      totalCarbs += (i.carbs || 0) * qty;
      totalFats += (i.fats || 0) * qty;
    });
    (m.categories || []).forEach((cat: any) => {
      const lbl = (cat.label || '').toLowerCase();
      if (cat.id === 'p' || lbl.includes('protein') || lbl.includes('proteí')) totalProtein += cat.amount || 0;
      else if (cat.id === 'c' || lbl.includes('carb') || lbl.includes('hidrato')) totalCarbs += cat.amount || 0;
      else if (cat.id === 'f' || lbl.includes('fat') || lbl.includes('grasa')) totalFats += cat.amount || 0;
    });
  });
  // If no per-item calories (general mode), derive calories from macros.
  if (totalCalories === 0 && (totalProtein > 0 || totalCarbs > 0 || totalFats > 0)) {
    totalCalories = totalProtein * 4 + totalCarbs * 4 + totalFats * 9;
  }

  // Macro ring segment lengths (circumference for r=40 is 2*PI*40 ≈ 251).
  const ringCirc = 2 * Math.PI * 40;
  const macroKcal = totalProtein * 4 + totalCarbs * 4 + totalFats * 9 || 1;
  const proteinSeg = (totalProtein * 4 / macroKcal) * ringCirc;
  const carbsSeg = (totalCarbs * 4 / macroKcal) * ringCirc;
  const fatsSeg = (totalFats * 9 / macroKcal) * ringCirc;

  const daysConfig = [
    { id: 'monday', name: t('monday') },
    { id: 'tuesday', name: t('tuesday') },
    { id: 'wednesday', name: t('wednesday') },
    { id: 'thursday', name: t('thursday') },
    { id: 'friday', name: t('friday') },
    { id: 'saturday', name: t('saturday') },
    { id: 'sunday', name: t('sunday') },
  ];

  const renderWeeklyView = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-emerald-500">
            <span className="material-symbols-outlined text-2xl">calendar_view_week</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t('weekly_distribution')}</h3>
            <p className="text-sm text-slate-500">{t('select_day_to_view_meals_and_macros')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {daysConfig.map((day, idx) => {
          const dayData = planDays[day.id];
          const dMeals = dayData?.meals || [];
          let dCals = 0, dP = 0, dC = 0, dF = 0;
          
          dMeals.forEach((m: any) => {
            (m.items || []).forEach((i: any) => {
              // Misma fórmula que en la vista diaria (multiplier || quantity)
              // para que las kcal de la tarjeta semanal y del día coincidan.
              const qty = i.multiplier || i.quantity || 1;
              dCals += (i.calories || 0) * qty;
              dP += (i.protein || 0) * qty;
              dC += (i.carbs || 0) * qty;
              dF += (i.fats || 0) * qty;
            });
            if (m.categories) {
              m.categories.forEach((cat: any) => {
                if (cat.id === 'p' || cat.label?.toLowerCase().includes('protein')) dP += cat.amount || 0;
                else if (cat.id === 'c' || cat.label?.toLowerCase().includes('carb')) dC += cat.amount || 0;
                else if (cat.id === 'f' || cat.label?.toLowerCase().includes('fat')) dF += cat.amount || 0;
              });
            }
          });

          if (dCals === 0 && (dP > 0 || dC > 0 || dF > 0)) {
            dCals = (dP * 4) + (dC * 4) + (dF * 9);
          }

          const totalMacros = (dP * 4) + (dC * 4) + (dF * 9) || 1;
          const pPct = Math.round((dP * 4 / totalMacros) * 100);
          const cPct = Math.round((dC * 4 / totalMacros) * 100);
          const fPct = Math.round((dF * 9 / totalMacros) * 100);

          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDay(day.id);
                setViewState('daily');
              }}
              className="group w-full text-left bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-center gap-6 p-6"
            >
              <div className="w-full sm:w-1/4 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{day.name}</h3>
                </div>
                <div className={`flex items-center gap-1.5 font-black text-2xl ${dCals === 0 ? 'text-slate-300' : 'text-orange-500'}`}>
                  <span className="material-symbols-outlined text-lg">{dCals === 0 ? 'bedtime' : 'local_fire_department'}</span>
                  {Math.round(dCals).toLocaleString(locale)} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">kcal</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                    {dayData?.tag || (dCals === 0 ? t('rest_day') : t('active_plan'))}
                  </span>
                  <div className="flex gap-3 text-[10px] text-slate-500 font-black tracking-widest uppercase">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></div>{pPct}% P</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>{cPct}% C</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20"></div>{fPct}% F</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                  <div className="bg-blue-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${pPct}%` }}></div>
                  <div className="bg-emerald-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${cPct}%` }}></div>
                  <div className="bg-amber-500 h-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: `${fPct}%` }}></div>
                </div>
              </div>

              <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('nutrition')}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-xs">
                      {dMeals.length}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{t('intakes')}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500">arrow_forward</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDaySelector = () => {
    if (!isWeekly) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setViewState('weekly')}
          className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-emerald-500 transition-colors uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t('week_view')}
        </button>
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
          {days.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-tighter ${
                selectedDay === d 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t(d).slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderGeneralMode = () => (
    <div className="flex-1 flex flex-col gap-6">
      {/* Macro Totals */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('daily_macro_totals')}</h3>
          <span className="text-[10px] font-black px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">{t('plan_active')}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-slate-100 dark:stroke-slate-800" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10" />
              {totalCalories > 0 && (
                <>
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray={`${proteinSeg} ${ringCirc}`} strokeDashoffset="0" strokeWidth="10" strokeLinecap="round" />
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#10b981" strokeDasharray={`${carbsSeg} ${ringCirc}`} strokeDashoffset={`-${proteinSeg}`} strokeWidth="10" strokeLinecap="round" />
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#f59e0b" strokeDasharray={`${fatsSeg} ${ringCirc}`} strokeDashoffset={`-${proteinSeg + carbsSeg}`} strokeWidth="10" strokeLinecap="round" />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20 group-hover:scale-125 transition-transform"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('protein')}</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalProtein)}g</p>
                <p className="text-[10px] font-bold text-blue-500/60 uppercase">{t('target')}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 group-hover:scale-125 transition-transform"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('carbs')}</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalCarbs)}g</p>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase">{t('target')}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20 group-hover:scale-125 transition-transform"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fats')}</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalFats)}g</p>
                <p className="text-[10px] font-bold text-amber-500/60 uppercase">{t('target')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Structure */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('daily_structure')}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('meals_count_kcal_target', { meals: meals.length, kcal: Math.round(totalCalories) })}</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {meals.map((m: any, idx: number) => (
            <MealBlock 
              key={idx}
              title={m.name} 
              time={m.time} 
              kcal={Math.round((m.items || []).reduce((a: number, i: any) => a + ((i.calories || 0) * (i.multiplier || i.quantity || 1)), 0))}
              icon={m.iconName === 'Sunrise' ? 'wb_twilight' : m.iconName === 'Sun' ? 'sunny' : m.iconName === 'Moon' ? 'dark_mode' : 'restaurant'}
              iconBg={m.iconColor || "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}
              macros={(m.categories || []).map((c: any) => ({
                label: c.label,
                sub: c.example,
                value: `${c.amount}g`,
                color: c.color
              }))}
              viewDetailsLabel={t('view_details')}
            />
          ))}
        </div>
      </div>

      {/* Foods to Avoid — only shown when the coach has defined restrictions */}
      {foodsToAvoid.length > 0 && (
      <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-8 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('foods_to_avoid')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('strict_restrictions')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {foodsToAvoid.map((item: any, idx: number) => (
            <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4 shadow-sm">
              <span className="material-symbols-outlined text-rose-500">cancel</span>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{typeof item === 'string' ? item : item?.name}</p>
                {typeof item !== 'string' && item?.reason && (
                  <p className="text-xs text-slate-500 font-medium tracking-tight">{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );

  const renderExampleMode = () => (
    <div className="flex-1 flex flex-col gap-6">
      {/* Macro Totals (Same as General) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('daily_macro_totals')}</h3>
          <span className="text-[10px] font-black px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">{t('plan_active')}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-slate-100 dark:stroke-slate-800" cx="50" cy="50" fill="transparent" r="40" strokeWidth="10" />
              {totalCalories > 0 && (
                <>
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray={`${proteinSeg} ${ringCirc}`} strokeDashoffset="0" strokeWidth="10" strokeLinecap="round" />
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#10b981" strokeDasharray={`${carbsSeg} ${ringCirc}`} strokeDashoffset={`-${proteinSeg}`} strokeWidth="10" strokeLinecap="round" />
                  <circle className="drop-shadow-sm transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="#f59e0b" strokeDasharray={`${fatsSeg} ${ringCirc}`} strokeDashoffset={`-${proteinSeg + carbsSeg}`} strokeWidth="10" strokeLinecap="round" />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('protein')}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalProtein)}g</p>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('carbs')}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalCarbs)}g</p>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fats')}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(totalFats)}g</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Structure with Examples */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('daily_structure')}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('meals_count_example_items', { meals: meals.length })}</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {meals.map((m: any, idx: number) => (
            <ExampleMealBlock 
              key={idx}
              title={m.name} 
              time={m.time} 
              kcal={Math.round((m.items || []).reduce((a: number, i: any) => a + ((i.calories || 0) * (i.multiplier || i.quantity || 1)), 0))}
              icon={m.iconName === 'Sunrise' ? 'wb_twilight' : m.iconName === 'Sun' ? 'sunny' : m.iconName === 'Moon' ? 'dark_mode' : 'restaurant'}
              iconBg={m.iconColor || "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}
              items={(m.items || []).map((i: any) => {
                const qty = i.multiplier || i.quantity || 1;
                return {
                  name: i.name,
                  sub: `${i.servingSize || ''} × ${qty}`.trim(),
                  kcal: Math.round((i.calories || 0) * qty),
                  amount: `${Math.round(qty * 100) / 100} ${t('units')}`,
                };
              })}
              servingLabel={t('serving')}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      <div className="p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <span className="text-slate-500">{t('nutrition')}</span>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('nutrition')}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-3xl shadow-sm bg-[#17cf54]/10 flex items-center justify-center text-2xl font-bold text-[#17cf54] uppercase">{user?.email?.charAt(0) || 'C'}</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user?.full_name || user?.email?.split('@')[0] || '—'}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {planGoal && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">flag</span> {t('goal')}: {planGoal}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person</span> {t('client')}
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black mb-1 text-center">{t('plan_status')}</div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('active_plan')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 pt-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-8">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 relative">
            <button 
              onClick={() => setMode('general')}
              className={`relative px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${mode === 'general' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              {t('general_mode')}
            </button>
            <button 
              onClick={() => setMode('example')}
              className={`relative px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${mode === 'example' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              {t('example_mode')}
            </button>
          </div>
          {/* Print button removed — the SPA layout has no @media print styles
              so the output was unusable. Re-add only when a real print view
              (export to PDF) is implemented. */}
        </div>

        {viewState === 'weekly' ? renderWeeklyView() : (
          <>
            {renderDaySelector()}
            {mode === 'general' ? renderGeneralMode() : renderExampleMode()}
          </>
        )}
      </div>
    </div>
  );
}

function MealBlock({ title, time, kcal, icon, iconBg, macros, viewDetailsLabel }: any) {
  return (
    <div className="group border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className={`${iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">{title}</h3>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {time}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              <span className="text-slate-600 dark:text-slate-300">{kcal} kcal</span>
            </div>
          </div>
        </div>
        {/* Las kcal y los macros de la comida ya se muestran debajo; el botón
            "Ver detalles" era redundante y no tenía acción — se elimina. */}
      </div>
      <div className="pl-[76px] space-y-3">
        {macros.map((m: any, i: number) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between group/macro">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 ${m.color.replace('bg-', 'bg-')} rounded-full shadow-sm`}></div>
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{m.label}</p>
                <p className="text-[10px] text-slate-400 font-bold">{m.sub}</p>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExampleMealBlock({ title, time, kcal, icon, iconBg, items, servingLabel }: any) {
  return (
    <div className="group border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className={`${iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">{title}</h3>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {time}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              <span className="text-slate-600 dark:text-slate-300">{kcal} kcal</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pl-[76px] space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="p-3 pr-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 hover:shadow-md transition-all group/item">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-2xl">🥗</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{item.amount || servingLabel}</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.kcal} kcal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
