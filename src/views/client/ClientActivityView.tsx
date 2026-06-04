import React, { useEffect, useState } from 'react';
import { useExerciseContext } from '../../context/ExerciseContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  activityName?: string;
  activityId?: string;
  onBack: () => void;
}

// Strip the "1." / "2)" / "-" prefix the stored text might carry so each
// bullet/card renders cleanly regardless of how the manager wrote it.
const stripPrefix = (s: string) => s.replace(/^\s*(\d+[.)]\s*|[-•*]\s*)/, '').trim();
const parseItems = (txt?: string | null): string[] =>
  (txt || '').split('\n').map(stripPrefix).filter(Boolean);
const normalizeExerciseName = (s?: string | null) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(db|dumbell)\b/g, 'dumbbell')
    .replace(/\b(bb)\b/g, 'barbell')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Read-only exercise view for the client portal. Replaces the
 * manager-side ActivityEditor that was wrongly wired into ClientApp —
 * that editor had a "save" button that did nothing, and exposed
 * prescription-editing controls the client shouldn't touch. Here the
 * client only consults the exercise: muscle group, equipment, video and
 * the coach's instructions / common mistakes / tips.
 */
export default function ClientActivityView({ activityName, activityId, onBack }: Props) {
  const { t } = useLanguage();
  const { exercises, getExerciseFullDetails } = useExerciseContext();
  const wanted = normalizeExerciseName(activityName);
  const exercise = exercises.find(e => activityId && e.id === activityId)
    || exercises.find(e => normalizeExerciseName(e.name) === wanted)
    || exercises.find(e => {
      const candidate = normalizeExerciseName(e.name);
      return wanted.length > 2 && (candidate.includes(wanted) || wanted.includes(candidate));
    });

  const [instructions, setInstructions] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exercise?.id) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    (async () => {
      const full = await getExerciseFullDetails(exercise.id);
      if (!mounted) return;
      setInstructions(parseItems(full?.instructions));
      setMistakes(parseItems(full?.commonMistakes));
      setTips(parseItems(full?.tips));
      setDescription((full?.description || '').trim());
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [exercise?.id]);

  if (!activityName || !exercise) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{t('exercise_not_found', { defaultValue: 'Ejercicio no encontrado' })}</p>
          <button onClick={onBack} className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-4 py-2 rounded-xl font-semibold">{t('back')}</button>
        </div>
      </div>
    );
  }

  const videoEmbedSrc = exercise.video_url
    ? exercise.video_url.replace('watch?v=', 'embed/').split('?')[0].replace('shorts/', 'embed/')
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex justify-center items-start">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('back')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{exercise.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.category}{exercise.subcategory ? ` • ${exercise.subcategory}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Overview chips */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              {t('general_information')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label={t('primary_muscle_groups_csv', { defaultValue: 'Músculos primarios' })} value={(exercise.muscleGroups || []).join(', ')} />
              <Field label={t('secondary_muscles_csv', { defaultValue: 'Músculos secundarios' })} value={(exercise.secondaryMuscles || []).join(', ')} />
              <Field label={t('equipment_tools_csv', { defaultValue: 'Equipamiento' })} value={(exercise.tools || []).join(', ')} />
              <Field label={t('type_label', { defaultValue: 'Tipo' })} value={exercise.type} />
              <Field label={t('difficulty_level', { defaultValue: 'Dificultad' })} value={exercise.level} />
            </div>
          </section>

          {/* Video */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">video_library</span>
              {t('video_media')}
            </h3>
            {videoEmbedSrc ? (
              <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                <iframe
                  className="w-full h-full"
                  src={videoEmbedSrc}
                  title={t('exercise_video', { defaultValue: 'Vídeo del ejercicio' })}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-3xl mb-2">videocam_off</span>
                <span className="text-sm">{t('no_video_available')}</span>
              </div>
            )}
          </section>

          <Block title={t('exercise_instructions_title', { defaultValue: 'Instrucciones de ejecución' })} icon="format_list_numbered" ordered items={instructions} empty={t('exercise_no_info')} loading={loading} />
          <Block title={t('exercise_common_mistakes_title', { defaultValue: 'Errores comunes' })} icon="warning" items={mistakes} empty={t('exercise_no_info')} loading={loading} />
          <Block title={t('exercise_tips_title', { defaultValue: 'Consejos técnicos' })} icon="lightbulb" items={tips} empty={t('exercise_no_info')} loading={loading} />

          {description && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                {t('exercise_details_description')}
              </h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value || '—'}</p>
    </div>
  );
}

function Block({ title, icon, items, empty, ordered, loading }: { title: string; icon: string; items: string[]; empty: string; ordered?: boolean; loading: boolean }) {
  return (
    <section>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        {title}
      </h3>
      {loading ? (
        <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-400">{empty}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3"
            >
              {ordered ? (
                <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
              ) : (
                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-2" />
              )}
              <p className="flex-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
