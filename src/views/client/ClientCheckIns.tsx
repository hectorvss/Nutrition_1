import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ClientCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCheckIns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/client/check-ins');
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      <div className="p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <span className="text-slate-500">Check-ins</span>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.email?.split('@')[0] || 'Client'}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.email || 'client'}&background=random")` }}></div>
            <div className="absolute -bottom-1 -right-1 bg-[#17cf54] w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.email?.split('@')[0] || 'Client'}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span> Goal: Fat Loss
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span> Active Client
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl border border-amber-500/20 dark:border-amber-500/30">
            <div className="text-xs text-amber-600 dark:text-amber-500 uppercase tracking-wide font-semibold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Action Required
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 pt-2">
        <div className="flex flex-col gap-8 pb-20">
          
          {/* Top Action Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 md:p-8 flex-shrink-0 w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">fact_check</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl">Weekly Check-in</h3>
                    <p className="text-sm text-amber-500 font-bold uppercase tracking-widest mt-0.5">Next review due today</p>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-2 mt-4 max-w-xl">
                  Complete your weekly check-in to keep your coach updated on your progress, biofeedback, and adherence.
                </p>
              </div>
              <button 
                onClick={() => console.log('Start check-in flow triggered')}
                className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#17cf54]/20 flex items-center gap-3 font-bold text-base w-full md:w-auto justify-center shrink-0"
              >
                <span>Start Check-in</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Check-in History</h4>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            </div>

            {checkIns.length > 0 ? (
              checkIns.map((ci, index) => {
                const isPending = index === 0;
                return (
                  <div key={ci.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#17cf54]/30 transition-all shadow-sm mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`size-12 flex items-center justify-center rounded-xl shrink-0 ${isPending ? 'bg-slate-50 dark:bg-slate-800 text-slate-400' : 'bg-[#17cf54]/10 text-[#17cf54]'}`}>
                        <span className={`material-symbols-outlined ${isPending ? '' : 'fill-1'}`}>{isPending ? 'pending_actions' : 'task_alt'}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100">
                          Check-in: {new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </h5>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">scale</span> {ci.data_json?.weight}kg
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">checklist</span> {ci.data_json?.workout_completion}% Adherence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-[#17cf54]/10 text-[#17cf54]'}`}>
                        {isPending ? 'Pending' : 'Reviewed'}
                      </span>
                      <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">history</span>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No check-ins yet</p>
              </div>
            )}
            
            {/* Static Baseline Row */}
            <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500">
                  <span className="material-symbols-outlined">flag</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-600 dark:text-slate-300">Baseline Assessment</h5>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">scale</span> 85.2kg
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> Oct 12, 2023
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  Completed
                </span>
                <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
