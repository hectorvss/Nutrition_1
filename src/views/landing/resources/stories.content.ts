import type { ResourceArticle } from './types';

export const stories: ResourceArticle[] = [
  {
    id: 'whatsapp-to-system',
    category: 'stories',
    readMin: 5,
    es: {
      title: 'De WhatsApp a sistema profesional en 3 semanas',
      subtitle:
        'Cómo una coach que llevaba todo por chats y hojas de Excel pasó a una operación ordenada sin perder el trato cercano.',
    },
    en: {
      title: 'From WhatsApp to a professional system in 3 weeks',
      subtitle:
        'How a coach who ran everything through chats and Excel sheets moved to a tidy operation without losing the personal touch.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Marta entrenaba a unos veinte clientes y todo vivía en su teléfono. Los planes salían de plantillas de Word, los pagos los apuntaba en una hoja de Excel y el seguimiento ocurría a base de audios de WhatsApp a cualquier hora. Funcionaba, hasta que dejó de funcionar: cada semana perdía un par de horas solo en recordar quién había pagado y a quién le tocaba revisión.',
        en: 'Marta was training around twenty clients and everything lived on her phone. Plans came out of Word templates, payments went into an Excel sheet, and follow-ups happened through WhatsApp voice notes at all hours. It worked, until it did not: every week she lost a couple of hours just remembering who had paid and who was due for a check-in.',
      },
      {
        type: 'h',
        es: 'El problema',
        en: 'The problem',
      },
      {
        type: 'ul',
        es: [
          'La información estaba repartida entre el chat, el correo y dos hojas de cálculo distintas.',
          'Cada cliente nuevo significaba copiar y pegar el mismo mensaje de bienvenida a mano.',
          'No tenía una foto clara de cuántos clientes activos tenía ni de cuánto facturaba al mes.',
        ],
        en: [
          'Information was split between chat, email and two different spreadsheets.',
          'Every new client meant copying and pasting the same welcome message by hand.',
          'She had no clear picture of how many active clients she had or how much she billed each month.',
        ],
      },
      {
        type: 'h',
        es: 'Qué cambió',
        en: 'What changed',
      },
      {
        type: 'p',
        es: 'Marta dedicó tres tardes a montar un panel central donde cada cliente tiene su ficha, su plan y su historial de pagos en un mismo sitio. Lo primero que notó no fue una métrica, sino una sensación: abrir una sola pantalla por la mañana y saber exactamente qué hacer ese día.',
        en: 'Marta spent three afternoons setting up a central dashboard where each client has their profile, plan and payment history in one place. The first thing she noticed was not a metric but a feeling: opening a single screen in the morning and knowing exactly what to do that day.',
      },
      {
        type: 'img',
        src: '/landing/feature-dashboard.png',
        gradient: 'gradient-bg-planning',
        alt: 'Panel del coach con la lista de clientes, planes y estado de pagos',
        es: 'El panel reúne clientes, planes y pagos en una sola vista.',
        en: 'The dashboard brings clients, plans and payments into a single view.',
      },
      {
        type: 'h',
        es: 'El resultado',
        en: 'The result',
      },
      {
        type: 'p',
        es: 'No desapareció el WhatsApp, pero dejó de ser su sistema de gestión para volver a ser solo un canal de conversación. Las revisiones quedaron programadas, los recordatorios salían solos y, sobre todo, Marta recuperó la cabeza para lo que de verdad importa: el entrenamiento.',
        en: 'WhatsApp did not disappear, but it stopped being her management system and went back to being just a conversation channel. Check-ins were scheduled, reminders went out on their own and, above all, Marta got her head back for what really matters: the coaching.',
      },
      {
        type: 'quote',
        es: 'En tres semanas pasé de sentir que perseguía a mis clientes a sentir que por fin tenía un negocio. Sigo cercana con ellos, pero ahora el caos lo lleva el sistema, no yo.',
        en: 'In three weeks I went from feeling like I was chasing my clients to feeling like I finally had a business. I am still close to them, but now the system handles the chaos, not me.',
        authorEs: 'Marta Aguilar · Madrid',
        authorEn: 'Marta Aguilar · Madrid',
      },
      {
        type: 'tip',
        es: 'No intentes migrarlo todo en un día. Marta empezó solo por los clientes activos y dejó el archivo histórico para una tarde tranquila más adelante.',
        en: 'Do not try to migrate everything in one day. Marta started with active clients only and left the historical archive for a quiet afternoon later on.',
      },
    ],
  },
  {
    id: 'team-standard',
    category: 'stories',
    readMin: 5,
    es: {
      title: 'Cómo un estudio de coaching estandariza su calidad',
      subtitle:
        'Plantillas reutilizables y automatizaciones para que cada cliente reciba la misma experiencia, lo atienda quien lo atienda.',
    },
    en: {
      title: 'How a coaching studio standardises quality',
      subtitle:
        'Reusable templates and automations so every client gets the same experience, no matter who looks after them.',
    },
    blocks: [
      {
        type: 'p',
        es: 'El estudio de Javier creció de dos a cinco entrenadores en un año. La buena noticia era el crecimiento; la mala, que cada entrenador hacía el onboarding a su manera. Un cliente recibía un mensaje de bienvenida muy cuidado y otro casi nada, según quién lo cogiera. La marca empezaba a sentirse desigual.',
        en: 'Javier’s studio grew from two to five trainers in a year. The good news was the growth; the bad news was that every trainer onboarded clients their own way. One client received a polished welcome, another almost nothing, depending on who picked them up. The brand was starting to feel uneven.',
      },
      {
        type: 'h',
        es: 'El problema',
        en: 'The problem',
      },
      {
        type: 'p',
        es: 'Cuando la calidad depende de la memoria y el buen día de cada persona, tarde o temprano algo se cae. Javier no quería convertir a su equipo en robots, pero sí asegurar que ningún cliente se quedara sin los pasos básicos: bienvenida, primera revisión, encuesta de satisfacción.',
        en: 'When quality depends on each person’s memory and good mood, sooner or later something slips. Javier did not want to turn his team into robots, but he did want to make sure no client missed the basic steps: welcome, first check-in, satisfaction survey.',
      },
      {
        type: 'h',
        es: 'Qué cambió',
        en: 'What changed',
      },
      {
        type: 'steps',
        es: [
          'Definieron un flujo de bienvenida único y lo guardaron como plantilla reutilizable para todo el equipo.',
          'Añadieron ramas en el flujo: si el cliente no responde en 48 horas, el entrenador recibe un aviso.',
          'Programaron la primera revisión y la encuesta para que se disparen solas según la fecha de alta.',
        ],
        en: [
          'They defined a single welcome flow and saved it as a reusable template for the whole team.',
          'They added branches to the flow: if a client does not reply within 48 hours, the trainer gets a nudge.',
          'They scheduled the first check-in and the survey to fire automatically based on the join date.',
        ],
      },
      {
        type: 'img',
        src: '/landing/feature-workflow.png',
        gradient: 'gradient-bg-writing',
        alt: 'Constructor visual de flujos con ramas condicionales de automatización',
        es: 'El constructor visual permite ramificar el flujo según lo que haga el cliente.',
        en: 'The visual builder lets the flow branch depending on what the client does.',
      },
      {
        type: 'h',
        es: 'El resultado',
        en: 'The result',
      },
      {
        type: 'p',
        es: 'Hoy un cliente nuevo recibe la misma experiencia ordenada lo atienda Javier o cualquier entrenador del equipo. Las automatizaciones cubren el suelo mínimo de calidad y dejan a cada entrenador el espacio para poner su toque personal donde de verdad aporta.',
        en: 'Today a new client gets the same tidy experience whether Javier or any trainer on the team looks after them. Automations cover the minimum quality floor and leave each trainer the room to add their personal touch where it really counts.',
      },
      {
        type: 'quote',
        es: 'Lo que más me gusta es que el flujo no le quita personalidad a nadie. Garantiza lo básico y libera al entrenador para lo humano, que es donde marcamos la diferencia.',
        en: 'What I like most is that the flow does not strip anyone’s personality. It guarantees the basics and frees the trainer for the human side, which is where we make the difference.',
        authorEs: 'Javier Sanz · Online',
        authorEn: 'Javier Sanz · Online',
      },
    ],
  },
  {
    id: 'double-revenue',
    category: 'stories',
    readMin: 6,
    es: {
      title: 'Doblar facturación sin doblar horas',
      subtitle:
        'Recuperar el tiempo perdido en tareas administrativas para abrir hueco a más clientes y a una tarifa más justa.',
    },
    en: {
      title: 'Doubling revenue without doubling hours',
      subtitle:
        'Recovering time lost to admin work to make room for more clients and a fairer rate.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Lucía tenía la agenda llena y, aun así, la cuenta no le salía. El problema no era la falta de clientes: era que cada cliente le costaba demasiado tiempo de gestión. Entre cobros manuales, recordatorios y planes hechos desde cero, se le iban tardes enteras que no cobraba a nadie.',
        en: 'Lucía’s calendar was full and yet the numbers still did not add up. The problem was not a lack of clients: it was that each client cost her too much management time. Between manual payments, reminders and plans built from scratch, whole afternoons slipped away that she billed to no one.',
      },
      {
        type: 'h',
        es: 'El problema',
        en: 'The problem',
      },
      {
        type: 'ul',
        es: [
          'Perseguía los pagos uno a uno y a veces se le olvidaba algún cobro mensual.',
          'Rehacía planes parecidos una y otra vez en lugar de partir de una base.',
          'Su tarifa llevaba años igual porque no se atrevía a subirla con la operación tan justa de tiempo.',
        ],
        en: [
          'She chased payments one by one and sometimes forgot a monthly charge.',
          'She rebuilt similar plans over and over instead of starting from a base.',
          'Her rate had been the same for years because she did not dare raise it with such a tight time setup.',
        ],
      },
      {
        type: 'h',
        es: 'Qué cambió',
        en: 'What changed',
      },
      {
        type: 'p',
        es: 'Lucía activó la facturación recurrente para que los cobros mensuales salieran solos y dejó de perseguir transferencias. Después empezó a mirar de verdad sus números: retención, ingresos recurrentes y bajas, todo en una misma pantalla. Por primera vez podía ver qué meses crecía y por qué se iban algunos clientes.',
        en: 'Lucía turned on recurring billing so monthly charges went out by themselves and she stopped chasing transfers. Then she started genuinely looking at her numbers: retention, recurring revenue and churn, all on one screen. For the first time she could see which months she grew and why some clients left.',
      },
      {
        type: 'img',
        src: '/landing/feature-progress.png',
        gradient: 'gradient-bg-learning',
        alt: 'Panel de analítica con retención, ingresos recurrentes y bajas',
        es: 'La analítica muestra retención, ingresos recurrentes y bajas de un vistazo.',
        en: 'The analytics show retention, recurring revenue and churn at a glance.',
      },
      {
        type: 'h',
        es: 'El resultado',
        en: 'The result',
      },
      {
        type: 'p',
        es: 'Con las tardes administrativas de vuelta en su calendario, Lucía pudo aceptar más clientes sin alargar su jornada y, con los números delante, por fin se animó a ajustar su tarifa. Su sensación es que hoy gana bastante más trabajando las mismas horas, simplemente porque el tiempo va a entrenar y no a la administración.',
        en: 'With her admin afternoons back in her calendar, Lucía could take on more clients without stretching her day and, with the numbers in front of her, she finally felt confident raising her rate. Her sense is that she now earns considerably more working the same hours, simply because the time goes into coaching instead of admin.',
      },
      {
        type: 'quote',
        es: 'No trabajo más horas que antes; trabajo las mismas, pero ahora se traducen en ingresos en lugar de en papeleo. Doblar la facturación vino de recuperar el tiempo, no de quemarme más.',
        en: 'I do not work more hours than before; I work the same, but now they turn into income instead of paperwork. Doubling revenue came from recovering time, not from burning out more.',
        authorEs: 'Lucía Romero · Valencia',
        authorEn: 'Lucía Romero · Valencia',
      },
      {
        type: 'tip',
        es: 'Antes de subir tu tarifa, mira tu retención. Lucía esperó a ver dos meses estables en el panel para tener la conversación con confianza.',
        en: 'Before raising your rate, look at your retention. Lucía waited to see two stable months on the dashboard so she could have the conversation with confidence.',
      },
    ],
  },
];
