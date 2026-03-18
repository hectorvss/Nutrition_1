import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AutomationsList from './AutomationsList';
import AutomationCreateTrigger from './AutomationCreateTrigger';
import AutomationCreateMessage from './AutomationCreateMessage';
import AutomationCreateReview from './AutomationCreateReview';
import { Automation, AutomationDeliveryRules } from '../context/AutomationContext';

type AutomationsView = 'list' | 'step-trigger' | 'step-message' | 'step-review';

interface WizardData {
  triggerId: string;
  triggerName: string;
  message: string;
  deliveryRules: AutomationDeliveryRules;
  automationName: string;
  // edit mode
  editingId?: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

const defaultWizard: WizardData = {
  triggerId: '',
  triggerName: '',
  message: '',
  automationName: '',
  iconName: 'Repeat',
  iconBg: 'bg-blue-100',
  iconColor: 'text-blue-600',
  deliveryRules: {
    frequency: 'Every',
    frequencyValue: 7,
    frequencyUnit: 'Days',
    deliveryTime: 'Afternoon',
    audience: 'All Clients',
    stopCondition: false,
    stopWhen: 'Client replies to message'
  }
};

export default function Automations() {
  const [currentView, setCurrentView] = useState<AutomationsView>('list');
  const [wizard, setWizard] = useState<WizardData>(defaultWizard);

  const updateWizard = (updates: Partial<WizardData>) => {
    setWizard(prev => ({ ...prev, ...updates }));
  };

  const startCreate = () => {
    setWizard(defaultWizard);
    setCurrentView('step-trigger');
  };

  const startEdit = (automation: Automation) => {
    setWizard({
      triggerId: automation.triggerId,
      triggerName: automation.trigger,
      message: automation.message,
      automationName: automation.name,
      deliveryRules: automation.deliveryRules,
      editingId: automation.id,
      iconName: automation.iconName,
      iconBg: automation.iconBg,
      iconColor: automation.iconColor
    });
    setCurrentView('step-message'); // go straight to message editor when editing
  };

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <AutomationsList 
            onCreateNew={startCreate}
            onEdit={startEdit}
          />
        );
      case 'step-trigger':
        return (
          <AutomationCreateTrigger 
            onBack={() => setCurrentView('list')} 
            onNext={(triggerId, triggerName, iconName, iconBg, iconColor) => {
              updateWizard({ triggerId, triggerName, automationName: triggerName, iconName, iconBg, iconColor });
              setCurrentView('step-message');
            }} 
          />
        );
      case 'step-message':
        return (
          <AutomationCreateMessage 
            triggerName={wizard.triggerName}
            initialMessage={wizard.message}
            initialRules={wizard.deliveryRules}
            isEditing={!!wizard.editingId}
            onBack={() => setCurrentView(wizard.editingId ? 'list' : 'step-trigger')} 
            onNext={(message, deliveryRules) => {
              updateWizard({ message, deliveryRules });
              setCurrentView('step-review');
            }} 
          />
        );
      case 'step-review':
        return (
          <AutomationCreateReview 
            wizardData={wizard}
            onBack={() => setCurrentView('step-message')} 
            onActivate={() => {
              setWizard(defaultWizard);
              setCurrentView('list');
            }} 
          />
        );
      default:
        return <AutomationsList onCreateNew={startCreate} onEdit={startEdit} />;
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
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
