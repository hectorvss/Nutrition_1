import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CheckInStepRenderer from '../../components/checkin/CheckInStepRenderer';
import { fetchWithAuth } from '../../api';

interface WeeklyCheckinFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function WeeklyCheckinFlow({ onComplete, onCancel }: WeeklyCheckinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = Intro
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveTemplate();
  }, []);

  const loadActiveTemplate = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/check-ins/client/active-template');
      if (data) {
        // Robust mapping: ensure template_schema is available as templateSchema
        const template = {
          ...data,
          templateSchema: data.template_schema || data.templateSchema || []
        };
        setActiveTemplate(template);
        
        // Skip intro if template is valid
        if (template.templateSchema && template.templateSchema.length > 0) {
          setCurrentStep(1);
        }
      }
    } catch (err) {
      console.error('Error loading active template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = activeTemplate?.templateSchema || [];
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep - 1];

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const toggleArrayItem = (key: string, item: string) => {
    const current = answers[key] || [];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    updateAnswer(key, updated);
  };

  const handleFileChange = async (key: string, file: File) => {
    // Basic mock: In a real app, you'd upload to Supabase storage here
    const reader = new FileReader();
    reader.onloadend = () => {
      updateAnswer(key, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    if (!currentStepData) return true;
    
    // Check required questions
    const requiredQuestions = (currentStepData.questions || []).filter((q: any) => q.required);
    for (const q of requiredQuestions) {
      if (!answers[q.id]) {
        setValidationError(`Please complete: ${q.title}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };

  const handleFinish = async () => {
    try {
      setIsSubmitting(true);
      await fetchWithAuth('/check-ins/client/check-ins', {
        method: 'POST',
        body: JSON.stringify({
          template_id: activeTemplate.id,
          date: new Date().toISOString(),
          data_json: answers,
          type: 'dynamic'
        })
      });
      onComplete();
    } catch (err) {
      console.error('Error submitting check-in:', err);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#17cf54] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Architecting Check-in...</p>
        </div>
      </div>
    );
  }

  // Intro Step (Normally skipped now)
  if (currentStep === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#0f1a12] p-6 md:p-12 items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-10">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto text-[#17cf54] shadow-inner">
             <span className="material-symbols-outlined text-5xl">rocket_launch</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{activeTemplate?.name || 'Weekly Progress'}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              Your strategy is live. Synchronize your progress data with your coach to optimize your clinical roadmap for next week.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button onClick={handleNext} className="w-full sm:w-auto bg-[#17cf54] hover:bg-[#15b84a] text-white px-10 py-5 rounded-[24px] transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 active:scale-95">
               Start My Review
               <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button onClick={onCancel} className="w-full sm:w-auto px-10 py-5 rounded-[24px] text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">
               Maybe Later
            </button>
          </div>
          <div className="pt-10 flex items-center justify-center gap-8 border-t border-slate-100 dark:border-slate-800">
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Time Estimate</p>
               <p className="text-sm font-bold text-slate-600 dark:text-slate-300">~{totalSteps * 2} mins</p>
             </div>
             <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Steps</p>
               <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{totalSteps} Sections</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#0f1a12]">
      {/* Dynamic Progress Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1">
             <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[10px] font-black text-[#17cf54] uppercase tracking-[0.2em]">{activeTemplate?.name || 'Syncing Progress'}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  className="h-full bg-[#17cf54] shadow-[0_0_10px_rgba(23,207,84,0.4)]"
                />
             </div>
          </div>
          <button onClick={onCancel} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
         <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Main Step Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <CheckInStepRenderer 
                step={currentStepData}
                answers={answers}
                onUpdateAnswer={updateAnswer}
                onToggleArrayItem={toggleArrayItem}
                onUploadFile={handleFileChange}
              />
            </div>

            {validationError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in shake duration-300">
                <span className="material-symbols-outlined">error</span>
                {validationError}
              </div>
            )}

            <div className="h-20" /> {/* Spacer */}
         </div>
      </div>

      {/* Navigation Footer - OUTSIDE THE CARD */}
      <div className="relative z-10 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
         <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button 
              onClick={handleBack} 
              className="group flex items-center gap-3 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all font-bold text-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </div>
              Back
            </button>
            
            <div className="flex items-center gap-10">
              <p className="hidden md:block text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                Architecting Phase {currentStep} of {totalSteps}
              </p>
              <button 
                onClick={handleNext} 
                className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-10 py-4 rounded-[20px] font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
              >
                 {currentStep === totalSteps ? 'Finalize Review' : 'Continue'}
                 <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
