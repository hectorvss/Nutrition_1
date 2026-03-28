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
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-12 text-center space-y-6 max-w-sm shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Onboarding Submitted</h2>
          <p className="text-slate-500">Thank you! Your information has been saved.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{activeAssignment?.template?.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Step {currentStepIndex + 1} of {templateSchema.length}
            </p>
          </div>
          <button 
            onClick={() => onComplete()}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight">{currentStep?.title}</h2>
                {currentStep?.subtitle && <p className="text-slate-500 font-medium text-lg">{currentStep?.subtitle}</p>}
              </div>

              <div className="space-y-6">
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
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between gap-6 shrink-0 bg-slate-50/50">
          <button 
            onClick={handleBack}
            disabled={currentStepIndex === 0 || submitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button 
            onClick={handleNext}
            disabled={submitting}
            style={{ backgroundColor: settings.theme_color || '#16a34a' }}
            className="px-10 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{currentStepIndex === templateSchema.length - 1 ? 'Complete Onboarding' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
