export interface AutomationSeed {
  manager_id: string;
  name: string;
  description: string;
  trigger_id: string;
  message: string;
  delivery_rules: Record<string, any>;
  icon_info: Record<string, any>;
  enabled: boolean;
}

function baseDefaults(managerId: string): AutomationSeed[] {
  return [
    {
      manager_id: managerId,
      name: 'Weekly Check-in Reminder',
      description: 'Automatically nudge clients to complete their check-in form every week.',
      trigger_id: 'weekly-checkin',
      message: "Hi {First Name}, it's check-in day! 📝 Please take a few minutes to update your progress in the app. Consistency is the key to our success!",
      delivery_rules: { frequency: 'Every', frequencyValue: 7, frequencyUnit: 'Days', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'Repeat', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'Overdue Check-in',
      description: 'Follow up when a client misses their scheduled check-in deadline.',
      trigger_id: 'checkin-overdue',
      message: "Hi {First Name}, I noticed your check-in is a bit late. Is everything okay? Let me know if you need help with anything or if you've had a busy week! 🙏",
      delivery_rules: { frequency: 'Every', frequencyValue: 1, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'ClipboardCheck', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'No Activity Alert',
      description: "Re-engage clients who haven't logged any activity for 3 consecutive days.",
      trigger_id: 'inactivity',
      message: "Hey {First Name}, I haven't seen any activity in the app for a few days. Just wanted to check in and see if you're staying on track! Let me know if you need a boost. ⚡",
      delivery_rules: { frequency: 'Every', frequencyValue: 3, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'AlertTriangle', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'New Client Added',
      description: 'Trigger immediately when you add a new client to send a welcome message.',
      trigger_id: 'new-client',
      message: "Welcome to the team, {First Name}! 🚀 I'm thrilled to have you here. I've just set up your profile — take a look around and let me know if you have any questions!",
      delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'UserPlus', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'App Setup Reminder',
      description: "Nudge clients who haven't completed their initial app profile setup.",
      trigger_id: 'app-setup',
      message: "Hi {First Name}, just a quick reminder to finish setting up your profile and app preferences so we can hit the ground running! 📱",
      delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'Smartphone', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'Weekly Adherence High',
      description: 'Congratulate clients who achieved >90% habit adherence this week.',
      trigger_id: 'adherence-high',
      message: "Amazing work this week, {First Name}! 🌟 Your adherence rate was {Adherence Rate}. You're absolutely crushing it. Keep that momentum going!",
      delivery_rules: { frequency: 'Every', frequencyValue: 7, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'TrendingUp', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
      enabled: true,
    },
    {
      manager_id: managerId,
      name: 'Client Birthday',
      description: "Send a personalized greeting on your client's special day.",
      trigger_id: 'birthday',
      message: "Happy Birthday, {First Name}! 🎂 Wishing you an incredible day filled with joy (and maybe a little treat). Enjoy your special day! — {Coach Name}",
      delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'Cake', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
      enabled: true,
    },
  ];
}

function localizeSpanish(seed: AutomationSeed): AutomationSeed {
  switch (seed.trigger_id) {
    case 'weekly-checkin':
      return {
        ...seed,
        name: 'Recordatorio semanal de check-in',
        description: 'Recuerda a tus clientes que completen su check-in cada semana.',
        message: '¡Hola {First Name}! ¡Toca tu check-in semanal! 📝 Cuéntame cómo ha ido tu progreso en la app. La constancia es la clave del éxito.',
      };
    case 'checkin-overdue':
      return {
        ...seed,
        name: 'Check-in atrasado',
        description: 'Haz seguimiento cuando un cliente no entrega su check-in a tiempo.',
        message: 'Hola {First Name}, he visto que tu check-in va un poco tarde. ¿Todo bien? Si necesitas ayuda con algo o has tenido una semana complicada, cuéntamelo.',
      };
    case 'inactivity':
      return {
        ...seed,
        name: 'Alerta de inactividad',
        description: 'Reengancha a clientes que no han registrado actividad durante 3 días seguidos.',
        message: 'Hola {First Name}, hace unos días que no veo actividad en la app. Solo quería comprobar cómo vas y si necesitas un empujón. ¡Aquí sigo!',
      };
    case 'new-client':
      return {
        ...seed,
        name: 'Nuevo cliente añadido',
        description: 'Se dispara al añadir un nuevo cliente para enviar un mensaje de bienvenida.',
        message: '¡Bienvenido/a al equipo, {First Name}! 🚀 Me hace mucha ilusión tenerte por aquí. Ya he preparado tu perfil: échale un vistazo y dime si tienes cualquier duda.',
      };
    case 'app-setup':
      return {
        ...seed,
        name: 'Recordatorio de configuración',
        description: 'Empuja a los clientes que todavía no han terminado su configuración inicial.',
        message: 'Hola {First Name}, solo un recordatorio rápido para terminar de configurar tu perfil y tus preferencias de la app para arrancar con todo.',
      };
    case 'adherence-high':
      return {
        ...seed,
        name: 'Adherencia semanal alta',
        description: 'Felicita a los clientes que han superado el 90% de adherencia esta semana.',
        message: '¡Gran trabajo esta semana, {First Name}! 🌟 Tu adherencia ha sido de {Adherence Rate}. Lo estás haciendo genial. Sigue así.',
      };
    case 'birthday':
      return {
        ...seed,
        name: 'Cumpleaños del cliente',
        description: 'Envía un saludo personalizado el día especial del cliente.',
        message: '¡Feliz cumpleaños, {First Name}! 🎂 Que tengas un día increíble lleno de alegría (y quizá algún capricho). Disfrútalo mucho, — {Coach Name}',
      };
    default:
      return seed;
  }
}

export function getDefaultAutomations(language: string, managerId: string): AutomationSeed[] {
  const defaults = baseDefaults(managerId);
  return language === 'es' ? defaults.map(localizeSpanish) : defaults;
}

function defaultMessagesByTrigger(language: 'es' | 'en'): Record<string, string> {
  return Object.fromEntries(
    getDefaultAutomations(language, '__preview__').map(seed => [seed.trigger_id, seed.message]),
  );
}

/**
 * Returns the message that should be shown in previews for an automation.
 *
 * For manager-owned seed automations we keep the preview aligned with the
 * manager language, even if the stored row was created earlier in the other
 * language. Custom messages keep their stored text untouched.
 */
export function getLocalizedAutomationPreview(
  triggerId: string,
  message: string | null | undefined,
  language: 'es' | 'en',
): string {
  const es = defaultMessagesByTrigger('es')[triggerId];
  const en = defaultMessagesByTrigger('en')[triggerId];
  const knownDefault = Boolean(es || en);

  if (!knownDefault) return message || '';

  const normalized = (message || '').trim();
  if (!normalized || normalized === es || normalized === en) {
    return language === 'en' ? (en || es || normalized) : (es || en || normalized);
  }

  return message || '';
}
