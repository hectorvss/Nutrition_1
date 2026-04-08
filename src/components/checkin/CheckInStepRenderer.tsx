import React from 'react';
import { 
  CheckInStep, 
  CheckInQuestion 
} from '../../types/checkIn';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Chip, 
  OptionCard, 
  Section, 
  FieldLabel 
} from './CheckInUIPrimitives';

interface CheckInStepRendererProps {
  step: CheckInStep;
  answers: Record<string, any>;
  onUpdateAnswer: (key: string, value: any) => void;
  onToggleArrayItem: (key: string, item: string) => void;
  onUploadFile?: (key: string, file: File) => Promise<void>;
  isEditMode?: boolean;
}

export default function CheckInStepRenderer({ 
  step, 
  answers, 
  onUpdateAnswer, 
  onToggleArrayItem,
  onUploadFile,
  isEditMode = false
}: CheckInStepRendererProps) {
  const { t } = useLanguage();
  
  // Render based on step type
  const renderQuestions = () => {
    return (step.questions || []).map((q: CheckInQuestion) => {
      // 0. Process Conditionals
      if (q.conditional) {
        const { field, operator, value } = q.conditional;
        const fieldValue = answers[field];
        
        let isVisible = false;
        if (operator === 'equals') isVisible = fieldValue === value;
        else if (operator === 'not_equals') isVisible = fieldValue !== value;
        else if (operator === 'contains') isVisible = (fieldValue || []).includes(value);

        if (!isVisible) return null;
      }

      // 0.5 Skip Hidden Questions
      if (q.hidden) return null;

      const value = answers[q.id];
      
      switch (q.type) {
        case 'single_choice':
          return (
            <div key={q.id}>
              <FieldLabel>{q.title}</FieldLabel>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(q.options || []).map(opt => (
                  <OptionCard 
                    key={opt} 
                    label={opt} 
                    selected={value === opt} 
                    onClick={() => !isEditMode && onUpdateAnswer(q.id, opt)}
                    disabled={isEditMode}
                  />
                ))}
              </div>
            </div>
          );

        case 'multi_select':
          return (
            <div key={q.id}>
              <FieldLabel>{q.title}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(q.options || []).map(opt => (
                  <Chip 
                    key={opt} 
                    label={opt} 
                    selected={(value || []).includes(opt)} 
                    onClick={() => !isEditMode && onToggleArrayItem(q.id, opt)}
                    disabled={isEditMode}
                  />
                ))}
              </div>
            </div>
          );

        case 'number':
          return (
            <div key={q.id}>
              <FieldLabel>{q.title}</FieldLabel>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder={q.placeholder || t('number_placeholder')} 
                  value={value || ''} 
                  onChange={e => !isEditMode && onUpdateAnswer(q.id, e.target.value)}
                  disabled={isEditMode}
                  className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-3 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-200" 
                />
                {q.meta?.unit && (
                  <div className="absolute right-0 bottom-4 text-lg font-bold text-slate-300 uppercase tracking-widest">{q.meta.unit}</div>
                )}
              </div>
            </div>
          );

        case 'text':
        case 'long_text':
          return (
            <div key={q.id}>
              <FieldLabel>{q.title}</FieldLabel>
              <textarea 
                placeholder={q.placeholder || t('enter_your_response')} 
                value={value || ''} 
                onChange={e => !isEditMode && onUpdateAnswer(q.id, e.target.value)}
                disabled={isEditMode}
                className={`w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm
                  ${q.type === 'long_text' ? 'min-h-[120px]' : 'min-h-[80px]'}`} 
              />
            </div>
          );

        case 'slider':
          const min = q.meta?.min ?? 1;
          const max = q.meta?.max ?? 10;
          const stepVal = q.meta?.step ?? 1;
          const currentValue = value || min;

          return (
            <div key={q.id} className="space-y-6">
              <div className="flex justify-between items-end">
                <FieldLabel>{q.title}</FieldLabel>
                <div className="bg-[#17cf54] text-white px-4 py-1 rounded-full text-xl font-black shadow-lg shadow-emerald-500/20">
                  {currentValue}
                </div>
              </div>
              <div className="relative pt-6 pb-2">
                <input 
                  type="range"
                  min={min}
                  max={max}
                  step={stepVal}
                  value={currentValue}
                  disabled={isEditMode}
                  onChange={e => !isEditMode && onUpdateAnswer(q.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#17cf54]"
                />
                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{min}</span>
                  <span>{Math.round((min + max) / 2)}</span>
                  <span>{max}</span>
                </div>
              </div>
            </div>
          );

        case 'photo_group':
          return (
            <div key={q.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'front', label: t('front') },
                { key: 'side', label: t('side') },
                { key: 'back', label: t('back_muscle') }
              ].map(({ key, label }) => {
                const photoKey = `${q.id}_${key}`;
                const photoValue = answers[photoKey];
                return (
                  <div key={key} className="space-y-3">
                     <FieldLabel>{label} {t('view_label')}</FieldLabel>
                     <div className="relative aspect-[3/4] bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-emerald-400">
                        {photoValue ? (
                          <>
                            <img src={photoValue} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => !isEditMode && onUpdateAnswer(photoKey, null)}
                                className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500/80"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                             <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">add_a_photo</span>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('upload_label')} {label}</p>
                             <input 
                               type="file" 
                               accept="image/*"
                               disabled={isEditMode}
                               onChange={async (e) => {
                                 if (!isEditMode && e.target.files?.[0] && onUploadFile) {
                                   await onUploadFile(photoKey, e.target.files[0]);
                                 }
                               }}
                               className="absolute inset-0 opacity-0 cursor-pointer" 
                             />
                          </div>
                        )}
                     </div>
                  </div>
                );
              })}
            </div>
          );

        case 'measurement_group':
          return (
            <div key={q.id} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(q.options || []).map(opt => (
                <div key={opt} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{opt}</p>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={answers[opt] || ''}
                      disabled={isEditMode}
                      onChange={e => !isEditMode && onUpdateAnswer(opt, e.target.value)}
                      className="w-full text-xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white p-0"
                    />
                    <span className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-300 uppercase">cm</span>
                  </div>
                </div>
              ))}
            </div>
          );

        default:
          return null;
      }
    });
  };

  const renderGroupedContent = () => {
    // Only use the measurement_group grid layout when the step itself is typed as one
    // AND the questions inside don't have their own type (i.e., they're raw measurement fields, not typed questions)
    const questionsHaveTypes = (step.questions || []).some((q: any) => q.type);
    if (step.type === 'measurement_group' && !questionsHaveTypes) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(step.questions || []).map((q: any) => (
            <div key={q.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{q.title}</p>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={answers[q.id] || ''}
                  disabled={isEditMode}
                  onChange={e => !isEditMode && onUpdateAnswer(q.id, e.target.value)}
                  className="w-full text-xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white p-0"
                />
                <span className="absolute right-0 bottom-0 text-[10px] font-bold text-slate-300 uppercase">{q.unit || 'cm'}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return renderQuestions();
  };

  return (
    <Section title={step.title} subtitle={step.subtitle} icon={step.meta?.icon}>
      <div className="space-y-8">
        {renderGroupedContent()}
        {step.type === 'info_card' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">info</span>
            <p className="text-sm text-slate-500 font-medium">{step.subtitle || t('information_step_for_client')}</p>
          </div>
        )}
      </div>
    </Section>
  );
}
