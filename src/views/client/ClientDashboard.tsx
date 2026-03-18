import React, { useState, useEffect } from 'react';
import { ClientView } from '../../ClientApp';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ClientDashboardProps {
  onNavigate: (view: ClientView) => void;
}

export default function ClientDashboard({ onNavigate }: ClientDashboardProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPlans = async () => {
      try {
        const data = await fetchWithAuth('/client/plans');
        setPlans(data);
      } catch (err) {
        console.error('Error fetching dashboard plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  const nutritionPlan = plans?.nutrition?.[0];
  const trainingProgram = plans?.training?.[0];
  const meals = nutritionPlan?.data_json?.meals || [];
  const trainingBlocks = trainingProgram?.data_json?.blocks || [];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Good morning, {user?.email.split('@')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div 
            className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-[#17cf54]/20" 
            style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.email}&background=random")` }}
          />
        </div>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0">
            <span className="material-symbols-outlined">edit_note</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Log Check-in</span>
        </button>
        <button 
          onClick={() => onNavigate('nutrition')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0">
            <span className="material-symbols-outlined">restaurant_menu</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">View Meals</span>
        </button>
        <button 
          onClick={() => onNavigate('training')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0">
            <span className="material-symbols-outlined">play_circle</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Start Workout</span>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#17cf54]/50 transition-all group shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] group-hover:bg-[#17cf54] group-hover:text-white transition-colors shrink-0">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Message Coach</span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Plan */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Plan</h2>
              <span className="text-[#17cf54] text-sm font-medium">{trainingBlocks.length} blocks left</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {trainingBlocks.length > 0 ? trainingBlocks.map((block: any, idx: number) => (
                <label key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${block.iconBg?.replace('text-', 'bg-').split(' ')[0].replace('/20', '') || 'bg-blue-50'} flex items-center justify-center text-blue-600 shrink-0`}>
                    <span className="material-symbols-outlined">{block.icon || 'fitness_center'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{block.name}</h3>
                    <p className="text-sm text-slate-500">{block.exercises?.length || 0} Exercises • {block.subtitle}</p>
                  </div>
                  <input className="w-6 h-6 rounded border-slate-300 text-[#17cf54] focus:ring-[#17cf54]" type="checkbox" />
                </label>
              )) : (
                <div className="p-8 text-center text-slate-400 text-sm">No exercises planned for today</div>
              )}
            </div>
          </div>

          {/* Meals Today Timeline */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meals Today</h2>
            </div>
            <div className="p-6 relative">
              <div className="absolute left-[34px] top-6 bottom-6 w-px bg-slate-100 dark:bg-slate-800"></div>
              <div className="space-y-8 relative">
                {meals.length > 0 ? meals.map((meal: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className={`w-6 h-6 mt-[2px] rounded-full ${idx === 0 ? 'bg-[#17cf54]' : 'bg-slate-200 dark:bg-slate-700'} border-4 border-white dark:border-[#112116] shadow-sm z-10 shrink-0`}></div>
                    <div className={`flex-1 ${idx === 0 ? '' : 'opacity-60'}`}>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{meal.name}</h4>
                          <p className="text-sm text-slate-500">{(meal.items || []).map((i: any) => i.name).join(', ')}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">{meal.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">
                          {Math.round((meal.items || []).reduce((a: number, i: any) => a + (i.calories * i.quantity), 0))} kcal
                        </span>
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">
                          {Math.round((meal.items || []).reduce((a: number, i: any) => a + (i.protein * i.quantity), 0))}g Protein
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400 text-sm">No meals logged for today</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Weekly Adherence */}
          <div className="bg-[#17cf54] p-6 rounded-xl text-white shadow-lg shadow-[#17cf54]/20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-semibold opacity-90 mb-4">Weekly Adherence</h2>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold">94%</span>
                <span className="text-sm pb-2 opacity-80">+2% from last week</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                  <div key={i} className="h-10 bg-white/20 rounded flex items-center justify-center font-bold text-xs">{day}</div>
                ))}
                {['S', 'S'].map((day, i) => (
                  <div key={i + 5} className="h-10 bg-white/10 rounded flex items-center justify-center font-bold text-xs opacity-50">{day}</div>
                ))}
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
                <circle className="text-[#17cf54]" cx="40" cy="40" fill="transparent" r="38" stroke="currentColor" strokeDasharray="238" strokeDashoffset="60" strokeWidth="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Streak</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-white">12 Days</p>
              <p className="text-xs text-slate-400 mt-1">3 days to next milestone</p>
            </div>
          </div>

          {/* Coach Notes */}
          <div className="bg-white dark:bg-[#112116] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coach Notes</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="relative pl-6 border-l-2 border-[#17cf54]/30 pb-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#17cf54] border-2 border-white dark:border-[#112116]"></div>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="text-xs font-bold text-[#17cf54] uppercase shrink-0">Yesterday</span>
                  <span className="text-xs text-slate-400">4:30 PM</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  "Great form on those squats, Sarah! Let's try to increase the weight by 2.5kg for the next session if you feel confident."
                </p>
              </div>
              
              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-[#112116]"></div>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Oct 20</span>
                  <span className="text-xs text-slate-400">10:15 AM</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "Your recovery metrics look excellent. Keep the sleep routine consistent."
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
              <button className="w-full py-2 text-sm font-semibold text-[#17cf54] hover:bg-[#17cf54]/5 rounded-lg transition-colors">
                View all notes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
