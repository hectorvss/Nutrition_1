import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TrainingDashboard from './TrainingDashboard';
import TrainingNoPlan from './TrainingNoPlan';
import TrainingWeeklyView from './TrainingWeeklyView';
import WorkoutEditor from './WorkoutEditor';
import AssignProgram from './AssignProgram';
import ActivityEditor from './ActivityEditor';

type TrainingView = 'client-list' | 'no-plan' | 'weekly-view' | 'workout-editor' | 'assign-program' | 'activity-editor';

export default function Training() {
  const [currentView, setCurrentView] = useState<TrainingView>('client-list');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);

  const handleNavigate = (view: TrainingView, clientId?: string | any) => {
    if (clientId) {
      // If it's an object (from the client list), use it directly
      const client = typeof clientId === 'object' ? clientId : { id: clientId };
      setSelectedClient(client);

      if (view === 'weekly-view' || view === 'workout-editor') {
        if (!client.trainingPlanAssigned) {
          setCurrentView('no-plan');
        } else {
          setCurrentView('weekly-view');
        }
        return;
      }
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'client-list':
        return <TrainingDashboard onNavigate={(view, cid) => handleNavigate(view as TrainingView, cid)} />;
      
      case 'no-plan':
        return (
          <TrainingNoPlan 
            client={selectedClient} 
            onBack={() => setCurrentView('client-list')}
            onStartPlan={(preset) => {
              if (preset) {
                // If a preset was applied, we might want to go to weekly-view or editor
                setCurrentView('weekly-view');
              } else {
                setCurrentView('workout-editor');
              }
            }}
          />
        );

      case 'weekly-view':
        return (
          <TrainingWeeklyView 
            client={selectedClient}
            onBack={() => setCurrentView('client-list')}
            onReassign={() => setCurrentView('no-plan')}
            onSelectDay={(dayId) => {
              setSelectedDayId(dayId);
              setCurrentView('workout-editor');
            }}
          />
        );

      case 'assign-program':
        return (
          <AssignProgram 
            clientId={selectedClient?.id} 
            onBack={() => setCurrentView('client-list')}
            onAssign={(pid) => {
              // Usually handle backend call here or inside component
              setCurrentView('weekly-view');
            }}
            onCreateScratch={() => setCurrentView('workout-editor')}
          />
        );

      case 'workout-editor':
        return (
          <WorkoutEditor 
            clientId={selectedClient?.id}
            onEditActivity={(id, name) => {
              if (name) setSelectedActivityName(name);
              setCurrentView('activity-editor');
            }}
            onBack={() => {
              if (selectedClient?.trainingPlanAssigned) {
                setCurrentView('weekly-view');
              } else {
                setCurrentView('client-list');
              }
            }}
          />
        );

      case 'activity-editor':
        return (
          <ActivityEditor 
            activityName={selectedActivityName || undefined}
            onBack={() => setCurrentView('workout-editor')}
          />
        );

      default:
        return <TrainingDashboard onNavigate={(view, cid) => handleNavigate(view as TrainingView, cid)} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 h-full overflow-hidden"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
