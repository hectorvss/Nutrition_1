import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TriggerCategory = 'check-in' | 'activity' | 'milestone' | 'logistics' | 'custom';

export interface AutomationDeliveryRules {
  frequency: 'Once' | 'Every';
  frequencyValue: number;
  frequencyUnit: 'Days' | 'Weeks' | 'Months';
  deliveryTime: 'Morning' | 'Afternoon' | 'Evening' | 'Custom';
  customTime?: string;
  audience: 'All Clients' | 'By Tag';
  stopCondition: boolean;
  stopWhen: string;
}

export interface Automation {
  id: string;
  name: string;
  desc: string;
  trigger: string;
  triggerId: string;
  message: string;
  deliveryRules: AutomationDeliveryRules;
  enabled: boolean;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

const defaultDeliveryRules: AutomationDeliveryRules = {
  frequency: 'Every',
  frequencyValue: 7,
  frequencyUnit: 'Days',
  deliveryTime: 'Afternoon',
  audience: 'All Clients',
  stopCondition: false,
  stopWhen: 'Client replies to message'
};

const defaultAutomations: Automation[] = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    desc: 'Sent to new clients',
    trigger: 'Client Added',
    triggerId: 'new-client',
    message: "Hi {Client Name}! Welcome to NutriDash. I'm excited to start working with you on your health goals. Please complete your onboarding profile so we can get started!",
    deliveryRules: { ...defaultDeliveryRules, frequency: 'Once', deliveryTime: 'Morning' },
    enabled: true,
    iconName: 'Hand',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'weekly-checkin',
    name: 'Weekly Check-in Reminder',
    desc: 'Recurring weekly',
    trigger: 'Every Friday @ 9am',
    triggerId: 'weekly-checkin',
    message: "Hey {Client Name}, it's time for your weekly check-in! Please fill out the form linked below. Staying consistent is key to reaching your {Weight Goal}! 💪",
    deliveryRules: { ...defaultDeliveryRules, frequencyValue: 7, frequencyUnit: 'Days', deliveryTime: 'Morning' },
    enabled: true,
    iconName: 'Repeat',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'inactivity',
    name: 'Inactivity Alert',
    desc: 'Re-engagement campaign',
    trigger: 'No Login > 7 Days',
    triggerId: 'no-activity-7',
    message: "Hi {Client Name}, we've missed you! Just wanted to check in and see how things are going. Remember, small steps forward still count — let's reconnect whenever you're ready!",
    deliveryRules: { ...defaultDeliveryRules, frequencyValue: 7, deliveryTime: 'Afternoon', stopCondition: true, stopWhen: 'Client replies to message' },
    enabled: true,
    iconName: 'AlertTriangle',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'goal-milestone',
    name: 'Goal Milestone',
    desc: 'Celebration message',
    trigger: 'Weight Goal Hit',
    triggerId: 'milestone',
    message: "Congratulations {Client Name}! 🎉 You've reached your weight goal of {Weight Goal}. This is a huge achievement — let's talk about your next goal!",
    deliveryRules: { ...defaultDeliveryRules, frequency: 'Once' },
    enabled: false,
    iconName: 'PartyPopper',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'birthday',
    name: 'Birthday Wishes',
    desc: 'Personal touch',
    trigger: 'On Birthday',
    triggerId: 'birthday',
    message: "Happy Birthday {Client Name}! 🎂 Wishing you a healthy and happy year ahead. You deserve to celebrate! — {Coach Name}",
    deliveryRules: { ...defaultDeliveryRules, frequency: 'Once', deliveryTime: 'Morning' },
    enabled: true,
    iconName: 'Cake',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 'plan-renewal',
    name: 'Plan Renewal',
    desc: 'Retention',
    trigger: '7 Days Before Expiry',
    triggerId: 'plan-expiry',
    message: "Hi {Client Name}, your nutrition plan is expiring in 7 days. Let's schedule a call to review your progress and plan your next phase. You've come so far — let's keep the momentum going!",
    deliveryRules: { ...defaultDeliveryRules, frequency: 'Once' },
    enabled: false,
    iconName: 'FileText',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400'
  }
];

interface AutomationContextType {
  automations: Automation[];
  toggleAutomation: (id: string) => void;
  addAutomation: (automation: Omit<Automation, 'id'>) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export const AutomationProvider = ({ children }: { children: ReactNode }) => {
  const [automations, setAutomations] = useState<Automation[]>(defaultAutomations);

  useEffect(() => {
    const saved = localStorage.getItem('automations');
    if (saved) {
      try {
        setAutomations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse automations', e);
      }
    }
  }, []);

  const save = (list: Automation[]) => {
    setAutomations(list);
    localStorage.setItem('automations', JSON.stringify(list));
  };

  const toggleAutomation = (id: string) => {
    save(automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const addAutomation = (automation: Omit<Automation, 'id'>) => {
    const newAuto: Automation = { ...automation, id: Date.now().toString() };
    save([...automations, newAuto]);
  };

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    save(automations.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAutomation = (id: string) => {
    save(automations.filter(a => a.id !== id));
  };

  return (
    <AutomationContext.Provider value={{ automations, toggleAutomation, addAutomation, updateAutomation, deleteAutomation }}>
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
};
