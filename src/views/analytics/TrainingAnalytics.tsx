import React from 'react';
import {
  CheckCircle2, Dumbbell, ListChecks, Gauge,
  Activity, Timer, Trophy, UserX, Layers, Star, CalendarRange, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard, DistributionItem, FrequencyItem } from './components';

/* ============================================================================
 * Pestaña TRAINING de Analytics.
 * Recibe `data` = respuesta `training` del endpoint /manager/analytics.
 * Los KPIs nuevos viven en data.<clave> (los calcula server/lib/analytics/training.ts).
 * Añade aquí tarjetas y gráficas nuevas usando los componentes de ./components.
 * ========================================================================== */

const PALETTE = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#a855f7',
  orange: '#f97316',
};
const MUSCLE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#f97316', '#06b6d4', '#f43f5e'];

/** Tarjeta contenedora estándar para una gráfica. */
function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Estado vacío coherente para una gráfica sin datos. */
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] w-full flex items-center justify-center text-sm text-slate-400">
      {label}
    </div>
  );
}

export default function TrainingAnalytics({ data }: any) {
  const { t } = useLanguage();
  // Escala dinámica del gráfico de volumen: se adapta al pico real de
  // volumen movido (con 15% de margen) en lugar de un tope fijo de 60.000 kg.
  const volMax = Math.max(
    1,
    ...((data?.volumeTrends as number[]) || [])
  ) * 1.15;
  // Etiquetas del eje X: el backend divide la ventana seleccionada en 7
  // segmentos y devuelve la fecha de inicio de cada uno en `trendLabels`.
  const dayLabels: string[] = (data?.trendLabels as string[]) || [];

  // ---- KPIs nuevos (data.training.<clave>) -----------------------------
  const completedWorkouts = data?.completedWorkouts ?? 0;
  const avgSessionDuration = data?.avgSessionDuration ?? null;
  const personalRecords = data?.personalRecords ?? 0;
  const clientsNoTraining7d = data?.clientsNoTraining7d ?? 0;
  const programAdherence = data?.programAdherence ?? null;
  const avgSetsPerSession = data?.avgSetsPerSession ?? 0;
  const topExercise = data?.topExercise ?? null;
  const sessionsPerClientWeek = data?.sessionsPerClientWeek ?? 0;
  const loadProgression = data?.loadProgression ?? null;

  const volumeByMuscle: any[] = data?.volumeByMuscle || [];
  const sessionsTrend: number[] = data?.sessionsTrend || [];
  const rpeTrend: number[] = data?.rpeTrend || [];
  const adherenceByClient: any[] = data?.adherenceByClient || [];
  const keyLiftTrend: number[] = data?.keyLiftTrend || [];
  const keyLiftName: string | null = data?.keyLiftName ?? null;

  // Series con etiquetas temporales para recharts.
  const sessionsData = sessionsTrend.map((v, i) => ({
    label: dayLabels[i] || `${i + 1}`,
    value: v,
  }));
  const rpeData = rpeTrend.map((v, i) => ({
    label: dayLabels[i] || `${i + 1}`,
    value: v,
  }));
  const keyLiftData = keyLiftTrend.map((v, i) => ({
    label: dayLabels[i] || `${i + 1}`,
    value: v,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        <StatCard
          title={t('workout_completion')}
          value={`${data?.avgCompletion || "0"}%`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('volume_lifted')}
          value={`${((data?.totalVolume || 0) / 1000).toFixed(1)}k`}
          unit="kg"
          icon={<Dumbbell className="w-6 h-6" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          showChart={true}
          chartColor="text-orange-500"
        />
        <StatCard
          title={t('active_programs')}
          value={data?.activePrograms ?? "0"}
          icon={<ListChecks className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('rpe_score')}
          value={data?.avgRPE || "0"}
          icon={<Gauge className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('volume_intensity_trends')}</h2>
            <p className="text-sm text-slate-500">{t('volume_intensity_desc')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500"></span>
              <span className="text-slate-600">{t('volume_kg')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-500"></span>
              <span className="text-slate-600">{t('intensity_rpe')}</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full relative pb-6">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px border-dashed border-t border-slate-200"></div>
            ))}
          </div>
          <svg className="absolute inset-0 w-full h-full pb-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="gradientVolume" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            {/* Volume Path */}
            <path
              className="opacity-50"
              d={`M0,300 ${data?.volumeTrends?.map((v: number, i: number) => `L${(i / (data.volumeTrends.length - 1)) * 1000},${300 - (v / volMax) * 300}`).join(' ')} L1000,300 Z`}
              fill="url(#gradientVolume)"
            />
            <path
              fill="none"
              d={data?.volumeTrends?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${(i / (data.volumeTrends.length - 1)) * 1000},${300 - (v / volMax) * 300}`).join(' ')}
              stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
            />
            {/* Intensity Path */}
            <path
              fill="none"
              d={data?.intensityTrends?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${(i / (data.intensityTrends.length - 1)) * 1000},${300 - (v / 10) * 300}`).join(' ')}
              stroke="#3b82f6" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            />
            {data?.volumeTrends?.map((v: number, i: number) => {
              const x = (i / (data.volumeTrends.length - 1)) * 1000;
              const y = 300 - (v / volMax) * 300;
              return <circle key={i} cx={x} cy={y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2"></circle>;
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {dayLabels.map((d, i) => (
              <span key={i} className="text-xs text-slate-400 font-medium w-10 text-center">{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">{t('training_distribution')}</h3>
          </div>
          <div className="flex items-center gap-8 h-full">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="12"></circle>
                {data?.distribution?.map((item: any, idx: number) => {
                  const colors = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981'];
                  const total = data.distribution.reduce((acc: number, cur: any) => acc + cur.value, 0);
                  const prevValues = data.distribution.slice(0, idx).reduce((acc: number, cur: any) => acc + cur.value, 0);
                  return (
                    <circle
                      key={idx}
                      cx="50" cy="50" fill="transparent" r="40"
                      stroke={colors[idx % colors.length]}
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (item.value / (total || 1)) * 251.2}
                      strokeWidth="12"
                      transform={`rotate(${(prevValues / (total || 1)) * 360} 50 50)`}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">100%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">{t('breakdown_label')}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {data?.distribution?.map((item: any, idx: number) => {
                const colors = ['bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-emerald-500'];
                return (
                  <DistributionItem key={idx} color={colors[idx % colors.length]} label={item.label} value={`${item.value}%`} />
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">{t('muscle_frequency')}</h3>
          </div>
          <div className="flex flex-col h-full justify-center space-y-4">
            {data?.muscleFrequency?.map((item: any, idx: number) => {
              const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500', 'bg-amber-500', 'bg-orange-500'];
              return (
                <FrequencyItem key={idx} label={item.label} percentage={item.percentage} color={colors[idx % colors.length]} />
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================================
       * KPIs AMPLIADOS DE ENTRENAMIENTO
       * ================================================================== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">{t('training_extra_kpis', { defaultValue: 'Métricas de entrenamiento' })}</h2>
        <p className="text-sm text-slate-500 mb-4">{t('training_extra_kpis_desc', { defaultValue: 'Indicadores detallados de actividad, progreso y adherencia.' })}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('completed_workouts', { defaultValue: 'Entrenos completados' })}
            value={completedWorkouts}
            icon={<Activity className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title={t('avg_session_duration', { defaultValue: 'Duración media de sesión' })}
            value={avgSessionDuration != null ? avgSessionDuration : '—'}
            unit={avgSessionDuration != null ? t('minutes_short', { defaultValue: 'min' }) : undefined}
            icon={<Timer className="w-6 h-6" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title={t('personal_records', { defaultValue: 'Récords personales (PRs)' })}
            value={personalRecords}
            icon={<Trophy className="w-6 h-6" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title={t('clients_no_training_7d', { defaultValue: 'Clientes sin entrenar (7d)' })}
            value={clientsNoTraining7d}
            icon={<UserX className="w-6 h-6" />}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <StatCard
            title={t('program_adherence', { defaultValue: 'Adherencia al programa' })}
            value={programAdherence != null ? `${programAdherence}%` : '—'}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title={t('avg_sets_per_session', { defaultValue: 'Series medias por sesión' })}
            value={avgSetsPerSession}
            icon={<Layers className="w-6 h-6" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title={t('top_exercise', { defaultValue: 'Ejercicio más usado' })}
            value={topExercise?.name || '—'}
            icon={<Star className="w-6 h-6" />}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            title={t('sessions_per_client_week', { defaultValue: 'Sesiones / cliente / semana' })}
            value={sessionsPerClientWeek}
            icon={<CalendarRange className="w-6 h-6" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title={t('load_progression', { defaultValue: 'Progresión de carga media' })}
            value={loadProgression != null ? `${loadProgression > 0 ? '+' : ''}${loadProgression}%` : '—'}
            icon={<TrendingUp className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>
      </div>

      {/* ---- Gráficas ampliadas ------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('volume_by_muscle', { defaultValue: 'Volumen por grupo muscular' })}
          subtitle={t('volume_by_muscle_desc', { defaultValue: 'Kg movidos por músculo en la ventana.' })}
        >
          {volumeByMuscle.length === 0 ? (
            <EmptyChart label={t('no_training_data', { defaultValue: 'Sin datos de entrenamiento' })} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={volumeByMuscle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${Number(v).toLocaleString()} kg`, t('volume_kg')]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {volumeByMuscle.map((_, i) => (
                    <Cell key={i} fill={MUSCLE_COLORS[i % MUSCLE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t('sessions_per_week', { defaultValue: 'Sesiones por periodo' })}
          subtitle={t('sessions_per_week_desc', { defaultValue: 'Número de entrenos registrados por segmento.' })}
        >
          {sessionsData.length === 0 ? (
            <EmptyChart label={t('no_training_data', { defaultValue: 'Sin datos de entrenamiento' })} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [v, t('sessions_label', { defaultValue: 'Sesiones' })]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="value" fill={PALETTE.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t('rpe_trend', { defaultValue: 'Tendencia de RPE' })}
          subtitle={t('rpe_trend_desc', { defaultValue: 'Intensidad media percibida por segmento.' })}
        >
          {rpeData.length === 0 ? (
            <EmptyChart label={t('no_training_data', { defaultValue: 'Sin datos de entrenamiento' })} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rpeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [v, t('intensity_rpe')]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Line
                  type="monotone" dataKey="value" stroke={PALETTE.amber} strokeWidth={3}
                  dot={{ r: 4, fill: '#ffffff', stroke: PALETTE.amber, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t('key_lift_progression', { defaultValue: 'Progresión de levantamiento clave' })}
          subtitle={
            keyLiftName
              ? t('key_lift_progression_desc', { defaultValue: 'Peso máximo por segmento' }) + `: ${keyLiftName}`
              : t('key_lift_progression_desc', { defaultValue: 'Peso máximo por segmento' })
          }
        >
          {keyLiftData.length === 0 || !keyLiftName ? (
            <EmptyChart label={t('no_training_data', { defaultValue: 'Sin datos de entrenamiento' })} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={keyLiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${v} kg`, t('max_weight', { defaultValue: 'Peso máx.' })]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Line
                  type="monotone" dataKey="value" stroke={PALETTE.purple} strokeWidth={3}
                  dot={{ r: 4, fill: '#ffffff', stroke: PALETTE.purple, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ---- Adherencia por cliente (ranking) ---------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">{t('adherence_by_client', { defaultValue: 'Adherencia por cliente' })}</h3>
          <p className="text-sm text-slate-500">{t('adherence_by_client_desc', { defaultValue: 'Sesiones realizadas frente a las planificadas.' })}</p>
        </div>
        {adherenceByClient.length === 0 ? (
          <EmptyChart label={t('no_adherence_data', { defaultValue: 'Sin programas asignados' })} />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, adherenceByClient.length * 44)}>
            <BarChart data={adherenceByClient} layout="vertical" margin={{ left: 24, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis
                type="category" dataKey="name" width={120}
                tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                tickFormatter={(v: string) => String(v).length > 16 ? String(v).slice(0, 15) + '…' : String(v)}
              />
              <Tooltip
                formatter={(v: any) => [`${v}%`, t('program_adherence', { defaultValue: 'Adherencia al programa' })]}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                {adherenceByClient.map((row: any, i: number) => (
                  <Cell
                    key={i}
                    fill={row.pct >= 80 ? PALETTE.emerald : row.pct >= 50 ? PALETTE.amber : PALETTE.orange}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
