import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Star, 
  MoreVertical,
  Search,
  Layout,
  Clock,
  ChevronRight,
  AlertCircle,
  Edit2,
  Check,
  X,
  Archive,
  UserPlus,
  Loader2
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { CheckInTemplate } from '../types/checkIn';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeText } from '../constants/templateI18n';

interface OnboardingTemplatesProps {
  onEdit?: (templateId: string) => void;
}

export default function OnboardingTemplates({ onEdit }: OnboardingTemplatesProps) {
  const { settings } = useTheme();
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [assigningTemplateId, setAssigningTemplateId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = unwrapList(await fetchWithAuth('/onboarding/manager/templates?limit=200'));
      const normalized = data.map((t: any) => ({
        ...t,
        templateSchema: t.template_schema || t.templateSchema || []
      }));
      setTemplates(normalized);
    } catch (err: any) {
      setError(err.message || t('failed_to_load_templates'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    try {
      const newTemplate = {
        name: language === 'es' ? 'Nuevo flujo de onboarding' : 'New Onboarding Flow',
        description: t('new_onboarding_flow_description'),
        template_schema: [],
        is_default: templates.length === 0
      };
      const data = await fetchWithAuth('/onboarding/manager/templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });
      if (data?.id) onEdit?.(data.id);
      loadTemplates();
    } catch (err: any) {
      alert(t('error_creating_template') + ': ' + err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      // For now we do a manual duplication if backend doesn't have it yet
      // But let's assume we implement it in onboarding.ts
      await fetchWithAuth(`/onboarding/manager/templates/${id}/duplicate`, {
        method: 'POST'
      }).catch(async () => {
          // Fallback if duplicate route not ready
          const original = templates.find(t => t.id === id);
          if (original) {
              await fetchWithAuth('/onboarding/manager/templates', {
                  method: 'POST',
                  body: JSON.stringify({
                      name: `${original.name} (Copy)`,
                      description: original.description,
                      template_schema: original.templateSchema,
                      is_default: false
                  })
              });
          }
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_duplicating_template') + ': ' + err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_default: true })
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_setting_default') + ': ' + err.message);
    }
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName.trim() })
      });
      setRenamingId(null);
      setNewName('');
      loadTemplates();
    } catch (err: any) {
      alert(t('error_renaming_template') + ': ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('confirm_delete_template', { name }))) return;
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'DELETE'
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_deleting_template') + ': ' + err.message);
    }
  };

  const openAssignModal = async (id: string) => {
    setAssigningTemplateId(id);
    setLoadingClients(true);
    try {
      const { unwrapList } = await import('../api/unwrap');
      const data = unwrapList(await fetchWithAuth('/manager/clients?limit=200'));
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleAssign = async () => {
    if (selectedClients.length === 0 || !assigningTemplateId) return;
    setIsAssigning(true);
    try {
      await Promise.all(selectedClients.map(clientId => 
        fetchWithAuth('/onboarding/manager/assign', {
          method: 'POST',
          body: JSON.stringify({
            client_id: clientId,
            template_id: assigningTemplateId
          })
        })
      ));
      alert(t('onboarding_assigned_successfully'));
      setAssigningTemplateId(null);
      setSelectedClients([]);
    } catch (err: any) {
      alert(t('error_assigning_onboarding') + ': ' + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('onboarding_flow_library')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{t('design_manage_onboarding_questionnaires')}</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{ backgroundColor: settings.theme_color }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('create_template')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_onboarding_flows')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm border-dashed">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('loading_library')}</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/40 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-red-900 dark:text-red-300 font-bold">{t('error_loading_library')}</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          <button onClick={loadTemplates} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all">{t('try_again')}</button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('no_onboarding_flows_found')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-sm">{t('create_first_onboarding_template_message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                {template.is_default && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    {t('default')}
                  </span>
                )}
              </div>

              {renamingId === template.id ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500 outline-none text-sm font-bold dark:bg-slate-800 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(template.id)}
                  />
                  <button onClick={() => handleRename(template.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRenamingId(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">{localizeText(template.name, language)}</h3>
                  <button
                    onClick={() => {
                      setRenamingId(template.id);
                      setNewName(template.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                    title={t('rename', { defaultValue: 'Renombrar' })}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed min-h-[40px]">
                {localizeText(template.description, language) || t('no_description_provided')}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {(() => {
                      const raw = template.updated_at || template.created_at;
                      const d = raw ? new Date(raw) : null;
                      return d && !isNaN(d.getTime())
                        ? d.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                        : '—';
                    })()}
                  </span>
                  <span>{template.templateSchema?.length || 0} {t('steps', { defaultValue: language === 'es' ? 'pasos' : 'steps' })}</span>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <button onClick={() => handleSetDefault(template.id)} disabled={template.is_default} className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${template.is_default ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>{t('set_default')}</button>
                  <button onClick={() => handleDuplicate(template.id)} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(template.id, template.name)} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => openAssignModal(template.id)} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all" title={t('assign_to_clients')}><UserPlus className="w-4 h-4" /></button>
                  <button onClick={() => onEdit?.(template.id)} style={{ backgroundColor: settings.theme_color }} className="flex items-center justify-center w-10 h-10 text-white rounded-xl hover:opacity-90 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningTemplateId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('assign_onboarding')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('select_clients_for_flow')}</p>
              </div>
              <button
                onClick={() => { setAssigningTemplateId(null); setSelectedClients([]); }}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {loadingClients ? (
                <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">{t('no_clients_found')}</div>
              ) : clients.map(client => (
                <label
                  key={client.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedClients.includes(client.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                      {(client.name || client.full_name)?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{client.name || client.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{client.email}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => {
                      if (selectedClients.includes(client.id)) {
                        setSelectedClients(selectedClients.filter(id => id !== client.id));
                      } else {
                        setSelectedClients([...selectedClients, client.id]);
                      }
                    }}
                    className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 w-5 h-5"
                  />
                </label>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => { setAssigningTemplateId(null); setSelectedClients([]); }}
                className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleAssign}
                disabled={isAssigning || selectedClients.length === 0}
                style={{ backgroundColor: settings.theme_color }}
                className="flex-[2] py-3 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : t('confirm_assignment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
