import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Dumbbell, Pencil, Trash2, X,
  ClipboardList, LayoutGrid, Rows3, Save, CalendarDays,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';

interface TrainingPlanTemplatesProps {
  onBack: () => void;
}

interface Exercise { id: string; name: string; sets: number; reps: string; rest: string }
interface Workout { id: string; name: string; exercises: Exercise[] }
interface Template {
  id: string; key?: string; name: string; description?: string;
  level?: string; type?: string; weekly_frequency?: number; data_json?: any;
}
interface Draft {
  id: string | null; name: string; description: string; level: string;
  weekly_frequency: number; workouts: Workout[]; schedule: Record<string, string>;
}

const DAYS = [
  { id: 'monday', label: 'Lun' }, { id: 'tuesday', label: 'Mar' },
  { id: 'wednesday', label: 'Mié' }, { id: 'thursday', label: 'Jue' },
  { id: 'friday', label: 'Vie' }, { id: 'saturday', label: 'Sáb' },
  { id: 'sunday', label: 'Dom' },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const emptyExercise = (): Exercise => ({ id: uid(), name: '', sets: 3, reps: '10', rest: '90s' });
const emptyWorkout = (n: number): Workout => ({ id: uid(), name: `Entreno ${n}`, exercises: [emptyExercise()] });

const blankDraft = (): Draft => ({
  id: null, name: '', description: '', level: 'Intermediate', weekly_frequency: 3,
  workouts: [emptyWorkout(1)], schedule: {},
});

function toDraft(tpl: Template): Draft {
  const dj = tpl.data_json || {};
  const workouts: Workout[] = (dj.workouts || []).map((w: any) => ({
    id: w.id || uid(),
    name: w.name || 'Entreno',
    exercises: (w.blocks || []).flatMap((b: any) => b.exercises || []).map((e: any) => ({
      id: e.id || uid(), name: e.name || '',
      sets: Number(e.sets) || 0, reps: String(e.reps ?? ''), rest: String(e.rest ?? ''),
    })),
  }));
  return {
    id: tpl.key || tpl.id,
    name: tpl.name,
    description: tpl.description || '',
    level: tpl.level || 'Intermediate',
    weekly_frequency: tpl.weekly_frequency || workouts.length || 3,
    workouts: workouts.length ? workouts : [emptyWorkout(1)],
    schedule: dj.weeklySchedule || {},
  };
}

export default function TrainingPlanTemplates({ onBack }: TrainingPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'rows'>('grid');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/training-templates')
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch((e) => setError(e?.message || 'Error'))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openEditor = async (tpl?: Template) => {
    setError('');
    if (!tpl) { setDraft(blankDraft()); return; }
    try {
      const full = await fetchWithAuth(`/manager/training-templates/${tpl.key || tpl.id}`);
      setDraft(toDraft(full || tpl));
    } catch {
      setDraft(toDraft(tpl));
    }
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { setError(t('template_name_required', { defaultValue: 'El nombre es obligatorio.' })); return; }
    setSaving(true); setError('');
    const data_json = {
      type: 'template',
      goal: draft.level,
      weeklySchedule: draft.schedule,
      workouts: draft.workouts.map((w) => ({
        id: w.id, name: w.name,
        blocks: [{
          id: `${w.id}-main`, name: 'Principal',
          exercises: w.exercises.filter((e) => e.name.trim()).map((e) => ({
            id: e.id, name: e.name, sets: e.sets, reps: e.reps, rest: e.rest,
          })),
        }],
      })),
    };
    const body = JSON.stringify({
      name: draft.name.trim(), description: draft.description.trim(),
      level: draft.level, weekly_frequency: draft.weekly_frequency, data_json,
    });
    try {
      if (draft.id) {
        await fetchWithAuth(`/manager/training-templates/${draft.id}`, { method: 'PUT', body });
      } else {
        await fetchWithAuth('/manager/training-templates', { method: 'POST', body });
      }
      setDraft(null);
      load();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t('confirm_delete_template', { defaultValue: `¿Borrar la plantilla "${tpl.name}"?` }))) return;
    await fetchWithAuth(`/manager/training-templates/${tpl.key || tpl.id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  /* ---------- Editor ---------- */
  if (draft) {
    const patchWorkout = (wi: number, w: Partial<Workout>) =>
      setDraft({ ...draft, workouts: draft.workouts.map((ww, i) => i === wi ? { ...ww, ...w } : ww) });
    const patchEx = (wi: number, ei: number, e: Partial<Exercise>) =>
      patchWorkout(wi, { exercises: draft.workouts[wi].exercises.map((x, i) => i === ei ? { ...x, ...e } : x) });

    return (
      <div className="w-full p-6 md:p-8 lg:p-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <button onClick={() => setDraft(null)} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
                <ArrowLeft className="w-4 h-4" /> {t('training_templates_title', { defaultValue: 'Plantillas de Entrenamiento' })}
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                {draft.id ? t('edit_template', { defaultValue: 'Editar plantilla' }) : t('create_template_btn', { defaultValue: 'Crear plantilla' })}
              </h2>
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {saving ? t('saving', { defaultValue: 'Guardando...' }) : t('save', { defaultValue: 'Guardar' })}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('template_name', { defaultValue: 'Nombre' })}</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('level', { defaultValue: 'Nivel / Objetivo' })}</label>
                <input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('description', { defaultValue: 'Descripción' })}</label>
                <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            {/* Workouts */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Dumbbell className="w-5 h-5 text-emerald-500" />{t('workouts', { defaultValue: 'Entrenos' })}</h3>
                <button onClick={() => setDraft({ ...draft, workouts: [...draft.workouts, emptyWorkout(draft.workouts.length + 1)] })}
                  className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> {t('add_workout', { defaultValue: 'Añadir entreno' })}
                </button>
              </div>

              {draft.workouts.map((w, wi) => (
                <div key={w.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border-b border-slate-100">
                    <input value={w.name} onChange={(e) => patchWorkout(wi, { name: e.target.value })}
                      className="font-bold text-slate-800 bg-transparent outline-none flex-1 min-w-0" />
                    <span className="text-xs font-bold text-slate-400">{w.exercises.length} ej.</span>
                    <button onClick={() => setDraft({ ...draft, workouts: draft.workouts.filter((_, i) => i !== wi) })}
                      className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      <span className="col-span-6">{t('exercise', { defaultValue: 'Ejercicio' })}</span>
                      <span className="col-span-2 text-center">{t('sets', { defaultValue: 'Series' })}</span>
                      <span className="col-span-2 text-center">{t('reps', { defaultValue: 'Reps' })}</span>
                      <span className="col-span-2 text-center">{t('rest', { defaultValue: 'Descanso' })}</span>
                    </div>
                    {w.exercises.map((ex, ei) => (
                      <div key={ex.id} className="grid grid-cols-12 gap-2 items-center">
                        <input value={ex.name} placeholder={t('exercise_name_ph', { defaultValue: 'Nombre del ejercicio' })}
                          onChange={(e) => patchEx(wi, ei, { name: e.target.value })}
                          className="col-span-12 sm:col-span-6 px-2 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                        <input type="number" min={0} value={ex.sets}
                          onChange={(e) => patchEx(wi, ei, { sets: Number(e.target.value) || 0 })}
                          className="col-span-3 sm:col-span-2 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center outline-none focus:ring-1 focus:ring-emerald-500" />
                        <input value={ex.reps}
                          onChange={(e) => patchEx(wi, ei, { reps: e.target.value })}
                          className="col-span-4 sm:col-span-2 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center outline-none focus:ring-1 focus:ring-emerald-500" />
                        <input value={ex.rest}
                          onChange={(e) => patchEx(wi, ei, { rest: e.target.value })}
                          className="col-span-4 sm:col-span-2 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center outline-none focus:ring-1 focus:ring-emerald-500" />
                        <button onClick={() => patchWorkout(wi, { exercises: w.exercises.filter((_, i) => i !== ei) })}
                          className="col-span-1 text-slate-300 hover:text-red-500 flex justify-center"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => patchWorkout(wi, { exercises: [...w.exercises, emptyExercise()] })}
                      className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
                      <Plus className="w-3.5 h-3.5" /> {t('add_exercise', { defaultValue: 'Añadir ejercicio' })}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly schedule */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-emerald-500" />{t('weekly_schedule', { defaultValue: 'Calendario semanal' })}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {DAYS.map((d) => (
                  <div key={d.id} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{d.label}</span>
                    <select value={draft.schedule[d.id] || ''}
                      onChange={(e) => setDraft({ ...draft, schedule: { ...draft.schedule, [d.id]: e.target.value } })}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:ring-1 focus:ring-emerald-500">
                      <option value="">{t('rest_day_label', { defaultValue: 'Descanso' })}</option>
                      {draft.workouts.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- List ---------- */
  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> {t('training', { defaultValue: 'Entrenamiento' })}
            </button>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-6 h-6 text-emerald-500" />
              {t('training_templates_title', { defaultValue: 'Plantillas de Entrenamiento' })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('training_templates_manage_desc', { defaultValue: 'Crea y gestiona rutinas reutilizables para asignar a tus clientes.' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button onClick={() => setLayout('grid')} title={t('grid_view', { defaultValue: 'Cuadrícula' })}
                className={`p-2 rounded-lg transition-colors ${layout === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setLayout('rows')} title={t('rows_view', { defaultValue: 'Filas' })}
                className={`p-2 rounded-lg transition-colors ${layout === 'rows' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                <Rows3 className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => openEditor()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold">
              <Plus className="w-5 h-5" />
              {t('create_template_btn', { defaultValue: 'Crear plantilla' })}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">{t('loading_templates', { defaultValue: 'Cargando plantillas...' })}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <ClipboardList className="w-10 h-10 opacity-30" />
              <p className="text-sm">{t('no_templates_yet', { defaultValue: 'Aún no hay plantillas.' })}</p>
              <button onClick={() => openEditor()} className="text-emerald-500 font-semibold hover:underline">
                {t('create_first_template', { defaultValue: 'Crea la primera' })}
              </button>
            </div>
          ) : (
            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
              {templates.map((tpl) => {
                const workoutCount = tpl.data_json?.workouts?.length;
                if (layout === 'rows') {
                  return (
                    <div key={tpl.id || tpl.key} onClick={() => openEditor(tpl)}
                      className="group flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{tpl.description || '—'}</p>
                      </div>
                      {tpl.level && <span className="text-[11px] font-bold text-slate-400 hidden sm:block">{tpl.level}</span>}
                      {tpl.weekly_frequency != null && <span className="text-[11px] font-bold text-slate-400 hidden md:block">{tpl.weekly_frequency}d/sem</span>}
                      {workoutCount != null && <span className="text-[11px] font-bold text-slate-400 hidden md:block">{workoutCount} entrenos</span>}
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditor(tpl); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={tpl.id || tpl.key} onClick={() => openEditor(tpl)}
                    className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description || '—'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEditor(tpl); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {tpl.level && <span>{tpl.level}</span>}
                      {tpl.weekly_frequency != null && <span>{tpl.weekly_frequency}d/sem</span>}
                      {workoutCount != null && <span>{workoutCount} entrenos</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
