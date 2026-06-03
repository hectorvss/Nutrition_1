import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: 1 | 2 | 3;
  labels: [string, string, string];
}

export default function WizardStepper({ currentStep, labels }: WizardStepperProps) {
  return (
    <div className="relative w-[240px] md:w-[312px] pt-0.5">
      <div className="absolute left-[calc(16.666%+16px)] right-[calc(16.666%+16px)] md:left-[calc(16.666%+20px)] md:right-[calc(16.666%+20px)] top-[18px] md:top-[22px] h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div
        className="absolute left-[calc(16.666%+16px)] md:left-[calc(16.666%+20px)] top-[18px] md:top-[22px] h-1 bg-emerald-500 rounded-full transition-all"
        style={{
          width: currentStep === 1
            ? '0'
            : currentStep === 2
              ? 'calc(50% - 16px)'
              : 'calc(100% - 32px)',
        }}
      />

      <div className="relative grid grid-cols-3">
        {[1, 2, 3].map((step, index) => {
          const complete = step < currentStep;
          const active = step === currentStep;
          const highlighted = complete || active;
          return (
            <div key={step} className="flex flex-col items-center min-w-0">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white dark:ring-slate-900 ${
                highlighted
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 font-semibold'
              }`}>
                {complete ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : step}
              </div>
              <span className={`mt-2 max-w-[88px] truncate text-xs text-center ${
                highlighted ? 'font-semibold text-emerald-500' : 'font-medium text-slate-400'
              }`}>
                {labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
