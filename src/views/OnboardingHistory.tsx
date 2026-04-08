import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar as CalendarIcon,
  ChevronRight,
  ArrowLeft,
  ClipboardCheck
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingHistoryProps {
  clientId: string;
  onBack: () => void;
  onViewReview: (submissionId: string) => void;
}

export default function OnboardingHistory({ clientId, onBack, onViewReview }: OnboardingHistoryProps) {
  const { clients } = useClient();
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const contextClient = clients.find(c => c.id === clientId);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // We can fetch submissions for this client
        const data = await fetchWithAuth('/onboarding/manager/submissions');
        // Filter for this client (Ideally we'd have a specific endpoint but this works for now)
        const clientSubmissions = (data || []).filter((s: any) => s.client_id === clientId);
        setSubmissions(clientSubmissions);
        
        if (clientSubmissions.length > 0) {
          setClient(clientSubmissions[0].client);
        }
      } catch (err) {
        console.error('Error loading onboarding history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const clientName = client?.full_name || contextClient?.name || t('client');
  const clientInitials = clientName.substring(0, 2).toUpperCase();
  const clientAvatar = client?.avatar_url || contextClient?.avatar;
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">{t('onboarding')}</button>
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
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3" /> {t('onboarding_history_badge')}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">{t('submissions_found_count', { count: submissions.length })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium text-sm">
            {t('no_onboarding_submissions')}
          </div>
        ) : (submissions || []).map((item, idx) => {
          if (!item) return null;
          return (
          <div
            key={item.id}
            onClick={() => onViewReview(item.id)}
            className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
          >
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ClipboardCheck className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.template?.name || t('onboarding_flow')}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                    <CalendarIcon className="w-4 h-4" />
                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }) : t('date_unknown')}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <button className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                  {t('view_results')}
               </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
