// Catalogo central de CONDITIONS (activacion + parada) de automation simple.
//
// El backend evaluador (server/routes/automations.ts -> evalConditions)
// debe conocer cada `type` listado aqui. El frontend usa este catalogo para
// renderizar los chips disponibles. Mantener AMBOS lados sincronizados.

export type ConditionTier = 'basic' | 'advanced';

export interface ConditionDef {
  id: string;
  label: string;
  desc: string;
  category: 'activation' | 'stop';
  tier: ConditionTier;
  /** Operadores permitidos. La UI muestra solo estos en el dropdown. */
  operators: Array<'>' | '<' | '==' | '>=' | '<=' | '!=' | 'within'>;
  /** Valor por defecto al activar el chip. */
  defaultValue: string;
  defaultOperator: string;
  /** Hint para la UI (rango / unidades). */
  hint?: string;
  /** Color tailwind para el chip activo (e.g. 'bg-blue-500'). */
  color: string;
}

export const ACTIVATION_CONDITIONS: ConditionDef[] = [
  // ── Datos del cuerpo / peso ────────────────────────────────────────────
  { id: 'weight', label: 'Peso actual', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<=', '=='], defaultValue: '80', defaultOperator: '>',
    color: 'bg-blue-500', hint: 'kg',
    desc: 'Filtra clientes cuyo ultimo peso registrado cumple la regla.' },
  { id: 'weight_diff', label: 'Cambio de peso', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '2', defaultOperator: '>',
    color: 'bg-blue-600', hint: 'kg vs check-in anterior',
    desc: 'Diferencia absoluta entre el ultimo check-in y el anterior.' },
  { id: 'goal_weight_diff', label: 'Distancia a meta', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '5', defaultOperator: '<',
    color: 'bg-cyan-500', hint: 'kg al goal',
    desc: 'kg restantes para llegar al goal_weight.' },
  { id: 'body_fat', label: 'Body fat', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '15', defaultOperator: '<',
    color: 'bg-purple-500', hint: '%',
    desc: 'Porcentaje de body fat reportado en el ultimo check-in.' },

  // ── Adherencia / mood / RPE ────────────────────────────────────────────
  { id: 'adherence', label: 'Adherencia (semana)', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<='], defaultValue: '70', defaultOperator: '<',
    color: 'bg-red-500', hint: '%',
    desc: 'Score de adherencia de la ultima semana.' },
  { id: 'adherence_avg_4w', label: 'Adherencia media (4 sem)', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '80', defaultOperator: '<',
    color: 'bg-red-600', hint: '%',
    desc: 'Promedio de adherencia en las ultimas 4 semanas.' },
  { id: 'mood', label: 'Animo', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<='], defaultValue: '3', defaultOperator: '<',
    color: 'bg-indigo-500', hint: '1-10',
    desc: 'Score de animo (mood_score) del ultimo check-in.' },
  { id: 'rpe', label: 'RPE percibido', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<='], defaultValue: '8', defaultOperator: '>',
    color: 'bg-rose-500', hint: '1-10',
    desc: 'Esfuerzo percibido (rpe) del ultimo entreno.' },

  // ── Tiempo / actividad ─────────────────────────────────────────────────
  { id: 'last_checkin', label: 'Dias desde ultimo check-in', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<='], defaultValue: '7', defaultOperator: '>',
    color: 'bg-purple-500', hint: 'dias',
    desc: 'Dias transcurridos desde el ultimo check-in enviado.' },
  { id: 'last_login_days', label: 'Dias sin abrir la app', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '3', defaultOperator: '>',
    color: 'bg-amber-500', hint: 'dias',
    desc: 'Dias desde el ultimo login del cliente.' },
  { id: 'activity', label: 'Inactividad (dias)', category: 'activation', tier: 'basic',
    operators: ['>', '<', '>=', '<='], defaultValue: '3', defaultOperator: '>',
    color: 'bg-orange-500', hint: 'dias',
    desc: 'Dias desde la ultima actividad significativa.' },
  { id: 'days_as_client', label: 'Antiguedad', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '30', defaultOperator: '>',
    color: 'bg-teal-500', hint: 'dias',
    desc: 'Dias desde que el cliente firmo contigo.' },
  { id: 'streak_workouts', label: 'Racha de entrenos', category: 'activation', tier: 'advanced',
    operators: ['>', '<', '>=', '<='], defaultValue: '7', defaultOperator: '>=',
    color: 'bg-emerald-500', hint: 'dias seguidos',
    desc: 'Dias consecutivos con al menos un entreno loggeado.' },

  // ── Mensajeria / planes ────────────────────────────────────────────────
  { id: 'unread_messages_count', label: 'Mensajes sin leer', category: 'activation', tier: 'advanced',
    operators: ['>', '>=', '=='], defaultValue: '1', defaultOperator: '>=',
    color: 'bg-pink-500', hint: 'mensajes',
    desc: 'Numero de mensajes pendientes de leer.' },
  { id: 'has_active_plan', label: 'Plan activo', category: 'activation', tier: 'basic',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-green-500', hint: 'true/false',
    desc: 'Si el cliente tiene plan (nutricion o entreno) asignado.' },
];

export const STOP_CONDITIONS: ConditionDef[] = [
  { id: 'reply', label: 'Cliente respondio', category: 'stop', tier: 'basic',
    operators: ['within', '=='], defaultValue: '24', defaultOperator: 'within',
    color: 'bg-emerald-500', hint: 'horas / true',
    desc: 'Para el flujo si el cliente respondio en el periodo.' },
  { id: 'checkin', label: 'Check-in entregado', category: 'stop', tier: 'basic',
    operators: ['within', '=='], defaultValue: '7', defaultOperator: 'within',
    color: 'bg-cyan-500', hint: 'dias / true',
    desc: 'Para el flujo si el cliente envio check-in en el periodo.' },
  { id: 'weight_goal_reached', label: 'Meta de peso alcanzada', category: 'stop', tier: 'advanced',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-green-500', hint: '',
    desc: 'Para los recordatorios cuando el cliente llega a su goal_weight.' },
  { id: 'client_archived', label: 'Cliente archivado', category: 'stop', tier: 'basic',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-slate-500', hint: '',
    desc: 'Para siempre si el cliente esta archivado o inactivo.' },
  { id: 'coach_replied', label: 'Coach ya escribio', category: 'stop', tier: 'advanced',
    operators: ['within'], defaultValue: '24', defaultOperator: 'within',
    color: 'bg-violet-500', hint: 'horas',
    desc: 'Si TU has escrito al cliente en las ultimas X horas, no envia auto.' },
  { id: 'max_sends_per_week', label: 'Max envios/semana', category: 'stop', tier: 'advanced',
    operators: ['>='], defaultValue: '3', defaultOperator: '>=',
    color: 'bg-yellow-500', hint: 'envios',
    desc: 'No envia si este flow ya envio X veces en los ultimos 7 dias.' },
  { id: 'last_message_recent', label: 'Mensaje reciente (anti-spam)', category: 'stop', tier: 'basic',
    operators: ['within'], defaultValue: '6', defaultOperator: 'within',
    color: 'bg-pink-500', hint: 'horas',
    desc: 'No envia si ya hubo cualquier mensaje (tuyo o auto) en X horas.' },
  { id: 'workflow_paused', label: 'Flow pausado', category: 'stop', tier: 'basic',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-gray-500', hint: '',
    desc: 'Skip cuando el toggle "enabled" de la automation esta off (lo gestiona el motor).' },
  { id: 'on_vacation', label: 'Cliente en pausa', category: 'stop', tier: 'advanced',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-amber-600', hint: '',
    desc: 'Skip si el cliente tiene la etiqueta "vacaciones" o "pausa".' },
  { id: 'plan_completed', label: 'Programa completado', category: 'stop', tier: 'advanced',
    operators: ['=='], defaultValue: 'true', defaultOperator: '==',
    color: 'bg-teal-500', hint: '',
    desc: 'Skip cuando el roadmap del cliente esta marcado como completo.' },
];

export const CONDITIONS_BY_ID: Record<string, ConditionDef> = Object.fromEntries(
  [...ACTIVATION_CONDITIONS, ...STOP_CONDITIONS].map(c => [c.id, c])
);

export function filterConditionsByTier(
  list: ConditionDef[],
  tier: 'basic' | 'advanced',
): ConditionDef[] {
  if (tier === 'advanced') return list;
  return list.filter(c => c.tier === 'basic');
}
