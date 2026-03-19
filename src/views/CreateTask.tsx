import React, { useState, useEffect } from 'react';
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
  Calendar,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useTask } from '../context/TaskContext';
import { useCalendar } from '../context/CalendarContext';
import { supabase } from '../supabase';

interface CreateTaskProps {
  onNavigate: (view: string, data?: any) => void;
  editId?: string; // UUIDs are strings
  initialDate?: string;
}

export default function CreateTask({ onNavigate, editId, initialDate }: CreateTaskProps) {
  const { clients } = useClient();
  const { refreshTasks } = useTask();
  const { addEvent, updateEvent, deleteEvent, refreshEvents, events } = useCalendar();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Training' | 'Nutrition' | 'Check-in' | 'Call' | 'Admin'>('Check-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load task for editing
  useEffect(() => {
    if (editId) {
      const task = events.find(e => e.id === editId);
      if (task) {
        setTitle(task.title || '');
        setDescription(task.desc || '');
        // Map backend types back to frontend categories
        const typeMap: Record<string, any> = {
          'TRAINING': 'Training',
          'NUTRITION': 'Nutrition',
          'CHECK-IN': 'Check-in',
          'CALL': 'Call',
          'VIDEO CALL': 'Call',
          'ADMIN': 'Admin',
          'INTERNAL': 'Admin'
        };
        const mappedType = typeMap[task.type.toUpperCase()] || 'Check-in';
        setCategory(mappedType);
        setDate(task.date || '');
        setStartTime(task.time || '09:00');
        // If we had end_time or duration, we'd set it here
        if (task.duration) {
          // simple duration to end time estimate if needed
        }
        if (task.clientId) setSelectedClientId(task.clientId);
      }
    }
  }, [editId, events]);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

  // Derived
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Task title is required");
    setLoading(true);

    const client = clients.find(c => c.id === selectedClientId);

    // Map frontend categories to backend expected EventTypes/Strings
    const typeMap: Record<string, any> = {
      'Training': 'Training',
      'Nutrition': 'Nutrition',
      'Check-in': 'Check-in',
      'Call': 'Video Call',
      'Admin': 'Internal'
    };

    const taskData: any = {
      title,
      desc: description,
      description: description,
      type: typeMap[category] || category,
      date,
      time: startTime,
      duration: '1h', // Default or calculated
      clientId: selectedClientId,
      client: client?.name || 'General Task',
      avatar: client?.avatar || null,
      initials: client ? client.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'GT',
      priority: priority.toLowerCase()
    };

    try {
      if (editId) {
        await updateEvent(editId, taskData);
      } else {
        await addEvent(taskData);
      }

      // Refresh contexts if needed (though addEvent/updateEvent already update state)
      await refreshTasks(); 
      onNavigate('tasks');
    } catch (error) {
      console.error("Failed to save task", error);
      alert("An error occurred while saving the task.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm("Are you sure you want to delete this task? This will also remove it from Google Calendar if synced.")) return;
    
    setIsDeleting(true);
    try {
      await deleteEvent(editId);
      await refreshTasks();
      onNavigate('tasks');
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("An error occurred while deleting the task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm my-6 sm:my-8 mb-16 relative">
      <header className="flex items-center justify-between p-6 border-b border-slate-200 bg-white sticky top-0 z-10 rounded-t-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{editId ? 'Edit Task' : 'Create New Task'}</h1>
          <p className="text-sm text-slate-500">{editId ? 'Modify task details or delete it' : 'Add a new task or appointment to the schedule'}</p>
        </div>
        <div className="flex items-center gap-3">
          {editId && (
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 flex items-center gap-2"
            >
              <Trash2 className="w-[18px] h-[18px]" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
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
            disabled={loading || isDeleting}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-[18px] h-[18px]" />}
            {editId ? 'Update Task' : 'Save Task'}
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
              <p className="text-xs text-slate-500 leading-relaxed">Assign this task to a specific client, or leave blank for a general task.</p>
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
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                <div 
                  onClick={() => setSelectedClientId(null)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                    selectedClientId === null 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  General Task
                </div>
                {filteredClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <div 
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {client.avatar ? (
                        <div className="h-4 w-4 rounded-full bg-cover bg-center border border-white/20" style={{ backgroundImage: `url("${client.avatar}")` }} />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-slate-300 flex items-center justify-center text-[8px] text-slate-600">{client.name.substring(0,2).toUpperCase()}</div>
                      )}
                      {client.name}
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
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-8">
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

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Info:</strong> All scheduled tasks are automatically synchronized with both your internal task list and calendar. If you have the Google Calendar integration enabled, this task will also be synced there automatically.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
