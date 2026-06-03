import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Search,
  // 26+ iconos del catalogo backend (se referencian por string id).
  Repeat, ClipboardCheck, AlertTriangle, UserPlus, Smartphone, TrendingUp,
  TrendingDown, Cake, Plus, CheckCircle2, AlertCircle, Trophy,
  CreditCard, Clock, Send, Eye, XCircle, MessageCircle, MessageSquareWarning,
  Target, Minus, Award, Flame, Gift, Moon, CalendarClock, CalendarX,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import WizardStepper from '../components/automations/WizardStepper';

// Mapping string -> componente. El backend solo manda el `icon` como string.
const ICONS: Record<string, React.ElementType> = {
  Repeat, ClipboardCheck, AlertTriangle, UserPlus, Smartphone, TrendingUp,
  TrendingDown, Cake, Plus, CheckCircle2, AlertCircle, Trophy,
  CreditCard, Clock, Send, Eye, XCircle, MessageCircle, MessageSquareWarning,
  Target, Minus, Award, Flame, Gift, Moon, CalendarClock, CalendarX,
};

// Estilo (bg + color tailwind) por categoria — coherente con la version anterior.
const CATEGORY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  lifecycle: { bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400', label: 'Ciclo de vida' },
  checkins:  { bg: 'bg-blue-100 dark:bg-blue-900/30',     color: 'text-blue-600 dark:text-blue-400',     label: 'Check-ins' },
  messaging: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400', label: 'Mensajeria' },
  metrics:   { bg: 'bg-amber-100 dark:bg-amber-900/30',   color: 'text-amber-600 dark:text-amber-400',   label: 'Peso y metricas' },
  training:  { bg: 'bg-rose-100 dark:bg-rose-900/30',     color: 'text-rose-600 dark:text-rose-400',     label: 'Entrenamiento' },
  schedule:  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400', label: 'Agenda y tiempo' },
};

interface BackendTrigger {
  id: string; name: string; desc: string; icon: string;
  category: keyof typeof CATEGORY_STYLE;
  tier: 'basic' | 'advanced';
  wired: boolean;
  params?: Array<{ key: string; label: string; type: string; defaultValue: any; unit?: string }>;
}

interface AutomationCreateTriggerProps {
  onBack: () => void;
  onNext: (
    triggerId: string,
    triggerName: string,
    iconName: string,
    iconBg: string,
    iconColor: string,
  ) => void;
}

export default function AutomationCreateTrigger({ onBack, onNext }: AutomationCreateTriggerProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [triggers, setTriggers] = useState<BackendTrigger[]>([]);
  const [tier, setTier] = useState<string>('trial');
  const [loading, setLoading] = useState(true);

  // Cargar catalogo del backend (filtrado por tier del manager).
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/automations/catalog');
        setTriggers(data?.triggers || []);
        setTier(data?.tier || 'trial');
      } catch (e) {
        console.error('Failed to load automations catalog:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Las categorias visibles son las que tienen al menos un trigger.
  const categories = useMemo(() => {
    const set = new Set<string>(triggers.map(tr => tr.category));
    return ['All', ...Array.from(set)];
  }, [triggers]);

  const filtered = triggers.filter(tr => {
    const matchSearch = !search ||
      tr.name.toLowerCase().includes(search.toLowerCase()) ||
      tr.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || tr.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
      <div className="w-full flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                {t('back_to_automations')}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('create_new_automation')}</h1>
          </div>

          <WizardStepper currentStep={1} labels={[t('trigger_label'), t('message_label'), t('review')]} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('step_choose_trigger')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('select_trigger_event')}</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 outline-none"
                  placeholder={t('search_triggers')}
                  type="text"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'All' ? t('all') : (CATEGORY_STYLE[cat]?.label || cat)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-6 flex-1 scrollbar-hide">
              {filtered.map(trigger => {
                const style = CATEGORY_STYLE[trigger.category] || { bg: 'bg-slate-100', color: 'text-slate-600', label: trigger.category };
                const Icon = ICONS[trigger.icon] || Plus;
                const disabled = !trigger.wired;
                return (
                  <button
                    key={trigger.id}
                    disabled={disabled}
                    onClick={() => !disabled && onNext(trigger.id, trigger.name, trigger.icon, style.bg, style.color)}
                    className={`group relative flex flex-col items-start p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all text-left
                      ${disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-50/30 dark:bg-slate-900/30'
                        : 'hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800'}`}
                  >
                    {trigger.tier === 'advanced' && tier === 'professional' && (
                      <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wide flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Scale+
                      </div>
                    )}
                    {!trigger.wired && (
                      <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wide">
                        Coming soon
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-base">{trigger.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{trigger.desc}</p>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm italic">
                  {t('no_matching_triggers') || 'Sin triggers que coincidan con la busqueda'}
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">{t('select_trigger_to_continue')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
