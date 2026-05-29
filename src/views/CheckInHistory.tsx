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
import { useLanguage } from '../context/LanguageContext';
import { usePagination } from '../hooks/usePagination';
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonText } from '../components/ui/Skeleton';

interface CheckInHistoryProps {
  clientId: string;
  onBack: () => void;
  onViewReview: (checkInId: string) => void;
  hideHeader?: boolean;
  isClient?: boolean;
}

export default function CheckInHistory({ clientId, onBack, onViewReview, hideHeader = false, isClient = false }: CheckInHistoryProps) {
  const { t, language } = useLanguage();
  // Paginacion cursor-based: cargamos de 30 en 30 (sincronizado con
  // el defaultLimit del backend para los endpoints de check-ins).
  const endpoint = isClient
    ? `/check-ins/client/check-ins`
    : `/check-ins/manager/clients/${clientId}/check-ins`;
  // El endpoint del manager devuelve `client` en el wrap del payload.
  // Lo extraemos del payload de la primera pagina del hook (callback
  // onFirstPagePayload) en vez de hacer una segunda peticion redundante.
  const [client, setClient] = useState<any>(null);
  const { items: checkIns, loadMore, hasMore, isLoading, pagesLoaded } =
    usePagination<any>(endpoint, {
      limit: 30,
      onFirstPagePayload: (payload) => {
        if (isClient) return;
        const p = payload as { client?: any } | null;
        if (p?.client) setClient(p.client);
      },
    });
  // Mutate optimistico tras eliminar — solo reusamos el setter del hook
  // recargando desde cero cuando hace falta. Mientras tanto, una variable
  // local refleja deletions sin volver a pegar al backend.
  const [locallyDeleted, setLocallyDeleted] = useState<Set<string>>(new Set());
  const visibleCheckIns = checkIns.filter(ci => !locallyDeleted.has(ci.id));

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
      setLocallyDeleted(prev => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting check-in:', err);
      alert(t('delete_checkin_failed'));
    } finally {
      setIsDeleting(null);
    }
  };

  const clientName = client?.name || 'Client';
  const clientAvatar = client?.avatar;
  const locale = language === 'es' ? 'es-ES' : 'en-US';

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

  // Loading state: render 6 skeleton check-in cards with the same layout and
  // spacing as the real ones, so the screen does not jump when data arrives.
  if (isLoading && pagesLoaded === 0) {
    return (
      <div className={`w-full space-y-6 ${hideHeader ? '' : 'p-6 md:p-8'}`}>
        {!hideHeader && (
          <>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <SkeletonCircle size={64} className="rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </>
        )}
        <div className="space-y-4" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 min-w-[180px] pl-2">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-8 flex-1 justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonCircle size={40} />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="flex-1 max-w-[180px] hidden lg:block space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <div className="flex items-center justify-end gap-3 min-w-[160px]">
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${hideHeader ? '' : 'p-6 md:p-8'}`}>
      {!hideHeader && (
        <>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="hover:text-emerald-600 transition-colors">{t('checkins')}</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-slate-900 dark:text-white">{clientName}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {clientAvatar ? (
                <img src={clientAvatar} alt={clientName} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xl shadow-md border-2 border-white dark:border-slate-700">
                  {clientName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{clientName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <History className="w-3 h-3" /> {t('history')}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{t('checkins_submitted_count', { count: visibleCheckIns.length })}</p>
            </div>
          </div>
        </div>
        </>
      )}

      <div className="space-y-4">
        {visibleCheckIns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-slate-400 dark:text-slate-400 font-medium text-sm">{t('no_checkins_submitted_yet')}</p>
          </div>
        ) : visibleCheckIns.map((item, idx) => {
          const dj = item.data_json || {};
          const compliance = getComplianceScore(dj);
          const reviewedAt = item.reviewed_at || item.data_json?.reviewed_at;
          const isPending = !reviewedAt;
          const isNew = isPending && idx === 0;
          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group ${
                isPending ? 'border-amber-200 dark:border-amber-900/40' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isPending && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />}

              <div className="flex items-center gap-6 min-w-[180px] pl-2">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {idx === 0 ? t('latest_checkin') : t('checkin_number', { number: visibleCheckIns.length - idx })}
                    {isNew && (
                      <span className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">{t('new')}</span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(item.date).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-1 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Scale className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{dj.weight ? `${dj.weight} kg` : (dj.avgWeight ? `${dj.avgWeight} kg` : '--')}</span>
                    <span className="text-xs font-bold text-slate-400">{t('weight')}</span>
                  </div>
                </div>

                {compliance !== null ? (
                  <div className="flex flex-col gap-1.5 flex-1 max-w-[180px] hidden lg:flex">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">{t('compliance')}</span>
                      <span className="text-slate-900 dark:text-white">{compliance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${compliance}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[180px] hidden lg:block">
                    <span className="text-xs text-slate-400 italic font-medium">{t('no_adherence_data')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                    isPending ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    {isPending ? <><Flag className="w-3 h-3" />{t('pending')}</> : <><CheckCircle2 className="w-3 h-3" />{t('reviewed')}</>}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 min-w-[160px]">
                {!isClient && (
                  <button
                    onClick={(e) => handleDelete(e, item)}
                    disabled={isDeleting === item.id}
                    title={t('delete_checkin')}
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border shadow-sm ${
                      confirmDelete === item.id 
                        ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    {isDeleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : confirmDelete === item.id ? (
                      <><Trash2 className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{t('confirm_question')}</span></>
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
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isPending ? t('review') : t('view')}
                  {isPending && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        {/* Boton "Cargar mas" para la paginacion cursor-based */}
        {hasMore && visibleCheckIns.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && pagesLoaded > 0 ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-700 border-t-slate-700 dark:border-t-slate-300 rounded-full animate-spin" />
                  {t('loading') || 'Cargando…'}
                </>
              ) : (
                t('load_more') || 'Cargar más'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
