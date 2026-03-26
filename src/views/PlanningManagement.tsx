import React from 'react';
import { useClient } from '../context/ClientContext';

const PlanningManagement: React.FC<{ onNavigate: (view: string, clientId?: string) => void }> = ({ onNavigate }) => {
  const { clients: globalClients } = useClient();
  
  const clients = globalClients.map((client) => {
    const hasActivePlan = client.planningAssigned;
    return {
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      status: hasActivePlan ? 'ACTIVE' : 'NO_PLAN',
      roadmapStatus: hasActivePlan ? 'PLAN ASSIGNED' : 'NO STRATEGIC PLAN',
      online: client.status === 'Active',
      roadmapProgress: hasActivePlan ? 'Live' : 'Needs Setup',
      planFamilyLabel: client.planFamilyLabel
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
                <h2 className="text-3xl font-bold text-slate-900">Planning Management</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Structure blocks and set long-term goals for your clients</p>
              </div>
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
                  Drafting
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg font-black">4</span>
                </button>
                <button className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2">
                  Active Roadmap
                  <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-lg font-black">12</span>
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
                    const view = client.status === 'ACTIVE' ? 'planning-detail' : 'planning-template-selector';
                    onNavigate(view, client.id);
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
                            client.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {client.roadmapStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">map</span>
                            <span>Roadmap: {client.planFamilyLabel || 'Not Defined'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                            <span>Timeline: 12 Weeks</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end pl-[5.25rem] md:pl-0">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Update</span>
                        <span className="text-xs font-bold text-slate-600">2 days ago</span>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const view = client.status === 'ACTIVE' ? 'planning-detail' : 'planning-template-selector';
                          onNavigate(view, client.id);
                        }}
                        className={`px-6 py-2.5 rounded-xl transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap border ${
                          client.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-slate-900 text-white border-slate-900 hover:bg-black'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {client.status === 'ACTIVE' ? 'route' : 'add'}
                        </span>
                        {client.status === 'ACTIVE' ? 'Edit Roadmap' : 'Setup Roadmap'}
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

export default PlanningManagement;
