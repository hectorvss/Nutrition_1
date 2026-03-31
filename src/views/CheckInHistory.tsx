import React, { useState, useEffect } from 'react';
import {
  Filter,
  Calendar as CalendarIcon,
  Scale,
  CheckCircle2,
  Flag,
  ChevronRight,
  History,
  Archive,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { fetchWithAuth } from '../api';

interface CheckInHistoryProps {
  clientId: string;
  onBack: () => void;
  onViewReview: (checkInId: string) => void;
  hideHeader?: boolean;
  isClient?: boolean;
}

export default function CheckInHistory({ clientId, onBack, onViewReview, hideHeader = false, isClient = false }: CheckInHistoryProps) {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('DEBUG: CheckInHistory fetching history for clientId:', clientId, 'isClient:', isClient);
        if (isClient) {
          const data = await fetchWithAuth(`/check-ins/client/check-ins`);
          setCheckIns(data || []);
          // For client view, we don't need the client object from history as it's the user themselves
        } else {
          const data = await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins`);
          if (data) {
            setClient(data.client);
            setCheckIns(data.check_ins || []);
          }
        }
      } catch (err) {
        console.error('Error loading check-in history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (confirmDelete !== item.id) {
      setConfirmDelete(item.id);
      return;
    }

    setIsDeleting(item.id);
    try {
      const endpoint = item.type === 'dynamic' 
        ? `/check-ins/manager/client-submissions/${item.id}`
        : `/check-ins/manager/check-ins/${item.id}`;
      
      await fetchWithAuth(endpoint, { method: 'DELETE' });
      setCheckIns(prev => prev.filter(ci => ci.id !== item.id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting check-in:', err);
      alert('Failed to delete check-in');
    } finally {
      setIsDeleting(null);
    }
  };

  const clientName = client?.name || 'Client';
  const clientAvatar = client?.avatar;

  const getComplianceScore = (dj: any): number | null => {
    if (!dj) return null;
    
    // Check for direct numeric adherence from dynamic system first
    if (dj.nutrition_adherence_score !== undefined) {
      const score = Number(dj.nutrition_adherence_score);
      if (!isNaN(score)) return score * 10;
    }
    if (dj.adherence_score !== undefined) {
      const score = Number(dj.adherence_score);
      if (!isNaN(score)) return score * 10; // 1-10 scale to 0-100
    }

    // Map adherence words to scores (Legacy support)
    const map: Record<string, number> = {
      'Perfect': 100, 'Very High': 95, 'High': 90, 'All': 100, 'Did all': 100,
      'Good': 80, '5-6': 80, 'Moderate': 70, 'Some': 60,
      'Low': 50, 'Missed some': 50, 'Very little': 25, 'Poor': 30, 'Did none': 0
    };
    const v = dj.nutritionAdherence || dj.trainingAdherence || '';
    return map[v] ?? null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${hideHeader ? '' : 'p-6 md:p-8'}`}>
      {!hideHeader && (
        <>
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="hover:text-emerald-600 transition-colors">Check-ins</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-slate-900">{clientName}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {clientAvatar ? (
                <img src={clientAvatar} alt={clientName} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xl shadow-md border-2 border-white">
                  {clientName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <History className="w-3 h-3" /> History
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 font-medium">{checkIns.length} check-ins submitted</p>
            </div>
          </div>
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        </>
      )}

      <div className="space-y-4">
        {checkIns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 font-medium text-sm">No check-ins submitted yet.</p>
          </div>
        ) : checkIns.map((item, idx) => {
          const dj = item.data_json || {};
          const compliance = getComplianceScore(dj);
          const reviewedAt = item.reviewed_at || item.data_json?.reviewed_at;
          const isPending = !reviewedAt;
          const isNew = isPending && idx === 0;
          const isArchived = false;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-sm p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group ${
                isPending ? 'border-amber-200' : 'border-slate-200 hover:border-slate-300'
              } ${isArchived ? 'opacity-60 border-dashed' : ''}`}
            >
              {isPending && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />}

              <div className="flex items-center gap-6 min-w-[180px] pl-2">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {idx === 0 ? 'Latest Check-in' : `Check-in #${checkIns.length - idx}`}
                    {isNew && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">New</span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-1 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Scale className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{dj.weight ? `${dj.weight} kg` : (dj.avgWeight ? `${dj.avgWeight} kg` : '--')}</span>
                    <span className="text-xs font-bold text-slate-400">Weight</span>
                  </div>
                </div>

                {compliance !== null ? (
                  <div className="flex flex-col gap-1.5 flex-1 max-w-[180px] hidden lg:flex">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-widest text-[10px]">Compliance</span>
                      <span className="text-slate-900">{compliance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${compliance}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[180px] hidden lg:block">
                    <span className="text-xs text-slate-400 italic font-medium">No adherence data</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                    isPending ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}>
                    {isPending ? <><Flag className="w-3 h-3" />Pending</> : <><CheckCircle2 className="w-3 h-3" />Reviewed</>}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 min-w-[160px]">
                {!isClient && (
                  <button
                    onClick={(e) => handleDelete(e, item)}
                    disabled={isDeleting === item.id}
                    title="Delete check-in"
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border shadow-sm ${
                      confirmDelete === item.id 
                        ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
                        : 'bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                    }`}
                  >
                    {isDeleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : confirmDelete === item.id ? (
                      <><Trash2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Confirm?</span></>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => onViewReview(item.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 flex-1 text-sm ${
                    isNew
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isPending ? 'Review' : 'View'}
                  {isPending && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
