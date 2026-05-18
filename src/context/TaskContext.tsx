import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
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
  id: string | number;
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
  markTaskAsPending: (taskId: number | string) => Promise<void>;
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
  { id: 'checkin-to-review', category: 'OPERATIONS', title: 'Check-in Awaiting Review', desc: 'Task created when a client submits a check-in that the coach has not reviewed yet.', priority: 'High', priorityColor: 'text-red-500', enabled: true },
  { id: 'sudden-weight-gain', category: 'CLIENT PERFORMANCE', title: 'Sudden Weight Gain', desc: 'Alert if weight increases by > 2kg between the two most recent check-ins.', priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
  { id: 'stale-plan', category: 'OPERATIONS', title: 'Plan Older Than 4 Weeks', desc: 'Reminder when a client plan has not been updated for over 4 weeks.', priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
  { id: 'no-appointment', category: 'OPERATIONS', title: 'No Upcoming Appointment', desc: 'Flag active clients with no future appointment scheduled.', priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
  { id: 'first-checkin', category: 'CLIENT PERFORMANCE', title: 'First Check-in Completed', desc: 'Celebrate and give feedback when a client submits their very first check-in.', priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
  { id: 'missed-workout', category: 'CLIENT PERFORMANCE', title: 'Workout Streak Broken', desc: 'Alert when a client with a training plan has not logged a workout for 5+ days.', priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
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
    { id: 'checkin-to-review', category: 'OPERATIONS', title: t('automation_checkin_review_title'), desc: t('automation_checkin_review_desc'), priority: 'High', priorityColor: 'text-red-500', enabled: true },
    { id: 'sudden-weight-gain', category: 'CLIENT PERFORMANCE', title: t('automation_weight_gain_title'), desc: t('automation_weight_gain_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
    { id: 'stale-plan', category: 'OPERATIONS', title: t('automation_stale_plan_title'), desc: t('automation_stale_plan_desc'), priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
    { id: 'no-appointment', category: 'OPERATIONS', title: t('automation_no_appointment_title'), desc: t('automation_no_appointment_desc'), priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
    { id: 'first-checkin', category: 'CLIENT PERFORMANCE', title: t('automation_first_checkin_title'), desc: t('automation_first_checkin_desc'), priority: 'Low', priorityColor: 'text-slate-400', enabled: true },
    { id: 'missed-workout', category: 'CLIENT PERFORMANCE', title: t('automation_missed_workout_title'), desc: t('automation_missed_workout_desc'), priority: 'Medium', priorityColor: 'text-orange-500', enabled: true },
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
        const parsed: AutomationRule[] = JSON.parse(savedRules);
        const savedById = new Map(parsed.map(r => [r.id, r]));
        // Merge saved state onto the current defaults: keep localized text from
        // defaults, apply the manager's saved enabled/priority, and automatically
        // include any newly added rule that the saved copy does not have yet.
        const merged = localizedDefaultRules.map(def => {
          const saved = savedById.get(def.id);
          return saved
            ? { ...def, enabled: saved.enabled, priority: saved.priority, priorityColor: saved.priorityColor }
            : def;
        });
        setRules(merged);
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
    const idStr = String(taskId);

    // Automated tasks carry a stable deterministic id ("auto:<rule>:<clientId>").
    // Their completion is tracked per-day in localStorage.
    if (idStr.startsWith('auto:')) {
      const todayStr = new Date().toISOString().split('T')[0];
      const updated = { ...completedAutomatedIds, [idStr]: todayStr };
      setCompletedAutomatedIds(updated);
      localStorage.setItem('completed_automated_tasks', JSON.stringify(updated));
      return;
    }

    // Manual (DB-persisted) task — optimistic: update the UI instantly so the
    // completion animation never waits on the network; roll back only on error.
    setManualTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    try {
      await fetchWithAuth(`/manager/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      });
    } catch (error) {
      console.error('Failed to mark manual task as done:', error);
      setManualTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'pending' } : t));
    }
  };

  // Toggle a task back to pending (undo a completion).
  const markTaskAsPending = async (taskId: number | string) => {
    const idStr = String(taskId);

    if (idStr.startsWith('auto:')) {
      const updated = { ...completedAutomatedIds };
      delete updated[idStr];
      setCompletedAutomatedIds(updated);
      localStorage.setItem('completed_automated_tasks', JSON.stringify(updated));
      return;
    }

    // Optimistic: restore the task instantly, roll back on error.
    setManualTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'pending' } : t));
    try {
      await fetchWithAuth(`/manager/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'pending' })
      });
    } catch (error) {
      console.error('Failed to mark manual task as pending:', error);
      setManualTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
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

  // Shared generator: produces ALL automated tasks with STABLE deterministic IDs
  // ("auto:<rule>:<clientId>"). Used by both the active list and the completed
  // history, so a task keeps the same identity across renders and both views.
  const buildAutomatedTasks = useCallback((clientList: ClientData[], ruleList: AutomationRule[]): TaskItem[] => {
    const generated: TaskItem[] = [];

    // Maps a rule's configured priority to a task status bucket.
    const statusFor = (priority: string): TaskItem['status'] =>
      priority === 'High' ? 'overdue' : priority === 'Low' ? 'pending' : 'today';

    const HOUR = 1000 * 60 * 60;
    const DAY = HOUR * 24;
    const nowMs = Date.now();

    clientList.forEach(client => {
      // Rule: Weekly Check-in Overdue
      const checkinRule = ruleList.find(r => r.id === 'weekly-overdue');
      if (checkinRule?.enabled && (client.lastCheckIn === 'Never' || client.status === 'Inactive')) {
        generated.push({
          id: `auto:weekly-overdue:${client.id}`,
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

      // Rule: Low Adherence (based on progress)
      const adherenceRule = ruleList.find(r => r.id === 'low-adherence');
      if (adherenceRule?.enabled && client.progress < 50 && client.status === 'Active') {
        generated.push({
          id: `auto:low-adherence:${client.id}`,
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

      // Rule: Plan Update Due (based on no plan assigned)
      const planRule = ruleList.find(r => r.id === 'plan-update');
      if (planRule?.enabled && client.plan === 'No Plan' && client.status === 'Active') {
        generated.push({
          id: `auto:plan-update:${client.id}`,
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

      // Rule: Unread Direct Messages (a client message left unread for > 2h)
      const unreadRule = ruleList.find(r => r.id === 'unread-dm');
      if (unreadRule?.enabled && (client.unreadMessages || 0) > 0 && client.oldestUnreadAt && client.status !== 'Archived') {
        const hoursWaiting = (nowMs - new Date(client.oldestUnreadAt).getTime()) / HOUR;
        if (hoursWaiting > 2) {
          generated.push({
            id: `auto:unread-dm:${client.id}`,
            type: 'DIRECT MESSAGE',
            label: t('UNREAD MESSAGE'),
            title: t('Reply to {name}', { name: client.name }),
            desc: t('{count} unread message(s) waiting for over {hours}h.', { count: client.unreadMessages || 0, hours: Math.floor(hoursWaiting) }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(unreadRule.priority),
            timeLabel: t('Alert'),
            priority: unreadRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: New Leads (client invited/pending awaiting first contact)
      const leadRule = ruleList.find(r => r.id === 'new-leads');
      if (leadRule?.enabled && (client.status === 'Invited' || client.status === 'Pending')) {
        generated.push({
          id: `auto:new-leads:${client.id}`,
          type: 'AUTOMATIC ALERT',
          label: t('NEW LEAD'),
          title: t('Follow up with new lead {name}', { name: client.name }),
          desc: t('New lead awaiting first contact and onboarding.'),
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: statusFor(leadRule.priority),
          timeLabel: t('Due Today'),
          priority: leadRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }

      // Rule: Sudden Weight Drop (> 2kg between the two most recent check-ins)
      const weightRule = ruleList.find(r => r.id === 'sudden-weight');
      if (weightRule?.enabled && client.status === 'Active') {
        const weighed = (client.check_ins || [])
          .map((ci: any) => {
            let d = ci.data_json;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
            const w = Number(d?.weight);
            return { date: ci.date, weight: Number.isFinite(w) && w > 0 ? w : null };
          })
          .filter((x: any) => x.weight !== null && x.date)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (weighed.length >= 2) {
          const drop = (weighed[1].weight as number) - (weighed[0].weight as number);
          const daysBetween = (new Date(weighed[0].date).getTime() - new Date(weighed[1].date).getTime()) / DAY;
          if (drop > 2 && daysBetween <= 10) {
            generated.push({
              id: `auto:sudden-weight:${client.id}`,
              type: 'AUTOMATIC ALERT',
              label: t('WEIGHT DROP'),
              title: t('Sudden weight drop for {name}', { name: client.name }),
              desc: t('{name} lost {kg}kg since the previous check-in. Review for safety.', { name: client.name, kg: drop.toFixed(1) }),
              client: client.name,
              program: client.plan,
              avatar: client.avatar,
              status: statusFor(weightRule.priority),
              timeLabel: t('Alert'),
              priority: weightRule.priority.toLowerCase() as any,
              clientId: client.id
            });
          }
        }
      }

      // Rule: No Login for 3+ days (no check-in or workout activity since)
      const loginRule = ruleList.find(r => r.id === 'no-login');
      if (loginRule?.enabled && client.status === 'Active' && client.lastActivityAt) {
        const daysInactive = Math.floor((nowMs - new Date(client.lastActivityAt).getTime()) / DAY);
        if (daysInactive >= 3) {
          generated.push({
            id: `auto:no-login:${client.id}`,
            type: 'AUTOMATIC ALERT',
            label: t('INACTIVE CLIENT'),
            title: t('{name} has been inactive', { name: client.name }),
            desc: t('No app activity (check-in or workout) for {days}+ days.', { days: daysInactive }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(loginRule.priority),
            timeLabel: t('Alert'),
            priority: loginRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: Goal Milestone Reached (high adherence — celebrate the win)
      const milestoneRule = ruleList.find(r => r.id === 'goal-milestone');
      if (milestoneRule?.enabled && client.status === 'Active' && client.progress >= 95) {
        generated.push({
          id: `auto:goal-milestone:${client.id}`,
          type: 'AUTOMATIC ALERT',
          label: t('MILESTONE'),
          title: t('{name} reached a milestone', { name: client.name }),
          desc: t('{name} is at {progress}% adherence — send some encouragement!', { name: client.name, progress: client.progress }),
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: statusFor(milestoneRule.priority),
          timeLabel: t('Win'),
          priority: milestoneRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }

      // Rule: Onboarding Not Finished (invited client > 48h without completing intake)
      const onboardingRule = ruleList.find(r => r.id === 'onboarding-not-finished');
      if (onboardingRule?.enabled && client.status === 'Invited' && client.created_at) {
        const hoursSinceInvite = (nowMs - new Date(client.created_at).getTime()) / HOUR;
        if (hoursSinceInvite > 48) {
          generated.push({
            id: `auto:onboarding-not-finished:${client.id}`,
            type: 'AUTOMATIC ALERT',
            label: t('ONBOARDING PENDING'),
            title: t("{name} hasn't finished onboarding", { name: client.name }),
            desc: t('Intake questionnaire still not completed after 48 hours.'),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(onboardingRule.priority),
            timeLabel: t('Overdue 2d'),
            priority: onboardingRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: Check-in Awaiting Review (client submitted a check-in not yet reviewed)
      const reviewRule = ruleList.find(r => r.id === 'checkin-to-review');
      if (reviewRule?.enabled && client.isUnreviewed) {
        generated.push({
          id: `auto:checkin-to-review:${client.id}`,
          type: 'WEEKLY CHECK-IN',
          label: t('CHECK-IN TO REVIEW'),
          title: t("Review {name}'s check-in", { name: client.name }),
          desc: t('{name} submitted a check-in that is still pending your review.', { name: client.name }),
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: statusFor(reviewRule.priority),
          timeLabel: t('Alert'),
          priority: reviewRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }

      // Rule: Sudden Weight Gain (> 2kg between the two most recent check-ins)
      const weightGainRule = ruleList.find(r => r.id === 'sudden-weight-gain');
      if (weightGainRule?.enabled && client.status === 'Active') {
        const weighed = (client.check_ins || [])
          .map((ci: any) => {
            let d = ci.data_json;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
            const w = Number(d?.weight);
            return { date: ci.date, weight: Number.isFinite(w) && w > 0 ? w : null };
          })
          .filter((x: any) => x.weight !== null && x.date)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (weighed.length >= 2) {
          const gain = (weighed[0].weight as number) - (weighed[1].weight as number);
          const daysBetween = (new Date(weighed[0].date).getTime() - new Date(weighed[1].date).getTime()) / DAY;
          if (gain > 2 && daysBetween <= 10) {
            generated.push({
              id: `auto:sudden-weight-gain:${client.id}`,
              type: 'AUTOMATIC ALERT',
              label: t('WEIGHT GAIN'),
              title: t('Sudden weight gain for {name}', { name: client.name }),
              desc: t('{name} gained {kg}kg since the previous check-in. Review the plan.', { name: client.name, kg: gain.toFixed(1) }),
              client: client.name,
              program: client.plan,
              avatar: client.avatar,
              status: statusFor(weightGainRule.priority),
              timeLabel: t('Alert'),
              priority: weightGainRule.priority.toLowerCase() as any,
              clientId: client.id
            });
          }
        }
      }

      // Rule: Plan Older Than 4 Weeks (assigned plan not refreshed recently)
      const stalePlanRule = ruleList.find(r => r.id === 'stale-plan');
      if (stalePlanRule?.enabled && client.status === 'Active' && client.planUpdatedAt) {
        const weeksOld = (nowMs - new Date(client.planUpdatedAt).getTime()) / (DAY * 7);
        if (weeksOld >= 4) {
          generated.push({
            id: `auto:stale-plan:${client.id}`,
            type: 'PLAN UPDATE',
            label: t('PLAN OUTDATED'),
            title: t('Refresh plan for {name}', { name: client.name }),
            desc: t("{name}'s plan hasn't been updated in over 4 weeks.", { name: client.name }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(stalePlanRule.priority),
            timeLabel: t('Due Today'),
            priority: stalePlanRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: No Upcoming Appointment (active client with nothing scheduled)
      const apptRule = ruleList.find(r => r.id === 'no-appointment');
      if (apptRule?.enabled && client.status === 'Active' && client.nextAppointment === 'Not Scheduled') {
        generated.push({
          id: `auto:no-appointment:${client.id}`,
          type: 'AUTOMATIC ALERT',
          label: t('NO APPOINTMENT'),
          title: t('Schedule a session with {name}', { name: client.name }),
          desc: t('{name} has no upcoming appointment booked.', { name: client.name }),
          client: client.name,
          program: client.plan,
          avatar: client.avatar,
          status: statusFor(apptRule.priority),
          timeLabel: t('Due Today'),
          priority: apptRule.priority.toLowerCase() as any,
          clientId: client.id
        });
      }

      // Rule: First Check-in Completed (new client just submitted their first one)
      const firstCheckinRule = ruleList.find(r => r.id === 'first-checkin');
      if (firstCheckinRule?.enabled && (client.check_ins || []).length === 1) {
        const ci: any = (client.check_ins as any[])[0];
        const daysSince = ci?.date ? (nowMs - new Date(ci.date).getTime()) / DAY : 999;
        if (daysSince <= 3) {
          generated.push({
            id: `auto:first-checkin:${client.id}`,
            type: 'WEEKLY CHECK-IN',
            label: t('FIRST CHECK-IN'),
            title: t('{name} completed their first check-in', { name: client.name }),
            desc: t('Give {name} feedback on their first check-in to build momentum.', { name: client.name }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(firstCheckinRule.priority),
            timeLabel: t('Win'),
            priority: firstCheckinRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }

      // Rule: Workout Streak Broken (no workout logged for 5+ days with an active plan)
      const missedWorkoutRule = ruleList.find(r => r.id === 'missed-workout');
      if (missedWorkoutRule?.enabled && client.status === 'Active' && client.trainingPlanAssigned && client.lastWorkoutAt) {
        const daysSinceWorkout = Math.floor((nowMs - new Date(client.lastWorkoutAt).getTime()) / DAY);
        if (daysSinceWorkout >= 5) {
          generated.push({
            id: `auto:missed-workout:${client.id}`,
            type: 'AUTOMATIC ALERT',
            label: t('STREAK BROKEN'),
            title: t('{name} stopped training', { name: client.name }),
            desc: t('No workout logged for {days}+ days despite an active training plan.', { days: daysSinceWorkout }),
            client: client.name,
            program: client.plan,
            avatar: client.avatar,
            status: statusFor(missedWorkoutRule.priority),
            timeLabel: t('Alert'),
            priority: missedWorkoutRule.priority.toLowerCase() as any,
            clientId: client.id
          });
        }
      }
    });

    return generated;
  }, [t]);

  // Active tasks: manual (not completed) + automated (not marked done today)
  const tasks = useMemo(() => {
    const automated = buildAutomatedTasks(clients, rules);
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return [...manualTasks, ...automated]
      .filter(task => {
        if (task.status === 'completed') return false;
        const idStr = String(task.id);
        if (idStr.startsWith('auto:') && completedAutomatedIds[idStr]) return false;
        return true;
      })
      .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  }, [clients, rules, manualTasks, completedAutomatedIds, buildAutomatedTasks]);

  // Completed tasks: manual marked completed + automated marked done today
  const completedTasks = useMemo(() => {
    const completedManual = manualTasks.filter(t => t.status === 'completed');
    const completedAutomated = buildAutomatedTasks(clients, rules)
      .filter(task => completedAutomatedIds[String(task.id)])
      .map(task => ({ ...task, status: 'completed' as const, timeLabel: t('done_today') }));
    return [...completedManual, ...completedAutomated];
  }, [clients, rules, manualTasks, completedAutomatedIds, buildAutomatedTasks, t]);

  return (
    <TaskContext.Provider value={{ rules, tasks, addManualTask, updateRule, saveRules, refreshTasks: fetchManualTasks, markTaskAsDone, markTaskAsPending, completedTasks }}>
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
