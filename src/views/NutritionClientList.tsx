import React from 'react';
import {
  Search,
  ClipboardList,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

interface NutritionClientListProps {
  onNavigate: (view: 'plan-templates' | 'plan-detail' | 'food-library', client?: any) => void;
}

export default function NutritionClientList({ onNavigate }: NutritionClientListProps) {
  const { t } = useLanguage();
  const { clients: globalClients } = useClient();

  const clients = globalClients.map((client) => {
    const hasPlan = client.nutritionPlanAssigned;
    // Resolve the goal: profile goal → plan/roadmap goal → (if a plan exists) the
    // plan's name → only then "Not Set". A client WITH a plan never shows "Not Set".
    const rawGoal = client.goal && client.goal !== 'Not Set' ? client.goal : null;
    const goalRaw = rawGoal
      || client.nutritionPlanGoal
      || (hasPlan ? (client.plan && client.plan !== 'No Plan' ? client.plan : t('active_plan_status')) : 'Not Set');
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
      // Plan-derived data from the client's assigned nutrition plan.
      target: client.nutritionPlan?.calories
        ? `${client.nutritionPlan.calories.toLocaleString()} kcal`
        : (hasPlan ? null : t('pending_setup')),
      macros: client.nutritionPlan?.macros || null,
      macroValues: client.nutritionPlan?.macros
        ? {
            p: `${client.nutritionPlan.macros.p}%`,
            c: `${client.nutritionPlan.macros.c}%`,
            f: `${client.nutritionPlan.macros.f}%`,
          }
        : null,
      adherence: null,
      streak: null,
      status: hasPlan ? t('active_plan_status') : t('new_client_status'),
      statusType: hasPlan ? 'normal' : 'warning',
      nutritionPlanAssigned: hasPlan,
    };
  });

  return (
    <div className="w-full p-6 md:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('nutrition')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('nutrition_subtitle')}</p>
            </div>
            <button 
              onClick={() => onNavigate('plan-templates')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold"
            >
              <ClipboardList className="w-5 h-5" />
              <span>{t('plan_templates_btn')}</span>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-4">{t('client_label')}</div>
          <div className="col-span-3">{t('goal_short')}</div>
          <div className="col-span-3">{t('daily_macros_label')}</div>
          <div className="col-span-2 text-right">{t('actions')}</div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto">
          {clients.map((client) => (
            <div 
              key={client.id}
              onClick={() => onNavigate('plan-detail', client)}
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
                      <div 
                        className="w-12 h-12 rounded-2xl bg-cover bg-center shadow-sm" 
                        style={{ backgroundImage: `url("${client.avatar}")` }} 
                      />
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
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                      client.goalRaw === 'Weight Loss' ? 'bg-blue-50 text-blue-700' :
                      client.goalRaw === 'Muscle Gain' ? 'bg-purple-50 text-purple-700' :
                      client.goalRaw === 'Maintenance' ? 'bg-emerald-50 text-emerald-700' :
                      client.goalRaw === 'Keto Diet' ? 'bg-orange-50 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {client.goal}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{client.target || '—'}</p>
                </div>

                {/* Macros */}
                <div className="col-span-3">
                  {client.macros ? (
                    <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>P</span><span>C</span><span>F</span>
                      </div>
                      <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${client.macros.p}%` }}></div>
                        <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${client.macros.c}%` }}></div>
                        <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${client.macros.f}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{client.macroValues.p}</span>
                        <span>{client.macroValues.c}</span>
                        <span>{client.macroValues.f}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">{t('no_active_plan_assigned')}</span>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-2 flex justify-end">
                  {client.nutritionPlanAssigned ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('plan-detail', client); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      {t('view_plan_btn', { defaultValue: 'Ver Plan' })}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigate('plan-detail', client); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      {t('assign_program_btn', { defaultValue: 'Asignar Plan' })}
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
}
