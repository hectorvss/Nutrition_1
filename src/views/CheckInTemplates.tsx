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
  Archive
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { CheckInTemplate } from '../types/checkIn';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_CHECKIN_TEMPLATE } from '../constants/defaultCheckInTemplate';
import { localizeSchema, localizeText } from '../constants/templateI18n';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton } from '../components/ui/Skeleton';

interface CheckInTemplatesProps {
  onEdit?: (templateId: string) => void;
}

export default function CheckInTemplates({ onEdit }: CheckInTemplatesProps) {
  const { settings } = useTheme();
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = unwrapList(await fetchWithAuth('/check-ins/manager/checkin-templates?limit=200'));
      // Normalize templates from API
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

  const handleCreateFromDefault = async () => {
    try {
      // The new template is born in the manager's current language: both the
      // name and the whole question schema are localized at creation time so
      // a Spanish coach never gets an English template.
      const newTemplate = {
        name: language === 'es' ? 'Check-in estándar' : 'Standard Check-in',
        description: t('new_template_based_on_standard_flow'),
        template_schema: localizeSchema(DEFAULT_CHECKIN_TEMPLATE.templateSchema, language),
        is_default: templates.length === 0
      };
      await fetchWithAuth('/check-ins/manager/checkin-templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_creating_template') + ': ' + err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}/duplicate`, {
        method: 'POST'
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_duplicating_template') + ': ' + err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
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
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_updating_status') + ': ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string, isPermanent?: boolean) => {
    if (isPermanent) {
      alert(t('permanent_templates_cannot_be_deleted'));
      return;
    }
    const message = `${t('confirm_remove_template', { name })}
${t('template_will_be_archived_if_has_submissions')}`;
    if (!confirm(message)) return;
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
        method: 'DELETE'
      });
      loadTemplates();
    } catch (err: any) {
      alert(t('error_deleting_template') + ': ' + err.message);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('checkin_templates_library')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{t('manage_and_create_custom_checkin_structures')}</p>
        </div>
        <button 
          onClick={handleCreateFromDefault}
          style={{ backgroundColor: settings.theme_color }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('create_template')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_templates')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 dark:text-white placeholder-slate-400 font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">{t('total')}: {templates.length}</span>
        </div>
      </div>

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-5 flex flex-col shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
              <Skeleton className="h-3 w-2/3 mt-2" />
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-2 w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/40 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-red-900 dark:text-red-300 font-bold">{t('error_loading_library')}</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          <button onClick={loadTemplates} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all">
            {t('try_again')}
          </button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('no_templates_found')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-sm">
            {searchQuery ? t('try_adjusting_your_search') : t('start_creating_first_checkin_template')}
          </p>
          {!searchQuery && (
            <button 
              onClick={handleCreateFromDefault}
              className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('create_initial_template')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  {template.is_default && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {t('default')}
                    </span>
                  )}
                  {template.is_permanent && (
                    <div className="p-2" title={t('permanent_template', { defaultValue: 'Permanent template' })}>
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                </div>
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
                      if (template.is_permanent) return;
                      setRenamingId(template.id);
                      setNewName(template.name);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all ${template.is_permanent ? 'cursor-not-allowed' : ''}`}
                  >
                    {template.is_permanent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Edit2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed min-h-[40px]">
                {localizeText(template.description, language) || t('no_description_for_template')}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {(() => {
                      // The API returns snake_case (updated_at / created_at);
                      // the camelCase fallbacks were always undefined → "Invalid Date".
                      const raw = (template as any).updated_at || (template as any).created_at
                        || (template as any).updatedAt || (template as any).createdAt;
                      const d = raw ? new Date(raw) : null;
                      return d && !isNaN(d.getTime())
                        ? d.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                        : '—';
                    })()}
                  </span>
                  <span>{template.templateSchema?.length || 0} {t('steps', { defaultValue: language === 'es' ? 'pasos' : 'steps' })}</span>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <button 
                    onClick={() => handleSetDefault(template.id)}
                    disabled={template.is_default}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      template.is_default
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                  >
                    {t('set_default')}
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(template.id, !!template.is_active)}
                    className={`p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-all ${
                      template.is_active
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-900/40'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    title={template.is_active ? t('active') : t('inactive')}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicate(template.id)}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    title={t('duplicate')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id, template.name, !!template.is_permanent)}
                    disabled={template.is_permanent}
                    className={`p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-all ${
                      template.is_permanent
                        ? 'opacity-40 cursor-not-allowed grayscale'
                        : 'text-slate-600 dark:text-slate-300 hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                    }`}
                    title={template.is_permanent ? t('permanent_template') : t('delete_archive')}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit?.(template.id)}
                    style={{ backgroundColor: settings.theme_color }}
                    className="flex items-center justify-center w-10 h-10 text-white rounded-xl hover:opacity-90 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
