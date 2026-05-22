import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Workflow, Trash2 } from 'lucide-react';
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

  const load = () => {
    setLoading(true);
    fetchWithAuth('/workflows?limit=200')
      .then(d => setItems(unwrapList<WorkflowRow>(d)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await fetchWithAuth(`/workflows/${id}`, { method: 'DELETE' }).catch(() => {});
    load();
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
          <button onClick={() => onOpen(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all active:scale-95">
            <Plus className="w-5 h-5" /> {t('new_workflow', { defaultValue: 'New Workflow' })}
          </button>
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
    </div>
  );
}
