import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Utensils, Dumbbell, Calendar, AlertTriangle } from 'lucide-react';
import Select from '../components/ui/Select';
import BusinessAnalytics from './analytics/BusinessAnalytics';
import NutritionAnalytics from './analytics/NutritionAnalytics';
import TrainingAnalytics from './analytics/TrainingAnalytics';

/* ============================================================================
 * Analytics — contenedor / shell.
 * Gestiona las pestañas, el selector de ventana temporal y la carga de datos.
 * El render de cada pestaña vive en su propio fichero src/views/analytics/.
 * ========================================================================== */

type AnalyticsTab = 'business' | 'nutrition' | 'training';

// Opciones del selector de ventana temporal — aplican a TODOS los KPIs.
const RANGE_OPTIONS = [
  { days: 7, labelKey: 'last_7_days' },
  { days: 30, labelKey: 'last_30_days' },
  { days: 90, labelKey: 'last_90_days' },
  { days: 365, labelKey: 'last_year' },
] as const;

export default function Analytics() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('business');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Ventana temporal seleccionada (en días). Se envía al backend y afecta
  // a todos los KPIs basados en tiempo.
  const [days, setDays] = useState(30);

  const loadAnalytics = async (rangeDays: number = days) => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const result = await fetchWithAuth(`/manager/analytics?days=${rangeDays}`);
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // Ya no salimos con un spinner global: la pantalla se renderiza completa
  // desde el primer instante, y cada tarjeta/gráfica muestra su skeleton
  // (vía LoadingProvider en las pestañas) hasta que llega el dato real.

  if (loadError) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">{t('error_loading_data')}</p>
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('analytics_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('analytics_overview')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
          <Select
            value={days}
            onChange={(v) => setDays(Number(v))}
            className="text-sm text-slate-600 dark:text-slate-300 font-medium bg-transparent outline-none pr-1"
            aria-label={t('analytics_title')}
          >
            {RANGE_OPTIONS.map(o => (
              <option key={o.days} value={o.days}>{t(o.labelKey)}</option>
            ))}
          </Select>
        </div>
      </header>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('business')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'business'
                ? 'border-emerald-500 text-emerald-600 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            {t('analytics_business_tab')}
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'nutrition'
                ? 'border-emerald-500 text-emerald-600 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 font-medium'
            }`}
          >
            <Utensils className="w-5 h-5" />
            {t('analytics_nutrition_tab')}
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'training'
                ? 'border-emerald-500 text-emerald-600 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 font-medium'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            {t('analytics_training_tab')}
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'business' && <BusinessAnalytics data={data?.business} loading={isLoading} />}
            {activeTab === 'nutrition' && <NutritionAnalytics data={data?.nutrition} loading={isLoading} />}
            {activeTab === 'training' && <TrainingAnalytics data={data?.training} loading={isLoading} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
