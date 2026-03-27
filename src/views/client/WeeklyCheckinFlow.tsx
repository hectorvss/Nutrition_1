import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { CheckInTemplate, CheckInStep } from '../../types/checkIn';
import { DEFAULT_CHECKIN_TEMPLATE } from '../../constants/defaultCheckInTemplate';
import { Section } from '../../components/checkin/CheckInUIPrimitives';
import CheckInStepRenderer from '../../components/checkin/CheckInStepRenderer';

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
  const [template, setTemplate] = useState<CheckInTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 0 = Intro, 1..N = Steps, N+1 = Finish
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
  const progress = Math.min(Math.round(((currentStep) / (totalSteps + 1)) * 100), 100);

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
        setValidationError('Please answer all required questions before continuing.');
        return;
      }
    }

    if (currentStep <= totalSteps) {
      setValidationError(null);
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      alert('Error submitting check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI RENDERING ---

  // Page 0: Intro
  if (currentStep === 0) {
    return (
      <div className="flex-1 flex flex-col p-6 md:p-10 bg-slate-50 dark:bg-slate-900 scroll-smooth overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">{template?.name || template?.title || 'Weekly Progress Review'}</h3>
               <span className="text-xs font-black px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg uppercase tracking-widest border border-amber-100 dark:border-amber-900/30">Action Required</span>
             </div>
             <div className="space-y-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                  <span className="material-symbols-outlined text-emerald-500 mt-1">info</span>
                  <p className="text-emerald-900 dark:text-emerald-400 text-sm font-medium leading-relaxed">
                    Detailed feedback is the engine of your transformation. Take 5 minutes to update your coach on your energy, mood, and performance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                   <button onClick={handleNext} className="w-full sm:w-auto bg-[#17cf54] hover:bg-[#15b84a] text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-bold text-base shadow-xl shadow-emerald-500/20 active:scale-95">
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      Start Check-in
                   </button>
                   <button onClick={onCancel} className="w-full sm:w-auto px-8 py-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors">
                      Cancel
                   </button>
                </div>
             </div>
           </div>

           {/* History Preview */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Previous Milestones</h4>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                 {[
                   { date: 'Oct 24, 2023', score: 'Excellent', status: 'Reviewed' },
                   { date: 'Oct 17, 2023', score: 'On Track', status: 'Reviewed' }
                 ].map((h, i) => (
                   <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                           <span className="material-symbols-outlined text-[20px]">verified</span>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{h.date}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{h.score}</p>
                         </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Page N+1: Finish
  if (currentStep > totalSteps) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-slate-900 text-center animate-in zoom-in-95 duration-500">
         <div className="mb-8 relative">
            <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full scale-150" />
            <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
               <span className="material-symbols-outlined text-4xl">celebration</span>
            </div>
         </div>
         <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Mission Accomplished!</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-12 font-medium leading-relaxed">
            Your weekly data has been synchronized with your coach. Expect a review and personalized adjustments shortly.
         </p>
         <button 
           onClick={handleFinish}
           disabled={isSubmitting}
           className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-12 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
         >
           {isSubmitting ? 'Syncing...' : 'Done'}
         </button>
      </div>
    );
  }

  // Page 1..N: Dynamic Step
  const stepData = steps[currentStep - 1];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
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
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Checking in</p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{template?.name || template?.title || 'Weekly Progress'}</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Step {currentStep} of {totalSteps}</p>
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
         </div>

         {/* Floating Action Button */}
         <div className="fixed bottom-10 right-10 z-50">
            <button 
              onClick={handleNext} 
              className="bg-slate-900 dark:bg-[#17cf54] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20"
            >
               <span className="text-lg">{currentStep === totalSteps ? 'Finalize' : 'Continue'}</span>
               <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
         </div>
      </div>
    </div>
  );
}
