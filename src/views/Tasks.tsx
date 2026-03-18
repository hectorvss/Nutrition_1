import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  ClipboardCheck, 
  MessageSquare, 
  Clock, 
  X,
  TrendingDown,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  FileText,
  Dumbbell,
  Zap
} from 'lucide-react';

export interface DeprecatedTask {
  id: number;
  type: 'AUTOMATIC ALERT' | 'DIRECT MESSAGE' | 'WEEKLY CHECK-IN' | 'PLAN UPDATE';
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
  actionItems?: string[];
  notes?: string;
}

interface TasksProps {
  onNavigate: (view: string) => void;
}

import { useTask, TaskItem } from '../context/TaskContext';

export default function Tasks({ onNavigate }: TasksProps) {
  const [selectedTaskParamId, setSelectedTaskId] = useState<number | null>(null);
  const { tasks } = useTask();

  // Pick task
  let selectedTask = tasks.find(t => t.id === selectedTaskParamId);

  // Derived counts for Stats
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const todayCount = tasks.filter(t => t.status === 'today').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  const PRIORITY_CONFIG = {
    high: {
      label: 'High Priority (Urgent)',
      borderActive: 'border-l-red-500 ring-2 ring-red-500/10',
      borderInactive: 'border-l-red-500/50 hover:border-l-red-500',
      dotCircle: 'border-red-200 group-hover:border-red-500',
      dotFill: 'bg-red-500',
      textIcon: 'text-red-500',
      badgeText: 'text-red-500',
      badgeBg: 'bg-red-50',
    },
    medium: {
      label: 'Medium Priority (Focus)',
      borderActive: 'border-l-orange-500 ring-2 ring-orange-500/10',
      borderInactive: 'border-l-orange-500/50 hover:border-l-orange-500',
      dotCircle: 'border-orange-200 group-hover:border-orange-500',
      dotFill: 'bg-orange-500',
      textIcon: 'text-orange-500',
      badgeText: 'text-orange-500',
      badgeBg: 'bg-orange-50',
    },
    low: {
      label: 'Low Priority (Routine)',
      borderActive: 'border-l-emerald-500 ring-2 ring-emerald-500/10',
      borderInactive: 'border-l-emerald-500/50 hover:border-l-emerald-500',
      dotCircle: 'border-emerald-200 group-hover:border-emerald-500',
      dotFill: 'bg-emerald-500',
      textIcon: 'text-emerald-500',
      badgeText: 'text-emerald-500',
      badgeBg: 'bg-emerald-50',
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
          <header className="mb-8 sm:mb-10">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Daily Focus</h1>
                <p className="text-slate-500 max-w-md leading-relaxed text-sm sm:text-base">
                  Prioritize your client interactions for maximum impact.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative flex-1 sm:flex-none min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none sm:w-64 text-slate-900 placeholder:text-slate-400 shadow-sm" 
                    placeholder="Search tasks..." 
                    type="text" 
                  />
                </div>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => onNavigate('task-intelligence')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
                  >
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'OVERDUE', value: `${overdueCount} Tasks`, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
                { label: 'DUE TODAY', value: `${todayCount} Tasks`, icon: Calendar, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'PENDING', value: `${pendingCount} Tasks`, icon: ClipboardCheck, color: 'text-slate-500 bg-slate-50' },
                { label: 'INBOX', value: '0 New', icon: Mail, color: 'text-blue-500 bg-blue-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-base sm:text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="space-y-8 sm:space-y-10">
            {(['high', 'medium', 'low'] as const).map((prio) => {
              const prioTasks = tasks.filter(t => (t.priority || 'medium') === prio);
              if (prioTasks.length === 0) return null;
              
              const config = PRIORITY_CONFIG[prio];

              return (
                <section key={prio}>
                  <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{config.label}</h2>
                  <div className="space-y-4">
                    {prioTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`group relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                          selectedTaskParamId === task.id ? config.borderActive : config.borderInactive
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="pt-1 hidden sm:block">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${config.dotCircle}`}>
                              <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${config.dotFill}`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {task.type === 'AUTOMATIC ALERT' && <AlertTriangle className={`w-3 h-3 shrink-0 ${config.textIcon}`} />}
                                {task.type === 'WEEKLY CHECK-IN' && <ClipboardCheck className={`w-3 h-3 shrink-0 ${config.textIcon}`} />}
                                {task.type === 'MISSING PLAN' && <FileText className={`w-3 h-3 shrink-0 ${config.textIcon}`} />}
                                {task.type !== 'AUTOMATIC ALERT' && task.type !== 'WEEKLY CHECK-IN' && task.type !== 'MISSING PLAN' && <MessageSquare className={`w-3 h-3 shrink-0 ${config.textIcon}`} />}
                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate ${config.textIcon}`}>
                                  {task.type}: {task.label}
                                </span>
                              </div>
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${config.badgeText} ${config.badgeBg}`}>
                                <Clock className="w-3 h-3" />
                                {task.timeLabel}
                                {task.status === 'today' && <ChevronRight className="w-3 h-3 ml-1" />}
                              </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 truncate">{task.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 mb-4 line-clamp-2">{task.desc}</p>
                            <div className="flex items-center gap-2">
                              {task.avatar && <img src={task.avatar} alt={task.client} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" referrerPolicy="no-referrer" />}
                              <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">{task.client}</span>
                              <span className="text-[11px] sm:text-xs text-slate-400 shrink-0">•</span>
                              <span className="text-[11px] sm:text-xs text-slate-400 truncate">{task.program}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Detail Sidebar / Overlay */}
      <AnimatePresence>
        {selectedTask && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            
              <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] lg:relative lg:w-[450px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-50 lg:z-20"
            >
              <header className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex gap-2">
                    <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      (selectedTask.priority || 'medium') === 'high' ? 'text-red-600 bg-red-50' : 
                      (selectedTask.priority || 'medium') === 'medium' ? 'text-orange-600 bg-orange-50' :
                      'text-emerald-600 bg-emerald-50'
                    }`}>
                      {selectedTask.type}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      (selectedTask.priority || 'medium') === 'high' ? 'text-white bg-red-500' : 
                      (selectedTask.priority || 'medium') === 'medium' ? 'text-white bg-orange-500' :
                      'text-white bg-emerald-500'
                    }`}>
                      {selectedTask.priority || 'Medium'} PRIORITY
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTaskId(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{selectedTask.title}</h2>
              </header>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scrollbar-hide">
                {/* Client Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={selectedTask.avatar} alt={selectedTask.client} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{selectedTask.client}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">{selectedTask.program} • Week 4/12</p>
                    </div>
                  </div>
                  <button className="text-[10px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider shrink-0 ml-2">
                    View Profile
                  </button>
                </div>

                {/* Metrics */}
                {selectedTask.metrics && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-3 sm:p-4">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weight Change</p>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        <span className="text-base sm:text-lg font-bold text-slate-900">{selectedTask.metrics.weightChange}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-3 sm:p-4">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        <span className="text-base sm:text-lg font-bold text-slate-900">{selectedTask.metrics.compliance}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {selectedTask.actionItems && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Items</h3>
                      <span className="text-[10px] font-bold text-slate-400">0/{selectedTask.actionItems.length} Completed</span>
                    </div>
                    <div className="space-y-2">
                      {selectedTask.actionItems.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-all group">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                          <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-slate-900">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coach Notes */}
                {selectedTask.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed font-medium">
                      {selectedTask.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
                <button className="w-full py-3 sm:py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-sm sm:text-base">
                  Start Review
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
