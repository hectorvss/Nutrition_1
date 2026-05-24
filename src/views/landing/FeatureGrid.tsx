import { motion } from 'motion/react';
import {
  Users, Apple, Dumbbell, ClipboardCheck, MessageCircle, Bell,
  Calendar, BarChart3, Workflow, ShieldCheck, Globe2, Smartphone,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Grid de features concretas con icono + titular + descripcion corta.
 * Sustituye al texto generico anterior: el visitante ve de un vistazo
 * exactamente que cubre la plataforma.
 */
const features = [
  { Icon: Users,         es: ['Gestión de clientes', 'Perfil, historial, etiquetas y notas privadas en un solo lugar.'], en: ['Client management', 'Profile, history, tags and private notes in one place.'] },
  { Icon: Apple,         es: ['Planes de nutrición', 'Plantillas reutilizables, macros automáticos y recetas detalladas.'], en: ['Nutrition plans', 'Reusable templates, automatic macros and detailed recipes.'] },
  { Icon: Dumbbell,      es: ['Programas de entrenamiento', 'Bloques, ejercicios y progresión adaptables por cliente.'], en: ['Training programs', 'Blocks, exercises and progression tailored per client.'] },
  { Icon: ClipboardCheck,es: ['Check-ins semanales', 'Plantillas personalizables y revisión con feedback estructurado.'], en: ['Weekly check-ins', 'Custom templates and structured-feedback reviews.'] },
  { Icon: MessageCircle, es: ['Mensajería integrada', 'Conversación 1-a-1 con cada cliente, adjuntos y push.'], en: ['Built-in messaging', '1-on-1 chat with each client, attachments and push.'] },
  { Icon: Bell,          es: ['Alertas automáticas', 'Detecta desviaciones de adherencia antes de que el cliente se rinda.'], en: ['Automatic alerts', 'Catches adherence drift before the client gives up.'] },
  { Icon: Calendar,      es: ['Agenda y citas', 'Sincronización con Google Calendar y recordatorios automáticos.'], en: ['Calendar & bookings', 'Google Calendar sync and automatic reminders.'] },
  { Icon: BarChart3,     es: ['Analíticas de progreso', 'Peso, macros, fuerza y RPE en gráficos que el cliente entiende.'], en: ['Progress analytics', 'Weight, macros, strength and RPE in charts clients understand.'] },
  { Icon: Workflow,      es: ['Automatizaciones', 'Workflows visuales: triggers, condiciones, mensajes y tareas.'], en: ['Automations', 'Visual workflows: triggers, conditions, messages and tasks.'] },
  { Icon: ShieldCheck,   es: ['Seguridad y privacidad', 'TLS, aislamiento por tenant, doble factor y datos en la UE.'], en: ['Security & privacy', 'TLS, tenant isolation, two-factor and EU-hosted data.'] },
  { Icon: Globe2,        es: ['Bilingüe (ES/EN)', 'Cada usuario elige su idioma; formatos de fecha y número se adaptan.'], en: ['Bilingual (ES/EN)', 'Each user picks their language; date and number formats adapt.'] },
  { Icon: Smartphone,    es: ['Portal del cliente', 'App web mobile-first para que cada cliente siga su plan en el móvil.'], en: ['Client portal', 'Mobile-first web app for clients to follow their plan on the go.'] },
];

export default function FeatureGrid() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Todo lo que necesitas' : 'Everything you need'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs ? 'Un solo sistema, todas las herramientas.' : 'One system, every tool.'}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ Icon, es, en }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.04 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-base font-medium mb-1">{isEs ? es[0] : en[0]}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{isEs ? es[1] : en[1]}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
