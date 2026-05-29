import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Workflow, Trash2, Sparkles, X, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { useLanguage } from '../context/LanguageContext';

interface WorkflowsListProps {
  onBack: () => void;
  onOpen: (id: string | null) => void;
}

interface WorkflowRow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  updated_at: string;
}

export default function WorkflowsList({ onBack, onOpen }: WorkflowsListProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  // Galería de plantillas de fábrica.
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [creatingTpl, setCreatingTpl] = useState<string | null>(null);

  const openTemplates = async () => {
    setShowTemplates(true);
    if (templates.length === 0) {
      setTplLoading(true);
      try {
        const d = await fetchWithAuth('/workflows/starter-templates');
        setTemplates(Array.isArray(d?.templates) ? d.templates : []);
      } catch { setTemplates([]); }
      finally { setTplLoading(false); }
    }
  };

  const createFromTemplate = async (tpl: any) => {
    if (creatingTpl) return;
    setCreatingTpl(tpl.id);
    try {
      const def = await fetchWithAuth('/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: tpl.name, description: tpl.description, nodes: tpl.nodes, edges: tpl.edges }),
      });
      setShowTemplates(false);
      if (def?.id) onOpen(def.id);
    } catch (err) {
      console.error('Error creating workflow from template:', err);
      setToggleError(t('workflow_template_failed', { defaultValue: 'No se pudo crear el workflow desde la plantilla.' }));
    } finally {
      setCreatingTpl(null);
    }
  };

  const load = () => {
    setLoading(true);
    fetchWithAuth('/workflows?limit=200')
      .then(d => setItems(unwrapList<WorkflowRow>(d)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    // Confirmación antes de borrar — antes un clic en la papelera borraba
    // sin aviso y tragaba el error en silencio.
    const ok = window.confirm(
      t('workflow_delete_confirm', { defaultValue: '¿Eliminar este workflow? Esta acción no se puede deshacer.' })
    );
    if (!ok) return;
    try {
      await fetchWithAuth(`/workflows/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error('Error deleting workflow:', err);
      setToggleError(t('workflow_delete_failed', { defaultValue: 'No se pudo eliminar el workflow.' }));
    }
  };

  // Activar / desactivar un workflow sin abrir el builder, igual que las
  // tarjetas de automations sencillas. publish valida el grafo y aplica el
  // límite de plan; unpublish solo lo deshabilita.
  const toggle = async (w: WorkflowRow) => {
    if (busy) return;
    setBusy(w.id);
    setToggleError(null);
    const next = !w.enabled;
    setItems(prev => prev.map(x => (x.id === w.id ? { ...x, enabled: next } : x)));
    const ok = await fetchWithAuth(`/workflows/${w.id}/${next ? 'publish' : 'unpublish'}`, { method: 'POST' })
      .then((r: any) => !r?.error)
      .catch(() => false);
    if (!ok) {
      setItems(prev => prev.map(x => (x.id === w.id ? { ...x, enabled: !next } : x)));
      setToggleError(t('workflow_toggle_failed', {
        defaultValue: next
          ? 'No se pudo activar el workflow (revisa el límite de tu plan).'
          : 'No se pudo desactivar el workflow.',
      }));
    }
    setBusy(null);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 md:p-8 lg:p-10">
      <div className="w-full flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium mb-2">
              <ArrowLeft className="w-4 h-4" /> {t('back_to_automations', { defaultValue: 'Back to automations' })}
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('advanced_workflows', { defaultValue: 'Advanced Workflows' })}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('advanced_workflows_desc', { defaultValue: 'Build multi-step automations with branching logic.' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={openTemplates}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95">
              <Sparkles className="w-5 h-5" /> {t('workflow_templates', { defaultValue: 'Plantillas' })}
            </button>
            <button onClick={() => onOpen(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all active:scale-95">
              <Plus className="w-5 h-5" /> {t('new_workflow', { defaultValue: 'New Workflow' })}
            </button>
          </div>
        </div>

        {toggleError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {toggleError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          {loading ? (
            <div className="p-12 text-center text-slate-400">{t('loading', { defaultValue: 'Loading...' })}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Workflow className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t('no_workflows', { defaultValue: 'No workflows yet.' })}</p>
              <button onClick={() => onOpen(null)} className="text-emerald-500 font-semibold hover:underline mt-1">
                {t('build_first_workflow', { defaultValue: 'Build your first workflow' })}
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {items.map(w => (
                <div key={w.id}
                  className="group flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => onOpen(w.id)}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{w.name}</div>
                    <div className="text-xs text-slate-500 truncate">{w.description || '—'}</div>
                  </div>
                  <span className={`text-xs font-semibold w-16 text-right ${w.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {w.enabled ? t('active', { defaultValue: 'Active' }) : t('inactive', { defaultValue: 'Inactive' })}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); toggle(w); }}
                    disabled={busy === w.id}
                    role="switch"
                    aria-checked={w.enabled}
                    title={w.enabled ? t('deactivate', { defaultValue: 'Deactivate' }) : t('activate', { defaultValue: 'Activate' })}
                    className={`relative w-11 h-6 shrink-0 rounded-full transition-colors cursor-pointer ${w.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'} ${busy === w.id ? 'opacity-50 cursor-wait' : ''}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${w.enabled ? 'translate-x-5' : ''}`} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); remove(w.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplates(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" /> {t('workflow_templates', { defaultValue: 'Plantillas' })}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{t('workflow_templates_desc', { defaultValue: 'Automatizaciones de suscripción listas para usar. Las puedes editar antes de publicar.' })}</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 pb-6 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              {tplLoading ? (
                <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => createFromTemplate(tpl)}
                      disabled={!!creatingTpl}
                      className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition disabled:opacity-50 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{tpl.name}</span>
                        {creatingTpl === tpl.id
                          ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                          : <Plus className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{tpl.description}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">{tpl.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
