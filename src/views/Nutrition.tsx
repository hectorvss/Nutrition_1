import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NutritionClientList from './NutritionClientList';
import NutritionPlanTemplates from './NutritionPlanTemplates';
import NutritionPlanDetail from './NutritionPlanDetail';
import NutritionNoPlan from './NutritionNoPlan';
import NutritionWeeklyView from './NutritionWeeklyView';
import FoodLibrary from './FoodLibrary';

type NutritionView = 'client-list' | 'plan-templates' | 'plan-detail' | 'food-library' | 'no-plan' | 'weekly-view';

export default function Nutrition() {
  const [currentView, setCurrentView] = useState<NutritionView>('client-list');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [initialPlanData, setInitialPlanData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleNavigate = (view: 'plan-templates' | 'plan-detail' | 'food-library' | 'weekly-view', client?: any) => {
    if (client) {
      setSelectedClient(client);
      
      // Decision logic: If going to detail/weekly, check assignment
      if (view === 'plan-detail' || view === 'weekly-view') {
        if (!client.nutritionPlanAssigned) {
          setCurrentView('no-plan');
          return;
        } else {
          setCurrentView('weekly-view');
          return;
        }
      }
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'client-list':
        return <NutritionClientList onNavigate={handleNavigate} />;
      case 'no-plan':
        return (
          <NutritionNoPlan
            client={selectedClient}
            onBack={() => setCurrentView('client-list')}
            onStartPlan={(preset, planData) => {
              setSelectedPreset(preset);
              setInitialPlanData(planData);
              setIsNewPlan(true);
              if (planData) {
                setSelectedDay('monday'); // Default to monday for dynamic generation
              }
              setCurrentView('plan-detail');
            }}
          />
        );
      case 'weekly-view':
        return (
          <NutritionWeeklyView
            client={selectedClient}
            onBack={() => setCurrentView('client-list')}
            onReassign={() => setCurrentView('no-plan')}
            onSelectDay={(dayId) => {
              setSelectedDay(dayId);
              setCurrentView('plan-detail');
            }}
          />
        );
      case 'plan-templates':
        return (
          <NutritionPlanTemplates
            client={selectedClient}
            onBack={() => setCurrentView('client-list')}
            onSelect={(isNew?: boolean) => {
              setIsNewPlan(!!isNew);
              setCurrentView('plan-detail');
            }}
          />
        );
      case 'plan-detail':
        return (
          <NutritionPlanDetail
            client={selectedClient}
            isNewPlan={isNewPlan}
            initialPlanData={initialPlanData}
            selectedDay={selectedDay}
            onBack={() => {
              setInitialPlanData(null);
              // Go back to weekly view if assigned, otherwise client list
              if (selectedClient?.nutritionPlanAssigned) {
                setCurrentView('weekly-view');
              } else {
                setCurrentView('client-list');
              }
            }}
          />
        );
      case 'food-library':
        return <FoodLibrary onBack={() => setCurrentView('client-list')} />;
      default:
        return <NutritionClientList onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
