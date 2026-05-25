import React, { useState, useEffect } from 'react';
import { ClientView } from '../../ClientApp';
import { fetchWithAuth } from '../../api';
import { unwrapList } from '../../api/unwrap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Skeleton, SkeletonCircle, SkeletonText } from '../../components/ui/Skeleton';

interface ClientDashboardProps {
  onNavigate: (view: ClientView) => void;
}

export default function ClientDashboard({ onNavigate }: ClientDashboardProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [onboardingFeedback, setOnboardingFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [plansData, checkInsData, profileData, onboardingLatest] = await Promise.all([
          fetchWithAuth('/client/plans'),
          fetchWithAuth('/check-ins/client/check-ins?limit=50'),
          fetchWithAuth('/client/profile'),
          // Surfaces the coach's feedback on the client's most recent
          // onboarding submission. `null` when there is no submission yet
          // or the coach hasn't reviewed it.
          fetchWithAuth('/onboarding/client/latest').catch(() => null),
        ]);

        if (!mounted) return;
        setPlans(plansData);
        setCheckIns(unwrapList(checkInsData));
        setProfile(profileData);
        if (onboardingLatest?.reviewed_at && onboardingLatest?.coach_notes) {
          setOnboardingFeedback(onboardingLatest);
        }

        if (profileData?.manager_id) {
          // Only the 3 most recent coach-authored messages are rendered, so
          // fetch a small page and filter — was 50 round-tripped per dashboard
          // visit, dominating the request for nothing.
          const conversation = await fetchWithAuth(`/messages/${profileData.manager_id}?limit=15`);
          if (!mounted) return;
          const msgs = unwrapList<any>(conversation);
          const coachMessages = msgs
            .filter((m: any) => m.sender_id === profileData.manager_id)
            .slice(0, 3);
          setMessages(coachMessages.reverse());
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <SkeletonCircle size={40} />
        </header>

        {/* Quick actions skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <SkeletonCircle size={40} />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Today's Plan skeleton */}
            <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <SkeletonCircle size={32} />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>

            {/* Meals skeleton */}
            <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <SkeletonCircle size={32} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Adherence ring */}
            <div className="bg-white dark:bg-[#112116] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <SkeletonCircle size={120} />
              <Skeleton className="h-3 w-48" />
            </div>

            {/* Streak */}
            <div className="bg-white dark:bg-[#112116] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
              <SkeletonCircle size={80} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Coach Notes */}
            <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="p-6">
                <SkeletonText lines={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Data extraction ---
  const nutritionPlan = plans?.nutrition?.[0];
  const trainingProgram = plans?.training?.[0];

  // Today's day name (using English keys for logic but translating for display if needed)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = days[new Date().getDay()];

  // --- Today's Training ---
  const getTodayTraining = () => {
    const dataJson = trainingProgram?.data_json || {};
    if (dataJson.weeklySchedule) {
      const workoutId = dataJson.weeklySchedule[todayName];
      if (!workoutId || workoutId === 'rest') return { name: null, blocks: [] };
      const workout = (dataJson.workouts || []).find((w: any) => w.id === workoutId);
      return { name: workout?.name || t('workout'), blocks: workout?.blocks || [] };
    }
    return { name: dataJson.name || t('training'), blocks: dataJson.blocks || [] };
  };

  const todayTraining = getTodayTraining();
  const totalExercises = todayTraining.blocks.reduce((acc: number, b: any) => acc + (b.exercises?.length || 0), 0);

  // --- Today's Meals ---
  const getTodayMeals = () => {
    if (!nutritionPlan) return [];
    const dataJson = nutritionPlan.data_json || {};
    const isWeekly = dataJson.type === 'weekly';
    if (isWeekly) {
      return dataJson.days?.[todayName]?.meals || [];
    }
    return dataJson.meals || [];
  };

  const todayMeals = getTodayMeals();

  // Next meal logic
  const getNextMeal = () => {
    if (!todayMeals.length) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sorted = [...todayMeals].sort((a: any, b: any) => {
      const parse = (t: string) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      return parse(a.time) - parse(b.time);
    });
    return sorted.find((meal: any) => {
      if (!meal.time) return false;
      const [h, m] = meal.time.split(':').map(Number);
      return h * 60 + m > currentMinutes;
    }) || sorted[0];
  };

  const nextMeal = getNextMeal();

  // --- Stats ---
  const calculateStats = () => {
    let consecutiveDays = 0;
    const checkInDates = new Set((checkIns || []).map(c => c.date?.split('T')[0]));
    let curr = new Date();
    if (!checkInDates.has(curr.toISOString().split('T')[0])) {
      curr.setDate(curr.getDate() - 1);
    }
    while (checkInDates.has(curr.toISOString().split('T')[0])) {
      consecutiveDays++;
      curr.setDate(curr.getDate() - 1);
    }

    // Adherencia al check-in semanal: nº de check-ins en las últimas 4 semanas
    // sobre 4 (un check-in por semana = 100%). Antes se dividía entre 7 días,
    // dando como máximo ~14% aunque el cliente cumpliera a la perfección.
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    let recentCheckIns = 0;
    checkInDates.forEach((dateStr) => {
      if (new Date(String(dateStr)) >= fourWeeksAgo) recentCheckIns++;
    });
    const adherence = Math.min(100, Math.round((recentCheckIns / 4) * 100));
    return { adherence: adherence || 0, streak: consecutiveDays || 0 };
  };

  const { adherence, streak } = calculateStats();

  const today = new Date();
  const hour = today.getHours();
  const greetingKey = hour < 12 ? 'good_morning' : hour < 18 ? 'good_afternoon' : 'good_evening';
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const formattedDate = today.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{t(greetingKey)}, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize">{formattedDate}</p>
        </div>
        {/* The initial-circle avatar was removed at the client's request.
            Settings is still reachable from the sidebar. */}
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button onClick={() => onNavigate('check-ins')} className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined">edit_note</span></div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{t('log_checkin')}</span>
        </button>
        <button onClick={() => onNavigate('nutrition')} className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined">restaurant_menu</span></div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{t('view_meals')}</span>
        </button>
        <button onClick={() => onNavigate('training')} className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined">play_circle</span></div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{t('start_workout')}</span>
        </button>
        <button onClick={() => onNavigate('messages')} className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined">forum</span></div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{t('message_coach')}</span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Plan */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('todays_plan')}</h2>
                {todayTraining.name && <p className="text-sm text-slate-500 mt-0.5">{todayTraining.name} • {totalExercises} {t('exercises')}</p>}
              </div>
              {todayTraining.blocks.length > 0 && (
                <button onClick={() => onNavigate('training')} className="text-[#17cf54] text-sm font-semibold hover:underline flex items-center gap-1">
                  {t('view_full_plan')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
            {todayTraining.blocks.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayTraining.blocks.map((block: any, bIdx: number) => (
                  <div key={bIdx} className="p-4">
                    {/* Block Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{block.name}</h3>
                        <p className="text-[11px] text-slate-400">{block.exercises?.length || 0} {t('exercises')}</p>
                      </div>
                    </div>
                    {/* Exercise list */}
                    <div className="ml-11 space-y-2">
                       {(block.exercises || []).slice(0, 4).map((ex: any, eIdx: number) => (
                        <div key={eIdx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-indigo-400 rounded-full"></div>
                            <span className="text-sm text-slate-700 dark:text-slate-200">{ex.name || ex.exerciseName || t('exercise')}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            {ex.sets || '—'}×{ex.reps || ex.repRange || '—'}
                          </span>
                        </div>
                      ))}
                      {(block.exercises || []).length > 4 && (
                        <p className="text-[11px] text-slate-400 pl-4">+ {(block.exercises.length - 4)} {t('more', { defaultValue: 'más' })} {t('exercises')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-300">event_busy</span>
                </div>
                <p className="text-slate-400 text-sm">{t('rest_day')}</p>
                <button onClick={() => onNavigate('training')} className="mt-3 text-[#17cf54] text-sm font-semibold hover:underline">{t('view_training_schedule')}</button>
              </div>
            )}
          </div>

          {/* Meals Today */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('meals_today')}</h2>
                {todayMeals.length > 0 && (
                  <p className="text-sm text-slate-500 mt-0.5">{t('meal_count', { count: todayMeals.length, defaultValue: `${todayMeals.length} comidas` })} • {Math.round(todayMeals.reduce((a: number, m: any) => a + (m.items || []).reduce((s: number, i: any) => s + ((i.calories || 0) * (i.multiplier || i.quantity || 1)), 0), 0))} {t('kcal_total')}</p>
                )}
              </div>
              {todayMeals.length > 0 && (
                <button onClick={() => onNavigate('nutrition')} className="text-[#17cf54] text-sm font-semibold hover:underline flex items-center gap-1">
                  {t('view_full_plan')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
            {todayMeals.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayMeals.map((meal: any, idx: number) => {
                  const isNext = meal.name === nextMeal?.name && meal.time === nextMeal?.time;
                  const mealKcal = Math.round((meal.items || []).reduce((a: number, i: any) => a + ((i.calories || 0) * (i.multiplier || i.quantity || 1)), 0));
                  const mealProtein = Math.round((meal.items || []).reduce((a: number, i: any) => a + ((i.protein || 0) * (i.multiplier || i.quantity || 1)), 0));
                  return (
                    <div key={idx} className={`p-4 ${isNext ? 'bg-[#17cf54]/5' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isNext ? 'bg-[#17cf54]/20 text-[#17cf54]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <span className="material-symbols-outlined text-[18px]">{meal.iconName === 'Sunrise' ? 'wb_twilight' : meal.iconName === 'Sun' ? 'sunny' : meal.iconName === 'Moon' ? 'dark_mode' : 'restaurant'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                              {meal.name}
                              {isNext && <span className="text-[10px] bg-[#17cf54] text-white px-2 py-0.5 rounded-full uppercase tracking-tight font-bold">{t('next_up')}</span>}
                            </h4>
                            <p className="text-[11px] text-slate-400">{meal.time} • {mealKcal} kcal • {mealProtein}{t('grams_protein_short', { defaultValue: 'g prot.' })}</p>
                          </div>
                        </div>
                      </div>
                      {/* Item previews */}
                      <div className="ml-11 space-y-1.5">
                        {(meal.items || []).slice(0, 3).map((item: any, iIdx: number) => (
                          <div key={iIdx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-5 rounded-full ${isNext ? 'bg-[#17cf54]' : 'bg-emerald-400'}`}></div>
                              <span className="text-xs text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{Math.round((item.quantity || 1) * 100) / 100} {t('units')}</span>
                          </div>
                        ))}
                        {(meal.items || []).length > 3 && (
                          <p className="text-[10px] text-slate-400 pl-3">{t('more_items_count', { count: meal.items.length - 3 })}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-300">no_meals</span>
                </div>
                <p className="text-slate-400 text-sm">{t('no_meals_defined')}</p>
                <button onClick={() => onNavigate('nutrition')} className="mt-3 text-[#17cf54] text-sm font-semibold hover:underline">{t('view_nutrition_plan')}</button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Weekly Adherence */}
          <div className="bg-[#17cf54] p-6 rounded-xl text-white shadow-lg shadow-[#17cf54]/20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-semibold opacity-90 mb-4">{t('weekly_adherence')}</h2>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold">{adherence}%</span>
                <span className="text-sm pb-2 opacity-80">{t('based_on_last_4_weeks', { defaultValue: 'Según tus check-ins de las últimas 4 semanas' })}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                   const d = new Date();
                   d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1) + i);
                   const isPast = d <= new Date();
                   const hasCheckIn = (checkIns || []).some(c => c.date?.split('T')[0] === d.toISOString().split('T')[0]);
                   // Inicial del día según el idioma (L-M-X-J-V-S-D en es).
                   const dayInitial = d.toLocaleDateString(locale, { weekday: 'narrow' }).toUpperCase();
                   return (
                     <div key={i} className={`h-10 rounded flex flex-col items-center justify-center font-bold text-[10px] ${hasCheckIn ? 'bg-white text-[#17cf54]' : isPast ? 'bg-white/10 text-white/50' : 'bg-black/10 text-white/30'}`}>
                        {dayInitial}
                        {hasCheckIn && <span className="material-symbols-outlined text-[10px]">check</span>}
                     </div>
                   );
                })}
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Current Streak */}
          <div className="bg-white dark:bg-[#112116] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[#17cf54] font-bold">local_fire_department</span>
              </div>
              <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                <circle className="text-[#17cf54]" cx="40" cy="40" fill="transparent" r="38" stroke="currentColor" strokeDasharray="238" strokeDashoffset={238 - (238 * Math.min(streak, 30) / 30)} strokeWidth="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('current_streak')}</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{streak} {streak === 1 ? t('day') : t('days')}</p>
              <p className="text-xs text-slate-400 mt-1">{streak > 0 ? t('keep_it_up') : t('start_journey_today')}</p>
            </div>
          </div>

          {/* Onboarding feedback — only renders when the coach has
              reviewed the most recent onboarding submission and left
              a note. Disappears once read/acknowledged-on-server-side. */}
          {onboardingFeedback && (
            <div className="bg-[#17cf54]/5 dark:bg-emerald-900/20 rounded-xl border border-[#17cf54]/30 dark:border-emerald-800/40 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#17cf54] flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[20px]">rate_review</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('onboarding_feedback_title', { defaultValue: 'Tu coach ha revisado tu onboarding' })}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    {new Date(onboardingFeedback.reviewed_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {onboardingFeedback.coach_notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coach Notes */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('coach_notes')}</h2>
            </div>
            <div className="p-6 space-y-6">
              {messages.length > 0 ? messages.slice(0, 3).map((msg: any, idx: number) => (
                <div key={idx} className={`relative pl-6 border-l-2 ${idx === 0 ? 'border-[#17cf54]/30' : 'border-slate-100 dark:border-slate-800'} ${idx < 2 ? 'pb-6' : ''}`}>
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${idx === 0 ? 'bg-[#17cf54]' : 'bg-slate-300 dark:bg-slate-700'} border-2 border-white dark:border-[#112116]`}></div>
                  <div className="mb-1 flex justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase shrink-0 ${idx === 0 ? 'text-[#17cf54]' : 'text-slate-400'}`}>
                       {new Date(msg.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{new Date(msg.created_at).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{msg.content}"
                  </p>
                </div>
              )) : (
                <div className="text-center py-8">
                   <p className="text-slate-400 text-sm">{t('no_coach_notes')}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => onNavigate('messages')} className="w-full py-2 text-sm font-semibold text-[#17cf54] hover:bg-[#17cf54]/5 rounded-lg transition-colors">
                {t('open_messenger')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
