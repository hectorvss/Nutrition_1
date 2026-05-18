import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { fetchWithAuth } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

interface FixedQuestionsPanelProps {
  /** Which set of system-fixed questions to show. */
  kind: 'checkin' | 'onboarding';
}

/**
 * Read-only panel that surfaces the canonical fixed/locked questions which the
 * backend injects into every check-in / onboarding flow. They power the KPIs,
 * are mandatory for the client, and CANNOT be edited or deleted by the manager
 * — this panel makes that explicit in the template editor.
 */
export default function FixedQuestionsPanel({ kind }: FixedQuestionsPanelProps) {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    const endpoint = kind === 'checkin'
      ? '/check-ins/manager/fixed-questions'
      : '/onboarding/manager/fixed-questions';
    fetchWithAuth(endpoint)
      .then(data => setSteps(Array.isArray(data) ? data : []))
      .catch(() => setSteps([]));
  }, [kind]);

  if (steps.length === 0) return null;

  return (
    <div className="bg-amber-50/60 dark:bg-amber-900/10 border-2 border-amber-200/70 dark:border-amber-800/40 rounded-[2rem] p-7 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
            {t('fixed_questions_title', { defaultValue: 'Preguntas fijas del sistema' })}
          </h3>
          <p className="text-xs font-medium text-amber-700/80 dark:text-amber-400/70">
            {t('fixed_questions_subtitle', { defaultValue: 'Obligatorias para el cliente · alimentan los KPIs · no se pueden editar ni eliminar' })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step: any) => (
          <div key={step.id} className="bg-white/70 dark:bg-slate-900/40 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
              {step.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(step.questions || []).map((q: any) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate flex-1">
                    {q.title}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-full shrink-0">
                    {t('fixed_badge', { defaultValue: 'Fija' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
