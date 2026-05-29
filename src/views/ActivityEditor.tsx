import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

interface ActivityEditorProps {
  onBack: () => void;
  activityName?: string;
}

interface SetRow {
  id: number;
  reps: string;
  weight: string;
  rpe: string;
  rest: string;
  warmup: boolean;
}

const PRESCRIPTION_PRESETS: Record<string, { reps: string; rest: string }> = {
  hypertrophy: { reps: '10', rest: '90s' },
  strength: { reps: '5', rest: '180s' },
  endurance: { reps: '15', rest: '45s' },
};

export default function ActivityEditor({ onBack, activityName = '' }: ActivityEditorProps) {
  const { t } = useLanguage();

  const [name, setName] = useState(activityName);
  const [videoUrl, setVideoUrl] = useState('');
  const [muscleGroup, setMuscleGroup] = useState(t('legs_quadriceps'));
  const [equipment, setEquipment] = useState(t('dumbbells'));
  const [preset, setPreset] = useState<'hypertrophy' | 'strength' | 'endurance'>('hypertrophy');
  const [notes, setNotes] = useState('');
  const [sets, setSets] = useState<SetRow[]>([
    { id: 1, reps: '10', weight: '', rpe: '7', rest: '90s', warmup: true },
  ]);

  const updateSet = (id: number, patch: Partial<SetRow>) => {
    setSets(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };
  const addSet = () => {
    setSets(prev => [
      ...prev,
      { id: (prev[prev.length - 1]?.id || 0) + 1, reps: PRESCRIPTION_PRESETS[preset].reps, weight: '', rpe: '8', rest: PRESCRIPTION_PRESETS[preset].rest, warmup: false },
    ]);
  };
  const removeSet = (id: number) => {
    setSets(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev));
  };
  const applyPreset = (key: 'hypertrophy' | 'strength' | 'endurance') => {
    setPreset(key);
    const p = PRESCRIPTION_PRESETS[key];
    setSets(prev => prev.map(s => ({ ...s, reps: p.reps, rest: p.rest })));
  };
  const resetPrescription = () => {
    setPreset('hypertrophy');
    setSets([{ id: 1, reps: '10', weight: '', rpe: '7', rest: '90s', warmup: true }]);
  };
  const openVideo = () => {
    if (videoUrl.trim()) window.open(videoUrl.trim(), '_blank', 'noopener,noreferrer');
  };

  const presetCards: { key: 'hypertrophy' | 'strength' | 'endurance'; label: string; scheme: string }[] = [
    { key: 'hypertrophy', label: t('training_phase_hypertrophy'), scheme: '3 x 10-12' },
    { key: 'strength', label: t('strength'), scheme: '5 x 5' },
    { key: 'endurance', label: t('endurance'), scheme: '3 x 15+' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="bg-white dark:bg-slate-900 w-full rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col h-auto min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{t('edit_activity')}</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{name || t('activity_name')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onBack}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">check</span>
                {t('update_activity')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="p-8 overflow-y-auto space-y-10 h-full scrollbar-hide">
              {/* General Information */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">info</span>
                  {t('general_information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">{t('activity_name')}</label>
                    <div className="relative">
                      <input
                        className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      {name.trim() && (
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">check_circle</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">{t('muscle_group')}</label>
                    <div className="relative">
                      <Select
                        value={muscleGroup}
                        onChange={(v) => setMuscleGroup(v)}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                      >
                        <option>{t('legs_quadriceps')}</option>
                        <option>{t('legs_hamstrings')}</option>
                        <option>{t('glutes')}</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">{t('equipment')}</label>
                    <div className="relative">
                      <Select
                        value={equipment}
                        onChange={(v) => setEquipment(v)}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                      >
                        <option>{t('dumbbells')}</option>
                        <option>{t('barbell')}</option>
                        <option>{t('bodyweight')}</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Video & Media */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">video_library</span>
                  {t('video_media')}
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
                      placeholder={t('paste_video_link')}
                      type="text"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                  </div>
                  <div className="relative w-full aspect-video rounded-3xl bg-slate-900 overflow-hidden group shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {videoUrl.trim() ? (
                      <button
                        onClick={openVideo}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all shadow-2xl"
                      >
                        <span className="material-symbols-outlined text-white text-[40px] ml-1">play_arrow</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-[40px]">videocam_off</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('paste_video_link')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Prescription */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">tune</span>
                    {t('prescription')}
                  </h3>
                  <button
                    onClick={resetPrescription}
                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-widest"
                  >
                    {t('reset_to_default')}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {presetCards.map(card => {
                    const active = preset === card.key;
                    return (
                      <button
                        key={card.key}
                        onClick={() => applyPreset(card.key)}
                        className={`flex flex-col items-center justify-center p-6 rounded-3xl relative transition-all ${
                          active
                            ? 'border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {active && (
                          <div className="absolute top-3 right-3 text-emerald-500">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </div>
                        )}
                        <span className="font-black text-sm uppercase tracking-widest mb-1">{card.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${active ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>{card.scheme}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {sets.map((set, idx) => (
                    <div key={set.id} className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('set_label')} {idx + 1}</span>
                          <button
                            onClick={() => updateSet(set.id, { warmup: !set.warmup })}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest transition-colors ${
                              set.warmup ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {t('warm_up')}
                          </button>
                        </div>
                        <button
                          onClick={() => removeSet(set.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30"
                          disabled={sets.length <= 1}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t('reps_label')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" value={set.reps} onChange={e => updateSet(set.id, { reps: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t('weight')} (kg)</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" value={set.weight} onChange={e => updateSet(set.id, { weight: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">RPE / {t('rir_label')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" value={set.rpe} onChange={e => updateSet(set.id, { rpe: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t('rest')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" value={set.rest} onChange={e => updateSet(set.id, { rest: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addSet}
                    className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] group"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_circle</span>
                    {t('add_new_set')}
                  </button>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Coach's Notes */}
              <section className="pb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">edit_note</span>
                    {t('coach_notes')}
                  </h3>
                </div>
                <div className="relative bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <textarea
                    className="w-full min-h-[180px] p-6 rounded-3xl bg-transparent border-none text-slate-700 dark:text-slate-200 focus:ring-0 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-sm leading-relaxed"
                    placeholder={t('coach_notes_placeholder')}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
