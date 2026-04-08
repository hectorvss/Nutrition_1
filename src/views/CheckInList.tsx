import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import {
  Search,
  Download,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

interface CheckInListProps {
  onViewHistory: (clientId: string) => void;
  onManageTemplates: () => void;
}

export default function CheckInList({ onViewHistory, onManageTemplates }: CheckInListProps) {
  const { clients, isLoading: isClientsLoading } = useClient();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'All' | 'Unreviewed' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignments() {
      setIsAssignmentsLoading(true);
      try {
        const data = await fetchWithAuth('/check-ins/manager/checkin-assignments');
        const map: Record<string, string> = {};
        data.forEach((a: any) => {
          map[a.client_id] = a.template.name;
        });
        setAssignments(map);
      } catch (err) {
        console.error('Error loading assignments:', err);
      } finally {
        setIsAssignmentsLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const handleOpenAssign = async (e: React.MouseEvent, client: any) => {
    e.stopPropagation();
    setSelectedClient(client);
    setIsModalOpen(true);
    try {
      const templates = await fetchWithAuth('/check-ins/manager/checkin-templates');
      setAvailableTemplates(templates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const handleAssign = async (templateId: string) => {
    if (!selectedClient) return;
    setIsAssigning(templateId);
    try {
      await fetchWithAuth('/check-ins/manager/assign-template', {
        method: 'POST',
        body: JSON.stringify({
          client_id: selectedClient.id,
          template_id: templateId
        })
      });
      const template = availableTemplates.find(t => t.id === templateId);
      setAssignments(prev => ({ ...prev, [selectedClient.id]: template?.name || 'Assigned' }));
      setIsModalOpen(false);
    } catch (err) {
      alert('Error assigning template');
    } finally {
      setIsAssigning(null);
    }
  };

  const isLoading = isClientsLoading || isAssignmentsLoading;

  const categories = [
    { id: 'All', label: t('filter_all'), count: clients.length },
    { id: 'Unreviewed', label: t('filter_unreviewed'), count: clients.filter(c => c.isUnreviewed).length },
    { id: 'Completed', label: t('filter_completed'), count: clients.filter(c => !c.isUnreviewed && c.lastCheckInDate).length },
  ];

  const enrichedClients = clients.map((c) => {
    return {
      id: c.id,
      name: c.name,
      adherence: c.progress || 0,
      weight: c.weight ? `${c.weight}kg` : '--',
      nutritionAdherence: c.plan_name || '--',
      submitted: c.lastCheckInDate
        ? new Date(c.lastCheckInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : t('no_checkins_label'),
      avatar: c.avatar,
      initials: c.name.substring(0, 2).toUpperCase(),
      unreviewed: c.isUnreviewed,
      hasCheckIns: !!c.lastCheckInDate,
    };
  });

  const filteredClients = enrichedClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Unreviewed') return matchesSearch && client.unreviewed;
    if (filter === 'Completed') return matchesSearch && client.hasCheckIns && !client.unreviewed;
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('checkin_list_title')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('checkin_list_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onManageTemplates}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            {t('checkin_templates_btn')}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {(['All', 'Unreviewed', 'Completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'Unreviewed' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 font-medium text-sm">{t('no_clients_match')}</p>
            </div>
          ) : filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => onViewHistory(client.id)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer overflow-hidden relative"
            >
              {client.unreviewed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
              )}
              <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="relative">
                    {client.avatar ? (
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border-2 border-white shadow-sm">
                        {client.initials}
                      </div>
                    )}
                    {client.unreviewed && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{client.name}</h3>
                      {client.unreviewed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider text-amber-600 bg-amber-50 border-amber-200">
                          {t('pending_review')}
                        </span>
                      )}
                      {!client.hasCheckIns && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider text-slate-400 bg-slate-50 border-slate-200">
                          {t('no_checkins_label')}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleOpenAssign(e, client)}
                        className="ml-auto px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 flex items-center gap-1.5 shadow-sm"
                      >
                         <span className="material-symbols-outlined text-[14px]">assignment_add</span>
                         {assignments[client.id] || t('assign_template')}
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{t('adherence_score')}</span>
                        <span className="text-slate-900">{client.adherence}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            client.adherence >= 90 ? 'bg-emerald-500' :
                            client.adherence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${client.adherence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('last_checkin')}</p>
                    <p className="text-xs font-bold text-slate-600">{client.submitted}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold text-slate-900">{client.weight}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('weight')}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('assign_checkin_modal')}</h3>
                <p className="text-xs text-slate-500 font-medium tracking-tight">{t('assign_checkin_for', { name: selectedClient?.name })}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {availableTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">{t('no_templates_available')}</p>
                  <button onClick={() => { setIsModalOpen(false); onManageTemplates(); }} className="mt-4 text-emerald-500 text-xs font-bold uppercase tracking-widest hover:underline">{t('go_to_library')}</button>
                </div>
              ) : (
                availableTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => handleAssign(t.id)}
                    disabled={!!isAssigning}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group
                      ${isAssigning === t.id ? 'opacity-70 cursor-wait' : !!isAssigning ? 'opacity-50 cursor-not-allowed' : ''}
                      ${assignments[selectedClient?.id] === t.name 
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30 ring-1 ring-emerald-500/20' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${assignments[selectedClient?.id] === t.name ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.name}
                      </p>
                      {t.is_default && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{t('recommended')}</span>}
                    </div>
                    {isAssigning === t.id ? (
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : assignments[selectedClient?.id] === t.name ? (
                      <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-300 transition-colors">radio_button_unchecked</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
