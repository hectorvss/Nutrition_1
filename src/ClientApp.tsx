import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import ClientSidebar from './components/client/ClientSidebar';
import ClientDashboard from './views/client/ClientDashboard';
import ClientCheckIns from './views/client/ClientCheckIns';
import ClientNutrition from './views/client/ClientNutrition';
import ClientTraining from './views/client/ClientTraining';
// Heavy or rarely-visited views are lazy so they don't sit in the initial
// client bundle. Progress imports recharts (~120 KB), Roadmap pulls motion
// + animations, Settings is the shared settings shell (1.7k LOC).
const ClientRoadmap = lazy(() => import('./views/client/ClientRoadmap'));
const ClientProgress = lazy(() => import('./views/client/ClientProgress'));
const Settings = lazy(() => import('./views/Settings'));
import { Menu } from 'lucide-react';
import Messages from './views/Messages';
// Client-only read-only view of an exercise. Replaces the manager-side
// ActivityEditor that used to be wired here — that screen had a fake
// "Save" button and exposed prescription editing the client must not touch.
import ClientActivityView from './views/client/ClientActivityView';
import OnboardingPopup from './components/OnboardingPopup';
import { fetchWithAuth } from './api';
import WeeklyCheckinFlow from './views/client/WeeklyCheckinFlow';
import ClientActionFAB from './components/client/ClientActionFAB';
import { useLanguage } from './context/LanguageContext';

export type ClientView = 'dashboard' | 'check-ins' | 'messages' | 'nutrition' | 'training' | 'roadmap' | 'progress' | 'settings' | 'activity-editor' | 'none';

export default function ClientApp() {
  const [currentView, setCurrentView] = useState<ClientView>('dashboard');
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  // True once the client has submitted a check-in within the current ISO
  // week — the weekend FAB hides itself in that case so it doesn't keep
  // asking for a check-in the user already completed on Friday.
  const [submittedThisWeek, setSubmittedThisWeek] = useState(false);

  React.useEffect(() => {
    checkOnboarding();
    checkRecentSubmission();
    // The coach can assign / unassign an onboarding while the client has
    // the app open — refetch on tab focus so the FAB and popup state
    // reflect reality without a manual reload.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkOnboarding();
        checkRecentSubmission();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const checkOnboarding = async () => {
    try {
      const data = await fetchWithAuth('/onboarding/client/active');
      if (data && data.template) {
        setOnboardingData(data);
        // Auto-open the popup ONLY on the very first sighting per session.
        // After the user dismisses with the X we keep `onboardingData` set
        // so the FAB stays visible, but we don't re-open the popup on every
        // visibility refresh — that would be intrusive.
        setShowOnboarding(prev => prev || !onboardingData);
      } else {
        // No active assignment any more — clear local state so the FAB
        // disappears (e.g. the coach unassigned it, or the previous
        // submission deactivated the assignment server-side).
        setOnboardingData(null);
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error('Failed to check onboarding:', err);
    }
  };

  const checkRecentSubmission = async () => {
    try {
      const data = await fetchWithAuth('/check-ins/client/check-ins?limit=1');
      const list: any[] = Array.isArray(data) ? data : (data?.data || []);
      if (!list.length) return;
      const last = new Date(list[0].date || list[0].created_at);
      const now = new Date();
      // Start of the current ISO week (Monday).
      const monday = new Date(now);
      const d = monday.getDay();
      const diff = (d + 6) % 7;
      monday.setDate(monday.getDate() - diff);
      monday.setHours(0, 0, 0, 0);
      if (last.getTime() >= monday.getTime()) setSubmittedThisWeek(true);
    } catch (err) {
      // Non-blocking — worst case the FAB shows when it shouldn't.
      console.error('Failed to check recent submission:', err);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ClientDashboard onNavigate={(view) => setCurrentView(view as ClientView)} />;
      case 'settings':
        return <Settings />;
      case 'check-ins':
        return <ClientCheckIns />;
      case 'nutrition':
        return <ClientNutrition />;
      case 'training':
        return (
          <ClientTraining 
            onViewExercise={(name) => {
              setSelectedActivityName(name);
              setCurrentView('activity-editor');
            }} 
          />
        );
      case 'roadmap':
        return <ClientRoadmap />;
      case 'progress':
        return <ClientProgress />;
      case 'activity-editor':
        return (
          <ClientActivityView
            activityName={selectedActivityName || undefined}
            onBack={() => setCurrentView('training')}
          />
        );
      case 'messages':
        return <Messages onNavigate={(view) => setCurrentView(view as ClientView)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('screen_under_development')}</h2>
            <p className="text-center max-w-md dark:text-slate-400">{t('client_screen_under_development_desc')}</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-6 px-4 py-2 bg-[#17cf54] text-white rounded-lg font-bold shadow-md shadow-[#17cf54]/20 hover:bg-[#15b84a] transition-all"
            >
              {t('back_to_dashboard')}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8f6] dark:bg-[#112116] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#17cf54]/20 selection:text-[#17cf54] overflow-hidden">
      {showOnboarding && (
        <OnboardingPopup
          // Submitted: clear everything — FAB disappears too.
          onComplete={() => { setShowOnboarding(false); setOnboardingData(null); }}
          // X button: just hide the popup; keep onboardingData set so the
          // FAB stays visible and the client can reopen the flow any time.
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
      {showCheckIn && <WeeklyCheckinFlow onComplete={() => setShowCheckIn(false)} onCancel={() => setShowCheckIn(false)} />}
      
      <ClientActionFAB
        onboardingData={onboardingData}
        submittedThisWeek={submittedThisWeek}
        onOpenOnboarding={() => {
          // Just open the modal — don't switch view to a placeholder. If the
          // user dismisses the onboarding, they should stay on whatever they
          // were looking at, not land on the "screen under development" page.
          setShowOnboarding(true);
        }}
        onOpenCheckIn={() => {
          setCurrentView('check-ins');
          setShowCheckIn(true);
        }}
      />

      <ClientSidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view as ClientView);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        showOnboardingReminder={!!onboardingData}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />
      
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white dark:bg-[#112116] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#17cf54] flex items-center justify-center text-white font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'C'}
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Lumina</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className={`flex-1 ${currentView === 'messages' ? 'overflow-hidden' : 'overflow-y-auto'} scroll-smooth no-scrollbar`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              {/* Suspense para los componentes lazy (Settings). */}
              <Suspense fallback={
                <div className="p-10 flex items-center justify-center min-h-[400px]">
                  <div className="w-10 h-10 border-4 border-[#17cf54] border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                {renderView()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
