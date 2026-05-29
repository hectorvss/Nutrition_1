import type { ResourceArticle } from './types';

export const docs: ResourceArticle[] = [
  {
    id: 'getting-started',
    category: 'docs',
    readMin: 6,
    es: {
      title: 'Primeros pasos para coaches',
      subtitle: 'Configura tu cuenta, personaliza tu marca, invita a tu primer cliente y conoce el panel.',
    },
    en: {
      title: 'Getting started for coaches',
      subtitle: 'Set up your account, customize your brand, invite your first client and tour the dashboard.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Esta guía de referencia te lleva por la puesta en marcha inicial de la plataforma: desde crear tu cuenta hasta tener a tu primer cliente activo dentro de su propio espacio. Sigue los pasos en orden; cada bloque deja la cuenta lista para el siguiente.',
        en: 'This reference walks you through the initial setup of the platform: from creating your account to having your first client active inside their own space. Follow the steps in order; each block leaves your account ready for the next.',
      },
      {
        type: 'h',
        es: '1. Configura tu cuenta',
        en: '1. Set up your account',
      },
      {
        type: 'steps',
        es: [
          'Confirma tu email desde el enlace de verificación que recibes al registrarte.',
          'Completa tu perfil de coach: nombre visible, especialidad y zona horaria (se usa para programar check-ins y automatizaciones).',
          'Define el idioma por defecto de la cuenta; cada cliente puede tener el suyo propio más adelante.',
          'Activa la autenticación en dos pasos desde Ajustes → Seguridad si gestionas datos de varios clientes.',
        ],
        en: [
          'Confirm your email from the verification link you receive when you sign up.',
          'Complete your coach profile: display name, specialty and time zone (used to schedule check-ins and automations).',
          'Set the account default language; each client can have their own later on.',
          'Enable two-step authentication under Settings → Security if you manage data for several clients.',
        ],
      },
      {
        type: 'h',
        es: '2. Personaliza tu marca',
        en: '2. Customize your brand',
      },
      {
        type: 'steps',
        es: [
          'Ve a Ajustes → Marca y sube tu logotipo (PNG o SVG, fondo transparente recomendado).',
          'Elige tu color de marca: ese tono se aplica a botones, enlaces y acentos en el espacio del cliente.',
          'Previsualiza cómo verá el cliente la pantalla de bienvenida antes de guardar.',
        ],
        en: [
          'Go to Settings → Brand and upload your logo (PNG or SVG, transparent background recommended).',
          'Pick your brand colour: that tone is applied to buttons, links and accents in the client space.',
          'Preview how the client will see the welcome screen before you save.',
        ],
      },
      {
        type: 'tip',
        es: 'Usa un color con suficiente contraste sobre fondo claro y oscuro. La plataforma tiene modo oscuro, y un acento demasiado claro se vuelve ilegible sobre fondos blancos.',
        en: 'Use a colour with enough contrast on both light and dark backgrounds. The platform has dark mode, and an accent that is too light becomes unreadable on white backgrounds.',
      },
      {
        type: 'h',
        es: '3. Invita a tu primer cliente',
        en: '3. Invite your first client',
      },
      {
        type: 'steps',
        es: [
          'Desde la lista de clientes pulsa Añadir cliente e introduce nombre, email y objetivo principal.',
          'Registra los datos de partida que ya tengas: peso, altura, edad y nivel de actividad.',
          'Envía la invitación; el cliente recibe un enlace para crear su contraseña y acceder a su espacio.',
          'Comprueba en la lista que el estado pasa de "Invitado" a "Activo" cuando acepta.',
        ],
        en: [
          'From the clients list press Add client and enter name, email and main goal.',
          'Record any baseline data you already have: weight, height, age and activity level.',
          'Send the invitation; the client receives a link to create their password and access their space.',
          'Check in the list that the status changes from "Invited" to "Active" once they accept.',
        ],
      },
      {
        type: 'h',
        es: '4. Recorre el panel',
        en: '4. Tour the dashboard',
      },
      {
        type: 'img',
        src: '/landing/feature-dashboard.png',
        gradient: 'gradient-bg-planning',
        alt: 'Panel del coach con tareas pendientes, clientes activos y novedades',
        es: 'El panel reúne tus tareas pendientes, los clientes activos y las novedades en un único lugar.',
        en: 'The dashboard gathers your pending tasks, active clients and recent activity in a single place.',
      },
      {
        type: 'ul',
        es: [
          'Tareas pendientes: check-ins por revisar, planes que caducan y avisos de automatizaciones.',
          'Clientes activos: acceso rápido a cada ficha, su adherencia y su próxima cita.',
          'Novedades: lo último que ha hecho cada cliente desde tu última sesión.',
        ],
        en: [
          'Pending tasks: check-ins to review, plans about to expire and automation alerts.',
          'Active clients: quick access to each profile, their adherence and next appointment.',
          'Recent activity: the latest each client has done since your last session.',
        ],
      },
      {
        type: 'p',
        es: 'Con la cuenta configurada, la marca aplicada y un cliente activo, ya puedes empezar a construir planes y, cuando lo necesites, automatizar el seguimiento. Continúa con la guía de configuración de automatizaciones.',
        en: 'With your account set up, your brand applied and one active client, you can start building plans and, when you need it, automate follow-ups. Continue with the automations setup guide.',
      },
    ],
  },
  {
    id: 'automations-setup',
    category: 'docs',
    readMin: 7,
    es: {
      title: 'Configuración de automatizaciones',
      subtitle: 'Automatizaciones simples frente al constructor visual de flujos: disparadores, condiciones y acciones.',
    },
    en: {
      title: 'Setting up automations',
      subtitle: 'Simple automations versus the visual Workflow Builder: triggers, conditions and actions.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Las automatizaciones se ocupan del seguimiento repetitivo para que tú dediques tu tiempo al coaching real. Existen dos niveles: las automatizaciones simples (un disparador, una acción) y el constructor visual de flujos, donde encadenas disparadores, condiciones y varias acciones. Esta referencia explica cuándo usar cada uno.',
        en: 'Automations take care of the repetitive follow-up so you can spend your time on real coaching. There are two levels: simple automations (one trigger, one action) and the visual Workflow Builder, where you chain triggers, conditions and multiple actions. This reference explains when to use each.',
      },
      {
        type: 'h',
        es: 'Automatizaciones simples',
        en: 'Simple automations',
      },
      {
        type: 'p',
        es: 'Una automatización simple es una regla de un solo paso: "cuando ocurre X, haz Y". Es ideal para recordatorios y avisos que no dependen del estado del cliente. Las gestionas desde la lista de automatizaciones, donde puedes activarlas y desactivarlas con un interruptor.',
        en: 'A simple automation is a single-step rule: "when X happens, do Y". It is ideal for reminders and alerts that don’t depend on the client’s state. You manage them from the automations list, where you can turn each one on and off with a toggle.',
      },
      {
        type: 'img',
        src: '/landing/feature-automations.png',
        gradient: 'gradient-bg-learning',
        alt: 'Lista de automatizaciones: renovación de plan, check-in semanal y radar de bajas',
        es: 'La lista de automatizaciones muestra cada regla con su disparador y un interruptor para activarla.',
        en: 'The automations list shows each rule with its trigger and a toggle to enable it.',
      },
      {
        type: 'h',
        es: 'El constructor visual de flujos',
        en: 'The visual Workflow Builder',
      },
      {
        type: 'p',
        es: 'Cuando necesitas lógica ramificada (por ejemplo, avisar solo si el cliente lleva varios días inactivo y además su plan está a punto de caducar), usa el constructor visual. Arrastras bloques sobre un lienzo y los conectas: empieza por un disparador, añade las condiciones que filtran a quién aplica y termina con una o varias acciones.',
        en: 'When you need branching logic (for example, alerting only if the client has been inactive for several days and their plan is about to expire), use the visual builder. You drag blocks onto a canvas and connect them: start with a trigger, add the conditions that filter who it applies to, and end with one or more actions.',
      },
      {
        type: 'img',
        src: '/landing/feature-workflow.png',
        gradient: 'gradient-bg-planning',
        alt: 'Constructor visual de flujos con bloques de disparador, condición y acción conectados',
        es: 'En el lienzo conectas disparadores, condiciones y acciones para construir flujos a medida.',
        en: 'On the canvas you connect triggers, conditions and actions to build custom workflows.',
      },
      {
        type: 'h',
        es: 'Disparadores',
        en: 'Triggers',
      },
      {
        type: 'ul',
        es: [
          'Caducidad de plan: el plan o la suscripción del cliente está a punto de expirar (puedes elegir con cuántos días de antelación).',
          'Check-in semanal: llega la fecha del check-in programado del cliente.',
          'Inactividad: el cliente no ha registrado actividad ni entrado a su espacio durante X días.',
          'Riesgo de baja: el radar de bajas detecta una caída de adherencia o de actividad que suele preceder a un abandono.',
        ],
        en: [
          'Plan expiry: the client’s plan or subscription is about to expire (you choose how many days in advance).',
          'Weekly check-in: the date of the client’s scheduled check-in arrives.',
          'Inactivity: the client hasn’t logged activity or entered their space for X days.',
          'Churn risk: the churn radar detects a drop in adherence or activity that usually precedes a drop-off.',
        ],
      },
      {
        type: 'h',
        es: 'Condiciones',
        en: 'Conditions',
      },
      {
        type: 'ul',
        es: [
          'Filtran qué clientes pasan el flujo: por objetivo, por etiqueta, por nivel de adherencia o por estado del plan.',
          'Se combinan con Y / O para crear reglas tan precisas como necesites.',
          'Si no añades condiciones, el flujo se aplica a todos los clientes que cumplen el disparador.',
        ],
        en: [
          'They filter which clients flow through: by goal, by tag, by adherence level or by plan status.',
          'They combine with AND / OR to create rules as precise as you need.',
          'If you add no conditions, the workflow applies to every client that meets the trigger.',
        ],
      },
      {
        type: 'h',
        es: 'Acciones',
        en: 'Actions',
      },
      {
        type: 'ul',
        es: [
          'Mensaje: envía al cliente un mensaje (puedes usar plantillas con su nombre y datos).',
          'Tarea: crea una tarea para ti en el panel, por ejemplo "revisar el check-in de Marta".',
          'Alerta: te notifica a ti como coach sin tocar al cliente, útil para el radar de bajas.',
        ],
        en: [
          'Message: sends the client a message (you can use templates with their name and data).',
          'Task: creates a task for you on the dashboard, for example "review Marta’s check-in".',
          'Alert: notifies you as the coach without touching the client, useful for the churn radar.',
        ],
      },
      {
        type: 'h',
        es: 'Crear tu primer flujo',
        en: 'Build your first workflow',
      },
      {
        type: 'steps',
        es: [
          'Abre el constructor visual y arrastra el disparador "Inactividad" al lienzo; ajústalo a 7 días.',
          'Conecta una condición que limite el flujo a clientes con el plan activo.',
          'Añade una acción de Mensaje con una plantilla amable de "¿todo bien?" y, en paralelo, una acción de Alerta para ti.',
          'Guarda el flujo y actívalo desde la lista de automatizaciones; pruébalo con un cliente de ejemplo antes de aplicarlo a todos.',
        ],
        en: [
          'Open the visual builder and drag the "Inactivity" trigger onto the canvas; set it to 7 days.',
          'Connect a condition that limits the flow to clients with an active plan.',
          'Add a Message action with a friendly "everything ok?" template and, in parallel, an Alert action for you.',
          'Save the workflow and enable it from the automations list; test it with a sample client before rolling it out to everyone.',
        ],
      },
      {
        type: 'tip',
        es: 'Empieza por automatizaciones simples y pásate al constructor visual solo cuando notes que repites la misma decisión manual. Un flujo demasiado complejo es difícil de depurar; varias reglas claras suelen mantenerse mejor.',
        en: 'Start with simple automations and move to the visual builder only when you notice you keep making the same manual decision. An over-complex workflow is hard to debug; several clear rules are usually easier to maintain.',
      },
    ],
  },
  {
    id: 'api-exports',
    category: 'docs',
    readMin: 5,
    es: {
      title: 'API y exportaciones de datos',
      subtitle: 'Cómo exportar tus datos, gestionar solicitudes RGPD y qué esperar de la futura API.',
    },
    en: {
      title: 'API and data exports',
      subtitle: 'How to export your data, handle GDPR requests and what to expect from the future API.',
    },
    blocks: [
      {
        type: 'p',
        es: 'Tus datos son tuyos. Esta referencia explica cómo exportar la información de tus clientes y check-ins, cómo atender una solicitud de datos bajo el RGPD y qué tienes previsto encontrar en la API cuando esté disponible.',
        en: 'Your data is yours. This reference explains how to export your clients and check-ins, how to handle a GDPR data request, and what to expect from the API when it becomes available.',
      },
      {
        type: 'h',
        es: 'Exportar clientes y check-ins (CSV)',
        en: 'Export clients and check-ins (CSV)',
      },
      {
        type: 'steps',
        es: [
          'Ve a Ajustes → Datos y exportaciones.',
          'Elige qué exportar: lista de clientes, historial de check-ins o ambos.',
          'Selecciona el rango de fechas y pulsa Exportar; recibirás un archivo CSV con codificación UTF-8.',
          'Abre el CSV en tu hoja de cálculo o impórtalo en otra herramienta; las columnas incluyen identificador, fecha y métricas.',
        ],
        en: [
          'Go to Settings → Data and exports.',
          'Choose what to export: clients list, check-in history or both.',
          'Select the date range and press Export; you’ll receive a CSV file encoded in UTF-8.',
          'Open the CSV in your spreadsheet or import it into another tool; columns include identifier, date and metrics.',
        ],
      },
      {
        type: 'tip',
        es: 'La exportación es completa y portable: si algún día dejas de usar la plataforma, te llevas tus datos contigo. No hay bloqueo de proveedor sobre la información de tus clientes.',
        en: 'The export is complete and portable: if you ever stop using the platform, you take your data with you. There is no vendor lock-in over your clients’ information.',
      },
      {
        type: 'h',
        es: 'Solicitudes de datos RGPD',
        en: 'GDPR data requests',
      },
      {
        type: 'ul',
        es: [
          'Acceso: un cliente puede pedirte una copia de sus datos; usa la exportación filtrada por ese cliente para entregársela.',
          'Rectificación: corrige cualquier dato inexacto directamente desde su ficha.',
          'Supresión: al eliminar un cliente, sus datos personales se borran de forma transaccional; conserva antes una copia si la necesitas para tu contabilidad.',
          'Plazo: atiende las solicitudes en un máximo de 30 días, como exige el RGPD.',
        ],
        en: [
          'Access: a client can ask you for a copy of their data; use the export filtered by that client to provide it.',
          'Rectification: correct any inaccurate data directly from their profile.',
          'Erasure: when you delete a client, their personal data is removed transactionally; keep a copy beforehand if you need it for your records.',
          'Deadline: handle requests within a maximum of 30 days, as the GDPR requires.',
        ],
      },
      {
        type: 'h',
        es: 'API (próximamente)',
        en: 'API (coming soon)',
      },
      {
        type: 'p',
        es: 'Estamos trabajando en una API REST que te permitirá leer tus clientes y check-ins de forma programática para integrarlos con tus propias herramientas. Los ejemplos siguientes son ilustrativos y muestran la forma prevista de las peticiones y respuestas; los endpoints definitivos se publicarán cuando la API esté disponible.',
        en: 'We are working on a REST API that will let you read your clients and check-ins programmatically to integrate them with your own tools. The following examples are illustrative and show the planned shape of requests and responses; the final endpoints will be published when the API is available.',
      },
      {
        type: 'code',
        lang: 'bash',
        content: '# Ilustrativo / illustrative - aún no disponible / not live yet\ncurl https://api.example.com/v1/clients \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Accept: application/json"',
      },
      {
        type: 'code',
        lang: 'json',
        content: '{\n  "data": [\n    {\n      "id": "cl_8f2a",\n      "name": "Marta Ruiz",\n      "goal": "fat_loss",\n      "status": "active",\n      "last_check_in": "2026-05-25"\n    }\n  ],\n  "has_more": false\n}',
      },
      {
        type: 'p',
        es: 'Mientras la API llega, la exportación CSV cubre la mayoría de necesidades de integración y copia de seguridad. Suscríbete al changelog para enterarte en cuanto se publiquen los primeros endpoints y la documentación de autenticación.',
        en: 'Until the API arrives, the CSV export covers most integration and backup needs. Subscribe to the changelog to be notified as soon as the first endpoints and authentication docs are published.',
      },
    ],
  },
];
