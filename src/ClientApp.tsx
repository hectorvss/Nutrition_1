import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import ClientSidebar from './components/client/ClientSidebar';
import ClientDashboard from './views/client/ClientDashboard';
import ClientCheckIns from './views/client/ClientCheckIns';
import ClientNutrition from './views/client/ClientNutrition';
import ClientTraining from './views/client/ClientTraining';
import ClientRoadmap from './views/client/ClientRoadmap';
import Settings from './views/Settings';
import { Menu } from 'lucide-react';
import Messages from './views/Messages';
import ActivityEditor from './views/ActivityEditor';
import OnboardingPopup from './components/OnboardingPopup';

export type ClientView = 'dashboard' | 'check-ins' | 'messages' | 'nutrition' | 'training' | 'roadmap' | 'progress' | 'settings' | 'activity-editor';

export default function ClientApp() {
  const [currentView, setCurrentView] = useState<ClientView>('dashboard');
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

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
      case 'activity-editor':
        return (
          <ActivityEditor 
            activityName={selectedActivityName || undefined}
            onBack={() => setCurrentView('training')} 
          />
        );
      case 'messages':
        return <Messages />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Screen Under Development</h2>
            <p className="text-center max-w-md dark:text-slate-400">This client screen is currently being built. Navigation is connected, but the content will be added soon.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-6 px-4 py-2 bg-[#17cf54] text-white rounded-lg font-bold shadow-md shadow-[#17cf54]/20 hover:bg-[#15b84a] transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8f6] dark:bg-[#112116] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#17cf54]/20 selection:text-[#17cf54] overflow-hidden">
      {showOnboarding && <OnboardingPopup onComplete={() => setShowOnboarding(false)} />}
      <ClientSidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view as ClientView);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
