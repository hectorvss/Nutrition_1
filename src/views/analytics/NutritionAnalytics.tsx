import React from 'react';
import { Utensils, Droplets, AlertTriangle, Pill, Target, Flame, Scale, ClipboardCheck, TrendingUp, Wheat, Award, Beef, Croissant } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard, DeficitClient, ChartCard, SectionHeader, ChartLegend, EmptyChart, LoadingProvider, SkeletonBlock, Skeleton, useAnalyticsLoading } from './components';

/* ============================================================================
 * Pestaña NUTRITION de Analytics.
 * Recibe `data` = respuesta `nutrition` del endpoint /manager/analytics.
 * Los KPIs nuevos viven en data.<clave> (los calcula server/lib/analytics/nutrition.ts).
 * Layout minimalista (estilo Stripe/Shopify): KPIs agrupados por categorías.
 * ========================================================================== */

const PALETTE = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#a855f7',
  rose: '#f43f5e',
};

const AXIS_TICK = { fontSize: 12, fill: '#94a3b8' };
const GRID_PROPS = { strokeDasharray: '3 3', stroke: '#f1f5f9' };
// TODO(dark): recharts contentStyle is a plain JS object and can't read the `.dark`
// class. White tooltip stays legible in dark; for a true dark tooltip use bg #1e293b /
// text #f1f5f9 behind a theme hook.
const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 };

export default function NutritionAnalytics({ data, loading }: any) {
  const { t } = useLanguage();
  const isLoading = !!loading;

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
  const intakeSplitData = [
    { name: t('nutri_deficit', { defaultValue: 'En déficit' }), value: intakeSplit.deficit, color: PALETTE.blue },
    { name: t('nutri_maintenance', { defaultValue: 'En mantenimiento' }), value: intakeSplit.maintenance, color: PALETTE.emerald },
    { name: t('nutri_surplus', { defaultValue: 'En superávit' }), value: intakeSplit.surplus, color: PALETTE.amber },
  ].filter(d => d.value > 0);
  const hasIntakeSplit = intakeSplitData.length > 0;

  const macroVsTarget = data?.macroVsTarget || { protein: 0, carbs: 0, fats: 0 };
  const deviation = Number(data?.avgCalorieDeviation || 0);
  const weightChange = Number(data?.portfolioWeightChange || 0);

  return (
    <LoadingProvider value={!!loading}>
    <div className="space-y-5">
      {/* ===================== Adherencia y hábitos ===================== */}
      <SectionHeader title={t('nutri_cat_adherence', { defaultValue: 'Adherencia y hábitos' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('nutrition_consistency_label', { defaultValue: 'Consistencia Nutricional' })}
          value={`${data?.consistency || '0'}%`}
          icon={<Utensils />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('hydration_goal')}
          value={`${data?.avgHydration || '0'}%`}
          icon={<Droplets />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('supplements_logged')}
          value={`${data?.supplementAdherence || '0'}%`}
          icon={<Pill />}
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('alcohol_frequency')}
          value={data?.alcoholAlerts || '0'}
          unit={t('analytics_alerts_unit')}
          change={data?.alcoholAlerts > 5 ? t('analytics_high') : t('analytics_low')}
          isPositive={data?.alcoholAlerts <= 5}
          icon={<AlertTriangle />}
          iconColor="text-rose-600"
          changeLabel={data?.alcoholAlerts > 0 ? t('analytics_reports_this_month', { count: data.alcoholAlerts }) : t('analytics_no_alerts')}
        />
        <StatCard
          title={t('nutri_checkin_count', { defaultValue: 'Check-ins de nutrición' })}
          value={data?.nutritionCheckInCount || 0}
          icon={<ClipboardCheck />}
          iconColor="text-slate-500"
          changeLabel={t('nutri_in_window', { defaultValue: 'en la ventana seleccionada' })}
        />
      </div>

      {/* ===================== Calorías y macros ===================== */}
      <SectionHeader title={t('nutri_cat_calories', { defaultValue: 'Calorías y macros' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('nutri_calorie_goal_compliance', { defaultValue: 'Clientes en objetivo calórico' })}
          value={`${data?.calorieGoalCompliance || 0}%`}
          icon={<Target />}
          iconColor="text-emerald-600"
          change="±10%"
          isNeutral
          changeLabel={t('nutri_within_target', { defaultValue: 'dentro de ±10% del objetivo' })}
        />
        <StatCard
          title={t('nutri_avg_calorie_intake', { defaultValue: 'Ingesta calórica media diaria' })}
          value={data?.avgCalorieIntake || 0}
          unit="kcal"
          icon={<Flame />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('nutri_avg_deviation', { defaultValue: 'Desviación calórica media' })}
          value={`${deviation > 0 ? '+' : ''}${deviation}`}
          unit="kcal"
          icon={<TrendingUp />}
          iconColor="text-blue-600"
          change={deviation === 0 ? t('analytics_low') : (deviation > 0
            ? t('nutri_above_target', { defaultValue: 'Por encima' })
            : t('nutri_below_target', { defaultValue: 'Por debajo' }))}
          isNeutral
          changeLabel={t('nutri_vs_plan_target', { defaultValue: 'vs objetivo del plan' })}
        />
        <StatCard
          title={t('nutri_avg_protein', { defaultValue: 'Proteína media (objetivo)' })}
          value={macroVsTarget.protein || 0}
          unit="g"
          icon={<Beef />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('nutri_avg_carbs', { defaultValue: 'Carbohidratos medios (objetivo)' })}
          value={macroVsTarget.carbs || 0}
          unit="g"
          icon={<Croissant />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('nutri_avg_fats', { defaultValue: 'Grasas medias (objetivo)' })}
          value={macroVsTarget.fats || 0}
          unit="g"
          icon={<Droplets />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('nutri_avg_fiber', { defaultValue: 'Fibra media (plan)' })}
          value={data?.avgFiber || 0}
          unit="g"
          icon={<Wheat />}
          iconColor="text-emerald-600"
        />
      </div>

      {/* ===================== Composición y objetivos ===================== */}
      <SectionHeader title={t('nutri_cat_composition', { defaultValue: 'Composición y objetivos' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('nutri_weight_change', { defaultValue: 'Cambio de peso de la cartera' })}
          value={`${weightChange > 0 ? '+' : ''}${weightChange}`}
          unit="kg"
          icon={<Scale />}
          iconColor="text-purple-600"
          change={weightChange === 0 ? t('analytics_low') : (weightChange > 0
            ? t('nutri_weight_up', { defaultValue: 'Al alza' })
            : t('nutri_weight_down', { defaultValue: 'A la baja' }))}
          isNeutral
          changeLabel={t('vs_last_month')}
        />
        <StatCard
          title={t('nutri_best_client', { defaultValue: 'Mejor cliente (adherencia)' })}
          value={data?.bestClient?.name || '—'}
          unit={data?.bestClient ? `${data.bestClient.adherence}%` : ''}
          icon={<Award />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('nutri_worst_client', { defaultValue: 'Cliente a vigilar (adherencia)' })}
          value={data?.worstClient?.name || '—'}
          unit={data?.worstClient ? `${data.worstClient.adherence}%` : ''}
          icon={<AlertTriangle />}
          iconColor="text-rose-600"
        />
      </div>

      {/* ===================== Tendencias y distribución ===================== */}
      <SectionHeader title={t('nutri_cat_trends', { defaultValue: 'Tendencias y distribución' })} />

      {/* Ingesta vs objetivo calórico (chart SVG existente) */}
      <ChartCard
        title={t('calorie_intake_goal')}
        subtitle={t('calorie_intake_desc')}
        legend={<ChartLegend items={[
          { color: PALETTE.emerald, label: t('intake_label') },
          { color: '#94a3b8', label: t('goal_label') },
        ]} />}
      >
        <div className="h-[300px] w-full relative pb-6 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px bg-slate-50 dark:bg-slate-800"></div>
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
      </ChartCard>

      {/* Tendencias de adherencia e hidratación */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard
          title={t('nutri_adherence_trend_title', { defaultValue: 'Tendencia de adherencia' })}
          subtitle={t('nutri_adherence_trend_desc', { defaultValue: 'Adherencia media de los check-ins en la ventana.' })}
        >
          {adherenceTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={adherenceTrendData}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="value" stroke={PALETTE.emerald} strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_adherence_data', { defaultValue: 'Sin datos de adherencia nutricional.' })} height={260} />
          )}
        </ChartCard>

        <ChartCard
          title={t('nutri_hydration_trend_title', { defaultValue: 'Tendencia de hidratación' })}
          subtitle={t('nutri_hydration_trend_desc', { defaultValue: 'Hidratación media de los check-ins en la ventana.' })}
        >
          {hydrationTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={hydrationTrendData}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="value" stroke={PALETTE.blue} strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_hydration_data', { defaultValue: 'Sin datos de hidratación.' })} height={260} />
          )}
        </ChartCard>
      </div>

      {/* Tendencia de peso + Distribución de macros */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard
          title={t('nutri_weight_trend_title', { defaultValue: 'Tendencia de peso' })}
          subtitle={t('nutri_weight_trend_desc', { defaultValue: 'Peso medio reportado por los clientes en cada segmento.' })}
        >
          {hasWeightTrend ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weightTrendData}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip formatter={(v: any) => `${v} kg`} contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="value" stroke={PALETTE.purple} strokeWidth={3} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_weight_data', { defaultValue: 'Sin registros de peso en los check-ins.' })} height={260} />
          )}
        </ChartCard>

        <ChartCard
          title={t('nutri_macro_dist_title', { defaultValue: 'Distribución de macros' })}
          subtitle={t('nutri_macro_dist_desc', { defaultValue: 'Reparto calórico medio de los planes de la cartera.' })}
          legend={hasMacroDist ? <ChartLegend items={macroPieData.map(d => ({ color: d.color, label: d.name }))} /> : undefined}
        >
          {hasMacroDist ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={macroPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {macroPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_plan_data', { defaultValue: 'Sin datos de planes de nutrición.' })} height={260} />
          )}
        </ChartCard>
      </div>

      {/* Distribución de objetivos + Reparto energético */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard
          title={t('nutri_goal_dist_title', { defaultValue: 'Distribución de objetivos' })}
          subtitle={t('nutri_goal_dist_desc', { defaultValue: 'Clientes según su objetivo declarado en el perfil.' })}
          legend={hasGoalDist ? <ChartLegend items={goalPieData.map(d => ({ color: d.color, label: d.name }))} /> : undefined}
        >
          {hasGoalDist ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={goalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {goalPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_goal_data', { defaultValue: 'Sin objetivos definidos en los perfiles.' })} height={260} />
          )}
        </ChartCard>

        <ChartCard
          title={t('nutri_intake_split_title', { defaultValue: 'Reparto energético' })}
          subtitle={t('nutri_intake_split_desc', { defaultValue: 'Clientes según su ingesta media frente al objetivo del plan.' })}
          legend={hasIntakeSplit ? <ChartLegend items={intakeSplitData.map(d => ({ color: d.color, label: d.name }))} /> : undefined}
        >
          {hasIntakeSplit ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={intakeSplitData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {intakeSplitData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label={t('nutri_no_intake_split_data', { defaultValue: 'Sin datos de reparto energético.' })} height={260} />
          )}
        </ChartCard>
      </div>

      {/* Adherencia por cliente */}
      <ChartCard
        title={t('nutri_client_adherence_title', { defaultValue: 'Adherencia por cliente' })}
        subtitle={t('nutri_client_adherence_desc', { defaultValue: 'Ranking de adherencia nutricional media por cliente.' })}
      >
        {adherenceBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(260, adherenceBarData.length * 42)}>
            <BarChart data={adherenceBarData} layout="vertical" margin={{ left: 20, right: 24 }}>
              <CartesianGrid {...GRID_PROPS} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={AXIS_TICK} />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip formatter={(v: any) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="adherence" radius={[0, 6, 6, 0]}>
                {adherenceBarData.map((d, i) => (
                  <Cell key={i} fill={d.adherence >= 80 ? PALETTE.emerald : d.adherence >= 60 ? PALETTE.amber : PALETTE.rose} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label={t('nutri_no_adherence_data', { defaultValue: 'Sin datos de adherencia nutricional.' })} height={260} />
        )}
      </ChartCard>

      {/* ===================== Clientes a vigilar ===================== */}
      <SectionHeader title={t('nutri_cat_watch', { defaultValue: 'Clientes a vigilar' })} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-6">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="space-y-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white mb-4">{t('top_deficit_clients')}</h3>
            <div className="flex flex-col gap-3">
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
                <p className="text-sm text-slate-400 text-center py-8">{t('no_deficit_data')}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </LoadingProvider>
  );
}
