import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TrainingDashboard from './TrainingDashboard';
import TrainingNoPlan from './TrainingNoPlan';
import TrainingWeeklyView from './TrainingWeeklyView';
import WorkoutEditor from './WorkoutEditor';
import { fetchWithAuth } from '../api';
import AssignProgram from './AssignProgram';
import ActivityEditor from './ActivityEditor';

type TrainingView = 'client-list' | 'no-plan' | 'weekly-view' | 'workout-editor' | 'assign-program' | 'activity-editor';

export default function Training() {
  const [currentView, setCurrentView] = useState<TrainingView>('client-list');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [initialPlanData, setInitialPlanData] = useState<any>(null);

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
            onStartPlan={(planData) => {
              if (planData) {
                setInitialPlanData(planData);
                setCurrentView('weekly-view');
              } else {
                setInitialPlanData(null);
                setCurrentView('workout-editor');
              }
            }}
          />
        );

      case 'weekly-view':
        return (
          <TrainingWeeklyView 
            client={selectedClient}
            initialPlanData={initialPlanData}
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
            onAssign={async (pid, dataJson) => {
              try {
                await fetchWithAuth(`/manager/clients/${selectedClient.id}/training-program`, {
                  method: 'POST',
                  body: JSON.stringify({
                    name: dataJson.name,
                    data_json: dataJson
                  })
                });
                setSelectedClient({ ...selectedClient, trainingPlanAssigned: true });
                setInitialPlanData(null);
                setCurrentView('weekly-view');
              } catch (error) {
                console.error('Error assigning program:', error);
              }
            }}
            onCreateScratch={() => setCurrentView('workout-editor')}
          />
        );

      case 'workout-editor':
        return (
          <WorkoutEditor 
            clientId={selectedClient?.id}
            dayId={selectedDayId}
            initialPlanData={initialPlanData}
            onEditActivity={(id, name) => {
              if (name) setSelectedActivityName(name);
              setCurrentView('activity-editor');
            }}
            onBack={() => {
              setInitialPlanData(null);
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
