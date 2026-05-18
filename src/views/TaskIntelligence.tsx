import React, { useState } from 'react';
import { 
  ArrowLeft, 
  History, 
  Save, 
  Bot, 
  MessageSquare, 
  Activity,
  Wand2,
  Settings2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTask, AutomationRule } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

interface TaskIntelligenceProps {
  onNavigate: (view: string) => void;
}

export default function TaskIntelligence({ onNavigate }: TaskIntelligenceProps) {
  const { t } = useLanguage();
  const { rules, updateRule, saveRules } = useTask();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleToggle = (id: string, current: boolean) => {
    updateRule(id, { enabled: !current });
  };

  const handleChangePriority = (id: string, newPriority: string) => {
    const priorityColor = newPriority === 'High' ? 'text-red-500' : newPriority === 'Medium' ? 'text-orange-500' : 'text-slate-400';
    updateRule(id, { priority: newPriority as any, priorityColor });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveRules();
      onNavigate('tasks'); // go back only after a successful save
    } catch (error) {
      console.error('Failed to save task rules:', error);
      setSaveError(t('task_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Group rules by category for the UI
  const categories = [
    { name: 'COMMUNICATIONS', label: t('communications'), icon: MessageSquare, color: 'text-blue-500' },
    { name: 'CLIENT PERFORMANCE', label: t('client_performance'), icon: Activity, color: 'text-purple-500' },
    { name: 'OPERATIONS', label: t('operations'), icon: Settings2, color: 'text-teal-500' }
  ];

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => onNavigate('tasks')}
                className="p-2 -ml-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{t('task_intelligence')}</h1>
            </div>
            <p className="text-slate-500 leading-relaxed">
              {t('configure_priorities_desc', { defaultValue: 'Configure how the system prioritizes and automates your daily workflow.' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <History className="w-4 h-4" />
              {t('history', { defaultValue: 'History' })}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? t('saving') : t('save_changes')}
            </button>
          </div>
        </header>

        {saveError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {saveError}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          {/* Hero Section */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('automation_rules_smart_tasks', { defaultValue: 'Automation Rules & Smart Tasks' })}</h2>
                <p className="text-xs text-slate-500">{t('automation_desc', { defaultValue: 'System will automatically create tasks based on these triggers.' })}</p>
              </div>
            </div>
          </div>

          {/* Rules Sections */}
          <div className="p-8 space-y-12">
            {categories.map((section) => {
              const sectionRules = rules.filter(r => r.category === section.name);
              if (sectionRules.length === 0) return null;

              return (
              <section key={section.name}>
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{section.label}</h3>
                </div>

                <div className="space-y-4">
                  {sectionRules.map((rule) => (
                    <div 
                      key={rule.id}
                      className={`p-6 border rounded-2xl transition-all ${
                        rule.enabled 
                          ? 'bg-white border-slate-200 hover:border-emerald-200' 
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900">{rule.title}</h4>
                            {rule.badge && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                rule.badge === 'Default' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {rule.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">{rule.desc}</p>
                        </div>

                        <div className="flex items-center gap-8 shrink-0">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('priority_label', { defaultValue: 'Priority' })}</span>
                              
                              <Select
                                value={rule.priority}
                                onChange={(val) => handleChangePriority(rule.id, val)}
                                className={`bg-transparent text-sm font-bold outline-none ${rule.priorityColor}`}
                              >
                                <option value="High">{t('high_priority', { defaultValue: 'High' })}</option>
                                <option value="Medium">{t('medium_priority', { defaultValue: 'Medium' })}</option>
                                <option value="Low">{t('low_priority', { defaultValue: 'Low' })}</option>
                              </Select>

                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleToggle(rule.id, rule.enabled)}
                            >
                              <div className={`w-12 h-6 rounded-full relative transition-colors ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rule.enabled ? 'left-7' : 'left-1'}`} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
