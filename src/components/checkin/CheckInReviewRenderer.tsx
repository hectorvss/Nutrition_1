import React from 'react';
import { Camera } from 'lucide-react';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../../types/checkIn';

interface CheckInReviewRendererProps {
  template: CheckInTemplate;
  answers: Record<string, any>;
  isClient?: boolean;
}

export default function CheckInReviewRenderer({ template, answers, isClient = false }: CheckInReviewRendererProps) {
  const steps = template.templateSchema || [];

  const SectionWrapper = ({ title, subtitle, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 mb-8">
      <div className="flex items-center gap-5 mb-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isClient ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-[#17cf54]'} dark:bg-slate-800`}>
          <span className="material-symbols-outlined text-3xl font-light">{icon || 'description'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className={`grid gap-x-10 gap-y-8 ${!isClient ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value, type }: any) => {
    const isEmpty = value === undefined || value === null || value === '';
    
    return (
      <div className={`w-full ${type === 'long_text' ? 'md:col-span-2' : ''} space-y-2`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</p>
        <div className={`p-4 rounded-2xl border transition-all hover:border-slate-200
          ${isEmpty ? 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-100 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
          <div className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
            {isEmpty ? (
              <span className="text-slate-300 dark:text-slate-700 italic font-medium">No response provided</span>
            ) : Array.isArray(value) ? (
              <div className="flex flex-wrap gap-2">
                {value.map((v: string) => (
                  <span key={v} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isClient ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30' : 'bg-emerald-50 text-[#17cf54] border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30'}`}>{v}</span>
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
        <div key={q.id} className="w-full md:col-span-2 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{q.title || 'Photos'}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['front', 'side', 'back'].map(pos => {
              const photoKey = `${q.id}_${pos}`;
              const photoUrl = answers[photoKey];
              return (
                <div key={pos} className="aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group">
                  {photoUrl ? (
                    <img src={photoUrl} alt={pos} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{pos}</span>
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
         <div key={q.id} className="w-full md:col-span-2 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{q.title || 'Measurements'}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {(q.options || []).map(opt => (
                 <div key={opt} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1 truncate">{opt}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                       {answers[opt] ? `${answers[opt]}${q.unit || 'cm'}` : '—'}
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
               {step.subtitle || 'Information card'}
            </div>
          )}
        </SectionWrapper>
      ))}
    </>
  );
}
