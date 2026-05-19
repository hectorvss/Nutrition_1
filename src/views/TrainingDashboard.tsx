import React, { useState } from 'react';
import { Search, ClipboardList, AlertCircle, Dumbbell, CalendarDays } from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Training client list — mirrors the structure of NutritionClientList:
 * a header, a 12-column table head, and one row per client with a
 * status-dependent action button.
 */
const TrainingDashboard: React.FC<{ onNavigate: (view: string, clientId?: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { clients: globalClients } = useClient();
  const [search, setSearch] = useState('');

  const clients = globalClients.map((client) => {
    const hasPlan = client.trainingPlanAssigned;
    const goalRaw = client.goal || 'Not Set';
    const goalLabel = goalRaw === 'Weight Loss' ? t('weight_loss_goal') :
                      goalRaw === 'Muscle Gain' ? t('muscle_gain_goal') :
                      goalRaw === 'Maintenance' ? t('maintenance_goal') :
                      goalRaw === 'Keto Diet' ? t('keto_diet_goal') :
                      goalRaw;
    return {
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      initials: client.name.substring(0, 2).toUpperCase(),
      goal: goalLabel,
      goalRaw,
      status: hasPlan ? t('active_plan_status') : t('new_client_status'),
      statusType: hasPlan ? 'normal' : 'warning',
      trainingPlanAssigned: hasPlan,
    };
  }).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('training', { defaultValue: 'Entrenamiento' })}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('training_mgmt_desc')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none w-56 placeholder-slate-400"
                  placeholder={t('search_client_placeholder')}
                  type="text"
                />
              </div>
              <button
                onClick={() => onNavigate('plan-templates')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold"
              >
                <ClipboardList className="w-5 h-5" />
                <span>{t('training_templates_title', { defaultValue: 'Plantillas' })}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-4">{t('client_label')}</div>
          <div className="col-span-3">{t('goal_short')}</div>
          <div className="col-span-3">{t('training_plan_label', { defaultValue: 'Plan de entrenamiento' })}</div>
          <div className="col-span-2 text-right">{t('actions', { defaultValue: 'Acción' })}</div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto">
          {clients.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              {t('no_clients_found', { defaultValue: 'No hay clientes.' })}
            </div>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => onNavigate(client.trainingPlanAssigned ? 'weekly-view' : 'assign-program', client.trainingPlanAssigned ? (client as any) : client.id)}
              className={`group p-5 md:px-6 md:py-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative ${client.statusType === 'warning' ? 'bg-amber-50/30' : ''}`}
            >
              {client.statusType === 'warning' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r-full"></div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Client Info */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    {client.avatar ? (
                      <div className="w-12 h-12 rounded-2xl bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("${client.avatar}")` }} />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                        {client.initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">{client.name}</h3>
                    <p className={`text-xs flex items-center gap-1 ${client.statusType === 'warning' ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                      {client.statusType === 'warning' && <AlertCircle className="w-3 h-3" />}
                      {client.status}
                    </p>
                  </div>
                </div>

                {/* Goal */}
                <div className="col-span-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                    client.goalRaw === 'Weight Loss' ? 'bg-blue-50 text-blue-700' :
                    client.goalRaw === 'Muscle Gain' ? 'bg-purple-50 text-purple-700' :
                    client.goalRaw === 'Maintenance' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {client.goal}
                  </span>
                </div>

                {/* Plan status */}
                <div className="col-span-3">
                  {client.trainingPlanAssigned ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <Dumbbell className="w-4 h-4" /> {t('active_plan_status')}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">{t('no_active_plan_assigned', { defaultValue: 'Sin plan activo' })}</span>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-2 flex justify-end">
                  {client.trainingPlanAssigned ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('weekly-view', client as any); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      {t('view_plan_btn', { defaultValue: 'Ver Plan' })}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('assign-program', client.id); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      {t('assign_program', { defaultValue: 'Asignar Plan' })}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
