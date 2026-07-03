import {
  Clock,
  Inbox,
  ClipboardList,
  TrendingDown,
  CreditCard,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import UseCasesSection from './UseCasesSection';

interface SolutionsPageProps {
  onBack: () => void;
  onDemo: () => void;
  onStart: () => void;
}

/**
 * Pagina de Soluciones — coach independiente.
 *
 * Iteracion (mayo 2026): version anterior tenia bloques largos de
 * texto corrido. Esta version pasa a esquema bullet-point + frases
 * cortas: 3 bullets de dolor vs 3 bullets de solucion por problema.
 * Mismo contenido, mucho mas escaneable.
 */
export default function SolutionsPage({ onBack, onDemo, onStart }: SolutionsPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  // Cada problema = título + 3 bullets "antes" + 3 bullets "con Nuly"
  // + 1 línea de proof. Sin párrafos largos.
  const problems = [
    {
      Icon: Inbox,
      es: {
        title: 'Onboarding de cliente nuevo',
        before: [
          'PDF largo enviado por WhatsApp',
          'Datos a medias, fotos por separado',
          'Reconstruyes el historial a mano',
        ],
        after: [
          'Onboarding guiado en el móvil del cliente',
          'Campos obligatorios y validados',
          'Llega listo para diseñar el plan',
        ],
        proof: 'Plantillas de onboarding con preguntas fijas y revisión del coach.',
      },
      en: {
        title: 'New client onboarding',
        before: [
          'Long PDF sent over WhatsApp',
          'Half-filled answers, photos elsewhere',
          'You rebuild the history by hand',
        ],
        after: [
          'Guided onboarding on the client’s phone',
          'Required, validated fields',
          'Lands ready to design the plan',
        ],
        proof: 'Onboarding templates with required questions and coach review.',
      },
    },
    {
      Icon: ClipboardList,
      es: {
        title: 'Diseñar el primer plan',
        before: [
          'Excel en blanco para cada cliente',
          'Macros y kcal a mano',
          'Olvidas filtrar alergias',
        ],
        after: [
          'Partes de una plantilla',
          'Macros y kcal automáticos por comida',
          'Filtros de alergias y preferencias',
        ],
        proof: 'Biblioteca de recetas + plantillas reutilizables + cálculo automático.',
      },
      en: {
        title: 'Design the first plan',
        before: [
          'Blank Excel for every client',
          'Macros and kcal done by hand',
          'You forget to filter allergies',
        ],
        after: [
          'Start from a template',
          'Automatic macros and kcal per meal',
          'Allergy and preference filters',
        ],
        proof: 'Recipe library + reusable templates + automatic computation.',
      },
    },
    {
      Icon: CalendarClock,
      es: {
        title: 'Check-ins semanales',
        before: [
          'Pides peso y sensaciones por chat',
          'Respuestas a horas distintas',
          'Siempre se te escapa alguien',
        ],
        after: [
          'Mismo check-in para todos, mismo día',
          'Lista única con quién envió y quién no',
          'Revisión por lotes',
        ],
        proof: 'Check-ins recurrentes con peso, medidas, dolor, sueño, hambre y RPE.',
      },
      en: {
        title: 'Weekly check-ins',
        before: [
          'You ask weight + mood over chat',
          'Replies arrive at random times',
          'Someone always slips through',
        ],
        after: [
          'Same check-in, same day, every client',
          'One list: who replied, who didn’t',
          'Batch review',
        ],
        proof: 'Recurring check-ins for weight, measurements, pain, sleep, hunger and RPE.',
      },
    },
    {
      Icon: TrendingDown,
      es: {
        title: 'Detectar churn antes de tiempo',
        before: [
          'Te enteras el día que se va',
          'Cliente lleva semanas en silencio',
          'No tienes señal hasta que es tarde',
        ],
        after: [
          'Alerta de adherencia a la baja',
          'Días sin abrir el portal',
          'Sabes a quién llamar esta semana',
        ],
        proof: 'Alertas + panel de riesgo + días desde el último check-in.',
      },
      en: {
        title: 'Spot churn before it hits',
        before: [
          'You learn the day they leave',
          'Client has been silent for weeks',
          'No signal until it’s too late',
        ],
        after: [
          'Adherence-drop alert',
          'Days since the portal was opened',
          'You know who to call this week',
        ],
        proof: 'Alerts + risk panel + days-since-last-check-in.',
      },
    },
    {
      Icon: CreditCard,
      es: {
        title: 'Cobros recurrentes',
        before: [
          'Recordatorios de Bizum a final de mes',
          'Facturas a mano cliente a cliente',
          'Suscripciones olvidadas',
        ],
        after: [
          'Cobros automáticos cada mes',
          'Aviso al cliente si falla la tarjeta',
          'Portal de facturación del cliente',
        ],
        proof: 'Suscripciones Stripe nativas y gestión de impagos.',
      },
      en: {
        title: 'Recurring billing',
        before: [
          'End-of-month payment reminders',
          'Invoices done client by client',
          'Subscriptions slip through',
        ],
        after: [
          'Automatic monthly charges',
          'Client notified if a card fails',
          'Self-serve billing portal',
        ],
        proof: 'Native Stripe subscriptions and dunning.',
      },
    },
    {
      Icon: Sparkles,
      es: {
        title: 'Marca y experiencia premium',
        before: [
          'Planes en PDF y capturas',
          'Audios de WhatsApp con instrucciones',
          'Pareces un freelance con Excel',
        ],
        after: [
          'Portal del cliente con tu marca',
          'Plan del día, progreso y chat en un sitio',
          'Tu servicio parece un producto',
        ],
        proof: 'Portal con tu color, dominio personalizado en Scale y chat integrado.',
      },
      en: {
        title: 'Brand and premium feel',
        before: [
          'PDF plans and screenshots',
          'WhatsApp voice notes with instructions',
          'You look like an Excel freelancer',
        ],
        after: [
          'Branded client portal',
          'Today’s plan, progress and chat in one place',
          'Your service feels like a product',
        ],
        proof: 'Branded portal, custom colour, custom domain on Scale, integrated chat.',
      },
    },
    {
      Icon: Clock,
      es: {
        title: 'Recuperar la noche del domingo',
        before: [
          'Preparas planes a las 22 h',
          'Copia y pega entre clientes',
          'Respondes dudas del fin de semana',
        ],
        after: [
          'Planes semanales reutilizables',
          'Respuestas guardadas para dudas frecuentes',
          'Cierras el portátil a las 19 h',
        ],
        proof: 'Plantillas + planes semanales + respuestas guardadas.',
      },
      en: {
        title: 'Get your Sunday night back',
        before: [
          'You prep plans at 10 pm',
          'Copy-paste between clients',
          'You answer weekend questions',
        ],
        after: [
          'Reusable weekly plans',
          'Saved replies for common questions',
          'Laptop closed at 7 pm',
        ],
        proof: 'Templates + weekly plans + saved replies.',
      },
    },
  ];

  // Comparativa "tu semana" — fila corta por dia clave.
  const dayInLife = [
    { es: { time: 'Lunes 08:00', a: '12 mensajes pidiendo el check-in.', b: 'Check-in ya en su móvil.' },
      en: { time: 'Mon 08:00',   a: '12 messages asking for the check-in.', b: 'Check-in already on their phone.' } },
    { es: { time: 'Martes 11:00', a: 'Cruzas pesos en Excel.', b: 'Curva de cada cliente al instante.' },
      en: { time: 'Tue 11:00',    a: 'You cross weights in Excel.', b: 'Every client’s curve at a glance.' } },
    { es: { time: 'Miércoles 19:00', a: 'Alergias por audio en una nota.', b: 'Alergias estructuradas desde el onboarding.' },
      en: { time: 'Wed 19:00',       a: 'Allergies as a voice note.', b: 'Allergies tagged during onboarding.' } },
    { es: { time: 'Jueves 22:30', a: 'Te das cuenta de que un cliente lleva 2 semanas mudo.', b: 'La alerta saltó hace 6 días.' },
      en: { time: 'Thu 22:30',    a: 'You notice a client has been silent 2 weeks.', b: 'The alert fired 6 days ago.' } },
    { es: { time: 'Domingo 22:00', a: 'Planes de la semana en Excel.', b: 'Planes revisados y publicados en 30 min.' },
      en: { time: 'Sun 22:00',     a: 'Next week’s plans in Excel.', b: 'Plans reviewed and live in 30 min.' } },
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="px-4 max-w-6xl mx-auto text-center">
        {/* Hero — frases muy cortas, sin parrafo largo. */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Soluciones · Coach independiente' : 'Solutions · Independent coach'}
        </p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-5 leading-tight">
          {isEs ? (
            <>Más clientes, mejores resultados, <br className="hidden md:block" /> las mismas horas.</>
          ) : (
            <>More clients, better results, <br className="hidden md:block" /> same hours.</>
          )}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          {isEs
            ? 'El sistema que convierte tu coaching en un servicio profesional, sin dejar a nadie atrás.'
            : 'The system that turns your coaching into a professional service, without leaving anyone behind.'}
        </p>

        {/* Chips de scope — version compacta del disclaimer largo */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          {[
            isEs ? 'Coach 1-a-1'   : '1-on-1 coach',
            isEs ? 'Clientes ilimitados' : 'Unlimited clients',
            isEs ? 'Nutrición + entreno' : 'Nutrition + training',
            isEs ? 'Cobros recurrentes'  : 'Recurring billing',
          ].map((label, i) => (
            <span key={i} className="text-[11px] font-medium uppercase tracking-widest bg-white border border-gray-100 text-gray-700 rounded-full px-3 py-1.5">
              {label}
            </span>
          ))}
        </div>

        {/* "Tu semana" — tabla compacta antes/después */}
        <div className="mb-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {isEs ? 'Tu semana' : 'Your week'}
          </p>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-8">
            {isEs ? 'Antes y después.' : 'Before and after.'}
          </h2>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden text-left">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 bg-gray-50/50 border-b border-gray-100">
              <div className="col-span-3 md:col-span-2 px-5 py-3">{isEs ? 'Cuándo' : 'When'}</div>
              <div className="col-span-9 md:col-span-5 px-5 py-3 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-gray-300" />
                {isEs ? 'Sin Nuly' : 'Without Nuly'}
              </div>
              <div className="hidden md:flex col-span-5 px-5 py-3 items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {isEs ? 'Con Nuly' : 'With Nuly'}
              </div>
            </div>
            {dayInLife.map((row, idx) => {
              const r = isEs ? row.es : row.en;
              return (
                <div key={idx} className={`grid grid-cols-12 text-sm ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                  <div className="col-span-3 md:col-span-2 px-5 py-4 font-medium text-gray-900">{r.time}</div>
                  <div className="col-span-9 md:col-span-5 px-5 py-4 text-gray-400">{r.a}</div>
                  <div className="col-span-12 md:col-span-5 px-5 pb-4 md:pt-4 md:pb-4 text-gray-800 md:border-l border-gray-100">{r.b}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 problemas — formato bullets cortos */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
          {isEs ? 'Cómo resolvemos cada fricción' : 'How we solve each friction'}
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
          {isEs ? 'Siete fricciones diarias, resueltas.' : 'Seven daily frictions, solved.'}
        </h2>

        {/* 7 fricciones — mismo lenguaje visual que la tabla "antes y
            después". Una sola tabla con 7 filas, columnas Fricción /
            Sin Nuly / Con Nuly. Sin tachado, sin "En el producto".
            "Sin Nuly" en gris claro, "Con Nuly" en negro con check. */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden text-left">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 bg-gray-50/50 border-b border-gray-100">
            <div className="col-span-12 md:col-span-3 px-6 py-4">
              {isEs ? 'Fricción' : 'Friction'}
            </div>
            <div className="col-span-6 md:col-span-4 px-6 py-4 flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-gray-300" />
              {isEs ? 'Sin Nuly' : 'Without Nuly'}
            </div>
            <div className="col-span-6 md:col-span-5 px-6 py-4 flex items-center gap-2 border-l border-gray-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {isEs ? 'Con Nuly' : 'With Nuly'}
            </div>
          </div>
          {problems.map(({ Icon, es, en }, i) => {
            const p = isEs ? es : en;
            return (
              <div
                key={i}
                className={`grid grid-cols-12 ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                {/* Columna 1: icono + título de la fricción */}
                <div className="col-span-12 md:col-span-3 px-6 py-6 flex items-center gap-3 md:border-r border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-0.5">{`0${i + 1}`}</p>
                    <h3 className="text-base md:text-lg font-medium tracking-tight leading-snug">
                      {p.title}
                    </h3>
                  </div>
                </div>

                {/* Columna 2: Antes (gris claro, sin tachado) */}
                <div className="col-span-12 md:col-span-4 px-6 py-6 text-[14px] text-gray-400">
                  <ul className="space-y-1.5">
                    {p.before.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Columna 3: Con Nuly (texto en negro, sin "En el producto") */}
                <div className="col-span-12 md:col-span-5 px-6 py-6 text-[14px] text-gray-900 md:border-l border-gray-100">
                  <ul className="space-y-1.5">
                    {p.after.map((a, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* "Para qué momento del coach independiente" — movido aqui desde la
            home. Su contexto natural es Soluciones, no la pantalla de
            Producto. Deja la home centrada en el funnel de conversion. */}
        <div className="mt-8 -mx-4 text-left">
          <UseCasesSection />
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <button
            onClick={onStart}
            className="bg-black text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            {isEs ? 'Empezar prueba gratis' : 'Start free trial'}
          </button>
          <button
            onClick={onDemo}
            className="px-8 py-3.5 rounded-full font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            {isEs ? 'Reservar demo' : 'Book demo'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          {isEs ? '14 días gratis. Sin tarjeta.' : '14 days free. No card.'}
        </p>
      </div>
    </div>
  );
}
