import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import { TaskProvider } from './context/TaskContext';
import { CalendarProvider } from './context/CalendarContext';
import { AutomationProvider } from './context/AutomationContext';
import { FoodProvider } from './context/FoodContext';
import { ExerciseProvider } from './context/ExerciseContext';

import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { IntegrationsProvider } from './context/IntegrationsContext';

// --- Production Diagnostic Logging ---
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  declare props: { children: React.ReactNode };
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("APP CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center justify-center font-sans">
          <div className="max-w-xl w-full bg-slate-800 p-8 rounded-3xl border border-red-500/50 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              Application Error
            </h1>
            <p className="text-slate-300 mb-6 leading-relaxed">
              The application encountered a runtime error. This is usually caused by a missing translation key or an undefined component.
            </p>
            <div className="bg-black/50 p-4 rounded-xl mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-300 break-all">
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.group('CRITICAL RUNTIME ERROR');
    console.error('StackTrace:', error?.stack);
    console.groupEnd();
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <IntegrationsProvider>
              <ProfileProvider>
                <ClientProvider>
                  <TaskProvider>
                    <CalendarProvider>
                      <AutomationProvider>
                        <FoodProvider>
                          <ExerciseProvider>
                            <App />
                          </ExerciseProvider>
                        </FoodProvider>
                      </AutomationProvider>
                    </CalendarProvider>
                  </TaskProvider>
                </ClientProvider>
              </ProfileProvider>
            </IntegrationsProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
