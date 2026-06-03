import React from 'react';
import {
  Calendar,
  ShieldCheck,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  Trash2,
} from 'lucide-react';
import { getEventPresentationInfo, EventType } from '../../context/CalendarContext';

interface InsightsTabProps {
  clientId: string;
  calendarEvents: any[];
  language: string;
  stats: any;
  t: Function;
  accessExpiration: string;
  savingExpiration: boolean;
  setAccessExpiration: (v: string) => void;
  onSaveExpiration: (v: string) => void;
  onShowDeleteModal: () => void;
}

const InsightsTab: React.FC<InsightsTabProps> = ({
  clientId,
  calendarEvents,
  language,
  stats,
  t,
  accessExpiration,
  savingExpiration,
  setAccessExpiration,
  onSaveExpiration,
  onShowDeleteModal,
}) => {
  // Upcoming appointments for THIS client, derived live from the shared
  // CalendarContext. Any addEvent/updateEvent/deleteEvent in the app re-renders
  // this list immediately — no fetch, no reload.
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = (calendarEvents || [])
    .filter(ev => ev.clientId === clientId && ev.date >= todayStr && ev.status !== 'completed')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || '').localeCompare(b.time || '');
    })
    .slice(0, 6);
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const formatAppointmentDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
  <>
  {/* Upcoming Appointments — live from CalendarContext, no reload needed */}
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
    <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Calendar className="w-5 h-5 text-emerald-500" />
        {t('upcoming_appointments', { defaultValue: 'Próximas citas' })}
      </h3>
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {upcomingAppointments.length} {upcomingAppointments.length === 1 ? t('item', { defaultValue: 'cita' }) : t('items', { defaultValue: 'citas' })}
      </span>
    </div>
    {upcomingAppointments.length === 0 ? (
      <div className="p-8 text-center">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('no_upcoming_appointments', { defaultValue: 'Este cliente no tiene citas próximas agendadas.' })}</p>
      </div>
    ) : (
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {upcomingAppointments.map(ev => {
          const presentation = getEventPresentationInfo(ev.type as EventType);
          const EventIcon = presentation.icon;
          return (
            <li key={ev.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                <EventIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{ev.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {formatAppointmentDate(ev.date)} · {ev.time || '--:--'}
                  {ev.duration ? ` · ${ev.duration}` : ''}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
                {t(ev.type)}
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
    {/* Latest Measurements */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('latest_measurements')}</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">{t('metric')}</th>
              <th className="px-6 py-4">{t('value')}</th>
              <th className="px-6 py-4 text-right">{t('change')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
            {[
              { metric: t('waist'), value: stats?.measurements?.waist ? `${stats.measurements.waist} cm` : '--', change: stats?.measurements?.waistChange || '0', icon: '' },
              { metric: t('hip'), value: stats?.measurements?.hip ? `${stats.measurements.hip} cm` : '--', change: stats?.measurements?.hipChange || '0', icon: '' },
              { metric: t('thigh_r'), value: stats?.measurements?.thigh_r ? `${stats.measurements.thigh_r} cm` : '--', change: stats?.measurements?.thighChange || '0', icon: '' },
              { metric: t('arm_r'), value: stats?.measurements?.arm_r ? `${stats.measurements.arm_r} cm` : '--', change: stats?.measurements?.armChange || '0', icon: '' },
            ].map((row, idx) => {
              const numericChange = parseFloat(row.change);
              const colorClass = numericChange < 0 ? 'text-emerald-600' : numericChange > 0 ? 'text-red-500' : 'text-slate-400';
              const sign = numericChange > 0 ? '+' : '';
              return (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.metric}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{row.value}</td>
                  <td className={`px-6 py-4 text-right font-bold ${colorClass}`}>
                    <div className="flex justify-end items-center gap-1">
                      {numericChange !== 0 ? `${sign}${row.change} cm` : <span className="text-slate-400 font-medium">0 cm</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_activity')}</h3>
      </div>
      <div className="p-6 flex-1 overflow-auto">
        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
          {stats?.activity?.map((act: any, idx: number) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] bg-white dark:bg-slate-900 p-1">
                <div className={`h-3 w-3 rounded-full ${act.type === 'CHECK_IN' ? 'bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20' : 'bg-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/20'}`}></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{new Date(act.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{act.sub}</p>
              </div>
            </div>
          ))}
          {(!stats?.activity || stats.activity.length === 0) && (
            <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">{t('no_recent_activity')}</p>
          )}
        </div>
      </div>
    </div>

    {/* Account Access & Security */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('account_access_security')}</h3>
        <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('grant_app_access')}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">{t('allow_client_login')}</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('access_expiration_date')}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-50"
              type="date"
              value={accessExpiration}
              disabled={savingExpiration}
              onChange={(e) => setAccessExpiration(e.target.value)}
              onBlur={(e) => onSaveExpiration(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onShowDeleteModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-xl transition-colors font-bold text-sm border border-transparent hover:border-red-200 dark:hover:border-red-800"
          >
            <Trash2 className="w-4 h-4" />
            {t('delete_client_permanently')}
          </button>
        </div>
      </div>
    </div>

    {/* Client Documents */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('client_documents')}</h3>
      </div>
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex flex-col gap-3">
            {(stats?.documents || []).length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">{t('no_documents', { defaultValue: 'No documents yet' })}</p>
              </div>
            )}
            {stats?.documents?.map((doc: any, idx: number) => {
              const url = String(doc.url || '');
              const isImage = doc.type === 'image' || /\.(jpg|jpeg|png|gif|webp|heic|bmp|svg)(\?|$)/i.test(url);
              const isVideo = doc.type === 'video' || /\.(mp4|mov|avi|wmv|mkv|webm)(\?|$)/i.test(url);
              const isAudio = doc.type === 'audio' || /\.(mp3|wav|ogg|m4a|aac|flac|opus)(\?|$)/i.test(url);

              return (
                <a
                  key={idx}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.name}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors group cursor-pointer"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500`}>
                    {isImage ? <FileImage className="w-5 h-5" /> : isVideo ? <FileVideo className="w-5 h-5" /> : isAudio ? <FileAudio className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-emerald-500 transition-colors p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg">
                    <Download className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
        </div>
      </div>
    </div>
  </div>
  </>
  );
};

export default InsightsTab;
