import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Pencil, Trash2, ClipboardList,
  LayoutGrid, Rows3, Calendar, Layers, Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';

interface PlanningPlanTemplatesProps {
  onBack: () => void;
  /** Open a planning template in the full roadmap editor (template mode). */
  onEditTemplate: (templateId: string) => void;
}

interface Template {
  id: string; key?: string; name: string; description?: string;
  goal_type?: string; intensity?: string; duration_weeks?: number; phases?: number;
  data_json?: any;
}

export default function PlanningPlanTemplates({ onBack, onEditTemplate }: PlanningPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'rows'>('grid');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/planning-templates?limit=200').then(unwrapList)
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Create a blank template, then jump straight into the roadmap editor.
  const createAndEdit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const created = await fetchWithAuth('/manager/planning-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: t('new_template_name', { defaultValue: 'Nueva plantilla' }),
          description: '',
          goal_type: 'fat_loss',
          intensity: 'moderate',
          duration_weeks: 12,
          phases: 1,
          data_json: { type: 'roadmap-template', nutrition: [], training: [], goals: [], milestones: [] },
        }),
      });
      onEditTemplate(created.key || created.id);
    } catch (e) {
      console.error('create planning template failed', e);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> {t('planning_management', { defaultValue: 'Planificación' })}
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Grid className="w-6 h-6 text-emerald-500" />
              {t('planning_templates_title', { defaultValue: 'Plantillas de Planificación' })}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('planning_templates_manage_desc', { defaultValue: 'Crea y gestiona hojas de ruta reutilizables para asignar a tus clientes.' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setLayout('grid')} title={t('grid_view', { defaultValue: 'Cuadrícula' })}
                className={`p-2 rounded-lg transition-colors ${layout === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setLayout('rows')} title={t('rows_view', { defaultValue: 'Filas' })}
                className={`p-2 rounded-lg transition-colors ${layout === 'rows' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <Rows3 className="w-4 h-4" />
              </button>
            </div>
            <button onClick={createAndEdit} disabled={busy}
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
              <button onClick={createAndEdit} className="text-emerald-500 font-semibold hover:underline">
                {t('create_first_template', { defaultValue: 'Crea la primera' })}
              </button>
            </div>
          ) : (
            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
              {templates.map((tpl) => {
                const open = () => onEditTemplate(tpl.key || tpl.id);
                if (layout === 'rows') {
                  return (
                    <div key={tpl.id || tpl.key} onClick={open}
                      className="group flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold w-24 shrink-0">
                        <Calendar className="w-4 h-4" /><span>{tpl.duration_weeks || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">{t('weeks_label', { defaultValue: 'sem' })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tpl.description || '—'}</p>
                      </div>
                      {tpl.phases != null && <span className="text-[11px] font-bold text-slate-400 hidden md:flex items-center gap-1 shrink-0"><Layers className="w-3.5 h-3.5" />{tpl.phases}</span>}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); open(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={tpl.id || tpl.key} onClick={open}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                          <Calendar className="w-5 h-5" />
                          {tpl.duration_weeks || 0}
                          <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('weeks_label', { defaultValue: 'semanas' })}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mt-1 truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{tpl.description || '—'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}
