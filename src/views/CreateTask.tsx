import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Search, 
  Dumbbell, 
  Utensils, 
  ClipboardCheck, 
  Phone, 
  ShieldCheck, 
  Plus,
  Calendar
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useTask, ManualTaskInput } from '../context/TaskContext';
import { useCalendar, EventType } from '../context/CalendarContext';

interface CreateTaskProps {
  onNavigate: (view: string) => void;
}

export default function CreateTask({ onNavigate }: CreateTaskProps) {
  const { clients } = useClient();
  const { addManualTask } = useTask();
  const { addEvent } = useCalendar();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Training' | 'Nutrition' | 'Check-in' | 'Call' | 'Admin'>('Check-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  // Sync Options
  const [syncToTasks, setSyncToTasks] = useState(true);
  const [syncToCalendar, setSyncToCalendar] = useState(true);

  // Derived
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Task title is required");

    // Default to "General" if no clients selected, or map through selected clients if multiple
    const targets = selectedClients.length > 0 
      ? selectedClients.map(id => clients.find(c => c.id === id)!) 
      : [{ id: 'general', name: 'General', plan: 'None', avatar: '' }];

    // Add to Calendar Context
    if (syncToCalendar) {
      // Map category to Calendar EventType
      let eventType: EventType = 'Internal';
      if (category === 'Training') eventType = 'Training';
      if (category === 'Nutrition') eventType = 'Nutrition';
      if (category === 'Call') eventType = 'Video Call';
      if (category === 'Check-in') eventType = 'In-Person';

      // Duration estimation calculation (rough)
      const parseH = (t: string) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
      const diffMins = parseH(endTime) - parseH(startTime);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      let durationStr = `${h}h`;
      if (h === 0) durationStr = `${m}m`;
      else if (m > 0) durationStr = `${h}h ${m}m`;

      targets.forEach(c => {
        addEvent({
          time: startTime,
          date: date,
          duration: diffMins <= 0 ? '1h' : durationStr,
          title: title,
          type: eventType,
          desc: description,
          client: c.name !== 'General' ? c.name : undefined,
          initials: c.name?.substring(0,2).toUpperCase(),
          avatar: c.avatar
        });
      });
    }

    // Add to Task Context
    if (syncToTasks) {
      targets.forEach(c => {
        const manualTask: ManualTaskInput = {
          title: title,
          desc: description,
          client: c.name !== 'General' ? c.name : 'General Task',
          program: c.plan || 'None',
          status: 'pending', // Will show up if priority is pending or today
          timeLabel: repeat,
          priority: priority.toLowerCase() as any,
          type: category.toUpperCase(),
          label: 'USER SCHEDULED',
          avatar: c.avatar
        };
        addManualTask(manualTask);
      });
    }

    // Return to dashboard/tasks
    onNavigate('tasks');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm my-6 sm:my-8 mb-16 relative">
      <header className="flex items-center justify-between p-6 border-b border-slate-200 bg-white sticky top-0 z-10 rounded-t-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Task</h1>
          <p className="text-sm text-slate-500">Add a new task or appointment to the schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => onNavigate('tasks')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Check className="w-[18px] h-[18px]" />
            Save Task
          </button>
        </div>
      </header>

      <div className="p-6 md:p-8 bg-slate-50/50 rounded-b-2xl">
        <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSave}>
          {/* General Details */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">General Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Basic information about the task. Be specific for client clarity.</p>
            </div>
            <div className="md:col-span-8 space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Task Title</label>
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5" 
                  placeholder="e.g., Monthly Progress Review" 
                  type="text" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5" 
                  placeholder="Add detailed instructions, meeting links, or objectives..." 
                  rows={4}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Activity Category */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Activity Category</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Select the type of activity to categorize this task correctly.</p>
            </div>
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'Training', icon: Dumbbell, activeClass: 'peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700 hover:border-emerald-200', iconClass: 'peer-checked:text-emerald-600 group-hover:text-emerald-500' },
                  { id: 'Nutrition', icon: Utensils, activeClass: 'peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 hover:border-orange-200', iconClass: 'peer-checked:text-orange-600 group-hover:text-orange-500' },
                  { id: 'Check-in', icon: ClipboardCheck, activeClass: 'peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 hover:border-blue-200', iconClass: 'peer-checked:text-blue-600 group-hover:text-blue-500' },
                  { id: 'Call', icon: Phone, activeClass: 'peer-checked:bg-purple-50 peer-checked:border-purple-500 peer-checked:text-purple-700 hover:border-purple-200', iconClass: 'peer-checked:text-purple-600 group-hover:text-purple-500' },
                  { id: 'Admin', icon: ShieldCheck, activeClass: 'peer-checked:bg-slate-200 peer-checked:border-slate-500 peer-checked:text-slate-800 hover:border-slate-300', iconClass: 'peer-checked:text-slate-600 group-hover:text-slate-500' },
                ].map((cat) => (
                  <label key={cat.id} className="cursor-pointer group">
                    <input 
                      className="peer sr-only" 
                      name="category" 
                      type="radio" 
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id as any)}
                    />
                    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 transition-all h-24 ${cat.activeClass}`}>
                      <cat.icon className={`w-6 h-6 mb-2 text-slate-400 transition-colors ${cat.iconClass}`} />
                      <span className="text-xs font-semibold text-slate-600 peer-checked:text-current">{cat.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Assignment */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Assignment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Assign this task to specific clients. You can select multiple.</p>
            </div>
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Assign To</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400" 
                  placeholder="Search clients..." 
                  type="text" 
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredClients.map((client) => {
                  const isSelected = selectedClients.includes(client.id);
                  return (
                    <div 
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-bold pr-1 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {client.avatar ? (
                        <div className="h-5 w-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${client.avatar}")` }} />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-slate-600">{client.name.substring(0,2).toUpperCase()}</div>
                      )}
                      {client.name}
                      <button type="button" className={`rounded-full p-0.5 transition-colors ${isSelected ? 'hover:bg-emerald-200' : 'hover:bg-slate-200'}`}>
                        {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Schedule */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Schedule & Frequency</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Set when this task needs to be completed.</p>
            </div>
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Date</label>
                  <div className="relative">
                    <input 
                      className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5" 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Start Time</label>
                    <input 
                      className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5" 
                      type="time" 
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">End Time</label>
                    <input 
                      className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5" 
                      type="time" 
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Repeat</label>
                <select 
                  value={repeat}
                  onChange={e => setRepeat(e.target.value)}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                >
                  <option>Does not repeat</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Custom...</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Priority */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Priority</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Indicate the urgency level of this task.</p>
            </div>
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              {[
                { level: 'Low', activeClass: 'peer-checked:bg-slate-100 peer-checked:border-slate-400 text-slate-600' },
                { level: 'Medium', activeClass: 'peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 text-slate-600' },
                { level: 'High', activeClass: 'peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 text-slate-600' }
              ].map((p) => (
                <label key={p.level} className="cursor-pointer flex-1">
                  <input 
                    className="peer sr-only" 
                    name="priority" 
                    type="radio" 
                    checked={priority === p.level}
                    onChange={() => setPriority(p.level as any)}
                  />
                  <span className={`px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold transition-all block text-center ${p.activeClass}`}>
                    {p.level}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Sync Options */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-4">
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Sync Options</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Where should this task appear?</p>
            </div>
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Add to Tasks List</h4>
                    <p className="text-xs text-slate-500">Show in my task's list</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={syncToTasks} onChange={e => setSyncToTasks(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              <div className="h-[1px] w-full bg-slate-100"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Add to Calendar</h4>
                    <p className="text-xs text-slate-500">Block time on schedule</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={syncToCalendar} onChange={e => setSyncToCalendar(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

            </div>
          </section>

        </form>
      </div>
    </div>
  );
}
