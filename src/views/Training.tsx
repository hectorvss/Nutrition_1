import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TrainingDashboard from './TrainingDashboard';
import TrainingNoPlan from './TrainingNoPlan';
import TrainingWeeklyView from './TrainingWeeklyView';
import WorkoutEditor from './WorkoutEditor';
import { fetchWithAuth } from '../api';
import AssignProgram from './AssignProgram';
import ActivityEditor from './ActivityEditor';
import TrainingPlanTemplates from './TrainingPlanTemplates';

type TrainingView = 'client-list' | 'no-plan' | 'weekly-view' | 'workout-editor' | 'assign-program' | 'activity-editor' | 'plan-templates';

export default function Training() {
  const [currentView, setCurrentView] = useState<TrainingView>('client-list');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);
  const [initialPlanData, setInitialPlanData] = useState<any>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<{ id: string; name: string } | null>(null);

  const handleNavigate = (view: TrainingView, clientId?: string | any) => {
    if (clientId) {
      // If it's an object (from the client list), use it directly
      const client = typeof clientId === 'object' ? clientId : { id: clientId };
      setSelectedClient(client);
      setEditingTemplate(null);  // navigating to a real client exits template mode

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
            onStartPlan={(preset, planData) => {
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
            client={editingTemplate ? { name: editingTemplate.name } : selectedClient}
            templateId={editingTemplate ? editingTemplate.id : null}
            initialPlanData={editingTemplate ? null : initialPlanData}
            onBack={() => {
              if (editingTemplate) { setEditingTemplate(null); setCurrentView('plan-templates'); }
              else setCurrentView('client-list');
            }}
            onReassign={editingTemplate ? undefined : () => setCurrentView('no-plan')}
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
                setAssignError(null);
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
              } catch (error: any) {
                console.error('Error assigning program:', error);
                setAssignError(error?.message || 'Error assigning program');
              }
            }}
            onCreateScratch={() => setCurrentView('workout-editor')}
          />
        );

      case 'workout-editor':
        return (
          <WorkoutEditor
            clientId={editingTemplate ? null : selectedClient?.id}
            templateId={editingTemplate ? editingTemplate.id : null}
            dayId={selectedDayId}
            initialPlanData={editingTemplate ? null : initialPlanData}
            onEditActivity={(id, name) => {
              if (name) setSelectedActivityName(name);
              setCurrentView('activity-editor');
            }}
            onBack={() => {
              setInitialPlanData(null);
              if (editingTemplate) {
                setCurrentView('weekly-view');
              } else if (selectedClient?.trainingPlanAssigned) {
                setCurrentView('weekly-view');
              } else {
                setCurrentView('client-list');
              }
            }}
          />
        );

      case 'plan-templates':
        return (
          <TrainingPlanTemplates
            onBack={() => setCurrentView('client-list')}
            onEditTemplate={(id, name) => {
              setEditingTemplate({ id, name });
              setSelectedDayId(null);
              setInitialPlanData(null);
              setCurrentView('weekly-view');
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
      {assignError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span className="text-sm font-medium">{assignError}</span>
          <button onClick={() => setAssignError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
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
