import {StrictMode} from 'react';
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
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.group('CRITICAL RUNTIME ERROR');
    console.error('Message:', message);
    console.error('Source:', source);
    console.error('Position:', `${lineno}:${colno}`);
    console.error('StackTrace:', error?.stack);
    console.groupEnd();
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
);
