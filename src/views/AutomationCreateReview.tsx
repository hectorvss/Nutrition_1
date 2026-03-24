import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check,
  Pencil,
  Repeat, 
  Clock, 
  Calendar, 
  Users, 
  Rocket, 
  Signal, 
  Wifi, 
  BatteryFull, 
  Send,
  Hand,
  AlertTriangle,
  PartyPopper,
  Cake,
  FileText,
  UserPlus,
  Smartphone,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAutomation } from '../context/AutomationContext';
import { useClient } from '../context/ClientContext';
import { AutomationDeliveryRules } from '../context/AutomationContext';

interface WizardData {
  triggerId: string;
  triggerName: string;
  message: string;
  deliveryRules: AutomationDeliveryRules;
  automationName: string;
  editingId?: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

interface AutomationCreateReviewProps {
  wizardData: WizardData;
  onBack: () => void;
  onActivate: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Hand, Repeat, AlertTriangle, PartyPopper, Cake, FileText, UserPlus, Smartphone, TrendingUp, Plus, ClipboardCheck: Check
};

function getPreviewText(text: string) {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (/^\{[^}]+\}$/.test(part)) {
      return <span key={i} className="text-emerald-500 font-semibold">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AutomationCreateReview({ wizardData, onBack, onActivate }: AutomationCreateReviewProps) {
  const { addAutomation, updateAutomation } = useAutomation();
  const { clients } = useClient();
  const [automationName, setAutomationName] = useState(wizardData.automationName);
  const [isEditingName, setIsEditingName] = useState(false);
  const activeClients = clients.filter(c => c.status === 'Active');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleActivate = () => {
    const payload = {
      name: automationName || wizardData.triggerName,
      desc: wizardData.triggerName,
      trigger: wizardData.triggerName,
      triggerId: wizardData.triggerId,
      message: wizardData.message,
      deliveryRules: wizardData.deliveryRules,
      enabled: true,
      iconName: wizardData.iconName,
      iconBg: wizardData.iconBg,
      iconColor: wizardData.iconColor,
    };
    if (wizardData.editingId) {
      updateAutomation(wizardData.editingId, payload);
    } else {
      addAutomation(payload);
    }
    onActivate();
  };

  const { 
    frequency = 'Once', 
    frequencyValue = 1, 
    frequencyUnit = 'Days', 
    deliveryTime = 'Morning', 
    audience = 'All Clients', 
    stopCondition = false, 
    stopWhen = 'Goal Reached' 
  } = wizardData.deliveryRules || {};
  
  const frequencyLabel = frequency === 'Once' ? 'One-time message' : `Every ${frequencyValue} ${frequencyUnit}`;

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Message
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{wizardData.editingId ? 'Edit Automation' : 'Create New Automation'}</h1>
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
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs font-medium mt-2 text-emerald-500">Message</span>
              </div>
              <div className="w-16 md:w-24 h-1 bg-emerald-500 -ml-2 -mr-2 relative z-0"></div>
              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 text-sm">3</div>
                <span className="text-xs font-bold mt-2 text-emerald-500">Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 md:px-8 py-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Automation Summary</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Review your workflow settings before activation.</p>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left: Summary */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col gap-8">
                  {/* Name */}
                  <div className="group relative">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">Automation Name</label>
                    {isEditingName ? (
                      <div className="flex items-center gap-3">
                        <input 
                          autoFocus
                          value={automationName}
                          onChange={e => setAutomationName(e.target.value)}
                          onBlur={() => setIsEditingName(false)}
                          onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                          className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-emerald-500 focus:outline-none flex-1"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{automationName}</h3>
                        <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-emerald-500 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

                  {/* Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">1</div>
                        Step 1: Trigger
                      </h4>
                      <button onClick={onBack} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">Edit</button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${wizardData.iconBg} ${wizardData.iconColor} flex items-center justify-center flex-shrink-0`}>
                        <Repeat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{wizardData.triggerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automation fires when this trigger occurs.</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">2</div>
                        Step 2: Delivery Rules
                      </h4>
                      <button onClick={onBack} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Frequency</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{frequencyLabel}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Delivery Time</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{deliveryTime}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Recipients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">{audience}</span>
                          {audience === 'All Clients' && (
                            <span className="text-xs text-slate-500 dark:text-slate-500">({activeClients.length} active clients)</span>
                          )}
                        </div>
                        {stopCondition && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Stops when: <span className="font-medium">{stopWhen}</span></p>
                        )}
                        {wizardData.deliveryRules.activation_conditions?.some(c => c.enabled) && (
                          <div className="mt-3 flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activation Conditions:</span>
                            {wizardData.deliveryRules.activation_conditions.filter(c => c.enabled).map((c, i) => (
                              <p key={i} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                If {c.type} {c.operator} {c.value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">3</div>
                        Message
                      </h4>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {getPreviewText(wizardData.message)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Phone preview */}
              <div className="lg:w-[400px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 flex flex-col items-center justify-center relative">
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Preview Mode</div>
                <div className="w-[300px] bg-white dark:bg-slate-900 rounded-[3rem] border-8 border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col transform scale-90 sm:scale-100 origin-top" style={{ height: 560 }}>
                  <div className="bg-slate-100 dark:bg-slate-800 h-14 flex items-center px-6 pt-2 justify-between shrink-0">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">{currentTime}</span>
                    <div className="flex gap-1.5">
                      <Signal className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                      <Wifi className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                      <BatteryFull className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="w-full flex-1 bg-[#F4F6FA] dark:bg-slate-900 pt-4 flex flex-col overflow-hidden">
                    <div className="text-[10px] text-center text-slate-400 font-medium mb-4">Today {currentTime}</div>
                    <div className="px-4 flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-hide">
                      <div className="self-start max-w-[90%] bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {getPreviewText(wizardData.message)}
                      </div>
                    </div>
                    <div className="p-4 mt-auto">
                      <div className="bg-white dark:bg-slate-800 h-12 rounded-full shadow-sm flex items-center px-4 justify-between border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 text-xs">Message...</span>
                        <Send className="w-5 h-5 text-emerald-500 cursor-pointer" />
                      </div>
                    </div>
                    <div className="h-1 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2"></div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-b-2xl z-20"></div>
                </div>
              </div>
            </div>

            <div className="px-6 md:px-8 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors">
                Back
              </button>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline-block">Ready to go live</span>
                <button 
                  onClick={handleActivate}
                  className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  {wizardData.editingId ? 'Save Changes' : 'Activate Automation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
