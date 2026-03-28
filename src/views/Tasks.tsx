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
  onNavigate: (view: string, data?: any) => void;
}

import { useTask, TaskItem } from '../context/TaskContext';

export default function Tasks({ onNavigate }: TasksProps) {
  const { tasks, completedTasks, markTaskAsDone } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

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
                { label: 'COMPLETED', value: `${completedTasks.length} Done`, icon: CheckCircle2, color: 'text-purple-500 bg-purple-50' },
                { label: 'INBOX', value: '12 New', icon: Mail, color: 'text-blue-500 bg-blue-50' },
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

          <div className="flex items-center gap-2 mb-8 bg-slate-100/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active ({tasks.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>

          {activeTab === 'pending' ? (
            <div className="space-y-8 sm:space-y-10">
              {(['high', 'medium', 'low'] as const).map((prio) => {
                const prioTasks = tasks.filter(t => (t.priority || 'medium') === prio && (!searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.client.toLowerCase().includes(searchQuery.toLowerCase())));
                if (prioTasks.length === 0) return null;
                
                const config = PRIORITY_CONFIG[prio];

                return (
                  <section key={prio}>
                    <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{config.label}</h2>
                    <div className="space-y-4">
                      {prioTasks.map((task) => (
                        <div 
                          key={task.id}
                          onClick={() => {
                            if (task.type === 'WEEKLY CHECK-IN' || task.type === 'OVERDUE CHECK-IN') {
                              onNavigate('check-ins', { clientId: task.clientId || task.id });
                            } else if (task.type === 'PLAN UPDATE' || task.type === 'MISSING PLAN') {
                              onNavigate('planning', { clientId: task.clientId || task.id });
                            } else if (task.type === 'AUTOMATIC ALERT') {
                              onNavigate('planning', { clientId: task.clientId || task.id });
                            } else {
                              onNavigate('create-task', { taskId: task.id });
                            }
                          }}
                          className={`group relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${config.borderInactive}`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="pt-1 hidden sm:block">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markTaskAsDone(task.id);
                                }}
                                className={`w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${config.dotCircle} hover:border-emerald-500 hover:bg-emerald-50 shadow-sm`}
                              >
                                <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${config.dotFill}`} />
                              </button>
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
          ) : (
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold">No tasks completed yet today</h3>
                  <p className="text-slate-500 text-sm mt-1">Check off some tasks to see your daily progress here.</p>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 opacity-60 grayscale transition-all border-l-4 border-l-slate-400"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="pt-1 hidden sm:block">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate text-slate-500">
                              {task.type}: COMPLETED
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 bg-slate-100 text-slate-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Done today
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-400 mb-1 truncate line-through">{task.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2">{task.desc}</p>
                        <div className="flex items-center gap-2">
                          {task.avatar && <img src={task.avatar} alt={task.client} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-50" referrerPolicy="no-referrer" />}
                          <span className="text-[11px] sm:text-xs font-bold text-slate-400 truncate">{task.client}</span>
                          <span className="text-[11px] sm:text-xs text-slate-300 shrink-0">•</span>
                          <span className="text-[11px] sm:text-xs text-slate-300 truncate">{task.program}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
