import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';
import WeeklyCheckinFlow from './WeeklyCheckinFlow';

export default function ClientCheckIns() {
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
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

  if (isCheckingIn) {
    return <WeeklyCheckinFlow onComplete={() => setIsCheckingIn(false)} onCancel={() => setIsCheckingIn(false)} />;
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
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-semibold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 pt-2">
        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative">
            <button className="relative px-6 py-2 rounded-lg text-sm font-semibold transition-all z-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">
              Check-in View
            </button>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button className="p-2 text-slate-400 hover:text-[#17cf54] transition-colors"><span className="material-symbols-outlined">print</span></button>
            <button className="p-2 text-slate-400 hover:text-[#17cf54] transition-colors"><span className="material-symbols-outlined">share</span></button>
            <button 
              onClick={() => setIsCheckingIn(true)}
              className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> New Check-in
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Check-in Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Check-in Overview</h3>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md uppercase">Next review due</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#17cf54]"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Total</p>
                    <p className="text-xs text-slate-400">All check-ins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{checkIns.length}</p>
                  <p className="text-xs text-slate-400">Submitted</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Latest</p>
                    <p className="text-xs text-slate-400">Most recent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{checkIns.length > 0 ? new Date(checkIns[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</p>
                  <p className="text-xs text-slate-400">Date</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Adherence</p>
                    <p className="text-xs text-slate-400">Last 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {(() => {
                      let count = 0;
                      for (let i = 0; i < 7; i++) {
                        const d = new Date(); d.setDate(d.getDate() - i);
                        if (checkIns.some(c => c.date.split('T')[0] === d.toISOString().split('T')[0])) count++;
                      }
                      return checkIns.length > 0 ? Math.round((count / 7) * 100) + '%' : '—';
                    })()}
                  </p>
                  <p className="text-xs text-slate-400">Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Check-in History</h2>
                <p className="text-sm text-slate-500">{checkIns.length} entries • Most recent first</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {checkIns.length > 0 ? checkIns.map((ci: any, idx: number) => (
                <div key={ci.id} className="group border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-[#17cf54]/10 text-[#17cf54]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className={`material-symbols-outlined ${idx === 0 ? '' : ''}`}>{idx === 0 ? 'pending_actions' : 'task_alt'}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                          Check-in: {new Date(ci.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {new Date(ci.created_at || ci.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{ci.data_json?.weight ? ci.data_json.weight + 'kg' : 'Weekly Review'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-[#17cf54]/10 text-[#17cf54]'}`}>
                        {idx === 0 ? 'Pending' : 'Reviewed'}
                      </span>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">more_vert</span></button>
                    </div>
                  </div>
                  {/* Summary data row */}
                  {ci.data_json && (
                    <div className="mt-4 pl-[68px] grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ci.data_json.overallFeeling && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Feeling</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.data_json.overallFeeling}</p>
                          </div>
                        </div>
                      )}
                      {ci.data_json.nutritionAdherence && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Nutrition</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.data_json.nutritionAdherence}</p>
                          </div>
                        </div>
                      )}
                      {ci.data_json.trainingAdherence && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Training</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.data_json.trainingAdherence}</p>
                          </div>
                        </div>
                      )}
                      {ci.data_json.sleepQuality && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Sleep</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.data_json.sleepQuality}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-300">history</span>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No check-ins yet</p>
                  <p className="text-sm text-slate-400 mt-2">Start your first check-in to see your progress here.</p>
                </div>
              )}

              {/* Baseline Row */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 p-3 rounded-xl">
                      <span className="material-symbols-outlined">flag</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-600 dark:text-slate-300 text-lg">Baseline Assessment</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">scale</span> 85.2kg</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Oct 12, 2023</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      Completed
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">more_vert</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
