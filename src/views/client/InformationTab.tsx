import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { fetchWithAuth } from '../../api';
import { unwrapList } from '../../api/unwrap';
import CheckInReviewRenderer from '../../components/checkin/CheckInReviewRenderer';

interface InformationTabProps {
  clientId: string;
  t: Function;
}

const InformationTab: React.FC<InformationTabProps> = ({ clientId, t }) => {
  const [innerView, setInnerView] = useState<'info' | 'review'>('info');
  const [onboardingSubmission, setOnboardingSubmission] = useState<any>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboarding = async () => {
      setIsLoadingOnboarding(true);
      setOnboardingError(null);
      try {
        const submissions = unwrapList(await fetchWithAuth('/onboarding/manager/submissions?limit=200'));
        const clientSubmission = (submissions || [])
          .filter((s: any) => s.client_id === clientId)
          .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0];

        if (clientSubmission) {
          setOnboardingSubmission(clientSubmission);
        }
      } catch (error) {
        console.error('Error fetching onboarding info:', error);
        setOnboardingError(t('error_loading_data'));
      } finally {
        setIsLoadingOnboarding(false);
      }
    };
    fetchOnboarding();
  }, [clientId]);

  if (isLoadingOnboarding) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-medium">{t('loading_general_information')}</p>
      </div>
    );
  }

  if (onboardingError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-red-200 dark:border-red-800/50 text-slate-400">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{onboardingError}</p>
      </div>
    );
  }

  if (!onboardingSubmission) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('no_onboarding_data_found')}</p>
        <p className="text-sm mt-2 max-w-xs mx-auto">{t('onboarding_data_processing_hint')}</p>
      </div>
    );
  }

  const { template, answers_json } = onboardingSubmission;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('general_information')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('latest_onboarding_data_prefix')}: <span className="font-bold text-emerald-600">{template?.name || t('onboarding')}</span></p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          {t('submitted')}: {new Date(onboardingSubmission.submitted_at).toLocaleDateString()}
        </div>
      </div>

      {template?.template_schema ? (
        <CheckInReviewRenderer
          template={{
            id: template?.id || '',
            name: template?.name || t('onboarding'),
            templateSchema: template?.template_schema || [],
            key: template?.id || '',
            version: 1
          }}
          answers={answers_json || {}}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
          {t('no_rendering_schema_found')}
        </div>
      )}
    </div>
  );
};

export default InformationTab;
