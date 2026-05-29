import type { ResourceArticle } from './types';

export const guides: ResourceArticle[] = [
  {
    id: 'first-month',
    category: 'guides',
    readMin: 6,
    es: {
      title: 'Cómo configurar tu primer mes con la plataforma',
      subtitle: 'De la primera alta de cliente al primer check-in semanal, sin perderte por el camino.',
    },
    en: {
      title: 'Setting up your first month',
      subtitle: 'From your first client onboarding to your first weekly check-in, without getting lost.',
    },
    blocks: [
      {
        type: 'p',
        es: 'El primer mes marca el ritmo de toda la relación con tu cliente. No necesitas tenerlo todo perfecto desde el día uno: necesitas que el cliente esté dado de alta, tenga un plan claro y sepa cuándo y cómo va a reportar su progreso. Esta guía te lleva por esos tres hitos en el orden correcto.',
        en: 'The first month sets the tone for the whole relationship with your client. You don’t need everything perfect on day one: you need the client onboarded, with a clear plan, and knowing when and how they’ll report progress. This guide walks you through those three milestones in the right order.',
      },
      {
        type: 'img',
        src: '/landing/feature-dashboard.png',
        gradient: 'gradient-bg-planning',
        alt: 'Panel del entrenador con tareas pendientes, clientes activos y novedades',
        es: 'Tu panel reúne las tareas pendientes, los clientes activos y las novedades en un solo lugar.',
        en: 'Your dashboard gathers pending tasks, active clients and updates in a single place.',
      },
      {
        type: 'h',
        es: '1. Da de alta a tu cliente',
        en: '1. Onboard your client',
      },
      {
        type: 'steps',
        es: [
          'Crea el cliente desde la lista de clientes: nombre, email y objetivo principal (perder grasa, ganar masa, rendimiento o salud general).',
          'Registra los datos de partida: peso, altura, edad, nivel de actividad y, si los tienes, perímetros o foto inicial.',
          'Anota restricciones y contexto: alergias, alimentos que no tolera, lesiones, horarios de entreno y disponibilidad para cocinar.',
          'Envía la invitación para que el cliente acceda a su propio espacio y vea su plan y sus check-ins.',
        ],
        en: [
          'Create the client from the clients list: name, email and main goal (fat loss, muscle gain, performance or general health).',
          'Record baseline data: weight, height, age, activity level and, if available, measurements or a starting photo.',
          'Note restrictions and context: allergies, intolerances, injuries, training schedule and how much time they have to cook.',
          'Send the invitation so the client can access their own space and see their plan and check-ins.',
        ],
      },
      {
        type: 'tip',
        es: 'Dedica los primeros 10 minutos a las restricciones y el contexto, no a las kilocalorías. Un plan que el cliente no puede cumplir es peor que uno menos óptimo que sí encaja en su vida.',
        en: 'Spend the first 10 minutes on restrictions and context, not on calories. A plan the client can’t follow is worse than a less optimal one that actually fits their life.',
      },
      {
        type: 'img',
        src: '/landing/feature-onboarding.png',
        gradient: 'gradient-bg-shopping',
        alt: 'Seguimiento de onboarding con asignación y estado por cliente',
        es: 'Asigna el onboarding y sigue su estado cliente a cliente para no dejar ningún alta a medias.',
        en: 'Assign the onboarding and track its status per client so no setup is left half-finished.',
      },
      {
        type: 'img',
        src: '/landing/feature-clients.png',
        gradient: 'gradient-bg-learning',
        alt: 'Lista de clientes con estado, plan, adherencia y próxima cita',
        es: 'Desde la lista de clientes ves de un vistazo estado, plan, adherencia y próxima cita.',
        en: 'From the clients list you see status, plan, adherence and next appointment at a glance.',
      },
      {
        type: 'h',
        es: '2. Construye el primer plan',
        en: '2. Build the first plan',
      },
      {
        type: 'p',
        es: 'Para el primer plan, prioriza que sea sostenible por encima de que sea perfecto. Fija las kilocalorías a partir de un objetivo realista (por ejemplo, un déficit del 10-20 % sobre el gasto estimado para perder grasa) y reparte los macros con una base sólida: 1,6-2,2 g de proteína por kg de peso, grasas en torno al 25-30 % de las calorías y el resto en hidratos. Deja margen para ajustar en la segunda semana.',
        en: 'For the first plan, prioritise sustainability over perfection. Set calories from a realistic target (for example, a 10-20% deficit over estimated expenditure for fat loss) and distribute macros on a solid base: 1.6-2.2 g of protein per kg of bodyweight, fats around 25-30% of calories and the rest from carbohydrates. Leave room to adjust in week two.',
      },
      {
        type: 'h',
        es: '3. Programa el primer check-in',
        en: '3. Schedule the first check-in',
      },
      {
        type: 'p',
        es: 'Cierra el onboarding agendando el primer check-in para 7 días después. Explícale al cliente qué le vas a pedir (peso en ayunas, adherencia, sensaciones) para que llegue preparado. Ese primer reporte te dirá más sobre cómo ajustar el plan que cualquier cálculo inicial.',
        en: 'Close the onboarding by scheduling the first check-in for 7 days later. Tell the client what you’ll ask for (fasted weight, adherence, how they feel) so they come prepared. That first report will tell you more about how to adjust the plan than any initial calculation.',
      },
    ],
  },
  {
    id: 'plan-templates',
    category: 'guides',
    readMin: 5,
    es: {
      title: 'Plantillas de planes que funcionan en la práctica',
      subtitle: 'Reutiliza lo que ya funciona, personaliza lo que importa y deja de empezar de cero cada vez.',
    },
    en: {
      title: 'Plan templates that work in practice',
      subtitle: 'Reuse what already works, personalise what matters, and stop starting from scratch every time.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Crear cada plan desde cero no te hace mejor entrenador, solo más lento. Las plantillas te dan una base sólida que repites en segundos y reservan tu tiempo para lo que de verdad cambia entre clientes. La clave está en saber qué dejar fijo en la plantilla y qué tocar siempre a mano.',
        en: 'Building every plan from scratch doesn’t make you a better coach, just a slower one. Templates give you a solid base you can reuse in seconds and free up your time for what truly differs between clients. The key is knowing what to keep fixed in the template and what to always adjust by hand.',
      },
      {
        type: 'h',
        es: 'Qué meter en una plantilla',
        en: 'What to put in a template',
      },
      {
        type: 'ul',
        es: [
          'Estructura de comidas y reparto de macros por comida (por ejemplo, proteína en cada toma, hidratos alrededor del entreno).',
          'Presets de macros por objetivo: pérdida de grasa, mantenimiento y volumen, cada uno con su rango de proteína, grasa e hidratos.',
          'Listas de alimentos intercambiables por grupo, para que el cliente pueda variar sin descuadrar las cifras.',
          'Plantillas de entrenamiento por frecuencia: 3, 4 o 5 días, con progresión de cargas ya pautada.',
        ],
        en: [
          'Meal structure and macro split per meal (for example, protein at every meal, carbs around training).',
          'Macro presets by goal: fat loss, maintenance and bulk, each with its protein, fat and carb ranges.',
          'Interchangeable food lists per group, so the client can vary meals without breaking the numbers.',
          'Training templates by frequency: 3, 4 or 5 days, with load progression already laid out.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-nutrition.png',
        gradient: 'gradient-bg-writing',
        alt: 'Plan de nutrición por cliente con objetivo, porcentaje de macros y kilocalorías',
        es: 'Cada plan de nutrición arranca de un preset y se afina con el objetivo, los macros y las kcal del cliente.',
        en: 'Each nutrition plan starts from a preset and is fine-tuned with the client’s goal, macros and kcal.',
      },
      {
        type: 'img',
        src: '/landing/feature-library.png',
        gradient: 'gradient-bg-learning',
        alt: 'Biblioteca de alimentos y recetas con tarjetas que muestran kcal y etiquetas',
        es: 'La biblioteca de alimentos y recetas te da bloques reutilizables con sus kcal y etiquetas para montar listas intercambiables.',
        en: 'The Foods & Recipes library gives you reusable blocks with their kcal and tags to build interchangeable lists.',
      },
      {
        type: 'h',
        es: 'Reutilizar o personalizar',
        en: 'Reuse or personalise',
      },
      {
        type: 'p',
        es: 'Reutiliza la estructura y los presets; personaliza siempre las cifras absolutas y la selección de alimentos. Dos clientes con el mismo objetivo pueden partir de la misma plantilla, pero sus kilocalorías, sus horarios y los alimentos que toleran serán distintos. La plantilla te da el esqueleto en segundos; tú pones encima lo que hace que el plan sea suyo.',
        en: 'Reuse the structure and presets; always personalise the absolute numbers and food selection. Two clients with the same goal can start from the same template, but their calories, schedules and tolerated foods will differ. The template gives you the skeleton in seconds; you add on top what makes the plan theirs.',
      },
      {
        type: 'tip',
        es: 'Revisa tus plantillas cada pocos meses. Una plantilla es un punto de partida vivo, no una tabla grabada en piedra: si un patrón deja de funcionar con tus clientes, cámbialo en la plantilla y no en veinte planes uno a uno.',
        en: 'Review your templates every few months. A template is a living starting point, not a tablet of stone: if a pattern stops working for your clients, change it in the template instead of fixing twenty plans one by one.',
      },
    ],
  },
  {
    id: 'weekly-checkins',
    category: 'guides',
    readMin: 5,
    es: {
      title: 'Diseño de check-ins semanales eficaces',
      subtitle: 'Las preguntas que de verdad importan, con qué frecuencia y cómo revisarlas en minutos.',
    },
    en: {
      title: 'Designing effective weekly check-ins',
      subtitle: 'The questions that truly matter, how often to ask them, and how to review them in minutes.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Un buen check-in no es un cuestionario interminable: son las pocas señales que te permiten decidir si el plan sigue igual o cambia. Si pides demasiado, el cliente lo rellena con desgana y tú te pierdes en el ruido. Si pides lo justo, conviertes cada semana en una decisión clara.',
        en: 'A good check-in isn’t an endless questionnaire: it’s the few signals that let you decide whether the plan stays the same or changes. Ask for too much and the client fills it in half-heartedly while you drown in noise. Ask for just enough and every week turns into a clear decision.',
      },
      {
        type: 'h',
        es: 'Qué preguntar cada semana',
        en: 'What to ask every week',
      },
      {
        type: 'ul',
        es: [
          'Peso: la media de la semana pesa más que un dato suelto; pide varias mediciones en ayunas si es posible.',
          'Perímetros: cintura y cadera cada 2-4 semanas bastan para ver tendencia sin obsesionar.',
          'Adherencia: un porcentaje honesto de cumplimiento del plan, más útil que cualquier promesa de "lo he hecho bien".',
          'Sueño: horas y calidad, porque condicionan hambre, energía y recuperación.',
          'Estado de ánimo y energía: para detectar pronto la fatiga o un déficit demasiado agresivo.',
          'Dolor o molestias: avisos de lesión que conviene cazar antes de que paren el entreno.',
        ],
        en: [
          'Weight: the weekly average matters more than a single reading; ask for several fasted measurements if possible.',
          'Measurements: waist and hips every 2-4 weeks are enough to see a trend without obsessing.',
          'Adherence: an honest percentage of how much of the plan was followed, far more useful than any promise that "it went well".',
          'Sleep: hours and quality, since they drive hunger, energy and recovery.',
          'Mood and energy: to catch fatigue or an overly aggressive deficit early.',
          'Pain or discomfort: injury warnings worth catching before they stop training.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-checkins.png',
        gradient: 'gradient-bg-privacy',
        alt: 'Panel de check-ins semanales con puntuación de adherencia y último peso',
        es: 'El panel de check-ins resume la adherencia y el último peso para que decidas en segundos.',
        en: 'The check-ins panel summarises adherence and last weight so you can decide in seconds.',
      },
      {
        type: 'h',
        es: 'Cadencia y revisión rápida',
        en: 'Cadence and fast review',
      },
      {
        type: 'p',
        es: 'Semanal es la cadencia por defecto para la mayoría: suficiente para corregir el rumbo, sin saturar al cliente. Para revisarlos rápido, mira primero la tendencia de peso y la adherencia: si la adherencia es alta y el peso no se mueve en la dirección esperada, ajusta el plan; si la adherencia es baja, el problema no son las cifras, es el cumplimiento, y ahí toca conversación, no recalcular macros.',
        en: 'Weekly is the default cadence for most clients: enough to course-correct without overwhelming them. To review fast, look first at the weight trend and adherence: if adherence is high and weight isn’t moving as expected, adjust the plan; if adherence is low, the problem isn’t the numbers but the follow-through, and that calls for a conversation, not recalculating macros.',
      },
      {
        type: 'img',
        src: '/landing/feature-messages.png',
        gradient: 'gradient-bg-writing',
        alt: 'Bandeja de mensajería uno a uno con el cliente',
        es: 'Cierra cada check-in en la mensajería uno a uno con esa única acción concreta para la semana.',
        en: 'Close each check-in in the 1-on-1 messaging inbox with that single concrete action for the week.',
      },
      {
        type: 'tip',
        es: 'Responde siempre con una sola acción concreta para la semana ("sube 20 g de hidratos en la comida post-entreno"). Un check-in sin una instrucción clara deja al cliente igual que estaba.',
        en: 'Always reply with a single concrete action for the week ("add 20 g of carbs to your post-workout meal"). A check-in without a clear instruction leaves the client exactly where they were.',
      },
    ],
  },
];
