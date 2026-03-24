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
  Plus
} from 'lucide-react';
import { AutomationDeliveryRules } from '../context/AutomationContext';

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
  const [message, setMessage] = useState(initialMessage);
  const [rules, setRules] = useState<AutomationDeliveryRules>(initialRules);
  const [copied, setCopied] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateRule = <K extends keyof AutomationDeliveryRules>(key: K, value: AutomationDeliveryRules[K]) => {
    setRules(prev => ({ ...prev, [key]: value }));
  };

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
                          {(['All Clients', 'By Tag'] as const).map(opt => (
                            <button
                              key={opt}
                              onClick={() => updateRule('audience', opt)}
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

                    {/* Stop & Activation Conditions */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Stop Condition */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <input
                            id="stop-condition"
                            type="checkbox"
                            checked={rules.stopCondition}
                            onChange={e => updateRule('stopCondition', e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="flex flex-col">
                            <label htmlFor="stop-condition" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">Enable Stop Condition</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Automatically stop sending if a specific event occurs.</p>
                          </div>
                        </div>
                        {rules.stopCondition && (
                          <div className="flex items-center gap-3 ml-8">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stop when:</span>
                            <select 
                              value={rules.stopWhen}
                              onChange={e => updateRule('stopWhen', e.target.value)}
                              className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                              <option>Client replies to message</option>
                              <option>Client completes check-in</option>
                              <option>Client logs a workout</option>
                              <option>Manual stop</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Activation Conditions */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-bold text-slate-900 dark:text-white mb-1">Activation Conditions</label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Define specific rules that must be met to send this message.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {[
                            { type: 'weight', label: 'Weight Goal', op: '>', val: 'Target' },
                            { type: 'activity', label: 'Inactivity', op: '>', val: '3 Days' },
                            { type: 'adherence', label: 'Low Adherence', op: '<', val: '70%' },
                            { type: 'expiry', label: 'Expiring Soon', op: '<', val: '7 Days' }
                          ].map(cond => {
                            const active = rules.activation_conditions?.some(c => c.type === cond.type && c.enabled);
                            return (
                              <button
                                key={cond.type}
                                onClick={() => {
                                  const current = rules.activation_conditions || [];
                                  const exists = current.find(c => c.type === cond.type);
                                  if (exists) {
                                    updateRule('activation_conditions', current.map(c => c.type === cond.type ? { ...c, enabled: !c.enabled } : c));
                                  } else {
                                    updateRule('activation_conditions', [...current, { type: cond.type, operator: cond.op as any, value: cond.val, enabled: true }]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                                  active 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
                                }`}
                              >
                                {active ? <CheckCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {cond.label}
                              </button>
                            );
                          })}
                        </div>
                        
                        {(rules.activation_conditions || []).filter(c => c.enabled).length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 italic">
                            {(rules.activation_conditions || []).filter(c => c.enabled).map((c, i) => (
                              <span key={i}>• If {c.type} {c.operator} {c.value}</span>
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
