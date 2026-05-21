/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from 'react';
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
import PlanningPlanTemplates from './views/PlanningPlanTemplates';
// Vistas pesadas con `React.lazy()` para que no entren al bundle principal.
// Cada una se descarga la primera vez que el usuario navega a ella.
// Justificacion (LOC): PlanningDetail 1922, Settings 1663, NutritionPlanDetail
// 1332, Messages 1183, Analytics 774, ClientProgress 773, WorkoutEditor 677.
const PlanningDetail        = lazy(() => import('./views/PlanningDetail'));
const Analytics             = lazy(() => import('./views/Analytics'));
const Settings              = lazy(() => import('./views/Settings'));
const OnboardingFlowEditor  = lazy(() => import('./views/OnboardingFlowEditor'));
import PlanningTemplateSelector from './views/PlanningTemplateSelector';
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
import OnboardingDashboard from './views/OnboardingDashboard';
import Subscriptions from './views/Subscriptions';
import ClientApp from './ClientApp';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import LandingPage from './views/LandingPage';
import { useLanguage } from './context/LanguageContext';
import { useBilling } from './context/BillingContext';
import TrialBanner from './components/TrialBanner';
import Paywall from './components/Paywall';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'tasks' | 'calendar' | 'create-task' | 'task-intelligence' | 'planning' | 'planning-template-selector' | 'planning-detail' | 'planning-templates' | 'clients' | 'check-ins' | 'messages' | 'nutrition' | 'training' | 'workout-editor' | 'workout-editor-blank' | 'activity-editor' | 'exercise-detail' | 'assign-program' | 'library' | 'exercises' | 'recipe-create' | 'recipe-detail' | 'food-create' | 'supplement-create' | 'exercise-create' | 'analytics' | 'settings' | 'automations' | 'onboarding' | 'onboarding-editor' | 'subscriptions';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedTaskDate, setSelectedTaskDate] = useState<string | null>(null);
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [calendarViewMode, setCalendarViewMode] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draftPlanning, setDraftPlanning] = useState<any>(null);
  const { clients: globalClients, assignPlanningDraft } = useClient();
  const { t } = useLanguage();
  
  const { user, isLoading } = useAuth();
  const { profile } = useProfile();
  const { status: billingStatus } = useBilling();

  // Redirect to dashboard once authenticated if still on a pre-auth view.
  // Must cover 'login' and 'signup' too — after a fresh login (especially the
  // 2FA flow, which keeps the user on the 'login' view while the session is
  // established) `currentView` is 'login'/'signup', not 'landing'. Without
  // this, renderView() falls through to the "screen under development"
  // placeholder because there is no `case 'login'`.
  React.useEffect(() => {
    if (user && (currentView === 'landing' || currentView === 'login' || currentView === 'signup')) {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Vuelta de Stripe: tras un Checkout (?session_id=) o el Billing Portal
  // (?billing_updated=1), la SPA arranca en 'landing'. Si el usuario esta
  // autenticado, llevarlo a su pantalla de Suscripciones para que aterrice
  // donde corresponde y no en la landing. Tras consumir los params, se
  // limpian de la URL para que no se repitan en recargas.
  React.useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('session_id') || params.has('billing_updated')) {
      setCurrentView('subscriptions');
      params.delete('billing_updated');
      params.delete('checkout');
      // session_id lo conserva BillingContext para su polling; lo limpia el.
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, [user]);

  // Navegacion via CustomEvent — usado por componentes anidados (e.g.
  // BillingSettings dentro de Settings) que no reciben setCurrentView por
  // props. `detail` debe ser un id de vista valido.
  React.useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') setCurrentView(detail as View);
    };
    window.addEventListener('app:navigate', onNavigate as EventListener);
    return () => window.removeEventListener('app:navigate', onNavigate as EventListener);
  }, []);
  
  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">{t('loading_application')}</div>;
  }
  
  if (!user && currentView === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setCurrentView('signup')}
        onLogin={() => setCurrentView('login')}
      />
    );
  }

  if (!user) {
    return (
      <Login
        initialMode={currentView === 'signup' ? 'signup' : 'login'}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Route to the dedicated client portal if the user is a client
  if (user.role === 'CLIENT') {
    return <ClientApp />;
  }

  const renderView = () => {
    switch (currentView) {
      // renderView only runs once the user is authenticated, so the pre-auth
      // views (landing/login/signup) must resolve to the dashboard — never the
      // landing page or the "under development" placeholder. This also kills
      // the one-frame flash before the redirect effect above fires.
      case 'landing':
      case 'login':
      case 'signup':
      case 'dashboard':
        return <Dashboard onNavigate={(view, data) => {
          if (data?.clientId) setSelectedClientId(data.clientId);
          if (data?.checkInId) setSelectedCheckInId(data.checkInId);
          setCurrentView(view as View);
        }} />;
      case 'tasks':
        return <Tasks onNavigate={(view, data) => {
          if (data?.taskId) setSelectedTaskId(data.taskId);
          if (data?.clientId) setSelectedClientId(data.clientId);
          if (data?.checkInId) setSelectedCheckInId(data.checkInId);
          setCurrentView(view as View);
        }} />;
      case 'calendar':
        return <CalendarView 
          initialView={calendarViewMode}
          initialDate={calendarDate}
          onNavigate={(view, data) => {
            if (data?.taskId) setSelectedTaskId(data.taskId);
            if (data?.date) setSelectedTaskDate(data.date);
            if (data?.returnTo) setCalendarViewMode(data.returnTo);
            if (data?.currentDate) setCalendarDate(new Date(data.currentDate + 'T12:00:00'));
            setCurrentView(view as View);
          }} 
        />;
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
      case 'planning-templates':
        return <PlanningPlanTemplates onBack={() => setCurrentView('planning')} />;
      case 'planning-template-selector':
        return (
          <PlanningTemplateSelector 
            client={globalClients.find(c => c.id === selectedClientId)}
            onBack={() => setCurrentView('planning')}
            onSelect={async (templateId, settings) => {
              // 1. Assign via context (Persistence & Logic)
              if (selectedClientId) {
                await assignPlanningDraft(selectedClientId, templateId, settings);
              }

              // 2. Generate an EMPTY roadmap scaffold for routing — no invented
              //    phases, macros or assumptions. The coach builds the blocks in
              //    PlanningDetail. Only real user-chosen settings are carried over.
              const generatedDraft = {
                status: 'Draft',
                currentWeek: 1,
                totalWeeks: settings.duration || 12,
                nutrition: settings.roadmapBlocks?.nutrition || [],
                training: settings.roadmapBlocks?.training || [],
                goals: [],
                milestones: settings.roadmapBlocks?.milestones || [],
                assumptions: {
                  steps: '',
                  sleep: '',
                  constraints: ''
                },
                config: {
                  primaryGoal: settings.primaryGoal,
                  nutritionApproach: settings.nutritionApproach,
                  trainingFreq: settings.trainingFreq,
                  intensityLevel: settings.intensityLevel,
                  duration: settings.duration
                }
              };
              setDraftPlanning(generatedDraft);
              setCurrentView('planning-detail');
            }}
          />
        );
      case 'planning-detail':
        return (
          <PlanningDetail 
            onNavigate={(view) => {
              setDraftPlanning(null); // Clear draft when leaving
              setCurrentView(view as View);
            }} 
            clientId={selectedClientId || undefined} 
            initialRoadmap={draftPlanning}
          />
        );
      case 'clients':
        return <Clients initialClientId={selectedClientId || undefined} onNavigate={(view, data) => {
          if (data?.clientId) setSelectedClientId(data.clientId);
          setCurrentView(view as View);
        }} />;
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
        return <Messages initialClientId={selectedClientId || undefined} onNavigate={(view, data) => {
          if (data?.clientId) setSelectedClientId(data.clientId);
          if (data?.checkInId) setSelectedCheckInId(data.checkInId);
          setCurrentView(view as View);
        }} />;
      case 'automations':
        return <Automations />;
      case 'nutrition':
        return <Nutrition />;
      case 'training':
        return <Training />;
      case 'library':
        return <LibraryDashboard onNavigate={(view, recipeId) => {
          if (view === 'recipe-detail') {
            setSelectedRecipeId(recipeId ?? null);
          } else if (view === 'recipe-create') {
            // Crear una receta nueva: nunca entrar en modo edición
            setSelectedRecipeId(null);
          }
          setCurrentView(view as View);
        }} />;
      case 'exercises':
        return <TrainingLibrary onNavigate={(view, name) => {
          if (name) setSelectedActivityName(name);
          setCurrentView(view as View);
        }} />;
      case 'exercise-detail':
        return <ExerciseDetail exerciseName={selectedActivityName || undefined} onBack={() => setCurrentView('exercises')} />;
      case 'recipe-create':
        return <RecipeCreate
          recipeId={selectedRecipeId ?? undefined}
          onBack={() => { setSelectedRecipeId(null); setCurrentView('library'); }}
        />;
      case 'recipe-detail':
        return <RecipeDetail
          recipeId={selectedRecipeId ?? undefined}
          onBack={() => setCurrentView('library')}
          onEdit={(id) => { setSelectedRecipeId(id); setCurrentView('recipe-create'); }}
        />;
      case 'food-create':
        return <FoodCreate onBack={() => setCurrentView('library')} />;
      case 'supplement-create':
        return <SupplementCreate onBack={() => setCurrentView('library')} />;
      case 'exercise-create':
        return <ExerciseCreate onBack={() => setCurrentView('exercises')} />;
      case 'analytics':
        return <Analytics />;
      case 'onboarding':
        return <OnboardingDashboard onNavigate={(view, data) => {
          if (data?.flowId) setSelectedFlowId(data.flowId);
          setCurrentView(view as View);
        }} />;
      case 'onboarding-editor':
        return <OnboardingFlowEditor flowId={selectedFlowId || undefined} onBack={() => {
          setSelectedFlowId(null);
          setCurrentView('onboarding');
        }} />;
      case 'settings':
        return <Settings />;
      case 'subscriptions':
        return <Subscriptions onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('screen_under_development')}</h2>
            <p className="text-center max-w-md">{t('screen_under_development_desc')}</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
            >
              {t('back_to_dashboard')}
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

  // Trial expired / subscription blocked → full paywall over the app.
  // Settings stays accessible so the manager can manage billing from inside
  // the paywall flow (they're already on the Pricing grid, so this is mostly
  // a safety net if they cancel mid-upgrade).
  if (billingStatus?.accessBlocked && currentView !== 'settings') {
    return <Paywall />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <Sidebar
        currentView={currentView} 
        onNavigate={(view) => {
          if (['check-ins', 'clients', 'dashboard', 'analytics'].includes(view)) {
            setSelectedClientId(null);
            setSelectedCheckInId(null);
          }
          setCurrentView(view as View);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TrialBanner onUpgrade={() => setCurrentView('subscriptions')} />
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
              {/* Suspense fallback se muestra durante la primera descarga
                  de los chunks lazy (PlanningDetail, Analytics, Settings,
                  OnboardingFlowEditor). Despues queda cacheado. */}
              <Suspense fallback={
                <div className="p-10 flex items-center justify-center min-h-[400px]">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

