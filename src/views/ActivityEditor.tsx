import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ActivityEditorProps {
  onBack: () => void;
  activityName?: string;
}

export default function ActivityEditor({ onBack, activityName = 'Bulgarian Split Squat' }: ActivityEditorProps) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="bg-white w-full rounded-3xl shadow-xl border border-slate-200 flex flex-col h-auto min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{t('edit_activity')}</h2>
                
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activityName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                {t('cancel')}
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm">
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
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{t('activity_name')}</label>
                    <div className="relative">
                      <input 
                        className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm" 
                        type="text" 
                        defaultValue={activityName}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">check_circle</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{t('muscle_group')}</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-bold text-sm">
                        <option>{t('legs_quadriceps')}</option>
                        <option>{t('legs_hamstrings')}</option>
                        <option>{t('glutes')}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{t('equipment')}</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-bold text-sm">
                        <option>{t('dumbbells')}</option>
                        <option>{t('barbell')}</option>
                        <option>{t('bodyweight')}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Video & Media */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">video_library</span>
                  {t('video_media')}
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-bold text-sm" 
                        placeholder={t('paste_video_link')}
                        type="text" 
                        defaultValue="https://youtube.com/watch?v=example"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                    </div>
                    <button className="px-8 py-3.5 bg-slate-900 rounded-2xl text-white hover:bg-slate-800 transition-colors font-bold text-sm shadow-lg shadow-slate-900/10">
                      {t('fetch')}
                    </button>
                  </div>
                  <div className="relative w-full aspect-video rounded-3xl bg-slate-900 overflow-hidden group shadow-xl border border-slate-200">
                    <img 
                      alt="Exercise Preview" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4F5Een7gSLXuzEm6w2NGGWa4TTPjKuSPnzUrNkya65GLihgkWnDLxyWvluKt5tk8FR6Y8pjtkVq_gaRuArgAiahFngtChgxPAgaaghQnz8pcU7MhZLLSHL7KrqCOSYpRhUZUgzT1YKxwGrO9m8H9-5QCaL0M8Nvy4M_P9YbzRLGv5QTozNU6zeeQfmMDDAa8c8IoIQt4yCAq36Nii1d6uDsXPDIPlw5adgTi6o4_bBgZEU_rxKrCc1TASAG4CnrRSdAxq2MDx4HjQ"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all shadow-2xl group-hover:bg-emerald-500">
                        <span className="material-symbols-outlined text-white text-[40px] ml-1">play_arrow</span>
                      </button>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      {t('preview_duration')}
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Prescription */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">tune</span>
                    {t('prescription')}
                  </h3>
                  <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-widest">{t('reset_to_default')}</button>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <button className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/50 text-emerald-600 relative shadow-sm transition-all">
                    <div className="absolute top-3 right-3 text-emerald-500">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest mb-1">{t('training_phase_hypertrophy')}</span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full uppercase tracking-tight shadow-sm">3 x 10-12</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 text-slate-400 transition-all bg-white">
                    <span className="font-black text-sm uppercase tracking-widest mb-1">{t('strength')}</span>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tight">5 x 5</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 text-slate-400 transition-all bg-white">
                    <span className="font-black text-sm uppercase tracking-widest mb-1">{t('endurance')}</span>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tight">3 x 15+</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: 1, reps: '12', weight: '20', rpe: '7', rest: '90s', warmup: true },
                    { id: 2, reps: '10', weight: '25', rpe: '8', rest: '90s', warmup: false }
                  ].map((set) => (
                    <div key={set.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('set_label')} {set.id}</span>
                          {set.warmup && (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg uppercase tracking-widest">{t('warm_up')}</span>
                          )}
                        </div>
                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t('reps_label')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" defaultValue={set.reps}/>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t('weight')} (kg)</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" defaultValue={set.weight}/>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">RPE / {t('rir_label')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" defaultValue={set.rpe}/>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">{t('rest')}</label>
                          <input className="w-full text-center py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm" type="text" defaultValue={set.rest}/>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_circle</span>
                    {t('add_new_set')}
                  </button>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Coach's Notes */}
              <section className="pb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">edit_note</span>
                    {t('coach_notes')}
                  </h3>
                </div>
                <div className="relative bg-slate-50 rounded-3xl border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <textarea 
                    className="w-full min-h-[180px] p-6 rounded-3xl bg-transparent border-none text-slate-700 focus:ring-0 resize-none placeholder:text-slate-400 font-medium text-sm leading-relaxed" 
                    placeholder={t('coach_notes_placeholder')}
                  ></textarea>
                  <div className="absolute bottom-4 right-4 flex items-end gap-3 z-10 group">
                    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-64 mb-2 origin-bottom-right">
                      <div className="text-[10px] font-black text-slate-900 mb-3 flex items-center gap-2 px-1 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-purple-500 text-[18px]">auto_awesome</span>
                        {t('ai_assistant')}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-colors">{t('generate_form_cues')}</button>
                        <button className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-colors">{t('suggest_alternatives')}</button>
                        <button className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-colors">{t('summarize_benefits')}</button>
                      </div>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-all shadow-lg shadow-purple-500/10">
                      <span className="material-symbols-outlined text-[24px]">magic_button</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
