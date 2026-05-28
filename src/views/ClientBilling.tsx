import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard, Plus, RefreshCw, Send, XCircle, Link2, ExternalLink,
  TrendingUp, Users, AlertTriangle, CheckCircle2, X, Loader2,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
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
}

interface Kpis {
  mrrCents: number;
  currency: string;
  activeSubscriptions: number;
  pendingOrOverdue: number;
  total: number;
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
};

interface ClientBillingProps {
  onBack?: () => void;
}

export default function ClientBilling({ onBack }: ClientBillingProps) {
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const locale = isEs ? 'es-ES' : 'en-US';

  const [items, setItems] = useState<BillingItem[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [stripeConnected, setStripeConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const money = (cents: number, currency: string) =>
    (cents / 100).toLocaleString(locale, { style: 'currency', currency: (currency || 'eur').toUpperCase() });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/manager/client-billing');
      setItems(data.items || []);
      setKpis(data.kpis || null);
      setStripeConnected(data.stripeConnected !== false);
    } catch (e: any) {
      setError(e?.message || (isEs ? 'Error al cargar los cobros.' : 'Error loading billing.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remind = async (id: string) => {
    setBusyId(id);
    try {
      await fetchWithAuth(`/manager/client-billing/${id}/remind`, { method: 'POST', body: JSON.stringify({}) });
      await load();
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

  const cancel = async (id: string) => {
    if (!window.confirm(isEs ? '¿Cancelar este cobro? El cliente dejará de poder pagar con este link.' : 'Cancel this charge? The client will no longer be able to pay with this link.')) return;
    setBusyId(id);
    try {
      await fetchWithAuth(`/manager/client-billing/${id}/cancel`, { method: 'POST', body: JSON.stringify({}) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = (url?: string | null) => {
    if (!url) return;
    navigator.clipboard?.writeText(url).catch(() => {});
  };

  const kindLabel = (k: string) =>
    k === 'recurring' ? (isEs ? 'Suscripción' : 'Subscription')
      : k === 'one_time' ? (isEs ? 'Pago único' : 'One-time')
      : (isEs ? 'Factura' : 'Invoice');

  const statusLabel = (s: string) => {
    const map: Record<string, [string, string]> = {
      active: ['Activa', 'Active'], trialing: ['En prueba', 'Trial'], paid: ['Pagada', 'Paid'],
      pending: ['Pendiente', 'Pending'], past_due: ['Impago', 'Past due'],
      canceled: ['Cancelada', 'Canceled'], void: ['Anulada', 'Void'], uncollectible: ['Incobrable', 'Uncollectible'],
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
              ? 'Para cobrar a tus clientes necesitas conectar tu propia cuenta de Stripe. Ve a Ajustes → Integraciones y añade tu Secret Key.'
              : 'To charge your clients you need to connect your own Stripe account. Go to Settings → Integrations and add your Secret Key.'}
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition"
          >
            {isEs ? 'Volver' : 'Back'}
          </button>
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
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#17cf54] hover:bg-[#15b84a] text-white font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> {isEs ? 'Nuevo cobro' : 'New charge'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard icon={TrendingUp} color="emerald" label={isEs ? 'MRR de clientes' : 'Client MRR'} value={kpis ? money(kpis.mrrCents, kpis.currency) : '--'} />
        <KpiCard icon={Users} color="blue" label={isEs ? 'Suscripciones activas' : 'Active subscriptions'} value={kpis ? String(kpis.activeSubscriptions) : '--'} />
        <KpiCard icon={AlertTriangle} color="amber" label={isEs ? 'Pendientes / impagos' : 'Pending / overdue'} value={kpis ? String(kpis.pendingOrOverdue) : '--'} />
      </div>

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
                  <th className="text-right font-bold px-5 py-3">{isEs ? 'Acciones' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => {
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
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[it.status] || STATUS_STYLE.pending}`}>
                          {statusLabel(it.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {it.payment_url && (
                            <>
                              <IconBtn title={isEs ? 'Copiar link' : 'Copy link'} onClick={() => copyLink(it.payment_url)} icon={Link2} />
                              <IconBtn title={isEs ? 'Abrir link' : 'Open link'} onClick={() => window.open(it.payment_url!, '_blank')} icon={ExternalLink} />
                              <IconBtn title={isEs ? 'Recordar pago por chat' : 'Send reminder in chat'} onClick={() => remind(it.id)} icon={Send} busy={busy} accent="emerald" />
                            </>
                          )}
                          <IconBtn title={isEs ? 'Sincronizar estado' : 'Sync status'} onClick={() => sync(it.id)} icon={RefreshCw} busy={busy} />
                          {!['canceled', 'void', 'paid'].includes(it.status) && (
                            <IconBtn title={isEs ? 'Cancelar' : 'Cancel'} onClick={() => cancel(it.id)} icon={XCircle} accent="rose" />
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

      {showCreate && (
        <CreateChargeModal
          isEs={isEs}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}><Icon className="w-4 h-4" /></span>
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
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

// ── Modal de creación ────────────────────────────────────────────────────
function CreateChargeModal({ isEs, onClose, onCreated }: { isEs: boolean; onClose: () => void; onCreated: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [kind, setKind] = useState<'recurring' | 'one_time' | 'invoice'>('recurring');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('eur');
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [daysUntilDue, setDaysUntilDue] = useState('7');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/manager/clients');
        const list = Array.isArray(data) ? data : (data?.items || []);
        setClients(list);
      } catch { /* noop */ }
    })();
  }, []);

  const submit = async () => {
    setErr(null);
    if (!clientId) { setErr(isEs ? 'Selecciona un cliente.' : 'Select a client.'); return; }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setErr(isEs ? 'Importe inválido.' : 'Invalid amount.'); return; }
    setSaving(true);
    try {
      await fetchWithAuth('/manager/client-billing', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          kind,
          amount: amt,
          currency,
          interval: kind === 'recurring' ? interval : undefined,
          days_until_due: kind === 'invoice' ? Number(daysUntilDue) : undefined,
          description: description.trim() || undefined,
        }),
      });
      onCreated();
    } catch (e: any) {
      setErr(e?.message || (isEs ? 'Error al crear el cobro.' : 'Error creating charge.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEs ? 'Nuevo cobro' : 'New charge'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {err && <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm text-rose-700 dark:text-rose-400">{err}</div>}

        <div className="space-y-4">
          <Field label={isEs ? 'Cliente' : 'Client'}>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className={selectCls}>
              <option value="">{isEs ? 'Selecciona…' : 'Select…'}</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name || c.name || c.email}</option>
              ))}
            </select>
          </Field>

          <Field label={isEs ? 'Tipo de cobro' : 'Charge type'}>
            <div className="grid grid-cols-3 gap-2">
              {([['recurring', isEs ? 'Suscripción' : 'Subscription'], ['one_time', isEs ? 'Pago único' : 'One-time'], ['invoice', isEs ? 'Factura' : 'Invoice']] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${kind === k ? 'bg-[#17cf54] border-[#17cf54] text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-[#17cf54]/50'}`}
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
            <Field label={isEs ? 'Frecuencia' : 'Frequency'}>
              <div className="grid grid-cols-2 gap-2">
                {([['month', isEs ? 'Mensual' : 'Monthly'], ['year', isEs ? 'Anual' : 'Yearly']] as const).map(([k, lbl]) => (
                  <button key={k} type="button" onClick={() => setInterval(k as any)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${interval === k ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>{lbl}</button>
                ))}
              </div>
            </Field>
          )}

          {kind === 'invoice' && (
            <Field label={isEs ? 'Días para pagar' : 'Days until due'}>
              <input type="number" min="1" max="90" value={daysUntilDue} onChange={e => setDaysUntilDue(e.target.value)} className={inputCls} />
            </Field>
          )}

          <Field label={isEs ? 'Descripción (opcional)' : 'Description (optional)'}>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={isEs ? 'Ej. Plan de coaching premium' : 'e.g. Premium coaching plan'} className={inputCls} maxLength={300} />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEs ? 'Cancelar' : 'Cancel'}</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-[#17cf54] hover:bg-[#15b84a] disabled:opacity-60 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isEs ? 'Crear cobro' : 'Create charge'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full p-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#17cf54] focus:ring-0 outline-none';
const selectCls = inputCls;
function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
