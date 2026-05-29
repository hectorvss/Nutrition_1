import type { ResourceArticle } from './types';

export const articles: ResourceArticle[] = [
  {
    id: 'adherence-metric',
    category: 'articles',
    readMin: 6,
    es: {
      title: 'Adherencia: la métrica que importa de verdad',
      subtitle: 'El peso sube y baja, las fotos engañan y las calorías mienten. Lo que predice resultados es cuánto cumple el cliente, semana tras semana.',
    },
    en: {
      title: 'Adherence: the metric that actually matters',
      subtitle: 'Weight swings, photos lie and calories deceive. What predicts results is how much your client actually sticks to the plan, week after week.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Si tuvieras que quedarte con un solo número para anticipar cómo le va a ir a un cliente, no elegirías el peso ni el porcentaje de grasa: elegirías la adherencia. Un plan mediocre cumplido al 90 % gana casi siempre a un plan perfecto cumplido al 50 %. Y sin embargo la mayoría de entrenadores siguen mirando la báscula y casi nadie mide lo único que controla de verdad: si el cliente hace lo que acordasteis.',
        en: 'If you had to pick a single number to predict how a client will do, you wouldn’t choose weight or body-fat percentage: you’d choose adherence. A mediocre plan followed 90 % of the time almost always beats a perfect plan followed 50 % of the time. Yet most coaches keep staring at the scale, and almost nobody measures the one thing they actually control: whether the client does what you agreed on.',
      },
      {
        type: 'h',
        es: 'Por qué la adherencia predice mejor que cualquier número',
        en: 'Why adherence predicts better than any single number',
      },
      {
        type: 'p',
        es: 'El peso responde a la sal, al sueño, al ciclo, al glucógeno y a mil cosas que no son grasa. La adherencia, en cambio, es la causa: si se cumple el déficit y el entreno de forma consistente, los resultados llegan tarde o temprano. Por eso conviene tratarla como tu indicador principal y al peso como un dato más, ruidoso y a interpretar con calma.',
        en: 'Weight responds to salt, sleep, the cycle, glycogen and a thousand things that aren’t fat. Adherence, on the other hand, is the cause: if the deficit and the training are met consistently, results show up sooner or later. That’s why it’s worth treating it as your main indicator and weight as just one more data point, noisy and to be read calmly.',
      },
      {
        type: 'img',
        src: '/landing/feature-progress.png',
        gradient: 'gradient-bg-learning',
        alt: 'Panel de analítica con clientes activos, retención, abandono y MRR/ARR',
        es: 'La vista de progreso reúne retención, abandono y adherencia agregada: ahí ves de un vistazo qué clientes empiezan a soltarse antes de que se note en la báscula.',
        en: 'The progress view gathers retention, churn and aggregate adherence: that’s where you spot which clients are starting to slip before it shows up on the scale.',
      },
      {
        type: 'h',
        es: 'Cómo medirla cada semana sin volverte loco',
        en: 'How to measure it weekly without going crazy',
      },
      {
        type: 'ul',
        es: [
          'Define qué cuenta como cumplir: por ejemplo, días que registró comidas, sesiones de entreno completadas y pasos dentro del rango.',
          'Convierte cada bloque en un porcentaje sencillo (5 de 7 días de registro = 71 %) en lugar de una sensación vaga.',
          'Pide al cliente un check-in fijo el mismo día de la semana; la regularidad importa más que el detalle.',
          'Mira la tendencia de tres o cuatro semanas, no el dato suelto: una semana mala no es un patrón.',
          'Separa adherencia de resultado: alguien puede cumplir al 95 % y no bajar de peso, y eso te dice que ajustes el plan, no que aprietes al cliente.',
        ],
        en: [
          'Define what counts as compliance: for example, days they logged meals, training sessions completed and steps within range.',
          'Turn each block into a simple percentage (5 of 7 logging days = 71 %) instead of a vague feeling.',
          'Ask the client for a fixed check-in on the same day each week; regularity matters more than detail.',
          'Look at the three- or four-week trend, not the isolated number: one bad week isn’t a pattern.',
          'Separate adherence from outcome: someone can comply 95 % and not lose weight, and that tells you to adjust the plan, not to push the client harder.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-checkins.png',
        gradient: 'gradient-bg-writing',
        alt: 'Check-ins semanales con puntuación de adherencia y último peso registrado',
        es: 'Los check-ins semanales te dan la puntuación de adherencia y el último peso en el mismo sitio, así conviertes ese número fijo de cada semana en una tendencia fácil de leer.',
        en: 'Weekly check-ins put the adherence score and the latest weight in one place, turning that fixed weekly number into a trend that’s easy to read.',
      },
      {
        type: 'h',
        es: 'Qué hacer cuando la adherencia cae',
        en: 'What to do when adherence drops',
      },
      {
        type: 'p',
        es: 'Una caída casi nunca es falta de fuerza de voluntad: suele ser un plan demasiado exigente para la vida real del cliente esa semana. Antes de motivar, investiga. Pregunta qué se interpuso, recorta el plan a la mínima versión que sí puede cumplir y vuelve a subir el listón cuando recupere la racha. Es más rentable bajar la exigencia y mantener la constancia que insistir en un plan perfecto que nadie sigue.',
        en: 'A drop is almost never a lack of willpower: it’s usually a plan too demanding for the client’s real life that week. Before motivating, investigate. Ask what got in the way, cut the plan down to the smallest version they can actually hit, and raise the bar again once the streak is back. It pays more to lower the demand and keep consistency than to insist on a perfect plan nobody follows.',
      },
      {
        type: 'tip',
        es: 'Cuando un cliente baje del 70 % de adherencia dos semanas seguidas, no le mandes un plan nuevo: ten una conversación. El problema casi siempre está en la vida, no en la dieta.',
        en: 'When a client drops below 70 % adherence two weeks in a row, don’t send a new plan: have a conversation. The problem is almost always in their life, not in the diet.',
      },
    ],
  },
  {
    id: 'scale-40',
    category: 'articles',
    readMin: 7,
    es: {
      title: 'Cómo escalar a 40 clientes sin perder calidad',
      subtitle: 'Llegar a 40 clientes no es trabajar el doble de horas: es construir sistemas que hagan el trabajo repetitivo por ti y reservar tu atención para lo que de verdad necesita tu criterio.',
    },
    en: {
      title: 'Scaling to 40 clients without losing quality',
      subtitle: 'Reaching 40 clients isn’t about working twice the hours: it’s about building systems that handle the repetitive work for you and saving your attention for what truly needs your judgement.',
    },
    blocks: [
      {
        type: 'p',
        es: 'La mayoría de entrenadores se atascan entre 12 y 20 clientes por un motivo simple: cada cliente es un proceso manual hecho desde cero. Más clientes significan más horas, hasta que el día no da para más y la calidad se resiente. La salida no es trabajar más duro, sino estandarizar todo lo que se repite y personalizar solo lo que aporta valor real.',
        en: 'Most coaches get stuck between 12 and 20 clients for one simple reason: every client is a manual process built from scratch. More clients means more hours, until the day runs out and quality suffers. The way out isn’t to hustle harder, but to standardise everything that repeats and personalise only what adds real value.',
      },
      {
        type: 'h',
        es: 'Sistemas, no fuerza bruta',
        en: 'Systems, not brute force',
      },
      {
        type: 'p',
        es: 'Un sistema es cualquier proceso que produce el mismo resultado sin que tengas que pensarlo cada vez. El onboarding, la estructura del check-in semanal, las plantillas de planes y los mensajes recurrentes son candidatos perfectos. Si haces algo tres veces igual, conviértelo en plantilla; la próxima vez tardarás minutos en lugar de horas.',
        en: 'A system is any process that produces the same result without you having to think it through each time. Onboarding, the weekly check-in structure, plan templates and recurring messages are perfect candidates. If you do something the same way three times, turn it into a template; next time it’ll take minutes instead of hours.',
      },
      {
        type: 'img',
        src: '/landing/feature-clients.png',
        gradient: 'gradient-bg-planning',
        alt: 'Lista de clientes con estado, plan y adherencia por cada uno',
        es: 'La lista de clientes con estado, plan y adherencia te deja escanear toda tu cartera en segundos y decidir a quién dedicar tu tiempo esta semana.',
        en: 'The clients list with status, plan and adherence lets you scan your whole roster in seconds and decide who deserves your time this week.',
      },
      {
        type: 'h',
        es: 'Los pasos para escalar sin romperte',
        en: 'The steps to scale without breaking',
      },
      {
        type: 'steps',
        es: [
          'Plantilla todo lo plantillable: estructuras de dieta por objetivo, bloques de entreno y respuestas a las dudas que se repiten cada semana.',
          'Agrupa los check-ins en bloques (batching): revisa todos los lunes seguidos en lugar de saltar de tarea en tarea durante el día.',
          'Automatiza recordatorios y registros para que el cliente reporte solo, sin que tengas que perseguirlo.',
          'Filtra por adherencia y estado para detectar primero a quién necesita tu atención de verdad y no repartirla por igual.',
          'Reserva un hueco fijo a la semana para los casos que sí requieren criterio: ajustes finos, dudas complejas y clientes que se están soltando.',
        ],
        en: [
          'Template everything templatable: diet structures by goal, training blocks and answers to the questions that repeat every week.',
          'Group check-ins into blocks (batching): review every Monday back to back instead of jumping from task to task through the day.',
          'Automate reminders and logging so the client reports on their own, without you having to chase them.',
          'Filter by adherence and status to spot first who truly needs your attention rather than spreading it evenly.',
          'Reserve a fixed slot each week for the cases that do require judgement: fine-tuning, complex questions and clients who are slipping.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-automations.png',
        gradient: 'gradient-bg-learning',
        alt: 'Lista de automatizaciones con renovación de plan, check-in semanal y radar de abandono',
        es: 'Las automatizaciones —renovación de plan, check-in semanal, radar de abandono— hacen por ti el trabajo repetitivo que de otra forma te ataría a 20 clientes.',
        en: 'Automations —plan renewal, weekly check-in, churn radar— handle the repetitive work for you that would otherwise cap you at 20 clients.',
      },
      {
        type: 'h',
        es: 'Qué estandarizar y qué personalizar',
        en: 'What to standardise and what to personalise',
      },
      {
        type: 'ul',
        es: [
          'Estandariza: el proceso de alta, el formato del check-in, las plantillas de plan y la frecuencia de contacto.',
          'Personaliza: la interpretación de los datos, los ajustes según la respuesta individual y el tono de la conversación.',
          'Nunca estandarices: la decisión de cuándo cambiar el plan ni la atención en los momentos difíciles del cliente.',
        ],
        en: [
          'Standardise: the onboarding process, the check-in format, the plan templates and the contact frequency.',
          'Personalise: how you read the data, the adjustments based on individual response and the tone of the conversation.',
          'Never standardise: the decision of when to change the plan, nor your attention in the client’s hard moments.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-messages.png',
        gradient: 'gradient-bg-privacy',
        alt: 'Bandeja de mensajería uno a uno con los clientes',
        es: 'La mensajería uno a uno concentra las conversaciones en un único hilo por cliente: ahí reservas tu atención personal sin perderla entre apps y notificaciones sueltas.',
        en: 'One-on-one messaging keeps each client’s conversation in a single thread: that’s where you save your personal attention without scattering it across apps and stray notifications.',
      },
      {
        type: 'tip',
        es: 'Si una tarea no requiere tu criterio profesional, no debería requerir tu tiempo. Plantilla o automatiza todo lo demás y guarda tus horas para las decisiones que solo tú puedes tomar.',
        en: 'If a task doesn’t require your professional judgement, it shouldn’t require your time. Template or automate everything else and save your hours for the decisions only you can make.',
      },
    ],
  },
  {
    id: 'macro-mistakes',
    category: 'articles',
    readMin: 5,
    es: {
      title: 'Errores comunes al planificar macros',
      subtitle: 'Planificar macros parece sencillo hasta que un cliente no progresa, se queda con hambre o reacciona a un alimento que ni mirabas. Estos son los fallos que más se repiten.',
    },
    en: {
      title: 'Common mistakes when planning macros',
      subtitle: 'Planning macros looks simple until a client stalls, stays hungry or reacts to a food you weren’t even watching. These are the mistakes that come up most.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Repartir calorías en proteínas, grasas e hidratos no es lo difícil; lo difícil es hacerlo de forma que el cliente progrese, lo cumpla y no acabe en tu bandeja de entrada quejándose. La mayoría de los errores no son de cálculo, sino de descuido: cosas que se asumen, se copian o se ignoran. Aquí están los más habituales y cómo evitarlos.',
        en: 'Splitting calories into protein, fat and carbs isn’t the hard part; the hard part is doing it so the client progresses, sticks to it and doesn’t end up in your inbox complaining. Most mistakes aren’t about maths, but about carelessness: things you assume, copy or ignore. Here are the most common ones and how to avoid them.',
      },
      {
        type: 'img',
        src: '/landing/feature-nutrition.png',
        gradient: 'gradient-bg-shopping',
        alt: 'Plan de nutrición por cliente con objetivo, porcentaje de macros y kcal',
        es: 'El plan de nutrición por cliente muestra objetivo, porcentaje de macros y kcal juntos, así que cualquier desajuste salta a la vista antes de enviarlo.',
        en: 'The per-client nutrition plan shows goal, macro percentages and kcal together, so any imbalance stands out before you send it.',
      },
      {
        type: 'h',
        es: 'Los fallos que más se repiten',
        en: 'The mistakes that come up most',
      },
      {
        type: 'ul',
        es: [
          'Proteína demasiado baja: es lo primero que se sacrifica para encajar calorías, y es justo lo que más protege masa muscular y saciedad. Asegúrala antes de repartir el resto.',
          'Ignorar la fibra: un plan puede cuadrar en macros y dejar al cliente con hambre y mala digestión si la fibra se queda corta. No es opcional.',
          'Copiar y pegar sin recalcular: reutilizar un plan de otro cliente sin ajustar peso, objetivo y actividad es la vía rápida a que nadie progrese.',
          'No filtrar alergias e intolerancias: un solo alimento mal puesto puede ser desde un cliente molesto hasta un problema serio. Revísalo siempre antes de enviar.',
          'Olvidar que las preferencias mandan: el plan macronutricionalmente perfecto que el cliente odia tiene una adherencia del cero por ciento.',
        ],
        en: [
          'Protein too low: it’s the first thing sacrificed to fit calories, and it’s exactly what protects muscle mass and satiety the most. Lock it in before splitting the rest.',
          'Ignoring fibre: a plan can add up macro-wise and still leave the client hungry and with poor digestion if fibre falls short. It isn’t optional.',
          'Copy-pasting without recalculating: reusing another client’s plan without adjusting weight, goal and activity is the fast track to nobody progressing.',
          'Not filtering allergies and intolerances: a single misplaced food can mean anything from an annoyed client to a serious problem. Always check before sending.',
          'Forgetting that preferences win: the macro-perfect plan the client hates has zero per cent adherence.',
        ],
      },
      {
        type: 'h',
        es: 'Cómo evitarlos en la práctica',
        en: 'How to avoid them in practice',
      },
      {
        type: 'p',
        es: 'La mayoría de estos errores desaparecen con una rutina de revisión de dos minutos antes de enviar el plan: comprueba que la proteína cubre el objetivo, que la fibra llega al rango razonable, que recalculaste las cifras para este cliente y que ningún alimento choca con sus alergias o sus gustos. No es glamuroso, pero es lo que separa un plan que funciona de uno que vuelve corregido.',
        en: 'Most of these mistakes disappear with a two-minute review routine before sending the plan: check that protein covers the target, that fibre reaches a reasonable range, that you recalculated the numbers for this client and that no food clashes with their allergies or preferences. It isn’t glamorous, but it’s what separates a plan that works from one that comes back for corrections.',
      },
      {
        type: 'img',
        src: '/landing/feature-library.png',
        gradient: 'gradient-bg-planning',
        alt: 'Biblioteca de alimentos y recetas con tarjetas, kcal y etiquetas',
        es: 'La biblioteca de alimentos y recetas, con kcal y etiquetas a la vista, te deja partir de opciones ya cuadradas y filtradas en lugar de recalcular cada plan desde cero.',
        en: 'The foods and recipes library, with kcal and tags on show, lets you start from options that already add up and are filtered, instead of recalculating every plan from scratch.',
      },
      {
        type: 'tip',
        es: 'Antes de pulsar enviar, hazte siempre cuatro preguntas: ¿la proteína está cubierta?, ¿hay fibra suficiente?, ¿recalculé para este cliente? y ¿he filtrado sus alergias? Si las cuatro son un sí, el plan está listo.',
        en: 'Before you hit send, always ask yourself four questions: is protein covered? is there enough fibre? did I recalculate for this client? and have I filtered their allergies? If all four are yes, the plan is ready.',
      },
    ],
  },
];
