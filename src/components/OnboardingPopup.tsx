import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import CheckInStepRenderer from './checkin/CheckInStepRenderer';
import { useTheme } from '../context/ThemeContext';

interface OnboardingPopupProps {
  onComplete: () => void;
}

export default function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const { settings } = useTheme();
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadActiveOnboarding();
  }, []);

  const loadActiveOnboarding = async () => {
    try {
      const data = await fetchWithAuth('/onboarding/client/active');
      if (data && data.template) {
        // Normalize schema
        data.template.templateSchema = data.template.template_schema || data.template.templateSchema || [];
        setActiveAssignment(data);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to load onboarding:', err);
      // onComplete(); // Don't close if error, maybe show retry
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const templateSchema = activeAssignment?.template?.templateSchema || [];
    if (currentStepIndex < templateSchema.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetchWithAuth('/onboarding/client/submit', {
        method: 'POST',
        body: JSON.stringify({
          template_id: activeAssignment.template_id,
          assignment_id: activeAssignment.id,
          answers_json: answers
        })
      });
      setIsSubmitted(true);
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      console.error('Failed to submit onboarding:', err);
      alert('Error submitting onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!activeAssignment) return null;

  const templateSchema = activeAssignment?.template?.templateSchema || [];
  const currentStep = templateSchema[currentStepIndex];

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 lg:left-64 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center space-y-6 max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Setup Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your profile has been updated successfully.</p>
        </motion.div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[150] w-16 h-16 rounded-full bg-gradient-to-br from-[#17cf54] to-[#15b84a] shadow-xl shadow-emerald-500/40 flex items-center justify-center text-white group"
      >
        <div className="absolute inset-0 rounded-full bg-[#17cf54] animate-ping opacity-20" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">rocket_launch</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-[#17cf54]">
            <div className="w-1.5 h-1.5 bg-[#17cf54] rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
           <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Setup Profile</p>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="fixed inset-0 lg:left-64 z-[200] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background patterns (Check-in Parity) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header (Check-in Parity) */}
      <div className="relative z-10 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
              onClick={handleBack} 
              disabled={currentStepIndex === 0}
              className={`p-2 rounded-xl transition-all ${currentStepIndex === 0 ? 'text-slate-200 dark:text-slate-700' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Checking in</p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{activeAssignment?.template?.name}</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Step {currentStepIndex + 1} of {templateSchema.length}</p>
               <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentStepIndex + 1) / templateSchema.length) * 100}%` }} />
               </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
               <X className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
         <div className="max-w-3xl mx-auto w-full space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-tight">{currentStep?.title}</h2>
                  {currentStep?.subtitle && <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">{currentStep?.subtitle}</p>}
                </div>

                <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  {currentStep && (
                    <CheckInStepRenderer 
                      step={currentStep}
                      answers={answers}
                      onUpdateAnswer={(key, val) => setAnswers(prev => ({ ...prev, [key]: val }))}
                      onToggleArrayItem={(key, item) => {
                        const current = answers[key] || [];
                        const newVal = current.includes(item) 
                          ? current.filter((i: string) => i !== item)
                          : [...current, item];
                        setAnswers(prev => ({ ...prev, [key]: newVal }));
                      }}
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation (Check-in Parity) */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleNext} 
                disabled={submitting}
                className="text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
                style={{ backgroundColor: settings.theme_color || '#17cf54' }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">{currentStepIndex === templateSchema.length - 1 ? 'Complete Setup' : 'Continue'}</span>
                    <span className="material-symbols-outlined text-[20px]">{currentStepIndex === templateSchema.length - 1 ? 'task_alt' : 'arrow_forward'}</span>
                  </>
                )}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
