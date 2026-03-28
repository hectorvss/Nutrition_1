import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useClient, ClientData } from './ClientContext';

export interface AutomationRule {
  id: string;
  category: 'COMMUNICATIONS' | 'CLIENT PERFORMANCE' | 'OPERATIONS';
  title: string;
  desc: string;
  priority: 'High' | 'Medium' | 'Low';
  enabled: boolean;
  priorityColor: string;
  badge?: string;
}

export interface TaskItem {
  id: number;
  type: string;
  label: string;
  title: string;
  desc: string;
  client: string;
  program: string;
  avatar: string;
  status: 'overdue' | 'today' | 'pending';
  timeLabel: string;
  priority: 'high' | 'medium' | 'low';
  metrics?: {
    weightChange: string;
    compliance: string;
  };
  clientId?: string;
  actionItems?: string[];
  notes?: string;
}

export type ManualTaskInput = Omit<TaskItem, 'id' | 'type' | 'label' | 'avatar'> & { type?: string, label?: string, avatar?: string };

interface TaskContextType {
  rules: AutomationRule[];
  tasks: TaskItem[];
  addManualTask: (task: ManualTaskInput) => void;
  updateRule: (id: string, updates: Partial<AutomationRule>) => void;
  saveRules: () => void;
  refreshTasks: () => Promise<void>;
  markTaskAsDone: (taskId: number | string) => Promise<void>;
  completedTasks: TaskItem[];
}

const defaultRules: AutomationRule[] = [
  { id: 'unread-dm', category: 'COMMUNICATIONS', title: 'Unread Direct Messages', badge: 'Default', desc: 'Create a task when a client sends a message that remains unread for > 2 hours.', priority: 'High', priorityColor: 'text-red-500', enabled: true },
  { id: 'new-leads', category: 'COMMUNICATIONS', title: 'New Leads', desc: 'Trigger task for immediate follow-up when a new lead inquiry is submitted.', priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
  { id: 'sudden-weight', category: 'CLIENT PERFORMANCE', title: 'Sudden Weight Drop', desc: 'Alert if weight decreases by > 2kg in a single week.', priority: 'High', priorityColor: 'text-red-500', enabled: true },
  { id: 'low-adherence', category: 'CLIENT PERFORMANCE', title: 'Adherence < 70%', desc: 'Create task when meal logging compliance drops below 70% for 3 consecutive days.', priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
  { id: 'no-login', category: 'CLIENT PERFORMANCE', title: 'No Login for 3+ days', desc: "Identify inactive clients who haven't opened the app recently.", priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
  { id: 'goal-milestone', category: 'CLIENT PERFORMANCE', title: 'Goal Milestone Reached', badge: 'Disabled', desc: 'Celebrate when a client hits a weight or performance PR.', priority: 'Low', priorityColor: 'text-slate-400', enabled: false },
  { id: 'onboarding-not-finished', category: 'OPERATIONS', title: 'Onboarding Not Finished', desc: "Flag clients who haven't completed the intake questionnaire within 48 hours.", priority: 'High', priorityColor: 'text-red-500', enabled: true },
  { id: 'weekly-overdue', category: 'OPERATIONS', title: 'Weekly Check-in Overdue', desc: 'Task generated when a scheduled check-in is missed by the client.', priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
  { id: 'plan-update', category: 'OPERATIONS', title: 'Plan Update Due', desc: 'Reminder to refresh client diet/workout plans every 4 weeks.', priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

import { fetchWithAuth } from '../api';

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [manualTasks, setManualTasks] = useState<TaskItem[]>([]);
  const [completedAutomatedIds, setCompletedAutomatedIds] = useState<Record<string, string>>({}); // { id: dateStr }
  const [isLoading, setIsLoading] = useState(true);
  const { clients } = useClient();

  const fetchManualTasks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/manager/tasks');
      // Filter out tasks that are also being handled by Calendar if necessary, 
      // but for now, we just map them to TaskItem structure.
      const formatted: TaskItem[] = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        desc: t.description || '',
        client: t.users?.name || 'General',
        program: 'Custom',
        avatar: '',
        status: t.status === 'completed' ? 'pending' : 'today',
        timeLabel: t.time,
        priority: 'medium',
        type: t.type,
        clientId: t.client_id || t.clientId
      }));
      setManualTasks(formatted);
    } catch (error) {
      console.error('Failed to fetch manual tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedRules = localStorage.getItem('automation_rules');
    if (savedRules) {
      try {
        setRules(JSON.parse(savedRules));
      } catch (e) {
        console.error("Failed to parse automation rules", e);
      }
    }
    
    const savedCompleted = localStorage.getItem('completed_automated_tasks');
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted);
        const todayStr = new Date().toISOString().split('T')[0];
        // Cleanup old day completions
        const fresh = Object.fromEntries(
          Object.entries(parsed).filter(([_, date]) => date === todayStr)
        );
        setCompletedAutomatedIds(fresh as any);
      } catch (e) {
        console.error("Failed to parse completed automated tasks", e);
      }
    }

    fetchManualTasks();
  }, []);

  const updateRule = (id: string, updates: Partial<AutomationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const saveRules = () => {
    localStorage.setItem('automation_rules', JSON.stringify(rules));
  };

  const markTaskAsDone = async (taskId: number | string) => {
    // 1. Identify if it's manual OR automated
    const isManual = typeof taskId === 'string' && taskId.includes('-'); // UUID-like
    const isLocalManual = manualTasks.find(t => t.id === taskId);

    if (isLocalManual) {
      try {
        await fetchWithAuth(`/manager/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        });
        setManualTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (error) {
        console.error('Failed to mark manual task as done:', error);
      }
    } else {
      // It's an automated generated task (numeric ID)
      const todayStr = new Date().toISOString().split('T')[0];
      const updated = { ...completedAutomatedIds, [taskId.toString()]: todayStr };
      setCompletedAutomatedIds(updated);
      localStorage.setItem('completed_automated_tasks', JSON.stringify(updated));
    }
  };

  const addManualTask = async (task: ManualTaskInput) => {
    try {
      // Map TaskItem structure back to SQL table structure
      const payload = {
        title: task.title,
        description: task.desc,
        type: task.type || 'MANUAL TASK',
        date: new Date().toISOString().split('T')[0], // Default to today for manual tasks unless specified
        time: '09:00', // Default
        duration: '30m'
      };
      
      const response = await fetchWithAuth('/manager/tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const newTask: TaskItem = {
        ...task,
        id: response.id,
        type: task.type || 'MANUAL TASK',
        label: task.label || 'USER CREATED',
        avatar: task.avatar || 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop',
      };
      setManualTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add manual task:', error);
    }
  };

  // Generate tasks dynamically based on clients and enabled rules
  const tasks = useMemo(() => {
    const generated: TaskItem[] = [...manualTasks];
    let taskIdCounter = generated.length > 0 ? Math.max(...generated.map(t => t.id)) + 1 : 1;

    // Helper to evaluate clients against rules
    const evaluate = (client: ClientData) => {
      // Rule: Weekly Check-in Overdue
      const checkinRule = rules.find(r => r.id === 'weekly-overdue');
      if (checkinRule && checkinRule.enabled) {
        if (client.lastCheckIn === 'Never' || client.status === 'Inactive') {
          generated.push({
            id: taskIdCounter++,
            type: 'WEEKLY CHECK-IN',
            label: 'OVERDUE CHECK-IN',
            title: `Review ${client.name}'s Status`,
            desc: `Client has missed check-in windows. Last check-in recorded: ${client.lastCheckIn}.`,
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: checkinRule.priority === 'High' ? 'overdue' : 'today',
            timeLabel: 'Overdue 2d',
            priority: checkinRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: Low Adherence (Simulated based on progress)
      const adherenceRule = rules.find(r => r.id === 'low-adherence');
      if (adherenceRule && adherenceRule.enabled && client.progress < 50 && client.status === 'Active') {
        generated.push({
          id: taskIdCounter++,
          type: 'AUTOMATIC ALERT',
          label: 'LOW ADHERENCE',
          title: `Investigate drop in tracking`,
          desc: `Client's overall progress is at ${client.progress}%. May need intervention.`,
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: adherenceRule.priority === 'High' ? 'overdue' : 'pending',
          timeLabel: 'Alert',
          priority: adherenceRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }
      
      // Rule: Plan Update Due (Simulated based on no plan)
      const planRule = rules.find(r => r.id === 'plan-update');
      if (planRule && planRule.enabled && client.plan === 'No Plan' && client.status === 'Active') {
         generated.push({
          id: taskIdCounter++,
          type: 'PLAN UPDATE',
          label: 'MISSING PLAN',
          title: `Assign Plan to ${client.name}`,
          desc: `Client has no active training or nutrition plan assigned.`,
          client: client.name,
          program: 'None',
          avatar: client.avatar,
          status: 'today',
          timeLabel: 'Due Today',
          priority: planRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }
    };

    clients.forEach(evaluate);
    
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return generated
      .filter(t => {
        // Filter out completed automated tasks for the active list
        const idStr = String(t.id);
        if (typeof t.id === 'number' || !idStr.includes('-')) {
          return !completedAutomatedIds[idStr];
        }
        return true; // Manual tasks already handled
      })
      .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  }, [clients, rules, manualTasks, completedAutomatedIds]);

  const completedTasks = useMemo(() => {
     // For simplicity in this demo, we'll just show the automated IDs from today 
     // but we'd normally want to keep their full objects. 
     // Let's filter the 'total generated' list specifically for completed items.
     
     // Re-run evaluation but only keep the ones in completedAutomatedIds
     const allPotentials: TaskItem[] = [];
     let counter = 1;

     const evaluateForHistory = (client: any) => {
        // ... (simplified version of evaluate to reconstruct basic title/client for history)
        // Checkin
        allPotentials.push({
            id: counter++, type: 'WEEKLY CHECK-IN', title: `Review ${client.name}'s Status`, 
            client: client.name, avatar: client.avatar, status: 'pending', timeLabel: 'Done today', priority: 'low',
            label: 'COMPLETED', desc: 'Manual review finished', program: client.plan || 'Custom'
        });
        // Plan
        allPotentials.push({
            id: counter++, type: 'PLAN UPDATE', title: `Assign Plan to ${client.name}`, 
            client: client.name, avatar: client.avatar, status: 'pending', timeLabel: 'Done today', priority: 'low',
            label: 'COMPLETED', desc: 'Plan assigned', program: client.plan || 'Custom'
        });
     };
     clients.forEach(evaluateForHistory);

     return allPotentials.filter(t => completedAutomatedIds[t.id.toString()]);
  }, [clients, completedAutomatedIds]);

  return (
    <TaskContext.Provider value={{ rules, tasks, addManualTask, updateRule, saveRules, refreshTasks: fetchManualTasks, markTaskAsDone, completedTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
