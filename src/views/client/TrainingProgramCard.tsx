import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TrainingProgramCard = ({ program }: { program: any }) => {
  const { t } = useLanguage();
  // Hooks must run unconditionally — declared before any early return.
  const [selectedDay, setSelectedDay] = useState('monday');

  if (!program) return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
      <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('no_training_program_assigned')}</p>
    </div>
  );

  const data = program.data_json || {};
  const isWeekly = !!data.weeklySchedule;

  let blocks = [];
  let workoutName = '';

  if (isWeekly) {
    const workoutId = data.weeklySchedule?.[selectedDay];
    const workout = (data.workouts || []).find((w: any) => w.id === workoutId);
    blocks = workout?.blocks || [];
    workoutName = workout?.name || t('rest_day_label');
  } else {
    blocks = data.blocks || [];
    workoutName = program.name || t('training_session');
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('active_training_program')}</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{program.name || t('custom_routine')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">{t('live_label')}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isWeekly && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex-1 min-w-[50px] ${
                  selectedDay === d
                    ? 'bg-emerald-500 text-white shadow-sm border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{workoutName}</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{blocks.length} Blocks</p>
        </div>

        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-3xl mb-2">self_improvement</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('rest_recovery_day')}</p>
            </div>
          ) : (
            blocks.slice(0, 3).map((block: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-blue-500">{block.icon || 'fitness_center'}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{block.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.exercises?.length || 0} Exercises</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-7">
                  {(block.exercises || []).slice(0, 4).map((ex: any, exIdx: number) => (
                    <span key={exIdx} className="text-[8px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 uppercase tracking-tighter truncate max-w-[100px]">
                      {ex.name}
                    </span>
                  ))}
                  {(block.exercises || []).length > 4 && <span className="text-[8px] font-bold text-slate-400">{t('more_count_compact', { count: block.exercises.length - 4 })}</span>}
                </div>
              </div>
            ))
          )}
          {blocks.length > 3 && (
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{t('more_blocks_count', { count: blocks.length - 3 })}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramCard;
