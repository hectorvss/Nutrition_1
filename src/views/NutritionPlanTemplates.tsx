import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Grid, Plus, Flame, Utensils, Pencil, Trash2, X, ClipboardList,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';

interface NutritionPlanTemplatesProps {
  onBack: () => void;
}

interface Template {
  id: string;
  key?: string;
  name: string;
  description?: string;
  target_calories: number;
  data_json?: any;
}

interface FormState {
  id: string | null;
  name: string;
  description: string;
  target_calories: number;
  meals: number;
  p: number;
  c: number;
  f: number;
}

const EMPTY_FORM: FormState = {
  id: null, name: '', description: '', target_calories: 1800,
  meals: 4, p: 30, c: 45, f: 25,
};

export default function NutritionPlanTemplates({ onBack }: NutritionPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setIsLoading(true);
    fetchWithAuth('/manager/nutrition-templates')
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch((e) => setError(e?.message || 'Error'))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setError(''); setEditing({ ...EMPTY_FORM }); };
  const openEdit = (tpl: Template) => {
    setError('');
    const macros = tpl.data_json?.macros || {};
    setEditing({
      id: tpl.key || tpl.id,
      name: tpl.name,
      description: tpl.description || '',
      target_calories: tpl.target_calories || 0,
      meals: tpl.data_json?.meals?.length || 4,
      p: macros.p ?? 30, c: macros.c ?? 45, f: macros.f ?? 25,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { setError(t('template_name_required', { defaultValue: 'Name is required.' })); return; }
    setSaving(true);
    setError('');
    // Build a structured data_json: macro split + N named meals (foods filled in later).
    const meals = Array.from({ length: Math.max(1, editing.meals) }, (_, i) => ({
      id: `m${i + 1}`,
      name: `${t('meal_label', { defaultValue: 'Meal' })} ${i + 1}`,
      time: '',
      items: [],
    }));
    const data_json = { type: 'template', macros: { p: editing.p, c: editing.c, f: editing.f }, meals };
    const body = JSON.stringify({
      name: editing.name.trim(),
      description: editing.description.trim(),
      target_calories: editing.target_calories,
      data_json,
    });
    try {
      if (editing.id) {
        await fetchWithAuth(`/manager/nutrition-templates/${editing.id}`, { method: 'PUT', body });
      } else {
        await fetchWithAuth('/manager/nutrition-templates', { method: 'POST', body });
      }
      setEditing(null);
      load();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (tpl: Template) => {
    if (!window.confirm(t('confirm_delete_template', { defaultValue: `Delete template "${tpl.name}"?` }))) return;
    await fetchWithAuth(`/manager/nutrition-templates/${tpl.key || tpl.id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        {/* Header */}
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
          <button
            onClick={openCreate}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            {t('create_template_btn', { defaultValue: 'Crear plantilla' })}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">{t('loading_templates', { defaultValue: 'Loading templates...' })}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <ClipboardList className="w-10 h-10 opacity-30" />
              <p className="text-sm">{t('no_templates_yet', { defaultValue: 'Aún no hay plantillas.' })}</p>
              <button onClick={openCreate} className="text-emerald-500 font-semibold hover:underline">
                {t('create_first_template', { defaultValue: 'Crea la primera' })}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((tpl) => {
                const macros = tpl.data_json?.macros;
                const mealCount = tpl.data_json?.meals?.length;
                return (
                  <div key={tpl.id || tpl.key} className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all">
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
                        <button onClick={() => openEdit(tpl)} className="p-1.5 text-slate-400 hover:text-emerald-500" title={t('edit', { defaultValue: 'Edit' })}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(tpl)} className="p-1.5 text-slate-400 hover:text-red-500" title={t('delete', { defaultValue: 'Delete' })}>
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                        <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{mealCount} {t('meals', { defaultValue: 'meals' })}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !saving && setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editing.id ? t('edit_template', { defaultValue: 'Editar plantilla' }) : t('create_template_btn', { defaultValue: 'Crear plantilla' })}
              </h3>
              <button onClick={() => !saving && setEditing(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('template_name', { defaultValue: 'Nombre' })}</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder={t('template_name_ph', { defaultValue: 'p. ej. Volumen 2500 kcal' })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('description', { defaultValue: 'Descripción' })}</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('target_calories', { defaultValue: 'Calorías' })}</label>
                  <input
                    type="number" min={0}
                    value={editing.target_calories}
                    onChange={(e) => setEditing({ ...editing, target_calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('meals_count_label', { defaultValue: 'Nº de comidas' })}</label>
                  <input
                    type="number" min={1} max={10}
                    value={editing.meals}
                    onChange={(e) => setEditing({ ...editing, meals: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('macro_split', { defaultValue: 'Reparto de macros (%)' })}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['p', 'c', 'f'] as const).map((k) => (
                    <div key={k} className="relative">
                      <input
                        type="number" min={0} max={100}
                        value={editing[k]}
                        onChange={(e) => setEditing({ ...editing, [k]: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{k}</span>
                    </div>
                  ))}
                </div>
                {editing.p + editing.c + editing.f !== 100 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    {t('macros_sum_warning', { defaultValue: 'Los macros suman' })} {editing.p + editing.c + editing.f}% ({t('should_be_100', { defaultValue: 'deberían sumar 100' })})
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} disabled={saving}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                {t('cancel', { defaultValue: 'Cancelar' })}
              </button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50">
                {saving ? t('saving', { defaultValue: 'Guardando...' }) : t('save', { defaultValue: 'Guardar' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
