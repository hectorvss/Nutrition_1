import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { CheckInTemplate } from '../../types/checkIn';
import { DEFAULT_CHECKIN_TEMPLATE } from '../../constants/defaultCheckInTemplate';
import CheckInStepRenderer from '../../components/checkin/CheckInStepRenderer';
import { useLanguage } from '../../context/LanguageContext';

interface WeeklyCheckinFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

const compressImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function WeeklyCheckinFlow({ onComplete, onCancel }: WeeklyCheckinFlowProps) {
  const { t } = useLanguage();
  const [template, setTemplate] = useState<CheckInTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // Start directly at step 1
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth('/check-ins/client/active-template');
        if (data) {
          setTemplate({
            ...data,
            templateSchema: data.template_schema || data.templateSchema || []
          });
        } else {
          setTemplate(DEFAULT_CHECKIN_TEMPLATE);
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setTemplate(DEFAULT_CHECKIN_TEMPLATE);
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  const steps = template?.templateSchema || [];
  const totalSteps = steps.length;

  const updateAnswer = async (key: string, value: any) => {
    if (value === 'pending_upload') {
       // This is a special flag from the renderer for image uploads
       // Real implementation should probably have the input here or pass a handler
       // But for the sake of the refactor, we'll assume the input was clicked and we need to handle the file
       return;
    }
    setAnswers(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const handleFileChange = async (key: string, file: File) => {
    try {
      const compressed = await compressImage(file);
      setAnswers(prev => ({ ...prev, [key]: compressed }));
    } catch (err) {
      console.error('Image compression failed:', err);
    }
  };

  const toggleArrayItem = (key: string, item: string) => {
    setAnswers(prev => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(item)
          ? current.filter((i: string) => i !== item)
          : [...current, item]
      };
    });
  };

  const handleNext = () => {
    // Basic validation for required fields in the current step
    if (currentStep > 0 && currentStep <= totalSteps) {
      const currentStepData = steps[currentStep - 1];
      const hasMissingRequired = (currentStepData.questions || []).some(q => {
        if (!q.required) return false;
        const answer = answers[q.id];
        return !answer || (Array.isArray(answer) && answer.length === 0);
      });

      if (hasMissingRequired) {
        setValidationError(t('please_answer_required_before_continue'));
        return;
      }
    }

    if (currentStep <= totalSteps) {
      if (currentStep === totalSteps) {
        handleFinish();
      } else {
        setValidationError(null);
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/check-ins/client/submissions', {
        method: 'POST',
        body: JSON.stringify({
          template_id: template?.id,
          template_version: template?.version || 1,
          answers_json: answers
        })
      });
      onComplete();
    } catch (err) {
      alert(t('error_submitting_checkin'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI RENDERING ---


  // Page 1..N: Dynamic Step
  const stepData = steps[currentStep - 1];

  return (
    <div className="fixed inset-0 lg:left-64 z-[250] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header / Nav */}
      <div className="relative z-10 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
               <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />
            <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{t('checking_in')}</p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{template?.name || template?.title || t('weekly_progress')}</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('step_of_total', { current: currentStep, total: totalSteps })}</p>
               <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
               </div>
            </div>
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
               <span className="material-symbols-outlined">close</span>
            </button>
         </div>
      </div>

      {/* Main Form Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
         <div className="w-full space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <CheckInStepRenderer 
               step={stepData}
               answers={answers}
               onUpdateAnswer={updateAnswer}
               onToggleArrayItem={toggleArrayItem}
               onUploadFile={handleFileChange}
            />

            {validationError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in shake duration-300">
                <span className="material-symbols-outlined">error</span>
                {validationError}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleNext} 
                disabled={isSubmitting}
                className="text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/10 disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand-primary, #17cf54)' }}
              >
                <span className="text-lg">{isSubmitting ? t('submitting') : (currentStep === totalSteps ? t('checkin_submitted') : t('continue_label'))}</span>
                <span className="material-symbols-outlined text-[20px]">{currentStep === totalSteps ? 'task_alt' : 'arrow_forward'}</span>
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
