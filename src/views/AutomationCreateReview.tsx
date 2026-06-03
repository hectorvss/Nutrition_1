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
import { useLanguage } from '../context/LanguageContext';
import WizardStepper from '../components/automations/WizardStepper';

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
  const { t } = useLanguage();
  const { addAutomation, updateAutomation } = useAutomation();
  const { clients } = useClient();
  const [automationName, setAutomationName] = useState(wizardData.automationName);
  const [isEditingName, setIsEditingName] = useState(false);
  const activeClients = clients.filter(c => c.status === 'Active');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleActivate = () => {
    const payload = {
      name: automationName || wizardData.triggerName,
      description: wizardData.triggerName,
      trigger_id: wizardData.triggerId,
      message: wizardData.message,
      delivery_rules: wizardData.deliveryRules,
      enabled: true,
      icon_info: {
        iconName: wizardData.iconName,
        iconBg: wizardData.iconBg,
        iconColor: wizardData.iconColor,
      },
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
    selected_client_ids = [],
    activation_conditions = [],
    stop_conditions = []
  } = wizardData.deliveryRules || {};

  // Full action flow — falls back to a single message step for legacy data.
  const flowSteps: any[] = Array.isArray((wizardData.deliveryRules as any)?.steps) && (wizardData.deliveryRules as any).steps.length > 0
    ? (wizardData.deliveryRules as any).steps
    : [{ kind: 'message', message: wizardData.message }];
  const messageSteps = flowSteps.filter(s => s.kind === 'message' && s.message?.trim());
  const STEP_LABEL: Record<string, string> = {
    message: 'Enviar mensaje', wait: 'Esperar / pausa', create_task: 'Escalada (tarea)',
    set_field: 'Etiquetar cliente', stop_if: 'Parar si…', notify_coach: 'Notificar al coach',
    create_event: 'Agendar evento', assign_checkin: 'Asignar check-in',
    assign_onboarding: 'Asignar onboarding',
  };
  const describeStep = (s: any): string => {
    switch (s.kind) {
      case 'message':       return s.message || '(mensaje vacío)';
      case 'wait':          return `Esperar ${s.amount} ${s.unit === 'hours' ? 'horas' : 'días'}${s.cancelIfReplied ? ' (cancela si responde)' : ''}`;
      case 'create_task':   return `Tarea: ${s.title || '(sin título)'} · prioridad ${s.priority || 'media'}`;
      case 'set_field':     return `${s.field} = ${s.value}`;
      case 'stop_if':       return `Parar si ${s.conditionType} ${s.operator} ${s.value}`;
      case 'notify_coach':  return `Notificación: ${s.title || '(sin título)'}`;
      case 'create_event':  return `Evento "${s.title || '(sin título)'}" (${s.eventType || 'Call'}) en ${s.offsetDays ?? 0} días a las ${s.time || '09:00'}`;
      case 'assign_checkin':return `Asignar plantilla de check-in${s.templateId ? '' : ' (sin elegir)'}`;
      case 'assign_onboarding':return `Asignar formulario de onboarding${s.templateId ? '' : ' (sin elegir)'}`;
      default:              return '';
    }
  };
  
  const frequencyLabel = frequency === 'Once' ? t('one_time_message') : `${t('every')} ${frequencyValue} ${t(frequencyUnit.toLowerCase())}`;

  const selectedClients = clients.filter(c => selected_client_ids.includes(c.id));

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                {t('back_to_message')}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{wizardData.editingId ? t('edit_automation') : t('create_new_automation')}</h1>
          </div>
          <WizardStepper currentStep={3} labels={[t('trigger_label'), t('message_label'), t('review')]} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 md:px-8 py-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('automation_summary')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('review_before_activation')}</p>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left: Summary */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col gap-8">
                  {/* Name */}
                  <div className="group relative">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 block">{t('automation_name')}</label>
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
                        {t('step_1_trigger')}
                      </h4>
                      <button onClick={onBack} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">{t('edit')}</button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${wizardData.iconBg} ${wizardData.iconColor} flex items-center justify-center flex-shrink-0`}>
                        <Repeat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{wizardData.triggerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('automation_fires_when_trigger')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">2</div>
                        {t('step_2_delivery_rules')}
                      </h4>
                      <button onClick={onBack} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">{t('edit')}</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">{t('frequency')}</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{frequencyLabel}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">{t('delivery_time')}</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{deliveryTime}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">{t('recipients')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">{audience}</span>
                          {audience === 'All Clients' && (
                            <span className="text-xs text-slate-500 dark:text-slate-500">({activeClients.length} {t('active_clients').toLowerCase()})</span>
                          )}
                          {audience === 'Specific Clients' && (
                            <span className="text-xs text-slate-500 dark:text-slate-500">({t('selected_users_count', { count: selectedClients.length })})</span>
                          )}
                        </div>
                        
                        {audience === 'Specific Clients' && selectedClients.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedClients.map(c => (
                              <span key={c.id} className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activation_conditions.some(c => c.enabled) && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('activation_triggers')}:</span>
                              <div className="flex flex-col gap-1">
                                {activation_conditions.filter(c => c.enabled).map((c, i) => (
                                  <p key={i} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    {c.type}: {c.operator} {c.value}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {stop_conditions.some(c => c.enabled) && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('stop_conditions')}:</span>
                              <div className="flex flex-col gap-1">
                                {stop_conditions.filter(c => c.enabled).map((c, i) => (
                                  <p key={i} className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-rose-500" />
                                    {c.type}: {c.operator} {c.value}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full action flow */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">3</div>
                        {t('automation_flow', { defaultValue: 'Flujo de acciones' })}
                      </h4>
                      <button onClick={onBack} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">{t('edit')}</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {flowSteps.map((s, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{STEP_LABEL[s.kind] || s.kind}</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                              {s.kind === 'message' ? getPreviewText(s.message || '') : describeStep(s)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Phone preview */}
              <div className="lg:w-[400px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 flex flex-col items-center justify-center relative">
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('preview_mode')}</div>
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
                    <div className="text-[10px] text-center text-slate-400 font-medium mb-4">{t('today')} {currentTime}</div>
                    <div className="px-4 flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-hide">
                      {messageSteps.length > 0 ? messageSteps.map((s, i) => (
                        <div key={i} className="self-start max-w-[90%] bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                          {getPreviewText(s.message)}
                        </div>
                      )) : (
                        <div className="self-center text-xs text-slate-400 italic mt-8">
                          {t('message_preview_placeholder', { defaultValue: 'El mensaje aparecerá aquí' })}
                        </div>
                      )}
                    </div>
                    <div className="p-4 mt-auto">
                      <div className="bg-white dark:bg-slate-800 h-12 rounded-full shadow-sm flex items-center px-4 justify-between border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 text-xs">{t('message_label')}...</span>
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
                {t('back')}
              </button>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline-block">{t('ready_to_go_live')}</span>
                <button 
                  onClick={handleActivate}
                  className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  {wizardData.editingId ? t('save_changes') : t('activate_automation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
