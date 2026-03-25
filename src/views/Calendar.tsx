import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Utensils,
  Dumbbell,
  ClipboardCheck,
  Video,
  MapPin,
  Clock,
  MoreVertical,
  User
} from 'lucide-react';

interface CalendarProps {
  onNavigate: (view: string, data?: any) => void;
  initialView?: ViewMode;
  initialDate?: Date;
}

import { useCalendar, getEventPresentationInfo, EventType } from '../context/CalendarContext';

type ViewMode = 'Month' | 'Week' | 'Day';

const getEventMins = (duration: string | number) => {
  if (!duration) return 60; // default 1h
  try {
    const dur = duration.toString().toLowerCase().trim().replace(',', '.');
    
    // 1. Handle HH:MM format (e.g. "01:30" or "1:30")
    if (dur.includes(':')) {
      const parts = dur.split(':').map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return Math.min((parts[0] * 60) + parts[1], 1440);
      }
    }

    let totalMins = 0;
    
    // 2. Extract hours and minutes from strings like "1h 30m" or "2 hours"
    const hMatch = dur.match(/(\d+(?:\.\d+)?)\s*h/);
    const mMatch = dur.match(/(\d+)\s*m/);
    
    let matched = false;
    if (hMatch) {
      totalMins += parseFloat(hMatch[1]) * 60;
      matched = true;
    }
    
    if (mMatch) {
      totalMins += parseInt(mMatch[1]);
      matched = true;
    }
    
    if (matched) return Math.min(totalMins, 1440);

    // 3. Fallback for pure numbers (e.g. "90" or "2")
    const fallbackMatch = dur.match(/^(\d+(?:\.\d+)?)$/);
    if (fallbackMatch) {
      const val = parseFloat(fallbackMatch[1]);
      // If val >= 15, assume it means minutes (e.g. 15, 30, 90). 
      // If val < 15, assume it means hours (e.g. 1, 1.5, 2).
      if (val >= 15) return Math.min(val, 1440);
      return Math.min(val * 60, 1440);
    }
    
    return 60;
  } catch (e) {
    return 60;
  }
};
const getEventMinsFromTime = (time: string) => {
  if (!time) return 540; // 09:00
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

const getEventFullMins = (event: any) => {
  if (event.time && event.endTime) {
    const start = getEventMinsFromTime(event.time);
    let end = getEventMinsFromTime(event.endTime);
    if (end <= start) end += 1440; // Fix overnight or same-time
    return Math.min(end - start, 1440);
  }
  return getEventMins(event.duration);
};

const getOverlapData = (events: any[]) => {
  // Sort by start mins
  const sorted = [...events].sort((a, b) => {
    return getEventMinsFromTime(a.time) - getEventMinsFromTime(b.time);
  });

  const clusters: any[][] = [];
  let currentCluster: any[] = [];
  let clusterEnd = 0;

  sorted.forEach(event => {
    const startMins = getEventMinsFromTime(event.time);
    const durationMins = getEventFullMins(event);
    const endMins = startMins + durationMins;

    if (startMins >= clusterEnd) {
      if (currentCluster.length > 0) clusters.push(currentCluster);
      currentCluster = [event];
      clusterEnd = endMins;
    } else {
      currentCluster.push(event);
      clusterEnd = Math.max(clusterEnd, endMins);
    }
  });
  if (currentCluster.length > 0) clusters.push(currentCluster);

  const eventStyles: Record<string, { width: number; left: number }> = {};

  clusters.forEach(cluster => {
    const columns: any[][] = [];
    cluster.forEach(event => {
      let placed = false;
      const startMins = getEventMinsFromTime(event.time);
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        const lastEnd = getEventMinsFromTime(lastInCol.time) + getEventFullMins(lastInCol);
        if (startMins >= lastEnd) {
          columns[i].push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    });

    const totalCols = columns.length;
    columns.forEach((col, colIdx) => {
      col.forEach(event => {
        eventStyles[event.id] = {
          width: 100 / totalCols,
          left: (colIdx / totalCols) * 100
        };
      });
    });
  });

  return eventStyles;
};

export default function CalendarView({ onNavigate, initialView, initialDate }: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView || 'Day');
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [now, setNow] = useState(new Date());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'Month') return;
    
    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const rowHeight = viewMode === 'Week' ? 96 : 128;
        const scrollPadding = viewMode === 'Week' ? 0 : 16;
        const targetTop = (now.getHours() * rowHeight) + (now.getMinutes() * (rowHeight / 60)) + scrollPadding;
        
        // Center the indicator
        const containerHeight = scrollContainerRef.current.clientHeight;
        scrollContainerRef.current.scrollTo({
          top: targetTop - (containerHeight / 2),
          behavior: 'smooth'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [viewMode, currentDate]); // also scroll when date changes if desired

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { getEventsForDate } = useCalendar();

  const getLocalDateString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'Week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'Month') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'Week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'Month') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekDates = (baseDate: Date) => {
    const currentDay = baseDate.getDay(); 
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isCurrent = d.toDateString() === new Date().toDateString();
      return {
        dateObj: d,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate().toString().padStart(2, '0'),
        current: isCurrent,
        dateStr: getLocalDateString(d)
      };
    });
  };

  const weekDates = getWeekDates(currentDate);

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const currentDayEvents = getEventsForDate(getLocalDateString(currentDate));

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let startDayIdx = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
    
    const daysArray = [];
    for (let i = 0; i < startDayIdx; i++) {
        daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        daysArray.push({
            date: i,
            dateStr: getLocalDateString(d),
            isCurrent: d.toDateString() === new Date().toDateString()
        });
    }
    while (daysArray.length < 42) {
        daysArray.push(null);
    }
    return daysArray;
  };

  const renderMonthView = () => {
    const calendarDays = getMonthDays(currentDate);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col min-h-[600px]">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((dayObj, idx) => {
            const dayEvents = dayObj ? getEventsForDate(dayObj.dateStr) : [];
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (dayObj) {
                    const d = new Date(dayObj.dateStr + 'T12:00:00');
                    setCurrentDate(d);
                    setViewMode('Day');
                  }
                }} 
                className={`border-b border-r border-slate-100 p-2 min-h-[100px] transition-colors group relative cursor-pointer ${dayObj === null ? 'bg-slate-50/30' : 'hover:bg-slate-50'}`}
              >
                {dayObj !== null && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-bold block mb-1 h-6 w-6 flex items-center justify-center rounded-full ${dayObj.isCurrent ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-900'}`}>{dayObj.date}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition-all"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((ev, eIdx) => {
                        const info = getEventPresentationInfo(ev.type);
                        return (
                          <div 
                            key={eIdx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('create-task', { taskId: ev.id, returnTo: 'Month', currentDate: dayObj.dateStr });
                            }}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate bg-opacity-30 border ${info.color.split(' ')[0]} border-${info.color.split(' ')[0].split('-')[1]}-200 text-${info.color.split(' ')[0].split('-')[1]}-700 cursor-pointer hover:brightness-95`}
                          >
                            {ev.time} {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-slate-500 font-bold px-1.5">+ {dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[800px]">
        {/* Week Header */}
        <div className="grid grid-cols-[80px_1fr] border-b border-slate-100">
          <div className="border-r border-slate-100 bg-slate-50/30"></div>
          <div className="grid grid-cols-7">
            {weekDates.map((d, idx) => (
              <div key={idx} className={`py-4 text-center border-r border-slate-100 last:border-r-0 ${d.current ? 'bg-emerald-50/30' : ''}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{d.day}</p>
                <p className={`text-xl font-bold ${d.current ? 'text-emerald-600 bg-emerald-100/50 w-10 h-10 flex items-center justify-center rounded-full mx-auto' : 'text-slate-900'}`}>{d.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Week Grid */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="grid grid-cols-[80px_1fr] min-h-full">
            {/* Time Labels */}
            <div className="border-r border-slate-100 bg-slate-50/30">
              {hours.map(hour => (
                <div key={hour} className="h-24 border-b border-slate-100 flex items-start justify-center pt-2">
                  <span className="text-[11px] font-bold text-slate-400">{hour}</span>
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 relative">
              {/* Vertical Lines */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-r border-slate-100" style={{ left: `${(i + 1) * (100 / 7)}%` }}></div>
              ))}
              
              {/* Horizontal Lines */}
              {hours.map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: `${(i + 1) * 96}px` }}></div>
              ))}

              {/* Current Time Indicator */}
              <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${(now.getHours() * 96) + (now.getMinutes() * (96 / 60))}px` }}>
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm"></div>
                <div className="flex-1 h-px bg-red-500"></div>
                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>

              {/* Lunch Break (13:00 - 14:00) */}
              <div className="absolute left-0 right-0 h-12 bg-slate-50/50 border-y border-slate-100 flex items-center justify-center z-10" style={{ top: `${13 * 96}px` }}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Lunch Break</span>
              </div>

              {/* Weekly Events */}
              {weekDates.map((weekDay, dayIdx) => {
                const dayEvents = getEventsForDate(weekDay.dateStr);
                const overlapData = getOverlapData(dayEvents);
                return dayEvents.map((event, idx) => {
                  const info = getEventPresentationInfo(event.type as EventType);
                  const hourIdx = hours.indexOf(event.time.slice(0, 2) + ':00');
                  if (hourIdx === -1) return null;
                  
                  const minuteOffset = event.time.includes(':') ? parseInt(event.time.split(':')[1]) * (96 / 60) : 0;
                  const top = hourIdx * 96 + minuteOffset;
                  
                  const durationMins = getEventFullMins(event);
                  const maxPossibleHeight = (24 * 96) - top; // Clamp to midnight
                  const height = Math.min(Math.max((durationMins / 60) * 96, 40), maxPossibleHeight);
                  const style = overlapData[event.id] || { width: 100, left: 0 };
                  
                  return (
                    <div 
                      key={`${weekDay.dateStr}-${event.id || idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('create-task', { taskId: event.id, returnTo: 'Week', currentDate: weekDay.dateStr });
                      }}
                      className={`absolute p-1 border-l-2 rounded-lg shadow-sm z-10 overflow-hidden ${info.color} cursor-pointer hover:brightness-95 transition-all flex flex-col`}
                      style={{ 
                        top: `${top}px`, 
                        left: `${dayIdx * (100 / 7) + (style.left / 100) * (100 / 7)}%`, 
                        width: `${(style.width / 100) * (100 / 7) - 0.2}%`,
                        height: `${height}px`
                      }}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{event.title}</p>
                      <p className="text-[9px] opacity-70 truncate">{event.client}</p>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[800px]">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="grid grid-cols-[100px_1fr] min-h-full">
            {/* Time Labels */}
            <div className="border-r border-slate-100 bg-slate-50/30">
              {hours.map(hour => (
                <div key={hour} className="h-32 border-b border-slate-100 flex items-start justify-center pt-4">
                  <span className="text-[12px] font-bold text-slate-400">{hour}</span>
                </div>
              ))}
            </div>

            {/* Daily Grid Area */}
            <div className="relative p-0 mb-8 overflow-hidden">
              {/* Horizontal Lines */}
              {hours.map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: `${(i) * 128}px` }}></div>
              ))}

              {/* Lunch Break (13:00 - 14:00) */}
              <div className="absolute left-0 right-0 h-16 border-y border-dashed border-slate-200 flex items-center justify-center z-0" style={{ top: `${13 * 128}px` }}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">Lunch Break</span>
              </div>

              {/* Daily Events */}
              {(() => {
                const overlapData = getOverlapData(currentDayEvents);
                return currentDayEvents.map((event) => {
                  const timeParts = event.time.split(':').map(Number);
                  const hourIdx = hours.indexOf(timeParts[0].toString().padStart(2, '0') + ':00');
                  if (hourIdx === -1) return null;
                  const minuteOff = (timeParts[1] || 0) * (128 / 60);
                  const top = hourIdx * 128 + minuteOff;
                  
                  const durationMins = getEventFullMins(event);
                  const maxPossibleHeight = (24 * 128) - top; // Clamp to midnight
                  const height = Math.min(Math.max((durationMins / 60) * 128, 40), maxPossibleHeight);
                  const info = getEventPresentationInfo(event.type as EventType);
                  const EventIcon = info.icon;
                  const style = overlapData[event.id] || { width: 100, left: 0 };

                  return (
                    <div 
                      key={event.id}
                      onClick={() => onNavigate('create-task', { taskId: event.id, returnTo: 'Day', currentDate: getLocalDateString(currentDate) })}
                      className={`absolute p-1 border-l-4 rounded-xl shadow-sm z-10 flex items-start gap-3 transition-all hover:shadow-md cursor-pointer ${info.color}`}
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        left: `${style.left}%`,
                        width: `${style.width}%`
                      }}
                    >
                    <div className="shrink-0">
                      {event.avatar ? (
                        <img src={event.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold text-sm border-2 border-white shadow-sm">
                          {event.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <EventIcon className="w-3.5 h-3.5" />
                        <span>{event.type}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                      {event.desc && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{event.desc}</p>
                      )}
                    </div>
                    <button className="p-1 hover:bg-white/50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    </div>
                  );
                });
              })()}

              {/* Current Time Line */}
              <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${(now.getHours() * 128) + (now.getMinutes() * (128 / 60))}px` }}>
                <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-md border-2 border-white"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 sm:p-8 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 z-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {viewMode === 'Day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              {viewMode === 'Week' && `${weekDates[0].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              {viewMode === 'Month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {viewMode === 'Day' ? 'Daily schedule overview' : 'Manage client schedules and tasks'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    viewMode === mode 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {/* Minimalist Date Controls */}
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button onClick={() => onNavigate('create-task', { date: getLocalDateString(currentDate), returnTo: viewMode })} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-6 sm:px-8 pb-8">
          {viewMode === 'Month' && renderMonthView()}
          {viewMode === 'Week' && renderWeekView()}
          {viewMode === 'Day' && renderDayView()}
        </div>
      </div>

    </div>
  );
}
