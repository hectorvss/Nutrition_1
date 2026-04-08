import React from 'react';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Type, 
  CheckSquare, 
  Hash, 
  Info, 
  X,
  PlusCircle,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CheckInStep, CheckInQuestion, CheckInStepType } from '../../types/checkIn';
import { useLanguage } from '../../context/LanguageContext';

interface EditableStepCardProps {
  step: CheckInStep;
  index: number;
  onUpdate: (updatedStep: CheckInStep) => void;
  onRemove: () => void;
}

const QUESTION_TYPES: { id: CheckInStepType; label: string; icon: any }[] = [
  { id: 'single_choice', label: 'Single Choice', icon: <div className="w-5 h-5 rounded-full border-2 border-slate-300" /> },
  { id: 'multi_select', label: 'Multi Choice', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'number', label: 'Number Input', icon: <Hash className="w-5 h-5" /> },
  { id: 'text', label: 'Short Text', icon: <Type className="w-5 h-5" /> },
  { id: 'long_text', label: 'Long Text', icon: <Type className="w-5 h-5" /> },
  { id: 'info_card', label: 'Information Card', icon: <Info className="w-5 h-5" /> },
  { id: 'measurement_group', label: 'Measurements', icon: <Layout className="w-5 h-5" /> },
  { id: 'photo_group', label: 'Photo Uploads', icon: <Type className="w-5 h-5" /> },
];

export default function EditableStepCard({ step, index, onUpdate, onRemove }: EditableStepCardProps) {
  const { t } = useLanguage();
  const getTypeLabel = (id: CheckInStepType, fallback: string) => t(`question_type_${id}`, { defaultValue: fallback });
  
  const updateStepField = (field: keyof CheckInStep, value: any) => {
    onUpdate({ ...step, [field]: value });
  };

  const updateQuestion = (qIndex: number, updates: Partial<CheckInQuestion>) => {
    const newQuestions = [...(step.questions || [])];
    newQuestions[qIndex] = { ...newQuestions[qIndex], ...updates };
    updateStepField('questions', newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: CheckInQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: t('new_question'),
      type: 'single_choice',
      required: true,
      options: [t('option_1'), t('option_2')]
    };
    updateStepField('questions', [...(step.questions || []), newQuestion]);
  };

  const removeQuestion = (qIndex: number) => {
    const newQuestions = (step.questions || []).filter((_, i) => i !== qIndex);
    updateStepField('questions', newQuestions);
  };

  const addOption = (qIndex: number) => {
    const q = step.questions![qIndex];
    const newOptions = [...(q.options || []), `${t('option_label')} ${(q.options || []).length + 1}`];
    updateQuestion(qIndex, { options: newOptions });
  };

  const updateOption = (qIndex: number, optIndex: number, newValue: string) => {
    const q = step.questions![qIndex];
    const newOptions = [...(q.options || [])];
    newOptions[optIndex] = newValue;
    updateQuestion(qIndex, { options: newOptions });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = step.questions![qIndex];
    const newOptions = (q.options || []).filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options: newOptions });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8 group/step hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-500 transition-colors shrink-0">
          <GripVertical className="w-6 h-6" />
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm border shrink-0 ${
          step.questions?.length ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={step.title}
            onChange={(e) => updateStepField('title', e.target.value)}
            placeholder={t('step_title_placeholder_with_example')}
            className="w-full bg-transparent border-none text-xl font-bold text-slate-900 dark:text-white focus:ring-0 p-0 placeholder:text-slate-300"
          />
        </div>
        <button 
          onClick={onRemove}
          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all opacity-0 group-hover/step:opacity-100"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 space-y-10">
        {/* Step Context */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">{t('category_subtitle_instructions')}</label>
          <textarea 
            value={step.subtitle || ''}
            onChange={(e) => updateStepField('subtitle', e.target.value)}
            placeholder={t('briefly_explain_section')}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-5 text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none min-h-[100px]"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {(step.questions || []).map((q, qIdx) => (
            <div key={q.id} className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 group/q relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={q.title}
                    onChange={(e) => updateQuestion(qIdx, { title: e.target.value })}
                    className="w-full bg-transparent border-none font-bold text-lg text-slate-900 dark:text-white focus:ring-0 p-0"
                    placeholder={t('enter_question_here')}
                  />
                  <input 
                    type="text" 
                    value={q.subtitle || ''}
                    onChange={(e) => updateQuestion(qIdx, { subtitle: e.target.value })}
                    className="w-full bg-transparent border-none text-xs font-medium text-slate-400 focus:ring-0 p-0 mt-1"
                    placeholder={t('add_optional_subtitle_instruction')}
                  />
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                   <select 
                     value={q.type}
                     onChange={(e) => updateQuestion(qIdx, { type: e.target.value as any })}
                     className="bg-transparent border-none rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 py-2 pl-3 pr-10 focus:ring-0 cursor-pointer"
                   >
                     {QUESTION_TYPES.map(t => (
                       <option key={t.id} value={t.id}>{getTypeLabel(t.id, t.label)}</option>
                     ))}
                   </select>
                   <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
                   <button 
                     onClick={() => removeQuestion(qIdx)}
                     className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Options (Bubbles) */}
              {(q.type === 'single_choice' || q.type === 'multi_select') && (
                <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                   <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-bold">{t('answer_bubbles')}</p>
                      <span className="text-[9px] text-slate-300 font-bold uppercase">{t('click_edit_bubble_text')}</span>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {(q.options || []).map((opt, optIdx) => (
                       <div key={optIdx} className="group/opt relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-2.5 hover:border-emerald-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 w-auto min-w-[80px]"
                            style={{ width: `${Math.max(opt.length, 10)}ch` }}
                          />
                          <button 
                            onClick={() => removeOption(qIdx, optIdx)}
                            className="ml-3 text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                     <button 
                       onClick={() => addOption(qIdx)}
                       className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all text-sm font-bold"
                     >
                       <PlusCircle className="w-5 h-5" />
                       {t('add_bubble')}
                     </button>
                   </div>
                </div>
              )}

              {/* Number Unit */}
              {q.type === 'number' && (
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl w-fit">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('unit_label')}:</span>
                  <input 
                    type="text" 
                    value={q.unit || ''}
                    onChange={(e) => updateQuestion(qIdx, { unit: e.target.value })}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white py-2 px-4 w-20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    placeholder="kg"
                  />
                </div>
              )}
            </div>
          ))}

          <button 
            onClick={addQuestion}
            className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/5 transition-all flex items-center justify-center gap-3 text-sm font-bold"
          >
            <Plus className="w-5 h-5" />
            {t('add_question_to_card')}
          </button>
        </div>
      </div>
    </div>
  );
}
