import React from 'react';

export default function ClientCheckIns() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 bg-[#f6f8f6] dark:bg-[#112116] min-h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Your Check-ins</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Consistency is the key to your transformation. Keep it up!</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">help</span>
            Need Help?
          </button>
        </header>

        {/* Top Action Card */}
        <section className="relative overflow-hidden dark:bg-slate-900/50 rounded-2xl shadow-xl p-8 group bg-white border border-slate-100 dark:border-slate-800">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-64 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden shadow-2xl rotate-2">
              <img 
                alt="Fitness tracking" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
              />
            </div>
            <div className="flex-1 text-slate-900 dark:text-slate-100">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-[#17cf54] text-white">Action Required</span>
              <h3 className="text-2xl font-bold mb-2 leading-tight">Next review due today</h3>
              <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">Complete your weekly check-in to keep your coach updated on your progress and receive your updated plan for next week.</p>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#17cf54] text-white font-bold hover:bg-[#15b84a] transition-all transform active:scale-95 shadow-lg shadow-[#17cf54]/20">
                Start Check-in
                <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* History List */}
        <section className="space-y-4 pb-12">
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

          {/* Row: Week 8 */}
          <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#17cf54]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="size-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 shrink-0">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100">Week 8 Check-in</h5>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">scale</span> 82.5kg
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">checklist</span> 95% Adherence
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Pending
              </span>
              <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Row: Week 7 */}
          <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#17cf54]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="size-12 flex items-center justify-center rounded-xl bg-[#17cf54]/10 text-[#17cf54] shrink-0">
                <span className="material-symbols-outlined fill-1">task_alt</span>
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100">Week 7 Check-in</h5>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">scale</span> 83.1kg
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">checklist</span> 92% Adherence
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#17cf54]/10 text-[#17cf54]">
                Reviewed
              </span>
              <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Row: Week 6 */}
          <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#17cf54]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="size-12 flex items-center justify-center rounded-xl bg-[#17cf54]/10 text-[#17cf54] shrink-0">
                <span className="material-symbols-outlined fill-1">task_alt</span>
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100">Week 6 Check-in</h5>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">scale</span> 83.8kg
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">checklist</span> 88% Adherence
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#17cf54]/10 text-[#17cf54]">
                Reviewed
              </span>
              <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Row: Baseline */}
          <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="size-12 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 shrink-0">
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
        </section>
      </div>
    </div>
  );
}
