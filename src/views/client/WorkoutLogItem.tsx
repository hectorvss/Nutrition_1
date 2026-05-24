import React, { useState, useEffect } from 'react';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WorkoutLogItemProps {
  workout: any;
  isExpanded: boolean;
  onToggle: (id: string | null) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, isExpanded, onToggle, onUpdate }) => {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setExercises(workout.exercises || []);
  }, [workout.exercises]);

  const updateSet = (exIdx: number, sIdx: number, field: string, value: string) => {
    const newExs = [...exercises];
    const newSets = [...newExs[exIdx].sets_logged];
    newSets[sIdx] = { ...newSets[sIdx], [field]: value };
    newExs[exIdx] = { ...newExs[exIdx], sets_logged: newSets };
    setExercises(newExs);
  };

  const updateNotes = (exIdx: number, value: string) => {
    const newExs = [...exercises];
    newExs[exIdx] = { ...newExs[exIdx], notes: value };
    setExercises(newExs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(workout.id, { exercises });
    setIsSaving(false);
    onToggle(null);
  };

  return (
    <div className="flex flex-col border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all text-left">
      <div
        onClick={() => onToggle(isExpanded ? null : workout.id)}
        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3 font-bold">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-900 dark:text-white">{workout.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{new Date(workout.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
             <p className="text-xs font-bold text-slate-900 dark:text-white">{workout.volume.toLocaleString()} kg</p>
             <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">RPE {workout.rpe}</p>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-90 text-emerald-500' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-8 animate-in slide-in-from-top-2 duration-200">
          {exercises.map((ex: any, exIdx: number) => (
            <div key={exIdx} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">drag_handle</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ex.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ex.muscle_group || t('target_muscles')}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">edit_note</span>
                  {t('client_log')}
                </span>
              </div>

              <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                    <div>{t('set_label')}</div><div>{t('weight')}</div><div>{t('reps_label')}</div><div>{t('rir_label')}</div>
                  </div>
                  {ex.sets_logged?.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="grid grid-cols-4 gap-2">
                      <div className="h-10 flex items-center justify-center text-xs font-bold text-slate-300">#{sIdx+1}</div>
                      <input
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                        value={s.weight}
                        onChange={(e) => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                      />
                      <input
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                        value={s.reps}
                        onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                      />
                      <input
                        className="h-10 text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                        value={s.rir}
                        onChange={(e) => updateSet(exIdx, sIdx, 'rir', e.target.value)}
                      />
                    </div>
                  ))}
                  {(!ex.sets_logged || ex.sets_logged.length === 0) && (
                    <p className="text-center text-xs text-slate-400 italic py-2">{t('no_sets_logged')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">{t('notes_sensations')}</label>
                  <textarea
                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[100px] text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed shadow-sm italic outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder={t('notes_placeholder')}
                    value={ex.notes || ""}
                    onChange={(e) => updateNotes(exIdx, e.target.value)}
                  />
                </div>
              </div>
              {exIdx < exercises.length - 1 && <hr className="border-slate-100 dark:border-slate-800/50 my-6" />}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-95'}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {isSaving ? t('saving') : t('save_session_log')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogItem;
