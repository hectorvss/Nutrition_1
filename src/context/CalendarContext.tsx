import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Utensils, Dumbbell, ClipboardCheck, Video, MapPin, User, LucideIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';

export type EventType = 'Video Call' | 'In-Person' | 'Training' | 'Nutrition' | 'Internal' | 'Training Analysis';

export interface CalendarEvent {
  id: string;
  time: string; // e.g. "09:00" or "14:30"
  endTime?: string; // e.g. "10:30"
  date: string; // YYYY-MM-DD format ideally
  duration: string; // e.g. "30m", "1h", "1h 30m"
  title: string;
  type: EventType;
  desc?: string;
  client?: string; // Client Name
  avatar?: string | null;
  initials?: string;
  clientId?: string; // Optional reference to actual client
  status: 'pending' | 'completed' | 'in_progress';
  /**
   * Prioridad visual de la tarea. Determina en que columna aparece en la
   * pantalla Tasks (`Tasks.tsx` agrupa por `priority`). Persistida en BD
   * como columna `tasks.priority` (CHECK enum low/medium/high).
   */
  priority?: 'low' | 'medium' | 'high';
  linkUrl?: string;
  // Recurrence metadata. Present for both parent and virtual instance rows.
  // `isVirtual` distinguishes a generated occurrence from a stored DB row;
  // `recurrenceParentId` points to the parent task for virtual instances.
  recurrenceRule?: string | null;
  recurrenceEnd?: string | null;
  recurrenceParentId?: string | null;
  isVirtual?: boolean;
  repeat?: string; // legacy UI selector value (Daily/Weekly/Monthly/Custom)
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'> & { repeat?: string; recurrenceRule?: string; recurrenceEnd?: string }) => Promise<CalendarEvent>;
  deleteEvent: (id: string, scope?: 'instance' | 'series') => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent> & { repeat?: string; recurrenceRule?: string; recurrenceEnd?: string }, scope?: 'instance' | 'series') => Promise<CalendarEvent>;
  getEventsForDate: (dateStr: string) => CalendarEvent[];
  refreshEvents: () => Promise<void>;
  loadRange: (from: string, to: string) => Promise<void>;
}

// Initial dummy data aligned with the design, but now dynamic
const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    time: '08:00',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '45m',
    title: 'Sarah Jenkins: Morning Check-in',
    type: 'Video Call',
    client: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'completed'
  },
  {
    id: '2',
    time: '10:00',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '30m',
    title: 'Mike K: Plan Update',
    type: 'Training',
    client: 'Mike K.',
    initials: 'MK',
    status: 'pending'
  },
  {
    id: '3',
    time: '11:30',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '1h',
    title: 'Follow-up: Diet Plan Review',
    type: 'In-Person',
    client: 'Mike Ross',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    status: 'pending'
  },
  {
    id: '4',
    time: '15:00',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '1h 30m',
    title: 'Alice L: Strength Session Review',
    type: 'Training Analysis',
    client: 'Alice L',
    initials: 'AL',
    desc: "Review squat form videos and adjust next week's progressive overload targets. Check adherence to RPE.",
    status: 'pending'
  }
];

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);


export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Track user for cleanup
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapBackendToFrontend = (t: any): CalendarEvent => {
    // The /manager/tasks join now nests the client's profile inline. Supabase
    // may return `profiles` as an array or a single object — handle both.
    const profile = Array.isArray(t.users?.profiles) ? t.users.profiles[0] : t.users?.profiles;
    const clientName =
      profile?.full_name
      || t.users?.email?.split('@')[0]
      || (t.client_id ? 'Client' : 'General');
    return {
      id: t.id,
      time: t.time ? t.time.substring(0, 5) : '09:00',
      endTime: (t.end_time || t.endTime) ? (t.end_time || t.endTime).substring(0, 5) : undefined,
      date: t.date,
      duration: t.duration || t.duration_mins || '1h',
      title: t.title,
      type: t.type,
      desc: t.description || t.desc || '',
      client: clientName,
      avatar: profile?.avatar_url || undefined,
      initials: !profile?.avatar_url ? (profile?.full_name?.[0] || t.users?.email?.[0] || 'G') : undefined,
      clientId: t.client_id,
      status: t.status as any || 'pending',
      // Mapeamos priority del backend; fallback 'medium' para filas legacy
      // creadas antes de la columna (la migracion ya pone DEFAULT 'medium').
      priority: (t.priority as 'low' | 'medium' | 'high') || 'medium',
      linkUrl: t.link_url || t.linkUrl,
      recurrenceRule: t.recurrence_rule ?? null,
      recurrenceEnd: t.recurrence_end ?? null,
      recurrenceParentId: t.recurrence_parent_id ?? null,
      isVirtual: Boolean(t.is_virtual),
    };
  };

  // Default fetch covers a wide window so Dashboard ("upcoming"), Calendar
  // (Day/Week/Month) and ClientDetail all have what they need without each
  // having to query their own range. Calendar.tsx can call loadRange to
  // extend coverage when the user navigates outside this window.
  const defaultRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 12, 0);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  };

  const loadRange = async (from: string, to: string) => {
    if (!user) return;
    // /manager/tasks is manager-only — clients have no calendar in this app.
    if (user.role !== 'MANAGER') return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`/manager/tasks?from=${from}&to=${to}&limit=200`);
      // Endpoint paginado devuelve { data: T[], nextCursor, hasMore }; tambien
      // hay rutas legacy que devuelven { tasks: T[] } o un array directo.
      const arr: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.tasks) ? data.tasks
        : Array.isArray(data) ? data
        : [];
      setEvents(arr.map(mapBackendToFrontend));
    } catch (error) {
      console.error('Failed to load range:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    if (user.role !== 'MANAGER') {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    const { from, to } = defaultRange();
    await loadRange(from, to);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addEvent = async (event: Omit<CalendarEvent, 'id'> & { repeat?: string; recurrenceRule?: string; recurrenceEnd?: string }) => {
    try {
      const newEvent = await fetchWithAuth('/manager/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: event.title,
          description: event.desc,
          type: event.type,
          date: event.date,
          time: event.time,
          end_time: event.endTime,
          duration: event.duration || '1h',
          client_id: event.clientId,
          status: event.status || 'pending',
          // Pasamos la prioridad al backend; sin ella la BD usa default 'medium'.
          priority: event.priority,
          link_url: event.linkUrl,
          repeat: event.repeat,
          recurrence_rule: event.recurrenceRule,
          recurrence_end: event.recurrenceEnd,
        })
      });
      // If we just created a recurring task the local list needs every
      // virtual instance in the visible window — reload the range so the
      // calendar shows all the occurrences at once.
      if (newEvent?.recurrence_rule) {
        await fetchTasks();
        return mapBackendToFrontend(newEvent);
      }
      const mapped = mapBackendToFrontend(newEvent);
      setEvents(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  };

  // Edits / deletes accept a `scope` so the UI can pick "this occurrence only"
  // or "the whole series". For one-off tasks the scope is irrelevant and
  // ignored by the backend.
  const deleteEvent = async (id: string, scope: 'instance' | 'series' = 'series') => {
    try {
      await fetchWithAuth(`/manager/tasks/${encodeURIComponent(id)}?scope=${scope}`, { method: 'DELETE' });
      // Easiest correct behaviour: reload the visible range. Optimistic local
      // pruning is tempting but gets tangled when an instance edit creates an
      // exception that the next render needs.
      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  };

  const updateEvent = async (
    id: string,
    updates: Partial<CalendarEvent> & { repeat?: string; recurrenceRule?: string; recurrenceEnd?: string },
    scope: 'instance' | 'series' = 'series',
  ) => {
    try {
      const updatedEvent = await fetchWithAuth(`/manager/tasks/${encodeURIComponent(id)}?scope=${scope}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updates.title,
          description: updates.desc,
          type: updates.type,
          date: updates.date,
          time: updates.time,
          end_time: updates.endTime,
          duration: updates.duration,
          client_id: updates.clientId,
          status: updates.status || 'pending',
          // Solo enviamos priority si se incluyo explicitamente en el update —
          // asi un PATCH de "marca completada" no resetea la prioridad.
          ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
          link_url: updates.linkUrl,
          repeat: updates.repeat,
          recurrence_rule: updates.recurrenceRule,
          recurrence_end: updates.recurrenceEnd,
        })
      });
      // Reload so series-wide changes and exception inserts are reflected.
      await fetchTasks();
      return mapBackendToFrontend(updatedEvent || { id, ...updates });
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  return (
    <CalendarContext.Provider value={{ events, addEvent, deleteEvent, updateEvent, getEventsForDate, refreshEvents: fetchTasks, loadRange }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

// --- View Helpers ---
export const getEventPresentationInfo = (type: EventType): { icon: LucideIcon, color: string } => {
  switch (type) {
    case 'Video Call': return { icon: Video, color: 'border-blue-500 bg-blue-50/50' };
    case 'In-Person': return { icon: MapPin, color: 'border-emerald-500 bg-emerald-50/50' };
    case 'Training': return { icon: Dumbbell, color: 'border-emerald-500 bg-emerald-50/50' };
    case 'Nutrition': return { icon: Utensils, color: 'border-orange-500 bg-orange-50/50' };
    case 'Internal': return { icon: User, color: 'border-purple-500 bg-purple-50/50' };
    case 'Training Analysis': return { icon: Dumbbell, color: 'border-emerald-500 bg-emerald-50/50' };
    default: return { icon: User, color: 'border-slate-500 bg-slate-50/50' };
  }
};
