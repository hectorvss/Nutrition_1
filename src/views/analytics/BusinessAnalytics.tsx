import React from 'react';
import {
  Users,
  DollarSign,
  Heart,
  Award,
  UserMinus,
  UserPlus,
  TrendingUp,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Repeat,
  Clock,
  MessageSquare,
  CheckSquare,
  CalendarClock,
  Hourglass,
  Percent,
  Banknote,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import {
  StatCard,
  ChartCard,
  SectionHeader,
  ChartLegend,
  EmptyChart,
  ProgressBar,
  CohortRow,
  LoadingProvider,
  SkeletonBlock,
  Skeleton,
  useAnalyticsLoading,
} from './components';

/* ============================================================================
 * Pestaña BUSINESS de Analytics.
 * Recibe `data` = respuesta `business` del endpoint /manager/analytics.
 * Los KPIs viven en data.<clave> (los calcula server/lib/analytics/business.ts).
 *
 * Layout minimalista estilo Stripe/Shopify: KPIs agrupados por categorías,
 * cada categoría precedida por <SectionHeader/>, gráficas dentro de <ChartCard/>.
 * ========================================================================== */

const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#a855f7',
  red: '#ef4444',
  slate: '#94a3b8',
};
const PIE_PALETTE = [COLORS.emerald, COLORS.blue, COLORS.amber, COLORS.purple, COLORS.red, COLORS.slate];

/* Estilo de ejes/grid/tooltip recharts — minimalista, compartido. */
const axisProps = { axisLine: false as const, tickLine: false as const, tick: { fontSize: 12, fill: '#94a3b8' } };
const gridProps = { strokeDasharray: '3 3', stroke: '#f1f5f9', vertical: false };
// TODO(dark): recharts contentStyle is a plain JS object and can't read the `.dark`
// class. White tooltip stays legible in dark (dark text on white) but is visually
// inconsistent. For a true dark tooltip use bg #1e293b / text #f1f5f9 behind a theme hook.
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 };

const CHART_HEIGHT = 280;

function money(v: any): string {
  const n = Number(v) || 0;
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n * 100) / 100}`;
}

export default function BusinessAnalytics({ data, loading }: any) {
  const { t, language } = useLanguage();
  const isLoading = !!loading;
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(new Date().getFullYear(), i, 1).toLocaleString(
      language === 'es' ? 'es-ES' : 'en-US',
      { month: 'short' }
    )
  );

  const stripeConnected = !!data?.stripeConnected;

  const revenueData = monthLabels.map((m, i) => {
    const currentMonth = new Date().getMonth();
    return { month: m, revenue: i <= currentMonth ? data?.monthlyRevenue?.[i] || 0 : null };
  });

  const mrrGrowth = data?.mrrGrowth || [];
  const clientGrowth = data?.clientGrowthByMonth || [];
  const cumulativeGrowth = data?.cumulativeClientGrowth || [];
  const revenueByPlan = data?.revenueByPlan || [];
  const subStatus = data?.subscriptionStatusDistribution || [];
  const payments = data?.successfulVsFailedPayments || [];
  const clientStatus = data?.clientStatusDistribution || [];

  return (
    <LoadingProvider value={!!loading}>
    <div className="space-y-5">
      {/* ============================ CLIENTES ============================ */}
      <SectionHeader
        title={t('biz_cat_clients', { defaultValue: 'Clientes' })}
        subtitle={t('biz_cat_clients_sub', { defaultValue: 'Volumen, captación y retención de tu cartera' })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('analytics_total_clients')}
          value={data?.totalClients || '0'}
          icon={<Users />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_active_clients', { defaultValue: 'Clientes activos' })}
          value={data?.activeClients || '0'}
          icon={<Activity />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_new_clients', { defaultValue: 'Clientes nuevos' })}
          value={data?.newLeads || '0'}
          icon={<UserPlus />}
          iconColor="text-teal-600"
        />
        <StatCard
          title={t('biz_lost_clients', { defaultValue: 'Clientes perdidos' })}
          value={data?.lostClients || '0'}
          icon={<UserMinus />}
          iconColor="text-red-600"
        />
        <StatCard
          title={t('analytics_retention')}
          value={`${data?.retention || '0'}%`}
          icon={<Heart />}
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('analytics_churn_rate')}
          value={`${data?.churnRate || '0'}%`}
          icon={<UserMinus />}
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_client_lifetime', { defaultValue: 'Vida media del cliente' })}
          value={data?.avgClientLifetimeMonths || '0'}
          unit={t('biz_unit_months', { defaultValue: 'meses' })}
          icon={<CalendarClock />}
          iconColor="text-blue-600"
        />
      </div>

      {/* ==================== INGRESOS Y SUSCRIPCIONES ==================== */}
      <SectionHeader
        title={t('biz_cat_revenue', { defaultValue: 'Ingresos y suscripciones' })}
        subtitle={t('biz_cat_revenue_sub', { defaultValue: 'Métricas de facturación recurrente' })}
      />
      {!stripeConnected && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {t('biz_stripe_disconnected', {
            defaultValue: 'Conecta Stripe en Integraciones para ver los KPIs de ingresos y suscripciones.',
          })}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('biz_revenue', { defaultValue: 'Ingresos' })}
          value={money(data?.revenue)}
          icon={<DollarSign />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_net_revenue', { defaultValue: 'Ingreso neto' })}
          value={money(data?.netRevenue)}
          icon={<Banknote />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_mrr', { defaultValue: 'MRR' })}
          value={money(data?.mrr)}
          icon={<TrendingUp />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_arr', { defaultValue: 'ARR' })}
          value={money(data?.arr)}
          icon={<TrendingUp />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_arpu', { defaultValue: 'ARPU' })}
          value={money(data?.arpu)}
          icon={<DollarSign />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_avg_ticket', { defaultValue: 'Ticket medio' })}
          value={money(data?.avgTicket)}
          icon={<Receipt />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('analytics_avg_ltv')}
          value={money(data?.ltv)}
          icon={<Award />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_active_subs', { defaultValue: 'Suscripciones activas' })}
          value={data?.activeSubscriptions || '0'}
          icon={<CreditCard />}
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('biz_active_trials', { defaultValue: 'Trials activos' })}
          value={data?.activeTrials || '0'}
          icon={<Hourglass />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_trial_conversion', { defaultValue: 'Conversión trial→pago' })}
          value={`${data?.trialConversionRate || '0'}%`}
          icon={<Percent />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_sub_churn', { defaultValue: 'Churn de suscripción' })}
          value={`${data?.subscriptionChurnRate || '0'}%`}
          icon={<UserMinus />}
          iconColor="text-red-600"
        />
      </div>

      {/* ====================== COBROS Y FACTURACIÓN ====================== */}
      <SectionHeader
        title={t('biz_cat_billing', { defaultValue: 'Cobros y facturación' })}
        subtitle={t('biz_cat_billing_sub', { defaultValue: 'Estado de pagos, reembolsos y disputas' })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('biz_failed_payments', { defaultValue: 'Pagos fallidos' })}
          value={data?.failedPayments || '0'}
          icon={<AlertTriangle />}
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_refunds', { defaultValue: 'Reembolsos' })}
          value={money(data?.refundsAmount)}
          unit={`(${data?.refundsCount || 0})`}
          icon={<RefreshCw />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_open_disputes', { defaultValue: 'Disputas abiertas' })}
          value={data?.openDisputes || '0'}
          icon={<AlertTriangle />}
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_upcoming_renewals', { defaultValue: 'Renovaciones 30d' })}
          value={data?.upcomingRenewalsCount || '0'}
          unit={money(data?.upcomingRenewalsAmount)}
          icon={<Repeat />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_pending_invoices', { defaultValue: 'Facturas pendientes' })}
          value={money(data?.pendingInvoicesAmount)}
          icon={<Receipt />}
          iconColor="text-amber-600"
        />
      </div>

      {/* ============================ OPERATIVA =========================== */}
      <SectionHeader
        title={t('biz_cat_operations', { defaultValue: 'Operativa' })}
        subtitle={t('biz_cat_operations_sub', { defaultValue: 'Carga de trabajo y comunicación con clientes' })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('biz_pending_reviews', { defaultValue: 'Check-ins por revisar' })}
          value={data?.pendingCheckinReviews || '0'}
          icon={<CheckSquare />}
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_avg_response', { defaultValue: 'Tiempo medio de respuesta' })}
          value={data?.avgCoachResponseHours || '0'}
          unit={t('biz_unit_hours', { defaultValue: 'h' })}
          icon={<Clock />}
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_messages_sent', { defaultValue: 'Mensajes enviados' })}
          value={data?.messagesSent || '0'}
          icon={<MessageSquare />}
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_messages_received', { defaultValue: 'Mensajes recibidos' })}
          value={data?.messagesReceived || '0'}
          icon={<MessageSquare />}
          iconColor="text-purple-600"
        />
      </div>

      {/* =========================== TENDENCIAS =========================== */}
      <SectionHeader
        title={t('biz_cat_trends', { defaultValue: 'Tendencias' })}
        subtitle={t('biz_cat_trends_sub', { defaultValue: 'Evolución temporal y distribuciones' })}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue & Renewals — ancho completo */}
        <ChartCard
          title={t('revenue_renewals')}
          subtitle={t('revenue_renewals_desc')}
          legend={
            <ChartLegend
              items={[
                { color: COLORS.emerald, label: t('revenue_label') },
                { color: COLORS.slate, label: t('renewals_label') },
              ]}
            />
          }
          className="xl:col-span-2"
        >
          <div style={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} dy={6} />
                <YAxis {...axisProps} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}`, t('revenue_label')]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.emerald}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 3, fill: COLORS.emerald, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Crecimiento de MRR */}
        <ChartCard
          title={t('biz_chart_mrr_growth', { defaultValue: 'Crecimiento de MRR' })}
          subtitle={t('biz_chart_mrr_growth_desc', { defaultValue: 'Ingreso facturado por mes' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {mrrGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mrrGrowth}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}`, 'MRR']} />
                  <Line type="monotone" dataKey="mrr" stroke={COLORS.emerald} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Altas vs bajas */}
        <ChartCard
          title={t('biz_chart_signups_losses', { defaultValue: 'Altas vs bajas' })}
          subtitle={t('biz_chart_signups_losses_desc', { defaultValue: 'Por mes, últimos 6 meses' })}
          legend={
            <ChartLegend
              items={[
                { color: COLORS.emerald, label: t('biz_legend_signups', { defaultValue: 'Altas' }) },
                { color: COLORS.red, label: t('biz_legend_losses', { defaultValue: 'Bajas' }) },
              ]}
            />
          }
        >
          <div style={{ height: CHART_HEIGHT }}>
            {clientGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientGrowth}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="signups"
                    name={t('biz_legend_signups', { defaultValue: 'Altas' })}
                    fill={COLORS.emerald}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="losses"
                    name={t('biz_legend_losses', { defaultValue: 'Bajas' })}
                    fill={COLORS.red}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Crecimiento acumulado */}
        <ChartCard
          title={t('biz_chart_cumulative', { defaultValue: 'Crecimiento acumulado' })}
          subtitle={t('biz_chart_cumulative_desc', { defaultValue: 'Total de clientes a lo largo del tiempo' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {cumulativeGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeGrowth}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.blue}
                    strokeWidth={2.5}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Ingreso por plan */}
        <ChartCard
          title={t('biz_chart_revenue_by_plan', { defaultValue: 'Ingreso por plan' })}
          subtitle={t('biz_chart_revenue_by_plan_desc', { defaultValue: 'MRR repartido por tier' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {revenueByPlan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByPlan}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {revenueByPlan.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${v}`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Estado de suscripciones */}
        <ChartCard
          title={t('biz_chart_sub_status', { defaultValue: 'Estado de suscripciones' })}
          subtitle={t('biz_chart_sub_status_desc', { defaultValue: 'Activas, trial, canceladas, impago' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {subStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {subStatus.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Pagos exitosos vs fallidos */}
        <ChartCard
          title={t('biz_chart_payments', { defaultValue: 'Pagos exitosos vs fallidos' })}
          subtitle={t('biz_chart_payments_desc', { defaultValue: 'Cobros en la ventana' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {payments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payments}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {payments.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.name === 'failed' ? COLORS.red : COLORS.emerald} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>

        {/* Distribución de estados de cliente */}
        <ChartCard
          title={t('biz_chart_client_status', { defaultValue: 'Distribución de estados de cliente' })}
          subtitle={t('biz_chart_client_status_desc', { defaultValue: 'Clientes por estado' })}
        >
          <div style={{ height: CHART_HEIGHT }}>
            {clientStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {clientStatus.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label={t('no_data')} height={CHART_HEIGHT} />
            )}
          </div>
        </ChartCard>
      </div>

      {/* ==================== CUMPLIMIENTO Y RETENCIÓN ==================== */}
      <SectionHeader
        title={t('biz_cat_compliance', { defaultValue: 'Cumplimiento y retención' })}
        subtitle={t('biz_cat_compliance_sub', { defaultValue: 'Adherencia de protocolo y retención por cohorte' })}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Panel de Compliance */}
        <ChartCard
          title={t('protocol_compliance')}
          subtitle={t('compliance_desc')}
          action={
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-base tabular-nums ${
                (data?.complianceScore || 0) > 80
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : (data?.complianceScore || 0) > 60
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}
            >
              {data?.complianceScore || 0}
            </div>
          }
        >
          <div className="flex flex-col gap-6 justify-center" style={{ minHeight: CHART_HEIGHT }}>
            <ProgressBar
              label={t('workout_adherence')}
              value={`${data?.workoutAdherence || 0}%`}
              percentage={data?.workoutAdherence || 0}
              color="bg-emerald-500"
            />
            <ProgressBar
              label={t('nutrition_consistency')}
              value={`${data?.nutritionConsistency || 0}%`}
              percentage={data?.nutritionConsistency || 0}
              color="bg-blue-500"
            />
            <ProgressBar
              label={t('checkin_reliability')}
              value={`${data?.checkInReliability || 0}%`}
              percentage={data?.checkInReliability || 0}
              color="bg-purple-500"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
              {t('compliance_note')}
            </p>
          </div>
        </ChartCard>

        {/* Tabla de cohortes */}
        <ChartCard
          title={t('retention_by_cohort')}
          subtitle={t('retention_subtitle')}
          legend={
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">{t('less_label')}</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-emerald-50" />
                <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">{t('more_label')}</span>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-left pl-4 font-normal">{t('cohort_label')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_1')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_2')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_3')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_4')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_5')}</th>
                  <th className="pb-3 font-normal">{t('analytics_month_6')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300">
                {data?.cohorts && data.cohorts.length > 0 ? (
                  data.cohorts.map((c: any, i: number) => (
                    <CohortRow key={i} cohort={c.cohort} data={c.data} />
                  ))
                ) : (
                  <CohortRow cohort={t('no_data')} data={[null, null, null, null, null, null]} />
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
    </LoadingProvider>
  );
}
