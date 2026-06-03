import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { unwrapList } from '../../api/unwrap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { computeCheckinAdherence } from '../../lib/checkinAdherence';
import WeeklyCheckinFlow from './WeeklyCheckinFlow';
import CheckInDetailView from './CheckInDetailView';

export default function ClientCheckIns() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  const loadCheckIns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/check-ins/client/check-ins?limit=100');
      setCheckIns(unwrapList(data));
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [data, template] = await Promise.all([
          fetchWithAuth('/check-ins/client/check-ins?limit=100'),
          fetchWithAuth('/check-ins/client/active-template')
        ]);
        if (!mounted) return;
        setCheckIns(unwrapList(data));
        if (template) {
          setActiveTemplate({
            ...template,
            templateSchema: template.template_schema || template.templateSchema || []
          });
        }
      } catch (err) {
        console.error('Error loading check-ins data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    // Re-fetch when the tab regains focus so that reviews the coach
    // published while the client had the app in the background show up
    // without a manual reload.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadCheckIns();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  if (isCheckingIn) {
    return <WeeklyCheckinFlow onComplete={() => { setIsCheckingIn(false); loadCheckIns(); }} onCancel={() => setIsCheckingIn(false)} />;
  }

  if (selectedCheckIn) {
    return (
      <CheckInDetailView
        checkIn={selectedCheckIn}
        // Closing the detail view refreshes the list so the row's
        // "pending review" / "reviewed" badge reflects whatever the
        // coach did while the detail was open.
        onBack={() => { setSelectedCheckIn(null); loadCheckIns(); }}
      />
    );
  }

  const locale = language === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      <div className="p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <span className="text-slate-500">{t('checkins')}</span>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('client')}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl shadow-sm bg-[#17cf54]/10 flex items-center justify-center text-2xl font-bold text-[#17cf54] uppercase">{user?.email?.charAt(0) || 'C'}</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('client')}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span> {t('active_client')}
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-semibold mb-1 text-center">{t('status')}</div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> {t('active')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 pt-2">
        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 relative">
            <div className="relative px-6 py-2 rounded-lg text-sm font-semibold z-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">
              {activeTemplate?.name || activeTemplate?.title || t('checkin_view')}
            </div>
          </div>
          <div className="flex items-center gap-2 pr-2">
            {/* Print/share removed: print had no @media-print stylesheet and
                share shipped the SPA URL — a deep link the recipient cannot
                open. Re-add when there is a real per-check-in route or a PDF
                export to share. */}
            <button
              onClick={() => setIsCheckingIn(true)}
              className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> {t('new_checkin')}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Check-in Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('checkin_overview')}</h3>
              {/* Solo se muestra si el check-in más reciente aún no ha sido
                  revisado por el coach — antes salía siempre (badge falso). */}
              {checkIns.length > 0 && !checkIns[0]?.reviewed_at && !checkIns[0]?.reviewed && (
                <span className="text-xs font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md uppercase">{t('next_review_due')}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#17cf54]"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('total')}</p>
                    <p className="text-xs text-slate-400">{t('all_checkins')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{checkIns.length}</p>
                  <p className="text-xs text-slate-400">{t('submitted')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('latest')}</p>
                    <p className="text-xs text-slate-400">{t('most_recent')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{checkIns.length > 0 && (checkIns[0].date || checkIns[0].created_at) ? new Date(checkIns[0].date || checkIns[0].created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : '—'}</p>
                  <p className="text-xs text-slate-400">{t('date')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('adherence')}</p>
                    <p className="text-xs text-slate-400">{t('last_4_weeks', { defaultValue: 'Últimas 4 semanas' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {checkIns.length === 0 ? '—' : computeCheckinAdherence(checkIns) + '%'}
                  </p>
                  <p className="text-xs text-slate-400">{t('rate')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('checkin_history')}</h2>
                <p className="text-sm text-slate-500">{t('entries_count_most_recent', { count: checkIns.length })}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {checkIns.length > 0 ? checkIns.map((ci: any, idx: number) => (
                <div 
                  key={ci.id} 
                  onClick={() => setSelectedCheckIn(ci)}
                  className="group border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-[#17cf54]/10 text-[#17cf54]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className="material-symbols-outlined">{ci.reviewed_at ? 'task_alt' : 'pending_actions'}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                          {/* "Check-in del lunes 25 de mayo" / "Check-in for Monday, 25 May".
                              Title-cased manually because toLocaleDateString returns
                              the weekday/month in lower case in es-ES. */}
                          {(() => {
                            const raw = ci.date || ci.created_at;
                            if (!raw) return t('checkin', { defaultValue: 'Check-in' });
                            const d = new Date(raw);
                            const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                            const weekday = cap(d.toLocaleDateString(locale, { weekday: 'long' }));
                            const dayMonth = d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
                            return `Check-in · ${weekday} ${dayMonth}`;
                          })()}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {new Date(ci.created_at || ci.date).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{(ci.weight ?? ci.data_json?.weight) ? `${Number(ci.weight ?? ci.data_json.weight).toLocaleString(locale)} kg` : t('weekly_review')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${!ci.reviewed_at ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-[#17cf54]/10 text-[#17cf54]'}`}>
                        {!ci.reviewed_at ? t('pending_review') : t('reviewed')}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-300">history</span>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('no_checkins_yet')}</p>
                  <p className="text-sm text-slate-400 mt-2">{t('start_first_checkin')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
