import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X as CloseIcon,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  Users,
  MessageSquare,
  HardDrive,
  Zap,
  Bell,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBilling, type PlanTier } from '../context/BillingContext';
import { fetchWithAuth } from '../api';

/**
 * Modal de upsell que reemplaza el mensaje rojo de "you have reached
 * the active clients limit". Escucha el evento `billing:limit` que el
 * `api.ts` lanza al recibir un 402 y abre un popup orientado a
 * conversion.
 *
 * Patrones aplicados (cada uno marcado en el JSX con //@CR-N):
 *  1. **Hero visual de uso saturado** — barra al 100% + numeros grandes
 *     `X/Y` para que la "cap" se vea visualmente.
 *  2. **Loss aversion / value prop especifico** — copy distinto por
 *     resource (clientes, mensajes, storage...) que enmarca el cambio
 *     como ganancia ("multiplicaras X3 tu limite").
 *  3. **Anchoring con dos planes** — el plan recomendado destacado en
 *     esmeralda + plan max como ancla "premium". Recommended-first.
 *  4. **Prueba social / autoridad** — pill con "+200 coaches en Scale".
 *  5. **Risk reversal** — "sin permanencia, cancela cuando quieras".
 *  6. **CTA principal unico + secundario** — boton grande con precio
 *     visible + link de texto a "ver todos los planes".
 *
 * Mount: en App.tsx una sola vez en la raiz, escucha global. No
 * requiere props.
 */

type Resource =
  | 'activeClients'
  | 'monthlyMessages'
  | 'storageGB'
  | 'activeAutomations'
  | 'activeAlerts'
  | 'activeWorkflows'
  | string;

interface LimitEventDetail {
  error?: string;        // 'plan_limit_reached' | 'subscription_required'
  message?: string;
  resource?: Resource;
  tier?: PlanTier;
  limit?: number;
  used?: number;
  accessBlocked?: boolean;
}

// Stripe price IDs — mirror Pricing.tsx (single source of truth would be
// nicer, pero aqui los duplicamos para evitar un import circular con la
// landing. Si cambia uno, cambia el otro).
const PRICE_MAP: Record<'professional' | 'scale' | 'unlimited', { monthly: string; annual: string }> = {
  professional: { monthly: 'price_1TCN9vCR4WvolxlpwC33dk8J', annual: 'price_1TCf4PCR4Wvolxlp3MoDzi0J' },
  scale:        { monthly: 'price_1TCNAHCR4WvolxlpwpLRfmwX', annual: 'price_1TCf52CR4WvolxlpcMMLOVpv' },
  unlimited:    { monthly: 'price_1TCNAcCR4WvolxlptLzNYdsz', annual: 'price_1TCf5cCR4WvolxlpWGhpOgnI' },
};

// Precios mostrados en el modal — espejo de Pricing.tsx
const TIER_PRICES = { professional: 39, scale: 79, unlimited: 199 };

// Copy especifico por resource. Cada entrada tiene:
//  - icon, headline, subhead: lo que el visitante lee
//  - recommend: tier al que conviene saltar
//  - gainsFrom(tier): que ganara concretamente (texto corto)
//  - currentLimitLabel(tier, limit): como mostrar el limite actual
const RESOURCE_COPY: Record<string, {
  Icon: typeof Users;
  esTitle: string; enTitle: string;
  esSub: string; enSub: string;
  recommend: 'professional' | 'scale' | 'unlimited';
}> = {
  activeClients: {
    Icon: Users,
    esTitle: 'Has llegado al tope de clientes activos',
    enTitle: 'You\'ve hit your active-clients cap',
    esSub: 'Sube de plan y sigue creciendo sin tocar a nadie del roster.',
    enSub: 'Upgrade your plan and keep growing without dropping a single client.',
    recommend: 'scale',
  },
  monthlyMessages: {
    Icon: MessageSquare,
    esTitle: 'Has llegado al tope de mensajes del mes',
    enTitle: 'You\'ve hit this month\'s message cap',
    esSub: 'Tus clientes te necesitan: pasa a un plan con 5× o sin límite.',
    enSub: 'Your clients need you: move to a plan with 5× more — or no cap.',
    recommend: 'scale',
  },
  storageGB: {
    Icon: HardDrive,
    esTitle: 'Has llegado al límite de almacenamiento',
    enTitle: 'You\'ve hit the storage limit',
    esSub: 'Más fotos, vídeos y check-ins con un plan superior.',
    enSub: 'More photos, videos and check-ins with a higher plan.',
    recommend: 'scale',
  },
  activeAutomations: {
    Icon: Zap,
    esTitle: 'Has llegado al tope de automatizaciones activas',
    enTitle: 'You\'ve hit the active-automation cap',
    esSub: 'Despublica una o desbloquea 3× más con Scale.',
    enSub: 'Unpublish one or unlock 3× more with Scale.',
    recommend: 'scale',
  },
  activeAlerts: {
    Icon: Bell,
    esTitle: 'Has llegado al tope de alertas activas',
    enTitle: 'You\'ve hit the active-alert cap',
    esSub: 'Cuadruplica el límite con Scale y no pierdas ningún cliente.',
    enSub: 'Quadruple the cap with Scale and never lose a client.',
    recommend: 'scale',
  },
  activeWorkflows: {
    Icon: Zap,
    esTitle: 'Has llegado al tope de workflows activos',
    enTitle: 'You\'ve hit the active-workflow cap',
    esSub: 'Más automatización avanzada con Scale o sin límite con Unlimited.',
    enSub: 'More advanced automation with Scale or no cap with Unlimited.',
    recommend: 'scale',
  },
};

const DEFAULT_COPY = {
  Icon: Lock,
  esTitle: 'Has llegado al límite de tu plan',
  enTitle: 'You\'ve reached your plan\'s limit',
  esSub: 'Sube a un plan superior para seguir sin restricciones.',
  enSub: 'Move to a higher plan to keep working without limits.',
  recommend: 'scale' as const,
};

// Beneficios concretos del plan al que sube el usuario, relativos al
// resource que disparo el limite. Mantiene el lenguaje ganancia, no
// privacion. Tres bullets max por bloque para escaneabilidad.
function gainsFor(
  resource: Resource | undefined,
  tier: 'professional' | 'scale' | 'unlimited',
  isEs: boolean,
): string[] {
  const fmt = (n: number) => n.toLocaleString(isEs ? 'es-ES' : 'en-US');
  const baseEs: Record<typeof tier, string[]> = {
    professional: ['20 clientes activos', '2.000 mensajes / mes', 'Automatizaciones esenciales'],
    scale:        ['60 clientes activos', `${fmt(10_000)} mensajes / mes`, 'Automatizaciones avanzadas + alertas'],
    unlimited:    ['Sin límite de clientes', 'Sin límite de mensajes', 'Todo el motor + API'],
  };
  const baseEn: Record<typeof tier, string[]> = {
    professional: ['20 active clients', '2,000 messages / month', 'Essential automations'],
    scale:        ['60 active clients', '10,000 messages / month', 'Advanced automations + alerts'],
    unlimited:    ['Unlimited clients', 'Unlimited messages', 'Full engine + API'],
  };
  // Reorder para que el bullet relevante al limite quede primero — mejora
  // la conexion entre el dolor y la solucion.
  const list = (isEs ? baseEs : baseEn)[tier];
  if (resource === 'monthlyMessages') return [list[1], list[0], list[2]];
  if (resource === 'storageGB') return [list[2], list[0], list[1]];
  return list;
}

export default function PaywallLimitModal() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { status } = useBilling();
  const isEs = language === 'es';
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<LimitEventDetail | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  // Listener global. El api.ts dispara `billing:limit` con el detail del
  // 402. Si el estado es subscription_required (trial expirado), no
  // mostramos este modal — ese caso lo maneja el Paywall full-screen.
  useEffect(() => {
    const onLimit = (e: Event) => {
      const d = (e as CustomEvent<LimitEventDetail>).detail || {};
      if (d.error === 'subscription_required') return;
      setDetail(d);
      setOpen(true);
    };
    window.addEventListener('billing:limit', onLimit as EventListener);
    return () => window.removeEventListener('billing:limit', onLimit as EventListener);
  }, []);

  // ESC para cerrar (UX estandar de modal)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const copy = useMemo(() => {
    const r = String(detail?.resource || '');
    return RESOURCE_COPY[r] || DEFAULT_COPY;
  }, [detail?.resource]);

  const used = detail?.used ?? 0;
  const limit = detail?.limit ?? 0;
  const overflowing = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

  const recommended = copy.recommend;          // tier sugerido principal
  const anchor: 'unlimited' = 'unlimited';     // tier ancla (precio mas alto)

  const handleUpgrade = async (tier: 'professional' | 'scale' | 'unlimited') => {
    if (!user) return;
    setLoadingTier(tier);
    try {
      const selectedPriceId = isAnnual ? PRICE_MAP[tier].annual : PRICE_MAP[tier].monthly;
      const data = await fetchWithAuth('/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId: selectedPriceId, userId: user.id, userEmail: user.email }),
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
    } catch (e) {
      console.error('Upgrade error:', e);
      setLoadingTier(null);
    }
  };

  // Trial-days-left urgency: cuando el usuario llega a un limite y le
  // quedan <=3 dias de trial, anadimos un strip de urgencia honesto.
  const trialUrgency =
    status?.isTrial && typeof status.trialDaysLeft === 'number' && status.trialDaysLeft <= 3
      ? status.trialDaysLeft
      : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-limit-title"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label={isEs ? 'Cerrar' : 'Close'}
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            {/* Header con copy especifico al resource */}
            <div className="px-8 pt-10 pb-6 border-b border-gray-100">
              {/*@CR-1 Hero visual de uso saturado */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <copy.Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 mb-1">
                    {isEs ? 'Límite alcanzado' : 'Limit reached'}
                  </p>
                  <h2 id="paywall-limit-title" className="text-2xl md:text-3xl font-medium tracking-tight leading-tight">
                    {isEs ? copy.esTitle : copy.enTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {isEs ? copy.esSub : copy.enSub}
                  </p>
                </div>
              </div>

              {/* Barra de uso 100% — evidencia visual del cap */}
              {limit > 0 && (
                <div className="mt-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {isEs ? 'Tu uso actual' : 'Your current usage'}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-gray-900">
                      {used} / {limit} <span className="text-gray-400 font-medium">({detail?.tier})</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overflowing}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/*@CR-Urgency Strip de trial cuando quedan <=3 dias */}
              {trialUrgency !== null && (
                <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                  <Sparkles className="w-3 h-3" />
                  {isEs
                    ? `Te quedan ${trialUrgency} día${trialUrgency === 1 ? '' : 's'} de prueba`
                    : `${trialUrgency} day${trialUrgency === 1 ? '' : 's'} of trial left`}
                </div>
              )}
            </div>

            {/*@CR-3 Anchoring: 2 planes lado a lado, recommended highlighted */}
            <div className="px-8 py-6">
              {/* Toggle mensual/anual — friccion minima */}
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex bg-gray-100 rounded-full p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${!isAnnual ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                  >
                    {isEs ? 'Mensual' : 'Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${isAnnual ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                  >
                    {isEs ? 'Anual −20%' : 'Annual −20%'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan recomendado — destacado */}
                <PlanCard
                  tier={recommended}
                  isEs={isEs}
                  isAnnual={isAnnual}
                  gains={gainsFor(detail?.resource, recommended, isEs)}
                  loading={loadingTier === recommended}
                  highlight
                  onClick={() => handleUpgrade(recommended)}
                  cta={isEs ? `Subir a ${labelOfTier(recommended)}` : `Upgrade to ${labelOfTier(recommended)}`}
                  badge={isEs ? 'Recomendado para ti' : 'Recommended for you'}
                />
                {/* Plan ancla — Unlimited al lado para enmarcar precio */}
                {recommended !== anchor && (
                  <PlanCard
                    tier={anchor}
                    isEs={isEs}
                    isAnnual={isAnnual}
                    gains={gainsFor(detail?.resource, anchor, isEs)}
                    loading={loadingTier === anchor}
                    onClick={() => handleUpgrade(anchor)}
                    cta={isEs ? `Subir a ${labelOfTier(anchor)}` : `Upgrade to ${labelOfTier(anchor)}`}
                    badge={isEs ? 'Sin límites' : 'No limits'}
                  />
                )}
              </div>

              {/*@CR-4 Prueba social */}
              <div className="mt-6 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {isEs ? '+200 coaches independientes en planes de pago' : '+200 independent coaches on paid plans'}
                </div>
              </div>

              {/*@CR-5 Risk reversal */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-500 text-center">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isEs ? 'Sin permanencia' : 'No lock-in'}
                </span>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isEs ? 'Cancela cuando quieras' : 'Cancel anytime'}
                </span>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isEs ? 'Datos intactos' : 'Your data is safe'}
                </span>
              </div>

              {/*@CR-6 Secundario: ver todos los planes */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    try {
                      window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'subscriptions' }));
                    } catch { /* SSR-safe */ }
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-4"
                >
                  {isEs ? 'Ver todos los planes y la tabla comparativa' : 'See all plans and the comparison table'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function labelOfTier(t: 'professional' | 'scale' | 'unlimited'): string {
  if (t === 'professional') return 'Professional';
  if (t === 'scale') return 'Scale';
  return 'Unlimited';
}

interface PlanCardProps {
  tier: 'professional' | 'scale' | 'unlimited';
  isEs: boolean;
  isAnnual: boolean;
  gains: string[];
  loading: boolean;
  highlight?: boolean;
  onClick: () => void;
  cta: string;
  badge?: string;
}

function PlanCard({ tier, isEs, isAnnual, gains, loading, highlight, onClick, cta, badge }: PlanCardProps) {
  const monthly = TIER_PRICES[tier];
  const price = isAnnual ? Math.round(monthly * 0.8) : monthly;
  return (
    <div
      className={`relative rounded-2xl border p-5 ${
        highlight
          ? 'bg-emerald-50/60 border-emerald-200 ring-2 ring-emerald-500/20'
          : 'bg-white border-gray-100'
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-3 left-5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            highlight
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-500'
          }`}
        >
          {badge}
        </span>
      )}
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-medium tracking-tight">{labelOfTier(tier)}</h3>
      </div>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-medium tabular-nums">{price}€</span>
        <span className="text-xs text-gray-400">/{isEs ? 'mes' : 'mo'}</span>
        {isAnnual && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {isEs ? '−20%' : '−20%'}
          </span>
        )}
      </div>
      <ul className="space-y-1.5 mb-5">
        {gains.map((g, i) => (
          <li key={i} className="text-[13px] text-gray-700 flex items-start gap-2">
            <Sparkles className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${highlight ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span>{g}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors ${
          highlight
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/30'
            : 'bg-black text-white hover:bg-gray-800'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
        {cta}
      </button>
    </div>
  );
}
