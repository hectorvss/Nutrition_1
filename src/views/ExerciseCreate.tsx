import React, { useState } from 'react';
import { useExerciseContext } from '../context/ExerciseContext';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

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
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  const [tips, setTips] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [safetyRating, setSafetyRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await addExercise({
        name: name.trim(),
        category,
        type,
        subcategory: subcategory.trim() || undefined,
        video_url: videoUrl.trim() || undefined,
        description: description.trim() || undefined,
        muscleGroups: primaryMuscle ? [primaryMuscle.trim()] : ['Full Body'],
        secondaryMuscles: secondaryMuscles ? secondaryMuscles.split(',').map(s => s.trim()) : [],
        tools: tools ? tools.split(',').map(s => s.trim()) : ['Bodyweight'],
        level,
        icon: 'fitness_center',
        instructions: instructions.trim() || undefined,
        commonMistakes: commonMistakes.trim() || undefined,
        tips: tips.trim() || undefined,
        safety_rating: safetyRating || null,
      } as any);
      onBack();
    } catch (err: any) {
      console.error('Error saving exercise:', err);
      setSaveError(err?.message || t('exercise_save_error', { defaultValue: 'Error al guardar el ejercicio. Inténtalo de nuevo.' }));
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('create_exercise')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">{t('exercise_form_desc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-all"
              >
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : 'save'}</span>
                {isSaving ? t('saving') : t('add_to_library')}
              </button>
            </div>
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400 text-right mt-2">{saveError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8 pb-20">
              {/* Basic Information */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
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
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('exercise_name_placeholder')}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('category_label')}</label>
                      <Select value={category} onChange={(val) => setCategory(val as any)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all">
                        <option value="Strength">{t('strength_cat')}</option>
                        <option value="Mobility">{t('mobility_cat')}</option>
                        <option value="Warm-up">{t('warmup_cat')}</option>
                        <option value="Cardio">{t('cardio_cat')}</option>
                        <option value="Rehab">{t('rehab_cat')}</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('type_label')}</label>
                      <Select value={type} onChange={(val) => setType(val as any)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all">
                        <option value="Compound">{t('compound_type')}</option>
                        <option value="Isolation">{t('isolation_type')}</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('subcategory_label', { defaultValue: 'Subcategoría' })}</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={e => setSubcategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('subcategory_placeholder', { defaultValue: 'p. ej. Tracción horizontal' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('video_url_label', { defaultValue: 'URL del vídeo' })}</label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_instructions')}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('exercise_instructions_placeholder')}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_instructions_title', { defaultValue: 'Instrucciones de ejecución' })}</label>
                    <textarea
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('exercise_instructions_section_placeholder', { defaultValue: 'Describe paso a paso cómo ejecutar el ejercicio…' })}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_common_mistakes_title', { defaultValue: 'Errores comunes' })}</label>
                    <textarea
                      value={commonMistakes}
                      onChange={e => setCommonMistakes(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('exercise_common_mistakes_placeholder', { defaultValue: 'Describe los errores típicos que cometen los clientes…' })}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('exercise_tips_title', { defaultValue: 'Consejos técnicos' })}</label>
                    <textarea
                      value={tips}
                      onChange={e => setTips(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('exercise_tips_placeholder', { defaultValue: 'Añade cues y consejos para mejorar la técnica…' })}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">exercise</span>
                  {t('muscle_groups')}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('primary_muscle_group')}</label>
                    <input 
                      type="text" 
                      value={primaryMuscle}
                      onChange={e => setPrimaryMuscle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('primary_muscle_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('secondary_muscles')}</label>
                    <input 
                      type="text" 
                      value={secondaryMuscles}
                      onChange={e => setSecondaryMuscles(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('secondary_muscles_placeholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Data */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
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
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('required_tools_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('difficulty_level')}</label>
                    <Select
                      value={level}
                      onChange={(val) => setLevel(val as any)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                    >
                      <option value="Beginner">{t('beginner_level')}</option>
                      <option value="Intermediate">{t('intermediate_level')}</option>
                      <option value="Advanced">{t('advanced_level')}</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Quality Rating */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">verified_user</span>
                  {t('safety_rating')}
                </h3>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSafetyRating(safetyRating === i ? 0 : i)}
                        className={`hover:scale-110 transition-all ${i <= safetyRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700 hover:text-amber-400'}`}
                      >
                        <span className={`material-symbols-outlined text-4xl ${i <= safetyRating ? 'fill-1' : ''}`}>star</span>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {safetyRating > 0 ? `${safetyRating} / 5` : t('not_rated', { defaultValue: 'Sin valorar' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
