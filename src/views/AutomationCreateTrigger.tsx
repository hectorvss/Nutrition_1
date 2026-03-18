import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Repeat, 
  ClipboardCheck, 
  AlertTriangle, 
  UserPlus, 
  Smartphone, 
  TrendingUp, 
  Cake, 
  Plus 
} from 'lucide-react';

interface Trigger {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  iconName: string;
  category: string;
  recommended?: boolean;
}

const triggers: Trigger[] = [
  {
    id: 'weekly-checkin',
    name: 'Weekly Check-in Reminder',
    desc: 'Automatically nudge clients to complete their check-in form every week.',
    icon: Repeat,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconName: 'Repeat',
    category: 'Check-ins',
    recommended: true
  },
  {
    id: 'overdue-checkin',
    name: 'Overdue Check-in',
    desc: 'Follow up when a client misses their scheduled check-in deadline.',
    icon: ClipboardCheck,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    iconName: 'ClipboardCheck',
    category: 'Check-ins'
  },
  {
    id: 'no-activity-3',
    name: 'No Activity Alert (3 days)',
    desc: "Re-engage clients who haven't logged any activity for 3 consecutive days.",
    icon: AlertTriangle,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconName: 'AlertTriangle',
    category: 'Activity'
  },
  {
    id: 'new-client',
    name: 'New Client Added',
    desc: 'Trigger immediately when you add a new client to send a welcome message.',
    icon: UserPlus,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconName: 'UserPlus',
    category: 'Logistics'
  },
  {
    id: 'app-setup',
    name: 'App Setup Reminder',
    desc: "Nudge clients who haven't completed their initial app profile setup.",
    icon: Smartphone,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconName: 'Smartphone',
    category: 'Logistics'
  },
  {
    id: 'high-adherence',
    name: 'Weekly Adherence High',
    desc: 'Congratulate clients who achieved >90% habit adherence this week.',
    icon: TrendingUp,
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    iconName: 'TrendingUp',
    category: 'Activity'
  },
  {
    id: 'birthday',
    name: 'Client Birthday',
    desc: "Send a personalized greeting on your client's special day.",
    icon: Cake,
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    iconName: 'Cake',
    category: 'Monthly'
  },
  {
    id: 'custom',
    name: 'Custom Trigger',
    desc: 'Create a trigger based on specific custom events or API calls.',
    icon: Plus,
    iconBg: 'bg-gray-100 dark:bg-slate-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
    iconName: 'Plus',
    category: 'Custom'
  }
];

const categories = ['All', 'Recommended', 'Check-ins', 'Activity', 'Training', 'Nutrition', 'Monthly', 'Logistics', 'Custom'];

interface AutomationCreateTriggerProps {
  onBack: () => void;
  onNext: (triggerId: string, triggerName: string, iconName: string, iconBg: string, iconColor: string) => void;
}

export default function AutomationCreateTrigger({ onBack, onNext }: AutomationCreateTriggerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = triggers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || (activeCategory === 'Recommended' && t.recommended) || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Automations
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Automation</h1>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">1</div>
                <span className="text-xs font-semibold mt-2 text-emerald-500">Trigger</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-slate-200 dark:bg-slate-800 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">2</div>
                <span className="text-xs font-medium mt-2 text-slate-400">Message</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-slate-200 dark:bg-slate-800 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">3</div>
                <span className="text-xs font-medium mt-2 text-slate-400">Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 1: Choose a Trigger</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Select the event that will start this automation sequence.</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 outline-none" 
                  placeholder="Search triggers..." 
                  type="text" 
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-6 flex-1 scrollbar-hide">
            {filtered.map((trigger) => (
              <button 
                key={trigger.id}
                onClick={() => onNext(trigger.id, trigger.name, trigger.iconName, trigger.iconBg, trigger.iconColor)}
                className="group relative flex flex-col items-start p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-left"
              >
                {trigger.recommended && (
                  <div className="absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wide">
                    Recommended
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${trigger.iconBg} ${trigger.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <trigger.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-base">{trigger.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{trigger.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">Select a trigger to proceed to step 2.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
