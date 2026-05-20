import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BillingProvider } from './context/BillingContext';
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
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  // Con useDefineForClassFields=false (ver tsconfig.json) TS necesita
  // declarar explicitamente los miembros heredados de React.Component
  // para que `this.props` y `this.setState` esten accesibles dentro de
  // la subclase sin que la inicializacion de `state` los oculte.
  declare props: { children: React.ReactNode };
  declare setState: React.Component<{ children: React.ReactNode }, ErrorBoundaryState>['setState'];
  state: ErrorBoundaryState = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("APP CRASH:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private buildBugReport = (): string => {
    const { error, errorInfo } = this.state;
    const lines = [
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `UA:   ${navigator.userAgent}`,
      ``,
      `Error: ${error?.name || 'Unknown'}: ${error?.message || ''}`,
      ``,
      `Stack:`,
      error?.stack || '(no stack)',
      ``,
      `Component stack:`,
      errorInfo?.componentStack || '(no component stack)',
    ];
    return lines.join('\n');
  };

  private reportBug = async () => {
    const report = this.buildBugReport();
    try {
      await navigator.clipboard.writeText(report);
      alert('Detalles del error copiados al portapapeles. Pégalos en el formulario de soporte o un email a tu coach.');
    } catch {
      // Clipboard API can fail in some browsers/contexts — fall back to opening a mailto.
      const subject = encodeURIComponent('Bug report — Nutrition_1');
      const body = encodeURIComponent(report.slice(0, 1800)); // mailto URL length limit
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 flex items-center justify-center font-sans">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">error</span>
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">Ha ocurrido un error inesperado</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  La aplicación se ha encontrado con un problema. Recarga para volver a intentarlo. Si vuelve a pasar, repórtanos el bug y nos pondremos a ello.
                </p>
              </div>
            </div>

            {error?.message && (
              <details className="mb-6 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
                  Detalles técnicos
                </summary>
                <div className="px-4 pb-4 max-h-48 overflow-auto">
                  <code className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-words">
                    {error.name}: {error.message}
                  </code>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.reload}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Recargar
              </button>
              <button
                onClick={this.reportBug}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">bug_report</span>
                Reportar bug
              </button>
            </div>
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
        <BillingProvider>
        <LanguageProvider>
          <ThemeProvider>
            <IntegrationsProvider>
              <ProfileProvider>
                <ClientProvider>
                  <CalendarProvider>
                    <TaskProvider>
                      <AutomationProvider>
                        <FoodProvider>
                          <ExerciseProvider>
                            <App />
                          </ExerciseProvider>
                        </FoodProvider>
                      </AutomationProvider>
                    </TaskProvider>
                  </CalendarProvider>
                </ClientProvider>
              </ProfileProvider>
            </IntegrationsProvider>
          </ThemeProvider>
        </LanguageProvider>
        </BillingProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
