import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Flame, Utensils, Pencil, Trash2,
  ClipboardList, LayoutGrid, Rows3,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { Skeleton } from '../components/ui/Skeleton';

interface NutritionPlanTemplatesProps {
  onBack: () => void;
  /** Open the real plan editor on a template (create one first if needed). */
  onEditTemplate: (templateId: string, templateName: string) => void;
}

interface Template {
  id: string; key?: string; name: string; description?: string;
  target_calories: number; data_json?: any;
}

export default function NutritionPlanTemplates({ onBack, onEditTemplate }: NutritionPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'rows'>('grid');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/nutrition-templates?limit=200').then(unwrapList)
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch((e) => {
        // Don't silence the failure — leave the list empty and warn the user.
        console.error('load nutrition templates failed', e);
        setTemplates([]);
        window.alert(t('nutrition_templates_load_failed', {
          defaultValue: 'No se pudieron cargar las plantillas. Recarga la página o vuelve a intentarlo.',
        }));
      })
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Create a blank template, then jump straight into the real plan editor.
  const createAndEdit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const created = await fetchWithAuth('/manager/nutrition-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: t('new_template_name', { defaultValue: 'Nueva plantilla' }),
          description: '',
          target_calories: 2000,
          data_json: { type: 'template', macros: { p: 30, c: 45, f: 25 }, meals: [] },
        }),
      });
      onEditTemplate(created.key || created.id, created.name);
    } catch (e) {
      console.error('create template failed', e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t('confirm_delete_template', { defaultValue: `¿Borrar la plantilla "${tpl.name}"?` }))) return;
    try {
      await fetchWithAuth(`/manager/nutrition-templates/${tpl.key || tpl.id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('delete nutrition template failed', e);
      window.alert(t('nutrition_template_delete_failed', {
        defaultValue: 'No se pudo borrar la plantilla. Inténtalo de nuevo.',
      }));
    }
    load();
  };

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> {t('nutrition')}
            </button>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-6 h-6 text-emerald-500" />
              {t('plan_templates_title', { defaultValue: 'Plantillas de Plan' })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('plan_templates_manage_desc', { defaultValue: 'Crea y gestiona plantillas reutilizables para asignar a tus clientes.' })}
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
            <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
              {Array.from({ length: layout === 'grid' ? 9 : 8 }).map((_, i) => (
                layout === 'rows' ? (
                  <div key={`sk-${i}`} className="flex items-center gap-4 p-4 border border-slate-200/70 rounded-xl">
                    <Skeleton className="h-4 w-20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-2" />
                    </div>
                    <Skeleton className="h-3 w-10 hidden md:block" />
                  </div>
                ) : (
                  <div key={`sk-${i}`} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-3/4 mt-3" />
                    <Skeleton className="h-3 w-1/2 mt-2" />
                    <Skeleton className="h-2 w-full mt-4 rounded-full" />
                    <div className="flex items-center gap-3 mt-3">
                      <Skeleton className="h-2 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                )
              ))}
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
                const macros = tpl.data_json?.macros;
                const mealCount = tpl.data_json?.meals?.length;
                const edit = () => onEditTemplate(tpl.key || tpl.id, tpl.name);
                if (layout === 'rows') {
                  return (
                    <div key={tpl.id || tpl.key} onClick={edit}
                      className="group flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors">
                      <div className="flex items-center gap-1.5 text-orange-500 font-bold w-24 shrink-0">
                        <Flame className="w-4 h-4" /><span>{(tpl.target_calories || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">kcal</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{tpl.name}</h3>
                        {macros && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 max-w-[120px] bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                              <div className="bg-blue-500 h-full" style={{ width: `${macros.p}%` }} />
                              <div className="bg-emerald-500 h-full" style={{ width: `${macros.c}%` }} />
                              <div className="bg-amber-500 h-full" style={{ width: `${macros.f}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{macros.p}P · {macros.c}C · {macros.f}F</span>
                          </div>
                        )}
                      </div>
                      {mealCount != null && <span className="text-[11px] font-bold text-slate-400 hidden md:flex items-center gap-1 shrink-0"><Utensils className="w-3.5 h-3.5" />{mealCount}</span>}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <div className="flex items-center gap-1.5 text-orange-500 font-bold text-lg">
                          <Flame className="w-5 h-5" />
                          {(tpl.target_calories || 0).toLocaleString()}
                          <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">kcal</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mt-1 truncate">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description || '—'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); edit(); }} className="p-1.5 text-slate-400 hover:text-emerald-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); remove(tpl); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {macros && (
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex mt-3">
                        <div className="bg-blue-500 h-full" style={{ width: `${macros.p}%` }}></div>
                        <div className="bg-emerald-500 h-full" style={{ width: `${macros.c}%` }}></div>
                        <div className="bg-amber-500 h-full" style={{ width: `${macros.f}%` }}></div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {macros && <span>{macros.p}P · {macros.c}C · {macros.f}F</span>}
                      {mealCount != null && (
                        <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{mealCount} {t('meals', { defaultValue: 'comidas' })}</span>
                      )}
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
