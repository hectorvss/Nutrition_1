import { ChevronLeft, User, Stethoscope, Users, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SolutionsPageProps {
  onBack: () => void;
  onDemo: () => void;
  onStart: () => void;
}

/**
 * Pagina de Soluciones: 4 perfiles de coach con sus retos especificos y
 * como NutriFit los resuelve. Ayuda al visitante a verse reflejado.
 */
export default function SolutionsPage({ onBack, onDemo, onStart }: SolutionsPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const profiles = [
    {
      Icon: User,
      es: {
        title: 'Coach independiente',
        sub: 'De 10 a 40 clientes sin perder el control.',
        pain: 'Pierdes horas cada semana cruzando hojas de cálculo, mensajes y archivos de Drive. Cada cliente nuevo añade fricción.',
        gains: [
          'Plantillas reutilizables que se adaptan a cada cliente',
          'Mensajería integrada con notificaciones',
          'Cobros recurrentes automáticos con Stripe',
          'Vista única de todo lo que tienes que hacer hoy',
        ],
      },
      en: {
        title: 'Independent coach',
        sub: 'From 10 to 40 clients without losing control.',
        pain: 'You lose hours every week juggling spreadsheets, messages and Drive files. Each new client adds friction.',
        gains: [
          'Reusable templates that adapt to every client',
          'Built-in messaging with notifications',
          'Automatic recurring billing with Stripe',
          'A single view of everything you need to do today',
        ],
      },
    },
    {
      Icon: Stethoscope,
      es: {
        title: 'Nutricionista clínico',
        sub: 'Trazabilidad clínica, no caos de mensajes.',
        pain: 'Cada paciente exige histórico, métricas y consentimientos. La burocracia se come el tiempo del paciente.',
        gains: [
          'Check-ins estructurados con histórico completo',
          'Datos en la UE, cifrado en tránsito y reposo',
          'Doble factor y registro de accesos',
          'Exportación de datos a demanda del paciente',
        ],
      },
      en: {
        title: 'Clinical nutritionist',
        sub: 'Clinical traceability, not messaging chaos.',
        pain: 'Every patient demands history, metrics and consents. Bureaucracy eats into patient time.',
        gains: [
          'Structured check-ins with full history',
          'EU data, encryption in transit and at rest',
          'Two-factor and access logging',
          'On-demand patient data export',
        ],
      },
    },
    {
      Icon: Users,
      es: {
        title: 'Equipo de coaches',
        sub: 'Mismo estándar, varios coaches.',
        pain: 'Cada coach hace los planes a su manera. Sin estándar, escalar el equipo significa perder calidad.',
        gains: [
          'Plantillas compartidas entre coaches',
          'Métricas globales del equipo en tiempo real',
          'Roles y aislamiento real coach ↔ cliente',
          'Automatizaciones para el primer mes del cliente',
        ],
      },
      en: {
        title: 'Coaching team',
        sub: 'One standard across many coaches.',
        pain: 'Each coach builds plans their own way. Without a standard, scaling the team means losing quality.',
        gains: [
          'Templates shared across coaches',
          'Live team-wide metrics',
          'Roles and real coach ↔ client isolation',
          'Automations for the client’s first month',
        ],
      },
    },
    {
      Icon: Building2,
      es: {
        title: 'Gimnasio o centro',
        sub: 'Sube el ticket medio con seguimiento real.',
        pain: 'Vendes entrenamientos sueltos. Los socios se desenganchan porque no hay seguimiento entre sesiones.',
        gains: [
          'Portal del cliente bajo tu marca',
          'Planes nutricionales como upsell del entrenamiento',
          'Alertas automáticas de adherencia',
          'Cobros recurrentes y gestión de churn',
        ],
      },
      en: {
        title: 'Gym or wellness centre',
        sub: 'Raise your average ticket with real follow-up.',
        pain: 'You sell standalone sessions. Members disengage because there’s no follow-up between sessions.',
        gains: [
          'Client portal under your brand',
          'Nutrition plans as an upsell to training',
          'Automatic adherence alerts',
          'Recurring billing and churn management',
        ],
      },
    },
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="px-4 max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-10"
        >
          <ChevronLeft className="w-4 h-4" />
          {isEs ? 'Volver a inicio' : 'Back to home'}
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Soluciones' : 'Solutions'}
        </p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
          {isEs ? 'Cuatro formas de usar NutriFit.' : 'Four ways to use NutriFit.'}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mb-16">
          {isEs
            ? 'Elige el perfil que más se parece a ti. La plataforma se adapta a tu modelo, no al revés.'
            : 'Pick the profile that fits you best. The platform adapts to your model, not the other way around.'}
        </p>

        <div className="space-y-6">
          {profiles.map(({ Icon, es, en }, i) => {
            const p = isEs ? es : en;
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-medium tracking-tight mb-2">{p.title}</h2>
                  <p className="text-sm text-gray-500">{p.sub}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    {isEs ? 'Reto' : 'Challenge'}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{p.pain}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    {isEs ? 'Qué te llevas' : 'What you get'}
                  </p>
                  <ul className="space-y-2">
                    {p.gains.map((g, j) => (
                      <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-black mt-1">·</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-16">
          <button
            onClick={onStart}
            className="bg-black text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            {isEs ? 'Empezar prueba gratis' : 'Start free trial'}
          </button>
          <button
            onClick={onDemo}
            className="px-8 py-3.5 rounded-full font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {isEs ? 'Reservar demo' : 'Book demo'}
          </button>
        </div>
      </div>
    </div>
  );
}
