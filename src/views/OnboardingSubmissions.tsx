import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Filter,
  UserPlus,
  ArrowRight,
  Eye,
  FileText
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function OnboardingSubmissions() {
  const { settings } = useTheme();
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth('/onboarding/manager/submissions');
      setSubmissions(data);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = (submissions || []).filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const locale = language === 'es' ? 'es-ES' : 'en-US';

  if (selectedSubmission) {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all"
                  >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                      {t('back_to_monitoring')}
                  </button>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {t('completed_onboarding')}
                  </span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center gap-6 mb-10 border-b border-slate-50 pb-8">
                      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center font-bold text-3xl text-slate-400 overflow-hidden shadow-lg border-4 border-white">
                          {selectedSubmission.avatar_url ? (
                              <img src={selectedSubmission.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                              selectedSubmission.full_name?.[0] || 'C'
                          )}
                      </div>
                      <div>
                          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedSubmission.full_name}</h2>
                          <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {t('submitted_on_label')} {new Date(selectedSubmission.lastSubmission.submitted_at).toLocaleDateString(locale)}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                  <FileText className="w-4 h-4" />
                                  {selectedSubmission.lastSubmission.template?.name || t('standard_questionnaire')}
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="space-y-12">
                      {/* Here we would map over the answers logic */}
                      {/* For now, we'll show a summary. In a real app we'd fetch the full template schema to map labels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {Object.entries(selectedSubmission.lastSubmission.answers_json || {}).map(([key, value]: [string, any]) => (
                              <div key={key} className="group p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5 transition-all">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">{key.replace(/_/g, ' ')}</p>
                                  <div className="text-slate-900 font-bold text-lg">
                                      {typeof value === 'object' ? (
                                          Array.isArray(value) ? value.join(', ') : JSON.stringify(value)
                                      ) : value.toString()}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={t('search_clients')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 font-medium transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            {t('active_only')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('no_client_activity_found')}</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">{t('onboarding_monitoring_empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((s) => (
            <div key={s.id} className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-400 overflow-hidden shadow-inner">
                    {s.avatar_url ? (
                        <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        s.full_name?.[0] || 'C'
                    )}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    s.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    s.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-50 text-slate-400 border border-slate-100'
                }`}>
                    {s.status.replace('_', ' ')}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{s.full_name}</h3>
                <p className="text-sm text-slate-500 font-medium truncate">{s.email}</p>
              </div>

              <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                {s.status === 'completed' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">{t('completed_on_label')}</span>
                        <span className="text-slate-900">{new Date(s.lastSubmission.submitted_at).toLocaleDateString(locale)}</span>
                    </div>
                    <button 
                        onClick={() => setSelectedSubmission(s)}
                        style={{ backgroundColor: settings.theme_color }}
                        className="w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        {t('view_answers')}
                    </button>
                  </div>
                ) : s.status === 'pending' ? (
                   <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">{t('assigned_label')}</span>
                        <span className="text-slate-900">{new Date(s.activeAssignment.assigned_at).toLocaleDateString(locale)}</span>
                    </div>
                    <div className="w-full py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-default">
                        <Clock className="w-4 h-4" />
                        {t('awaiting_response')}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {t('not_assigned')}
                    </p>
                    <button 
                         className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        {t('quick_assign')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
