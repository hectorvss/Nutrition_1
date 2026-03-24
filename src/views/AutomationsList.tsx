import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Hand,
  Repeat,
  AlertTriangle,
  PartyPopper,
  Cake,
  FileText,
  Trash2,
  Pencil
} from 'lucide-react';
import { useAutomation, Automation } from '../context/AutomationContext';
import { useClient } from '../context/ClientContext';

const iconMap: Record<string, React.ElementType> = {
  Hand, Repeat, AlertTriangle, PartyPopper, Cake, FileText
};

interface AutomationsListProps {
  onCreateNew: () => void;
  onEdit: (automation: Automation) => void;
}

export default function AutomationsList({ onCreateNew, onEdit }: AutomationsListProps) {
  const { automations, toggleAutomation, deleteAutomation } = useAutomation();
  const { clients } = useClient();
  const [search, setSearch] = useState('');
  
  const activeCount = automations.filter(a => a.enabled).length;
  const filtered = automations.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.trigger.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 md:p-8 lg:p-10 gap-6">
      <div className="w-full flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Automate Messages</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your automated workflows — 
              <span className="font-semibold text-emerald-600"> {activeCount} of {automations.length}</span> active
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none w-56 placeholder-slate-400"
                placeholder="Search automations..."
                type="text"
              />
            </div>
            <button 
              onClick={onCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Automation
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Automation Name</div>
            <div className="col-span-3 hidden md:block">Trigger</div>
            <div className="col-span-3 hidden sm:block">Message Preview</div>
            <div className="col-span-2 text-right md:col-span-2">Status</div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No automations found.{' '}
                <button onClick={onCreateNew} className="text-emerald-500 font-semibold hover:underline">Create one!</button>
              </div>
            )}
            {filtered.map((auto) => {
              const Icon = iconMap[auto.icon_info?.iconName] || FileText;
              return (
                <div key={auto.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 p-5 items-center">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${auto.icon_info?.iconBg || 'bg-slate-100'} ${auto.icon_info?.iconColor || 'text-slate-500'} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{auto.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate text-slate-500">{auto.description}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden md:flex items-center text-sm text-slate-500 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium truncate">
                        {auto.trigger_id}
                      </span>
                    </div>
                    <div className="col-span-3 hidden sm:block">
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-4">{auto.message}</p>
                    </div>
                    <div className="col-span-5 md:col-span-2 flex justify-end items-center gap-2">
                      {/* Edit and Delete hidden until hover */}
                      <button 
                        onClick={() => onEdit(auto)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteAutomation(auto.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={auto.enabled} 
                          onChange={() => toggleAutomation(auto.id)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 dark:peer-focus:ring-emerald-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Showing {filtered.length} of {automations.length} automations.</span>
            <span className="text-xs">{clients.length} clients will receive active messages.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
