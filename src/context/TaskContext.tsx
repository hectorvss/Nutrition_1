import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useClient, ClientData } from './ClientContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { fetchWithAuth } from '../api';

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
  status: 'overdue' | 'today' | 'pending' | 'completed';
  timeLabel: string;
  endTime?: string;
  duration?: string;
  date?: string;
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



export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { clients } = useClient();
  const { user } = useAuth();
  const { t } = useLanguage();

  const localizedDefaultRules = useMemo<AutomationRule[]>(() => [
    { id: 'unread-dm', category: 'COMMUNICATIONS', title: t('automation_unread_title'), badge: 'Default', desc: t('automation_unread_desc'), priority: 'High', priorityColor: 'text-red-500', enabled: true },
    { id: 'new-leads', category: 'COMMUNICATIONS', title: t('automation_leads_title'), desc: t('automation_leads_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
    { id: 'sudden-weight', category: 'CLIENT PERFORMANCE', title: t('automation_sudden_weight_title'), desc: t('automation_sudden_weight_desc'), priority: 'High', priorityColor: 'text-red-500', enabled: true },
    { id: 'low-adherence', category: 'CLIENT PERFORMANCE', title: t('automation_low_adherence_title'), desc: t('automation_low_adherence_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
    { id: 'no-login', category: 'CLIENT PERFORMANCE', title: t('automation_no_login_title'), desc: t('automation_no_login_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
    { id: 'goal-milestone', category: 'CLIENT PERFORMANCE', title: t('automation_goal_milestone_title'), badge: 'Disabled', desc: t('automation_goal_milestone_desc'), priority: 'Low', priorityColor: 'text-slate-400', enabled: false },
    { id: 'onboarding-not-finished', category: 'OPERATIONS', title: t('automation_onboarding_title'), desc: t('automation_onboarding_desc'), priority: 'High', priorityColor: 'text-red-500', enabled: true },
    { id: 'weekly-overdue', category: 'OPERATIONS', title: t('automation_weekly_overdue_title'), desc: t('automation_weekly_overdue_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
    { id: 'plan-update', category: 'OPERATIONS', title: t('automation_plan_update_title'), desc: t('automation_plan_update_desc'), priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
  ], [t]);

  const [rules, setRules] = useState<AutomationRule[]>(localizedDefaultRules);
  const [manualTasks, setManualTasks] = useState<TaskItem[]>([]);
  const [completedAutomatedIds, setCompletedAutomatedIds] = useState<Record<string, string>>({}); // { id: dateStr }
  const [isLoading, setIsLoading] = useState(true);

  const fetchManualTasks = async () => {
    if (!user) {
      setManualTasks([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/manager/tasks');
      // ... mapping logic remains the same ...
      const formatted: TaskItem[] = (data || []).map((taskData: any) => ({
        id: taskData.id,
        title: taskData.title,
        desc: taskData.description || '',
        client: taskData.users?.name || 'General',
        program: 'Custom',
        avatar: '',
        status: taskData.status as any || 'today',
        timeLabel: taskData.time,
        endTime: taskData.end_time || taskData.endTime,
        duration: taskData.duration,
        date: taskData.date,
        priority: taskData.priority || 'medium',
        type: taskData.type,
        clientId: taskData.client_id || taskData.clientId
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
  }, [user]); // Re-run when user changes

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
        setManualTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
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
        date: task.date || new Date().toISOString().split('T')[0],
        time: task.timeLabel || '09:00',
        end_time: task.endTime || (parseInt((task.timeLabel || '09:00').split(':')[0]) + 1).toString().padStart(2, '0') + ':' + (task.timeLabel || '09:00').split(':')[1],
        duration: task.duration || '1h',
        priority: task.priority || 'medium'
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
    // Use a timestamp-based counter so generated IDs never collide with DB-persisted manual task IDs
    let taskIdCounter = Date.now();

    // Helper to evaluate clients against rules
    const evaluate = (client: ClientData) => {
      // Rule: Weekly Check-in Overdue
      const checkinRule = rules.find(r => r.id === 'weekly-overdue');
      if (checkinRule && checkinRule.enabled) {
        if (client.lastCheckIn === 'Never' || client.status === 'Inactive') {
          generated.push({
            id: taskIdCounter++,
            type: 'WEEKLY CHECK-IN',
            label: t('OVERDUE CHECK-IN'),
            title: t("Review {name}'s Status", { name: client.name }),
            desc: t('Client has missed check-in windows. Last check-in recorded: {date}.', { date: client.lastCheckIn }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: checkinRule.priority === 'High' ? 'overdue' : 'today',
            timeLabel: t('Overdue 2d'),
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
          label: t('LOW ADHERENCE'),
          title: t('Investigate drop in tracking'),
          desc: t('Client\'s overall progress is at {progress}%. May need intervention.', { progress: client.progress }),
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: adherenceRule.priority === 'High' ? 'overdue' : 'pending',
          timeLabel: t('Alert'),
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
          label: t('MISSING PLAN'),
          title: t('Assign Plan to {name}', { name: client.name }),
          desc: t('Client has no active training or nutrition plan assigned.'),
          client: client.name,
          program: 'None',
          avatar: client.avatar,
          status: 'today',
          timeLabel: t('Due Today'),
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
          if (completedAutomatedIds[idStr]) return false;
        }
        // Filter out manual tasks marked as completed
        if (t.status === 'completed') return false;
        return true;
      })
      .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  }, [clients, rules, manualTasks, completedAutomatedIds]);

  const completedTasks = useMemo(() => {
    // 1. Completed Manual Tasks
    const completedManual = manualTasks.filter(t => t.status === 'completed');
    
    // 2. Completed Automated Tasks (reconstruct)
    const allAutomated: TaskItem[] = [];
    let counter = 1;
    
    const evaluateForHistory = (client: any) => {
      // Re-run the same evaluate logic but only keep IDs in completedAutomatedIds
      // NOTE: This logic should ideally be a shared internal generator to avoid parity issues.
      // For now, let's keep it simple and ensure the manual tasks at least work.
      
      const checkinRule = rules.find(r => r.id === 'weekly-overdue');
      if (checkinRule && checkinRule.enabled) {
        if (client.lastCheckIn === 'Never' || client.status === 'Inactive') {
          allAutomated.push({
            id: counter++, type: 'WEEKLY CHECK-IN', title: `Review ${client.name}'s Status`, 
            client: client.name, avatar: client.avatar, status: 'completed', timeLabel: 'Done', priority: 'low',
            label: 'COMPLETED', desc: 'Manual review finished', program: client.plan || 'Custom'
          });
        }
      }
      
      const planRule = rules.find(r => r.id === 'plan-update');
      if (planRule && planRule.enabled && client.plan === 'No Plan' && client.status === 'Active') {
        allAutomated.push({
          id: counter++, type: 'PLAN UPDATE', title: `Assign Plan to ${client.name}`, 
          client: client.name, avatar: client.avatar, status: 'completed', timeLabel: 'Done', priority: 'low',
          label: 'COMPLETED', desc: 'Plan assigned', program: client.plan || 'Custom'
        });
      }
    };
    
    clients.forEach(evaluateForHistory);
    const completedAutomated = allAutomated.filter(t => completedAutomatedIds[t.id.toString()]);
    
    return [...completedManual, ...completedAutomated];
  }, [clients, manualTasks, completedAutomatedIds, rules]);

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
