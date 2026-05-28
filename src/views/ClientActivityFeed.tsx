import React, { useState, useEffect, useCallback } from 'react';
import {
  Dumbbell, ClipboardCheck, Utensils, MessageSquare, UserPlus,
  Star, StickyNote, ChevronDown, Activity as ActivityIcon, Check, X, Send,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';
import { formatPortion } from '../lib/portionDisplay';

/* ============================================================================
 * Progreso / Acompañamiento — feed de actividad del cliente (vista manager).
 * Cada acción positiva del cliente (entreno, check-in, comida, mensaje,
 * onboarding) aparece como una tarjeta cronológica. El coach puede destacar
 * (estrella) y anotar cada actividad, y expandir para ver el detalle.
 * Estructura inspirada en el "Acompañamiento" de Nutrium, adaptada a nuestro
 * sistema de diseño (cards rounded-2xl, paleta slate/emerald).
 * ========================================================================== */

type ActivityType = 'workout' | 'checkin' | 'meal' | 'message' | 'onboarding';

interface ActivityItem {
  type: ActivityType;
  id: string;
  ts: string;
  title: string;
  summary: any;
  detail: any;
  highlighted?: boolean;
  note?: string | null;
}

const TYPE_META: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  workout:    { icon: Dumbbell,       color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  checkin:    { icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  meal:       { icon: Utensils,       color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  message:    { icon: MessageSquare,  color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
  onboarding: { icon: UserPlus,       color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-900/20' },
};

interface Props {
  clientId: string;
  /** Abre el chat con este cliente (botón de mensaje en cada tarjeta). */
  onMessage?: () => void;
}

export default function ClientActivityFeed({ clientId, onMessage }: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [error, setError] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notingId, setNotingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const FILTERS: { key: 'all' | ActivityType; label: string }[] = [
    { key: 'all',        label: t('act_filter_all', { defaultValue: 'Todas' }) },
    { key: 'workout',    label: t('act_filter_workout', { defaultValue: 'Entrenos' }) },
    { key: 'checkin',    label: t('act_filter_checkin', { defaultValue: 'Check-ins' }) },
    { key: 'meal',       label: t('act_filter_meal', { defaultValue: 'Comidas' }) },
    { key: 'message',    label: t('act_filter_message', { defaultValue: 'Mensajes' }) },
    { key: 'onboarding', label: t('act_filter_onboarding', { defaultValue: 'Onboarding' }) },
  ];

  const load = useCallback(async (opts: { reset: boolean; cursor?: string | null; type?: 'all' | ActivityType }) => {
    const tp = opts.type ?? filter;
    if (opts.reset) { setLoading(true); setError(false); } else { setLoadingMore(true); }
    try {
      const params = new URLSearchParams({ type: tp, limit: '20' });
      if (!opts.reset && opts.cursor) params.set('before', opts.cursor);
      const res = await fetchWithAuth(`/manager/clients/${clientId}/activity-feed?${params.toString()}`);
      const fresh: ActivityItem[] = res?.items || [];
      setItems(prev => (opts.reset ? fresh : [...prev, ...fresh]));
      setNextCursor(res?.nextCursor || null);
    } catch (e) {
      console.error('activity feed load failed', e);
      if (opts.reset) setError(true);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [clientId, filter]);

  useEffect(() => { load({ reset: true, type: filter }); }, [clientId, filter, load]);

  const relTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const es = language === 'es';
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return es ? 'ahora mismo' : 'just now';
    if (mins < 60) return es ? `hace ${mins} min` : `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return es ? `hace ${hours} h` : `${hours} h ago`;
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const toggleHighlight = async (item: ActivityItem) => {
    setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type ? { ...i, highlighted: !i.highlighted } : i)));
    await fetchWithAuth('/manager/activity/highlight', {
      method: 'POST',
      // client_id + label permiten al backend notificar al cliente ("tu coach
      // ha destacado…") y disparar trigger.activity_highlighted.
      body: JSON.stringify({ activity_type: item.type, activity_id: item.id, client_id: clientId, label: item.title }),
    }).catch(() => {
      // revertir si falla
      setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type ? { ...i, highlighted: !i.highlighted } : i)));
    });
  };

  const openNote = (item: ActivityItem) => {
    setNotingId(`${item.type}:${item.id}`);
    setNoteDraft(item.note || '');
  };
  const saveNote = async (item: ActivityItem) => {
    const clean = noteDraft.trim();
    setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type ? { ...i, note: clean || null } : i)));
    setNotingId(null);
    await fetchWithAuth('/manager/activity/note', {
      method: 'PUT',
      body: JSON.stringify({ activity_type: item.type, activity_id: item.id, note: clean }),
    }).catch(() => {});
  };

  // ── Resumen por tipo (línea bajo el título) ──
  const summaryLine = (item: ActivityItem): string => {
    const s = item.summary || {};
    switch (item.type) {
      case 'workout': {
        const es = language === 'es';
        const parts: string[] = [];
        if (s.exercises) parts.push(es ? `${s.exercises} ejercicios` : `${s.exercises} exercises`);
        if (s.sets) parts.push(es ? `${s.sets} series` : `${s.sets} sets`);
        if (s.volume) parts.push(`${(s.volume / 1000).toFixed(1)}k kg`);
        if (s.rpe) parts.push(`RPE ${s.rpe}`);
        return parts.join(' · ');
      }
      case 'meal': {
        const parts: string[] = [];
        if (s.calories) parts.push(`${Math.round(s.calories)} kcal`);
        if (s.protein != null) parts.push(`P${Math.round(s.protein)}`);
        if (s.carbs != null) parts.push(`C${Math.round(s.carbs)}`);
        if (s.fats != null) parts.push(`G${Math.round(s.fats)}`);
        return parts.join(' · ');
      }
      case 'message': return s.preview || '';
      default: return '';
    }
  };

  const hasDetail = (item: ActivityItem): boolean => {
    if (item.type === 'workout') return (item.detail?.exercises?.length || 0) > 0;
    if (item.type === 'meal') return (item.detail?.items?.length || 0) > 0;
    if (item.type === 'message') return !!item.detail?.content;
    if (item.type === 'checkin' || item.type === 'onboarding') return Object.keys(item.detail?.answers || {}).length > 0;
    return false;
  };

  const renderDetail = (item: ActivityItem) => {
    if (item.type === 'workout') {
      return (
        <div className="space-y-2">
          {(item.detail.exercises || []).map((ex: any, i: number) => (
            <div key={i} className="flex items-start justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">{ex.name || '—'}</span>
              <span className="text-slate-500 text-xs shrink-0">
                {(ex.sets_logged || []).map((st: any) => `${st.weight || 0}×${st.reps || 0}`).join('  ')}
              </span>
            </div>
          ))}
          {item.detail.notes && <p className="text-xs text-slate-500 italic mt-1">{item.detail.notes}</p>}
        </div>
      );
    }
    if (item.type === 'meal') {
      return (
        <div className="space-y-1.5">
          {(item.detail.items || []).map((it: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">{it.name}</span>
              <span className="text-slate-400 text-xs">{formatPortion(it.multiplier || it.quantity || 1, it.servingSize)}</span>
            </div>
          ))}
        </div>
      );
    }
    if (item.type === 'message') {
      return <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{item.detail.content}</p>;
    }
    // checkin / onboarding: pares pregunta → respuesta
    const answers = item.detail?.answers || {};
    return (
      <div className="space-y-1.5">
        {Object.entries(answers).slice(0, 12).map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-500 text-xs">{k}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
              {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Filtro por tipo de actividad */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              filter === f.key
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 flex items-center gap-3">
              <SkeletonCircle size={40} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-slate-400 text-sm">{t('error_loading_data')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <ActivityIcon className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">{t('act_empty', { defaultValue: 'Aún no hay actividad' })}</p>
          <p className="text-sm text-slate-400 mt-1">{t('act_empty_sub', { defaultValue: 'Las acciones del cliente aparecerán aquí.' })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const key = `${item.type}:${item.id}`;
            const isExpanded = expandedId === key;
            const isNoting = notingId === key;
            const summary = summaryLine(item);
            const expandable = hasDetail(item);
            return (
              <div
                key={key}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  item.highlighted ? 'border-amber-300 dark:border-amber-500/40 ring-1 ring-amber-200/60' : 'border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <span className="text-xs text-slate-400">{relTime(item.ts)}</span>
                    </div>
                    {summary && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{summary}</p>}
                    {item.note && !isNoting && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                        <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span className="italic">{item.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {onMessage && (
                      <button
                        onClick={onMessage}
                        title={t('act_message', { defaultValue: 'Enviar mensaje' })}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleHighlight(item)}
                      title={t('act_highlight', { defaultValue: 'Destacar' })}
                      className={`p-1.5 rounded-lg transition-colors ${item.highlighted ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                    >
                      <Star className={`w-4 h-4 ${item.highlighted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => openNote(item)}
                      title={t('act_note', { defaultValue: 'Nota' })}
                      className={`p-1.5 rounded-lg transition-colors ${item.note ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>
                    {expandable && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : key)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor de nota */}
                {isNoting && (
                  <div className="px-4 pb-4 -mt-1">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      autoFocus
                      rows={2}
                      placeholder={t('act_note_placeholder', { defaultValue: 'Escribe una nota sobre esta actividad…' })}
                      className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => saveNote(item)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {t('save', { defaultValue: 'Guardar' })}
                      </button>
                      <button onClick={() => setNotingId(null)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> {t('cancel', { defaultValue: 'Cancelar' })}
                      </button>
                    </div>
                  </div>
                )}

                {/* Detalle expandido */}
                {isExpanded && expandable && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <div className="pt-3">{renderDetail(item)}</div>
                  </div>
                )}
              </div>
            );
          })}

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => load({ reset: false, cursor: nextCursor })}
                disabled={loadingMore}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-300 transition-all disabled:opacity-50"
              >
                {loadingMore ? t('loading', { defaultValue: 'Cargando…' }) : t('act_load_more', { defaultValue: 'Cargar más' })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
