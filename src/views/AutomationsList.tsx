import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Hand,
  Repeat,
  AlertTriangle,
  PartyPopper,
  Cake,
  FileText,
  Trash2,
  Pencil,
  ClipboardCheck,
  UserPlus,
  Smartphone,
  TrendingUp,
  ChevronDown,
  Zap,
  Workflow
} from 'lucide-react';
import { useAutomation, Automation } from '../context/AutomationContext';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';

const iconMap: Record<string, React.ElementType> = {
  Hand, Repeat, AlertTriangle, PartyPopper, Cake, FileText, ClipboardCheck, UserPlus, Smartphone, TrendingUp
};

interface WorkflowRow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  updated_at: string;
}

interface AutomationsListProps {
  onCreateNew: () => void;
  onCreateWorkflow: () => void;
  onEdit: (automation: Automation) => void;
  onOpenWorkflow: (id: string) => void;
}

export default function AutomationsList({ onCreateNew, onCreateWorkflow, onEdit, onOpenWorkflow }: AutomationsListProps) {
  const { t } = useLanguage();
  const { automations, toggleAutomation, deleteAutomation, loading: autosLoading } = useAutomation();
  const { clients } = useClient();
  const [search, setSearch] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Workflows avanzados — se listan junto a las automatizaciones simples en
  // esta misma pantalla. La elección simple vs. workflow ocurre en "New
  // Automation"; aquí ambos tipos conviven en una sola tabla y cuentan juntos.
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [wfBusy, setWfBusy] = useState<string | null>(null);
  const [wfError, setWfError] = useState<string | null>(null);
  const [wfLoading, setWfLoading] = useState(true);

  const loadWorkflows = () => {
    setWfLoading(true);
    fetchWithAuth('/workflows?limit=200')
      .then(d => setWorkflows(unwrapList<WorkflowRow>(d)))
      .catch(() => setWorkflows([]))
      .finally(() => setWfLoading(false));
  };
  useEffect(() => { loadWorkflows(); }, []);

  // Carga inicial de la lista: simples (contexto) o workflows (fetch) aún en
  // vuelo. Sólo pintamos skeletons cuando todavía no hay nada que mostrar, para
  // no tapar filas ya visibles durante un refresco.
  const isInitialLoading = (autosLoading || wfLoading) && (automations.length + workflows.length) === 0;

  // Activar / desactivar un workflow sin abrir el builder. publish valida el
  // grafo y aplica el límite del plan; unpublish solo lo deshabilita.
  const toggleWorkflow = async (w: WorkflowRow) => {
    if (wfBusy) return;
    setWfBusy(w.id);
    setWfError(null);
    const next = !w.enabled;
    setWorkflows(prev => prev.map(x => (x.id === w.id ? { ...x, enabled: next } : x)));
    const ok = await fetchWithAuth(`/workflows/${w.id}/${next ? 'publish' : 'unpublish'}`, { method: 'POST' })
      .then((r: any) => !r?.error)
      .catch(() => false);
    if (!ok) {
      setWorkflows(prev => prev.map(x => (x.id === w.id ? { ...x, enabled: !next } : x)));
      setWfError(t('workflow_toggle_failed', {
        defaultValue: next
          ? 'No se pudo activar el workflow (revisa el límite de tu plan).'
          : 'No se pudo desactivar el workflow.',
      }));
    }
    setWfBusy(null);
  };

  const removeWorkflow = async (id: string) => {
    await fetchWithAuth(`/workflows/${id}`, { method: 'DELETE' }).catch(() => {});
    loadWorkflows();
  };

  const s = search.toLowerCase();
  const filteredAutos = automations.filter(a =>
    a.name.toLowerCase().includes(s) ||
    (a.trigger_id || '').toLowerCase().includes(s)
  );
  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(s) ||
    (w.description || '').toLowerCase().includes(s)
  );

  // Contadores unificados: las automatizaciones complejas (workflows) cuentan
  // junto con las simples — el total y los activos son la suma de ambos.
  const totalCount = automations.length + workflows.length;
  const activeCount =
    automations.filter(a => a.enabled).length + workflows.filter(w => w.enabled).length;
  const shownCount = filteredAutos.length + filteredWorkflows.length;

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 md:p-8 lg:p-10 gap-6">
      <div className="w-full flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('automate_messages')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('manage_automations_desc')}
              <span className="font-semibold text-emerald-600"> {activeCount} {t('of_total', { defaultValue: 'of' })} {totalCount}</span> {t('active')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none w-56 placeholder-slate-400"
                placeholder={t('search_automations')}
                type="text"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all transform active:scale-95"
              >
                <Plus className="w-5 h-5" />
                {t('new_automation')}
                <ChevronDown className={`w-4 h-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCreateMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => { setShowCreateMenu(false); onCreateNew(); }}
                      className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {t('simple_automation', { defaultValue: 'Simple Automation' })}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t('simple_automation_desc', { defaultValue: 'One trigger, one message — the 3-step wizard.' })}
                        </div>
                      </div>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                    <button
                      onClick={() => { setShowCreateMenu(false); onCreateWorkflow(); }}
                      className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                        <Workflow className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {t('advanced_workflow', { defaultValue: 'Advanced Workflow' })}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t('advanced_workflow_desc', { defaultValue: 'Visual builder with branching, conditions and multiple actions.' })}
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {wfError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {wfError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">{t('automation_name')}</div>
            <div className="col-span-3 hidden md:block">{t('trigger_label')}</div>
            <div className="col-span-3 hidden sm:block">{t('message_preview')}</div>
            <div className="col-span-2 text-right md:col-span-2">{t('status')}</div>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Carga inicial: filas skeleton que imitan el grid de 12 columnas
                (icono + nombre/desc + badge de trigger + preview + estado). */}
            {isInitialLoading && (
              <div aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-12 gap-4 p-5 items-center">
                      <div className="col-span-4 flex items-center gap-4">
                        <SkeletonCircle size={40} className="rounded-xl" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-2/3" />
                          <Skeleton className="h-2.5 w-1/2" />
                        </div>
                      </div>
                      <div className="col-span-3 hidden md:block">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                      </div>
                      <div className="col-span-3 hidden sm:block">
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="col-span-5 md:col-span-2 flex justify-end">
                        <Skeleton className="h-6 w-11 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isInitialLoading && shownCount === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                {t('no_automations_found')}{' '}
                <button onClick={onCreateNew} className="text-emerald-500 font-semibold hover:underline">{t('create_one')}</button>
              </div>
            )}

            {/* Automatizaciones simples */}
            {filteredAutos.map((auto) => {
              const Icon = iconMap[auto.icon_info?.iconName] || FileText;
              return (
                <div key={auto.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 p-5 items-center">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${auto.icon_info?.iconBg || 'bg-slate-100'} ${auto.icon_info?.iconColor || 'text-slate-500'} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{auto.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate text-slate-500">{auto.description}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden md:flex items-center text-sm text-slate-500 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium truncate">
                        {auto.trigger_id}
                      </span>
                    </div>
                    <div className="col-span-3 hidden sm:block">
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-4">
                        {auto.message_preview || auto.message}
                      </p>
                    </div>
                    <div className="col-span-5 md:col-span-2 flex justify-end items-center gap-2">
                      {/* Edit and Delete hidden until hover */}
                      <button
                        onClick={() => onEdit(auto)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAutomation(auto.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title={t('delete_label')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={auto.enabled}
                          onChange={() => toggleAutomation(auto.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 dark:peer-focus:ring-emerald-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Workflows avanzados — misma tabla, fila identificada con icono y badge */}
            {filteredWorkflows.map((w) => (
              <div key={w.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 p-5 items-center">
                  <div
                    className="col-span-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => onOpenWorkflow(w.id)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{w.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {w.description || t('advanced_workflow_desc', { defaultValue: 'Visual builder with branching, conditions and multiple actions.' })}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 hidden md:flex items-center text-sm">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-medium truncate">
                      {t('advanced_workflow', { defaultValue: 'Advanced Workflow' })}
                    </span>
                  </div>
                  <div className="col-span-3 hidden sm:block">
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-4">{w.description || '—'}</p>
                  </div>
                  <div className="col-span-5 md:col-span-2 flex justify-end items-center gap-2">
                    <button
                      onClick={() => onOpenWorkflow(w.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                      title={t('edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeWorkflow(w.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title={t('delete_label')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <label className={`relative inline-flex items-center ${wfBusy === w.id ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={w.enabled}
                        disabled={wfBusy === w.id}
                        onChange={() => toggleWorkflow(w)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 dark:peer-focus:ring-emerald-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{t('showing_automations', { shown: shownCount, total: totalCount })}</span>
            <span className="text-xs">{t('clients_receive_active_messages', { count: clients.length })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
