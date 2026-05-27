import FeatureGrid from './FeatureGrid';
import IntegrationsSection from './IntegrationsSection';
import { useLanguage } from '../../context/LanguageContext';

interface FeaturesPageProps {
  onBack: () => void;
  onDemo: () => void;
}

/**
 * Pagina dedicada a Features. Reusa el FeatureGrid y la seccion de
 * integraciones del home, mas detalles especificos por capacidad principal.
 */
export default function FeaturesPage({ onBack, onDemo }: FeaturesPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const detailedFeatures: { es: [string, string]; en: [string, string] }[] = [
    {
      es: ['Editor de planes nutricionales', 'Crea planes con comidas, ingredientes y macros automáticos. Reescala las cantidades a los objetivos del cliente con un clic.'],
      en: ['Nutrition plan editor', 'Build plans with meals, ingredients and automatic macros. Rescale quantities to the client’s goals in one click.'],
    },
    {
      es: ['Biblioteca de recetas', 'Más de 40 recetas detalladas (ES/EN) listas para asignar, con micronutrientes, alérgenos, dificultad y conservación.'],
      en: ['Recipe library', 'Over 40 detailed recipes (ES/EN) ready to assign, with micronutrients, allergens, difficulty and storage tips.'],
    },
    {
      es: ['Programas de entrenamiento por bloques', 'Estructura semanas, bloques y ejercicios con progresión. RPE, RIR y notas por sesión.'],
      en: ['Block-based training programs', 'Structure weeks, blocks and exercises with progression. RPE, RIR and session notes.'],
    },
    {
      es: ['Check-ins personalizables', 'Plantillas con preguntas tipo escala, número, foto, texto y dependencias. Revisión con feedback estructurado.'],
      en: ['Customisable check-ins', 'Templates with scale, number, photo, text questions and dependencies. Structured-feedback reviews.'],
    },
    {
      es: ['Workflow Builder visual', 'Automatizaciones drag-and-drop: triggers (peso, adherencia, citas), condiciones y acciones (mensajes, tareas, alertas).'],
      en: ['Visual workflow builder', 'Drag-and-drop automations: triggers (weight, adherence, appointments), conditions and actions (messages, tasks, alerts).'],
    },
    {
      es: ['Mensajería y notificaciones', 'Conversaciones 1-a-1 con adjuntos, lectura confirmada y notificaciones push en navegador y móvil.'],
      en: ['Messaging & notifications', '1-on-1 conversations with attachments, read receipts and browser + mobile push notifications.'],
    },
    {
      es: ['Facturación con Stripe', 'Suscripciones recurrentes, prueba gratis sin tarjeta, portal de cliente Stripe y gestión de planes integrada.'],
      en: ['Stripe billing', 'Recurring subscriptions, free trial without card, Stripe customer portal and integrated plan management.'],
    },
    {
      es: ['Privacidad y aislamiento', 'Cada coach solo accede a sus clientes; cada cliente solo a sus datos. Doble factor para coaches.'],
      en: ['Privacy & isolation', 'Each coach only accesses their clients; each client only their own data. Two-factor for coaches.'],
    },
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="px-4 max-w-6xl mx-auto text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Capacidades' : 'Capabilities'}
        </p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
          {isEs ? 'Todo lo que NutriFit hace por ti.' : 'Everything NutriFit does for you.'}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
          {isEs
            ? 'Una vista detallada de cada bloque del producto. Si dudas si una capacidad está cubierta, probablemente sí.'
            : 'A detailed view of every product block. If you’re unsure whether a capability is covered, it probably is.'}
        </p>
      </div>

      {/* Resumen visual reutilizable */}
      <FeatureGrid />

      {/* Detalle por bloque */}
      <section className="px-4 max-w-5xl mx-auto py-20 space-y-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
          {isEs ? 'En detalle' : 'In detail'}
        </p>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-10">
          {isEs ? 'Cada capacidad, sin letra pequeña.' : 'Every capability, no small print.'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          {detailedFeatures.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7">
              <h3 className="text-lg font-medium mb-2 tracking-tight">{isEs ? f.es[0] : f.en[0]}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{isEs ? f.es[1] : f.en[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <IntegrationsSection />

      <div className="px-4 text-center mt-10">
        <button
          onClick={onDemo}
          className="bg-black text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          {isEs ? 'Reservar una demo guiada' : 'Book a guided demo'}
        </button>
      </div>
    </div>
  );
}
