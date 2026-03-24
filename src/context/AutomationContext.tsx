import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '../api';

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
  activation_conditions?: {
    type: string;
    operator: '>' | '<' | '==' | 'contains';
    value: any;
    enabled: boolean;
  }[];
}

export interface Automation {
  id: string;
  name: string;
  desc: string;
  trigger: string;
  trigger_id: string; // Changed from triggerId for DB consistency
  message: string;
  delivery_rules: AutomationDeliveryRules; // Changed from deliveryRules
  enabled: boolean;
  icon_info: {
    iconName: string;
    iconBg: string;
    iconColor: string;
  };
}

// Map frontend props to DB props for legacy support in existing components if needed
// Actually, I'll keep the DB names in the interface to avoid confusion

interface AutomationContextType {
  automations: Automation[];
  loading: boolean;
  toggleAutomation: (id: string) => Promise<void>;
  addAutomation: (automation: any) => Promise<void>;
  updateAutomation: (id: string, updates: any) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export const AutomationProvider = ({ children }: { children: ReactNode }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/automations');
      setAutomations(data || []);
    } catch (e) {
      console.error('Failed to load automations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const toggleAutomation = async (id: string) => {
    const auto = automations.find(a => a.id === id);
    if (!auto) return;
    
    try {
      await fetchWithAuth(`/automations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !auto.enabled })
      });
      setAutomations(automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const addAutomation = async (automation: any) => {
    try {
      // Map frontend-style keys to DB-style keys if necessary
      const payload = {
        name: automation.name,
        description: automation.desc,
        trigger_id: automation.triggerId,
        message: automation.message,
        delivery_rules: automation.deliveryRules,
        icon_info: {
          iconName: automation.iconName,
          iconBg: automation.iconBg,
          iconColor: automation.iconColor
        },
        enabled: true
      };

      const newAuto = await fetchWithAuth('/automations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setAutomations([...automations, newAuto]);
    } catch (e) {
      console.error('Add failed', e);
    }
  };

  const updateAutomation = async (id: string, updates: any) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.desc !== undefined) payload.description = updates.desc;
      if (updates.triggerId !== undefined) payload.trigger_id = updates.triggerId;
      if (updates.message !== undefined) payload.message = updates.message;
      if (updates.deliveryRules !== undefined) payload.delivery_rules = updates.deliveryRules;
      if (updates.iconName !== undefined || updates.iconBg !== undefined || updates.iconColor !== undefined) {
        payload.icon_info = {
          iconName: updates.iconName ?? updates.icon_info?.iconName,
          iconBg: updates.iconBg ?? updates.icon_info?.iconBg,
          iconColor: updates.iconColor ?? updates.icon_info?.iconColor
        };
      }
      if (updates.enabled !== undefined) payload.enabled = updates.enabled;

      const updated = await fetchWithAuth(`/automations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setAutomations(automations.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch (e) {
      console.error('Update failed', e);
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      await fetchWithAuth(`/automations/${id}`, { method: 'DELETE' });
      setAutomations(automations.filter(a => a.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  return (
    <AutomationContext.Provider value={{ 
      automations, 
      loading,
      toggleAutomation, 
      addAutomation, 
      updateAutomation, 
      deleteAutomation,
      reload: loadAutomations
    }}>
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
};
