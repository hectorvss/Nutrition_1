import React from 'react';
import { useClient } from '../context/ClientContext';

const TrainingDashboard: React.FC<{ onNavigate: (view: string, clientId?: string) => void }> = ({ onNavigate }) => {
  const { clients: globalClients } = useClient();
  
  const clients = globalClients.map((client, idx) => {
    const hasPlan = client.trainingPlanAssigned;
    return {
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      status: hasPlan ? 'IN PROGRESS' : 'NO PLAN',
      frequency: '4x / week',
      phase: 'Phase 1: Hypertrophy',
      lastSession: hasPlan ? 'Yesterday' : '-',
      online: idx === 0 || idx === 1,
      trainingPlanAssigned: hasPlan,
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
        <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Training Management</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Assign and monitor workout plans for your clients</p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Workout Plan
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-2">
              <div className="relative w-full sm:w-96">
                <span className="material-symbols-outlined text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 text-[20px]">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-slate-50 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 transition-all font-medium" 
                  placeholder="Search client by name..." 
                  type="text"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
                <button className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 text-sm font-bold transition-all whitespace-nowrap">All Clients</button>
                <button className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2">
                  In Progress
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg font-black">8</span>
                </button>
                <button className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2">
                  Needs Update
                  <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-lg font-black">4</span>
                </button>
                <button className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2">
                  Drafts
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-black">2</span>
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
                        {client.online && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            client.status === 'IN PROGRESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            client.status === 'NEEDS UPDATE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            client.status === 'DRAFT' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            client.status === 'NO PLAN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">sync</span>
                            <span>{client.frequency}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">bolt</span>
                            <span>Focus: {client.phase.split(': ')[1] || client.phase}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end pl-[5.25rem] md:pl-0">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Session</span>
                        <span className="text-xs font-bold text-slate-600">{client.lastSession}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (client.status === 'NO PLAN') {
                            onNavigate('assign-program', client.id);
                          } else {
                            onNavigate('workout-editor', client.id);
                          }
                        }}
                        className={`px-6 py-2.5 rounded-xl transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap border ${
                          client.status === 'NO PLAN'
                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                            : client.status === 'NEEDS UPDATE' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : client.status === 'DRAFT'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            : client.status === 'ENDED'
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {client.status === 'NO PLAN' ? 'assignment_add' :
                           client.status === 'NEEDS UPDATE' ? 'refresh' : 
                           client.status === 'DRAFT' ? 'edit_note' : 
                           client.status === 'ENDED' ? 'history' : 'calendar_month'}
                        </span>
                        {client.status === 'NO PLAN' ? 'Assign Program' :
                         client.status === 'NEEDS UPDATE' ? 'Update Plan' : 
                         client.status === 'DRAFT' ? 'Continue Draft' : 
                         client.status === 'ENDED' ? 'Renew Program' : 'Manage Program'}
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
