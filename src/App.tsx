/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Tasks from './views/Tasks';
import Login from './views/Login';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';

import { useClient } from './context/ClientContext';
import CalendarView from './views/Calendar';
import CreateTask from './views/CreateTask';
import PlanningManagement from './views/PlanningManagement';
import PlanningDetail from './views/PlanningDetail';
import TaskIntelligence from './views/TaskIntelligence';
import Clients from './views/Clients';
import CheckIns from './views/CheckIns';
import Messages from './views/Messages';
import Automations from './views/Automations';
import Nutrition from './views/Nutrition';
import LibraryDashboard from './views/LibraryDashboard';
import RecipeCreate from './views/RecipeCreate';
import RecipeDetail from './views/RecipeDetail';
import FoodCreate from './views/FoodCreate';
import SupplementCreate from './views/SupplementCreate';
import TrainingLibrary from './views/TrainingLibrary';
import ExerciseCreate from './views/ExerciseCreate';
import Training from './views/Training';
import ExerciseDetail from './views/ExerciseDetail';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import OnboardingDashboard from './views/OnboardingDashboard';
import OnboardingFlowEditor from './views/OnboardingFlowEditor';
import ClientApp from './ClientApp';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import LandingPage from './views/LandingPage';

type View = 'landing' | 'dashboard' | 'tasks' | 'calendar' | 'create-task' | 'task-intelligence' | 'planning' | 'planning-detail' | 'clients' | 'check-ins' | 'messages' | 'nutrition' | 'training' | 'workout-editor' | 'workout-editor-blank' | 'activity-editor' | 'exercise-detail' | 'assign-program' | 'library' | 'exercises' | 'recipe-create' | 'recipe-detail' | 'food-create' | 'supplement-create' | 'exercise-create' | 'analytics' | 'settings' | 'automations' | 'onboarding' | 'onboarding-editor';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedTaskDate, setSelectedTaskDate] = useState<string | null>(null);
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { clients: globalClients } = useClient();
  
  const { user, isLoading } = useAuth();
  const { profile } = useProfile();

  // Redirect to dashboard if logged in and on landing page
  React.useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);
  
  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Cargando aplicación...</div>;
  }
  
  if (!user && currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setCurrentView('dashboard')} 
        onLogin={() => setCurrentView('dashboard')} 
      />
    );
  }

  if (!user) {
    return <Login onBackToLanding={() => setCurrentView('landing')} />;
  }

  // Route to the dedicated client portal if the user is a client
  if (user.role === 'CLIENT') {
    return <ClientApp />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={() => setCurrentView('dashboard')} 
            onLogin={() => setCurrentView('dashboard')} 
          />
        );
      case 'dashboard':
        return <Dashboard onNavigate={(view, data) => {
          if (data?.clientId) setSelectedClientId(data.clientId);
          if (data?.checkInId) setSelectedCheckInId(data.checkInId);
          setCurrentView(view as View);
        }} />;
      case 'tasks':
        return <Tasks onNavigate={(view, data) => {
          if (data?.taskId) setSelectedTaskId(data.taskId);
          setCurrentView(view as View);
        }} />;
      case 'calendar':
        return <CalendarView onNavigate={(view, data) => {
          if (data?.taskId) setSelectedTaskId(data.taskId);
          if (data?.date) setSelectedTaskDate(data.date);
          setCurrentView(view as View);
        }} />;
      case 'create-task':
        return <CreateTask 
          editId={selectedTaskId || undefined} 
          initialDate={selectedTaskDate || undefined}
          onNavigate={(view) => {
            setSelectedTaskId(null);
            setSelectedTaskDate(null);
            setCurrentView(view as View);
          }} 
        />;
      case 'task-intelligence':
        return <TaskIntelligence onNavigate={(view) => setCurrentView(view as View)} />;
      case 'planning':
        return <PlanningManagement onNavigate={(view, cid) => {
          if (cid) setSelectedClientId(cid);
          setCurrentView(view as View);
        }} />;
      case 'planning-detail':
        return <PlanningDetail onNavigate={(view) => setCurrentView(view as View)} clientId={selectedClientId || undefined} />;
      case 'clients':
        return <Clients />;
      case 'check-ins':
        return (
          <CheckIns 
            initialClientId={selectedClientId || undefined} 
            initialCheckInId={selectedCheckInId || undefined}
            onViewChange={(cid, checkid) => {
              if (cid) setSelectedClientId(cid);
              if (checkid) setSelectedCheckInId(checkid);
            }}
          />
        );
      case 'messages':
        return <Messages />;
      case 'automations':
        return <Automations />;
      case 'nutrition':
        return <Nutrition />;
      case 'training':
        return <Training />;
      case 'library':
        return <LibraryDashboard onNavigate={(view) => setCurrentView(view as View)} />;
      case 'exercises':
        return <TrainingLibrary onNavigate={(view, name) => {
          if (name) setSelectedActivityName(name);
          setCurrentView(view as View);
        }} />;
      case 'exercise-detail':
        return <ExerciseDetail exerciseName={selectedActivityName || undefined} onBack={() => setCurrentView('exercises')} />;
      case 'recipe-create':
        return <RecipeCreate onBack={() => setCurrentView('library')} />;
      case 'recipe-detail':
        return <RecipeDetail onBack={() => setCurrentView('library')} />;
      case 'food-create':
        return <FoodCreate onBack={() => setCurrentView('library')} />;
      case 'supplement-create':
        return <SupplementCreate onBack={() => setCurrentView('library')} />;
      case 'exercise-create':
        return <ExerciseCreate onBack={() => setCurrentView('exercises')} />;
      case 'analytics':
        return <Analytics />;
      /* case 'onboarding':
        return <OnboardingDashboard onNavigate={(view, data) => {
          if (data?.flowId) setSelectedFlowId(data.flowId);
          setCurrentView(view as View);
        }} />;
      case 'onboarding-editor':
        return <OnboardingFlowEditor flowId={selectedFlowId || undefined} onBack={() => {
          setSelectedFlowId(null);
          setCurrentView('onboarding');
        }} />; */
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Screen Under Development</h2>
            <p className="text-center max-w-md">This screen is currently being built. Navigation is connected, but the content will be added in the next update.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setCurrentView('dashboard')} 
        onLogin={() => setCurrentView('dashboard')} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => setCurrentView(view as View)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full bg-emerald-500 bg-cover bg-center flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ 
                backgroundImage: profile?.avatar_url 
                  ? `url("${profile.avatar_url}")` 
                  : 'none' 
              }}
            >
              {!profile?.avatar_url && (profile?.full_name?.[0] || 'S')}
            </div>
            <span className="font-bold text-slate-900 text-sm">{profile?.full_name || 'NutriDash Pro'}</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className={`flex-1 ${currentView === 'messages' ? 'overflow-hidden' : 'overflow-y-auto'} scroll-smooth`}>
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

