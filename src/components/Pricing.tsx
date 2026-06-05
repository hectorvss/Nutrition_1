import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Verified, Clock, CreditCard } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../api";
import { PRICE_MAP, TIER_MONTHLY_PRICE, type PaidTier } from "../lib/plans";

interface PricingProps {
  onGetStarted?: () => void;
  /**
   * Tier actual del manager. Si se pasa, la card correspondiente muestra un
   * badge "Tu plan" y su boton queda deshabilitado (no tiene sentido pagar
   * el plan que ya tienes). 'trial' no marca ninguna card (el trial es
   * "pre-plan").
   */
  currentTier?: 'trial' | 'professional' | 'scale' | 'unlimited' | null;
  /**
   * Cuando el manager YA tiene una suscripcion de pago activa, cambiar de
   * plan debe pasar por el Billing Portal de Stripe — un Checkout nuevo
   * crearia una SEGUNDA suscripcion (doble cobro). Si se pasa, las cards que
   * no son la actual disparan este callback en vez de create-checkout-session.
   */
  onManageBilling?: () => void;
  /**
   * Modo embebido: cuando el grid de planes se renderiza DENTRO de la pantalla
   * de Suscripciones (no en la landing publica). Oculta la mega-cabecera de
   * landing, quita `min-h-screen`, reduce el padding vertical y compacta el
   * toggle Mensual/Anual para integrarse de forma sobria.
   */
  embedded?: boolean;
}

// Stable plan tiers — never derived from translated labels. Price IDs and
// monthly prices come from the shared src/lib/plans source of truth.
type PlanTier = PaidTier;

export default function Pricing({ onGetStarted, currentTier, onManageBilling, embedded = false }: PricingProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const isEs = language === 'es';

  const calculatePrice = (monthlyPrice: number) => {
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  };

  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: PlanTier) => {
    // A checkout session can only be created for an authenticated manager.
    // Visitors on the public landing page are routed to sign-up instead.
    if (!user) {
      onGetStarted?.();
      return;
    }

    setLoading(tier);
    try {
      const selectedPriceId = isAnnual ? PRICE_MAP[tier].annual : PRICE_MAP[tier].monthly;

      const data = await fetchWithAuth('/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          priceId: selectedPriceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // 409 / already_subscribed: el manager ya tiene una suscripcion activa.
      // En vez del alert generico, mensaje claro y, si esta disponible, abrir
      // el Billing Portal para que cambie de plan sin doble cobro.
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('already_subscribed')) {
        alert(isEs
          ? "Ya tienes una suscripción activa. Usa 'Gestionar facturación' para cambiar de plan."
          : "You already have an active subscription. Use 'Manage billing' to change your plan.");
        onManageBilling?.();
      } else {
        alert(isEs ? 'Error al iniciar el checkout. Inténtalo de nuevo.' : 'Error initiating checkout. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`font-body bg-white text-slate-900 dark:bg-slate-950 dark:text-white ${embedded ? '' : 'min-h-screen'}`}>
      <main className={`max-w-7xl mx-auto px-8 ${embedded ? 'py-6' : 'py-24'}`}>
        {/* Header Section — solo en modo landing (no embebido). En la pantalla
            de Suscripciones ya hay una cabecera propia, asi que se omite. */}
        {!embedded && (
          <header className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-7xl tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1] font-medium font-sans">
              {isEs ? 'Precios simples que crecen con tu negocio de coaching' : 'Simple pricing that grows with your coaching business'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
              {isEs ? 'Obtén acceso completo a la plataforma desde el primer día y elige el plan que encaje con tus clientes activos.' : 'Get full access to the platform from day one, and choose the plan that matches the number of active clients you manage.'}
            </p>
            {!user && (
              <div className="mt-8 inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-full">
                <Verified className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">
                  {isEs ? 'Comienza tus 14 días de prueba gratis — sin tarjeta.' : 'Start your 14-day free trial — no card required.'}
                </span>
                <button
                  onClick={() => onGetStarted?.()}
                  className="ml-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  {isEs ? 'Empezar gratis' : 'Start free'}
                </button>
              </div>
            )}
          </header>
        )}

        {/* Pricing Toggle */}
        {embedded ? (
          // Modo embebido: toggle compacto y sobrio, sin pildora gigante
          // centrada. El descuento es un badge pequeno junto a "Anual".
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${!isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isEs ? 'Mensual' : 'Monthly'}
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isEs ? 'Anual' : 'Annual'}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isAnnual ? 'bg-on-primary/20 text-on-primary' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                  {isEs ? '-20%' : '-20%'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-16">
            <div className="inline-flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-full relative">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 text-sm font-bold rounded-full transition-all cursor-pointer border-none ${!isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isEs ? 'Mensual' : 'Monthly'}
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 text-sm font-bold rounded-full transition-all cursor-pointer border-none ${isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isEs ? 'Anual' : 'Annual'}
              </button>
            </div>
            {isAnnual && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm"
              >
                {isEs ? 'Ahorra un 20% con facturación anual' : 'Save 20% with annual billing'}
              </motion.div>
            )}
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {[
            {
              tier: 'professional' as PlanTier,
              title: isEs ? "Profesional" : "Professional",
              monthlyPrice: TIER_MONTHLY_PRICE.professional,
              clients: isEs ? "Hasta 20 clientes activos" : "Up to 20 active clients",
              features: [
                isEs ? "Acceso completo a la plataforma" : "Full platform access",
                isEs ? "Hasta 20 clientes activos" : "Up to 20 active clients",
                isEs ? "Hasta 2.000 mensajes mensuales" : "Up to 2,000 monthly messages",
                isEs ? "Hasta 2 GB de almacenamiento" : "Up to 2 GB file storage",
                isEs ? "Hasta 10 automatizaciones activas" : "Up to 10 active automations",
                isEs ? "Hasta 25 alertas activas" : "Up to 25 active alerts"
              ],
              buttonLabel: isEs ? "Empezar Profesional" : "Start Professional",
              accent: false
            },
            {
              tier: 'scale' as PlanTier,
              title: "Scale",
              monthlyPrice: TIER_MONTHLY_PRICE.scale,
              clients: isEs ? "Hasta 60 clientes activos" : "Up to 60 active clients",
              features: [
                isEs ? "Todo lo de Profesional" : "Everything in Professional",
                isEs ? "Hasta 60 clientes activos" : "Up to 60 active clients",
                isEs ? "Hasta 10.000 mensajes mensuales" : "Up to 10,000 monthly messages",
                isEs ? "Hasta 10 GB de almacenamiento" : "Up to 10 GB file storage",
                isEs ? "Hasta 30 automatizaciones activas" : "Up to 30 active automations",
                isEs ? "Hasta 100 alertas activas" : "Up to 100 active alerts"
              ],
              buttonLabel: isEs ? "Empezar Scale" : "Start Scale",
              accent: false
            },
            {
              tier: 'unlimited' as PlanTier,
              title: isEs ? "Ilimitado" : "Unlimited",
              monthlyPrice: TIER_MONTHLY_PRICE.unlimited,
              clients: isEs ? "Clientes activos ilimitados" : "Unlimited active clients",
              features: [
                isEs ? "Todo lo de Scale" : "Everything in Scale",
                isEs ? "Clientes activos ilimitados" : "Unlimited active clients",
                isEs ? "Mensajes mensuales ilimitados" : "Unlimited monthly messages",
                isEs ? "Almacenamiento ilimitado" : "Unlimited file storage",
                isEs ? "Automatizaciones activas ilimitadas" : "Unlimited active automations",
                isEs ? "Alertas activas ilimitadas" : "Unlimited active alerts"
              ],
              buttonLabel: isEs ? "Empezar Ilimitado" : "Start Unlimited",
              accent: false
            }
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col border border-slate-200 dark:border-slate-800 transition-shadow hover:shadow-2xl hover:shadow-black/5 ${
                currentTier === plan.tier
                  ? 'ring-2 ring-emerald-500/30'
                  : ''
              }`}
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                  {currentTier === plan.tier && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {isEs ? 'Tu plan' : 'Your plan'}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{calculatePrice(plan.monthlyPrice)}€</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{isEs ? '/mes' : '/month'}</span>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full w-fit mb-8">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">{plan.clients}</span>
              </div>
              <ul className="space-y-6 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 w-5 h-5 fill-emerald-500/10" />
                    <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              {currentTier === plan.tier ? (
                <div className="w-full py-4 rounded-full font-bold border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {isEs ? 'Plan actual' : 'Current plan'}
                </div>
              ) : onManageBilling ? (
                <button
                  onClick={onManageBilling}
                  className={`w-full py-4 rounded-full font-bold transition-all duration-300 cursor-pointer border flex items-center justify-center gap-2 ${
                    idx === 1
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-transparent text-slate-900 dark:text-white border-slate-900 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {isEs ? 'Cambiar de plan' : 'Change plan'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading !== null}
                  className={`w-full py-4 rounded-full font-bold transition-all duration-300 cursor-pointer border flex items-center justify-center gap-2 ${
                    loading === plan.tier ? 'opacity-70 cursor-wait' : ''
                  } ${
                    idx === 1
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-transparent text-slate-900 dark:text-white border-slate-900 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900'
                  }`}
                >
                  {loading === plan.tier ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {loading === plan.tier ? (isEs ? 'Conectando...' : 'Connecting...') : plan.buttonLabel}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Detailed Comparison Section */}
        <section className="mt-32">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-sans text-5xl text-slate-900 dark:text-white mb-6 font-medium">{isEs ? 'Compara capacidades de la plataforma' : 'Compare platform capabilities'}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              {isEs ? 'Una comparativa lado a lado de todo lo incluido en los planes para ayudarte a elegir mejor.' : 'A side-by-side look at everything included in our plans to help you make the best choice.'}
            </p>
          </div>
          <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full border-collapse text-left min-w-[800px] font-body">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-10 px-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-1/4">{isEs ? 'Característica' : 'Feature'}</th>
                  <th className="py-10 px-6 text-xl font-bold text-slate-900 dark:text-white text-center">{isEs ? 'Profesional' : 'Professional'}</th>
                  <th className="py-10 px-6 text-xl font-bold text-slate-900 dark:text-white text-center relative bg-slate-50 dark:bg-slate-800/60">Scale</th>
                  <th className="py-10 px-6 text-xl font-bold text-slate-900 dark:text-white text-center">{isEs ? 'Ilimitado' : 'Unlimited'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { name: isEs ? "Base de datos nutricional" : "Nutrition Database", prof: true, scale: true, unlim: true },
                  { name: isEs ? "Herramientas de planificación de comidas" : "Meal Planning Tools", prof: true, scale: true, unlim: true },
                  { name: isEs ? "Paneles de progreso" : "Progress Dashboards", prof: true, scale: true, unlim: true },
                  { name: isEs ? "App móvil para clientes" : "Mobile Client App", prof: true, scale: true, unlim: true },
                  { name: isEs ? "Límite de clientes activos" : "Active Client Limit", prof: isEs ? "20 clientes" : "20 clients", scale: isEs ? "60 clientes" : "60 clients", unlim: isEs ? "Ilimitado" : "Unlimited" },
                  { name: isEs ? "Mensajes mensuales" : "Monthly Messages", prof: "2,000", scale: "10,000", unlim: isEs ? "Ilimitado" : "Unlimited" },
                  { name: isEs ? "Espacio de almacenamiento" : "Storage Space", prof: "2GB", scale: "10GB", unlim: isEs ? "Ilimitado" : "Unlimited" },
                  { name: isEs ? "Automatizaciones de flujo" : "Workflow Automations", prof: "10", scale: "30", unlim: isEs ? "Ilimitado" : "Unlimited" },
                  { name: isEs ? "Alertas inteligentes" : "Intelligent Alerts", prof: isEs ? "25 / mes" : "25 / mo", scale: isEs ? "100 / mes" : "100 / mo", unlim: isEs ? "Ilimitado" : "Unlimited" },
                ].map((row, i) => (
                  <tr key={i} className="table-row-hover transition-colors group">
                    <td className="py-6 px-8 text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{row.name}</td>
                    <td className="py-6 px-6 text-center">
                      {row.prof === true ? (
                        <CheckCircle2 className="text-emerald-500/60 w-5 h-5 mx-auto" />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">{row.prof}</span>
                      )}
                    </td>
                    <td className="py-6 px-6 text-center bg-slate-50 dark:bg-slate-800/60">
                      {row.scale === true ? (
                        <CheckCircle2 className="text-emerald-500 w-6 h-6 mx-auto" />
                      ) : (
                        <span className="text-slate-900 dark:text-white font-medium tabular-nums">{row.scale}</span>
                      )}
                    </td>
                    <td className="py-6 px-6 text-center">
                      {row.unlim === true ? (
                        <CheckCircle2 className="text-emerald-500/60 w-5 h-5 mx-auto" />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{row.unlim}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
