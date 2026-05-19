import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Dumbbell, Pencil, Trash2,
  ClipboardList, LayoutGrid, Rows3,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';

interface TrainingPlanTemplatesProps {
  onBack: () => void;
  /** Open the real workout editor on a template (create one first if needed). */
  onEditTemplate: (templateId: string, templateName: string) => void;
}

interface Template {
  id: string; key?: string; name: string; description?: string;
  level?: string; type?: string; weekly_frequency?: number; data_json?: any;
}

export default function TrainingPlanTemplates({ onBack, onEditTemplate }: TrainingPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'rows'>('grid');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/training-templates')
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const createAndEdit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const created = await fetchWithAuth('/manager/training-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: t('new_template_name', { defaultValue: 'Nueva plantilla' }),
          description: '', level: 'Intermediate', weekly_frequency: 3,
          data_json: { type: 'template', weeklySchedule: {}, workouts: [] },
        }),
      });
      onEditTemplate(created.key || created.id, created.name);
    } catch (e) {
      console.error('create training template failed', e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t('confirm_delete_template', { defaultValue: `¿Borrar la plantilla "${tpl.name}"?` }))) return;
    await fetchWithAuth(`/manager/training-templates/${tpl.key || tpl.id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

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
                const workoutCount = tpl.data_json?.workouts?.length;
                const edit = () => onEditTemplate(tpl.key || tpl.id, tpl.name);
                if (layout === 'rows') {
                  return (
                    <div key={tpl.id || tpl.key} onClick={edit}
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
                        <button onClick={(e) => { e.stopPropagation(); edit(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={tpl.id || tpl.key} onClick={edit}
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
                        <button onClick={(e) => { e.stopPropagation(); edit(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
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
