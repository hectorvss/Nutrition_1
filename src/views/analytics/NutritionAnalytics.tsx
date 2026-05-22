import React from 'react';
import { Utensils, Droplets, AlertTriangle, Pill, Target, Flame, Scale, ClipboardCheck, TrendingUp, Wheat, Award } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard, DeficitClient } from './components';

/* ============================================================================
 * Pestaña NUTRITION de Analytics.
 * Recibe `data` = respuesta `nutrition` del endpoint /manager/analytics.
 * Los KPIs nuevos viven en data.<clave> (los calcula server/lib/analytics/nutrition.ts).
 * ========================================================================== */

const PALETTE = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#a855f7',
  rose: '#f43f5e',
};

/** Tarjeta contenedora de gráfica, coherente con el chart de calorías. */
function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function NutritionAnalytics({ data }: any) {
  const { t } = useLanguage();

  // Escala dinámica del gráfico de calorías existente.
  const calMax = Math.max(
    1,
    ...((data?.calories?.intake as number[]) || []),
    ...((data?.calories?.goal as number[]) || [])
  ) * 1.15;

  const trendLabels: string[] = (data?.trendLabels as string[]) || [];

  // --- Datos derivados para gráficas -----------------------------------------
  const macroDist = data?.macroDistribution || { protein: 0, carbs: 0, fats: 0 };
  const macroPieData = [
    { name: t('nutri_macro_protein', { defaultValue: 'Proteína' }), value: macroDist.protein, color: PALETTE.emerald },
    { name: t('nutri_macro_carbs', { defaultValue: 'Carbohidratos' }), value: macroDist.carbs, color: PALETTE.blue },
    { name: t('nutri_macro_fats', { defaultValue: 'Grasas' }), value: macroDist.fats, color: PALETTE.amber },
  ];
  const hasMacroDist = macroDist.protein + macroDist.carbs + macroDist.fats > 0;

  const adherenceTrend: number[] = data?.adherenceTrend || [];
  const hydrationTrend: number[] = data?.hydrationTrend || [];
  const weightTrendSeries: number[] = data?.weightTrendSeries || [];

  const adherenceTrendData = adherenceTrend.map((v, i) => ({ label: trendLabels[i] || `${i + 1}`, value: v }));
  const hydrationTrendData = hydrationTrend.map((v, i) => ({ label: trendLabels[i] || `${i + 1}`, value: v }));
  const weightTrendData = weightTrendSeries.map((v, i) => ({ label: trendLabels[i] || `${i + 1}`, value: v }));
  const hasWeightTrend = weightTrendSeries.some(v => v > 0);

  const clientAdherence: { name: string; adherence: number }[] = data?.clientAdherence || [];
  const adherenceBarData = clientAdherence.slice(0, 8);

  const goalDist = data?.goalDistribution || { cutting: 0, bulking: 0, maintenance: 0, other: 0 };
  const goalPieData = [
    { name: t('nutri_goal_cutting', { defaultValue: 'Definición' }), value: goalDist.cutting, color: PALETTE.rose },
    { name: t('nutri_goal_bulking', { defaultValue: 'Volumen' }), value: goalDist.bulking, color: PALETTE.blue },
    { name: t('nutri_goal_maintenance', { defaultValue: 'Mantenimiento' }), value: goalDist.maintenance, color: PALETTE.emerald },
    { name: t('nutri_goal_other', { defaultValue: 'Otros' }), value: goalDist.other, color: PALETTE.purple },
  ].filter(d => d.value > 0);
  const hasGoalDist = goalPieData.length > 0;

  const intakeSplit = data?.intakeSplit || { deficit: 0, maintenance: 0, surplus: 0 };

  const macroVsTarget = data?.macroVsTarget || { protein: 0, carbs: 0, fats: 0 };

  const deviation = Number(data?.avgCalorieDeviation || 0);

  return (
    <div className="space-y-6">
      {/* ===== Tarjetas existentes ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        <StatCard
          title={t('nutrition_consistency_label', { defaultValue: 'Consistencia Nutricional' })}
          value={`${data?.consistency || "0"}%`}
          icon={<Utensils className="w-6 h-6" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title={t('hydration_goal')}
          value={`${data?.avgHydration || "0"}%`}
          icon={<Droplets className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('alcohol_frequency')}
          value={data?.alcoholAlerts || "0"}
          unit={t('analytics_alerts_unit')}
          change={data?.alcoholAlerts > 5 ? t('analytics_high') : t('analytics_low')}
          isPositive={data?.alcoholAlerts <= 5}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          changeLabel={data?.alcoholAlerts > 0 ? t('analytics_reports_this_month', { count: data.alcoholAlerts }) : t('analytics_no_alerts')}
        />
        <StatCard
          title={t('supplements_logged')}
          value={`${data?.supplementAdherence || "0"}%`}
          icon={<Pill className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* ===== Nuevas tarjetas de KPIs ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {t('nutri_kpis_section', { defaultValue: 'Métricas calóricas y de macros' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('nutri_calorie_goal_compliance', { defaultValue: 'Clientes en objetivo calórico' })}
            value={`${data?.calorieGoalCompliance || 0}%`}
            icon={<Target className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            changeLabel={t('nutri_within_target', { defaultValue: 'dentro de ±10% del objetivo' })}
            change={`±10%`}
            isNeutral
          />
          <StatCard
            title={t('nutri_avg_calorie_intake', { defaultValue: 'Ingesta calórica media diaria' })}
            value={data?.avgCalorieIntake || 0}
            unit="kcal"
            icon={<Flame className="w-6 h-6" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title={t('nutri_avg_deviation', { defaultValue: 'Desviación calórica media' })}
            value={`${deviation > 0 ? '+' : ''}${deviation}`}
            unit="kcal"
            icon={<TrendingUp className="w-6 h-6" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            change={deviation === 0 ? t('analytics_low') : (deviation > 0
              ? t('nutri_above_target', { defaultValue: 'Por encima' })
              : t('nutri_below_target', { defaultValue: 'Por debajo' }))}
            isNeutral
            changeLabel={t('nutri_vs_plan_target', { defaultValue: 'vs objetivo del plan' })}
          />
          <StatCard
            title={t('nutri_checkin_count', { defaultValue: 'Check-ins de nutrición' })}
            value={data?.nutritionCheckInCount || 0}
            icon={<ClipboardCheck className="w-6 h-6" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            changeLabel={t('nutri_in_window', { defaultValue: 'en la ventana seleccionada' })}
          />
          <StatCard
            title={t('nutri_avg_protein', { defaultValue: 'Proteína media (objetivo)' })}
            value={macroVsTarget.protein || 0}
            unit="g"
            icon={<Utensils className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title={t('nutri_avg_carbs', { defaultValue: 'Carbohidratos medios (objetivo)' })}
            value={macroVsTarget.carbs || 0}
            unit="g"
            icon={<Utensils className="w-6 h-6" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title={t('nutri_avg_fats', { defaultValue: 'Grasas medias (objetivo)' })}
            value={macroVsTarget.fats || 0}
            unit="g"
            icon={<Utensils className="w-6 h-6" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title={t('nutri_avg_fiber', { defaultValue: 'Fibra media (plan)' })}
            value={data?.avgFiber || 0}
            unit="g"
            icon={<Wheat className="w-6 h-6" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title={t('nutri_weight_change', { defaultValue: 'Cambio de peso medio de la cartera' })}
            value={`${(data?.portfolioWeightChange || 0) > 0 ? '+' : ''}${data?.portfolioWeightChange || 0}`}
            unit="kg"
            icon={<Scale className="w-6 h-6" />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            changeLabel={t('vs_last_month')}
          />
          <StatCard
            title={t('nutri_best_client', { defaultValue: 'Mejor cliente (adherencia)' })}
            value={data?.bestClient?.name || '—'}
            unit={data?.bestClient ? `${data.bestClient.adherence}%` : ''}
            icon={<Award className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title={t('nutri_worst_client', { defaultValue: 'Cliente a vigilar (adherencia)' })}
            value={data?.worstClient?.name || '—'}
            unit={data?.worstClient ? `${data.worstClient.adherence}%` : ''}
            icon={<AlertTriangle className="w-6 h-6" />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
        </div>
      </div>

      {/* ===== Reparto déficit / mantenimiento / superávit ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {t('nutri_intake_split_title', { defaultValue: 'Reparto energético de la cartera' })}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {t('nutri_intake_split_desc', { defaultValue: 'Clientes según su ingesta media frente al objetivo del plan.' })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{intakeSplit.deficit}</p>
            <p className="text-sm font-medium text-slate-600 mt-1">{t('nutri_deficit', { defaultValue: 'En déficit' })}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">{intakeSplit.maintenance}</p>
            <p className="text-sm font-medium text-slate-600 mt-1">{t('nutri_maintenance', { defaultValue: 'En mantenimiento' })}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{intakeSplit.surplus}</p>
            <p className="text-sm font-medium text-slate-600 mt-1">{t('nutri_surplus', { defaultValue: 'En superávit' })}</p>
          </div>
        </div>
      </div>

      {/* ===== Chart de calorías existente ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('calorie_intake_goal')}</h2>
            <p className="text-sm text-slate-500">{t('calorie_intake_desc')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-500"></span>
              <span className="text-slate-600">{t('intake_label')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400"></span>
              <span className="text-slate-600">{t('goal_label')}</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full relative pb-6 border-b border-slate-100 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px bg-slate-50"></div>
            ))}
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 700 300">
            <path
              d={data?.calories?.goal?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${300 - (v / calMax) * 300}`).join(' ')}
              fill="none" stroke="#94a3b8" strokeDasharray="5,5" strokeWidth="2"
            />
            <path
              d={`M0,300 ${data?.calories?.intake?.map((v: number, i: number) => `L${i * 100},${300 - (v / calMax) * 300}`).join(' ')} L${(data?.calories?.intake?.length - 1) * 100},300 Z`}
              fill="url(#gradientPrimary)" opacity="0.8"
            />
            <path
              d={data?.calories?.intake?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${300 - (v / calMax) * 300}`).join(' ')}
              fill="none" stroke="#10b981" strokeWidth="3"
            />
            <defs>
              <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 font-medium px-2">
            {trendLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Gráficas nuevas: donuts ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('nutri_macro_dist_title', { defaultValue: 'Distribución media de macros' })}
          subtitle={t('nutri_macro_dist_desc', { defaultValue: 'Reparto calórico medio de los planes de la cartera.' })}
        >
          {hasMacroDist ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={macroPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {macroPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 italic text-center py-16">
              {t('nutri_no_plan_data', { defaultValue: 'Sin datos de planes de nutrición.' })}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title={t('nutri_goal_dist_title', { defaultValue: 'Distribución de objetivos de los clientes' })}
          subtitle={t('nutri_goal_dist_desc', { defaultValue: 'Clientes según su objetivo declarado en el perfil.' })}
        >
          {hasGoalDist ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={goalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {goalPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 italic text-center py-16">
              {t('nutri_no_goal_data', { defaultValue: 'Sin objetivos definidos en los perfiles.' })}
            </p>
          )}
        </ChartCard>
      </div>

      {/* ===== Gráficas nuevas: tendencias ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('nutri_adherence_trend_title', { defaultValue: 'Tendencia de adherencia nutricional' })}
          subtitle={t('nutri_adherence_trend_desc', { defaultValue: 'Adherencia media de los check-ins en la ventana.' })}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={adherenceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Line type="monotone" dataKey="value" stroke={PALETTE.emerald} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t('nutri_hydration_trend_title', { defaultValue: 'Tendencia de hidratación' })}
          subtitle={t('nutri_hydration_trend_desc', { defaultValue: 'Hidratación media de los check-ins en la ventana.' })}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hydrationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Line type="monotone" dataKey="value" stroke={PALETTE.blue} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ===== Tendencia de peso agregado ===== */}
      <ChartCard
        title={t('nutri_weight_trend_title', { defaultValue: 'Tendencia de peso agregado de la cartera' })}
        subtitle={t('nutri_weight_trend_desc', { defaultValue: 'Peso medio reportado por los clientes en cada segmento.' })}
      >
        {hasWeightTrend ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => `${v} kg`} />
              <Line type="monotone" dataKey="value" stroke={PALETTE.purple} strokeWidth={3} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-16">
            {t('nutri_no_weight_data', { defaultValue: 'Sin registros de peso en los check-ins.' })}
          </p>
        )}
      </ChartCard>

      {/* ===== Adherencia por cliente (barras horizontales) ===== */}
      <ChartCard
        title={t('nutri_client_adherence_title', { defaultValue: 'Adherencia por cliente' })}
        subtitle={t('nutri_client_adherence_desc', { defaultValue: 'Ranking de adherencia nutricional media por cliente.' })}
      >
        {adherenceBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(260, adherenceBarData.length * 42)}>
            <BarChart data={adherenceBarData} layout="vertical" margin={{ left: 20, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Bar dataKey="adherence" radius={[0, 6, 6, 0]}>
                {adherenceBarData.map((d, i) => (
                  <Cell key={i} fill={d.adherence >= 80 ? PALETTE.emerald : d.adherence >= 60 ? PALETTE.amber : PALETTE.rose} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-16">
            {t('nutri_no_adherence_data', { defaultValue: 'Sin datos de adherencia nutricional.' })}
          </p>
        )}
      </ChartCard>

      {/* ===== Top deficits existente ===== */}
      <div className="pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">{t('top_deficit_clients')}</h3>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {data?.topDeficits && data.topDeficits.length > 0 ? (
              data.topDeficits.map((client: any, idx: number) => (
                <DeficitClient
                  key={idx}
                  name={client.name}
                  deficit={client.deficit}
                  severity={client.status === 'High Deficit' ? 'high' : 'med'}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-8">{t('no_deficit_data')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
