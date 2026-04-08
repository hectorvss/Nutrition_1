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
  Copy,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../types/checkIn';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import CheckInQuestionEditorCard from '../components/checkin/CheckInQuestionEditorCard';
import { Reorder, AnimatePresence, motion } from 'framer-motion';

interface CheckInTemplateEditorProps {
  templateId: string;
  onClose: () => void;
  onSave?: (template: CheckInTemplate) => void;
}

export default function CheckInTemplateEditor({ templateId, onClose, onSave }: CheckInTemplateEditorProps) {
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
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/check-ins/manager/checkin-templates`);
        const found = data.find((t: any) => t.id === templateId);
        if (found) {
          setTemplate({
            ...found,
            templateSchema: found.template_schema || found.templateSchema || []
          });
        } else {
          setError(t('template_not_found'));
        }
      } catch (err) {
        setError(t('error_loading_template'));
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, [templateId, t]);

  const handleSave = async () => {
    if (!template) return;
    setIsSaving(true);
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${templateId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: template.name,
          template_schema: template.templateSchema,
          is_active: true
        })
      });
      if (onSave) onSave(template);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(t('error_saving_template'));
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
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

  const duplicateQuestion = (stepIdx: number, qIdx: number) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    const qToCopy = newSchema[stepIdx].questions![qIdx];
    const newQ = { ...qToCopy, id: `q_${Date.now()}_copy` };
    const newQs = [...(newSchema[stepIdx].questions || [])];
    newQs.splice(qIdx + 1, 0, newQ);
    newSchema[stepIdx] = { ...newSchema[stepIdx], questions: newQs };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const handleReorderSteps = (newOrder: CheckInStep[]) => {
    if (!template) return;
    const selectedStep = template.templateSchema[selectedStepIndex];
    if (selectedStep) {
      const newIdx = newOrder.findIndex(s => s.id === selectedStep.id);
      if (newIdx !== -1) setSelectedStepIndex(newIdx);
    }
    setTemplate({ ...template, templateSchema: newOrder });
  };

  const handleReorderQuestions = (newOrder: CheckInQuestion[]) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    newSchema[selectedStepIndex] = { ...newSchema[selectedStepIndex], questions: newOrder };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!template || error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm m-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">{error || t('something_went_wrong')}</h3>
        <button onClick={onClose} className="mt-4 text-emerald-600 font-bold hover:underline">{t('return_to_library')}</button>
      </div>
    );
  }

  const selectedStep = template.templateSchema[selectedStepIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="bg-transparent border-none text-xl font-bold text-slate-900 dark:text-white p-0 focus:ring-0 outline-none focus:outline-none focus:border-none min-w-[200px]"
            />
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.theme_color }} />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('protocol_builder')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ backgroundColor: settings.theme_color }}
            className="text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-slate-900/10 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5 text-white/80" /> : <Save className="w-5 h-5" />)}
            {isSaving ? t('saving') : t('save_template')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-80 flex flex-col m-6 mr-0">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('step_sequence')}</h3>
              <button 
                onClick={addStep} 
                style={{ color: settings.theme_color, backgroundColor: `${settings.theme_color}10` }}
                className="p-2 rounded-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <Reorder.Group axis="y" values={template.templateSchema} onReorder={handleReorderSteps} className="space-y-2">
                <AnimatePresence initial={false}>
                  {template.templateSchema.map((step, idx) => (
                    <Reorder.Item 
                      key={step.id} 
                      value={step}
                      // EXACT mechanism as the central canvas "mother card"
                      transition={{ type: "tween", duration: 0.15 }}
                      whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                      className={`group flex items-center gap-1 p-3.5 rounded-2xl cursor-pointer transition-all border-2
                        ${selectedStepIndex === idx 
                          ? 'shadow-lg border-transparent' 
                          : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700'}`}
                      style={selectedStepIndex === idx ? { backgroundColor: settings.theme_color, color: 'white' } : {}}
                      onClick={() => setSelectedStepIndex(idx)}
                    >
                      <div className={`p-1.5 ${selectedStepIndex === idx ? 'text-white/40' : 'text-slate-300'} transition-opacity`}>
                         <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold truncate tracking-tight">{step.title}</span>
                      </div>
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                          ${selectedStepIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >
                        {idx + 1}
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
               <button 
                 onClick={addStep}
                 className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all text-xs font-semibold flex items-center justify-center gap-2"
               >
                 <PlusCircle className="w-4 h-4" />
                 {t('add_new_step')}
               </button>
            </div>
          </div>
        </div>

        {/* CENTER CANVAs */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-8 pb-32">
            
            {selectedStep && (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={selectedStep.title}
                        onChange={(e) => updateStep(selectedStepIndex, { title: e.target.value })}
                        placeholder={t('step_title_placeholder')}
                        className="w-full bg-transparent border-none p-0 text-3xl font-bold tracking-tight text-slate-900 dark:text-white focus:ring-0 outline-none focus:outline-none focus:border-none placeholder:text-slate-200"
                      />
                      <textarea 
                        value={selectedStep.subtitle || ''}
                        onChange={(e) => updateStep(selectedStepIndex, { subtitle: e.target.value })}
                        placeholder={t('instructions_placeholder')}
                        className="w-full bg-transparent border-none p-0 text-lg font-medium text-slate-400 focus:ring-0 outline-none focus:outline-none focus:border-none resize-none h-14 placeholder:text-slate-200 shadow-none border-transparent ring-0"
                      />
                    </div>
                    <button 
                      onClick={() => removeStep(selectedStepIndex)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all shrink-0"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                    <Reorder.Group axis="y" values={selectedStep.questions || []} onReorder={handleReorderQuestions} className="space-y-6">
                      <AnimatePresence initial={false}>
                        {(selectedStep.questions || []).map((q, qIdx) => (
                          <Reorder.Item key={q.id} value={q} className="relative" transition={{ type: "tween", duration: 0.15 }}>
                            <CheckInQuestionEditorCard 
                              question={q}
                              onUpdate={(updates) => updateQuestion(selectedStepIndex, qIdx, updates)}
                              onDelete={() => removeQuestion(selectedStepIndex, qIdx)}
                              onDuplicate={() => duplicateQuestion(selectedStepIndex, qIdx)}
                            />
                          </Reorder.Item>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>

                    <button 
                      onClick={() => addQuestion(selectedStepIndex)}
                      style={{ borderColor: `${settings.theme_color}30` }}
                      className="w-full py-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/5 transition-all flex flex-col items-center justify-center gap-2 group/add"
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-800 group-hover/add:scale-110" style={{ color: settings.theme_color }}>
                         <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: `${settings.theme_color}80` }}>{t('add_question')}</span>
                    </button>
                  </div>
                </div>

                {/* Navigation Button */}
                {selectedStepIndex < template.templateSchema.length - 1 && (
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => setSelectedStepIndex(selectedStepIndex + 1)}
                      style={{ backgroundColor: `${settings.theme_color}10`, color: settings.theme_color }}
                      className="flex items-center gap-4 px-10 py-5 rounded-[2rem] text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm border border-transparent hover:border-current bg-white dark:bg-slate-900"
                    >
                      {t('next_block', { title: template.templateSchema[selectedStepIndex + 1].title })}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {!selectedStep && (
               <div className="py-40 text-center space-y-6">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                     <LayoutGrid className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t('empty_flow')}</h3>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
