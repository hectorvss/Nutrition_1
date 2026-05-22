// Catalogo central de TRIGGERS de automation simple.
//
// Fuente unica de verdad: el frontend lo consume via GET /automations/catalog
// (filtrado por tier del manager) y el backend lo usa para validar inputs
// (no se acepta un trigger_id que no este aqui).
//
// Cada trigger tiene:
//   - id:        clave estable usada en BD (NO renombrar sin migracion).
//   - name/desc: copy localizable (la UI puede sustituir via i18n).
//   - icon:      nombre del icono lucide-react.
//   - category:  agrupacion visual en el selector.
//   - tier:      'basic' (visible en todos los planes) o 'advanced' (gated).
//   - wired:     true si el cron/event handler dispara este trigger hoy;
//                false = "Coming soon" (visible pero deshabilitado).
//   - params:    parametros configurables del trigger (e.g. weight-dropped
//                requiere `threshold_kg`).

export type TriggerCategory =
  | 'lifecycle'   // alta, archivado, hitos
  | 'checkins'    // recordatorios, overdue, review
  | 'messaging'   // reply, mensajes pendientes
  | 'metrics'     // peso, mediciones
  | 'training'    // adherencia, workouts
  | 'schedule';   // fechas, inactividad

export type TriggerTier = 'basic' | 'advanced';

export interface TriggerParamField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text';
  defaultValue: string | number;
  options?: Array<{ value: string; label: string }>;
  unit?: string;
}

export interface TriggerDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: TriggerCategory;
  tier: TriggerTier;
  wired: boolean;
  params?: TriggerParamField[];
}

export const TRIGGERS: TriggerDef[] = [
  // ─── Lifecycle ──────────────────────────────────────────────────────────
  { id: 'new-client', name: 'Nuevo cliente', desc: 'Cuando un cliente firma y entra al sistema.',
    icon: 'UserPlus', category: 'lifecycle', tier: 'basic', wired: true },
  { id: 'onboarding-completed', name: 'Onboarding terminado',
    desc: 'Cuando el cliente termina el formulario de bienvenida.',
    icon: 'CheckCircle2', category: 'lifecycle', tier: 'basic', wired: true },
  { id: 'onboarding-stalled', name: 'Onboarding sin terminar',
    desc: 'El cliente no ha terminado el onboarding en X horas.',
    icon: 'AlertCircle', category: 'lifecycle', tier: 'advanced', wired: true,
    params: [{ key: 'hours', label: 'Horas sin terminar', type: 'number', defaultValue: 48, unit: 'h' }] },
  { id: 'first-checkin', name: 'Primer check-in',
    desc: 'Cuando el cliente envia su primer check-in (felicitar).',
    icon: 'Trophy', category: 'lifecycle', tier: 'basic', wired: true },
  { id: 'anniversary', name: 'Aniversario',
    desc: 'X meses desde que firmaste al cliente.',
    icon: 'Cake', category: 'lifecycle', tier: 'advanced', wired: true,
    params: [{ key: 'months', label: 'Meses', type: 'number', defaultValue: 1, unit: 'meses' }] },
  { id: 'subscription-renewal-soon', name: 'Renovación próxima',
    desc: 'X días antes de que renueve la suscripción del cliente.',
    icon: 'CreditCard', category: 'lifecycle', tier: 'advanced', wired: false,
    params: [{ key: 'days', label: 'Dias antes', type: 'number', defaultValue: 7, unit: 'd' }] },

  // ─── Check-ins ──────────────────────────────────────────────────────────
  { id: 'weekly-checkin', name: 'Recordatorio semanal',
    desc: 'Recordar al cliente cada semana que toca check-in.',
    icon: 'Repeat', category: 'checkins', tier: 'basic', wired: true },
  { id: 'checkin-overdue', name: 'Check-in atrasado',
    desc: 'El cliente no envio su check-in semanal a tiempo.',
    icon: 'Clock', category: 'checkins', tier: 'basic', wired: true },
  { id: 'checkin-submitted', name: 'Check-in enviado',
    desc: 'El cliente acaba de enviar un check-in (responder).',
    icon: 'Send', category: 'checkins', tier: 'basic', wired: true },
  { id: 'checkin-pending-review', name: 'Check-in sin revisar',
    desc: 'Llevas mas de X horas sin revisar un check-in pendiente.',
    icon: 'Eye', category: 'checkins', tier: 'advanced', wired: true,
    params: [{ key: 'hours', label: 'Horas pendiente', type: 'number', defaultValue: 24, unit: 'h' }] },
  { id: 'consecutive-checkins-missed', name: 'Varios check-ins seguidos perdidos',
    desc: 'Cliente que ha perdido X check-ins consecutivos.',
    icon: 'XCircle', category: 'checkins', tier: 'advanced', wired: false,
    params: [{ key: 'count', label: 'Check-ins seguidos', type: 'number', defaultValue: 2, unit: '' }] },

  // ─── Messaging ──────────────────────────────────────────────────────────
  { id: 'client-reply', name: 'Cliente responde',
    desc: 'Cuando el cliente envia un mensaje en el chat.',
    icon: 'MessageCircle', category: 'messaging', tier: 'basic', wired: true },
  { id: 'client-message-stale', name: 'Mensaje del cliente sin responder',
    desc: 'El cliente envio un mensaje y llevas mas de X horas sin contestar.',
    icon: 'MessageSquareWarning', category: 'messaging', tier: 'advanced', wired: false,
    params: [{ key: 'hours', label: 'Horas sin responder', type: 'number', defaultValue: 2, unit: 'h' }] },

  // ─── Metrics ────────────────────────────────────────────────────────────
  { id: 'weight-dropped', name: 'Bajada brusca de peso',
    desc: 'El peso del cliente bajo > X kg en una semana.',
    icon: 'TrendingDown', category: 'metrics', tier: 'advanced', wired: true,
    params: [{ key: 'kg', label: 'Kg perdidos', type: 'number', defaultValue: 2, unit: 'kg' }] },
  { id: 'weight-gained', name: 'Subida brusca de peso',
    desc: 'El peso del cliente subio > X kg en una semana.',
    icon: 'TrendingUp', category: 'metrics', tier: 'advanced', wired: true,
    params: [{ key: 'kg', label: 'Kg ganados', type: 'number', defaultValue: 2, unit: 'kg' }] },
  { id: 'weight-goal-reached', name: 'Meta de peso alcanzada',
    desc: 'El cliente llego a su goal_weight.',
    icon: 'Target', category: 'metrics', tier: 'advanced', wired: true },
  { id: 'weight-plateau', name: 'Estancamiento de peso',
    desc: 'Sin cambios significativos en X semanas.',
    icon: 'Minus', category: 'metrics', tier: 'advanced', wired: false,
    params: [{ key: 'weeks', label: 'Semanas sin cambio', type: 'number', defaultValue: 3, unit: 'sem' }] },

  // ─── Training / Adherence ──────────────────────────────────────────────
  { id: 'adherence-high', name: 'Adherencia alta',
    desc: 'Adherencia > X% en una semana (felicitar).',
    icon: 'Award', category: 'training', tier: 'basic', wired: true,
    params: [{ key: 'pct', label: 'Umbral %', type: 'number', defaultValue: 90, unit: '%' }] },
  { id: 'adherence-low', name: 'Adherencia baja',
    desc: 'Adherencia < X% durante varios dias.',
    icon: 'AlertTriangle', category: 'training', tier: 'advanced', wired: true,
    params: [{ key: 'pct', label: 'Umbral %', type: 'number', defaultValue: 70, unit: '%' }] },
  { id: 'workout-streak-broken', name: 'Racha de entrenos rota',
    desc: 'No ha entrenado en X dias seguidos.',
    icon: 'Flame', category: 'training', tier: 'advanced', wired: false,
    params: [{ key: 'days', label: 'Dias sin entrenar', type: 'number', defaultValue: 5, unit: 'd' }] },
  { id: 'workout-streak-milestone', name: 'Hito de entrenos',
    desc: 'Cliente alcanzo X entrenos loggeados (10, 30, 100).',
    icon: 'Trophy', category: 'training', tier: 'advanced', wired: false,
    params: [{ key: 'count', label: 'Numero de entrenos', type: 'number', defaultValue: 10, unit: '' }] },

  // ─── Schedule / Time ────────────────────────────────────────────────────
  { id: 'birthday', name: 'Cumpleaños del cliente',
    desc: 'Cuando es el cumpleanos del cliente.',
    icon: 'Gift', category: 'schedule', tier: 'basic', wired: true },
  { id: 'inactivity', name: 'Inactividad en la app',
    desc: 'Cliente no abrio la app en X dias.',
    icon: 'Moon', category: 'schedule', tier: 'basic', wired: true,
    params: [{ key: 'days', label: 'Dias sin login', type: 'number', defaultValue: 3, unit: 'd' }] },
  { id: 'plan-update-due', name: 'Plan vencido',
    desc: 'Su plan lleva mas de X semanas sin actualizar.',
    icon: 'CalendarClock', category: 'schedule', tier: 'advanced', wired: false,
    params: [{ key: 'weeks', label: 'Semanas', type: 'number', defaultValue: 4, unit: 'sem' }] },
  { id: 'no-appointment', name: 'Sin cita futura',
    desc: 'El cliente no tiene ninguna cita programada.',
    icon: 'CalendarX', category: 'schedule', tier: 'advanced', wired: false },

  // ─── Custom (escape hatch) ──────────────────────────────────────────────
  { id: 'custom', name: 'Manual / personalizado',
    desc: 'Dispara solo cuando lanzas la automation manualmente.',
    icon: 'Plus', category: 'lifecycle', tier: 'basic', wired: true },
];

export const TRIGGER_BY_ID: Record<string, TriggerDef> = Object.fromEntries(
  TRIGGERS.map(t => [t.id, t])
);

/**
 * Filtra el catalogo segun el tier del manager.
 * `tier` 'basic' -> oculta los triggers con `tier: 'advanced'`.
 * `tier` 'advanced' -> devuelve todos.
 */
export function filterTriggersByTier(tier: 'basic' | 'advanced'): TriggerDef[] {
  if (tier === 'advanced') return TRIGGERS;
  return TRIGGERS.filter(t => t.tier === 'basic');
}
