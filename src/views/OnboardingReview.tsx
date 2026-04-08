import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';
import CheckInReviewRenderer from '../components/checkin/CheckInReviewRenderer';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingReviewProps {
  clientId: string;
  submissionId: string;
  onBack: () => void;
}

export default function OnboardingReview({ clientId, submissionId, onBack }: OnboardingReviewProps) {
  const { clients } = useClient();
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubmission = async () => {
      setIsLoading(true);
      try {
        console.log('DEBUG: OnboardingReview fetching submissionId:', submissionId);
        // We can use a generic search or a specific submission details endpoint
        // For simplicity, let's assume the submissions endpoint returns everything for now
        // But better to have a specific one. Let's try to find it in the list first.
        const all = await fetchWithAuth('/onboarding/manager/submissions');
        const submission = (all || []).find((s: any) => s.id === submissionId);
        
        if (submission) {
          setData(submission);
        }
      } catch (err) {
        console.error('Error loading onboarding review:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubmission();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('submission_not_found')}
      </div>
    );
  }

  const { client, template } = data;
  const dj = data.answers_json || {};
  const contextClient = clients.find(c => c.id === clientId);
  const clientName = client?.full_name || contextClient?.name || t('client');
  const clientAvatar = client?.avatar_url || contextClient?.avatar;
  const clientInitials = clientName.substring(0, 2).toUpperCase();
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">{t('history_badge')}</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">{clientName}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
           {clientAvatar ? (
             <img 
               src={clientAvatar} 
               alt={clientName} 
               className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
               referrerPolicy="no-referrer"
             />
           ) : (
             <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl border-2 border-white shadow-md">
               {clientInitials}
             </div>
           )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t('submitted_status')}
              </span>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> 
              {new Date(data.submitted_at).toLocaleString(locale)}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {t('template_label')}: {template?.name || t('onboarding')}
            </p>
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
          <FileText className="w-4 h-4" />
          {t('export_results')}
        </button>
      </div>

      <div className="w-full">
         {template && template.template_schema ? (
           <CheckInReviewRenderer 
             template={{
               id: template?.id || '',
               name: template?.name || t('onboarding'),
               templateSchema: template?.template_schema || [],
               key: template?.id || '',
               version: 1
             }} 
             answers={dj} 
           />
         ) : (
           <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-400">
              {t('no_schema_found_for_template')}
           </div>
         )}
      </div>
    </div>
  );
}
