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
import { StatCard, ProgressBar, CohortRow } from './components';

/* ============================================================================
 * Pestaña BUSINESS de Analytics.
 * Recibe `data` = respuesta `business` del endpoint /manager/analytics.
 * Los KPIs nuevos viven en data.<clave> (los calcula server/lib/analytics/business.ts).
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

/* --- Sub-componentes locales ------------------------------------------------ */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide pt-2">{children}</h2>
  );
}

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
};

function money(v: any): string {
  const n = Number(v) || 0;
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n * 100) / 100}`;
}

export default function BusinessAnalytics({ data }: any) {
  const { t, language } = useLanguage();
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(new Date().getFullYear(), i, 1).toLocaleString(
      language === 'es' ? 'es-ES' : 'en-US',
      { month: 'short' }
    )
  );

  const stripeConnected = !!data?.stripeConnected;

  return (
    <div className="space-y-6">
      {/* ===== KPIs base existentes ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 pt-2">
        <StatCard
          title={t('analytics_total_clients')}
          value={data?.totalClients || '0'}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('analytics_monthly_rev')}
          value={data?.revenue >= 1000 ? `$${(data.revenue / 1000).toFixed(1)}k` : `$${data?.revenue || '0'}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          showChart={true}
        />
        <StatCard
          title={t('analytics_retention')}
          value={`${data?.retention || '0'}%`}
          icon={<Heart className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('analytics_avg_ltv')}
          value={`$${data?.ltv || '0'}`}
          icon={<Award className="w-6 h-6" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('analytics_churn_rate')}
          value={`${data?.churnRate || '0'}%`}
          icon={<UserMinus className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title={t('analytics_new_leads')}
          value={data?.newLeads || '0'}
          icon={<UserPlus className="w-6 h-6" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* ===== Revenue chart + Compliance (existentes) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('revenue_renewals')}</h2>
              <p className="text-sm text-slate-500">{t('revenue_renewals_desc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">{t('revenue_label')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-slate-600">{t('renewals_label')}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthLabels.map((m, i) => {
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  return {
                    month: m,
                    revenue: i <= currentMonth ? data?.monthlyRevenue?.[i] || 0 : null,
                  };
                })}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`$${value}`, t('revenue_label')]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('protocol_compliance')}</h3>
              <p className="text-xs text-slate-500">{t('compliance_desc')}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                (data?.complianceScore || 0) > 80
                  ? 'bg-emerald-50 text-emerald-600'
                  : (data?.complianceScore || 0) > 60
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {data?.complianceScore || 0}
            </div>
          </div>
          <div className="flex flex-col gap-6 flex-1 justify-center">
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
          </div>
          <p className="mt-6 text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            {t('compliance_note')}
          </p>
        </div>
      </div>

      {/* ===== SECCIÓN: Suscripciones & Stripe ===== */}
      <SectionTitle>{t('biz_section_subscriptions', { defaultValue: 'Suscripciones e ingresos' })}</SectionTitle>
      {!stripeConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {t('biz_stripe_disconnected', {
            defaultValue: 'Conecta Stripe en Integraciones para ver los KPIs de ingresos y suscripciones.',
          })}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title={t('biz_mrr', { defaultValue: 'MRR' })}
          value={money(data?.mrr)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_arr', { defaultValue: 'ARR' })}
          value={money(data?.arr)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_net_revenue', { defaultValue: 'Ingreso neto' })}
          value={money(data?.netRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_arpu', { defaultValue: 'ARPU' })}
          value={money(data?.arpu)}
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_avg_ticket', { defaultValue: 'Ticket medio' })}
          value={money(data?.avgTicket)}
          icon={<Receipt className="w-6 h-6" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_active_subs', { defaultValue: 'Suscripciones activas' })}
          value={data?.activeSubscriptions || '0'}
          icon={<CreditCard className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('biz_active_trials', { defaultValue: 'Trials activos' })}
          value={data?.activeTrials || '0'}
          icon={<Hourglass className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_trial_conversion', { defaultValue: 'Conversión trial→pago' })}
          value={`${data?.trialConversionRate || '0'}%`}
          icon={<Percent className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_sub_churn', { defaultValue: 'Churn de suscripción' })}
          value={`${data?.subscriptionChurnRate || '0'}%`}
          icon={<UserMinus className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_failed_payments', { defaultValue: 'Pagos fallidos / dunning' })}
          value={data?.failedPayments || '0'}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_refunds', { defaultValue: 'Reembolsos' })}
          value={`${money(data?.refundsAmount)} (${data?.refundsCount || 0})`}
          icon={<RefreshCw className="w-6 h-6" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_open_disputes', { defaultValue: 'Disputas abiertas' })}
          value={data?.openDisputes || '0'}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_upcoming_renewals', { defaultValue: 'Renovaciones 30d' })}
          value={`${data?.upcomingRenewalsCount || 0} · ${money(data?.upcomingRenewalsAmount)}`}
          icon={<Repeat className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_pending_invoices', { defaultValue: 'Facturas pendientes' })}
          value={money(data?.pendingInvoicesAmount)}
          icon={<Receipt className="w-6 h-6" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* ===== SECCIÓN: Operativa ===== */}
      <SectionTitle>{t('biz_section_operations', { defaultValue: 'Operativa y clientes' })}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title={t('biz_lost_clients', { defaultValue: 'Clientes perdidos' })}
          value={data?.lostClients || '0'}
          icon={<UserMinus className="w-6 h-6" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title={t('biz_pending_reviews', { defaultValue: 'Check-ins por revisar' })}
          value={data?.pendingCheckinReviews || '0'}
          icon={<CheckSquare className="w-6 h-6" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('biz_avg_response', { defaultValue: 'Resp. media coach (h)' })}
          value={`${data?.avgCoachResponseHours || '0'}h`}
          icon={<Clock className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('biz_messages_sent', { defaultValue: 'Mensajes enviados' })}
          value={data?.messagesSent || '0'}
          icon={<MessageSquare className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title={t('biz_messages_received', { defaultValue: 'Mensajes recibidos' })}
          value={data?.messagesReceived || '0'}
          icon={<MessageSquare className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('biz_client_lifetime', { defaultValue: 'Vida media (meses)' })}
          value={data?.avgClientLifetimeMonths || '0'}
          icon={<CalendarClock className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* ===== GRÁFICAS: fila 1 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('biz_chart_mrr_growth', { defaultValue: 'Crecimiento de MRR' })}
          subtitle={t('biz_chart_mrr_growth_desc', { defaultValue: 'Ingreso facturado por mes' })}
        >
          <LineChart data={data?.mrrGrowth || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}`, 'MRR']} />
            <Line type="monotone" dataKey="mrr" stroke={COLORS.emerald} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard
          title={t('biz_chart_signups_losses', { defaultValue: 'Altas vs bajas de clientes' })}
          subtitle={t('biz_chart_signups_losses_desc', { defaultValue: 'Por mes, últimos 6 meses' })}
        >
          <BarChart data={data?.clientGrowthByMonth || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
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
        </ChartCard>
      </div>

      {/* ===== GRÁFICAS: fila 2 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('biz_chart_cumulative', { defaultValue: 'Crecimiento acumulado de clientes' })}
          subtitle={t('biz_chart_cumulative_desc', { defaultValue: 'Total de clientes a lo largo del tiempo' })}
        >
          <AreaChart data={data?.cumulativeClientGrowth || []}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={COLORS.blue}
              strokeWidth={3}
              fill="url(#colorCumulative)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard
          title={t('biz_chart_revenue_by_plan', { defaultValue: 'Ingreso por plan' })}
          subtitle={t('biz_chart_revenue_by_plan_desc', { defaultValue: 'MRR repartido por tier' })}
        >
          <PieChart>
            <Pie
              data={data?.revenueByPlan || []}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {(data?.revenueByPlan || []).map((_: any, i: number) => (
                <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${v}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartCard>
      </div>

      {/* ===== GRÁFICAS: fila 3 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('biz_chart_sub_status', { defaultValue: 'Estado de suscripciones' })}
          subtitle={t('biz_chart_sub_status_desc', { defaultValue: 'Activas, trial, canceladas, impago' })}
        >
          <PieChart>
            <Pie
              data={data?.subscriptionStatusDistribution || []}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {(data?.subscriptionStatusDistribution || []).map((_: any, i: number) => (
                <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartCard>

        <ChartCard
          title={t('biz_chart_payments', { defaultValue: 'Pagos exitosos vs fallidos' })}
          subtitle={t('biz_chart_payments_desc', { defaultValue: 'Cobros en la ventana' })}
        >
          <BarChart data={data?.successfulVsFailedPayments || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {(data?.successfulVsFailedPayments || []).map((entry: any, i: number) => (
                <Cell key={i} fill={entry.name === 'failed' ? COLORS.red : COLORS.emerald} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>

      {/* ===== GRÁFICA: distribución de estados de cliente ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('biz_chart_client_status', { defaultValue: 'Distribución de estados de cliente' })}
          subtitle={t('biz_chart_client_status_desc', { defaultValue: 'Clientes por estado' })}
        >
          <PieChart>
            <Pie
              data={data?.clientStatusDistribution || []}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {(data?.clientStatusDistribution || []).map((_: any, i: number) => (
                <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartCard>
      </div>

      {/* ===== Cohortes (existente) ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('retention_by_cohort')}</h3>
            <p className="text-sm text-slate-500">{t('retention_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{t('less_label')}</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-50"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-200"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
            </div>
            <span className="text-xs font-medium text-slate-500">{t('more_label')}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="text-xs text-slate-500 font-medium border-b border-slate-100">
                <th className="pb-3 text-left pl-4 font-normal">{t('cohort_label')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_1')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_2')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_3')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_4')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_5')}</th>
                <th className="pb-3 font-normal">{t('analytics_month_6')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
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
      </div>
    </div>
  );
}
