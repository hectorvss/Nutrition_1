import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  GripVertical, 
  PlusCircle,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../types/checkIn';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import CheckInQuestionEditorCard from '../components/checkin/CheckInQuestionEditorCard';
import { Reorder, AnimatePresence } from 'framer-motion';

interface OnboardingFlowEditorProps {
  flowId?: string;
  onBack: () => void;
}

export default function OnboardingFlowEditor({ flowId, onBack }: OnboardingFlowEditorProps) {
  const { settings } = useTheme();
  const { t } = useLanguage();
  const [template, setTemplate] = useState<CheckInTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      if (!flowId) {
          setIsLoading(false);
          return;
      }
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/onboarding/manager/templates`);
        const found = data.find((t: any) => t.id === flowId);
        if (found) {
          setTemplate({
            ...found,
            templateSchema: found.template_schema || found.templateSchema || []
          });
        } else {
          setError(t('flow_not_found'));
        }
      } catch (err) {
        setError(t('error_loading_flow'));
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, [flowId, t]);

  const handleSave = async () => {
    if (!template || !flowId) return;
    setIsSaving(true);
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${flowId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: template.name,
          template_schema: template.templateSchema,
          is_active: true
        })
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(t('error_saving_flow'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStep = (index: number, updates: Partial<CheckInStep>) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    newSchema[index] = { ...newSchema[index], ...updates };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const addStep = () => {
    if (!template) return;
    const newStep: CheckInStep = {
      id: `step_${Date.now()}`,
      title: t('new_step'),
      subtitle: t('optional_description'),
      questions: []
    };
    const newSchema = [...template.templateSchema, newStep];
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(newSchema.length - 1);
  };

  const removeStep = (index: number) => {
    if (!template || !confirm(t('confirm_action'))) return;
    const newSchema = template.templateSchema.filter((_, i) => i !== index);
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(Math.max(0, index - 1));
  };

  const updateQuestion = (stepIdx: number, qIdx: number, updates: Partial<CheckInQuestion>) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    const newQs = [...(newSchema[stepIdx].questions || [])];
    newQs[qIdx] = { ...newQs[qIdx], ...updates };
    newSchema[stepIdx] = { ...newSchema[stepIdx], questions: newQs };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const addQuestion = (stepIdx: number) => {
    if (!template) return;
    const newQ: CheckInQuestion = {
      id: `q_${Date.now()}`,
      title: t('new_question'),
      type: 'single_choice',
      required: true,
      options: [t('option_1'), t('option_2')]
    };
    const newSchema = [...template.templateSchema];
    newSchema[stepIdx] = { 
      ...newSchema[stepIdx], 
      questions: [...(newSchema[stepIdx].questions || []), newQ] 
    };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const removeQuestion = (stepIdx: number, qIdx: number) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    const newQs = (newSchema[stepIdx].questions || []).filter((_, i) => i !== qIdx);
    newSchema[stepIdx] = { ...newSchema[stepIdx], questions: newQs };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const handleReorderSteps = (newOrder: CheckInStep[]) => {
    if (!template) return;
    setTemplate({ ...template, templateSchema: newOrder });
  };

  const handleReorderQuestions = (newOrder: CheckInQuestion[]) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    newSchema[selectedStepIndex] = { ...newSchema[selectedStepIndex], questions: newOrder };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  
  if (error || (!template && flowId)) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm m-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">{error || t('flow_not_found')}</h3>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold hover:underline">{t('return_to_library')}</button>
      </div>
    );
  }

  // Handle new flow state if template is still null but we're not loading and have no error
  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center max-w-md">
           <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mb-6">
              <PlusCircle className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('create_new_flow')}</h2>
           <p className="text-slate-500 mb-8 font-medium">{t('initialize_flow_desc')}</p>
           <button 
            onClick={() => setTemplate({ id: 'new', name: t('create_new_flow'), templateSchema: [] })}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
           >
            {t('initialize_flow')}
           </button>
        </div>
      </div>
    );
  }

  const selectedStep = template.templateSchema[selectedStepIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm">
             <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="bg-transparent border-none text-xl font-bold text-slate-900 dark:text-white p-0 focus:ring-0 outline-none"
            />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('onboarding_flow_builder')}</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ backgroundColor: settings.theme_color }}
          className="text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
          {isSaving ? t('saving') : t('save_flow')}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex flex-col m-6 mr-0">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('sequence_label')}</h3>
              <button onClick={addStep} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <Reorder.Group axis="y" values={template.templateSchema} onReorder={handleReorderSteps} className="space-y-2">
                {template.templateSchema.map((step, idx) => (
                  <Reorder.Item 
                    key={step.id} 
                    value={step}
                    className={`group flex items-center gap-1 p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${selectedStepIndex === idx ? 'shadow-lg border-transparent' : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'}`}
                    style={selectedStepIndex === idx ? { backgroundColor: settings.theme_color, color: 'white' } : {}}
                    onClick={() => setSelectedStepIndex(idx)}
                  >
                    <GripVertical className="w-4 h-4 opacity-20" />
                    <span className="flex-1 text-xs font-bold truncate">{step.title}</span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedStepIndex === idx ? 'bg-white/20' : 'bg-slate-100'}`}>{idx + 1}</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-8 pb-32">
            {selectedStep && (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={selectedStep.title}
                      onChange={(e) => updateStep(selectedStepIndex, { title: e.target.value })}
                      placeholder={t('step_title_placeholder')}
                      className="w-full bg-transparent border-none text-3xl font-bold text-slate-900 dark:text-white focus:ring-0 outline-none"
                    />
                    <textarea 
                      value={selectedStep.subtitle || ''}
                      onChange={(e) => updateStep(selectedStepIndex, { subtitle: e.target.value })}
                      placeholder={t('instructions_placeholder')}
                      className="w-full bg-transparent border-none text-lg text-slate-400 focus:ring-0 outline-none resize-none h-14 shadow-none ring-0 border-none"
                    />
                  </div>
                  <button onClick={() => removeStep(selectedStepIndex)} className="p-3 text-slate-300 hover:text-red-500 rounded-2xl transition-all"><Trash2 className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <Reorder.Group axis="y" values={selectedStep.questions || []} onReorder={handleReorderQuestions} className="space-y-6">
                    {(selectedStep.questions || []).map((q, qIdx) => (
                      <Reorder.Item key={q.id} value={q}>
                        <CheckInQuestionEditorCard 
                          question={q}
                          onUpdate={(updates) => updateQuestion(selectedStepIndex, qIdx, updates)}
                          onDelete={() => removeQuestion(selectedStepIndex, qIdx)}
                          onDuplicate={() => {
                            if (!template) return;
                            const newSchema = [...template.templateSchema];
                            const qToCopy = newSchema[selectedStepIndex].questions![qIdx];
                            const newQ = { ...qToCopy, id: `q_${Date.now()}_copy` };
                            const newQs = [...(newSchema[selectedStepIndex].questions || [])];
                            newQs.splice(qIdx + 1, 0, newQ);
                            newSchema[selectedStepIndex] = { ...newSchema[selectedStepIndex], questions: newQs };
                            setTemplate({ ...template, templateSchema: newSchema });
                          }}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <button 
                    onClick={() => addQuestion(selectedStepIndex)}
                    className="w-full py-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 transition-all group-hover:scale-110" style={{ color: settings.theme_color }}><Plus className="w-6 h-6" /></div>
                    <span className="text-sm font-semibold uppercase tracking-widest">{t('add_question')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
