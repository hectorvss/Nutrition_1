import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';
import WeeklyCheckinFlow from './WeeklyCheckinFlow';
import CheckInDetailView from './CheckInDetailView';

export default function ClientCheckIns() {
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  const loadCheckIns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/check-ins/client/check-ins');
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveTemplate = async () => {
    try {
      const data = await fetchWithAuth('/check-ins/client/active-template');
      if (data) {
        setActiveTemplate({
          ...data,
          templateSchema: data.template_schema || data.templateSchema || []
        });
      }
    } catch (err) {
      console.error('Error loading active template:', err);
    }
  };

  useEffect(() => {
    loadCheckIns();
    loadActiveTemplate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  if (isCheckingIn) {
    return <WeeklyCheckinFlow onComplete={() => { setIsCheckingIn(false); loadCheckIns(); }} onCancel={() => setIsCheckingIn(false)} />;
  }

  if (selectedCheckIn) {
    return <CheckInDetailView checkIn={selectedCheckIn} onBack={() => setSelectedCheckIn(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#0f1a12] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
            <ol className="inline-flex items-center space-x-2">
              <li className="inline-flex items-center opacity-60">Check-ins</li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1 opacity-30">chevron_right</span>
                  <span className="text-slate-800 dark:text-slate-200">{user?.email?.split('@')[0] || 'Client'}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Profile Card - PREMIUM VERSION */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row w-full">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
                  <img src={`https://ui-avatars.com/api/?name=${user?.email || 'client'}&background=17cf54&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#17cf54] border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Cliente Premium</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{user?.email?.split('@')[0] || 'Client User'}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 px-5 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 text-center italic">Estado Actual</p>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#17cf54] animate-pulse shadow-sm shadow-emerald-500/50"></span>
                    Activo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar & Action Area */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-2.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-[18px] p-1.5 relative">
              <div className="relative px-8 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-600">
                {activeTemplate?.name || activeTemplate?.title || 'Check-in Diarios'}
              </div>
            </div>
            <div className="flex items-center gap-3 pr-2">
              <button 
                onClick={() => setIsCheckingIn(true)}
                className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-6 py-3 rounded-[18px] transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Nuevo Check-in
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                 <span className="w-1 h-1 rounded-full bg-[#17cf54]"></span> Total Registros
               </p>
               <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{checkIns.length}</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Envíos</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                 <span className="w-1 h-1 rounded-full bg-blue-500"></span> Última Sincro
               </p>
               <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                   {checkIns.length > 0 ? new Date(checkIns[0].date).getDate() : '0'}
                 </p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   {checkIns.length > 0 ? new Date(checkIns[0].date).toLocaleString('default', { month: 'short' }) : '—'}
                 </p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                 <span className="w-1 h-1 rounded-full bg-amber-500"></span> Adherencia
               </p>
               <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {checkIns.length > 0 ? Math.min(100, Math.round((checkIns.length / 12) * 100)) : '0'}%
                 </p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global</p>
               </div>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Historial de Revisiones</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Toda tu evolución cronológica</p>
              </div>
            </div>
            
            <div className="p-8 space-y-4">
              {checkIns.length > 0 ? checkIns.map((ci: any, idx: number) => (
                <div 
                  key={ci.id} 
                  onClick={() => setSelectedCheckIn(ci)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 hover:border-[#17cf54]/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer overflow-hidden"
                >
                   {/* Selection highlight border */}
                   <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#17cf54] opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${ci.reviewed_at ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
                           <span className="material-symbols-outlined text-2xl font-light">{ci.reviewed_at ? 'task_alt' : 'pending_actions'}</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-1 italic">Sesión de Revisión</p>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            {new Date(ci.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-10">
                         <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic mb-1">Peso Registrado</p>
                            <p className="text-base font-black text-slate-700 dark:text-slate-200 tracking-tighter">{ci.data_json?.weight ? `${ci.data_json.weight} kg` : 'N/A'}</p>
                         </div>
                         <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${ci.reviewed_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40'}`}>
                            {ci.reviewed_at ? 'Analizado' : 'Pendiente'}
                         </div>
                         <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-[#17cf54] transition-all group-hover:translate-x-1">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                         </div>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Sin Registros Previos</p>
                    <p className="text-sm text-slate-500 font-medium italic">Tu evolución clínica empezará a mostrarse aquí cuando realices tu primer check-in.</p>
                  </div>
                  <button 
                    onClick={() => setIsCheckingIn(true)}
                    className="inline-flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:text-emerald-400 transition-colors"
                  >
                    Iniciar ahora <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-20" /> {/* Final padding */}
        </div>
      </div>
    </div>
  );
}
