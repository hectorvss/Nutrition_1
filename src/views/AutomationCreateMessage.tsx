import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image as ImageIcon, 
  Sparkles, 
  Clock, 
  Sunrise, 
  Sun, 
  Moon, 
  Signal, 
  Wifi, 
  BatteryFull, 
  Send,
  Copy,
  CheckCheck,
  Plus,
  User,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import { AutomationDeliveryRules, AutomationCondition } from '../context/AutomationContext';
import { useClient } from '../context/ClientContext';

interface AutomationCreateMessageProps {
  triggerName: string;
  initialMessage: string;
  initialRules: AutomationDeliveryRules;
  isEditing: boolean;
  onBack: () => void;
  onNext: (message: string, deliveryRules: AutomationDeliveryRules) => void;
}

const VARIABLES = [
  { label: '{Client Name}', desc: "Client's full name" },
  { label: '{First Name}', desc: "Client's first name" },
  { label: '{Coach Name}', desc: "Your name" },
  { label: '{Current Weight}', desc: "Latest logged weight" },
  { label: '{Goal Weight}', desc: "Client's target weight" },
  { label: '{Adherence Rate}', desc: "Weekly adherence %" },
  { label: '{Check-in Day}', desc: "Scheduled check-in day" },
  { label: '{Days Inactive}', desc: "Days since last login" },
  { label: '{Days Until Expiry}', desc: "Days until plan ends" },
];

function getPreviewText(text: string) {
  // split text into parts: variables and plain text
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (/^\{[^}]+\}$/.test(part)) {
      return (
        <span key={i} className="text-emerald-500 font-semibold">{part}</span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AutomationCreateMessage({
  triggerName,
  initialMessage,
  initialRules,
  isEditing,
  onBack,
  onNext,
}: AutomationCreateMessageProps) {
  const { clients } = useClient();
  const [message, setMessage] = useState(initialMessage);
  const [rules, setRules] = useState<AutomationDeliveryRules>(initialRules || {
    frequency: 'Once',
    frequencyValue: 1,
    frequencyUnit: 'Days',
    deliveryTime: 'Morning',
    audience: 'All Clients',
    selected_client_ids: [],
    activation_conditions: [],
    stop_conditions: []
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateRule = <K extends keyof AutomationDeliveryRules>(key: K, value: AutomationDeliveryRules[K]) => {
    setRules(prev => ({ ...prev, [key]: value }));
  };

  const toggleCondition = (rulesKey: 'activation_conditions' | 'stop_conditions', type: string, defaultOp: any, defaultVal: any) => {
    const current = rules[rulesKey] || [];
    const exists = current.find(c => c.type === type);
    if (exists) {
      updateRule(rulesKey, current.map(c => c.type === type ? { ...c, enabled: !c.enabled } : c));
    } else {
      updateRule(rulesKey, [...current, { type, operator: defaultOp, value: defaultVal, enabled: true }]);
    }
  };

  const removeClient = (clientId: string) => {
    updateRule('selected_client_ids', (rules.selected_client_ids || []).filter(id => id !== clientId));
  };

  const addClient = (clientId: string) => {
    if (!(rules.selected_client_ids || []).includes(clientId)) {
      updateRule('selected_client_ids', [...(rules.selected_client_ids || []), clientId]);
    }
    setClientSearch('');
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) && 
    !(rules.selected_client_ids || []).includes(c.id)
  );

  // Insert variable at current cursor position
  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = message.substring(0, start) + variable + message.substring(end);
    setMessage(newText);
    // Re-focus and put cursor after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
    // Show "copied" checkmark
    setCopied(variable);
    setTimeout(() => setCopied(null), 1500);
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                {isEditing ? 'Back to Automations' : 'Back to Trigger'}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Automation' : 'Create New Automation'}
            </h1>
            {triggerName && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Trigger: {triggerName}
              </p>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-emerald-500">Trigger</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-emerald-500 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">2</div>
                <span className="text-xs font-semibold mt-2 text-emerald-500">Message</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-slate-200 dark:bg-slate-800 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">3</div>
                <span className="text-xs font-medium mt-2 text-slate-400">Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1">
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Column: Editor */}
            <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-y-auto scrollbar-hide">
              <div className="p-6 md:p-8 flex flex-col gap-8">
                {/* Step header */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step {isEditing ? 'Edit' : '2'}: Configure Message</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Click variables to insert them at your cursor position in the message.</p>
                </div>

                {/* Variables */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Variables</h3>
                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">Click to insert</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VARIABLES.map(v => (
                      <button 
                        key={v.label} 
                        title={v.desc}
                        onClick={() => insertVariable(v.label)}
                        className="group relative px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 text-xs font-mono font-medium hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-500/30 transition-colors flex items-center gap-1.5"
                      >
                        {copied === v.label ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-50" />}
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Editor */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Link"><Link className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Image"><ImageIcon className="w-4 h-4" /></button>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-sm transition-all text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </button>
                  </div>
                  <textarea 
                    ref={textareaRef}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full h-48 p-4 bg-white dark:bg-slate-900 resize-none focus:outline-none text-slate-900 dark:text-slate-200 text-sm leading-relaxed" 
                    placeholder={`Hi {Client Name}, a message will be sent when "${triggerName || 'your trigger'}" occurs...`}
                  />
                </div>

                {/* Delivery Rules */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      Delivery Rules
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-medium">Auto-save on</span>
                  </div>
                  <div className="p-5 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Frequency */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Repeat Frequency</label>
                        <div className="flex gap-2">
                          <select 
                            value={rules.frequency}
                            onChange={e => updateRule('frequency', e.target.value as any)}
                            className="w-24 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                          >
                            <option>Every</option>
                            <option>Once</option>
                          </select>
                          {rules.frequency === 'Every' && (
                            <div className="flex-1 flex items-center gap-2">
                              <input 
                                type="number" 
                                min={1}
                                value={rules.frequencyValue}
                                onChange={e => updateRule('frequencyValue', parseInt(e.target.value) || 1)}
                                className="w-20 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500" 
                              />
                              <select 
                                value={rules.frequencyUnit}
                                onChange={e => updateRule('frequencyUnit', e.target.value as any)}
                                className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                              >
                                <option>Days</option>
                                <option>Weeks</option>
                                <option>Months</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Target */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Audience</label>
                        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/50 p-1 border border-slate-200 dark:border-slate-800">
                          {(['All Clients', 'Specific Clients'] as const).map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                updateRule('audience', opt);
                                if (opt === 'Specific Clients') setShowClientSelector(true);
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                rules.audience === opt 
                                  ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 border border-slate-200 dark:border-slate-800' 
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {/* Client Selector UI */}
                        {rules.audience === 'Specific Clients' && (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {(rules.selected_client_ids || []).map(id => {
                                const client = clients.find(c => c.id === id);
                                return (
                                  <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20">
                                    {client?.name || 'Unknown'}
                                    <button onClick={() => removeClient(id)} className="hover:text-emerald-800 dark:hover:text-emerald-200 flex shrink-0">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                              {(!rules.selected_client_ids || rules.selected_client_ids.length === 0) && (
                                <span className="text-[10px] text-slate-400 italic font-medium">No clients selected yet</span>
                              )}
                            </div>
                            
                            <div className="relative">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                  type="text"
                                  placeholder="Search and add client..."
                                  value={clientSearch}
                                  onFocus={() => setShowClientSelector(true)}
                                  onChange={e => setClientSearch(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                                {clientSearch && (
                                  <button onClick={() => setClientSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              
                              {showClientSelector && clientSearch && (
                                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden scrollbar-hide ring-1 ring-black/5">
                                  {filteredClients.length > 0 ? (
                                    filteredClients.map(c => (
                                      <button
                                        key={c.id}
                                        onClick={() => addClient(c.id)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundImage: `url("${c.avatar}")` }} />
                                        <span className="font-semibold">{c.name}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-xs text-slate-400 italic">No matching clients found</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preferred Delivery Time</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Morning', time: '8AM - 11AM', icon: Sunrise, color: 'text-orange-400' },
                          { label: 'Afternoon', time: '1PM - 4PM', icon: Sun, color: 'text-yellow-500' },
                          { label: 'Evening', time: '6PM - 9PM', icon: Moon, color: 'text-indigo-400' },
                          { label: 'Custom', time: 'Set Time', icon: Clock, color: 'text-slate-400' }
                        ].map(t => (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => updateRule('deliveryTime', t.label as any)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                              rules.deliveryTime === t.label 
                                ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' 
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30'
                            }`}
                          >
                            <t.icon className={`w-5 h-5 mb-1 ${t.color}`} />
                            <span className="text-xs font-medium text-slate-900 dark:text-slate-200">{t.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-500">{t.time}</span>
                          </button>
                        ))}
                      </div>
                      {rules.deliveryTime === 'Custom' && (
                        <input 
                          type="time" 
                          value={rules.customTime || '09:00'}
                          onChange={e => updateRule('customTime', e.target.value)}
                          className="w-40 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      )}
                    </div>

                    {/* Unified Condition Builder */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-8">
                      {/* Activation Conditions */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Activation Triggers</label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">The message is sent ONLY if these conditions are met.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {[
                            { type: 'weight', label: 'Weight Goal', op: '>', val: 'Target', color: 'bg-blue-500' },
                            { type: 'activity', label: 'Inactivity', op: '>', val: '3', color: 'bg-orange-500' },
                            { type: 'adherence', label: 'Low Adherence', op: '<', val: '70', color: 'bg-red-500' },
                            { type: 'last_checkin', label: 'Last Check-in', op: '>', val: '7', color: 'bg-purple-500' },
                            { type: 'mood', label: 'Low Mood', op: '<', val: '3', color: 'bg-indigo-500' },
                            { type: 'rpe', label: 'High RPE', op: '>', val: '8', color: 'bg-rose-500' }
                          ].map(cond => {
                            const active = rules.activation_conditions?.some(c => c.type === cond.type && c.enabled);
                            return (
                              <button
                                key={cond.type}
                                onClick={() => toggleCondition('activation_conditions', cond.type, cond.op as any, cond.val)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                                  active 
                                    ? `${cond.color} border-transparent text-white shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-${cond.color.split('-')[1]}-500/50` 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
                                }`}
                              >
                                {active ? <CheckCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {cond.label}
                              </button>
                            );
                          })}
                        </div>
                        
                        {rules.activation_conditions?.some(c => c.enabled) && (
                          <div className="space-y-2 max-w-md">
                            {rules.activation_conditions.filter(c => c.enabled).map((c, i) => (
                              <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                <span className="text-[10px] font-bold text-slate-400 uppercase w-20">If {c.type}:</span>
                                <select 
                                  value={c.operator}
                                  onChange={e => {
                                    const next = [...rules.activation_conditions];
                                    next[rules.activation_conditions.indexOf(c)].operator = e.target.value as any;
                                    updateRule('activation_conditions', next);
                                  }}
                                  className="bg-transparent border-none p-0 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-0 cursor-pointer"
                                >
                                  <option value=">">{'>'}</option>
                                  <option value="<">{'<'}</option>
                                  <option value="==">{'='}</option>
                                </select>
                                <input 
                                  type="text"
                                  value={c.value}
                                  onChange={e => {
                                    const next = [...rules.activation_conditions];
                                    next[rules.activation_conditions.indexOf(c)].value = e.target.value;
                                    updateRule('activation_conditions', next);
                                  }}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs w-20 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <button onClick={() => toggleCondition('activation_conditions', c.type, '>', '')} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stop Conditions */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Stop Conditions</label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">The automation will STOP sending if any of these are met.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {[
                            { type: 'reply', label: 'Client Replies', op: 'is', val: 'true', color: 'bg-emerald-500' },
                            { type: 'checkin', label: 'Check-in Done', op: 'is', val: 'true', color: 'bg-cyan-500' },
                            { type: 'weight_goal', label: 'Weight Reached', op: '<=', val: 'Target', color: 'bg-rose-500' },
                            { type: 'manual', label: 'Manual Stop', op: 'is', val: 'true', color: 'bg-slate-500' }
                          ].map(cond => {
                            const active = rules.stop_conditions?.some(c => c.type === cond.type && c.enabled);
                            return (
                              <button
                                key={cond.type}
                                onClick={() => toggleCondition('stop_conditions', cond.type, cond.op as any, cond.val)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                                  active 
                                    ? `${cond.color} border-transparent text-white shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-${cond.color.split('-')[1]}-500/50` 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
                                }`}
                              >
                                {active ? <CheckCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {cond.label}
                              </button>
                            );
                          })}
                        </div>

                        {rules.stop_conditions?.some(c => c.enabled) && (
                          <div className="space-y-2 max-w-md">
                            {rules.stop_conditions.filter(c => c.enabled).map((c, i) => (
                              <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                <span className="text-[10px] font-bold text-slate-400 uppercase w-20">Stop if {c.type.split('_')[0]}:</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.operator} {c.value}</span>
                                <button onClick={() => toggleCondition('stop_conditions', c.type, 'is', 'true')} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => onNext(message, rules)}
                    disabled={!message.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-emerald-500/25 transition-colors flex items-center gap-2"
                  >
                    Continue to Review
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="w-full md:w-[380px] bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 flex flex-col items-center justify-center relative border-l border-slate-200 dark:border-slate-800">
              <h3 className="absolute top-6 left-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
              <div className="w-[300px] bg-white dark:bg-slate-900 rounded-[3rem] border-8 border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col sticky top-10" style={{ height: 560 }}>
                {/* Status bar */}
                <div className="bg-slate-100 dark:bg-slate-800 h-14 flex items-center px-6 pt-2 justify-between shrink-0">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">{currentTime}</span>
                  <div className="flex gap-1.5">
                    <Signal className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                    <Wifi className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                    <BatteryFull className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                  </div>
                </div>
                {/* Chat body */}
                <div className="flex-1 p-4 bg-[#f2f2f7] dark:bg-slate-900 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
                  <div className="flex items-center justify-center py-2">
                    <span className="text-[10px] text-slate-400 font-medium">Today {currentTime}</span>
                  </div>
                  {message ? (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[90%]">
                        <p className="text-xs text-slate-900 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {getPreviewText(message)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center flex-1">
                      <span className="text-xs text-slate-400 italic text-center">Your message preview will appear here as you type…</span>
                    </div>
                  )}
                </div>
                {/* Input */}
                <div className="mt-auto bg-white dark:bg-slate-800 rounded-full mx-3 mb-3 px-4 py-2 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">Message...</span>
                  <Send className="w-4 h-4 text-emerald-500" />
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-b-2xl z-20"></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-6 text-center max-w-[240px]">
                Variables like <span className="bg-emerald-500/10 text-emerald-500 px-1 rounded text-[10px] font-medium">{'{Client Name}'}</span> are highlighted in green and replaced with real data on delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
