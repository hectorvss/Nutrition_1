import React, { useState } from 'react';
import { useExerciseContext } from '../context/ExerciseContext';
import { useLanguage } from '../context/LanguageContext';

interface ExerciseCreateProps {
  onBack: () => void;
}

export default function ExerciseCreate({ onBack }: ExerciseCreateProps) {
  const { addExercise } = useExerciseContext();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Strength'|'Mobility'|'Warm-up'|'Cardio'|'Rehab'>('Strength');
  const [type, setType] = useState<'Compound'|'Isolation'>('Compound');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [secondaryMuscles, setSecondaryMuscles] = useState('');
  const [tools, setTools] = useState('');
  const [level, setLevel] = useState<'Beginner'|'Intermediate'|'Advanced'>('Beginner');

  const handleSave = () => {
    if (!name.trim()) return;
    addExercise({
      name: name.trim(),
      category,
      type,
      muscleGroups: primaryMuscle ? [primaryMuscle.trim()] : ['Full Body'],
      secondaryMuscles: secondaryMuscles ? secondaryMuscles.split(',').map(s => s.trim()) : [],
      tools: tools ? tools.split(',').map(s => s.trim()) : ['Bodyweight'],
      level,
      icon: 'fitness_center',
    });
    onBack();
  };
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <button 
                onClick={onBack}
                className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 text-sm font-bold mb-3"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {t('training_library_title')}
              </button>
              <h2 className="text-3xl font-bold text-slate-900">{t('create_exercise')}</h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">{t('exercise_form_desc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all"
              >
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={!name.trim()} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">save</span>
                {t('add_to_library')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8 pb-20">
              {/* Basic Information */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">info</span>
                  {t('basic_information')}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_name')}</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('exercise_name_placeholder')}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('category_label')}</label>
                      <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all appearance-none">
                        <option value="Strength">{t('strength_cat')}</option>
                        <option value="Mobility">{t('mobility_cat')}</option>
                        <option value="Warm-up">{t('warmup_cat')}</option>
                        <option value="Cardio">{t('cardio_cat')}</option>
                        <option value="Rehab">{t('rehab_cat')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('type_label')}</label>
                      <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all appearance-none">
                        <option value="Compound">{t('compound_type')}</option>
                        <option value="Isolation">{t('isolation_type')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_instructions')}</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('exercise_instructions_placeholder')}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">activity</span>
                  {t('muscle_groups')}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('primary_muscle_group')}</label>
                    <input 
                      type="text" 
                      value={primaryMuscle}
                      onChange={e => setPrimaryMuscle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('primary_muscle_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('secondary_muscles')}</label>
                    <input 
                      type="text" 
                      value={secondaryMuscles}
                      onChange={e => setSecondaryMuscles(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('secondary_muscles_placeholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Data */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">bolt</span>
                  {t('technical_data')}
                </h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('required_tools')}</label>
                    <input 
                      type="text" 
                      value={tools}
                      onChange={e => setTools(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('required_tools_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('difficulty_level')}</label>
                    <select className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all appearance-none">
                      <option value="Beginner">{t('beginner_level')}</option>
                      <option value="Intermediate">{t('intermediate_level')}</option>
                      <option value="Advanced">{t('advanced_level')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quality Rating */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">verified_user</span>
                  {t('safety_rating')}
                </h3>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} className="text-amber-400 hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl fill-1">star</span>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('five_out_of_five')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
