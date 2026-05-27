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

interface SolutionsPageProps {
  onBack: () => void;
  onDemo: () => void;
  onStart: () => void;
}

/**
 * Pagina de Soluciones — enfocada al **coach independiente**.
 *
 * Decision de producto (mayo 2026): NutriFit hoy esta disenada y testeada
 * con coaches que trabajan solos, no con equipos, gimnasios ni clinicas.
 * Esta pagina vendia "4 perfiles" pero 3 de ellos no estan funcionales
 * todavia (equipo de coaches, gimnasio/centro, nutricion clinica). Esa
 * promesa de scope amplia diluye el mensaje y genera leads que no
 * encajan. La pagina ahora pone el foco en los problemas concretos del
 * coach independiente y como la app los resuelve — un nivel mas
 * especifico que el recorrido del producto, basado en "que hace el coach
 * en un dia normal" en vez de "que pantallas tiene el producto".
 */
export default function SolutionsPage({ onBack, onDemo, onStart }: SolutionsPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  // Bloques problema → solución. Pensados como "trabajo a realizar"
  // (jobs-to-be-done), no como features. Cada bloque tiene:
  //  - `before`: el dolor concreto del coach trabajando solo (sin la app)
  //  - `with`:   como queda esa misma tarea con NutriFit, en una frase
  //  - `proof`:  el detalle concreto de la plataforma que lo hace posible
  //              (no marketing vacio — algo que el usuario reconocera
  //              cuando entre al producto).
  const problems = [
    {
      Icon: Inbox,
      es: {
        title: 'Onboarding de cliente nuevo',
        before: 'Mandas un PDF con 30 preguntas por WhatsApp, el cliente lo rellena a medias, y acabas reconstruyendo su historial entre capturas y notas.',
        with:  'El cliente recibe un enlace y rellena un onboarding guiado en su móvil. Los datos llegan estructurados, validados y listos para diseñar el plan.',
        proof: 'Plantillas de onboarding con preguntas obligatorias, validación de campos y revisión del coach antes de aceptar.',
      },
      en: {
        title: 'New client onboarding',
        before: 'You send a 30-question PDF over WhatsApp, the client half-fills it, and you end up rebuilding their history from screenshots and notes.',
        with:  'The client gets a link and fills in a guided onboarding on their phone. Data lands structured, validated and ready to plan around.',
        proof: 'Onboarding templates with required fields, validation, and coach review before acceptance.',
      },
    },
    {
      Icon: ClipboardList,
      es: {
        title: 'Diseñar el primer plan en una tarde, no en una semana',
        before: 'Empiezas cada plan desde cero en Excel, copias macros de planes antiguos, calculas calorías a mano y olvidas filtrar por alergias.',
        with:  'Partes de una plantilla, ajustas calorías y reparto de macros con sliders, y el plan respeta automáticamente alergias y preferencias del cliente.',
        proof: 'Biblioteca de recetas + plantillas reutilizables + cálculo automático de macros y kcal por comida.',
      },
      en: {
        title: 'Design the first plan in an afternoon, not a week',
        before: 'Every plan starts blank in Excel, you copy macros from old ones, do calories by hand and forget to filter for allergies.',
        with:  'You start from a template, tune calories and macro split with sliders, and the plan respects allergies and preferences out of the box.',
        proof: 'Recipe library + reusable templates + automatic macro and kcal totals per meal.',
      },
    },
    {
      Icon: CalendarClock,
      es: {
        title: 'Check-ins semanales sin ir mensaje a mensaje',
        before: 'Cada lunes pides peso, fotos, sensaciones y adherencia por chat. Te llegan a horas distintas, en formatos distintos, y se te escapa algún cliente.',
        with:  'Cada cliente recibe el mismo check-in estructurado a la misma hora. Tú abres la lista y ves de un vistazo quién ha enviado, quién no, y dónde están los riesgos.',
        proof: 'Check-ins recurrentes con preguntas fijas (peso, medidas, dolor, sueño, hambre, RPE) y revisión por lotes.',
      },
      en: {
        title: 'Weekly check-ins without chasing messages',
        before: 'Every Monday you ask for weight, photos, mood and adherence over chat. Replies trickle in at random times, in random formats — and someone always slips.',
        with:  'Every client gets the same structured check-in at the same time. You open one list and see who replied, who didn’t, and where the risks are.',
        proof: 'Recurring check-ins with fixed questions (weight, measurements, pain, sleep, hunger, RPE) reviewed in batches.',
      },
    },
    {
      Icon: TrendingDown,
      es: {
        title: 'Detectar al cliente que se está desenganchando',
        before: 'Te enteras de que un cliente se va a dar de baja el día que te lo dice. Llevaba semanas sin abrir la app y no lo viste venir.',
        with:  'La plataforma marca los clientes con adherencia a la baja, días sin abrir el portal o check-ins en blanco. Sabes a quién llamar esta semana antes de perderlo.',
        proof: 'Alertas de adherencia, días desde el último check-in y panel de riesgo por cliente.',
      },
      en: {
        title: 'Spot the client about to drop off',
        before: 'You find out a client is leaving the day they tell you. They’d gone quiet for weeks and you didn’t see it coming.',
        with:  'The platform flags clients with dropping adherence, days of inactivity or empty check-ins. You know who to call this week, before you lose them.',
        proof: 'Adherence alerts, days-since-last-check-in and per-client risk panel.',
      },
    },
    {
      Icon: CreditCard,
      es: {
        title: 'Cobros recurrentes sin perseguir morosos',
        before: 'A final de mes recuerdas a un cliente que te pague por Bizum, otro te pide factura, y un tercero olvidó la suscripción.',
        with:  'Cobros mensuales automáticos con Stripe. Si una tarjeta falla, el cliente recibe el aviso y tú ves el estado sin abrir el correo.',
        proof: 'Suscripciones Stripe nativas, gestión de impagos y portal de facturación del cliente.',
      },
      en: {
        title: 'Recurring billing without chasing late payers',
        before: 'End of month: you remind one client to pay by transfer, another wants an invoice, a third forgot their subscription.',
        with:  'Monthly billing on autopilot with Stripe. Failed card? The client gets a heads-up and you see the status without opening email.',
        proof: 'Native Stripe subscriptions, dunning, and a client-side billing portal.',
      },
    },
    {
      Icon: Sparkles,
      es: {
        title: 'Verte como un servicio premium, no como un freelance con Excel',
        before: 'Entregas planes en PDF, capturas y audios por WhatsApp. Funciona, pero parece amateur al lado de servicios de 200 €/mes.',
        with:  'El cliente entra a un portal con tu marca, ve su plan del día, sus progresos y habla contigo en un mismo sitio. Tu servicio parece (y es) un producto.',
        proof: 'Portal de cliente con tu color corporativo, dominio personalizado en Scale y chat integrado.',
      },
      en: {
        title: 'Feel like a premium service, not a freelancer with Excel',
        before: 'You deliver plans as PDFs, screenshots and voice notes over WhatsApp. It works — but it looks amateur next to 200 €/mo services.',
        with:  'Your client lands on a portal with your brand, sees today’s plan, their progress and chats with you in one place. Your service feels (and is) a product.',
        proof: 'Branded client portal, custom colours, custom domain on Scale, integrated chat.',
      },
    },
    {
      Icon: Clock,
      es: {
        title: 'Recuperar la noche del domingo',
        before: 'Domingo a las 22 h preparando los planes de la semana, copiando bloques entre clientes y respondiendo dudas sueltas del fin de semana.',
        with:  'Los planes de la semana ya están listos a partir de la plantilla del cliente, las dudas frecuentes llegan respondidas con plantillas, y tú cierras el portátil a las 19 h.',
        proof: 'Plantillas + planes semanales reutilizables + respuestas guardadas en el chat del cliente.',
      },
      en: {
        title: 'Get your Sunday night back',
        before: 'Sunday 10 pm prepping next week’s plans, copy-pasting blocks between clients, answering weekend questions one by one.',
        with:  'Next week’s plans roll over from each client’s template, common questions get template replies, and you close the laptop at 7 pm.',
        proof: 'Templates + reusable weekly plans + saved replies in the client chat.',
      },
    },
  ];

  // "Un día normal" — comparativa explícita lunes-a-domingo para que el
  // visitante se vea reflejado de manera concreta antes de leer los
  // bloques. Es la sección que mejor responde al "¿esto es para mí?".
  const dayInLife = [
    {
      es: { time: 'Lunes 08:00', a: 'Mandas 12 mensajes pidiendo el check-in semanal.', b: 'Tus 12 clientes ya tienen el check-in en su móvil. Tú aún estás desayunando.' },
      en: { time: 'Monday 08:00', a: 'You send 12 messages asking for the weekly check-in.', b: 'Your 12 clients already have the check-in on their phone. You’re still having breakfast.' },
    },
    {
      es: { time: 'Martes 11:00', a: 'Cruzas pesos en una hoja para ver quién subió y quién bajó.', b: 'Abres la app y ves la curva de cada cliente al instante.' },
      en: { time: 'Tuesday 11:00', a: 'You cross weights in a spreadsheet to see who went up and down.', b: 'You open the app and see every client’s curve at a glance.' },
    },
    {
      es: { time: 'Miércoles 19:00', a: 'Cliente nuevo te pasa alergias por audio. Lo apuntas en una nota.', b: 'El cliente entra al onboarding desde su enlace y rellena alergias estructuradas.' },
      en: { time: 'Wednesday 19:00', a: 'A new client sends allergies as a voice note. You jot them on a sticky.', b: 'The client opens onboarding from their link and submits allergies, properly tagged.' },
    },
    {
      es: { time: 'Jueves 22:30', a: 'Te das cuenta de que un cliente lleva 2 semanas sin contestar.', b: 'La app te avisó el viernes anterior. Ya hablasteis el sábado.' },
      en: { time: 'Thursday 22:30', a: 'You realise a client has been silent for two weeks.', b: 'The app flagged it last Friday. You spoke on Saturday.' },
    },
    {
      es: { time: 'Domingo 22:00', a: 'Preparas los planes de la semana en Excel.', b: 'Repasas y publicas los planes en 30 minutos. Cierras el portátil.' },
      en: { time: 'Sunday 22:00', a: 'You build next week’s plans in Excel.', b: 'You review and publish next week’s plans in 30 minutes. Lid down.' },
    },
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="px-4 max-w-6xl mx-auto text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Soluciones · Coach independiente' : 'Solutions · Independent coach'}
        </p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
          {isEs ? (
            <>Pensada para coaches que trabajan <br className="hidden md:block" /> solos. Y bien.</>
          ) : (
            <>Built for coaches who work <br className="hidden md:block" /> alone. And do it well.</>
          )}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4 leading-relaxed">
          {isEs
            ? 'NutriFit está pensada para el coach independiente que ya tiene clientes, los lleva personalmente y quiere dejar de perder horas en tareas repetitivas. No es un CRM corporativo, no es una app de gimnasio, no es software clínico.'
            : 'NutriFit is built for the independent coach who already has clients, works with them personally, and wants to stop burning hours on busywork. It’s not a corporate CRM, not a gym app, not clinical software.'}
        </p>
        {/* Honesty disclaimer — explicit scope. Mejor decir lo que NO somos
            que generar leads de gym/clinica que luego abandonan. */}
        <p className="text-xs text-gray-400 max-w-3xl mx-auto mb-16">
          {isEs
            ? '¿Trabajas con un equipo de coaches, gestionas un gimnasio o haces nutrición clínica? Sigue trabajando como hasta ahora — esta plataforma aún no está pensada para tu caso, y te lo decimos antes de que pruebes.'
            : 'Running a coaching team, a gym, or a clinical practice? Keep going as you are — this platform isn’t built for that use case yet, and we’d rather say it before you sign up.'}
        </p>

        {/* "Tu semana sin NutriFit vs. con NutriFit" — comparativa concreta
            que ancla al visitante en su propia rutina antes de los bloques
            problema/solución. */}
        <div className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            {isEs ? 'Tu semana' : 'Your week'}
          </p>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-8">
            {isEs ? 'Antes y después, hora a hora.' : 'Before and after, hour by hour.'}
          </h2>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 bg-gray-50/50 border-b border-gray-100">
              <div className="col-span-3 md:col-span-2 px-5 py-3">{isEs ? 'Cuándo' : 'When'}</div>
              <div className="col-span-9 md:col-span-5 px-5 py-3 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-gray-300" />
                {isEs ? 'Sin NutriFit' : 'Without NutriFit'}
              </div>
              <div className="hidden md:flex col-span-5 px-5 py-3 items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {isEs ? 'Con NutriFit' : 'With NutriFit'}
              </div>
            </div>
            {dayInLife.map((row, idx) => {
              const r = isEs ? row.es : row.en;
              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 text-sm ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="col-span-3 md:col-span-2 px-5 py-4 font-medium text-gray-900">{r.time}</div>
                  <div className="col-span-9 md:col-span-5 px-5 py-4 text-gray-500 line-through decoration-gray-300">{r.a}</div>
                  <div className="col-span-12 md:col-span-5 px-5 pb-4 md:pt-4 md:pb-4 text-gray-800 md:border-l border-gray-100">{r.b}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloques problema → solución. Mismo patrón, 3 columnas:
            (icono + título) · "antes" tachado · "con NutriFit" + proof. */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Cómo resolvemos cada problema' : 'How we solve each problem'}
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-10">
          {isEs ? 'Siete fricciones diarias, resueltas.' : 'Seven daily frictions, solved.'}
        </h2>

        <div className="space-y-5">
          {problems.map(({ Icon, es, en }, i) => {
            const p = isEs ? es : en;
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-7 md:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
              >
                <div className="md:col-span-3">
                  <div className="w-11 h-11 rounded-2xl bg-black/5 flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                    {`0${i + 1}`}
                  </p>
                  <h3 className="text-xl font-medium tracking-tight leading-snug">{p.title}</h3>
                </div>

                <div className="md:col-span-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-gray-300" />
                    {isEs ? 'Antes' : 'Before'}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed line-through decoration-gray-200">
                    {p.before}
                  </p>
                </div>

                <div className="md:col-span-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {isEs ? 'Con NutriFit' : 'With NutriFit'}
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed mb-3">{p.with}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
                    <span className="font-bold uppercase tracking-widest text-gray-400 mr-2">{isEs ? 'En el producto' : 'In the product'}</span>
                    {p.proof}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* "Para quién no es" — repetido en formato lista para fijar el
            scope. Mejor perder un lead mal-encajado que captarlo y verle
            churnar al mes. */}
        <div className="mt-20 bg-gray-50/50 border border-gray-100 rounded-3xl p-8 md:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            {isEs ? 'Para quién NO es esto (todavía)' : 'Who this isn’t for (yet)'}
          </p>
          <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-6">
            {isEs ? 'Preferimos decírtelo antes que decepcionarte.' : 'We’d rather tell you up front than disappoint you.'}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <li className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="font-medium text-gray-900 mb-1">{isEs ? 'Equipos de varios coaches' : 'Multi-coach teams'}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{isEs ? 'Sin roles ni métricas globales del equipo todavía.' : 'No team roles or team-wide dashboards yet.'}</p>
            </li>
            <li className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="font-medium text-gray-900 mb-1">{isEs ? 'Gimnasios o cadenas' : 'Gyms or chains'}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{isEs ? 'No reemplaza el software de gestión de socios.' : 'Not a replacement for member-management software.'}</p>
            </li>
            <li className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="font-medium text-gray-900 mb-1">{isEs ? 'Nutrición clínica regulada' : 'Regulated clinical practice'}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{isEs ? 'No es un sistema de historia clínica certificado.' : 'Not a certified medical-records system.'}</p>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-16">
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
          {isEs ? '14 días de prueba gratis. Sin tarjeta.' : '14-day free trial. No credit card.'}
        </p>
      </div>
    </div>
  );
}
