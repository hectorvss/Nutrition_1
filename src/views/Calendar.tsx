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
}

import { useCalendar, getEventPresentationInfo, EventType } from '../context/CalendarContext';

type ViewMode = 'Month' | 'Week' | 'Day';

export default function CalendarView({ onNavigate }: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');
  const [currentDate, setCurrentDate] = useState(new Date());
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
              <div key={idx} onClick={() => dayObj && onNavigate('create-task', { date: dayObj.dateStr })} className={`border-b border-r border-slate-100 p-2 min-h-[100px] transition-colors group relative cursor-pointer ${dayObj === null ? 'bg-slate-50/30' : 'hover:bg-slate-50'}`}>
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
                              onNavigate('create-task', { taskId: ev.id });
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
                return dayEvents.map((event, idx) => {
                  const info = getEventPresentationInfo(event.type);
                  const hourIdx = hours.indexOf(event.time.slice(0, 2) + ':00');
                  if (hourIdx === -1) return null;
                  
                  const minuteOffset = event.time.includes(':') ? parseInt(event.time.split(':')[1]) * (96 / 60) : 0;
                  const top = hourIdx * 96 + minuteOffset;
                  const left = dayIdx * (100 / 7);
                  
                  let height = 72; // default
                  if (event.duration === '30m') height = 48;
                  if (event.duration === '45m') height = 72;
                  if (event.duration === '1h') height = 96;
                  if (event.duration === '1h 30m') height = 144;
                  if (event.duration === '2h') height = 192;
                  
                  return (
                    <div 
                      key={`${weekDay.dateStr}-${event.id || idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('create-task', { taskId: event.id });
                      }}
                      className={`absolute p-2 border-l-4 rounded-r-lg shadow-sm z-10 overflow-hidden ${info.color} cursor-pointer hover:brightness-95 transition-all`}
                      style={{ 
                        top: `${top}px`, 
                        left: `${dayIdx * (100 / 7) + 0.2}%`, 
                        width: `${100 / 7 - 0.4}%`,
                        height: `${height}px`
                      }}
                    >
                      <p className="text-[11px] font-bold truncate">{event.title}</p>
                      <p className="text-[10px] opacity-70 truncate">{event.client}</p>
                      {event.duration && <p className="text-[9px] mt-1 font-bold opacity-50">{event.time} - {event.duration}</p>}
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

            {/* Daily Grid */}
            <div className="relative p-0 pt-4 px-6 mb-8">
              {/* Horizontal Lines */}
              {hours.map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: `${(i + 1) * 128}px` }}></div>
              ))}

              {/* Lunch Break (13:00 - 14:00) */}
              <div className="absolute left-0 right-0 h-16 border-y border-dashed border-slate-200 flex items-center justify-center z-0" style={{ top: `${13 * 128}px` }}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">Lunch Break</span>
              </div>

              {/* Daily Events */}
              {currentDayEvents.map((event) => {
                const hourIdx = hours.indexOf(event.time.slice(0, 2).padStart(2, '0') + ':00');
                if (hourIdx === -1) return null;
                const minuteOff = event.time.includes(':') ? parseInt(event.time.split(':')[1]) * (128 / 60) : 0;
                const top = hourIdx * 128 + 16 + minuteOff;
                
                let height = 80; // default
                if (event.duration === '30m') height = 64;
                if (event.duration === '45m') height = 96;
                if (event.duration === '1h') height = 120;
                if (event.duration === '1h 30m') height = 180;
                if (event.duration === '2h') height = 240;
                
                const info = getEventPresentationInfo(event.type);
                const EventIcon = info.icon;

                return (
                  <div 
                    key={event.id}
                    onClick={() => onNavigate('create-task', { taskId: event.id })}
                    className={`absolute left-4 right-4 p-4 border-l-4 rounded-xl shadow-sm z-10 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${info.color}`}
                    style={{ top: `${top}px`, height: `${height}px` }}
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
              })}

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
    <div className="flex flex-col xl:flex-row h-full overflow-hidden bg-slate-50">
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

            <button onClick={() => onNavigate('create-task')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
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

      {/* Sidebar */}
      <aside className="w-full xl:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Quick Filters</h2>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Reset</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all" 
              placeholder="Search clients..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Activity Type</h3>
            <div className="space-y-3">
              {[
                { label: 'Training', icon: Dumbbell, color: 'bg-emerald-100 text-emerald-600', checked: true },
                { label: 'Nutrition', icon: Utensils, color: 'bg-orange-100 text-orange-600', checked: true },
                { label: 'Check-ins', icon: ClipboardCheck, color: 'bg-blue-100 text-blue-600', checked: true },
              ].map((type, idx) => (
                <label key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg ${type.color} flex items-center justify-center shadow-sm`}>
                      <type.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{type.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${type.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                    {type.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Priority Clients</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah Jenkins', sub: 'Hypertrophy • 3 tasks', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', active: true },
                { name: 'Mike K.', sub: 'Fat Loss • 2 tasks', avatar: null, initials: 'MK' },
                { name: 'Alice L.', sub: 'Strength • 1 task', avatar: null, initials: 'AL' },
              ].map((client, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group">
                  <div className="relative">
                    {client.avatar ? (
                      <img src={client.avatar} alt="" className="rounded-full h-10 w-10 object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="rounded-full h-10 w-10 bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border-2 border-white shadow-sm">{client.initials}</div>
                    )}
                    {client.active && <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{client.name}</p>
                    <p className="text-xs text-slate-500 truncate">{client.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Upcoming Deadlines</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Tomorrow</span>
                <span className="text-xs font-bold text-slate-700">Sarah J. Monthly Review</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">Oct 6</span>
                <span className="text-xs font-bold text-slate-700">New Program Releases</span>
              </div>
            </div>
          </div>
        </div>
      </aside>


    </div>
  );
}
