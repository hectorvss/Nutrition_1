import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Utensils, Dumbbell, ClipboardCheck, Video, MapPin, User, LucideIcon } from 'lucide-react';

export type EventType = 'Video Call' | 'In-Person' | 'Training' | 'Nutrition' | 'Internal' | 'Training Analysis';

export interface CalendarEvent {
  id: string;
  time: string; // e.g. "09:00" or "14:30"
  date: string; // YYYY-MM-DD format ideally, but we can store simpler for now or use full ISO dates
  duration: string; // e.g. "30m", "1h", "1h 30m"
  title: string;
  type: EventType;
  desc?: string;
  client?: string; // Client Name
  avatar?: string | null;
  initials?: string;
  clientId?: string; // Optional reference to actual client
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  getEventsForDate: (dateStr: string) => CalendarEvent[];
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
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    time: '10:00',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '30m',
    title: 'Mike K: Plan Update',
    type: 'Training',
    client: 'Mike K.',
    initials: 'MK'
  },
  {
    id: '3',
    time: '11:30',
    date: new Date().toISOString().split('T')[0], // Today
    duration: '1h',
    title: 'Follow-up: Diet Plan Review',
    type: 'In-Person',
    client: 'Mike Ross',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
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
    desc: "Review squat form videos and adjust next week's progressive overload targets. Check adherence to RPE."
  }
];

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

import { fetchWithAuth } from '../api';

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/manager/tasks');
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent = await fetchWithAuth('/manager/tasks', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetchWithAuth(`/manager/tasks/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await fetchWithAuth(`/manager/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  return (
    <CalendarContext.Provider value={{ events, addEvent, deleteEvent, updateEvent, getEventsForDate }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : children}
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
