import React, { useState, useEffect, useMemo } from 'react';
import { useExerciseContext } from '../context/ExerciseContext';
import { TrainingCategory } from '../types/training';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';
import ComboBox from '../components/ui/ComboBox';

interface ExerciseDetailProps {
  exerciseName?: string;
  onBack: () => void;
}

// Strips a leading "1." / "2)" / "-" / "•" prefix so each line renders cleanly
// inside its own card regardless of how the stored text was formatted.
const stripPrefix = (s: string) => s.replace(/^\s*(\d+[.)]\s*|[-•*]\s*)/, '').trim();
const parseItems = (txt?: string | null): string[] =>
  (txt || '').split('\n').map(stripPrefix).filter(Boolean);

export default function ExerciseDetail({ exerciseName, onBack }: ExerciseDetailProps) {
  const { t } = useLanguage();
  const { exercises, updateExercise, getExerciseFullDetails } = useExerciseContext();
  const exercise = exercises.find(e => e.name === exerciseName);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable fields state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TrainingCategory>("Strength");
  const [subcategory, setSubcategory] = useState("");
  const [type, setType] = useState<"Compound" | "Isolation" | "Stretch" | "Hold">("Compound");
  const [difficultyLevel, setDifficultyLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  const [muscles, setMuscles] = useState<string[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);

  const [videoUrl, setVideoUrl] = useState("");
  const [noteItems, setNoteItems] = useState<string[]>([]);
  const [instructionItems, setInstructionItems] = useState<string[]>([]);
  const [mistakeItems, setMistakeItems] = useState<string[]>([]);
  const [tipItems, setTipItems] = useState<string[]>([]);

  // Suggestion pools — every distinct value already used across the catalog.
  const subcategoryOptions = useMemo(
    () => Array.from(new Set(exercises.map(e => e.subcategory).filter(Boolean) as string[])).sort(),
    [exercises]
  );
  const muscleOptions = useMemo(
    () => Array.from(new Set(
      exercises.flatMap(e => [...(e.muscleGroups || []), ...(e.secondaryMuscles || [])])
    )).filter(Boolean).sort(),
    [exercises]
  );
  const toolOptions = useMemo(
    () => Array.from(new Set(exercises.flatMap(e => e.tools || []))).filter(Boolean).sort(),
    [exercises]
  );

  // Initialize fields from the lightweight catalog row. The long-form
  // fields (description, instructions, common_mistakes, tips) are NOT in
  // the bulk list — fetch them on demand below.
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setCategory(exercise.category);
      setSubcategory(exercise.subcategory || "");
      setType(exercise.type);
      setDifficultyLevel(exercise.level);
      setMuscles(exercise.muscleGroups || []);
      setSecondaryMuscles(exercise.secondaryMuscles || []);
      setEquipment(exercise.tools || []);
      setVideoUrl(exercise.video_url || "");
    } else if (exerciseName) {
      setName(exerciseName);
    }
  }, [exercise, exerciseName, isEditing]);

  // Lazy-load the long-form text fields the first time the detail mounts
  // (and again on Cancel, so unsaved edits revert from the server). The
  // bulk catalog query intentionally omits these to keep the global load
  // small; see ExerciseContext.getExerciseFullDetails.
  useEffect(() => {
    if (!exercise?.id) return;
    let mounted = true;
    (async () => {
      const full = await getExerciseFullDetails(exercise.id);
      if (!mounted || !full) return;
      setNoteItems(parseItems(full.description));
      setInstructionItems(parseItems(full.instructions));
      setMistakeItems(parseItems(full.commonMistakes));
      setTipItems(parseItems(full.tips));
    })();
    return () => { mounted = false; };
  }, [exercise?.id, isEditing]);

  const handleSave = async () => {
    if (!exercise) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateExercise(exercise.id, {
        name,
        category,
        subcategory,
        type,
        level: difficultyLevel,
        muscleGroups: muscles.map(s => s.trim()).filter(Boolean),
        secondaryMuscles: secondaryMuscles.map(s => s.trim()).filter(Boolean),
        tools: equipment.map(s => s.trim()).filter(Boolean),
        video_url: videoUrl,
        description: noteItems.map(s => s.trim()).filter(Boolean).join('\n'),
        instructions: instructionItems.map(s => s.trim()).filter(Boolean).join('\n'),
        commonMistakes: mistakeItems.map(s => s.trim()).filter(Boolean).join('\n'),
        tips: tipItems.map(s => s.trim()).filter(Boolean).join('\n'),
      });
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.message || t('error_loading_data'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Shared display / editing styling for the General Information fields.
  const viewBox = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate";
  const editComboBox = "w-full px-4 py-2.5 min-h-[48px] rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 focus-within:ring-2 focus-within:ring-emerald-500 transition-all";

  // Renders an "instructions / mistakes / tips" block as a list of mini-cards.
  const renderItemSection = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    ordered: boolean,
    addLabel: string,
    placeholder: string,
  ) => {
    const badge = (idx: number) => ordered ? (
      <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
        {idx + 1}
      </span>
    ) : (
      <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-2" />
    );

    if (isEditing) {
      return (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-300 dark:border-emerald-700/50 px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-emerald-500/30"
            >
              {badge(idx)}
              <textarea
                value={item}
                rows={1}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  setItems(next);
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 p-0 mt-0.5"
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-0.5"
                aria-label={t('delete_btn')}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems([...items, ''])}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {addLabel}
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-slate-400 text-sm">{t('exercise_no_info', { defaultValue: 'Sin información' })}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3"
          >
            {badge(idx)}
            <p className="flex-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    );
  };

  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{t('exercise_not_found')}</p>
          <button onClick={onBack} className="bg-emerald-500 text-white px-4 py-2 rounded-xl">{t('back')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex justify-center items-start">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col h-auto min-h-[calc(100vh-4rem)] md:min-h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? t('edit_activity') : t('view_activity')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  {t('edit')}
                </button>
                <button onClick={onBack} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-semibold text-sm">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  {t('done_label')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-semibold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : 'save'}</span>
                  {isSaving ? t('saving') : t('save_changes')}
                </button>
              </>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mx-8 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{saveError}</span>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 h-full">
            {/* General Information */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                {t('general_information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('activity_name')}</label>
                  <div className="relative">
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default">
                        {name}
                      </div>
                    )}
                    {!isEditing && <span className="material-symbols-outlined absolute right-3 top-3.5 text-emerald-500">check_circle</span>}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('category_label')}</label>
                  {isEditing ? (
                    <Select
                      value={category}
                      onChange={(val) => setCategory(val as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    >
                      <option value="Strength">{t('strength_cat')}</option>
                      <option value="Mobility">{t('mobility_cat')}</option>
                      <option value="Warm-up">{t('warmup_cat')}</option>
                      <option value="Cardio">{t('cardio_cat')}</option>
                      <option value="Rehab">{t('rehab_cat')}</option>
                    </Select>
                  ) : (
                    <div className={viewBox}>{category}</div>
                  )}
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('subcategory_label')}</label>
                  {isEditing ? (
                    <ComboBox
                      value={subcategory}
                      onChange={(val) => setSubcategory(val as string)}
                      options={subcategoryOptions}
                      placeholder={t('subcategory_placeholder')}
                      className={editComboBox}
                      createLabel={t('combo_create', { defaultValue: 'Crear' })}
                    />
                  ) : (
                    <div className={viewBox}>{subcategory || t('none')}</div>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('type_label')}</label>
                  {isEditing ? (
                    <Select
                      value={type}
                      onChange={(val) => setType(val as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    >
                      <option value="Compound">{t('compound_type')}</option>
                      <option value="Isolation">{t('isolation_type')}</option>
                      <option value="Stretch">{t('stretch_type')}</option>
                      <option value="Hold">{t('hold_type')}</option>
                    </Select>
                  ) : (
                    <div className={viewBox}>{type}</div>
                  )}
                </div>

                {/* Primary muscle groups */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('primary_muscle_groups_csv')}</label>
                  {isEditing ? (
                    <ComboBox
                      multiple
                      value={muscles}
                      onChange={(val) => setMuscles(val as string[])}
                      options={muscleOptions}
                      placeholder={t('combo_search_placeholder', { defaultValue: 'Buscar o añadir…' })}
                      className={editComboBox}
                      createLabel={t('combo_create', { defaultValue: 'Crear' })}
                    />
                  ) : (
                    <div className={viewBox}>{muscles.join(', ') || t('none')}</div>
                  )}
                </div>

                {/* Secondary muscles */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('secondary_muscles_csv')}</label>
                  {isEditing ? (
                    <ComboBox
                      multiple
                      value={secondaryMuscles}
                      onChange={(val) => setSecondaryMuscles(val as string[])}
                      options={muscleOptions}
                      placeholder={t('combo_search_placeholder', { defaultValue: 'Buscar o añadir…' })}
                      className={editComboBox}
                      createLabel={t('combo_create', { defaultValue: 'Crear' })}
                    />
                  ) : (
                    <div className={viewBox}>{secondaryMuscles.join(', ') || t('none')}</div>
                  )}
                </div>

                {/* Equipment / tools */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('equipment_tools_csv')}</label>
                  {isEditing ? (
                    <ComboBox
                      multiple
                      value={equipment}
                      onChange={(val) => setEquipment(val as string[])}
                      options={toolOptions}
                      placeholder={t('combo_search_placeholder', { defaultValue: 'Buscar o añadir…' })}
                      className={editComboBox}
                      createLabel={t('combo_create', { defaultValue: 'Crear' })}
                    />
                  ) : (
                    <div className={viewBox}>{equipment.join(', ') || t('none')}</div>
                  )}
                </div>

                {/* Difficulty level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{t('difficulty_level')}</label>
                  {isEditing ? (
                    <Select
                      value={difficultyLevel}
                      onChange={(val) => setDifficultyLevel(val as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    >
                      <option value="Beginner">{t('beginner_level')}</option>
                      <option value="Intermediate">{t('intermediate_level')}</option>
                      <option value="Advanced">{t('advanced_level')}</option>
                    </Select>
                  ) : (
                    <div className={viewBox}>{difficultyLevel}</div>
                  )}
                </div>

              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Video & Media */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">video_library</span>
                {t('video_media')}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder={t('paste_video_link')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                        {videoUrl || t('no_video_link')}
                      </div>
                    )}
                    <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400">link</span>
                  </div>
                </div>
                {videoUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl bg-slate-900 overflow-hidden group shadow-md border border-slate-200 dark:border-slate-700">
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <iframe
                        className="w-full h-full"
                        src={videoUrl.replace('watch?v=', 'embed/').split('?')[0].replace('shorts/', 'embed/')}
                        title={t('exercise_video')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">videocam_off</span>
                      <p className="text-slate-500 font-medium mt-2">{t('no_video_available')}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Execution Instructions */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                  {t('exercise_instructions_title', { defaultValue: 'Instrucciones de ejecución' })}
                </h3>
              </div>
              {renderItemSection(
                instructionItems, setInstructionItems, true,
                t('exercise_add_instruction', { defaultValue: 'Añadir paso' }),
                t('exercise_item_placeholder', { defaultValue: 'Escribe aquí…' }),
              )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Common Mistakes */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  {t('exercise_common_mistakes_title', { defaultValue: 'Errores comunes' })}
                </h3>
              </div>
              {renderItemSection(
                mistakeItems, setMistakeItems, false,
                t('exercise_add_mistake', { defaultValue: 'Añadir error' }),
                t('exercise_item_placeholder', { defaultValue: 'Escribe aquí…' }),
              )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Technique Tips */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  {t('exercise_tips_title', { defaultValue: 'Consejos técnicos' })}
                </h3>
              </div>
              {renderItemSection(
                tipItems, setTipItems, false,
                t('exercise_add_tip', { defaultValue: 'Añadir consejo' }),
                t('exercise_item_placeholder', { defaultValue: 'Escribe aquí…' }),
              )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Coach's Notes */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  {t('exercise_details_description')}
                </h3>
              </div>
              {renderItemSection(
                noteItems, setNoteItems, false,
                t('exercise_add_note', { defaultValue: 'Añadir detalle' }),
                t('exercise_item_placeholder', { defaultValue: 'Escribe aquí…' }),
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
