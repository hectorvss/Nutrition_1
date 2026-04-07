import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { 
  Search, 
  Settings, 
  UserPlus, 
  Calendar, 
  Utensils, 
  Send, 
  Bell, 
  TrendingUp, 
  FilePlus, 
  Check, 
  Video, 
  MapPin,
  Zap,
  Loader2
} from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useCalendar, getEventPresentationInfo, EventType } from '../context/CalendarContext';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, data?: { clientId?: string; checkInId?: string }) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { tasks } = useTask();
  const { getEventsForDate, updateEvent } = useCalendar();
  const { clients } = useClient();
  const { t, language } = useLanguage();
  const [activity, setActivity] = useState<any[]>([]);
  const [attentionCheckIns, setAttentionCheckIns] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/manager/analytics');
        if (data.recentActivity) {
          setActivity(data.recentActivity);
        }
        if (data.attentionRequired) {
          setAttentionCheckIns(data.attentionRequired);
        }
        if (data.business && typeof data.business.activeClients === 'number') {
          setActiveCount(data.business.activeClients);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const combinedAttention = [
    ...attentionCheckIns,
    ...tasks.filter(t => t.status !== 'pending').map(t => ({...t, type: 'TASK'}))
  ].sort((a,b) => (b.timeLabel || '').localeCompare(a.timeLabel || ''));

  const quickActions = [
    { id: 'add-client', label: t('add_new_client'), icon: UserPlus, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'schedule', label: t('schedule_appointment'), icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { id: 'automations', label: t('manage_automations'), icon: Zap, color: 'bg-amber-50 text-amber-600' },
    { id: 'broadcast', label: t('broadcast_message'), icon: Send, color: 'bg-purple-50 text-purple-600' },
  ];

  const todayDateStr = new Date().toISOString().split('T')[0];
  const scheduleItems = getEventsForDate(todayDateStr).sort((a, b) => a.time.localeCompare(b.time));

  const locale = language === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{t('today')}, {new Date().toLocaleDateString(locale, { month: 'long', day: 'numeric'})}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('welcome_manager')}</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">{t('pending_attention', { count: combinedAttention.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Global Search and Settings buttons removed as requested */}
        </div>
      </header>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('quick_actions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button 
              key={action.id}
              onClick={() => {
                if (action.id === 'schedule') onNavigate('calendar');
                else if (action.id === 'automations') onNavigate('automations');
                else if (action.id === 'add-client') onNavigate('clients');
                else if (action.id === 'broadcast') onNavigate('messages');
              }}
              className="flex flex-col items-start gap-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group text-left"
            >
              <div className={`p-2 rounded-lg ${action.color} group-hover:bg-emerald-600 group-hover:text-white transition-colors`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-red-50 text-red-500">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">{t('attention_required')}</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500">{combinedAttention.length} {t('items')}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('loading_items')}</p>
                </div>
              ) : combinedAttention.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic">{t('no_pending_items')}</div>
              ) : null}
              {!loading && combinedAttention.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group" 
                  onClick={() => {
                    if (item.type === 'CHECK_IN') onNavigate('check-ins', { clientId: item.clientId, checkInId: item.id });
                    else if (item.type === 'MESSAGE') onNavigate('messages', { clientId: item.clientId });
                    else if (item.type === 'TASK') onNavigate('tasks');
                    else onNavigate('tasks');
                  }}
                >
                  <div className="relative">
                    {item.avatar ? (
                      <div className="w-10 h-10 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${item.avatar}")` }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">{item.client?.substring(0, 2)}</div>
                    )}
                    {item.status === 'overdue' && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">!</span>
                      </div>
                    )}
                    {item.type === 'CHECK_IN' && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                        <FilePlus className="text-[8px] text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{item.client} <span className="font-normal text-slate-500 ml-1">{t(item.title)}</span></h4>
                      <span className="text-xs text-slate-400 shrink-0">{item.timeLabel}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{item.desc}</p>
                  </div>
                  <button className="text-emerald-600 opacity-0 group-hover:opacity-100 font-semibold text-sm transition-opacity capitalize">
                    {item.type === 'CHECK_IN' ? t('review') : t('resolve')}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <button onClick={() => onNavigate('tasks')} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t('view_all_items')}</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">{t('schedule_today')}</h3>
              <button onClick={() => onNavigate('calendar')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">{t('view_calendar')}</button>
            </div>
            <div className="space-y-4">
              {scheduleItems.length === 0 && (
                <div className="text-slate-500 text-sm italic">{t('no_events_today')}</div>
              )}
              {scheduleItems.map((item) => {
                const info = getEventPresentationInfo(item.type);
                return (
                  <div key={item.id} className="flex gap-4 group/item">
                    <div className="w-16 flex flex-col items-end pt-1 shrink-0">
                      <span className="text-sm font-bold text-slate-700">{item.time.split(' ')[0]}</span>
                      <span className="text-xs text-slate-400">{item.time.includes(' ') ? item.time.split(' ')[1] : ''}</span>
                    </div>
                    <div 
                      onClick={() => onNavigate('calendar')}
                      className={`flex-1 p-4 rounded-xl border-l-4 ${info.color} relative border-t border-r border-b border-r-slate-100 border-t-slate-100 border-b-slate-100 shadow-sm transition-all cursor-pointer hover:shadow-md ${item.status === 'completed' ? 'opacity-60 grayscale' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-sm truncate mr-2 ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.title}</h4>
                          <p className={`text-xs mt-1 truncate ${item.status === 'completed' ? 'text-slate-300' : 'text-slate-600'}`}>{t('with')} {item.client || item.initials} • {t(item.type)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newStatus = item.status === 'completed' ? 'pending' : 'completed';
                              updateEvent(item.id, { status: newStatus });
                            }}
                            className={`p-1.5 rounded-lg transition-all ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 border border-slate-100'}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          {item.avatar ? (
                            <div className="w-8 h-8 rounded-full bg-cover bg-center border-2 border-white shadow-sm shrink-0" style={{ backgroundImage: `url("${item.avatar}")` }} />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold text-xs border-2 border-slate-100 shrink-0">{item.initials}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-emerald-500 text-white rounded-2xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] bg-white/10 w-32 h-32 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-emerald-100 text-sm font-medium opacity-90">{t('active_clients')}</p>
                  <h3 className="text-3xl font-bold mt-1">{activeCount}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">+3</span>
                <span>{t('since_last_month')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4 shrink-0">{t('latest_updates')}</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-2 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('fetching_updates')}</p>
                </div>
              ) : (
                <>
                  {activity.map((update, idx) => {
                    const Icon = update.type === 'CHECK_IN' ? FilePlus : (update.type === 'MESSAGE' ? Send : (update.type === 'NEW_CLIENT' ? UserPlus : Check));
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                            if (update.type === 'CHECK_IN') onNavigate('check-ins', { clientId: update.clientId, checkInId: update.checkInId });
                            else if (update.type === 'MESSAGE') onNavigate('messages', { clientId: update.clientId });
                        }}
                        className={`flex gap-4 relative before:absolute before:left-[19px] before:top-10 before:h-full before:w-[2px] before:bg-slate-100 last:before:hidden py-1 ${ (update.type === 'CHECK_IN' || update.type === 'MESSAGE') ? 'cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full ${update.color} flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm text-slate-900 leading-snug font-medium"><span className="font-bold text-slate-950">{t(update.title)}</span> {update.sub}</p>
                          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            {update.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {activity.length === 0 && (
                    <p className="text-sm text-slate-500 italic">{t('no_recent_activity')}</p>
                  )}
                </>
              )}
            </div>
            <button 
              onClick={() => onNavigate('tasks')}
              className="w-full mt-6 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shrink-0"
            >
              {t('view_activity_history')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
