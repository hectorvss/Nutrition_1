import React from 'react';
import { Camera } from 'lucide-react';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../../types/checkIn';
import { useLanguage } from '../../context/LanguageContext';

interface CheckInReviewRendererProps {
  template: CheckInTemplate;
  answers: Record<string, any>;
  isClient?: boolean;
}

export default function CheckInReviewRenderer({ template, answers, isClient = false }: CheckInReviewRendererProps) {
  const { t } = useLanguage();
  const steps = template.templateSchema || [];

  const SectionWrapper = ({ title, subtitle, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 mb-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">{icon || 'description'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className={`grid gap-x-8 gap-y-6 ${!isClient ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value, type }: any) => {
    const isEmpty = value === undefined || value === null || value === '';
    
    return (
      <div className={`w-full ${type === 'long_text' ? 'md:col-span-2' : ''}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <div className={`p-3.5 rounded-xl border border-slate-100 dark:border-slate-700
          ${isEmpty ? 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {isEmpty ? (
              <span className="text-slate-300 dark:text-slate-600 italic font-medium">{t('no_response_provided')}</span>
            ) : Array.isArray(value) ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {value.map((v: string) => (
                  <span key={v} className="px-3 py-1 bg-[#17cf54]/10 text-[#17cf54] rounded-lg text-[11px] font-bold uppercase">{v}</span>
                ))}
              </div>
            ) : (
              value
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (q: CheckInQuestion) => {
    // Handle special multi-question types
    if (q.type === 'photo_group') {
      return (
        <div key={q.id} className="w-full md:col-span-2 mt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{q.title || t('photos')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['front', 'side', 'back'].map(pos => {
              const photoKey = `${q.id}_${pos}`;
              const photoUrl = answers[photoKey];
              return (
                <div key={pos} className="aspect-[3/4] rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={pos} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-bold uppercase">{pos}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (q.type === 'measurement_group') {
       return (
         <div key={q.id} className="w-full md:col-span-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{q.title || t('measurements')}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {(q.options || []).map(opt => (
                 <div key={opt} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 truncate">{opt}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                       {answers[opt] ? `${answers[opt]}cm` : '—'}
                    </p>
                 </div>
               ))}
            </div>
         </div>
       );
    }

    // Default question types
    let displayValue = answers[q.id];
    if (q.type === 'number' && !isEmpty(displayValue) && q.unit) {
      displayValue = `${displayValue} ${q.unit}`;
    }

    // Handle conditional visibility
    if (q.conditional) {
       const { field, operator, value } = q.conditional;
       const fieldValue = answers[field];
       let isVisible = false;
       if (operator === 'equals') isVisible = fieldValue === value;
       else if (operator === 'not_equals') isVisible = fieldValue !== value;
       else if (operator === 'contains') isVisible = (fieldValue || []).includes(value);
       
       if (!isVisible) return null;
    }

    if (q.type === 'slider') {
      const val = answers[q.id];
      return (
        <div key={q.id} className="w-full space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.title}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#17cf54] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-500/20">
                   {val || '—'}
                </div>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#17cf54]" 
                     style={{ width: val ? `${(val / (q.meta?.max || 10)) * 100}%` : '0%' }}
                   />
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <InfoField 
        key={q.id} 
        label={q.title} 
        value={displayValue} 
        type={q.type}
      />
    );
  };

  const isEmpty = (val: any) => val === undefined || val === null || val === '';

  return (
    <>
      {steps.map((step: CheckInStep) => (
        <SectionWrapper 
          key={step.id} 
          title={step.title} 
          subtitle={step.subtitle} 
          icon={step.meta?.icon}
        >
          {(step.questions || []).map(q => renderQuestion(q))}
          {step.type === 'info_card' && (
            <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-400 text-sm">
               {step.subtitle || t('information_card')}
            </div>
          )}
        </SectionWrapper>
      ))}
    </>
  );
}
