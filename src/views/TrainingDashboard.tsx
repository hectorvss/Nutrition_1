import React, { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

const TrainingDashboard: React.FC<{ onNavigate: (view: string, clientId?: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { clients: globalClients } = useClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'no_plan'>('all');

  const allClients = globalClients.map((client) => {
    const hasPlan = client.trainingPlanAssigned;
    return {
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      status: hasPlan ? t('in_progress_status') : t('no_plan_status'),
      trainingPlanAssigned: hasPlan
    };
  });

  const inProgressCount = allClients.filter(c => c.trainingPlanAssigned).length;
  const noPlanCount = allClients.filter(c => !c.trainingPlanAssigned).length;

  const clients = allClients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'in_progress' ? c.trainingPlanAssigned :
      !c.trainingPlanAssigned;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
        <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{t('training_management')}</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('training_mgmt_desc')}</p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
                {t('new_workout_plan')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-2">
              <div className="relative w-full sm:w-96">
                <span className="material-symbols-outlined text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 text-[20px]">search</span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-slate-50 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 transition-all font-medium"
                  placeholder={t('search_client_placeholder')}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('all_clients')}
                  <span className="ml-2 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-black">{allClients.length}</span>
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    statusFilter === 'in_progress'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('in_progress_status')}
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg font-black">{inProgressCount}</span>
                </button>
                <button
                  onClick={() => setStatusFilter('no_plan')}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    statusFilter === 'no_plan'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('no_plan_status')}
                  <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-lg font-black">{noPlanCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => {
                    onNavigate('weekly-view', client);
                  }}
                  className="group p-6 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex gap-5 items-center flex-1 w-full">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm border border-slate-100"
                          style={{ backgroundImage: `url("${client.avatar}")` }}
                        ></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            client.status === t('in_progress_status') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            client.status === t('no_plan_status') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end pl-[5.25rem] md:pl-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!client.trainingPlanAssigned) {
                            onNavigate('assign-program', client.id);
                          } else {
                            onNavigate('workout-editor', client.id);
                          }
                        }}
                        className={`px-6 py-2.5 rounded-xl transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap border ${
                          !client.trainingPlanAssigned
                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {!client.trainingPlanAssigned ? 'assignment_add' : 'calendar_month'}
                        </span>
                        {!client.trainingPlanAssigned ? t('assign_program') : t('manage_program_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
