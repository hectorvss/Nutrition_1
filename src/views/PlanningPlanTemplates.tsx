import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Pencil, Trash2, ClipboardList,
  LayoutGrid, Rows3, Calendar, Layers, Zap, X, Eye,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';

interface PlanningPlanTemplatesProps {
  onBack: () => void;
}

interface Template {
  id: string; key?: string; name: string; description?: string;
  goal_type?: string; intensity?: string; duration_weeks?: number; phases?: number;
  data_json?: any;
}

const GOAL_OPTIONS = ['fat_loss', 'muscle_gain', 'body_recomposition', 'metabolic_reset', 'endurance_focus'];
const INTENSITY_OPTIONS = ['low', 'moderate', 'aggressive', 'elite'];

interface PhaseDef { name: string; focus: string; }

const emptyDraft = (): Template => ({
  id: '', name: '', description: '',
  goal_type: 'fat_loss', intensity: 'moderate', duration_weeks: 12, phases: 3,
  data_json: {
    type: 'template',
    preview: '',
    phases: [
      { name: 'Fase 1', focus: '' },
      { name: 'Fase 2', focus: '' },
      { name: 'Fase 3', focus: '' },
    ] as PhaseDef[],
  },
});

export default function PlanningPlanTemplates({ onBack }: PlanningPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'rows'>('grid');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  // Read-only blueprint view — see a template's real structure without a client.
  const [viewing, setViewing] = useState<Template | null>(null);

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/planning-templates?limit=200').then(unwrapList)
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing || busy) return;
    if (!editing.name.trim()) return;
    setBusy(true);
    try {
      const phaseList: PhaseDef[] = Array.isArray(editing.data_json?.phases) ? editing.data_json.phases : [];
      const body = {
        name: editing.name.trim(),
        description: editing.description || '',
        goal_type: editing.goal_type,
        intensity: editing.intensity,
        duration_weeks: editing.duration_weeks,
        // phase count is derived from the authored phase list
        phases: phaseList.length || editing.phases || 1,
        data_json: editing.data_json || { type: 'template' },
      };
      const isNew = !editing.id && !editing.key;
      if (isNew) {
        await fetchWithAuth('/manager/planning-templates', {
          method: 'POST', body: JSON.stringify(body),
        });
      } else {
        await fetchWithAuth(`/manager/planning-templates/${editing.key || editing.id}`, {
          method: 'PUT', body: JSON.stringify(body),
        });
      }
      setEditing(null);
      load();
    } catch (e) {
      console.error('save planning template failed', e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t('confirm_delete_template', { defaultValue: `¿Borrar la plantilla "${tpl.name}"?` }))) return;
    await fetchWithAuth(`/manager/planning-templates/${tpl.key || tpl.id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> {t('planning_management', { defaultValue: 'Planificación' })}
            </button>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-6 h-6 text-emerald-500" />
              {t('planning_templates_title', { defaultValue: 'Plantillas de Planificación' })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('planning_templates_manage_desc', { defaultValue: 'Crea y gestiona hojas de ruta reutilizables para asignar a tus clientes.' })}
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
            <button onClick={() => setEditing(emptyDraft())} disabled={busy}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold disabled:opacity-50">
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
              <button onClick={() => setEditing(emptyDraft())} className="text-emerald-500 font-semibold hover:underline">
                {t('create_first_template', { defaultValue: 'Crea la primera' })}
              </button>
            </div>
          ) : (
            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
              {templates.map((tpl) => {
                const open = () => setEditing({ ...tpl, data_json: tpl.data_json || {} });
                const view = () => setViewing({ ...tpl, data_json: tpl.data_json || {} });
                if (layout === 'rows') {
                  return (
                    <div key={tpl.id || tpl.key} onClick={view}
                      className="group flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold w-24 shrink-0">
                        <Calendar className="w-4 h-4" /><span>{tpl.duration_weeks || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">{t('weeks_label', { defaultValue: 'sem' })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{tpl.description || '—'}</p>
                      </div>
                      {tpl.phases != null && <span className="text-[11px] font-bold text-slate-400 hidden md:flex items-center gap-1 shrink-0"><Layers className="w-3.5 h-3.5" />{tpl.phases}</span>}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); view(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); open(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={tpl.id || tpl.key} onClick={view}
                    className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-lg">
                          <Calendar className="w-5 h-5" />
                          {tpl.duration_weeks || 0}
                          <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('weeks_label', { defaultValue: 'semanas' })}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mt-1 truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description || '—'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); view(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); open(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {tpl.phases != null && <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{tpl.phases} {t('phases_label', { defaultValue: 'fases' })}</span>}
                      {tpl.intensity && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" />{t(`planning_intensity_${tpl.intensity}`, { defaultValue: tpl.intensity })}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !busy && setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {editing.id || editing.key
                  ? t('edit_template', { defaultValue: 'Editar plantilla' })
                  : t('create_template_btn', { defaultValue: 'Crear plantilla' })}
              </h3>
              <button onClick={() => !busy && setEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('template_name', { defaultValue: 'Nombre' })}</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  placeholder={t('template_name', { defaultValue: 'Nombre' })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('description', { defaultValue: 'Descripción' })}</label>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('total_duration', { defaultValue: 'Duración (sem)' })}</label>
                  <input type="number" min={1} max={52}
                    value={editing.duration_weeks ?? ''}
                    onChange={(e) => setEditing({ ...editing, duration_weeks: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('intensity_level', { defaultValue: 'Intensidad' })}</label>
                  <select
                    value={editing.intensity}
                    onChange={(e) => setEditing({ ...editing, intensity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  >
                    {INTENSITY_OPTIONS.map((i) => (
                      <option key={i} value={i}>{t(`planning_intensity_${i}`, { defaultValue: i })}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('primary_goal_override', { defaultValue: 'Objetivo' })}</label>
                <select
                  value={editing.goal_type}
                  onChange={(e) => setEditing({ ...editing, goal_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                >
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>{t(`analytics_${g}`, { defaultValue: g })}</option>
                  ))}
                </select>
              </div>

              {/* Phase authoring — the real roadmap structure of the template */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('phases_label', { defaultValue: 'Fases' })}</label>
                <div className="flex flex-col gap-2">
                  {((editing.data_json?.phases as PhaseDef[]) || []).map((ph, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="w-6 h-6 shrink-0 rounded-lg bg-emerald-100 text-emerald-600 text-[11px] font-bold flex items-center justify-center">{idx + 1}</span>
                      <input
                        value={ph.name}
                        onChange={(e) => {
                          const arr = [...(editing.data_json?.phases || [])];
                          arr[idx] = { ...arr[idx], name: e.target.value };
                          setEditing({ ...editing, data_json: { ...(editing.data_json || {}), phases: arr } });
                        }}
                        placeholder={t('phase_name_placeholder', { defaultValue: 'Nombre de la fase' })}
                        className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                      />
                      <input
                        value={ph.focus}
                        onChange={(e) => {
                          const arr = [...(editing.data_json?.phases || [])];
                          arr[idx] = { ...arr[idx], focus: e.target.value };
                          setEditing({ ...editing, data_json: { ...(editing.data_json || {}), phases: arr } });
                        }}
                        placeholder={t('phase_focus_placeholder', { defaultValue: 'Objetivo / foco de la fase' })}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = (editing.data_json?.phases || []).filter((_: any, i: number) => i !== idx);
                          setEditing({ ...editing, data_json: { ...(editing.data_json || {}), phases: arr } });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 shrink-0"
                        title={t('delete', { defaultValue: 'Eliminar' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const arr = [...(editing.data_json?.phases || [])];
                      arr.push({ name: `Fase ${arr.length + 1}`, focus: '' });
                      setEditing({ ...editing, data_json: { ...(editing.data_json || {}), phases: arr } });
                    }}
                    className="self-start flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 mt-1"
                  >
                    <Plus className="w-4 h-4" /> {t('add_phase', { defaultValue: 'Añadir fase' })}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('roadmap_preview', { defaultValue: 'Resumen de la hoja de ruta' })}</label>
                <input
                  value={editing.data_json?.preview || ''}
                  onChange={(e) => setEditing({ ...editing, data_json: { ...(editing.data_json || {}), preview: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder={t('roadmap_preview_placeholder', { defaultValue: 'Ej: Mantenimiento (4 sem) → Déficit (4 sem) → Reverse (4 sem)' })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
              <button onClick={() => !busy && setEditing(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                {t('cancel', { defaultValue: 'Cancelar' })}
              </button>
              <button onClick={save} disabled={busy || !editing.name.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {t('save', { defaultValue: 'Guardar' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read-only blueprint view — the template in its own UI, no client. */}
      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-900 truncate">{viewing.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600"><Calendar className="w-3.5 h-3.5" />{viewing.duration_weeks || 0} {t('weeks_label', { defaultValue: 'semanas' })}</span>
                  {viewing.phases != null && <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{viewing.phases} {t('phases_label', { defaultValue: 'fases' })}</span>}
                  {viewing.intensity && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" />{t(`planning_intensity_${viewing.intensity}`, { defaultValue: viewing.intensity })}</span>}
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {(viewing.data_json?.summary || viewing.description) && (
                <p className="text-sm text-slate-600 leading-relaxed">{viewing.data_json?.summary || viewing.description}</p>
              )}

              {/* KPI targets */}
              {viewing.data_json?.kpiTargets && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(viewing.data_json.kpiTargets).map(([k, v]) => (
                    <span key={k} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">
                      {k}: <span className="font-medium text-emerald-600">{String(v)}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Rich block-by-block structure */}
              {Array.isArray(viewing.data_json?.blocks) && viewing.data_json.blocks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {viewing.data_json.blocks.map((b: any, i: number) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider shrink-0">{t('weeks_label', { defaultValue: 'sem' })} {b.weeks}</span>
                      </div>
                      {b.goal && <p className="text-xs text-slate-500 mb-2 leading-snug">{b.goal}</p>}
                      {Array.isArray(b.weeklyFocus) && (
                        <ul className="space-y-0.5 mb-2">
                          {b.weeklyFocus.map((w: string, wi: number) => (
                            <li key={wi} className="text-[11px] text-slate-600 flex gap-1.5"><span className="text-emerald-400">•</span>{w}</li>
                          ))}
                        </ul>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {b.training && (
                          <div className="bg-white rounded-lg border border-slate-100 p-2">
                            <div className="font-bold text-amber-600 uppercase tracking-wider mb-0.5">{t('training_label', { defaultValue: 'Entreno' })}</div>
                            <div className="text-slate-500">{b.training.frequency}x · {b.training.split}</div>
                            <div className="text-slate-400">{b.training.intensity}</div>
                          </div>
                        )}
                        {b.nutrition && (
                          <div className="bg-white rounded-lg border border-slate-100 p-2">
                            <div className="font-bold text-blue-600 uppercase tracking-wider mb-0.5">{t('nutrition_label', { defaultValue: 'Nutrición' })}</div>
                            <div className="text-slate-500">{b.nutrition.approach}</div>
                            <div className="text-slate-400">{b.nutrition.protein} prot.</div>
                          </div>
                        )}
                      </div>
                      {Array.isArray(b.kpis) && b.kpis.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.kpis.map((kp: any, ki: number) => (
                            <span key={ki} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{kp.metric}: {kp.target}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : Array.isArray(viewing.data_json?.phases) && viewing.data_json.phases.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {viewing.data_json.phases.map((ph: any, i: number) => (
                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <span className="w-6 h-6 shrink-0 rounded-lg bg-emerald-100 text-emerald-600 text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{ph.name}</p>
                        {ph.focus && <p className="text-xs text-slate-500">{ph.focus}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">{t('no_blueprint_detail', { defaultValue: 'Esta plantilla no tiene estructura detallada.' })}</p>
              )}

              {viewing.data_json?.coachNotes && (
                <p className="text-[11px] text-slate-400 italic leading-snug border-t border-slate-100 pt-3">{viewing.data_json.coachNotes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
