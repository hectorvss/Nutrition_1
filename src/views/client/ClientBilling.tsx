import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { Skeleton } from '../../components/ui/Skeleton';

// Vista del CLIENTE: comprueba la(s) suscripción(es) / cobro(s) que su coach
// le ha asignado y paga desde aquí. Solo lectura + botón de pago (el cobro lo
// gestiona el coach en su cuenta Stripe).

interface ClientCharge {
  id: string;
  kind: 'recurring' | 'one_time' | 'invoice';
  payment_url?: string | null;
  description?: string | null;
  amount_cents: number;
  currency: string;
  interval?: string | null;
  status: string;
  current_period_end?: string | null;
  created_at: string;
}

export default function ClientBilling() {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const locale = isEs ? 'es-ES' : 'en-US';
  const [items, setItems] = useState<ClientCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  const hasManageable = items.some(it => ['active', 'trialing', 'past_due'].includes(it.status) && it.kind === 'recurring');
  const openPortal = async () => {
    setPortalBusy(true);
    setError(null);
    try {
      const r = await fetchWithAuth('/client/billing/portal', { method: 'POST', body: JSON.stringify({}) });
      if (r?.url) window.location.href = r.url;
      else setError(isEs ? 'No se pudo abrir el portal.' : 'Could not open the portal.');
    } catch (e: any) {
      setError(e?.message || (isEs ? 'No se pudo abrir el portal.' : 'Could not open the portal.'));
    } finally {
      setPortalBusy(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchWithAuth('/client/billing');
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || (isEs ? 'Error al cargar.' : 'Error loading.'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const money = (cents: number, currency: string) =>
    (cents / 100).toLocaleString(locale, { style: 'currency', currency: (currency || 'eur').toUpperCase() });

  const statusInfo = (s: string): { label: string; cls: string } => {
    const map: Record<string, [string, string, string]> = {
      active: ['Activa', 'Active', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'],
      trialing: ['En prueba', 'Trial', 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'],
      paid: ['Pagada', 'Paid', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'],
      pending: ['Pendiente de pago', 'Payment pending', 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'],
      past_due: ['Pago atrasado', 'Past due', 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'],
      canceled: ['Cancelada', 'Canceled', 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'],
      void: ['Anulada', 'Void', 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'],
    };
    const e = map[s] || [s, s, 'bg-slate-100 text-slate-500'];
    return { label: isEs ? e[0] : e[1], cls: e[2] };
  };

  const kindLabel = (k: string) =>
    k === 'recurring' ? (isEs ? 'Suscripción' : 'Subscription')
      : k === 'one_time' ? (isEs ? 'Pago único' : 'One-time')
      : (isEs ? 'Factura' : 'Invoice');

  const needsPayment = (s: string) => s === 'pending' || s === 'past_due';

  return (
    <div className="flex-1 min-h-screen bg-[#f6f8f6] dark:bg-[#112116] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEs ? 'Mi suscripción' : 'My subscription'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEs ? 'Consulta y gestiona los pagos que tu coach te ha asignado.' : 'Review and manage the payments your coach assigned you.'}
            </p>
          </div>
          {hasManageable && (
            <button
              onClick={openPortal}
              disabled={portalBusy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">{portalBusy ? 'progress_activity' : 'settings'}</span>
              {isEs ? 'Gestionar mi pago' : 'Manage billing'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">credit_card</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{isEs ? 'Sin suscripciones' : 'No subscriptions'}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">{isEs ? 'Tu coach aún no te ha asignado ningún cobro.' : 'Your coach hasn’t assigned any charge yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(it => {
              const st = statusInfo(it.status);
              const per = it.kind === 'recurring' ? `/${it.interval === 'year' ? (isEs ? 'año' : 'yr') : (isEs ? 'mes' : 'mo')}` : '';
              return (
                <div key={it.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">credit_card</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {it.description || (it.kind === 'recurring' ? (isEs ? 'Suscripción de coaching' : 'Coaching subscription') : (isEs ? 'Pago' : 'Payment'))}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{kindLabel(it.kind)}</p>
                        <div className="mt-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{money(it.amount_cents, it.currency)}</span>
                          <span className="text-xs font-semibold text-slate-400">{per}</span>
                        </div>
                        {it.current_period_end && (it.status === 'active' || it.status === 'trialing') && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {isEs ? 'Próxima renovación: ' : 'Next renewal: '}
                            {new Date(it.current_period_end).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                  </div>

                  {it.payment_url && !['canceled', 'void'].includes(it.status) && (needsPayment(it.status) || it.kind !== 'invoice') && (
                    <a
                      href={it.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-5 w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        needsPayment(it.status)
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{needsPayment(it.status) ? 'payments' : 'open_in_new'}</span>
                      {needsPayment(it.status)
                        ? (isEs ? 'Pagar ahora' : 'Pay now')
                        : (isEs ? 'Gestionar pago' : 'Manage payment')}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
