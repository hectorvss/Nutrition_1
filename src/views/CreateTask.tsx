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
  AlertCircle,
  Link
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useTask } from '../context/TaskContext';
import { useCalendar } from '../context/CalendarContext';
import { supabase } from '../supabase';
import Select from '../components/ui/Select';
import TimeSelect from '../components/ui/TimeSelect';
import DatePicker from '../components/ui/DatePicker';
import CustomRecurrenceModal from '../components/CustomRecurrenceModal';
import RecurrenceScopeDialog from '../components/RecurrenceScopeDialog';
import { useLanguage } from '../context/LanguageContext';

interface CreateTaskProps {
  onNavigate: (view: string, data?: any) => void;
  editId?: string; // UUIDs are strings
  initialDate?: string;
}

export default function CreateTask({ onNavigate, editId, initialDate }: CreateTaskProps) {
  const { t } = useLanguage();
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
  // Custom recurrence: when the user selects "Custom" in the Select we open
  // the modal and store the resulting RRULE / until here. The dropdown still
  // shows "Custom" while these are set; clearing them reverts to no-repeat.
  const [customRule, setCustomRule] = useState<string | null>(null);
  const [customUntil, setCustomUntil] = useState<string | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  // Scope dialog for edit/delete on a recurring event. We capture the pending
  // action so we can resume it after the user picks instance vs series.
  const [scopeDialog, setScopeDialog] = useState<null | { mode: 'edit' | 'delete' }>(null);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  // In edit mode the form can't be populated until the task is found in `events`
  // (which may load asynchronously). Track this so we can show a loader.
  const [isEditLoaded, setIsEditLoaded] = useState(!editId);

  // Load task for editing
  useEffect(() => {
    if (editId) {
      const task = events.find(e => e.id === editId);
      if (task) {
        setIsEditLoaded(true);
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
        
        // Prioritize actual endTime from context over re-calculating from duration
        if (task.endTime) {
          setEndTime(task.endTime);
        } else if (task.duration) {
          try {
            const timeParts = (task.time || '09:00').split(':').map(Number);
            let totalMins = (timeParts[0] || 0) * 60 + (timeParts[1] || 0);
            
            const dur = task.duration.toLowerCase();
            const hMatch = dur.match(/(\d+)h/);
            const mMatch = dur.match(/(\d+)m/);
            
            if (hMatch) totalMins += parseInt(hMatch[1], 10) * 60;
            if (mMatch) totalMins += parseInt(mMatch[1], 10);
            
            const h2 = Math.floor((totalMins / 60) % 24);
            const m2 = totalMins % 60;
            setEndTime(`${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')}`);
          } catch(e) {
            setEndTime('10:00');
          }
        }
        if (task.clientId) setSelectedClientId(task.clientId);
        setLinkUrl(task.linkUrl || '');
        // Derive the dropdown value from the stored RRULE so the form
        // reflects what's actually persisted, not whatever legacy `repeat`
        // string the row may have.
        const rule = (task as any).recurrenceRule as string | undefined;
        const ruleEnd = (task as any).recurrenceEnd as string | undefined;
        if (rule) {
          const upper = rule.trim().toUpperCase();
          if (upper === 'FREQ=DAILY') setRepeat('Daily');
          else if (/^FREQ=WEEKLY(;BYDAY=[A-Z]{2})?$/.test(upper)) setRepeat('Weekly');
          else if (/^FREQ=MONTHLY(;BYMONTHDAY=\d{1,2})?$/.test(upper)) setRepeat('Monthly');
          else {
            setRepeat('Custom');
            setCustomRule(rule);
            if (ruleEnd) setCustomUntil(ruleEnd);
          }
        } else if ((task as any).repeat) {
          setRepeat((task as any).repeat);
        }
      }
      // Fallback: if the task is never found (e.g. a non-event id), stop the
      // loader after a short wait instead of spinning forever.
      const timer = setTimeout(() => setIsEditLoaded(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [editId, events]);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

  // Derived
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert(t('task_title_required'));
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

    // Calculate duration from startTime and endTime
    const calculateDuration = () => {
      try {
        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = endTime.split(':').map(Number);
        
        const totalMins1 = h1 * 60 + m1;
        let totalMins2 = h2 * 60 + m2;
        
        if (totalMins2 <= totalMins1) {
          return '1h'; // Default fallback or signal for same-day
        }
        
        const diff = totalMins2 - totalMins1;
        
        if (diff < 60) return `${diff}m`;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hrs}h${mins > 0 ? ` ${mins}m` : ''}`;
      } catch (e) {
        return '1h';
      }
    };

    const taskData: any = {
      title,
      desc: description,
      description: description,
      type: typeMap[category] || category,
      date,
      time: startTime,
      endTime: endTime, // Correct property name for Context
      duration: calculateDuration(),
      clientId: selectedClientId,
      client: client?.name || t('general_task'),
      avatar: client?.avatar || null,
      initials: client ? client.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'GT',
      priority: priority.toLowerCase(),
      status: (editId && events.find(e => e.id === editId)?.status) || 'pending',
      linkUrl: linkUrl,
      repeat: repeat,
      // For Custom recurrence we send the explicit RRULE the modal produced;
      // the backend prefers this over the label-based mapping. For Daily /
      // Weekly / Monthly the server derives the RRULE from `repeat` itself.
      recurrenceRule: repeat === 'Custom' ? customRule || undefined : undefined,
      recurrenceEnd:  repeat === 'Custom' ? customUntil || undefined : undefined,
    };

    try {
      if (editId) {
        // For a recurring event the user must choose whether the change
        // applies to this occurrence only or to the whole series. The dialog
        // resumes the save via performSave below.
        const editing = events.find(e => e.id === editId);
        const isRecurring = Boolean(editing?.recurrenceRule || editing?.recurrenceParentId || editing?.isVirtual);
        if (isRecurring) {
          pendingSavePayload.current = taskData;
          setScopeDialog({ mode: 'edit' });
          setLoading(false);
          return;
        }
        await updateEvent(editId, taskData);
      } else {
        await addEvent(taskData);
      }

      await refreshTasks();
      onNavigate('calendar');
    } catch (error) {
      console.error("Failed to save task", error);
      alert(t('task_save_error'));
    } finally {
      setLoading(false);
    }
  };

  // Cached payload for the resumed save/delete after the user picks a scope.
  const pendingSavePayload = React.useRef<any>(null);

  const performScopedSave = async (scope: 'instance' | 'series') => {
    if (!editId || !pendingSavePayload.current) return;
    setLoading(true);
    try {
      await updateEvent(editId, pendingSavePayload.current, scope);
      await refreshTasks();
      onNavigate('calendar');
    } catch (e) {
      console.error('Scoped save failed', e);
      alert(t('task_save_error'));
    } finally {
      pendingSavePayload.current = null;
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    const editing = events.find(e => e.id === editId);
    const isRecurring = Boolean(editing?.recurrenceRule || editing?.recurrenceParentId || editing?.isVirtual);
    if (isRecurring) {
      setScopeDialog({ mode: 'delete' });
      return;
    }
    if (!window.confirm(t('confirm_delete_task'))) return;
    setIsDeleting(true);
    try {
      await deleteEvent(editId);
      await refreshTasks();
      onNavigate('calendar');
    } catch (error) {
      console.error("Failed to delete task", error);
      alert(t('task_delete_error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const performScopedDelete = async (scope: 'instance' | 'series') => {
    if (!editId) return;
    setIsDeleting(true);
    try {
      await deleteEvent(editId, scope);
      await refreshTasks();
      onNavigate('calendar');
    } catch (error) {
      console.error("Scoped delete failed", error);
      alert(t('task_delete_error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="w-full mx-auto flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <header className="flex items-center justify-between p-6 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{editId ? t('edit_event') : t('create_event')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{editId ? t('edit_event_desc') : t('create_event_desc')}</p>
            </div>
            <div className="flex items-center gap-3">
              {editId && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/50 flex items-center gap-2"
                >
                  <Trash2 className="w-[18px] h-[18px]" />
                  {isDeleting ? t('deleting') : t('delete_btn')}
                </button>
              )}
              <button 
                type="button"
                onClick={() => onNavigate('calendar')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                {t('cancel')}
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={loading || isDeleting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-[18px] h-[18px]" />}
                {editId ? t('update_event') : t('save_event')}
              </button>
            </div>
          </header>

          {!isEditLoaded ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('loading')}</p>
            </div>
          ) : (
          <div className="p-4 md:p-10 bg-slate-50/50 dark:bg-slate-950/50">
            <form className="w-full space-y-8" onSubmit={handleSave}>
              {/* General Details */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('general_details')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('general_details_note')}</p>
                </div>
                <div className="md:col-span-10 space-y-5 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('task_title')}</label>
                    <input
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3"
                      placeholder={t('task_title_placeholder')} 
                      type="text" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('task_description')}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3"
                      placeholder={t('task_description_placeholder')} 
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Assignment */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('assignment_section')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('assignment_note')}</p>
                </div>
                <div className="md:col-span-10 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{t('assign_to')}</label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder={t('search_clients')} 
                      type="text" 
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    <div 
                      onClick={() => setSelectedClientId(null)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                        selectedClientId === null 
                          ? 'bg-slate-800 text-white border-slate-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t('general_task')}
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
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {client.avatar ? (
                            <div className="h-4 w-4 rounded-full bg-cover bg-center border border-white/20" style={{ backgroundImage: `url("${client.avatar}")` }} />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[8px] text-slate-600 dark:text-slate-200">{client.name.substring(0,2).toUpperCase()}</div>
                          )}
                          {client.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Activity Category */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('activity_category')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('activity_category_note')}</p>
                </div>
                <div className="md:col-span-10 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                    {[
                      { id: 'Training', label: t('category_training'), icon: Dumbbell, activeClass: 'peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/40 peer-checked:border-emerald-500 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-300 hover:border-emerald-200', iconClass: 'peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 group-hover:text-emerald-500' },
                      { id: 'Nutrition', label: t('category_nutrition'), icon: Utensils, activeClass: 'peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/40 peer-checked:border-orange-500 peer-checked:text-orange-700 dark:peer-checked:text-orange-300 hover:border-orange-200', iconClass: 'peer-checked:text-orange-600 dark:peer-checked:text-orange-400 group-hover:text-orange-500' },
                      { id: 'Check-in', label: t('category_checkin'), icon: ClipboardCheck, activeClass: 'peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/40 peer-checked:border-blue-500 peer-checked:text-blue-700 dark:peer-checked:text-blue-300 hover:border-blue-200', iconClass: 'peer-checked:text-blue-600 dark:peer-checked:text-blue-400 group-hover:text-blue-500' },
                      { id: 'Call', label: t('category_call'), icon: Phone, activeClass: 'peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/40 peer-checked:border-purple-500 peer-checked:text-purple-700 dark:peer-checked:text-purple-300 hover:border-purple-200', iconClass: 'peer-checked:text-purple-600 dark:peer-checked:text-purple-400 group-hover:text-purple-500' },
                      { id: 'Admin', label: t('category_admin'), icon: ShieldCheck, activeClass: 'peer-checked:bg-slate-200 dark:peer-checked:bg-slate-700 peer-checked:border-slate-500 peer-checked:text-slate-800 dark:peer-checked:text-slate-200 hover:border-slate-300', iconClass: 'peer-checked:text-slate-600 dark:peer-checked:text-slate-300 group-hover:text-slate-500' },
                    ].map((cat) => (
                      <label key={cat.id} className="cursor-pointer group">
                        <input 
                          className="peer sr-only" 
                          name="category" 
                          type="radio" 
                          checked={category === cat.id}
                          onChange={() => {
                            setCategory(cat.id as any);
                            // Only the Call category uses a manually-entered meeting URL.
                            // Other categories don't have a real link target, so clear it
                            // instead of fabricating an invalid route.
                            setLinkUrl('');
                          }}
                        />
                        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all h-24 ${cat.activeClass}`}>
                          <cat.icon className={`w-6 h-6 mb-2 text-slate-400 transition-colors ${cat.iconClass}`} />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 peer-checked:text-current">{cat.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {category !== 'Admin' && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        {category === 'Call' ? t('meeting_url') : t('resource_assigned')}
                      </label>
                      <div className="flex items-center gap-2">
                        {category === 'Call' ? (
                          <input 
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            placeholder={t('meeting_url_placeholder')}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 px-3 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          />
                        ) : (
                          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
                            category === 'Training' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400' :
                            category === 'Nutrition' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-400' :
                            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              category === 'Training' ? 'bg-emerald-500' :
                              category === 'Nutrition' ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-sm font-bold truncate">
                              {selectedClientId 
                                ? `${category} ${t('with')} ${clients.find(c => c.id === selectedClientId)?.name || t('client_label')}`
                                : t('assign_client_link')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Schedule */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('schedule_frequency')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('schedule_note')}</p>
                </div>
                <div className="md:col-span-10 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('date')}</label>
                      <DatePicker value={date} onChange={setDate} allowClear={false} />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('start_time')}</label>
                        <TimeSelect
                          value={startTime}
                          onChange={setStartTime}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('end_time')}</label>
                        <TimeSelect
                          value={endTime}
                          onChange={setEndTime}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t('repeat_label')}</label>
                    <Select
                      value={repeat}
                      onChange={(val) => {
                        setRepeat(val);
                        // Opening the modal as a side effect of selecting Custom
                        // keeps the dropdown a single source of truth — no
                        // separate "configure" button cluttering the form.
                        if (val === 'Custom') setCustomModalOpen(true);
                        else { setCustomRule(null); setCustomUntil(null); }
                      }}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 px-3"
                    >
                      <option>{t('does_not_repeat')}</option>
                      <option>{t('daily')}</option>
                      <option>{t('weekly')}</option>
                      <option>{t('monthly')}</option>
                      <option>{t('custom')}</option>
                    </Select>
                    {repeat === 'Custom' && customRule && (
                      <button
                        type="button"
                        onClick={() => setCustomModalOpen(true)}
                        className="mt-1.5 text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        {t('edit_custom_recurrence', { defaultValue: 'Editar recurrencia personalizada' })} — {customRule}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Priority */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 pb-8">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('priority_label')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('priority_note')}</p>
                </div>
                <div className="md:col-span-10 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  {[
                    { level: 'Low', activeClass: 'peer-checked:bg-slate-100 dark:peer-checked:bg-slate-700 peer-checked:border-slate-400 dark:peer-checked:border-slate-500 peer-checked:text-slate-700 dark:peer-checked:text-slate-200 text-slate-600' },
                    { level: 'Medium', activeClass: 'peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/40 peer-checked:border-blue-500 peer-checked:text-blue-700 dark:peer-checked:text-blue-300 text-slate-600' },
                    { level: 'High', activeClass: 'peer-checked:bg-red-50 dark:peer-checked:bg-red-900/40 peer-checked:border-red-500 peer-checked:text-red-700 dark:peer-checked:text-red-300 text-slate-600' }
                  ].map((p) => (
                    <label key={p.level} className="cursor-pointer flex-1">
                      <input 
                        className="peer sr-only" 
                        name="priority" 
                        type="radio" 
                        checked={priority === p.level}
                        onChange={() => setPriority(p.level as any)}
                      />
                      <span className={`px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-slate-300 text-sm font-semibold transition-all block text-center ${p.activeClass}`}>
                        {p.level === 'Low' ? t('low') : p.level === 'Medium' ? t('medium') : t('high')}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <strong>{t('info_label')}</strong> {t('sync_info')}
                </p>
              </div>

            </form>
          </div>
          )}
        </div>
      </div>
      <RecurrenceScopeDialog
        open={Boolean(scopeDialog)}
        mode={scopeDialog?.mode || 'edit'}
        onClose={() => { setScopeDialog(null); pendingSavePayload.current = null; }}
        onPick={(scope) => {
          if (scopeDialog?.mode === 'delete') performScopedDelete(scope);
          else performScopedSave(scope);
        }}
      />
      <CustomRecurrenceModal
        open={customModalOpen}
        onClose={() => {
          setCustomModalOpen(false);
          // If the user closes without ever saving and there's no rule yet,
          // bounce the dropdown back to "Does not repeat" so the form state
          // doesn't claim a custom rule that doesn't exist.
          if (!customRule) setRepeat('Does not repeat');
        }}
        initialRule={customRule}
        initialUntil={customUntil}
        anchorDate={date}
        onSave={(rule, until) => {
          setCustomRule(rule);
          setCustomUntil(until);
          setRepeat('Custom');
        }}
      />
    </div>
  );
}
