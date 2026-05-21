// Pre-built automation templates — one per trigger in automation-triggers.ts.
//
// Each trigger in the catalog is presented to the coach as a ready-to-use
// "template": picking it pre-fills the whole flow (message, follow-up steps,
// escalation, stop conditions and delivery timing) so the coach only has to
// review and tweak. Without this, picking a trigger gave a blank form.
//
// The shape mirrors what the frontend builder and POST /automations expect:
//   - steps:          AutomationStep[] — the first step is always a `message`.
//   - stopConditions: { type, operator, value }[] — sensible defaults so the
//                     flow doesn't spam (e.g. stop once the client replies).
//   - deliveryRules:  frequency + preferred time.
//
// Messages use the {Variable} tokens the message editor knows about
// (see VARIABLES in AutomationCreateMessage / the message renderer).

import type { AutomationStep } from './automation-types.js';

export interface FlowTemplateCondition {
  type: string;
  operator: string;
  value: string;
}

export interface FlowTemplate {
  triggerId: string;
  /** Short human label shown on the template card. */
  title: string;
  /** One-liner describing what the ready flow does. */
  summary: string;
  steps: AutomationStep[];
  stopConditions: FlowTemplateCondition[];
  deliveryRules: {
    frequency: 'Once' | 'Every';
    frequencyValue: number;
    frequencyUnit: 'Days' | 'Weeks' | 'Months';
    deliveryTime: 'Morning' | 'Afternoon' | 'Evening' | 'Custom';
  };
}

// Delivery presets — most one-shot reactions go out in the morning.
const ONCE_MORNING = { frequency: 'Once' as const, frequencyValue: 1, frequencyUnit: 'Days' as const, deliveryTime: 'Morning' as const };
const ONCE_AFTERNOON = { frequency: 'Once' as const, frequencyValue: 1, frequencyUnit: 'Days' as const, deliveryTime: 'Afternoon' as const };

const msg = (message: string): AutomationStep => ({ kind: 'message', message });
const wait = (amount: number, unit: 'hours' | 'days'): AutomationStep => ({ kind: 'wait', amount, unit, cancelIfReplied: true });
const task = (title: string, priority: 'low' | 'medium' | 'high' = 'medium'): AutomationStep => ({ kind: 'create_task', title, type: 'Admin', priority });

// Common stop conditions.
const STOP_ON_REPLY: FlowTemplateCondition = { type: 'reply', operator: 'within', value: '48' };
const STOP_ON_CHECKIN: FlowTemplateCondition = { type: 'checkin', operator: 'within', value: '7' };
const STOP_ANTISPAM: FlowTemplateCondition = { type: 'last_message_recent', operator: 'within', value: '6' };

export const FLOW_TEMPLATES: Record<string, FlowTemplate> = {
  // ─── Lifecycle ──────────────────────────────────────────────────────────
  'new-client': {
    triggerId: 'new-client', title: 'Bienvenida al nuevo cliente',
    summary: 'Saluda al cliente al entrar, espera un día y comprueba que ha podido empezar.',
    steps: [
      msg('¡Hola {First Name}! Soy {Coach Name}, encantado de empezar este camino contigo 💪 Tómate unos minutos para completar tu perfil y cuéntame cualquier duda por aquí.'),
      wait(1, 'days'),
      msg('{First Name}, ¿has podido echar un vistazo a la app? Si te ha surgido cualquier duda al configurarla, escríbeme y lo vemos.'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },
  'onboarding-completed': {
    triggerId: 'onboarding-completed', title: 'Onboarding completado',
    summary: 'Confirma al cliente que su onboarding está listo y qué pasa a continuación.',
    steps: [
      msg('¡Genial, {First Name}! He recibido todo tu onboarding ✅ Voy a preparar tu plan personalizado y te aviso en cuanto esté listo.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'onboarding-stalled': {
    triggerId: 'onboarding-stalled', title: 'Onboarding sin terminar',
    summary: 'Recuerda amablemente al cliente que termine el onboarding y te crea una tarea si no lo hace.',
    steps: [
      msg('Hola {First Name}, vi que empezaste tu onboarding pero quedó a medias. Es rápido y me ayuda a ajustar tu plan a ti — ¿lo terminamos hoy?'),
      wait(2, 'days'),
      task('Llamar a {Client Name}: onboarding sin terminar', 'high'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },
  'first-checkin': {
    triggerId: 'first-checkin', title: 'Primer check-in enviado',
    summary: 'Felicita al cliente por enviar su primer check-in.',
    steps: [
      msg('¡Tu primer check-in, {First Name}! 🎉 Esto es justo lo que necesito para acompañarte bien. Lo reviso y te doy feedback en breve.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'anniversary': {
    triggerId: 'anniversary', title: 'Aniversario del cliente',
    summary: 'Celebra el tiempo que el cliente lleva contigo.',
    steps: [
      msg('{First Name}, ¡hoy hace un tiempo especial que empezamos juntos! 🥳 Gracias por la constancia. Sigamos sumando progreso.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'subscription-renewal-soon': {
    triggerId: 'subscription-renewal-soon', title: 'Renovación próxima',
    summary: 'Avisa al cliente de que su plan está por renovar.',
    steps: [
      msg('Hola {First Name}, tu plan conmigo renueva en {Days Until Expiry} días. Si quieres comentar objetivos o cualquier ajuste antes, aquí estoy.'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },

  // ─── Check-ins ──────────────────────────────────────────────────────────
  'weekly-checkin': {
    triggerId: 'weekly-checkin', title: 'Recordatorio de check-in semanal',
    summary: 'Recuerda cada semana al cliente que toca su check-in.',
    steps: [
      msg('¡Hola {First Name}! Toca tu check-in semanal 📋 Cuéntame cómo ha ido la semana: peso, energía, adherencia y cualquier cosa que quieras comentar.'),
    ],
    stopConditions: [STOP_ON_CHECKIN],
    deliveryRules: { frequency: 'Every', frequencyValue: 1, frequencyUnit: 'Weeks', deliveryTime: 'Morning' },
  },
  'checkin-overdue': {
    triggerId: 'checkin-overdue', title: 'Check-in atrasado',
    summary: 'Recuerda el check-in pendiente, espera y te crea una tarea si sigue sin enviarlo.',
    steps: [
      msg('{First Name}, no me ha llegado tu check-in de esta semana. Cuando tengas 5 minutos, mándamelo y seguimos afinando 💪'),
      wait(2, 'days'),
      task('Contactar a {Client Name}: check-in atrasado', 'high'),
    ],
    stopConditions: [STOP_ON_CHECKIN, STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },
  'checkin-submitted': {
    triggerId: 'checkin-submitted', title: 'Check-in recibido',
    summary: 'Confirma al cliente que has recibido su check-in.',
    steps: [
      msg('¡Recibido, {First Name}! Gracias por tu check-in 🙌 Lo reviso con calma y te doy feedback enseguida.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'checkin-pending-review': {
    triggerId: 'checkin-pending-review', title: 'Check-in sin revisar',
    summary: 'Te crea una tarea para que no se quede ningún check-in sin feedback.',
    steps: [
      task('Revisar el check-in pendiente de {Client Name}', 'high'),
    ],
    stopConditions: [],
    deliveryRules: ONCE_MORNING,
  },
  'consecutive-checkins-missed': {
    triggerId: 'consecutive-checkins-missed', title: 'Varios check-ins perdidos',
    summary: 'Mensaje de preocupación + escalada al coach cuando el cliente falla varios check-ins.',
    steps: [
      msg('{First Name}, he notado que llevas varias semanas sin check-in. ¿Va todo bien? Si algo te está costando, dímelo y lo ajustamos juntos.'),
      wait(2, 'days'),
      task('Llamar a {Client Name}: varios check-ins seguidos perdidos', 'high'),
    ],
    stopConditions: [STOP_ON_CHECKIN, STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },

  // ─── Messaging ──────────────────────────────────────────────────────────
  'client-reply': {
    triggerId: 'client-reply', title: 'Acuse de recibo automático',
    summary: 'Responde al instante para que el cliente sepa que su mensaje llegó.',
    steps: [
      msg('¡Gracias por escribir, {First Name}! He recibido tu mensaje y te respondo en cuanto pueda 🙂'),
    ],
    stopConditions: [{ type: 'coach_replied', operator: 'within', value: '24' }, STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'client-message-stale': {
    triggerId: 'client-message-stale', title: 'Mensaje del cliente sin responder',
    summary: 'Te crea una tarea para que ningún mensaje del cliente se quede sin contestar.',
    steps: [
      task('Responder el mensaje pendiente de {Client Name}', 'high'),
    ],
    stopConditions: [{ type: 'coach_replied', operator: 'within', value: '24' }],
    deliveryRules: ONCE_MORNING,
  },

  // ─── Metrics ────────────────────────────────────────────────────────────
  'weight-dropped': {
    triggerId: 'weight-dropped', title: 'Bajada brusca de peso',
    summary: 'Comprueba con el cliente que la bajada de peso es saludable.',
    steps: [
      msg('{First Name}, he visto un descenso de peso notable esta semana ({Current Weight}). ¿Cómo te sientes de energía y hambre? Quiero asegurarme de que vamos a buen ritmo.'),
      wait(1, 'days'),
      task('Revisar bajada de peso de {Client Name}', 'medium'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },
  'weight-gained': {
    triggerId: 'weight-gained', title: 'Subida brusca de peso',
    summary: 'Mensaje de apoyo y sin juicio cuando el peso sube de golpe.',
    steps: [
      msg('Hola {First Name}, el peso fluctúa y una semana no define nada 🙂 Cuéntame cómo ha ido (sueño, estrés, comidas fuera) y lo ajustamos sin dramas.'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },
  'weight-goal-reached': {
    triggerId: 'weight-goal-reached', title: 'Meta de peso alcanzada',
    summary: 'Celebra que el cliente llegó a su objetivo de peso.',
    steps: [
      msg('¡{First Name}, lo conseguiste! 🎯 Has llegado a tu meta de {Goal Weight}. Estoy muy orgulloso de tu trabajo. Hablemos de cómo mantener y qué viene ahora.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'weight-plateau': {
    triggerId: 'weight-plateau', title: 'Estancamiento de peso',
    summary: 'Motiva al cliente y te crea una tarea para revisar el plan.',
    steps: [
      msg('{First Name}, llevamos unas semanas en una meseta. Es totalmente normal — el cuerpo se adapta. Voy a revisar tu plan para darle un empujón 💪'),
      task('Revisar y ajustar el plan de {Client Name} (meseta)', 'medium'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },

  // ─── Training / Adherence ───────────────────────────────────────────────
  'adherence-high': {
    triggerId: 'adherence-high', title: 'Adherencia alta',
    summary: 'Reconoce al cliente cuando su adherencia es excelente.',
    steps: [
      msg('¡{First Name}, semana de 10! 🌟 Tu adherencia ha sido del {Adherence Rate}. Así se construyen los resultados — sigue exactamente así.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'adherence-low': {
    triggerId: 'adherence-low', title: 'Adherencia baja',
    summary: 'Mensaje de apoyo + escalada cuando la adherencia cae.',
    steps: [
      msg('Hola {First Name}, esta semana la adherencia ha bajado ({Adherence Rate}). No pasa nada — cuéntame qué te está costando y lo hacemos más fácil.'),
      wait(2, 'days'),
      task('Llamar a {Client Name}: adherencia baja', 'high'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },
  'workout-streak-broken': {
    triggerId: 'workout-streak-broken', title: 'Racha de entrenos rota',
    summary: 'Re-engancha al cliente que lleva días sin entrenar.',
    steps: [
      msg('{First Name}, hace unos días que no registras entreno. Lo importante es volver, no la perfección — ¿qué tal una sesión corta hoy para retomar el ritmo?'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },
  'workout-streak-milestone': {
    triggerId: 'workout-streak-milestone', title: 'Hito de entrenos',
    summary: 'Celebra un hito de entrenos registrados.',
    steps: [
      msg('¡{First Name}, qué máquina! 🏆 Acabas de alcanzar un hito de entrenos. La constancia es tu superpoder — a por el siguiente.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },

  // ─── Schedule / Time ────────────────────────────────────────────────────
  'birthday': {
    triggerId: 'birthday', title: 'Cumpleaños del cliente',
    summary: 'Felicita al cliente en su cumpleaños.',
    steps: [
      msg('¡Feliz cumpleaños, {First Name}! 🎂 Disfruta tu día sin culpas. Mañana seguimos con todo. Un abrazo, {Coach Name}.'),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
  'inactivity': {
    triggerId: 'inactivity', title: 'Inactividad en la app',
    summary: 'Re-engancha al cliente inactivo, espera y escala si sigue sin volver.',
    steps: [
      msg('Hola {First Name}, hace {Days Inactive} días que no te veo por la app. ¿Todo bien? Aquí sigo para lo que necesites — escríbeme y retomamos.'),
      wait(3, 'days'),
      task('Contactar a {Client Name}: inactividad prolongada', 'high'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_AFTERNOON,
  },
  'plan-update-due': {
    triggerId: 'plan-update-due', title: 'Plan vencido',
    summary: 'Te crea una tarea para actualizar el plan del cliente.',
    steps: [
      task('Actualizar el plan de {Client Name} (lleva semanas sin renovar)', 'medium'),
    ],
    stopConditions: [],
    deliveryRules: ONCE_MORNING,
  },
  'no-appointment': {
    triggerId: 'no-appointment', title: 'Sin cita futura',
    summary: 'Invita al cliente a reservar su próxima sesión.',
    steps: [
      msg('{First Name}, no veo ninguna sesión nuestra en agenda. ¿Buscamos un hueco esta semana para revisar tu progreso?'),
    ],
    stopConditions: [STOP_ON_REPLY],
    deliveryRules: ONCE_MORNING,
  },

  // ─── Custom ─────────────────────────────────────────────────────────────
  'custom': {
    triggerId: 'custom', title: 'Automatización manual',
    summary: 'Un flujo en blanco que disparas tú manualmente cuando quieras.',
    steps: [
      msg('Hola {First Name}, '),
    ],
    stopConditions: [STOP_ANTISPAM],
    deliveryRules: ONCE_MORNING,
  },
};

export function templateForTrigger(triggerId: string): FlowTemplate | null {
  return FLOW_TEMPLATES[triggerId] || null;
}
