// Catalogo de los 15 workflows AVANZADOS que recibe cada manager como
// plantillas operativas listas para usar.
//
// Se siembran DESACTIVADOS (enabled=false) y el manager los puede activar,
// desactivar y EDITAR libremente en el Workflow Builder igual que cualquier
// workflow propio. Son plantillas-semilla, no read-only.
//
// Todas las decisiones se basan en campos VERIFICADOS contra datos reales:
// - latestCheckin.nutrition_adherence_score (numero 1-10, obligatorio)
// - latestCheckin.painLevel ('No issues' / molestias)
// - flow.has_checkin / flow.days_since / flow.has_plan / flow.has_tag
// NO se usa data.compute_bmi (los clientes no tienen `height`) ni la
// columna `goal` (practicamente vacia) para ramificar.
//
// Idempotente: `seedManagerWorkflows` salta cualquier workflow cuyo `name`
// ya exista para el manager.

import { supabaseAdmin } from '../db/index.js';
import { logger } from './logger.js';

interface SeedWorkflow {
  name: string;
  description: string;
  triggerKey: string;
  nodes: unknown[];
  edges: unknown[];
}

// Nombres de la primera tanda (workflows lineales basicos) que estos 10
// avanzados reemplazan. Se usan para purgarlos al re-sembrar.
export const LEGACY_WORKFLOW_NAMES = [
  // Primera tanda (workflows lineales basicos).
  'Bienvenida de nuevo cliente',
  'Re-enganche de cliente inactivo',
  'Onboarding completado',
  'Recuperación de check-in atrasado',
  'Celebración de meta de peso alcanzada',
  'Cliente en riesgo de abandono',
  'Felicitación de cumpleaños',
  'Alerta de cambio brusco de peso',
  'Plan asignado: instrucciones de inicio',
  'Agradecimiento y revisión tras check-in',
  // Workflows renombrados/reemplazados al corregir fallos de arquitectura.
  'Onboarding segmentado por objetivo',
];

export const DEFAULT_WORKFLOWS: SeedWorkflow[] = [
  // ── 1. Onboarding completado: arranque del plan ────────────────────────
  {
    name: 'Onboarding completado: arranque del plan',
    description: 'Al terminar el onboarding, crea la tarea de preparar el plan y confirma al cliente. Dos días después verifica si el plan ya está asignado: si sí, avisa al cliente; si no, escala al coach y tranquiliza al cliente con un push.',
    triggerKey: 'trigger.onboarding_completed',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.onboarding_completed', label: 'Onboarding completado', position: { x: 440, y: 40 }, config: {} },
      { id: 'nc1', type: 'action', key: 'action.notify_coach', label: 'Preparar plan', position: { x: 440, y: 170 }, config: { title: 'Preparar el plan de {Client Name}', description: 'El cliente completó su onboarding. Diseña su plan personalizado para que arranque sin esperas.' } },
      { id: 'm1', type: 'action', key: 'action.send_message', label: 'Confirmar al cliente', position: { x: 440, y: 300 }, config: { message: '¡Genial {First Name}! He recibido todo tu onboarding 🙌 Estoy preparando tu plan personalizado, te aviso en cuanto esté listo.' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 2 días', position: { x: 440, y: 430 }, config: { amount: 2, unit: 'days' } },
      { id: 'hp', type: 'condition', key: 'flow.has_plan', label: '¿Plan asignado?', position: { x: 440, y: 560 }, config: { planKind: 'any' } },
      { id: 'ym', type: 'action', key: 'action.send_message', label: 'Plan disponible', position: { x: 220, y: 700 }, config: { message: '{First Name}, tu plan ya está disponible en la app 🎯 Échale un vistazo y empezamos. Cualquier duda, escríbeme.' } },
      { id: 'nnc', type: 'action', key: 'action.notify_coach', label: 'Plan pendiente', position: { x: 660, y: 700 }, config: { title: '⏰ Plan pendiente de {Client Name}', description: 'Han pasado 2 días desde el onboarding y el cliente sigue sin plan. Es prioritario para no perder su impulso inicial.' } },
      { id: 'npush', type: 'action', key: 'action.send_push', label: 'Tranquilizar al cliente', position: { x: 660, y: 830 }, config: { title: 'Tu plan está en camino', body: 'Estamos puliendo los últimos detalles. ¡Muy pronto lo tendrás!', url: '/' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'nc1' },
      { id: 'e2', source: 'nc1', target: 'm1' },
      { id: 'e3', source: 'm1', target: 'd1' },
      { id: 'e4', source: 'd1', target: 'hp' },
      { id: 'e5', source: 'hp', target: 'ym', sourceHandle: 'true' },
      { id: 'e6', source: 'hp', target: 'nnc', sourceHandle: 'false' },
      { id: 'e7', source: 'nnc', target: 'npush' },
    ],
  },

  // ── 2. Escalera de retención con estado ────────────────────────────────
  {
    name: 'Escalera de retención de cliente inactivo',
    description: 'Detecta inactividad de 5+ días y escala en 2 niveles (push → mensaje personal → llamada → pausa). Usa una etiqueta como estado para no volver a empezar si el cliente ya está en la escalera, y la limpia en cuanto vuelve.',
    triggerKey: 'trigger.client_inactive',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.client_inactive', label: 'Cliente inactivo (5d)', position: { x: 440, y: 40 }, config: { days: 5 } },
      { id: 'ht', type: 'condition', key: 'flow.has_tag', label: '¿Ya en la escalera?', position: { x: 440, y: 170 }, config: { tag: 'retencion-activa' } },
      { id: 'stp', type: 'flow', key: 'flow.stop', label: 'Ya en proceso', position: { x: 140, y: 300 }, config: {} },
      { id: 'ps', type: 'action', key: 'action.send_push', label: 'Push suave', position: { x: 640, y: 300 }, config: { title: 'Te echamos de menos 👀', body: 'Vuelve cuando quieras, seguimos aquí para ayudarte.', url: '/' } },
      { id: 'tg', type: 'action', key: 'action.tag_client', label: 'Marcar en escalera', position: { x: 640, y: 430 }, config: { tag: 'retencion-activa', action: 'add' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 3 días', position: { x: 640, y: 560 }, config: { amount: 3, unit: 'days' } },
      { id: 'hc1', type: 'condition', key: 'flow.has_checkin', label: '¿Ha vuelto?', position: { x: 640, y: 690 }, config: { days: 3 } },
      { id: 'bk1', type: 'action', key: 'action.tag_client', label: 'Limpiar estado', position: { x: 380, y: 820 }, config: { tag: 'retencion-activa', action: 'remove' } },
      { id: 'bs1', type: 'action', key: 'action.send_message', label: 'Bienvenida de vuelta', position: { x: 380, y: 950 }, config: { message: '¡Qué bien tenerte de vuelta, {First Name}! Sigamos donde lo dejamos 🙌' } },
      { id: 'm1', type: 'action', key: 'action.send_message', label: 'Mensaje personal', position: { x: 880, y: 820 }, config: { message: 'Hola {First Name}, hace unos días que no te veo por aquí. ¿Va todo bien? Cuéntame qué está pasando y lo resolvemos juntos.' } },
      { id: 'd2', type: 'flow', key: 'flow.delay', label: 'Esperar 4 días', position: { x: 880, y: 950 }, config: { amount: 4, unit: 'days' } },
      { id: 'hc2', type: 'condition', key: 'flow.has_checkin', label: '¿Ha vuelto ahora?', position: { x: 880, y: 1080 }, config: { days: 4 } },
      { id: 'bk2', type: 'action', key: 'action.tag_client', label: 'Limpiar estado', position: { x: 620, y: 1210 }, config: { tag: 'retencion-activa', action: 'remove' } },
      { id: 'bs2', type: 'action', key: 'action.send_message', label: 'Bienvenida de vuelta', position: { x: 620, y: 1340 }, config: { message: '¡Me alegro de verte otra vez por aquí, {First Name}! 💪' } },
      { id: 'nc', type: 'action', key: 'action.notify_coach', label: 'Escalar a llamada', position: { x: 1120, y: 1210 }, config: { title: 'Contactar a {Client Name} — riesgo de baja', description: 'El cliente sigue inactivo tras dos intentos automáticos. Llamada personal recomendada antes de pausar.' } },
      { id: 'st', type: 'action', key: 'action.set_client_status', label: 'Pausar cliente', position: { x: 1120, y: 1340 }, config: { status: 'Paused' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'ht' },
      { id: 'e2', source: 'ht', target: 'stp', sourceHandle: 'true' },
      { id: 'e3', source: 'ht', target: 'ps', sourceHandle: 'false' },
      { id: 'e4', source: 'ps', target: 'tg' },
      { id: 'e5', source: 'tg', target: 'd1' },
      { id: 'e6', source: 'd1', target: 'hc1' },
      { id: 'e7', source: 'hc1', target: 'bk1', sourceHandle: 'true' },
      { id: 'e8', source: 'bk1', target: 'bs1' },
      { id: 'e9', source: 'hc1', target: 'm1', sourceHandle: 'false' },
      { id: 'e10', source: 'm1', target: 'd2' },
      { id: 'e11', source: 'd2', target: 'hc2' },
      { id: 'e12', source: 'hc2', target: 'bk2', sourceHandle: 'true' },
      { id: 'e13', source: 'bk2', target: 'bs2' },
      { id: 'e14', source: 'hc2', target: 'nc', sourceHandle: 'false' },
      { id: 'e15', source: 'nc', target: 'st' },
    ],
  },

  // ── 3. Análisis de check-in con feedback diferenciado ──────────────────
  {
    name: 'Análisis de check-in con feedback diferenciado',
    description: 'Al recibir un check-in lee la nota de adherencia nutricional (1-10) y responde distinto: ≤4 mensaje empático + aviso al coach; ≥8 refuerzo y etiqueta de racha; intermedio comprueba si reporta dolor y, si es así, avisa al coach.',
    triggerKey: 'trigger.checkin_submitted',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.checkin_submitted', label: 'Check-in enviado', position: { x: 440, y: 40 }, config: {} },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer último check-in', position: { x: 440, y: 170 }, config: {} },
      { id: 'if1', type: 'condition', key: 'flow.if', label: '¿Adherencia ≤ 4/10?', position: { x: 440, y: 300 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '<', value: '5' } },
      { id: 'lm', type: 'action', key: 'action.send_message', label: 'Mensaje empático', position: { x: 160, y: 440 }, config: { message: 'He visto tu check-in, {First Name}. Esta semana ha sido más cuesta arriba — y no pasa nada, lo importante es no parar. Cuéntame qué te ha costado más y lo ajustamos juntos.' } },
      { id: 'lt', type: 'action', key: 'action.tag_client', label: 'Etiquetar adherencia baja', position: { x: 160, y: 570 }, config: { tag: 'adherencia-baja', action: 'add' } },
      { id: 'lnc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 160, y: 700 }, config: { title: 'Adherencia baja: {Client Name}', description: 'Último check-in con adherencia nutricional de 4/10 o menos. Revisa el caso: posible ajuste de plan o llamada.' } },
      { id: 'if2', type: 'condition', key: 'flow.if', label: '¿Adherencia ≥ 8/10?', position: { x: 700, y: 440 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '8' } },
      { id: 'om', type: 'action', key: 'action.send_message', label: 'Refuerzo positivo', position: { x: 520, y: 570 }, config: { message: '¡Semana excelente, {First Name}! 🔥 Adherencia de {{latestCheckin.nutrition_adherence_score}}/10. Lo estás haciendo de lujo, sigue exactamente así.' } },
      { id: 'ot', type: 'action', key: 'action.tag_client', label: 'Etiquetar en racha', position: { x: 520, y: 700 }, config: { tag: 'en-racha', action: 'add' } },
      { id: 'if3', type: 'condition', key: 'flow.if', label: '¿Reporta dolor?', position: { x: 900, y: 570 }, config: { field: 'latestCheckin.painLevel', operator: '!=', value: 'No issues' } },
      { id: 'pnc', type: 'action', key: 'action.notify_coach', label: 'Aviso de molestias', position: { x: 760, y: 700 }, config: { title: '{Client Name} reporta molestias', description: 'El cliente marcó dolor o molestia en su check-in. Revisa el apartado de lesión antes del próximo entreno.' } },
      { id: 'sm', type: 'action', key: 'action.send_message', label: 'Mensaje de constancia', position: { x: 1040, y: 700 }, config: { message: 'Buen trabajo manteniendo el ritmo, {First Name} 💪 Vamos consolidando. Una semana más sumando.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'gl' },
      { id: 'e2', source: 'gl', target: 'if1' },
      { id: 'e3', source: 'if1', target: 'lm', sourceHandle: 'true' },
      { id: 'e4', source: 'lm', target: 'lt' },
      { id: 'e5', source: 'lt', target: 'lnc' },
      { id: 'e6', source: 'if1', target: 'if2', sourceHandle: 'false' },
      { id: 'e7', source: 'if2', target: 'om', sourceHandle: 'true' },
      { id: 'e8', source: 'om', target: 'ot' },
      { id: 'e9', source: 'if2', target: 'if3', sourceHandle: 'false' },
      { id: 'e10', source: 'if3', target: 'pnc', sourceHandle: 'true' },
      { id: 'e11', source: 'if3', target: 'sm', sourceHandle: 'false' },
    ],
  },

  // ── 4. Revisión quincenal proactiva ────────────────────────────────────
  {
    name: 'Revisión quincenal proactiva',
    description: 'Cada 14 días comprueba si el cliente ha hecho check-in. Si no, le pide uno y avisa al coach. Si sí, lee su adherencia nutricional: refuerzo si se mantiene alta (≥7/10), o aviso al coach + mensaje de ajuste si está por debajo.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada 14 días', position: { x: 440, y: 40 }, config: { everyDays: 14 } },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Check-in reciente?', position: { x: 440, y: 170 }, config: { days: 14 } },
      { id: 'rc', type: 'action', key: 'action.request_checkin', label: 'Pedir check-in', position: { x: 160, y: 300 }, config: { template: 'Check-in Semanal' } },
      { id: 'nm', type: 'action', key: 'action.send_message', label: 'Recordatorio', position: { x: 160, y: 430 }, config: { message: '{First Name}, toca revisión quincenal 📋 Mándame tu check-in y vemos cómo ajustar lo que haga falta.' } },
      { id: 'nnc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 160, y: 560 }, config: { title: '{Client Name} sin check-in (15 días)', description: 'El cliente no registra check-in en la última quincena. Conviene un contacto directo.' } },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer último check-in', position: { x: 700, y: 300 }, config: {} },
      { id: 'ifa', type: 'condition', key: 'flow.if', label: '¿Adherencia ≥ 7/10?', position: { x: 700, y: 430 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '7' } },
      { id: 'okm', type: 'action', key: 'action.send_message', label: 'Refuerzo', position: { x: 520, y: 560 }, config: { message: '¡Vas muy bien, {First Name}! Tu adherencia se mantiene alta. Mantengamos el rumbo estas dos semanas 💪' } },
      { id: 'hnc', type: 'action', key: 'action.notify_coach', label: 'Revisar plan', position: { x: 900, y: 560 }, config: { title: 'Revisar plan de {Client Name}', description: 'Adherencia por debajo de 7/10 en la última quincena. Valora simplificar o ajustar el plan.' } },
      { id: 'hm', type: 'action', key: 'action.send_message', label: 'Mensaje de ajuste', position: { x: 900, y: 690 }, config: { message: '{First Name}, repasando estas dos semanas veo que podemos ajustar cosas para que te sea más llevadero. Lo reviso y te cuento 💪' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'hc' },
      { id: 'e2', source: 'hc', target: 'rc', sourceHandle: 'false' },
      { id: 'e3', source: 'rc', target: 'nm' },
      { id: 'e4', source: 'nm', target: 'nnc' },
      { id: 'e5', source: 'hc', target: 'gl', sourceHandle: 'true' },
      { id: 'e6', source: 'gl', target: 'ifa' },
      { id: 'e7', source: 'ifa', target: 'okm', sourceHandle: 'true' },
      { id: 'e8', source: 'ifa', target: 'hnc', sourceHandle: 'false' },
      { id: 'e9', source: 'hnc', target: 'hm' },
    ],
  },

  // ── 5. A/B test de mensaje motivacional ────────────────────────────────
  {
    name: 'A/B test de mensaje motivacional semanal',
    description: 'Cada semana reparte aleatoriamente a los clientes en dos grupos y les envía un estilo de mensaje distinto (motivacional vs. basado en datos), etiquetando a cada uno. Permite comparar qué enfoque genera más engagement.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada 7 días', position: { x: 440, y: 40 }, config: { everyDays: 7 } },
      { id: 'rs', type: 'condition', key: 'flow.random_split', label: 'Reparto A/B 50-50', position: { x: 440, y: 170 }, config: { weightA: 50 } },
      { id: 'am', type: 'action', key: 'action.send_message', label: 'Mensaje motivacional', position: { x: 240, y: 320 }, config: { message: '{First Name}, nueva semana, nueva oportunidad. Tú puedes con esto — ¡a darlo todo! 🔥' } },
      { id: 'at', type: 'action', key: 'action.tag_client', label: 'Grupo A', position: { x: 240, y: 450 }, config: { tag: 'ab-motivacional', action: 'add' } },
      { id: 'bm', type: 'action', key: 'action.send_message', label: 'Mensaje basado en datos', position: { x: 640, y: 320 }, config: { message: '{First Name}, repasa tus números de la semana pasada: cada dato cuenta. Esta semana, supéralos 📈' } },
      { id: 'bt', type: 'action', key: 'action.tag_client', label: 'Grupo B', position: { x: 640, y: 450 }, config: { tag: 'ab-datos', action: 'add' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'rs' },
      { id: 'e2', source: 'rs', target: 'am', sourceHandle: 'A' },
      { id: 'e3', source: 'am', target: 'at' },
      { id: 'e4', source: 'rs', target: 'bm', sourceHandle: 'B' },
      { id: 'e5', source: 'bm', target: 'bt' },
    ],
  },

  // ── 6. Bienvenida progresiva con verificación ──────────────────────────
  {
    name: 'Bienvenida progresiva con puntos de control',
    description: 'Acompaña al nuevo cliente sus primeros días verificando hitos reales: al día 1 comprueba que tiene plan (y avisa al coach si no), al día 3 comprueba que ha hecho su primer check-in, y si no, lo pide por push y escala al coach.',
    triggerKey: 'trigger.new_client',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.new_client', label: 'Nuevo cliente', position: { x: 440, y: 40 }, config: {} },
      { id: 'm0', type: 'action', key: 'action.send_message', label: 'Saludo inicial', position: { x: 440, y: 170 }, config: { message: '¡Hola {First Name}! Soy {Coach Name}. Bienvenido/a 🙌 En los próximos días lo configuramos todo paso a paso.' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 1 día', position: { x: 440, y: 300 }, config: { amount: 1, unit: 'days' } },
      { id: 'hp', type: 'condition', key: 'flow.has_plan', label: '¿Tiene plan?', position: { x: 440, y: 430 }, config: { planKind: 'any' } },
      { id: 'np', type: 'action', key: 'action.notify_coach', label: 'Asignar plan', position: { x: 180, y: 560 }, config: { title: 'Asignar plan a {Client Name}', description: 'El cliente lleva 1 día sin plan asignado. Prepáralo para no frenar su arranque.' } },
      { id: 'yp', type: 'action', key: 'action.send_message', label: 'Plan disponible', position: { x: 700, y: 560 }, config: { message: '{First Name}, tu plan ya está disponible en la app. Échale un vistazo y cualquier duda me dices.' } },
      { id: 'd2', type: 'flow', key: 'flow.delay', label: 'Esperar 2 días', position: { x: 440, y: 690 }, config: { amount: 2, unit: 'days' } },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Primer check-in?', position: { x: 440, y: 820 }, config: { days: 3 } },
      { id: 'okm', type: 'action', key: 'action.send_message', label: 'Va rodando', position: { x: 200, y: 950 }, config: { message: '¡Genial {First Name}! Ya estás rodando. Sigue así 💪' } },
      { id: 'push', type: 'action', key: 'action.send_push', label: 'Push recordatorio', position: { x: 660, y: 950 }, config: { title: 'Tu primer check-in te espera', body: 'Solo te llevará un par de minutos. ¡Vamos!', url: '/' } },
      { id: 'rc', type: 'action', key: 'action.request_checkin', label: 'Pedir check-in', position: { x: 660, y: 1080 }, config: { template: 'Check-in Semanal' } },
      { id: 'd3', type: 'flow', key: 'flow.delay', label: 'Esperar 3 días', position: { x: 660, y: 1210 }, config: { amount: 3, unit: 'days' } },
      { id: 'hc2', type: 'condition', key: 'flow.has_checkin', label: '¿Ya lo hizo?', position: { x: 660, y: 1340 }, config: { days: 3 } },
      { id: 'done', type: 'flow', key: 'flow.stop', label: 'Onboarding ok', position: { x: 460, y: 1470 }, config: {} },
      { id: 'esc', type: 'action', key: 'action.notify_coach', label: 'Escalar', position: { x: 860, y: 1470 }, config: { title: '{Client Name} no arranca', description: 'El cliente no ha completado su primer check-in tras varios recordatorios. Contacto personal recomendado.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'm0' },
      { id: 'e2', source: 'm0', target: 'd1' },
      { id: 'e3', source: 'd1', target: 'hp' },
      { id: 'e4', source: 'hp', target: 'np', sourceHandle: 'false' },
      { id: 'e5', source: 'hp', target: 'yp', sourceHandle: 'true' },
      { id: 'e6', source: 'np', target: 'd2' },
      { id: 'e7', source: 'yp', target: 'd2' },
      { id: 'e8', source: 'd2', target: 'hc' },
      { id: 'e9', source: 'hc', target: 'okm', sourceHandle: 'true' },
      { id: 'e10', source: 'hc', target: 'push', sourceHandle: 'false' },
      { id: 'e11', source: 'push', target: 'rc' },
      { id: 'e12', source: 'rc', target: 'd3' },
      { id: 'e13', source: 'd3', target: 'hc2' },
      { id: 'e14', source: 'hc2', target: 'done', sourceHandle: 'true' },
      { id: 'e15', source: 'hc2', target: 'esc', sourceHandle: 'false' },
    ],
  },

  // ── 7. Meta alcanzada: celebración y siguiente fase ────────────────────
  {
    name: 'Meta alcanzada: transición de fase guiada',
    description: 'Cuando el cliente alcanza su meta de peso lo etiqueta, lo felicita y, un día después, agenda una videollamada de revisión y crea la tarea para que el coach prepare la propuesta de la siguiente fase.',
    triggerKey: 'trigger.goal_reached',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.goal_reached', label: 'Meta alcanzada', position: { x: 440, y: 40 }, config: {} },
      { id: 'tg', type: 'action', key: 'action.tag_client', label: 'Etiquetar', position: { x: 440, y: 170 }, config: { tag: 'meta-alcanzada', action: 'add' } },
      { id: 'm1', type: 'action', key: 'action.send_message', label: 'Felicitar', position: { x: 440, y: 300 }, config: { message: '🎉 ¡ENHORABUENA {First Name}! Has alcanzado tu meta. Esto es 100% mérito de tu constancia y esfuerzo. Estoy muy orgulloso de ti.' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 1 día', position: { x: 440, y: 430 }, config: { amount: 1, unit: 'days' } },
      { id: 'ap', type: 'action', key: 'action.schedule_appointment', label: 'Cita de revisión', position: { x: 440, y: 560 }, config: { title: 'Revisión de nueva fase — {Client Name}', type: 'Video Call', date: 'today+3d', time: '10:00', duration: '30m' } },
      { id: 'm2', type: 'action', key: 'action.send_message', label: 'Avisar de la cita', position: { x: 440, y: 690 }, config: { message: '{First Name}, he agendado una videollamada para definir juntos tu siguiente fase (mantener, recomposición, nuevo objetivo...). ¡Hablamos pronto!' } },
      { id: 'nc', type: 'action', key: 'action.notify_coach', label: 'Preparar siguiente fase', position: { x: 440, y: 820 }, config: { title: 'Definir siguiente fase con {Client Name}', description: 'El cliente alcanzó su meta. Tienes una cita agendada en 3 días — prepara la propuesta de nueva fase (plan y objetivos).' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'tg' },
      { id: 'e2', source: 'tg', target: 'm1' },
      { id: 'e3', source: 'm1', target: 'd1' },
      { id: 'e4', source: 'd1', target: 'ap' },
      { id: 'e5', source: 'ap', target: 'm2' },
      { id: 'e6', source: 'm2', target: 'nc' },
    ],
  },

  // ── 8. Check-in atrasado segmentado por historial ──────────────────────
  {
    name: 'Check-in atrasado segmentado por historial',
    description: 'Trata el check-in atrasado según el historial del cliente: si ya está marcado como reincidente, aviso firme + tarea para el coach; si es la primera vez, recordatorio suave y, solo si vuelve a fallar, se le marca como reincidente.',
    triggerKey: 'trigger.checkin_overdue',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.checkin_overdue', label: 'Check-in atrasado', position: { x: 440, y: 40 }, config: { graceDays: 1 } },
      { id: 'ht', type: 'condition', key: 'flow.has_tag', label: '¿Reincidente?', position: { x: 440, y: 170 }, config: { tag: 'incumplidor-recurrente' } },
      { id: 'rnc', type: 'action', key: 'action.notify_coach', label: 'Aviso al coach', position: { x: 180, y: 300 }, config: { title: '{Client Name} vuelve a saltarse el check-in', description: 'Cliente reincidente en check-ins atrasados. Valora una conversación directa sobre el compromiso.' } },
      { id: 'rm', type: 'action', key: 'action.send_message', label: 'Mensaje firme', position: { x: 180, y: 430 }, config: { message: '{First Name}, otra vez sin check-in. Necesito tus datos para ayudarte de verdad — ¿hablamos de qué está fallando?' } },
      { id: 'sm', type: 'action', key: 'action.send_message', label: 'Recordatorio suave', position: { x: 700, y: 300 }, config: { message: 'Hola {First Name} 👋 Se te ha pasado el check-in de esta semana. Cuando puedas, mándamelo — ¡no tardas nada!' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 2 días', position: { x: 700, y: 430 }, config: { amount: 2, unit: 'days' } },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Lo hizo ya?', position: { x: 700, y: 560 }, config: { days: 2 } },
      { id: 'ok', type: 'flow', key: 'flow.stop', label: 'Resuelto', position: { x: 500, y: 690 }, config: {} },
      { id: 'lt', type: 'action', key: 'action.tag_client', label: 'Marcar reincidente', position: { x: 900, y: 690 }, config: { tag: 'incumplidor-recurrente', action: 'add' } },
      { id: 'lnc', type: 'action', key: 'action.notify_coach', label: 'Aviso al coach', position: { x: 900, y: 820 }, config: { title: '{Client Name}: check-in pendiente', description: 'El cliente no envió su check-in tras el recordatorio. Marcado como reincidente para seguimiento.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'ht' },
      { id: 'e2', source: 'ht', target: 'rnc', sourceHandle: 'true' },
      { id: 'e3', source: 'rnc', target: 'rm' },
      { id: 'e4', source: 'ht', target: 'sm', sourceHandle: 'false' },
      { id: 'e5', source: 'sm', target: 'd1' },
      { id: 'e6', source: 'd1', target: 'hc' },
      { id: 'e7', source: 'hc', target: 'ok', sourceHandle: 'true' },
      { id: 'e8', source: 'hc', target: 'lt', sourceHandle: 'false' },
      { id: 'e9', source: 'lt', target: 'lnc' },
    ],
  },

  // ── 9. Win-back de cliente en riesgo profundo ──────────────────────────
  {
    name: 'Win-back de cliente en riesgo profundo',
    description: 'Para clientes inactivos 21+ días lanza un único intento de recuperación (mensaje personal + tarea de llamada prioritaria), protegido por una etiqueta para no repetirlo. Si vuelve, lo celebra; si no, lo pausa y avisa al coach.',
    triggerKey: 'trigger.client_inactive',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.client_inactive', label: 'Inactivo 21 días', position: { x: 440, y: 40 }, config: { days: 21 } },
      { id: 'ht', type: 'condition', key: 'flow.has_tag', label: '¿Win-back ya enviado?', position: { x: 440, y: 170 }, config: { tag: 'winback-enviado' } },
      { id: 'stp', type: 'flow', key: 'flow.stop', label: 'Ya intentado', position: { x: 200, y: 300 }, config: {} },
      { id: 'tg', type: 'action', key: 'action.tag_client', label: 'Marcar win-back', position: { x: 660, y: 300 }, config: { tag: 'winback-enviado', action: 'add' } },
      { id: 'm1', type: 'action', key: 'action.send_message', label: 'Mensaje personal', position: { x: 660, y: 430 }, config: { message: '{First Name}, te escribo personalmente. Sé que retomar cuesta, y quiero ayudarte sin presión. ¿Te llamo esta semana y vemos cómo seguir?' } },
      { id: 'ct', type: 'action', key: 'action.create_task', label: 'Tarea de llamada', position: { x: 660, y: 560 }, config: { title: 'Llamada win-back — {Client Name}', type: 'Call', priority: 'high' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Esperar 5 días', position: { x: 660, y: 690 }, config: { amount: 5, unit: 'days' } },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Ha vuelto?', position: { x: 660, y: 820 }, config: { days: 5 } },
      { id: 'bt', type: 'action', key: 'action.tag_client', label: 'Limpiar estado', position: { x: 440, y: 950 }, config: { tag: 'winback-enviado', action: 'remove' } },
      { id: 'bm', type: 'action', key: 'action.send_message', label: 'Bienvenida de vuelta', position: { x: 440, y: 1080 }, config: { message: '¡Bienvenido/a de vuelta, {First Name}! 🙌 Me alegro un montón. Vamos a por ello con calma y constancia.' } },
      { id: 'ls', type: 'action', key: 'action.set_client_status', label: 'Pausar cliente', position: { x: 880, y: 950 }, config: { status: 'Paused' } },
      { id: 'lnc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 880, y: 1080 }, config: { title: '{Client Name}: sin respuesta al win-back', description: 'El cliente no respondió al intento de recuperación. Pausado automáticamente — decide si archivar o reintentar.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'ht' },
      { id: 'e2', source: 'ht', target: 'stp', sourceHandle: 'true' },
      { id: 'e3', source: 'ht', target: 'tg', sourceHandle: 'false' },
      { id: 'e4', source: 'tg', target: 'm1' },
      { id: 'e5', source: 'm1', target: 'ct' },
      { id: 'e6', source: 'ct', target: 'd1' },
      { id: 'e7', source: 'd1', target: 'hc' },
      { id: 'e8', source: 'hc', target: 'bt', sourceHandle: 'true' },
      { id: 'e9', source: 'bt', target: 'bm' },
      { id: 'e10', source: 'hc', target: 'ls', sourceHandle: 'false' },
      { id: 'e11', source: 'ls', target: 'lnc' },
    ],
  },

  // ── 10. Vigilancia de adherencia al entrenamiento ──────────────────────
  {
    name: 'Vigilancia de adherencia al entrenamiento',
    description: 'Cada semana evalúa los días desde el último entreno: si han pasado 7+, alerta al cliente y al coach y lo marca en riesgo; si entrena con regularidad, le envía un push de refuerzo (extra si lleva una racha) y limpia la etiqueta de riesgo.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada 7 días', position: { x: 440, y: 40 }, config: { everyDays: 7 } },
      { id: 'ds', type: 'condition', key: 'flow.days_since', label: '¿7+ días sin entrenar?', position: { x: 440, y: 170 }, config: { event: 'last_workout', operator: '>', days: 7 } },
      { id: 'bm', type: 'action', key: 'action.send_message', label: 'Alerta al cliente', position: { x: 180, y: 320 }, config: { message: '{First Name}, esta semana no veo entrenos registrados. ¿Qué ha pasado? Retomemos hoy mismo, aunque sea una sesión corta 💪' } },
      { id: 'bt', type: 'action', key: 'action.tag_client', label: 'Marcar en riesgo', position: { x: 180, y: 450 }, config: { tag: 'riesgo-entreno', action: 'add' } },
      { id: 'bnc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 180, y: 580 }, config: { title: '{Client Name} sin entrenar (7+ días)', description: 'El cliente lleva más de una semana sin registrar entrenamientos. Revisa posibles causas (lesión, motivación, agenda).' } },
      { id: 'ok', type: 'condition', key: 'flow.days_since', label: '¿Racha activa (<=2d)?', position: { x: 700, y: 320 }, config: { event: 'last_workout', operator: '<=', days: 2 } },
      { id: 'hp', type: 'action', key: 'action.send_push', label: 'Push de racha', position: { x: 540, y: 450 }, config: { title: '¡Racha imparable! 🔥', body: 'Otra semana cumpliendo. Así se consiguen los resultados.', url: '/' } },
      { id: 'op', type: 'action', key: 'action.send_push', label: 'Push de refuerzo', position: { x: 860, y: 450 }, config: { title: 'Buena semana de entrenos 💪', body: 'Sigue sumando sesiones, vas por buen camino.', url: '/' } },
      { id: 'clr', type: 'action', key: 'action.tag_client', label: 'Limpiar riesgo', position: { x: 700, y: 580 }, config: { tag: 'riesgo-entreno', action: 'remove' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'ds' },
      { id: 'e2', source: 'ds', target: 'bm', sourceHandle: 'true' },
      { id: 'e3', source: 'bm', target: 'bt' },
      { id: 'e4', source: 'bt', target: 'bnc' },
      { id: 'e5', source: 'ds', target: 'ok', sourceHandle: 'false' },
      { id: 'e6', source: 'ok', target: 'hp', sourceHandle: 'true' },
      { id: 'e7', source: 'ok', target: 'op', sourceHandle: 'false' },
      { id: 'e8', source: 'hp', target: 'clr' },
      { id: 'e9', source: 'op', target: 'clr' },
    ],
  },

  // ═══ ULTRA-AVANZADOS ═══════════════════════════════════════════════════

  // ── 11. Auto-Coach: revisión semanal del cliente ───────────────────────
  {
    name: 'Auto-Coach: revisión semanal del cliente',
    description: 'Cada semana revisa a cada cliente: si no hay check-in lo pide; si lo hay, clasifica por la nota de adherencia (1-10) y actúa — listo para progresión (≥8), seguimiento cercano (≤4) o constancia (5-7), avisando además al coach si reporta dolor.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada 7 días', position: { x: 460, y: 40 }, config: { everyDays: 7 } },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Check-in esta semana?', position: { x: 460, y: 170 }, config: { days: 7 } },
      { id: 'rc', type: 'action', key: 'action.request_checkin', label: 'Pedir check-in', position: { x: 180, y: 300 }, config: { template: 'Check-in Semanal' } },
      { id: 'rpush', type: 'action', key: 'action.send_push', label: 'Recordatorio push', position: { x: 180, y: 430 }, config: { title: 'Tu check-in semanal te espera', body: '2 minutos para que pueda ajustar tu plan. ¡Vamos!', url: '/' } },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer check-in', position: { x: 740, y: 300 }, config: {} },
      { id: 'if1', type: 'condition', key: 'flow.if', label: '¿Adherencia ≥ 8/10?', position: { x: 740, y: 430 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '8' } },
      { id: 'tptg', type: 'action', key: 'action.tag_client', label: 'Listo para progresión', position: { x: 540, y: 560 }, config: { tag: 'listo-progresion', action: 'add' } },
      { id: 'tpnc', type: 'action', key: 'action.notify_coach', label: 'Avisar progresión', position: { x: 540, y: 690 }, config: { title: '⬆️ {Client Name} listo para progresión', description: 'Adherencia ≥ 8/10 esta semana. Revisa subirle el plan al siguiente nivel para mantener el reto.' } },
      { id: 'tpm', type: 'action', key: 'action.send_message', label: 'Felicitar', position: { x: 540, y: 820 }, config: { message: '{First Name}, semana de {{latestCheckin.nutrition_adherence_score}}/10 🔥 Vas listo para subir de nivel. Tu coach revisará tu plan para el próximo reto.' } },
      { id: 'if2', type: 'condition', key: 'flow.if', label: '¿Adherencia ≤ 4/10?', position: { x: 940, y: 560 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '<', value: '5' } },
      { id: 'stnc', type: 'action', key: 'action.notify_coach', label: 'Necesita apoyo', position: { x: 780, y: 690 }, config: { title: '⚠️ {Client Name} necesita apoyo', description: 'Adherencia de 4/10 o menos esta semana. Contacto cercano recomendado antes de que se desenganche.' } },
      { id: 'sttg', type: 'action', key: 'action.tag_client', label: 'Seguimiento cercano', position: { x: 780, y: 820 }, config: { tag: 'seguimiento-cercano', action: 'add' } },
      { id: 'stm', type: 'action', key: 'action.send_message', label: 'Mensaje de apoyo', position: { x: 780, y: 950 }, config: { message: '{First Name}, esta semana ha sido difícil y no pasa nada. Lo importante es seguir. Cuéntame qué te ha costado más y lo ajustamos — estoy contigo.' } },
      { id: 'midm', type: 'action', key: 'action.send_message', label: 'Mensaje de constancia', position: { x: 1140, y: 690 }, config: { message: 'Buen trabajo manteniendo el ritmo, {First Name} 💪 Constancia semana a semana — así se construyen los resultados.' } },
      { id: 'midif', type: 'condition', key: 'flow.if', label: '¿Reporta dolor?', position: { x: 1140, y: 820 }, config: { field: 'latestCheckin.painLevel', operator: '!=', value: 'No issues' } },
      { id: 'midnc', type: 'action', key: 'action.notify_coach', label: 'Aviso de molestias', position: { x: 1140, y: 950 }, config: { title: '{Client Name} reporta molestias', description: 'Molestia marcada en el check-in. Revísalo antes del próximo entreno.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'hc' },
      { id: 'e2', source: 'hc', target: 'rc', sourceHandle: 'false' },
      { id: 'e3', source: 'rc', target: 'rpush' },
      { id: 'e4', source: 'hc', target: 'gl', sourceHandle: 'true' },
      { id: 'e5', source: 'gl', target: 'if1' },
      { id: 'e6', source: 'if1', target: 'tptg', sourceHandle: 'true' },
      { id: 'e7', source: 'tptg', target: 'tpnc' },
      { id: 'e8', source: 'tpnc', target: 'tpm' },
      { id: 'e9', source: 'if1', target: 'if2', sourceHandle: 'false' },
      { id: 'e10', source: 'if2', target: 'stnc', sourceHandle: 'true' },
      { id: 'e11', source: 'stnc', target: 'sttg' },
      { id: 'e12', source: 'sttg', target: 'stm' },
      { id: 'e13', source: 'if2', target: 'midm', sourceHandle: 'false' },
      { id: 'e14', source: 'midm', target: 'midif' },
      { id: 'e15', source: 'midif', target: 'midnc', sourceHandle: 'true' },
    ],
  },

  // ── 12. Customer Journey: onboarding guiado de 14 días ─────────────────
  {
    name: 'Customer Journey: onboarding guiado de 14 días',
    description: 'Orquesta los primeros 14 días del cliente con puertas de verificación: plan asignado (día 1), primer check-in (día 3), revisión intermedia con lectura de adherencia (día 7) y graduación vs. re-enganche (día 14).',
    triggerKey: 'trigger.new_client',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.new_client', label: 'Nuevo cliente', position: { x: 460, y: 40 }, config: {} },
      { id: 'm0', type: 'action', key: 'action.send_message', label: 'Bienvenida', position: { x: 460, y: 160 }, config: { message: '¡Hola {First Name}! Soy {Coach Name} 🙌 Bienvenido/a. Estos primeros 14 días te iré guiando paso a paso para que arranques con buen pie.' } },
      { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Día 1', position: { x: 460, y: 280 }, config: { amount: 1, unit: 'days' } },
      { id: 'hp', type: 'condition', key: 'flow.has_plan', label: '¿Tiene plan?', position: { x: 460, y: 400 }, config: { planKind: 'any' } },
      { id: 'hpno', type: 'action', key: 'action.notify_coach', label: 'Asignar plan', position: { x: 220, y: 520 }, config: { title: 'Asignar plan a {Client Name}', description: 'Cliente con 1 día de antigüedad y sin plan. Asígnalo para no frenar su arranque.' } },
      { id: 'hpyes', type: 'action', key: 'action.send_message', label: 'Plan listo', position: { x: 700, y: 520 }, config: { message: '{First Name}, tu plan ya está en la app 🎯 Tómate hoy para revisarlo con calma.' } },
      { id: 'd2', type: 'flow', key: 'flow.delay', label: 'Hasta día 3', position: { x: 460, y: 640 }, config: { amount: 2, unit: 'days' } },
      { id: 'push1', type: 'action', key: 'action.send_push', label: 'Push día 3', position: { x: 460, y: 760 }, config: { title: '¿Cómo van tus primeros días?', body: 'Recuerda registrar tus comidas y entrenos en la app.', url: '/' } },
      { id: 'hc1', type: 'condition', key: 'flow.has_checkin', label: '¿Check-in día 3?', position: { x: 460, y: 880 }, config: { days: 3 } },
      { id: 'hc1no', type: 'action', key: 'action.request_checkin', label: 'Pedir check-in', position: { x: 240, y: 1000 }, config: { template: 'Check-in Semanal' } },
      { id: 'd3', type: 'flow', key: 'flow.delay', label: 'Hasta día 7', position: { x: 460, y: 1120 }, config: { amount: 4, unit: 'days' } },
      { id: 'hc7', type: 'condition', key: 'flow.has_checkin', label: '¿Datos en día 7?', position: { x: 460, y: 1240 }, config: { days: 5 } },
      { id: 'd7nom', type: 'action', key: 'action.send_message', label: 'Reenganche día 7', position: { x: 240, y: 1360 }, config: { message: '{First Name}, llevamos una semana juntos. Aún no he visto tu primer check-in — cuéntame cómo vas, es clave para ayudarte 🙏' } },
      { id: 'd7nonc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 240, y: 1480 }, config: { title: '{Client Name}: 7 días sin check-in', description: 'Primera semana sin datos. Un mensaje personal puede reengancharlo.' } },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer check-in', position: { x: 700, y: 1360 }, config: {} },
      { id: 'd7if', type: 'condition', key: 'flow.if', label: '¿Adherencia ≥ 6/10?', position: { x: 700, y: 1480 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '6' } },
      { id: 'd7ok', type: 'action', key: 'action.send_message', label: 'Buena primera semana', position: { x: 560, y: 1600 }, config: { message: '¡Primera semana sólida, {First Name}! 💪 Vas cogiendo el ritmo. Seguimos.' } },
      { id: 'd7low', type: 'action', key: 'action.send_message', label: 'Afinar', position: { x: 840, y: 1600 }, config: { message: '{First Name}, primera semana completada — ¡eso ya es un logro! Vamos a afinar un par de cosas para que la próxima te resulte más fácil.' } },
      { id: 'd4', type: 'flow', key: 'flow.delay', label: 'Hasta día 14', position: { x: 560, y: 1720 }, config: { amount: 7, unit: 'days' } },
      { id: 'hc14', type: 'condition', key: 'flow.has_checkin', label: '¿Activo en día 14?', position: { x: 560, y: 1840 }, config: { days: 7 } },
      { id: 'gradm', type: 'action', key: 'action.send_message', label: 'Graduación', position: { x: 380, y: 1960 }, config: { message: '🎓 {First Name}, ¡has completado tus primeros 14 días! Ya tienes el hábito en marcha. A partir de aquí, a por los resultados 🚀' } },
      { id: 'gradtg', type: 'action', key: 'action.tag_client', label: 'Etiquetar graduado', position: { x: 380, y: 2080 }, config: { tag: 'onboarding-graduado', action: 'add' } },
      { id: 'risknc', type: 'action', key: 'action.notify_coach', label: 'Re-enganche', position: { x: 780, y: 1960 }, config: { title: '{Client Name} termina el onboarding en riesgo', description: '14 días cumplidos pero con poca actividad. Agenda una llamada de re-enganche.' } },
      { id: 'riskap', type: 'action', key: 'action.schedule_appointment', label: 'Cita de seguimiento', position: { x: 780, y: 2080 }, config: { title: 'Llamada de seguimiento — {Client Name}', type: 'Video Call', date: 'today+2d', time: '11:00', duration: '30m' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'm0' },
      { id: 'e2', source: 'm0', target: 'd1' },
      { id: 'e3', source: 'd1', target: 'hp' },
      { id: 'e4', source: 'hp', target: 'hpno', sourceHandle: 'false' },
      { id: 'e5', source: 'hp', target: 'hpyes', sourceHandle: 'true' },
      { id: 'e6', source: 'hpno', target: 'd2' },
      { id: 'e7', source: 'hpyes', target: 'd2' },
      { id: 'e8', source: 'd2', target: 'push1' },
      { id: 'e9', source: 'push1', target: 'hc1' },
      { id: 'e10', source: 'hc1', target: 'hc1no', sourceHandle: 'false' },
      { id: 'e11', source: 'hc1no', target: 'd3' },
      { id: 'e12', source: 'hc1', target: 'd3', sourceHandle: 'true' },
      { id: 'e13', source: 'd3', target: 'hc7' },
      { id: 'e14', source: 'hc7', target: 'd7nom', sourceHandle: 'false' },
      { id: 'e15', source: 'd7nom', target: 'd7nonc' },
      { id: 'e16', source: 'd7nonc', target: 'd4' },
      { id: 'e17', source: 'hc7', target: 'gl', sourceHandle: 'true' },
      { id: 'e18', source: 'gl', target: 'd7if' },
      { id: 'e19', source: 'd7if', target: 'd7ok', sourceHandle: 'true' },
      { id: 'e20', source: 'd7ok', target: 'd4' },
      { id: 'e21', source: 'd7if', target: 'd7low', sourceHandle: 'false' },
      { id: 'e22', source: 'd7low', target: 'd4' },
      { id: 'e23', source: 'd4', target: 'hc14' },
      { id: 'e24', source: 'hc14', target: 'gradm', sourceHandle: 'true' },
      { id: 'e25', source: 'gradm', target: 'gradtg' },
      { id: 'e26', source: 'hc14', target: 'risknc', sourceHandle: 'false' },
      { id: 'e27', source: 'risknc', target: 'riskap' },
    ],
  },

  // ── 13. Churn Radar: detección de riesgo de abandono ───────────────────
  {
    name: 'Churn Radar: detección de riesgo de abandono',
    description: 'Cada día clasifica el riesgo de abandono por los días sin check-in (7 / 14 / 21) y aplica una intervención proporcional — push, mensaje, llamada — protegida por etiquetas de estado para no repetirla. Cuando el cliente vuelve a estar activo, limpia las etiquetas.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada día', position: { x: 460, y: 40 }, config: { everyDays: 1 } },
      { id: 'dsr', type: 'condition', key: 'flow.days_since', label: '¿21+ días sin check-in?', position: { x: 460, y: 170 }, config: { event: 'last_check_in', operator: '>=', days: 21 } },
      { id: 'dso', type: 'condition', key: 'flow.days_since', label: '¿14+ días?', position: { x: 660, y: 300 }, config: { event: 'last_check_in', operator: '>=', days: 14 } },
      { id: 'dsy', type: 'condition', key: 'flow.days_since', label: '¿7+ días?', position: { x: 860, y: 430 }, config: { event: 'last_check_in', operator: '>=', days: 7 } },
      { id: 'stop', type: 'flow', key: 'flow.stop', label: 'Ya gestionado / activo', position: { x: 1120, y: 560 }, config: {} },
      { id: 'redht', type: 'condition', key: 'flow.has_tag', label: '¿Ya en nivel crítico?', position: { x: 240, y: 300 }, config: { tag: 'churn-critico' } },
      { id: 'redtg', type: 'action', key: 'action.tag_client', label: 'Marcar crítico', position: { x: 240, y: 430 }, config: { tag: 'churn-critico', action: 'add' } },
      { id: 'redtask', type: 'action', key: 'action.create_task', label: 'Tarea de llamada', position: { x: 240, y: 560 }, config: { title: '🚨 Riesgo crítico de baja — {Client Name}', type: 'Call', priority: 'high' } },
      { id: 'redm', type: 'action', key: 'action.send_message', label: 'Último intento', position: { x: 240, y: 690 }, config: { message: '{First Name}, te escribo de corazón: hace tres semanas que no sé de ti y no quiero que tires lo que has conseguido. Sigo aquí para ayudarte. ¿Te llamo?' } },
      { id: 'rednc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 240, y: 820 }, config: { title: '🚨 {Client Name} en riesgo crítico de abandono', description: '21+ días sin check-in. Llamada personal urgente — decide si recuperar o cerrar el caso.' } },
      { id: 'orht', type: 'condition', key: 'flow.has_tag', label: '¿Ya en nivel naranja?', position: { x: 460, y: 430 }, config: { tag: 'churn-naranja' } },
      { id: 'ortg', type: 'action', key: 'action.tag_client', label: 'Marcar naranja', position: { x: 460, y: 560 }, config: { tag: 'churn-naranja', action: 'add' } },
      { id: 'orm', type: 'action', key: 'action.send_message', label: 'Mensaje personal', position: { x: 460, y: 690 }, config: { message: 'Hola {First Name}, hace dos semanas que no tengo noticias tuyas y me preocupa. ¿Va todo bien? Cuéntame y retomamos a tu ritmo, sin presión.' } },
      { id: 'ornc', type: 'action', key: 'action.notify_coach', label: 'Avisar al coach', position: { x: 460, y: 820 }, config: { title: '🟠 {Client Name}: 14 días sin check-in', description: 'Riesgo medio de abandono. Buen momento para un contacto personal del coach.' } },
      { id: 'yeht', type: 'condition', key: 'flow.has_tag', label: '¿Ya en nivel amarillo?', position: { x: 660, y: 560 }, config: { tag: 'churn-amarillo' } },
      { id: 'yetg', type: 'action', key: 'action.tag_client', label: 'Marcar amarillo', position: { x: 660, y: 690 }, config: { tag: 'churn-amarillo', action: 'add' } },
      { id: 'yepush', type: 'action', key: 'action.send_push', label: 'Push suave', position: { x: 660, y: 820 }, config: { title: 'Te echamos de menos 👀', body: 'Hace una semana que no te vemos. ¡Vuelve cuando quieras, seguimos aquí!', url: '/' } },
      { id: 've1', type: 'action', key: 'action.tag_client', label: 'Limpiar amarillo', position: { x: 940, y: 690 }, config: { tag: 'churn-amarillo', action: 'remove' } },
      { id: 've2', type: 'action', key: 'action.tag_client', label: 'Limpiar naranja', position: { x: 940, y: 820 }, config: { tag: 'churn-naranja', action: 'remove' } },
      { id: 've3', type: 'action', key: 'action.tag_client', label: 'Limpiar crítico', position: { x: 940, y: 950 }, config: { tag: 'churn-critico', action: 'remove' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'dsr' },
      { id: 'e2', source: 'dsr', target: 'redht', sourceHandle: 'true' },
      { id: 'e3', source: 'dsr', target: 'dso', sourceHandle: 'false' },
      { id: 'e4', source: 'redht', target: 'stop', sourceHandle: 'true' },
      { id: 'e5', source: 'redht', target: 'redtg', sourceHandle: 'false' },
      { id: 'e6', source: 'redtg', target: 'redtask' },
      { id: 'e7', source: 'redtask', target: 'redm' },
      { id: 'e8', source: 'redm', target: 'rednc' },
      { id: 'e9', source: 'dso', target: 'orht', sourceHandle: 'true' },
      { id: 'e10', source: 'dso', target: 'dsy', sourceHandle: 'false' },
      { id: 'e11', source: 'orht', target: 'stop', sourceHandle: 'true' },
      { id: 'e12', source: 'orht', target: 'ortg', sourceHandle: 'false' },
      { id: 'e13', source: 'ortg', target: 'orm' },
      { id: 'e14', source: 'orm', target: 'ornc' },
      { id: 'e15', source: 'dsy', target: 'yeht', sourceHandle: 'true' },
      { id: 'e16', source: 'dsy', target: 've1', sourceHandle: 'false' },
      { id: 'e17', source: 'yeht', target: 'stop', sourceHandle: 'true' },
      { id: 'e18', source: 'yeht', target: 'yetg', sourceHandle: 'false' },
      { id: 'e19', source: 'yetg', target: 'yepush' },
      { id: 'e20', source: 've1', target: 've2' },
      { id: 'e21', source: 've2', target: 've3' },
    ],
  },

  // ── 14. Quarterly Review: retención y crecimiento ──────────────────────
  {
    name: 'Quarterly Review: retención y crecimiento',
    description: 'Cada 90 días revisa a los clientes con recorrido: si están desconectados agenda una revisión estratégica; si están activos y con adherencia alta los marca como promotores y te crea la tarea de pedir testimonio y referidos.',
    triggerKey: 'trigger.schedule',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.schedule', label: 'Cada 90 días', position: { x: 460, y: 40 }, config: { everyDays: 90 } },
      { id: 'ds', type: 'condition', key: 'flow.days_since', label: '¿90+ días de cliente?', position: { x: 460, y: 170 }, config: { event: 'created_at', operator: '>=', days: 90 } },
      { id: 'young', type: 'flow', key: 'flow.stop', label: 'Cliente reciente', position: { x: 220, y: 300 }, config: {} },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer check-in', position: { x: 700, y: 300 }, config: {} },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Activo (30 días)?', position: { x: 700, y: 430 }, config: { days: 30 } },
      { id: 'disnc', type: 'action', key: 'action.notify_coach', label: 'Revisión estratégica', position: { x: 460, y: 560 }, config: { title: 'Revisión trimestral: {Client Name} desconectado', description: 'Cliente con 90+ días pero sin check-in en el último mes. Prepara una revisión estratégica para recuperarlo.' } },
      { id: 'disap', type: 'action', key: 'action.schedule_appointment', label: 'Agendar revisión', position: { x: 460, y: 690 }, config: { title: 'Revisión estratégica — {Client Name}', type: 'Video Call', date: 'today+5d', time: '12:00', duration: '45m' } },
      { id: 'dism', type: 'action', key: 'action.send_message', label: 'Avisar al cliente', position: { x: 460, y: 820 }, config: { message: '{First Name}, llevamos un trimestre juntos y quiero asegurarme de que vamos por buen camino. He agendado una revisión para replantear lo que haga falta 💪' } },
      { id: 'if1', type: 'condition', key: 'flow.if', label: '¿Adherencia ≥ 8/10?', position: { x: 940, y: 560 }, config: { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '8' } },
      { id: 'wintg', type: 'action', key: 'action.tag_client', label: 'Marcar promotor', position: { x: 840, y: 690 }, config: { tag: 'promoter', action: 'add' } },
      { id: 'winm', type: 'action', key: 'action.send_message', label: 'Pedir testimonio', position: { x: 840, y: 820 }, config: { message: '{First Name}, ¡un trimestre espectacular! 🌟 Tu constancia habla por sí sola. Si te apetece, me encantaría que compartieras tu experiencia — y si conoces a alguien a quien pueda ayudar, será bienvenido 🙌' } },
      { id: 'winnc', type: 'action', key: 'action.notify_coach', label: 'Pedir referido', position: { x: 840, y: 950 }, config: { title: '⭐ {Client Name}: pedir testimonio / referido', description: 'Cliente de 90+ días con adherencia alta. Momento ideal para pedirle una reseña y referidos.' } },
      { id: 'midm', type: 'action', key: 'action.send_message', label: 'Mensaje de seguimiento', position: { x: 1140, y: 690 }, config: { message: '{First Name}, cerramos un trimestre juntos 🙌 Vamos bien y aún tenemos margen. Sigamos afinando para que el próximo sea aún mejor.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'ds' },
      { id: 'e2', source: 'ds', target: 'young', sourceHandle: 'false' },
      { id: 'e3', source: 'ds', target: 'gl', sourceHandle: 'true' },
      { id: 'e4', source: 'gl', target: 'hc' },
      { id: 'e5', source: 'hc', target: 'disnc', sourceHandle: 'false' },
      { id: 'e6', source: 'disnc', target: 'disap' },
      { id: 'e7', source: 'disap', target: 'dism' },
      { id: 'e8', source: 'hc', target: 'if1', sourceHandle: 'true' },
      { id: 'e9', source: 'if1', target: 'wintg', sourceHandle: 'true' },
      { id: 'e10', source: 'wintg', target: 'winm' },
      { id: 'e11', source: 'winm', target: 'winnc' },
      { id: 'e12', source: 'if1', target: 'midm', sourceHandle: 'false' },
    ],
  },

  // ── 15. Smart Inbox: triaje de mensajes entrantes ──────────────────────
  {
    name: 'Smart Inbox: triaje de mensajes entrantes',
    description: 'Cuando un cliente escribe, clasifica el mensaje por contexto: si tiene un check-in muy reciente lo marca como prioritario para el coach; si reaparece tras 2+ semanas inactivo, crea tarea de reconexión y responde con calidez; si está al día, crea una tarea normal de respuesta.',
    triggerKey: 'trigger.message_received',
    nodes: [
      { id: 't', type: 'trigger', key: 'trigger.message_received', label: 'Cliente escribe', position: { x: 460, y: 40 }, config: {} },
      { id: 'gl', type: 'data', key: 'data.get_latest_checkin', label: 'Leer check-in', position: { x: 460, y: 170 }, config: {} },
      { id: 'hc', type: 'condition', key: 'flow.has_checkin', label: '¿Check-in muy reciente?', position: { x: 460, y: 300 }, config: { days: 2 } },
      { id: 'urgnc', type: 'action', key: 'action.notify_coach', label: 'Marcar prioritario', position: { x: 240, y: 430 }, config: { title: '💬 {Client Name} escribe tras su check-in', description: 'El cliente ha enviado un mensaje y tiene un check-in reciente. Probablemente espera feedback — prioriza la respuesta.' } },
      { id: 'urgtg', type: 'action', key: 'action.tag_client', label: 'Etiquetar prioritario', position: { x: 240, y: 560 }, config: { tag: 'mensaje-prioritario', action: 'add' } },
      { id: 'ds', type: 'condition', key: 'flow.days_since', label: '¿Inactivo 14+ días?', position: { x: 700, y: 430 }, config: { event: 'last_check_in', operator: '>=', days: 14 } },
      { id: 'renc', type: 'action', key: 'action.notify_coach', label: 'Tarea de reconexión', position: { x: 520, y: 560 }, config: { title: '🔄 {Client Name} reaparece', description: 'Cliente sin check-in en 2+ semanas que vuelve a escribir. Aprovecha para reengancharlo con calidez.' } },
      { id: 'rem', type: 'action', key: 'action.send_message', label: 'Respuesta cálida', position: { x: 520, y: 690 }, config: { message: '¡Qué alegría leerte, {First Name}! 🙌 Cuéntame cómo estás y retomamos justo donde lo dejamos, sin agobios.' } },
      { id: 'nmtask', type: 'action', key: 'action.create_task', label: 'Tarea de respuesta', position: { x: 880, y: 560 }, config: { title: 'Responder a {Client Name}', type: 'Admin', priority: 'medium' } },
      { id: 'nmm', type: 'action', key: 'action.send_message', label: 'Acuse de recibo', position: { x: 880, y: 690 }, config: { message: '¡Recibido, {First Name}! 👍 Te respondo enseguida.' } },
    ],
    edges: [
      { id: 'e1', source: 't', target: 'gl' },
      { id: 'e2', source: 'gl', target: 'hc' },
      { id: 'e3', source: 'hc', target: 'urgnc', sourceHandle: 'true' },
      { id: 'e4', source: 'urgnc', target: 'urgtg' },
      { id: 'e5', source: 'hc', target: 'ds', sourceHandle: 'false' },
      { id: 'e6', source: 'ds', target: 'renc', sourceHandle: 'true' },
      { id: 'e7', source: 'renc', target: 'rem' },
      { id: 'e8', source: 'ds', target: 'nmtask', sourceHandle: 'false' },
      { id: 'e9', source: 'nmtask', target: 'nmm' },
    ],
  },
];

/**
 * Siembra los 10 workflows avanzados por defecto para un manager.
 * Idempotente: salta los que ya existan (por nombre). Todos quedan
 * DESACTIVADOS — el manager los activa y edita cuando quiera.
 */
export async function seedManagerWorkflows(managerId: string): Promise<void> {
  try {
    const { data: existing } = await supabaseAdmin
      .from('workflow_definitions')
      .select('name')
      .eq('manager_id', managerId);
    const have = new Set((existing || []).map((r: { name: string }) => r.name));

    for (const wf of DEFAULT_WORKFLOWS) {
      if (have.has(wf.name)) continue;

      const { data: def, error: defErr } = await supabaseAdmin
        .from('workflow_definitions')
        .insert({ manager_id: managerId, name: wf.name, description: wf.description, enabled: false })
        .select('id')
        .single();
      if (defErr || !def) { logger.error('seedManagerWorkflows.def_insert_failed', { err: defErr?.message }); continue; }

      const { data: ver, error: verErr } = await supabaseAdmin
        .from('workflow_versions')
        .insert({
          workflow_id: def.id,
          version_number: 1,
          status: 'published',
          nodes: wf.nodes,
          edges: wf.edges,
          trigger: { type: wf.triggerKey },
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (verErr || !ver) { logger.error('seedManagerWorkflows.version_insert_failed', { err: verErr?.message }); continue; }

      await supabaseAdmin
        .from('workflow_definitions')
        .update({ current_version_id: ver.id })
        .eq('id', def.id);
    }
  } catch (err) {
    logger.error('seedManagerWorkflows.failed', { err: err instanceof Error ? err.message : String(err) });
  }
}
