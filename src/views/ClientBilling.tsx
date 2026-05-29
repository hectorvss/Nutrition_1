import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CreditCard, Plus, RefreshCw, Send, XCircle, Link2, ExternalLink,
  TrendingUp, Users, AlertTriangle, CheckCircle2, X, Loader2, Pencil,
  DownloadCloud, ChevronDown, ChevronUp, Search, Check, FileDown,
  Wallet, CalendarClock, Repeat, Archive, Package, Trash2,
  Settings2, UserCog, Pause, Play, RotateCcw, Ban,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { useLanguage } from '../context/LanguageContext';

// Dashboard "Cobros": el coach gestiona lo que cobra a SUS clientes usando su
// propia cuenta Stripe (conectada en Ajustes → Integraciones). Permite crear
// suscripciones recurrentes, pagos únicos y facturas, enviar el link de pago
// por chat y cancelar. El estado se refresca desde Stripe on-demand.

interface BillingItem {
  id: string;
  client_id: string;
  client?: { id: string; full_name?: string; email?: string };
  kind: 'recurring' | 'one_time' | 'invoice';
  payment_url?: string | null;
  description?: string | null;
  amount_cents: number;
  currency: string;
  interval?: string | null;
  status: string;
  current_period_end?: string | null;
  last_reminder_at?: string | null;
  created_at: string;
  plan_id?: string | null;
  cancel_at_period_end?: boolean;
  paused?: boolean;
}

interface Kpis {
  mrrCents: number;
  arrCents?: number;
  currency: string;
  activeSubscriptions: number;
  pendingOrOverdue: number;
  overdueAmountCents?: number;
  clientsBilled?: number;
  byKind?: { recurring: number; one_time: number; invoice: number };
  total: number;
}

interface UpcomingRenewal {
  id: string;
  client?: { id: string; full_name?: string; email?: string };
  amount_cents: number;
  currency: string;
  interval?: string | null;
  current_period_end: string;
  payment_url?: string | null;
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  past_due: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  canceled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  void: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  uncollectible: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  // Estados crudos de Stripe que sync puede copiar tal cual.
  incomplete: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  incomplete_expired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  kind: 'recurring' | 'one_time';
  amount_cents: number;
  currency: string;
  interval?: string | null;
  interval_count?: number | null;
  trial_days?: number | null;
  allow_promotion_codes?: boolean;
  payment_url?: string | null;
  active: boolean;
  subscribers?: { total: number; active: number };
}

interface ClientBillingProps {
  onBack?: () => void;
  onConnectStripe?: () => void;
}

export default function ClientBilling({ onBack, onConnectStripe }: ClientBillingProps) {
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const locale = isEs ? 'es-ES' : 'en-US';

  const [tab, setTab] = useState<'plans' | 'subscriptions'>('plans');

  const [items, setItems] = useState<BillingItem[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [stripeConnected, setStripeConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<BillingItem | null>(null);

  // ── Pestaña Planes: catálogo de planes reutilizables ──────────────────────
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showImportPlans, setShowImportPlans] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [assignPlan, setAssignPlan] = useState<Plan | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'canceled'>('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'recurring' | 'one_time' | 'invoice'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingRenewal[]>([]);
  const [balance, setBalance] = useState<{ balance: number; mrr: number; recent_revenue: number[]; currency: string } | null>(null);

  const money = (cents: number, currency: string) =>
    (cents / 100).toLocaleString(locale, { style: 'currency', currency: (currency || 'eur').toUpperCase() });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/manager/client-billing');
      setItems(data.items || []);
      setKpis(data.kpis || null);
      setUpcoming(Array.isArray(data.upcomingRenewals) ? data.upcomingRenewals : []);
      setStripeConnected(data.stripeConnected !== false);
    } catch (e: any) {
      setError(e?.message || (isEs ? 'Error al cargar los cobros.' : 'Error loading billing.'));
    } finally {
      setLoading(false);
    }
  };

  // Saldo + ingresos recientes de la cuenta Stripe del coach (panel financiero
  // real, no un KPI inventado). Best-effort: si Stripe no responde, no pasa nada.
  const loadBalance = async () => {
    try {
      const b = await fetchWithAuth('/manager/integrations/stripe/balance');
      if (b && typeof b.balance === 'number') setBalance(b);
    } catch { /* noop */ }
  };

  // Catálogo de planes reutilizables (pestaña Planes).
  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await fetchWithAuth('/manager/client-billing/plans');
      setPlans(Array.isArray(data?.plans) ? data.plans : []);
    } catch (e: any) {
      setError(e?.message || (isEs ? 'Error al cargar los planes.' : 'Error loading plans.'));
    } finally {
      setLoadingPlans(false);
    }
  };

  // Archivar abre un modal de aviso (no un confirm seco): explica el impacto
  // sobre los suscriptores antes de confirmar.
  const doArchivePlan = async (plan: Plan) => {
    setBusyPlanId(plan.id);
    try {
      await fetchWithAuth(`/manager/client-billing/plans/${plan.id}/archive`, { method: 'POST', body: JSON.stringify({}) });
      await loadPlans();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyPlanId(null);
    }
  };

  const unarchivePlan = async (plan: Plan) => {
    setBusyPlanId(plan.id);
    try {
      await fetchWithAuth(`/manager/client-billing/plans/${plan.id}/unarchive`, { method: 'POST', body: JSON.stringify({}) });
      await loadPlans();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyPlanId(null);
    }
  };

  const doDeletePlan = async (plan: Plan) => {
    setBusyPlanId(plan.id);
    try {
      await fetchWithAuth(`/manager/client-billing/plans/${plan.id}`, { method: 'DELETE' });
      await loadPlans();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyPlanId(null);
    }
  };

  const copyPlanLink = async (plan: Plan) => {
    await copyLink(plan.payment_url, undefined);
    if (plan.payment_url) {
      setCopiedPlanId(plan.id);
      setTimeout(() => setCopiedPlanId(c => (c === plan.id ? null : c)), 1500);
    }
  };

  useEffect(() => { load(); loadBalance(); loadPlans(); }, []);

  // Exporta los cobros visibles a CSV (lo que el coach ve tras filtrar).
  const exportCsv = () => {
    const rows = filteredItems.map(it => ({
      cliente: it.client?.full_name || it.client?.email || '',
      email: it.client?.email || '',
      tipo: it.kind,
      importe: (it.amount_cents / 100).toFixed(2),
      moneda: (it.currency || 'eur').toUpperCase(),
      intervalo: it.interval || '',
      estado: it.status,
      proxima_renovacion: it.current_period_end || '',
      creado: it.created_at || '',
      enlace: it.payment_url || '',
    }));
    const headers = Object.keys(rows[0] || { cliente: '', email: '', tipo: '', importe: '', moneda: '', intervalo: '', estado: '', proxima_renovacion: '', creado: '', enlace: '' });
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cobros-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Construye un mensaje directo y claro para el cliente según el tipo de cobro,
  // de modo que junto a la tarjeta de pago reciba un texto que explique que ese
  // es su enlace para pagar (la suscripción de este mes, el pago, o la factura).
  const buildReminderMessage = (it?: { kind?: string; interval?: string | null }): string => {
    const kind = it?.kind;
    if (kind === 'recurring') {
      const periodo = it?.interval === 'year'
        ? (isEs ? 'tu suscripción de este año' : 'your subscription for this year')
        : (isEs ? 'tu suscripción de este mes' : 'your subscription for this month');
      return isEs
        ? `Aquí tienes tu enlace de pago para ${periodo}. Pulsa el botón para pagar de forma segura con Stripe.`
        : `Here's your payment link for ${periodo}. Tap the button to pay securely with Stripe.`;
    }
    if (kind === 'invoice') {
      return isEs
        ? 'Aquí tienes tu enlace de pago para abonar tu factura. Pulsa el botón para pagar de forma segura con Stripe.'
        : "Here's your payment link to settle your invoice. Tap the button to pay securely with Stripe.";
    }
    return isEs
      ? 'Aquí tienes tu enlace de pago. Pulsa el botón para pagar de forma segura con Stripe.'
      : "Here's your payment link. Tap the button to pay securely with Stripe.";
  };

  const remind = async (id: string) => {
    setBusyId(id);
    try {
      const it = items.find(x => x.id === id) || upcoming.find(x => x.id === id);
      const message = buildReminderMessage(it as any);
      await fetchWithAuth(`/manager/client-billing/${id}/remind`, { method: 'POST', body: JSON.stringify({ message }) });
      await load();
      setSentId(id);
      setTimeout(() => setSentId(s => (s === id ? null : s)), 2000);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyId(null);
    }
  };

  const sync = async (id: string) => {
    setBusyId(id);
    try {
      await fetchWithAuth(`/manager/client-billing/${id}/sync`, { method: 'POST', body: JSON.stringify({}) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async (url?: string | null, id?: string) => {
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback para contextos sin clipboard API (http / navegadores viejos).
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      if (id) { setCopiedId(id); setTimeout(() => setCopiedId(c => (c === id ? null : c)), 1500); }
    } catch { /* noop */ }
  };

  // Filtro por estado + búsqueda por nombre/email del cliente.
  const matchesStatus = (s: string) =>
    statusFilter === 'all' ? true
      : statusFilter === 'active' ? (s === 'active' || s === 'trialing' || s === 'paid')
      : statusFilter === 'pending' ? (s === 'pending' || s === 'past_due')
      : (s === 'canceled' || s === 'void' || s === 'uncollectible');
  const q = search.trim().toLowerCase();
  const filteredItems = items.filter(it => {
    if (!matchesStatus(it.status)) return false;
    if (kindFilter !== 'all' && it.kind !== kindFilter) return false;
    if (!q) return true;
    const hay = `${it.client?.full_name || ''} ${it.client?.email || ''} ${it.description || ''}`.toLowerCase();
    return hay.includes(q);
  });

  const kindLabel = (k: string) =>
    k === 'recurring' ? (isEs ? 'Suscripción' : 'Subscription')
      : k === 'one_time' ? (isEs ? 'Pago único' : 'One-time')
      : (isEs ? 'Factura' : 'Invoice');

  const statusLabel = (s: string) => {
    const map: Record<string, [string, string]> = {
      active: ['Activa', 'Active'], trialing: ['En prueba', 'Trial'], paid: ['Pagada', 'Paid'],
      pending: ['Pendiente', 'Pending'], past_due: ['Impago', 'Past due'],
      canceled: ['Cancelada', 'Canceled'], void: ['Anulada', 'Void'], uncollectible: ['Incobrable', 'Uncollectible'],
      incomplete: ['Incompleta', 'Incomplete'], incomplete_expired: ['Expirada', 'Expired'], unpaid: ['Sin pagar', 'Unpaid'],
    };
    const pair = map[s] || [s, s];
    return isEs ? pair[0] : pair[1];
  };

  // ── Empty state: Stripe no conectado ──────────────────────────────────────
  if (!loading && !stripeConnected) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5">
            <CreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isEs ? 'Conecta tu cuenta de Stripe' : 'Connect your Stripe account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {isEs
              ? 'Para cobrar a tus clientes necesitas conectar tu propia cuenta de Stripe. Añade tu Secret Key en Ajustes → Integraciones.'
              : 'To charge your clients you need to connect your own Stripe account. Add your Secret Key in Settings → Integrations.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onConnectStripe || onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
            >
              <CreditCard className="w-4 h-4" />
              {isEs ? 'Conectar Stripe' : 'Connect Stripe'}
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {isEs ? 'Volver' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEs ? 'Cobros' : 'Billing'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEs ? 'Gestiona las suscripciones y pagos de tus clientes vía Stripe.' : 'Manage your clients’ subscriptions and payments via Stripe.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'plans' ? (
            <>
              <button
                onClick={() => setShowImportPlans(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <DownloadCloud className="w-4 h-4" /> {isEs ? 'Importar de Stripe' : 'Import from Stripe'}
              </button>
              <button
                onClick={() => setShowCreatePlan(true)}
                style={brandStyle}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm shadow-sm`}
              >
                <Plus className="w-4 h-4" /> {isEs ? 'Crear plan' : 'Create plan'}
              </button>
            </>
          ) : (
            items.length > 0 && (
              <button
                onClick={exportCsv}
                title={isEs ? 'Exportar a CSV' : 'Export to CSV'}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <FileDown className="w-4 h-4" /> CSV
              </button>
            )
          )}
        </div>
      </div>

      {/* Pestañas: Planes / Suscripciones */}
      <div className="flex items-center gap-1 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 w-fit">
        {([['plans', isEs ? 'Planes' : 'Plans'], ['subscriptions', isEs ? 'Suscripciones' : 'Subscriptions']] as const).map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => { setTab(k as any); setError(null); }}
            style={tab === k ? brandStyle : undefined}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === k ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >{lbl}</button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Pestaña: Planes ──────────────────────────────────────────────── */}
      {tab === 'plans' && (
        <PlansTab
          isEs={isEs}
          locale={locale}
          plans={plans}
          loading={loadingPlans}
          busyPlanId={busyPlanId}
          copiedPlanId={copiedPlanId}
          onCreate={() => setShowCreatePlan(true)}
          onAssign={(p) => setAssignPlan(p)}
          onEdit={(p) => setEditPlan(p)}
          onArchive={(p) => setArchiveTarget(p)}
          onUnarchive={unarchivePlan}
          onDelete={(p) => setDeleteTarget(p)}
          onCopyLink={copyPlanLink}
        />
      )}

      {/* ── Pestaña: Suscripciones ───────────────────────────────────────── */}
      {tab === 'subscriptions' && (
      <>
      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard icon={TrendingUp} color="emerald" label={isEs ? 'MRR de clientes' : 'Client MRR'} value={kpis ? money(kpis.mrrCents, kpis.currency) : '--'}
          sub={kpis && kpis.arrCents ? `${money(kpis.arrCents, kpis.currency)} ${isEs ? 'ARR' : 'ARR'}` : undefined} />
        <KpiCard icon={Users} color="blue" label={isEs ? 'Suscripciones activas' : 'Active subscriptions'} value={kpis ? String(kpis.activeSubscriptions) : '--'}
          sub={kpis?.clientsBilled != null ? `${kpis.clientsBilled} ${isEs ? 'clientes' : 'clients'}` : undefined} />
        <KpiCard icon={AlertTriangle} color="amber" label={isEs ? 'Pendientes / impagos' : 'Pending / overdue'} value={kpis ? String(kpis.pendingOrOverdue) : '--'}
          sub={kpis && kpis.overdueAmountCents ? money(kpis.overdueAmountCents, kpis.currency) : undefined} />
        <KpiCard icon={Wallet} color="indigo" label={isEs ? 'Saldo Stripe' : 'Stripe balance'}
          value={balance ? money(Math.round(balance.balance * 100), balance.currency) : '--'} />
      </div>

      {/* Tira secundaria: desglose por tipo de cobro */}
      {kpis?.byKind && kpis.total > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-widest">{isEs ? 'Desglose' : 'Breakdown'}:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"><Repeat className="w-3.5 h-3.5" /> {kpis.byKind.recurring} {isEs ? 'suscripciones' : 'subscriptions'}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"><CreditCard className="w-3.5 h-3.5" /> {kpis.byKind.one_time} {isEs ? 'pagos únicos' : 'one-time'}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"><FileDown className="w-3.5 h-3.5" /> {kpis.byKind.invoice} {isEs ? 'facturas' : 'invoices'}</span>
        </div>
      )}

      {/* Próximas renovaciones (14 días) — sección accionable */}
      {upcoming.length > 0 && (
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isEs ? 'Próximas renovaciones' : 'Upcoming renewals'}</h3>
            <span className="text-[11px] font-semibold text-slate-400">· {isEs ? 'próximos 14 días' : 'next 14 days'}</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {upcoming.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{u.client?.full_name || u.client?.email || (isEs ? 'Cliente' : 'Client')}</div>
                  <div className="text-xs text-slate-400">
                    {money(u.amount_cents, u.currency)}/{u.interval === 'year' ? (isEs ? 'año' : 'yr') : (isEs ? 'mes' : 'mo')} · {isEs ? 'renueva el' : 'renews'} {new Date(u.current_period_end).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {u.payment_url && (
                  <button
                    onClick={() => remind(u.id)}
                    disabled={busyId === u.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sentId === u.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Send className="w-3.5 h-3.5" />}
                    {sentId === u.id ? (isEs ? 'Enviado' : 'Sent') : (isEs ? 'Recordar' : 'Remind')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de filtros: estado + tipo + búsqueda por cliente */}
      {items.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
              {([['all', isEs ? 'Todos' : 'All'], ['active', isEs ? 'Activas' : 'Active'], ['pending', isEs ? 'Pendientes' : 'Pending'], ['canceled', isEs ? 'Canceladas' : 'Canceled']] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setStatusFilter(k as any)}
                  style={statusFilter === k ? brandStyle : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === k ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >{lbl}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
              {([['all', isEs ? 'Tipo' : 'Type'], ['recurring', isEs ? 'Suscripción' : 'Subscription'], ['one_time', isEs ? 'Único' : 'One-time'], ['invoice', isEs ? 'Factura' : 'Invoice']] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k as any)}
                  style={kindFilter === k && k !== 'all' ? brandStyle : (kindFilter === k ? brandStyle : undefined)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${kindFilter === k ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >{lbl}</button>
              ))}
            </div>
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isEs ? 'Buscar cliente…' : 'Search client…'}
              className="w-full pl-3 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>
      )}

      {/* Tabla de cobros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{isEs ? 'Aún no hay cobros' : 'No charges yet'}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">{isEs ? 'Crea tu primer cobro para empezar a facturar a tus clientes.' : 'Create your first charge to start billing your clients.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-400">
                  <th className="text-left font-bold px-5 py-3">{isEs ? 'Cliente' : 'Client'}</th>
                  <th className="text-left font-bold px-5 py-3">{isEs ? 'Tipo' : 'Type'}</th>
                  <th className="text-left font-bold px-5 py-3">{isEs ? 'Importe' : 'Amount'}</th>
                  <th className="text-left font-bold px-5 py-3">{isEs ? 'Estado' : 'Status'}</th>
                  <th className="text-left font-bold px-5 py-3 hidden md:table-cell">{isEs ? 'Renovación' : 'Renewal'}</th>
                  <th className="text-left font-bold px-5 py-3 hidden lg:table-cell">{isEs ? 'Creado' : 'Created'}</th>
                  <th className="text-right font-bold px-5 py-3">{isEs ? 'Acciones' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">{isEs ? 'Ningún cobro coincide con el filtro.' : 'No charges match the filter.'}</td></tr>
                )}
                {filteredItems.map(it => {
                  const name = it.client?.full_name || it.client?.email || (isEs ? 'Cliente' : 'Client');
                  const busy = busyId === it.id;
                  return (
                    <tr key={it.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{name}</div>
                        {it.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{it.description}</div>}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{kindLabel(it.kind)}</td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        {money(it.amount_cents, it.currency)}
                        {it.kind === 'recurring' && <span className="text-xs font-normal text-slate-400">/{it.interval === 'year' ? (isEs ? 'año' : 'yr') : (isEs ? 'mes' : 'mo')}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[it.status] || STATUS_STYLE.pending}`}>
                            {statusLabel(it.status)}
                          </span>
                          {it.paused && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{isEs ? 'Pausada' : 'Paused'}</span>
                          )}
                          {it.cancel_at_period_end && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">{isEs ? 'Cancela al final' : 'Cancels at end'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">
                        {it.current_period_end ? new Date(it.current_period_end).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs hidden lg:table-cell">
                        {it.created_at ? new Date(it.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {it.payment_url && (
                            <>
                              <IconBtn title={copiedId === it.id ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar link' : 'Copy link')} onClick={() => copyLink(it.payment_url, it.id)} icon={copiedId === it.id ? CheckCircle2 : Link2} accent={copiedId === it.id ? 'emerald' : undefined} />
                              <IconBtn title={isEs ? 'Abrir link' : 'Open link'} onClick={() => window.open(it.payment_url!, '_blank')} icon={ExternalLink} />
                              <IconBtn title={sentId === it.id ? (isEs ? '¡Enviado al chat!' : 'Sent to chat!') : (isEs ? 'Enviar enlace de pago al chat' : 'Send payment link to chat')} onClick={() => remind(it.id)} icon={sentId === it.id ? CheckCircle2 : Send} busy={busy} accent="emerald" />
                            </>
                          )}
                          <IconBtn title={isEs ? 'Sincronizar estado' : 'Sync status'} onClick={() => sync(it.id)} icon={RefreshCw} busy={busy} />
                          {!['canceled', 'void'].includes(it.status) && (
                            <IconBtn title={isEs ? 'Gestionar suscripción' : 'Manage subscription'} onClick={() => setEditItem(it)} icon={Settings2} accent="emerald" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {editItem && (
        <ManageSubscriptionModal
          isEs={isEs}
          locale={locale}
          item={editItem}
          onClose={() => setEditItem(null)}
          onChanged={() => { load(); }}
          onClosedAfterChange={() => { setEditItem(null); load(); }}
        />
      )}


      {showCreatePlan && (
        <CreatePlanModal
          isEs={isEs}
          locale={locale}
          onClose={() => setShowCreatePlan(false)}
          onCreated={() => { setShowCreatePlan(false); loadPlans(); load(); }}
        />
      )}

      {editPlan && (
        <EditPlanModal
          isEs={isEs}
          locale={locale}
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSaved={() => { setEditPlan(null); loadPlans(); }}
        />
      )}

      {assignPlan && (
        <AssignPlanModal
          isEs={isEs}
          plan={assignPlan}
          onClose={() => setAssignPlan(null)}
          onAssigned={() => { setAssignPlan(null); loadPlans(); load(); }}
        />
      )}

      {showImportPlans && (
        <ImportPlansModal
          isEs={isEs}
          locale={locale}
          onClose={() => setShowImportPlans(false)}
          onImported={() => { setShowImportPlans(false); loadPlans(); }}
        />
      )}

      {archiveTarget && (
        <ArchivePlanModal
          isEs={isEs}
          plan={archiveTarget}
          busy={busyPlanId === archiveTarget.id}
          onClose={() => setArchiveTarget(null)}
          onConfirm={async () => { await doArchivePlan(archiveTarget); setArchiveTarget(null); }}
        />
      )}

      {deleteTarget && (
        <DeletePlanModal
          isEs={isEs}
          plan={deleteTarget}
          busy={busyPlanId === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => { await doDeletePlan(deleteTarget); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

// ── Modal de confirmación al eliminar un plan (destructivo) ────────────────
function DeletePlanModal({ isEs, plan, busy, onClose, onConfirm }: { isEs: boolean; plan: Plan; busy?: boolean; onClose: () => void; onConfirm: () => void }) {
  const total = plan.subscribers?.total ?? 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Eliminar plan' : 'Delete plan'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{plan.name}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>{isEs ? 'Se eliminará el plan del catálogo y se desactivarán sus objetos en Stripe.' : 'The plan will be removed from the catalog and its Stripe objects deactivated.'}</p>
          {total > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {isEs
                ? <>Las <b>{total}</b> asignaciones existentes se conservan en la pestaña Suscripciones (sus suscripciones <b>no se cancelan</b>), pero dejarán de estar vinculadas a este plan.</>
                : <>The <b>{total}</b> existing assignments stay in the Subscriptions tab (their subscriptions are <b>not canceled</b>), but they’ll no longer be linked to this plan.</>}
            </div>
          )}
          <p className="text-xs text-slate-400">{isEs ? 'Esta acción no se puede deshacer.' : 'This action cannot be undone.'}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
          <button onClick={onConfirm} disabled={busy} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isEs ? 'Eliminar plan' : 'Delete plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de aviso al archivar un plan ─────────────────────────────────────
// Archivar NO cancela las suscripciones vivas (los clientes siguen pagando),
// pero desactiva el enlace (no entran nuevos), y el plan deja de poder editarse
// o asignarse. El modal lo deja explícito antes de confirmar.
function ArchivePlanModal({ isEs, plan, busy, onClose, onConfirm }: { isEs: boolean; plan: Plan; busy?: boolean; onClose: () => void; onConfirm: () => void }) {
  const active = plan.subscribers?.active ?? 0;
  const total = plan.subscribers?.total ?? 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={brandStyle}>
            <Archive className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Archivar plan' : 'Archive plan'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{plan.name}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {active > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {isEs
                ? <><b>{active}</b> {active === 1 ? 'cliente tiene' : 'clientes tienen'} una suscripción activa a este plan. <b>No se cancelarán</b>: seguirán cobrándose con normalidad.</>
                : <><b>{active}</b> {active === 1 ? 'client has' : 'clients have'} an active subscription to this plan. <b>They won’t be canceled</b> — they keep billing as usual.</>}
            </div>
          )}
          <ul className="space-y-1.5 list-disc pl-5">
            <li>{isEs ? 'Se desactiva el enlace de pago: no se podrán suscribir clientes nuevos.' : 'The payment link is disabled: no new clients can subscribe.'}</li>
            <li>{isEs ? 'El plan ya no se podrá editar ni asignar.' : 'The plan can no longer be edited or assigned.'}</li>
            {total > 0 && <li>{isEs ? `Las ${total} asignaciones existentes se conservan en la pestaña Suscripciones.` : `The ${total} existing assignments stay in the Subscriptions tab.`}</li>}
          </ul>
          <p className="text-xs text-slate-400">{isEs ? 'Si quieres dejar de cobrar a un cliente, cancela su suscripción desde la pestaña Suscripciones.' : 'To stop billing a specific client, cancel their subscription from the Subscriptions tab.'}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
          <button onClick={onConfirm} disabled={busy} style={brandStyle} className={`flex-1 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm flex items-center justify-center gap-2`}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            {isEs ? 'Archivar plan' : 'Archive plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de cambio de precio ──────────────────────────────────────────────
// ── Modal: Gestionar suscripción ───────────────────────────────────────────
// Panel completo de opciones sobre un cobro/suscripción: editar detalles
// (etiqueta, precio, intervalo, trial, promos), reasignar a otro cliente,
// pausar/reanudar, cancelar (inmediato o a fin de ciclo) y reembolsar.
function ManageSubscriptionModal({ isEs, locale, item, onClose, onChanged, onClosedAfterChange }: {
  isEs: boolean; locale: string; item: BillingItem;
  onClose: () => void; onChanged: () => void; onClosedAfterChange: () => void;
}) {
  const isRecurring = item.kind === 'recurring';
  const isInvoice = item.kind === 'invoice';
  const live = ['active', 'trialing'].includes(item.status);
  const money = (cents: number) => (cents / 100).toLocaleString(locale, { style: 'currency', currency: (item.currency || 'eur').toUpperCase() });

  // Espejo local de los flags que cambian sin recargar el modal.
  const [paused, setPaused] = useState(!!item.paused);
  const [cancelScheduled, setCancelScheduled] = useState(!!item.cancel_at_period_end);

  // Edición de detalles.
  const [desc, setDesc] = useState(item.description || '');
  const [amount, setAmount] = useState(String((item.amount_cents / 100).toFixed(2)));
  const [interval, setInterval] = useState((item.interval as string) || 'month');
  const [intervalCount, setIntervalCount] = useState('1');
  const [trialDays, setTrialDays] = useState('0');
  const [allowPromos, setAllowPromos] = useState(false);

  // Reasignar.
  const [clients, setClients] = useState<any[]>([]);
  const [targetClient, setTargetClient] = useState('');
  const [sendToChat, setSendToChat] = useState(true);

  // Cancelar.
  const [cancelMode, setCancelMode] = useState<'immediate' | 'period_end'>(isRecurring ? 'period_end' : 'immediate');

  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setClients(unwrapList(await fetchWithAuth('/manager/clients'))); } catch { /* noop */ }
    })();
  }, []);

  const flash = (m: string) => { setOk(m); setTimeout(() => setOk(o => (o === m ? null : o)), 2500); };
  const call = async (key: string, path: string, body: any, opts: { close?: boolean; okMsg?: string } = {}) => {
    setErr(null); setBusy(key);
    try {
      await fetchWithAuth(`/manager/client-billing/${item.id}${path}`, { method: 'POST', body: JSON.stringify(body) });
      if (opts.okMsg) flash(opts.okMsg);
      if (opts.close) { onClosedAfterChange(); } else { onChanged(); }
      return true;
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error.' : 'Error.'));
      return false;
    } finally { setBusy(null); }
  };

  const saveDetails = async () => {
    setErr(null);
    const body: any = { description: desc };
    if (!isInvoice) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) { setErr(isEs ? 'Importe inválido.' : 'Invalid amount.'); return; }
      body.amount = amt;
      body.allow_promotion_codes = allowPromos;
      if (isRecurring) {
        body.interval = interval;
        const ic = Number(intervalCount); if (Number.isFinite(ic) && ic >= 1) body.interval_count = Math.round(ic);
        const td = Number(trialDays); if (Number.isFinite(td) && td >= 0) body.trial_days = Math.round(td);
      }
    }
    setBusy('details');
    try {
      await fetchWithAuth(`/manager/client-billing/${item.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      flash(isEs ? 'Cambios guardados.' : 'Changes saved.');
      onChanged();
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al guardar.' : 'Error saving.'));
    } finally { setBusy(null); }
  };

  const doReassign = async () => {
    if (!targetClient) { setErr(isEs ? 'Elige un cliente.' : 'Pick a client.'); return; }
    await call('reassign', '/reassign', { client_id: targetClient, send_to_chat: sendToChat }, { close: true });
  };
  const doPause = async () => { if (await call('pause', '/pause', {})) setPaused(true); };
  const doResume = async () => { if (await call('resume', '/resume', {})) setPaused(false); };
  const doRefund = async () => {
    if (!window.confirm(isEs ? '¿Reembolsar el último pago de este cobro? Esta acción no se puede deshacer.' : 'Refund the last payment? This cannot be undone.')) return;
    await call('refund', '/refund', {}, { okMsg: isEs ? 'Reembolso emitido.' : 'Refund issued.' });
  };
  const doCancel = async () => {
    const atEnd = isRecurring && cancelMode === 'period_end';
    if (!atEnd && !window.confirm(isEs ? '¿Cancelar inmediatamente? El cliente perderá el acceso ya.' : 'Cancel immediately? The client loses access now.')) return;
    const okRes = await call('cancel', '/cancel', { at_period_end: atEnd }, { close: !atEnd });
    if (okRes && atEnd) setCancelScheduled(true);
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children?: React.ReactNode }) => (
    <div className="py-4 border-t border-slate-100 dark:border-slate-800 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{isEs ? 'Gestionar suscripción' : 'Manage subscription'}</h3>
            <p className="text-xs text-slate-400 truncate">
              {item.client?.full_name || item.client?.email || (isEs ? 'Cliente' : 'Client')} · {money(item.amount_cents)}{isRecurring ? `/${item.interval === 'year' ? (isEs ? 'año' : 'yr') : (isEs ? 'mes' : 'mo')}` : ''}
              {paused && ` · ${isEs ? 'Pausada' : 'Paused'}`}
              {cancelScheduled && ` · ${isEs ? 'Cancela al final' : 'Cancels at end'}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {err && <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}
          {ok && <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400">{ok}</div>}

          {/* ── Detalles ── */}
          <Section title={isEs ? 'Detalles del cobro' : 'Charge details'} icon={Pencil}>
            <div className="space-y-3">
              <Field label={isEs ? 'Etiqueta / descripción' : 'Label / description'}>
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder={isEs ? 'Ej: Plan Growth mensual' : 'e.g. Growth monthly plan'} className={inputCls} />
              </Field>
              {isInvoice ? (
                <p className="text-xs text-slate-400">{isEs ? 'Una factura finalizada no se puede reprecificar. Solo puedes editar la etiqueta; para cambiar el importe, cancélala y crea un cobro nuevo.' : 'A finalized invoice cannot be repriced. You can only edit the label.'}</p>
              ) : (
                <>
                  <Field label={isEs ? 'Importe' : 'Amount'}>
                    <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
                  </Field>
                  {isRecurring && (
                    <div className="grid grid-cols-3 gap-2">
                      <Field label={isEs ? 'Intervalo' : 'Interval'}>
                        <select value={interval} onChange={e => setInterval(e.target.value)} className={inputCls}>
                          <option value="day">{isEs ? 'Día' : 'Day'}</option>
                          <option value="week">{isEs ? 'Semana' : 'Week'}</option>
                          <option value="month">{isEs ? 'Mes' : 'Month'}</option>
                          <option value="year">{isEs ? 'Año' : 'Year'}</option>
                        </select>
                      </Field>
                      <Field label={isEs ? 'Cada' : 'Every'}>
                        <input type="number" min="1" max="52" value={intervalCount} onChange={e => setIntervalCount(e.target.value)} className={inputCls} />
                      </Field>
                      <Field label={isEs ? 'Prueba (días)' : 'Trial (days)'}>
                        <input type="number" min="0" max="365" value={trialDays} onChange={e => setTrialDays(e.target.value)} className={inputCls} />
                      </Field>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={allowPromos} onChange={e => setAllowPromos(e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">{isEs ? 'Permitir códigos promocionales en el enlace' : 'Allow promotion codes on the link'}</span>
                  </label>
                  {live && (
                    <p className="text-[11px] text-slate-400">{isEs ? 'El cliente ya tiene una suscripción activa: el cambio de precio se aplica con prorrateo en el próximo ciclo.' : 'Active subscription: price change is prorated next cycle.'}</p>
                  )}
                </>
              )}
              <button onClick={saveDetails} disabled={busy === 'details'} style={brandStyle} className={`w-full px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm flex items-center justify-center gap-2`}>
                {busy === 'details' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isEs ? 'Guardar cambios' : 'Save changes'}
              </button>
            </div>
          </Section>

          {/* ── Reasignar ── */}
          {!isInvoice && (
            <Section title={isEs ? 'Reasignar a otro cliente' : 'Reassign to another client'} icon={UserCog}>
              {live || item.status === 'past_due' ? (
                <p className="text-xs text-slate-400">{isEs ? 'No se puede mover una suscripción ya activa (pertenece al cliente actual en Stripe). Cancélala primero y asigna el plan al nuevo cliente.' : 'Cannot move an already active subscription. Cancel it first.'}</p>
              ) : (
                <div className="space-y-3">
                  <ClientPicker clients={clients.filter(c => c.id !== item.client?.id)} value={targetClient} onChange={setTargetClient} isEs={isEs} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sendToChat} onChange={e => setSendToChat(e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">{isEs ? 'Enviar el enlace de pago al nuevo cliente por el chat' : 'Send the payment link to the new client via chat'}</span>
                  </label>
                  <button onClick={doReassign} disabled={busy === 'reassign' || !targetClient} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy === 'reassign' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                    {isEs ? 'Mover al cliente seleccionado' : 'Move to selected client'}
                  </button>
                </div>
              )}
            </Section>
          )}

          {/* ── Pausar / reanudar ── */}
          {isRecurring && (
            <Section title={isEs ? 'Pausar cobranza' : 'Pause billing'} icon={paused ? Play : Pause}>
              {paused ? (
                <button onClick={doResume} disabled={busy === 'resume'} className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy === 'resume' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isEs ? 'Reanudar cobranza' : 'Resume billing'}
                </button>
              ) : (
                <button onClick={doPause} disabled={busy === 'pause'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy === 'pause' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                  {isEs ? 'Pausar la suscripción' : 'Pause subscription'}
                </button>
              )}
              <p className="text-[11px] text-slate-400 mt-2">{isEs ? 'Pausar detiene los cobros sin cancelar la suscripción. Puedes reanudarla cuando quieras.' : 'Pausing stops charges without canceling. Resume anytime.'}</p>
            </Section>
          )}

          {/* ── Reembolsar ── */}
          <Section title={isEs ? 'Reembolsar' : 'Refund'} icon={RotateCcw}>
            <button onClick={doRefund} disabled={busy === 'refund'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {busy === 'refund' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              {isEs ? 'Reembolsar último pago' : 'Refund last payment'}
            </button>
          </Section>

          {/* ── Cancelar ── */}
          <Section title={isEs ? 'Cancelar' : 'Cancel'} icon={Ban}>
            {isRecurring && (
              <div className="space-y-2 mb-3">
                {([['period_end', isEs ? 'Al final del ciclo actual (sigue activa hasta entonces)' : 'At the end of the current cycle'], ['immediate', isEs ? 'Inmediatamente (pierde acceso ya)' : 'Immediately']] as const).map(([k, lbl]) => (
                  <label key={k} className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="cancelMode" checked={cancelMode === k} onChange={() => setCancelMode(k as any)} className="mt-0.5 w-4 h-4 accent-[var(--brand-primary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">{lbl}</span>
                  </label>
                ))}
              </div>
            )}
            <button onClick={doCancel} disabled={busy === 'cancel'} className="w-full px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {busy === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              {isRecurring && cancelMode === 'period_end' ? (isEs ? 'Programar cancelación' : 'Schedule cancellation') : (isEs ? 'Cancelar ahora' : 'Cancel now')}
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, color, label, value, sub }: { icon: any; color: string; label: string; value: string; sub?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}><Icon className="w-4 h-4" /></span>
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="text-[11px] font-semibold text-slate-400 mt-1 truncate">{sub}</div>}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, title, busy, accent }: { icon: any; onClick: () => void; title: string; busy?: boolean; accent?: string }) {
  const accentCls = accent === 'emerald'
    ? 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30'
    : accent === 'rose'
    ? 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30'
    : 'hover:bg-slate-100 dark:hover:bg-slate-800';
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 transition disabled:opacity-50 ${accentCls}`}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
    </button>
  );
}

// ── Modal de importación desde Stripe ──────────────────────────────────────
function ImportModal({ isEs, locale, onClose, onImported }: { isEs: boolean; locale: string; onClose: () => void; onImported: () => void }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busySub, setBusySub] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [subs, cl] = await Promise.all([
          fetchWithAuth('/manager/client-billing/stripe/subscriptions'),
          fetchWithAuth('/manager/clients'),
        ]);
        setCandidates(subs?.candidates || []);
        setClients(unwrapList(cl));
      } catch (e: any) {
        setErr(e?.message || (isEs ? 'No se pudo conectar con Stripe.' : 'Could not connect to Stripe.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const money = (cents: number, currency: string) =>
    (cents / 100).toLocaleString(locale, { style: 'currency', currency: (currency || 'eur').toUpperCase() });

  const doImport = async (sub: any) => {
    const clientId = mapping[sub.stripe_subscription_id];
    if (!clientId) { setErr(isEs ? 'Selecciona el cliente para cada suscripción.' : 'Pick a client for each subscription.'); return; }
    setBusySub(sub.stripe_subscription_id);
    setErr(null);
    try {
      await fetchWithAuth('/manager/client-billing/import', {
        method: 'POST',
        body: JSON.stringify({ client_id: clientId, stripe_subscription_id: sub.stripe_subscription_id }),
      });
      setDoneIds(prev => new Set(prev).add(sub.stripe_subscription_id));
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al importar.' : 'Import error.'));
    } finally {
      setBusySub(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Importar de Stripe' : 'Import from Stripe'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {isEs
            ? 'Suscripciones existentes en tu cuenta de Stripe que aún no están aquí. Asígnalas a un cliente para gestionarlas desde la app.'
            : 'Existing subscriptions in your Stripe account not yet here. Assign each to a client to manage it from the app.'}
        </p>

        {err && <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}

        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : candidates.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">{isEs ? 'No hay suscripciones nuevas para importar.' : 'No new subscriptions to import.'}</div>
          ) : (
            <div className="space-y-3">
              {candidates.map(sub => {
                const done = doneIds.has(sub.stripe_subscription_id);
                const busy = busySub === sub.stripe_subscription_id;
                return (
                  <div key={sub.stripe_subscription_id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {sub.customer_name || sub.customer_email || (isEs ? 'Cliente Stripe' : 'Stripe customer')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {money(sub.amount_cents, sub.currency)}/{sub.interval === 'year' ? (isEs ? 'año' : 'yr') : (isEs ? 'mes' : 'mo')} · {sub.status}
                      </div>
                    </div>
                    {done ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> {isEs ? 'Importada' : 'Imported'}</span>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-44">
                          <ClientPicker
                            clients={clients}
                            value={mapping[sub.stripe_subscription_id] || ''}
                            onChange={(id) => setMapping(m => ({ ...m, [sub.stripe_subscription_id]: id }))}
                            isEs={isEs}
                            compact
                          />
                        </div>
                        <button
                          onClick={() => doImport(sub)}
                          disabled={busy}
                          style={brandStyle}
                          className={`px-3 py-2 rounded-lg ${brandBtnCls} text-xs font-bold flex items-center gap-1.5 whitespace-nowrap`}
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
                          {isEs ? 'Importar' : 'Import'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5">
          <button onClick={onImported} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition">
            {isEs ? 'Hecho' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full p-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[var(--brand-primary)] focus:ring-0 outline-none';
const selectCls = inputCls;

// Color de marca que el admin asigna a su SaaS. Para botones sólidos usamos
// el CSS var inline (Tailwind no resuelve bg- desde una variable arbitraria de
// forma fiable en todos los navegadores).
const brandStyle: React.CSSProperties = { backgroundColor: 'var(--brand-primary)' };
const brandBtnCls = 'text-white hover:brightness-95 transition-[filter,opacity] disabled:opacity-60';

// Desplegable de cliente PROPIO (no <select> nativo): botón + panel inline
// que se expande hacia abajo (nunca se recorta dentro de modales con scroll),
// con buscador cuando hay muchos clientes. Cierra al elegir o al hacer clic
// fuera. Funciona igual en claro/oscuro.
function ClientPicker({ clients, value, onChange, isEs, compact }: {
  clients: any[];
  value: string;
  onChange: (id: string) => void;
  isEs: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Panel posicionado con position:fixed calculado desde el botón, para que
  // NUNCA lo recorte el overflow del modal con scroll. Se abre hacia abajo o
  // hacia arriba según el espacio disponible, y limita su alto al hueco real
  // para que la lista siempre pueda scrollearse entera.
  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, 240);
    const left = Math.min(r.left, window.innerWidth - width - 8);
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(360, openUp ? spaceAbove : spaceBelow));
    const top = openUp ? Math.max(8, r.top - 4 - maxHeight) : r.bottom + 4;
    setCoords({ top, left: Math.max(8, left), width, maxHeight });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    // Reposiciona al hacer scroll de un ancestro (el panel es fixed y quedaría
    // desanclado), PERO ignora el scroll que ocurre DENTRO del propio panel
    // (la lista de clientes) — si no, no se podría desplazar la lista.
    const onScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && panelRef.current?.contains(target)) return; // scroll interno de la lista → no tocar
      place();
    };
    const onResize = () => place();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const nameOf = (c: any) => c?.full_name || c?.name || c?.email || (isEs ? 'Cliente' : 'Client');
  const selected = clients.find(c => c.id === value);
  const ql = q.trim().toLowerCase();
  const filtered = ql
    ? clients.filter(c => `${c.full_name || ''} ${c.name || ''} ${c.email || ''}`.toLowerCase().includes(ql))
    : clients;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 ${compact ? 'px-2.5 py-2 text-xs' : 'p-2.5 text-sm'} rounded-lg border bg-slate-50 dark:bg-slate-800/50 text-left transition ${
          open ? 'border-[var(--brand-primary)]' : 'border-slate-200 dark:border-slate-700'
        } ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
      >
        <span className="truncate">{selected ? nameOf(selected) : (isEs ? 'Selecciona cliente…' : 'Select client…')}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && coords && (
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, maxHeight: coords.maxHeight, zIndex: 60 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {clients.length > 6 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={isEs ? 'Buscar…' : 'Search…'}
                  className="flex-1 bg-transparent text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto py-1" style={{ overscrollBehavior: 'contain' }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">{isEs ? 'Sin clientes' : 'No clients'}</div>
            ) : filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); setQ(''); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition ${c.id === value ? 'text-[var(--brand-primary)] font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
              >
                <span className="truncate min-w-0">
                  <span className="block truncate">{c.full_name || c.name || c.email}</span>
                  {(c.full_name || c.name) && c.email && <span className="block text-[11px] text-slate-400 truncate">{c.email}</span>}
                </span>
                {c.id === value && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

// Formatea un importe en céntimos con la moneda dada (helper local para modales).
function fmtMoney(cents: number, currency: string | undefined, locale: string) {
  return (cents / 100).toLocaleString(locale, { style: 'currency', currency: (currency || 'eur').toUpperCase() });
}

// Sufijo de periodicidad para planes recurrentes ("/mes", "/año", "cada 3 meses").
function planPeriod(plan: Plan, isEs: boolean): string {
  if (plan.kind !== 'recurring') return '';
  const n = plan.interval_count && plan.interval_count > 1 ? plan.interval_count : 1;
  const isYear = plan.interval === 'year';
  if (n > 1) {
    const unit = isYear ? (isEs ? 'años' : 'years') : (isEs ? 'meses' : 'months');
    return isEs ? `cada ${n} ${unit}` : `every ${n} ${unit}`;
  }
  return isYear ? (isEs ? '/año' : '/yr') : (isEs ? '/mes' : '/mo');
}

// ── Pestaña Planes: catálogo de planes reutilizables ────────────────────────
function PlansTab({
  isEs, locale, plans, loading, busyPlanId, copiedPlanId,
  onCreate, onAssign, onEdit, onArchive, onUnarchive, onDelete, onCopyLink,
}: {
  isEs: boolean;
  locale: string;
  plans: Plan[];
  loading: boolean;
  busyPlanId: string | null;
  copiedPlanId: string | null;
  onCreate: () => void;
  onAssign: (p: Plan) => void;
  onEdit: (p: Plan) => void;
  onArchive: (p: Plan) => void;
  onUnarchive: (p: Plan) => void;
  onDelete: (p: Plan) => void;
  onCopyLink: (p: Plan) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{isEs ? 'Aún no tienes planes' : 'No plans yet'}</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">{isEs ? 'Crea un plan reutilizable y asígnalo a tus clientes.' : 'Create a reusable plan and assign it to your clients.'}</p>
        <button onClick={onCreate} style={brandStyle} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm shadow-sm`}>
          <Plus className="w-4 h-4" /> {isEs ? 'Crear plan' : 'Create plan'}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {plans.map(plan => {
        const archived = plan.active === false;
        const busy = busyPlanId === plan.id;
        const subsActive = plan.subscribers?.active ?? 0;
        const subsTotal = plan.subscribers?.total ?? 0;
        return (
          <div key={plan.id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col ${archived ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate">{plan.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {plan.kind === 'recurring' ? <Repeat className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                    {plan.kind === 'recurring' ? (isEs ? 'Suscripción' : 'Subscription') : (isEs ? 'Pago único' : 'One-time')}
                  </span>
                  {archived && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {isEs ? 'Archivado' : 'Archived'}
                    </span>
                  )}
                </div>
              </div>
              <Package className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            </div>

            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {fmtMoney(plan.amount_cents, plan.currency, locale)}
              {plan.kind === 'recurring' && (
                <span className="text-sm font-semibold text-slate-400 ml-1">{planPeriod(plan, isEs)}</span>
              )}
            </div>

            {plan.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{plan.description}</p>
            )}

            <div className="text-xs text-slate-400 mt-auto pt-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {subsActive} {isEs ? 'activos' : 'active'} · {subsTotal} {isEs ? 'totales' : 'total'}
            </div>

            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {!archived ? (
                <button
                  onClick={() => onAssign(plan)}
                  style={brandStyle}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg ${brandBtnCls} text-xs font-bold`}
                >
                  <Users className="w-3.5 h-3.5" /> {isEs ? 'Asignar' : 'Assign'}
                </button>
              ) : (
                <button
                  onClick={() => onUnarchive(plan)}
                  disabled={busy}
                  style={brandStyle}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg ${brandBtnCls} text-xs font-bold`}
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {isEs ? 'Desarchivar' : 'Unarchive'}
                </button>
              )}
              {plan.payment_url && !archived && (
                <IconBtn
                  title={copiedPlanId === plan.id ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar link de pago' : 'Copy payment link')}
                  onClick={() => onCopyLink(plan)}
                  icon={copiedPlanId === plan.id ? CheckCircle2 : Link2}
                  accent={copiedPlanId === plan.id ? 'emerald' : undefined}
                />
              )}
              {!archived && (
                <>
                  <IconBtn title={isEs ? 'Editar plan' : 'Edit plan'} onClick={() => onEdit(plan)} icon={Pencil} />
                  <IconBtn title={isEs ? 'Archivar' : 'Archive'} onClick={() => onArchive(plan)} icon={Archive} accent="rose" />
                </>
              )}
              <IconBtn title={isEs ? 'Eliminar plan' : 'Delete plan'} onClick={() => onDelete(plan)} icon={Trash2} accent="rose" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Multi-select de clientes (buscador + checkboxes) ────────────────────────
function ClientMultiPicker({ clients, selected, onToggle, isEs }: {
  clients: any[];
  selected: string[];
  onToggle: (id: string) => void;
  isEs: boolean;
}) {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const filtered = ql
    ? clients.filter(c => `${c.full_name || ''} ${c.name || ''} ${c.email || ''}`.toLowerCase().includes(ql))
    : clients;
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="p-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={isEs ? 'Buscar cliente…' : 'Search client…'}
            className="flex-1 bg-transparent text-xs outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto py-1" style={{ overscrollBehavior: 'contain' }}>
        {filtered.length === 0 ? (
          <div className="px-3 py-3 text-xs text-slate-400 text-center">{isEs ? 'Sin clientes' : 'No clients'}</div>
        ) : filtered.map(c => {
          const checked = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${checked ? 'border-transparent' : 'border-slate-300 dark:border-slate-600'}`} style={checked ? brandStyle : undefined}>
                {checked && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-700 dark:text-slate-200">{c.full_name || c.name || c.email}</span>
                {(c.full_name || c.name) && c.email && <span className="block text-[11px] text-slate-400 truncate">{c.email}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Gestor de códigos promocionales (cupón + promotion code en Stripe) ──────
function PromoCodesManager({ isEs, locale, currency }: { isEs: boolean; locale: string; currency: string }) {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discType, setDiscType] = useState<'percent' | 'amount'>('percent');
  const [value, setValue] = useState('');
  const [duration, setDuration] = useState<'once' | 'forever' | 'repeating'>('once');
  const [months, setMonths] = useState('3');
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const d = await fetchWithAuth('/manager/client-billing/promotion-codes'); setCodes(Array.isArray(d?.codes) ? d.codes : []); }
    catch { /* p.ej. Stripe no conectado */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    setErr(null);
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) { setErr(isEs ? 'Pon un valor de descuento.' : 'Enter a discount value.'); return; }
    if (discType === 'percent' && v > 100) { setErr(isEs ? 'El porcentaje no puede superar 100.' : 'Percent can’t exceed 100.'); return; }
    setAdding(true);
    try {
      await fetchWithAuth('/manager/client-billing/promotion-codes', {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim() || undefined,
          discount_type: discType,
          value: v,
          duration,
          duration_in_months: duration === 'repeating' ? (Number(months) || 3) : undefined,
          currency,
        }),
      });
      setCode(''); setValue('');
      await load();
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'No se pudo crear el código.' : 'Could not create the code.'));
    } finally {
      setAdding(false);
    }
  };

  const deactivate = async (id: string) => {
    try { await fetchWithAuth(`/manager/client-billing/promotion-codes/${id}/deactivate`, { method: 'POST', body: JSON.stringify({}) }); await load(); } catch { /* noop */ }
  };

  const discLabel = (d: any) => {
    if (d.percent_off != null) return `${d.percent_off}%`;
    if (d.amount_off != null) return (d.amount_off / 100).toLocaleString(locale, { style: 'currency', currency: (d.currency || 'eur').toUpperCase() });
    return '';
  };
  const durLabel = (d: any) =>
    d.duration === 'forever' ? (isEs ? 'siempre' : 'forever')
      : d.duration === 'repeating' ? (isEs ? `${d.duration_in_months} meses` : `${d.duration_in_months} mo`)
      : (isEs ? 'una vez' : 'once');

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isEs ? 'Códigos promocionales' : 'Promotion codes'}</p>

      {/* Lista de códigos existentes */}
      {loading ? (
        <div className="py-2 flex justify-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : codes.length > 0 ? (
        <div className="space-y-1.5">
          {codes.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{c.code}</span>
                <span className="text-xs text-slate-400 ml-2">−{discLabel(c.discount)} · {durLabel(c.discount)}{typeof c.max_redemptions === 'number' ? ` · ${c.times_redeemed}/${c.max_redemptions}` : ''}</span>
              </div>
              <button type="button" onClick={() => deactivate(c.id)} className="text-slate-400 hover:text-rose-500 transition flex-shrink-0" title={isEs ? 'Desactivar' : 'Deactivate'}>
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">{isEs ? 'Aún no hay códigos. Crea uno abajo.' : 'No codes yet. Create one below.'}</p>
      )}

      {err && <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-xs text-rose-700 dark:text-rose-400">{err}</div>}

      {/* Crear nuevo código */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder={isEs ? 'CÓDIGO (ej. VERANO20)' : 'CODE (e.g. SUMMER20)'}
            className={`${inputCls} font-mono uppercase`}
            maxLength={50}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <input type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder={discType === 'percent' ? '20' : '10.00'} className="flex-1 min-w-0 px-2.5 py-2 text-sm bg-transparent outline-none text-slate-900 dark:text-white" />
            <div className="flex">
              {([['percent', '%'], ['amount', (currency || 'eur').toUpperCase()]] as const).map(([k, lbl]) => (
                <button key={k} type="button" onClick={() => setDiscType(k as any)} style={discType === k ? brandStyle : undefined} className={`px-2.5 py-2 text-xs font-bold ${discType === k ? 'text-white' : 'text-slate-500'}`}>{lbl}</button>
              ))}
            </div>
          </div>
          <select value={duration} onChange={e => setDuration(e.target.value as any)} className={selectCls}>
            <option value="once">{isEs ? 'Una vez' : 'Once'}</option>
            <option value="repeating">{isEs ? 'Varios meses' : 'Several months'}</option>
            <option value="forever">{isEs ? 'Para siempre' : 'Forever'}</option>
          </select>
        </div>
        {duration === 'repeating' && (
          <input type="number" min="1" max="36" value={months} onChange={e => setMonths(e.target.value)} placeholder={isEs ? 'Meses' : 'Months'} className={inputCls} />
        )}
        <button type="button" onClick={add} disabled={adding} style={brandStyle} className={`w-full px-3 py-2 rounded-lg ${brandBtnCls} text-xs font-bold flex items-center justify-center gap-1.5`}>
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {isEs ? 'Añadir código' : 'Add code'}
        </button>
        <p className="text-[10px] text-slate-400">{isEs ? 'Stripe lo guarda en mayúsculas; solo letras, números, guion y guion bajo. Déjalo vacío para uno automático.' : 'Stripe stores it uppercase; letters, numbers, hyphen and underscore only. Leave empty for an auto-generated one.'}</p>
      </div>
    </div>
  );
}

// ── Modal: crear plan ───────────────────────────────────────────────────────
function CreatePlanModal({ isEs, locale, onClose, onCreated }: { isEs: boolean; locale: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<'recurring' | 'one_time'>('recurring');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('eur');
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [intervalCount, setIntervalCount] = useState('1');
  const [trialDays, setTrialDays] = useState('');
  const [allowPromos, setAllowPromos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Pre-asignar a clientes (opcional, colapsable).
  const [showAssign, setShowAssign] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [assignIds, setAssignIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/manager/clients');
        setClients(unwrapList(data));
      } catch { /* noop */ }
    })();
  }, []);

  const toggle = (id: string) => setAssignIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const submit = async () => {
    setErr(null);
    if (!name.trim()) { setErr(isEs ? 'Pon un nombre al plan.' : 'Give the plan a name.'); return; }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setErr(isEs ? 'Importe inválido.' : 'Invalid amount.'); return; }
    setSaving(true);
    try {
      await fetchWithAuth('/manager/client-billing/plans', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          kind,
          amount: amt,
          currency,
          interval: kind === 'recurring' ? interval : undefined,
          interval_count: kind === 'recurring' ? (Number(intervalCount) || 1) : undefined,
          trial_days: kind === 'recurring' && Number(trialDays) > 0 ? Number(trialDays) : undefined,
          allow_promotion_codes: allowPromos,
          assign_client_ids: assignIds.length > 0 ? assignIds : undefined,
        }),
      });
      onCreated();
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al crear el plan.' : 'Error creating plan.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Crear plan' : 'Create plan'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {err && <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}

        <div className="space-y-4">
          <Field label={isEs ? 'Nombre' : 'Name'}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={isEs ? 'Ej. Coaching Premium' : 'e.g. Premium Coaching'} className={inputCls} maxLength={120} autoFocus />
          </Field>

          <Field label={isEs ? 'Descripción (opcional)' : 'Description (optional)'}>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={isEs ? 'Qué incluye el plan…' : 'What the plan includes…'} className={inputCls} maxLength={500} />
          </Field>

          <Field label={isEs ? 'Tipo' : 'Type'}>
            <div className="grid grid-cols-2 gap-2">
              {([['recurring', isEs ? 'Suscripción' : 'Subscription'], ['one_time', isEs ? 'Pago único' : 'One-time']] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k as any)}
                  style={kind === k ? brandStyle : undefined}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${kind === k ? `${brandBtnCls} border-transparent` : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-[var(--brand-primary)]/50'}`}
                >{lbl}</button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isEs ? 'Importe' : 'Amount'}>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
            </Field>
            <Field label={isEs ? 'Moneda' : 'Currency'}>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={selectCls}>
                <option value="eur">EUR €</option>
                <option value="usd">USD $</option>
                <option value="gbp">GBP £</option>
                <option value="mxn">MXN $</option>
              </select>
            </Field>
          </div>

          {kind === 'recurring' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={isEs ? 'Frecuencia' : 'Frequency'}>
                  <div className="grid grid-cols-2 gap-2">
                    {([['month', isEs ? 'Mensual' : 'Monthly'], ['year', isEs ? 'Anual' : 'Yearly']] as const).map(([k, lbl]) => (
                      <button key={k} type="button" onClick={() => setInterval(k as any)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${interval === k ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>{lbl}</button>
                    ))}
                  </div>
                </Field>
                <Field label={isEs ? 'Cada N períodos' : 'Every N periods'}>
                  <input type="number" min="1" max="52" value={intervalCount} onChange={e => setIntervalCount(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label={isEs ? 'Días de prueba' : 'Trial days'}>
                <input type="number" min="0" max="365" value={trialDays} onChange={e => setTrialDays(e.target.value)} placeholder="0" className={inputCls} />
              </Field>
            </>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowPromos} onChange={e => setAllowPromos(e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{isEs ? 'Permitir códigos de descuento en el pago' : 'Allow promotion codes at checkout'}</span>
          </label>

          {/* Al activar, el coach puede crear los códigos ahí mismo (cuenta-wide
              en Stripe; cualquier checkout con códigos habilitados los acepta). */}
          {allowPromos && <PromoCodesManager isEs={isEs} locale={locale} currency={currency} />}

          {/* Pre-asignar a clientes (opcional) */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <button type="button" onClick={() => setShowAssign(v => !v)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              {showAssign ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isEs ? 'Pre-asignar a clientes (opcional)' : 'Pre-assign to clients (optional)'}
              {assignIds.length > 0 && <span className="text-[var(--brand-primary)]">· {assignIds.length}</span>}
            </button>
            {showAssign && (
              <div className="mt-3">
                <ClientMultiPicker clients={clients} selected={assignIds} onToggle={toggle} isEs={isEs} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
          <button onClick={submit} disabled={saving} style={brandStyle} className={`flex-1 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm flex items-center justify-center gap-2`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isEs ? 'Crear plan' : 'Create plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: editar plan ──────────────────────────────────────────────────────
function EditPlanModal({ isEs, locale, plan, onClose, onSaved }: { isEs: boolean; locale: string; plan: Plan; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(plan.name || '');
  const [description, setDescription] = useState(plan.description || '');
  const [editAmount, setEditAmount] = useState(false);
  const [amount, setAmount] = useState(String((plan.amount_cents / 100).toFixed(2)));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!name.trim()) { setErr(isEs ? 'Pon un nombre al plan.' : 'Give the plan a name.'); return; }
    const body: any = { name: name.trim(), description: description.trim() || null };
    if (editAmount) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) { setErr(isEs ? 'Importe inválido.' : 'Invalid amount.'); return; }
      body.amount = amt;
    }
    setSaving(true);
    try {
      await fetchWithAuth(`/manager/client-billing/plans/${plan.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      onSaved();
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al guardar.' : 'Error saving.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Editar plan' : 'Edit plan'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {err && <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}

        <div className="space-y-4">
          <Field label={isEs ? 'Nombre' : 'Name'}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} maxLength={120} autoFocus />
          </Field>
          <Field label={isEs ? 'Descripción' : 'Description'}>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={inputCls} maxLength={500} />
          </Field>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={editAmount} onChange={e => setEditAmount(e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{isEs ? 'Cambiar importe' : 'Change amount'}</span>
            </label>
            {editAmount && (
              <>
                <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {isEs ? 'Cambiar el precio regenera el precio y el enlace de pago en Stripe.' : 'Changing the price regenerates the price and payment link in Stripe.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{isEs ? 'Actual' : 'Current'}: {fmtMoney(plan.amount_cents, plan.currency, locale)}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
          <button onClick={submit} disabled={saving} style={brandStyle} className={`flex-1 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm flex items-center justify-center gap-2`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isEs ? 'Guardar' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: asignar plan a clientes ──────────────────────────────────────────
function AssignPlanModal({ isEs, plan, onClose, onAssigned }: { isEs: boolean; plan: Plan; onClose: () => void; onAssigned: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [sendToChat, setSendToChat] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ assigned: number; skipped: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/manager/clients');
        setClients(unwrapList(data));
      } catch { /* noop */ }
    })();
  }, []);

  const toggle = (id: string) => setSelected(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const submit = async () => {
    setErr(null);
    if (selected.length === 0) { setErr(isEs ? 'Selecciona al menos un cliente.' : 'Select at least one client.'); return; }
    setSaving(true);
    try {
      const res = await fetchWithAuth(`/manager/client-billing/plans/${plan.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ client_ids: selected, send_to_chat: sendToChat }),
      });
      setResult({ assigned: Number(res?.assigned ?? selected.length), skipped: Number(res?.skipped ?? 0) });
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al asignar.' : 'Error assigning.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Asignar plan' : 'Assign plan'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">{plan.name}</p>

        {result ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isEs ? `${result.assigned} asignados` : `${result.assigned} assigned`}
              {result.skipped > 0 && (isEs ? `, ${result.skipped} omitidos` : `, ${result.skipped} skipped`)}
            </p>
            <button onClick={onAssigned} style={brandStyle} className={`mt-5 px-5 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm`}>
              {isEs ? 'Hecho' : 'Done'}
            </button>
          </div>
        ) : (
          <>
            {err && <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}
            <ClientMultiPicker clients={clients} selected={selected} onToggle={toggle} isEs={isEs} />
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input type="checkbox" checked={sendToChat} onChange={e => setSendToChat(e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{isEs ? 'Enviar enlace de pago por el chat' : 'Send payment link via chat'}</span>
            </label>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
              <button onClick={submit} disabled={saving} style={brandStyle} className={`flex-1 px-4 py-2.5 rounded-xl ${brandBtnCls} font-semibold text-sm flex items-center justify-center gap-2`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {isEs ? 'Asignar' : 'Assign'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal: importar planes desde Stripe ─────────────────────────────────────
function ImportPlansModal({ isEs, locale, onClose, onImported }: { isEs: boolean; locale: string; onClose: () => void; onImported: () => void }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchWithAuth('/manager/client-billing/plans/stripe/importable');
        setCandidates(Array.isArray(data?.candidates) ? data.candidates : []);
      } catch (e: any) {
        setErr(e?.message || (isEs ? 'No se pudo conectar con Stripe.' : 'Could not connect to Stripe.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doImport = async (c: any) => {
    setBusyId(c.stripe_price_id);
    setErr(null);
    try {
      await fetchWithAuth('/manager/client-billing/plans/import', {
        method: 'POST',
        body: JSON.stringify({ stripe_price_id: c.stripe_price_id }),
      });
      setDoneIds(prev => new Set(prev).add(c.stripe_price_id));
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al importar.' : 'Import error.'));
    } finally {
      setBusyId(null);
    }
  };

  const period = (c: any) => {
    if (c.kind !== 'recurring') return '';
    const n = c.interval_count && c.interval_count > 1 ? c.interval_count : 1;
    const isYear = c.interval === 'year';
    if (n > 1) {
      const unit = isYear ? (isEs ? 'años' : 'years') : (isEs ? 'meses' : 'months');
      return ` · ${isEs ? `cada ${n} ${unit}` : `every ${n} ${unit}`}`;
    }
    return isYear ? (isEs ? '/año' : '/yr') : (isEs ? '/mes' : '/mo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Importar planes de Stripe' : 'Import plans from Stripe'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {isEs
            ? 'Precios existentes en tu cuenta de Stripe que aún no son planes aquí. Impórtalos para reutilizarlos.'
            : 'Existing prices in your Stripe account not yet plans here. Import them to reuse.'}
        </p>

        {err && <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}

        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : candidates.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">{isEs ? 'No hay precios nuevos para importar.' : 'No new prices to import.'}</div>
          ) : (
            <div className="space-y-3">
              {candidates.map(c => {
                const done = doneIds.has(c.stripe_price_id);
                const busy = busyId === c.stripe_price_id;
                return (
                  <div key={c.stripe_price_id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.name || (isEs ? 'Precio Stripe' : 'Stripe price')}</div>
                      <div className="text-xs text-slate-400">
                        {fmtMoney(c.amount_cents, c.currency, locale)}{period(c)} · {c.kind === 'recurring' ? (isEs ? 'Suscripción' : 'Subscription') : (isEs ? 'Pago único' : 'One-time')}
                      </div>
                    </div>
                    {done ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> {isEs ? 'Importado' : 'Imported'}</span>
                    ) : (
                      <button
                        onClick={() => doImport(c)}
                        disabled={busy}
                        style={brandStyle}
                        className={`px-3 py-2 rounded-lg ${brandBtnCls} text-xs font-bold flex items-center gap-1.5 whitespace-nowrap`}
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
                        {isEs ? 'Importar' : 'Import'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5">
          <button onClick={onImported} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition">
            {isEs ? 'Hecho' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
