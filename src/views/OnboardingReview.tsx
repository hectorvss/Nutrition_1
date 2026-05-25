import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
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
  // Review state (coach feedback). Initialised from the loaded submission
  // so reopening the screen surfaces the previous note.
  const [reviewNote, setReviewNote] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmission = async () => {
      setIsLoading(true);
      try {
        // Prefer a per-id endpoint when available; fall back to scanning the list.
        let submission: any = null;
        try {
          submission = await fetchWithAuth(`/onboarding/manager/submissions/${submissionId}`);
        } catch (byIdErr) {
          const all = unwrapList(await fetchWithAuth('/onboarding/manager/submissions?limit=200'));
          submission = (all || []).find((s: any) => s.id === submissionId) || null;
        }
        // `data` stays null when nothing matched, which renders the "not found" state.
        setData(submission);
        setReviewNote(submission?.coach_notes || '');
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

      {/* Coach feedback — symmetric with check-in review. Setting a note
          stamps `reviewed_at` and `reviewed_by` server-side and the client
          sees the feedback on next /onboarding/client/latest fetch. */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            {t('coach_feedback', { defaultValue: 'Feedback del coach' })}
          </h2>
          {data?.reviewed_at && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide">
              {t('reviewed_on', { defaultValue: 'Revisado el' })} {new Date(data.reviewed_at).toLocaleDateString(locale)}
            </span>
          )}
        </div>
        <textarea
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={5}
          placeholder={t('onboarding_review_placeholder', { defaultValue: 'Escribe un mensaje para el cliente sobre su onboarding…' })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
        />
        {reviewError && <p className="text-xs text-red-500 font-medium">{reviewError}</p>}
        <div className="flex justify-end">
          <button
            disabled={isSavingReview}
            onClick={async () => {
              setIsSavingReview(true);
              setReviewError(null);
              try {
                const updated = await fetchWithAuth(`/onboarding/manager/submissions/${submissionId}/review`, {
                  method: 'POST',
                  body: JSON.stringify({ coach_notes: reviewNote }),
                });
                setData(updated);
                setReviewNote(updated?.coach_notes || '');
              } catch (err: any) {
                setReviewError(err?.message || t('error_loading_data'));
              } finally {
                setIsSavingReview(false);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSavingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {data?.reviewed_at ? t('update_feedback', { defaultValue: 'Actualizar feedback' }) : t('mark_reviewed', { defaultValue: 'Marcar revisado' })}
          </button>
        </div>
      </div>
    </div>
  );
}
