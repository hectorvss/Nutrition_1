import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ClientNutrition() {
  const [mode, setMode] = useState<'general' | 'example'>('general');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyPlans = async () => {
      try {
        const data = await fetchWithAuth('/client/plans');
        if (data && data.nutrition && data.nutrition.length > 0) {
          // Take the first active plan
          const plan = data.nutrition[0];
          setNutritionPlan(plan);
          if (plan.data_json?.mode) setMode(plan.data_json.mode);
        }
      } catch (err) {
        console.error('Error fetching client plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <span className="material-symbols-outlined text-4xl">no_meals</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes un plan de nutrición asignado</h2>
        <p className="text-slate-500 max-w-sm">Tu coach aún no ha publicado tu plan. Una vez asignado, lo verás disponible aquí.</p>
      </div>
    );
  }

  const isWeekly = nutritionPlan.data_json?.type === 'weekly';
  const meals = isWeekly 
    ? (nutritionPlan.data_json?.days?.[selectedDay]?.meals || []) 
    : (nutritionPlan.data_json?.meals || []);

  const totalCalories = meals.reduce((acc: number, m: any) => 
    acc + (m.items || []).reduce((a: number, i: any) => a + (i.calories * i.quantity), 0), 0
  );
  const totalProtein = meals.reduce((acc: number, m: any) => 
    acc + (m.items || []).reduce((a: number, i: any) => a + (i.protein * i.quantity), 0), 0
  );
  const totalCarbs = meals.reduce((acc: number, m: any) => 
    acc + (m.items || []).reduce((a: number, i: any) => a + (i.carbs * i.quantity), 0), 0
  );
  const totalFats = meals.reduce((acc: number, m: any) => 
    acc + (m.items || []).reduce((a: number, i: any) => a + (i.fats * i.quantity), 0), 0
  );

  const renderDaySelector = () => {
    if (!isWeekly) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-2">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedDay === d 
                ? 'bg-[#17cf54] text-white shadow-md shadow-[#17cf54]/20' 
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  const renderGeneralMode = () => (
    <div className="flex-1 flex flex-col gap-6">
      {/* Macro Totals */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Daily Macro Totals</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md uppercase">On Track</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-slate-100 dark:stroke-slate-800" cx="50" cy="50" fill="transparent" r="40" strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray="80 171" strokeDashoffset="0" strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#22c55e" strokeDasharray="100 151" strokeDashoffset="-85" strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#eab308" strokeDasharray="71 180" strokeDashoffset="-185" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Protein</p>
                  <p className="text-xs text-slate-400">30% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalProtein)}g</p>
                <p className="text-xs text-slate-400">Target</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Carbs</p>
                  <p className="text-xs text-slate-400">40% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalCarbs)}g</p>
                <p className="text-xs text-slate-400">Target</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Fats</p>
                  <p className="text-xs text-slate-400">30% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalFats)}g</p>
                <p className="text-xs text-slate-400">Target</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Structure */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Structure</h2>
            <p className="text-sm text-slate-500">{meals.length} meals • {Math.round(totalCalories)} kcal target</p>
          </div>
          <button className="text-[#17cf54] text-sm font-semibold hover:underline">
            + Add Meal Block
          </button>
        </div>
        <div className="p-6 space-y-4">
          {meals.map((m: any, idx: number) => (
            <MealBlock 
              key={idx}
              title={m.name} 
              time={m.time} 
              kcal={Math.round((m.items || []).reduce((a: number, i: any) => a + (i.calories * i.quantity), 0))} 
              icon={m.iconName === 'Sunrise' ? 'wb_twilight' : m.iconName === 'Sun' ? 'sunny' : m.iconName === 'Moon' ? 'dark_mode' : 'restaurant'} 
              iconBg={m.iconColor || "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}
              macros={(m.categories || []).map((c: any) => ({
                label: c.label,
                sub: c.example,
                value: `${c.amount}g`,
                color: c.color
              }))}
            />
          ))}
        </div>
      </div>

      {/* Foods to Avoid */}
      <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Foods to Avoid</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Strict Restrictions</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
        <div className="space-y-3">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
            <span className="material-symbols-outlined text-rose-500">cancel</span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Deep Fried Foods</p>
              <p className="text-xs text-slate-500">High inflammatory oils</p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
            <span className="material-symbols-outlined text-rose-500">cancel</span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Added Sugars &gt; 25g</p>
              <p className="text-xs text-slate-500">Soda, candy, pastries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExampleMode = () => (
    <div className="flex-1 flex flex-col gap-6">
      {/* Macro Totals (Same as General) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Daily Macro Totals</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md uppercase">On Track</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-slate-100 dark:stroke-slate-800" cx="50" cy="50" fill="transparent" r="40" strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray={`${(totalProtein*4/totalCalories)*251} 251`} strokeDashoffset="0" strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#22c55e" strokeDasharray={`${(totalCarbs*4/totalCalories)*251} 251`} strokeDashoffset={`-${(totalProtein*4/totalCalories)*251}`} strokeWidth="12" />
              <circle className="drop-shadow-sm" cx="50" cy="50" fill="transparent" r="40" stroke="#eab308" strokeDasharray={`${(totalFats*9/totalCalories)*251} 251`} strokeDashoffset={`-${((totalProtein*4+totalCarbs*4)/totalCalories)*251}`} strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Protein</p>
                  <p className="text-xs text-slate-400">{totalCalories > 0 ? Math.round((totalProtein*4/totalCalories)*100) : 0}% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalProtein)}g</p>
                <p className="text-xs text-slate-400">Planned</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Carbs</p>
                  <p className="text-xs text-slate-400">{totalCalories > 0 ? Math.round((totalCarbs*4/totalCalories)*100) : 0}% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalCarbs)}g</p>
                <p className="text-xs text-slate-400">Planned</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Fats</p>
                  <p className="text-xs text-slate-400">{totalCalories > 0 ? Math.round((totalFats*9/totalCalories)*100) : 0}% target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(totalFats)}g</p>
                <p className="text-xs text-slate-400">Planned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Structure with Examples */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Structure</h2>
            <p className="text-sm text-slate-500">{meals.length} meals • Example Items</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {meals.map((m: any, idx: number) => (
            <ExampleMealBlock 
              key={idx}
              title={m.name} 
              time={m.time} 
              kcal={Math.round((m.items || []).reduce((a: number, i: any) => a + (i.calories * i.quantity), 0))} 
              icon={m.iconName === 'Sunrise' ? 'wb_twilight' : m.iconName === 'Sun' ? 'sunny' : m.iconName === 'Moon' ? 'dark_mode' : 'restaurant'} 
              iconBg={m.iconColor || "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}
              items={(m.items || []).map((i: any) => ({
                name: i.name,
                sub: `${i.servingSize} × ${i.quantity}`,
                kcal: Math.round(i.calories * i.quantity),
                amount: `${Math.round(i.quantity * 100) / 100} units`,
                img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
              }))}
            />
          ))}
        </div>
      </div>

       {/* Foods to Avoid (Same as General) */}
       <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Foods to Avoid</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Strict Restrictions</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
        <div className="space-y-3">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
            <span className="material-symbols-outlined text-rose-500">cancel</span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Deep Fried Foods</p>
              <p className="text-xs text-slate-500">High inflammatory oils</p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
            <span className="material-symbols-outlined text-rose-500">cancel</span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Added Sugars &gt; 25g</p>
              <p className="text-xs text-slate-500">Soda, candy, pastries</p>
            </div>
          </div>
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
              <span className="text-slate-500">Nutrition</span>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.email.split('@')[0]}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.email}&background=random")` }}></div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.email.split('@')[0]}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span> Goal: Fat Loss
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">female</span> Client
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-semibold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Plan
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 pt-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative">
            <button 
              onClick={() => setMode('general')}
              className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-all z-10 ${mode === 'general' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              General Mode
            </button>
            <button 
              onClick={() => setMode('example')}
              className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-all z-10 ${mode === 'example' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              Example Mode
            </button>
          </div>
          <div className="flex gap-2 pr-2">
            <button className="p-2 text-slate-400 hover:text-[#17cf54] transition-colors"><span className="material-symbols-outlined">print</span></button>
            <button className="p-2 text-slate-400 hover:text-[#17cf54] transition-colors"><span className="material-symbols-outlined">share</span></button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit
            </button>
          </div>
        </div>

        {renderDaySelector()}
        {mode === 'general' ? renderGeneralMode() : renderExampleMode()}
      </div>
    </div>
  );
}

function MealBlock({ title, time, kcal, icon, iconBg, macros }: any) {
  return (
    <div className="group border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`${iconBg} p-3 rounded-xl`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {time}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{kcal} kcal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#17cf54] hover:text-[#17cf54] transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-orange-500">local_fire_department</span> View Macros
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
      </div>
      <div className="pl-[68px] space-y-3">
        {macros.map((m: any, i: number) => (
          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-3">
            <div className={`w-1.5 h-8 ${m.color} rounded-full`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.label}</p>
              <p className="text-xs text-slate-500">{m.sub}</p>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExampleMealBlock({ title, time, kcal, icon, iconBg, items }: any) {
  return (
    <div className="group border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`${iconBg} p-3 rounded-xl`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {time}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{kcal} kcal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
      </div>
      <div className="pl-[68px] space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="p-2 pr-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow group/item">
            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.amount || 'Serving'}</span>
              <span className="block text-[10px] text-slate-400">{item.kcal} kcal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
