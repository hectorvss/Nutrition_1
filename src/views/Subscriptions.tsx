import React, { useState } from 'react';
import { Sparkles, CreditCard, Clock, AlertTriangle, ArrowUpRight, Users, MessageSquare, Zap, HardDrive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBilling } from '../context/BillingContext';
import { fetchWithAuth } from '../api';
import Pricing from '../components/Pricing';

// Pantalla de gestion de suscripcion accesible desde el sidebar ("Mejorar
// plan") y desde Settings > Billing. Muestra:
//  1. El plan actual del manager (tier, estado, dias de prueba, periodo).
//  2. El uso actual frente a los limites del plan.
//  3. El grid de planes (<Pricing/>) con la card del plan actual marcada.
//  4. Acceso al portal de Stripe para gestionar el metodo de pago.

interface SubscriptionsProps {
  onBack?: () => void;
}

// Etiquetas bilingues por tier. Par [es, en].
const TIER_LABEL: Record<string, [string, string]> = {
  trial: ['Prueba gratuita', 'Free trial'],
  professional: ['Profesional', 'Professional'],
  scale: ['Scale', 'Scale'],
  unlimited: ['Ilimitado', 'Unlimited'],
};

// Mapeo del status crudo de Stripe a etiquetas traducidas. Par [es, en].
const STATUS_LABEL: Record<string, [string, string]> = {
  active: ['Activa', 'Active'],
  trialing: ['En prueba', 'Trial'],
  past_due: ['Pago pendiente', 'Past due'],
  canceled: ['Cancelada', 'Canceled'],
  unpaid: ['Impago', 'Unpaid'],
  incomplete: ['Incompleta', 'Incomplete'],
};

export default function Subscriptions({ onBack }: SubscriptionsProps) {
  const { t, language } = useLanguage();
  const { status, isLoading } = useBilling();
  const isEs = language === 'es';
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abre el Customer Portal de Stripe (cambiar metodo de pago, cancelar...).
  const openPortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const r = await fetchWithAuth('/manager/billing/portal', { method: 'POST' });
      if (r?.url) {
        // Open in new tab so the user keeps the app context
        window.open(r.url, '_blank', 'noopener,noreferrer');
      } else {
        setError(isEs ? 'La gestión de facturación no está disponible.' : 'Billing management unavailable.');
      }
    } catch (e: any) {
      setError(e?.message || (isEs ? 'Error al abrir el portal.' : 'Error opening portal.'));
    } finally {
      setPortalLoading(false);
    }
  };

  const tier = status?.tier || 'trial';
  const isTrial = tier === 'trial';
  const tierLabel = TIER_LABEL[tier]?.[isEs ? 0 : 1] || tier;
  const statusLabel = status?.status
    ? (STATUS_LABEL[status.status]?.[isEs ? 0 : 1] || status.status)
    : null;
  const paymentMethodLabel = status?.paymentMethod
    ? `${status.paymentMethod.brand?.toUpperCase?.() || 'CARD'} •••• ${status.paymentMethod.last4}${status.paymentMethod.expMonth && status.paymentMethod.expYear ? ` · ${String(status.paymentMethod.expMonth).padStart(2, '0')}/${String(status.paymentMethod.expYear).slice(-2)}` : ''}`
    : (isEs ? 'Sin método de pago' : 'No payment method');
  const fmtDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEs ? 'Suscripción y planes' : 'Subscription & plans'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEs ? 'Gestiona tu plan, revisa tu uso y mejora cuando lo necesites.' : 'Manage your plan, review usage and upgrade when you need to.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Plan actual */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isTrial
                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isEs ? 'Plan actual' : 'Current plan'}: {tierLabel}
                    </h2>
                    {statusLabel && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        status?.accessBlocked
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  {isTrial && status?.trialDaysLeft != null && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {isEs
                        ? `Te quedan ${status.trialDaysLeft} días de prueba`
                        : `${status.trialDaysLeft} trial days left`}
                    </p>
                  )}
                  {!isTrial && status?.currentPeriodEnd && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {isEs ? 'Se renueva el ' : 'Renews on '}{fmtDate(status.currentPeriodEnd)}
                    </p>
                  )}
                  {status?.hasStripeSubscription && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {isEs ? 'Método de pago: ' : 'Payment method: '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{paymentMethodLabel}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Boton portal Stripe — solo si hay suscripcion de pago */}
              {status?.hasStripeSubscription && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {portalLoading
                    ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    : <ArrowUpRight className="w-4 h-4" />}
                  {isEs ? 'Gestionar facturación' : 'Manage billing'}
                </button>
              )}
            </div>
          )}

        </div>

        {/* Uso vs limites — tarjetas estilo "Cobros" (billing): cada métrica con
            su propio logo en chip de color, valor grande y barra de progreso. */}
        {status?.usage && status?.limits && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {([
              { key: 'activeClients',     label: isEs ? 'Clientes' : 'Clients',                   icon: Users,         color: 'emerald' },
              { key: 'monthlyMessages',   label: isEs ? 'Mensajes/mes' : 'Messages/mo',           icon: MessageSquare, color: 'blue' },
              { key: 'activeAutomations', label: isEs ? 'Automatizaciones' : 'Automations',       icon: Zap,           color: 'amber' },
              { key: 'storageGB',         label: isEs ? 'Almacenamiento (GB)' : 'Storage (GB)',   icon: HardDrive,     color: 'indigo' },
            ] as const).map(({ key, label, icon, color }) => {
              const used = (status.usage as any)[key] ?? 0;
              const limit = (status.limits as any)[key];
              const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
              return (
                <div key={key}>
                  <UsageCard
                    icon={icon}
                    color={color}
                    label={label}
                    used={used}
                    limit={limit}
                    pct={pct}
                    unlimitedLabel={isEs ? 'Ilimitado' : 'Unlimited'}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Grid de planes + comparativa de features (reusa el componente
            publico Pricing — misma UI que la landing). currentTier marca
            la card del plan que ya tiene el manager. */}
        <Pricing
          embedded
          currentTier={tier}
          onManageBilling={status?.hasStripeSubscription ? openPortal : undefined}
        />
      </div>
    </div>
  );
}

// Tarjeta de uso con el mismo lenguaje visual que los KPIs de "Cobros":
// chip de color con el logo de la métrica, valor grande y barra de progreso.
function UsageCard({ icon: Icon, color, label, used, limit, pct, unlimitedLabel }: {
  icon: any; color: string; label: string; used: number; limit: number | null | undefined; pct: number; unlimitedLabel: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  const barCls = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  const hasLimit = limit != null;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}><Icon className="w-4 h-4" /></span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-black text-slate-900 dark:text-white">{used}</span>
        <span className="text-sm font-bold text-slate-400">{hasLimit ? `/ ${limit}` : unlimitedLabel}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${hasLimit ? pct : 8}%` }} />
      </div>
    </div>
  );
}
