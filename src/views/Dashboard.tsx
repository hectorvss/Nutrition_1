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
  Zap
} from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useCalendar, getEventPresentationInfo } from '../context/CalendarContext';
import { useClient } from '../context/ClientContext';

interface DashboardProps {
  onNavigate: (view: string, data?: { clientId?: string; checkInId?: string }) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { tasks } = useTask();
  const { getEventsForDate } = useCalendar();
  const { clients } = useClient();
  const [activity, setActivity] = useState<any[]>([]);
  const [attentionCheckIns, setAttentionCheckIns] = useState<any[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchWithAuth('/manager/analytics');
        if (data.recentActivity) {
          setActivity(data.recentActivity);
        }
        if (data.attentionRequired) {
          setAttentionCheckIns(data.attentionRequired);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };
    loadAnalytics();
  }, []);

  const combinedAttention = [
    ...attentionCheckIns,
    ...tasks.filter(t => t.status !== 'pending').map(t => ({...t, type: 'TASK'}))
  ].sort((a,b) => (b.timeLabel || '').localeCompare(a.timeLabel || ''));

  const quickActions = [
    { id: 'add-client', label: 'Add New Client', icon: UserPlus, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'schedule', label: 'Schedule Appointment', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { id: 'automations', label: 'Manage Automations', icon: Zap, color: 'bg-amber-50 text-amber-600' },
    { id: 'broadcast', label: 'Broadcast Message', icon: Send, color: 'bg-purple-50 text-purple-600' },
  ];

  const todayDateStr = new Date().toISOString().split('T')[0];
  const scheduleItems = getEventsForDate(todayDateStr).sort((a, b) => a.time.localeCompare(b.time));


  return (
    <div className="p-6 md:p-8 lg:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric'})}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good Morning, Manager</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">You have {combinedAttention.length} pending items requiring your attention.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input 
              className="pl-10 pr-4 py-2.5 rounded-lg border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none w-64 text-sm text-slate-700 placeholder-slate-400 transition-all" 
              placeholder="Search clients, foods..." 
              type="text"
            />
          </div>
          <button className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
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
                <h3 className="font-bold text-lg text-slate-900">Attention Required</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500">{combinedAttention.length} Items</span>
            </div>
            <div className="divide-y divide-slate-100">
              {combinedAttention.length === 0 && (
                <div className="p-8 text-center text-slate-500">No pending attention tasks! Great job.</div>
              )}
              {combinedAttention.slice(0, 5).map((item) => (
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
                      <h4 className="font-bold text-sm text-slate-900 truncate">{item.client} <span className="font-normal text-slate-500 ml-1">{item.title}</span></h4>
                      <span className="text-xs text-slate-400 shrink-0">{item.timeLabel}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{item.desc}</p>
                  </div>
                  <button className="text-emerald-600 opacity-0 group-hover:opacity-100 font-semibold text-sm transition-opacity capitalize">
                    {item.type === 'CHECK_IN' ? 'Review' : 'Resolve'}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <button onClick={() => onNavigate('tasks')} className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">View All Items</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Schedule Today</h3>
              <button onClick={() => onNavigate('calendar')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View Calendar</button>
            </div>
            <div className="space-y-4">
              {scheduleItems.length === 0 && (
                <div className="text-slate-500 text-sm italic">No events scheduled for today.</div>
              )}
              {scheduleItems.map((item) => {
                const info = getEventPresentationInfo(item.type);
                const EventIcon = info.icon;
                return (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 flex flex-col items-end pt-1 shrink-0">
                    <span className="text-sm font-bold text-slate-700">{item.time.split(' ')[0]}</span>
                    <span className="text-xs text-slate-400">{item.time.includes(' ') ? item.time.split(' ')[1] : ''}</span>
                  </div>
                  <div className={`flex-1 p-4 rounded-xl border-l-4 ${info.color} relative border-t border-r border-b border-r-slate-100 border-t-slate-100 border-b-slate-100 shadow-sm transition-all`}>
                    <h4 className="font-bold text-slate-800 text-sm truncate mr-10">{item.title}</h4>
                    <p className="text-slate-600 text-xs mt-1 truncate">with {item.client || item.initials} • {item.type}</p>
                    <div className="absolute top-4 right-4">
                       {item.avatar ? (
                         <div className="w-8 h-8 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url("${item.avatar}")` }} />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold text-xs border-2 border-slate-100">{item.initials}</div>
                       )}
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
                  <p className="text-emerald-100 text-sm font-medium opacity-90">Active Clients</p>
                  <h3 className="text-3xl font-bold mt-1">{clients.length}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">+3</span>
                <span>since last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4 shrink-0">Latest Updates</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-2">
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
                      <p className="text-sm text-slate-900 leading-snug font-medium"><span className="font-bold text-slate-950">{update.title}</span> {update.sub}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        {update.time}
                      </p>
                    </div>
                  </div>
                );
              })}
              {activity.length === 0 && (
                <p className="text-sm text-slate-500 italic">No recent activity found.</p>
              )}
            </div>
            <button 
              onClick={() => onNavigate('tasks')}
              className="w-full mt-6 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] shrink-0"
            >
              View Activity History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
