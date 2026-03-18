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
