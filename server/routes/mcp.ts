// Servidor MCP (Model Context Protocol) sobre HTTP para el SaaS del manager.
// Un cliente MCP (Claude, etc.) se conecta a  POST /api/mcp  con la cabecera
//   Authorization: Bearer nfm_...   (una clave API personal del manager)
// y obtiene herramientas para operar su cuenta (clientes, tareas, mensajes,
// cobros, analítica), respetando los scopes de la clave.
//
// Transporte: JSON-RPC 2.0. Respondemos application/json a cada request; las
// notificaciones (sin id) devuelven 202 sin cuerpo.
import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { resolveApiKey } from '../lib/apiKeys.js';

const router = Router();
const PROTOCOL_VERSION = '2024-11-05';
const money = (cents: number, cur = 'eur') => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: (cur || 'eur').toUpperCase() });

// ── Definición de herramientas ─────────────────────────────────────────────
interface Tool {
  name: string; description: string; scope: string;
  inputSchema: any;
  handler: (managerId: string, args: any) => Promise<any>;
}

const TOOLS: Tool[] = [
  {
    name: 'list_clients', scope: 'clients',
    description: 'Lista los clientes del manager (id, nombre, email, estado).',
    inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'Máximo (por defecto 100)' } } },
    handler: async (managerId, args) => {
      const limit = Math.min(500, Math.max(1, Number(args?.limit) || 100));
      const { data: users } = await supabaseAdmin.from('users').select('id, email, status, created_at').eq('manager_id', managerId).eq('role', 'CLIENT').order('created_at', { ascending: false }).limit(limit);
      const ids = (users || []).map((u: any) => u.id);
      const nameById: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabaseAdmin.from('profiles').select('user_id, full_name').in('user_id', ids);
        for (const p of profs || []) nameById[p.user_id] = p.full_name;
      }
      return (users || []).map((u: any) => ({ id: u.id, name: nameById[u.id] || null, email: u.email, status: u.status, created_at: u.created_at }));
    },
  },
  {
    name: 'get_client', scope: 'clients',
    description: 'Detalle de un cliente: perfil, objetivo, peso y último check-in.',
    inputSchema: { type: 'object', required: ['client_id'], properties: { client_id: { type: 'string' } } },
    handler: async (managerId, args) => {
      const cid = String(args?.client_id || '');
      const { data: u } = await supabaseAdmin.from('users').select('id, email, manager_id, created_at, status, profiles(full_name), clients_profiles(weight, goal, goal_weight, height, notes)').eq('id', cid).eq('manager_id', managerId).maybeSingle();
      if (!u) throw new Error('Cliente no encontrado o no pertenece a este manager.');
      const prof = Array.isArray((u as any).profiles) ? (u as any).profiles[0] : (u as any).profiles;
      const cp = Array.isArray((u as any).clients_profiles) ? (u as any).clients_profiles[0] : (u as any).clients_profiles;
      const { data: ci } = await supabaseAdmin.from('check_ins').select('date, created_at').eq('client_id', cid).order('created_at', { ascending: false }).limit(1).maybeSingle();
      return { id: u.id, name: prof?.full_name || null, email: u.email, status: (u as any).status, ...(cp || {}), last_check_in: ci?.date || null };
    },
  },
  {
    name: 'list_tasks', scope: 'tasks',
    description: 'Lista tareas/citas del manager. Filtro opcional por estado.',
    inputSchema: { type: 'object', properties: { status: { type: 'string' }, limit: { type: 'number' } } },
    handler: async (managerId, args) => {
      let q = supabaseAdmin.from('tasks').select('id, title, type, date, time, status, priority, client_id').eq('manager_id', managerId).order('date', { ascending: false });
      if (typeof args?.status === 'string') q = q.eq('status', args.status);
      const { data } = await q.limit(Math.min(200, Math.max(1, Number(args?.limit) || 50)));
      return data || [];
    },
  },
  {
    name: 'create_task', scope: 'tasks',
    description: 'Crea una tarea o cita. date en YYYY-MM-DD (por defecto hoy).',
    inputSchema: { type: 'object', required: ['title'], properties: {
      title: { type: 'string' }, description: { type: 'string' }, client_id: { type: 'string' },
      type: { type: 'string', enum: ['Admin', 'Check-in', 'Call', 'Training', 'Nutrition', 'Video Call', 'In-Person'] },
      date: { type: 'string' }, time: { type: 'string' }, priority: { type: 'string', enum: ['low', 'medium', 'high'] },
    } },
    handler: async (managerId, args) => {
      const { data, error } = await supabaseAdmin.from('tasks').insert({
        title: String(args.title).slice(0, 200), description: args.description || null,
        type: args.type || 'Admin', date: args.date || new Date().toISOString().split('T')[0],
        time: args.time || null, client_id: args.client_id || null, status: 'pending',
        priority: ['low', 'medium', 'high'].includes(args.priority) ? args.priority : 'medium',
        manager_id: managerId, created_at: new Date().toISOString(),
      }).select('id, title, date, time, type').single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  {
    name: 'send_message', scope: 'messages',
    description: 'Envía un mensaje de chat a un cliente del manager.',
    inputSchema: { type: 'object', required: ['client_id', 'content'], properties: { client_id: { type: 'string' }, content: { type: 'string' } } },
    handler: async (managerId, args) => {
      const cid = String(args?.client_id || '');
      const { data: owned } = await supabaseAdmin.from('users').select('id').eq('id', cid).eq('manager_id', managerId).maybeSingle();
      if (!owned) throw new Error('El cliente no pertenece a este manager.');
      const content = String(args?.content || '').slice(0, 4000);
      if (!content) throw new Error('content vacío.');
      const { error } = await supabaseAdmin.from('messages').insert({ sender_id: managerId, receiver_id: cid, content });
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  },
  {
    name: 'list_subscription_plans', scope: 'billing',
    description: 'Lista los planes de cobro (billing_plans) del manager.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (managerId) => {
      const { data } = await supabaseAdmin.from('billing_plans').select('id, name, kind, amount_cents, currency, interval, active').eq('manager_id', managerId).order('created_at', { ascending: false });
      return (data || []).map((p: any) => ({ ...p, price: money(p.amount_cents, p.currency) }));
    },
  },
  {
    name: 'list_subscriptions', scope: 'billing',
    description: 'Lista los cobros/suscripciones de clientes. Filtro opcional por estado.',
    inputSchema: { type: 'object', properties: { status: { type: 'string' }, limit: { type: 'number' } } },
    handler: async (managerId, args) => {
      let q = supabaseAdmin.from('client_billing').select('id, client_id, kind, description, amount_cents, currency, interval, status, current_period_end').eq('manager_id', managerId).order('created_at', { ascending: false });
      if (typeof args?.status === 'string') q = q.eq('status', args.status);
      const { data } = await q.limit(Math.min(200, Math.max(1, Number(args?.limit) || 100)));
      return (data || []).map((r: any) => ({ ...r, amount: money(r.amount_cents, r.currency) }));
    },
  },
  {
    name: 'create_charge', scope: 'billing',
    description: 'Crea un cobro (recurring|one_time) para un cliente y le envía el enlace de pago.',
    inputSchema: { type: 'object', required: ['client_id', 'amount'], properties: {
      client_id: { type: 'string' }, amount: { type: 'number', description: 'Importe en unidades (p.ej. 49.90)' },
      kind: { type: 'string', enum: ['recurring', 'one_time'] }, interval: { type: 'string', enum: ['month', 'year', 'week', 'day'] },
      currency: { type: 'string' }, description: { type: 'string' },
    } },
    handler: async (managerId, args) => {
      const { wfCreateCharge } = await import('./client-billing.js');
      const r = await wfCreateCharge(managerId, String(args?.client_id || ''), {
        kind: args?.kind === 'one_time' ? 'one_time' : 'recurring', amount: Number(args?.amount),
        currency: args?.currency, interval: args?.interval, description: args?.description,
      });
      if (r?.error) throw new Error(String(r.error));
      return r;
    },
  },
  {
    name: 'billing_overview', scope: 'analytics',
    description: 'Resumen de facturación: MRR, suscripciones activas, canceladas y tasa de cancelación.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (managerId) => {
      const { data } = await supabaseAdmin.from('client_billing').select('kind, status, amount_cents, currency, interval').eq('manager_id', managerId);
      const rows = data || [];
      let mrr = 0, active = 0, canceled = 0;
      const mrrByCur: Record<string, number> = {};
      for (const r of rows as any[]) {
        if (r.kind === 'recurring' && (r.status === 'active' || r.status === 'trialing')) {
          active++;
          const monthly = r.interval === 'year' ? Math.round(r.amount_cents / 12) : r.amount_cents;
          mrr += monthly; const c = (r.currency || 'eur').toLowerCase(); mrrByCur[c] = (mrrByCur[c] || 0) + monthly;
        }
        if (r.kind === 'recurring' && r.status === 'canceled') canceled++;
      }
      const churn = active + canceled > 0 ? Math.round((canceled / (active + canceled)) * 1000) / 10 : 0;
      return { mrr: money(mrr), mrr_by_currency: Object.fromEntries(Object.entries(mrrByCur).map(([c, v]) => [c, money(v, c)])), active_subscriptions: active, canceled_subscriptions: canceled, churn_rate_pct: churn };
    },
  },
];

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

// ── Endpoint JSON-RPC ──────────────────────────────────────────────────────
router.post('/', async (req: any, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const resolved = token ? await resolveApiKey(token) : null;
  if (!resolved) return res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized: se requiere una clave API válida (Bearer nfm_...).' } });
  const scopes: string[] = resolved.scopes || [];
  const managerId = resolved.managerId;
  const canUse = (scope: string) => scopes.includes('full') || scopes.includes(scope);

  const handleOne = async (msg: any): Promise<any | null> => {
    const id = msg?.id ?? null;
    const isNotification = msg?.id === undefined;
    const reply = (result: any) => ({ jsonrpc: '2.0', id, result });
    const fail = (code: number, message: string) => ({ jsonrpc: '2.0', id, error: { code, message } });
    try {
      switch (msg?.method) {
        case 'initialize':
          return reply({ protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {} }, serverInfo: { name: 'nutrifit-manager', version: '1.0.0' } });
        case 'notifications/initialized':
        case 'notifications/cancelled':
          return null; // notificación → sin respuesta
        case 'ping':
          return reply({});
        case 'tools/list':
          return reply({ tools: TOOLS.filter((t) => canUse(t.scope)).map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
        case 'tools/call': {
          const name = msg?.params?.name;
          const tool = TOOL_BY_NAME.get(name);
          if (!tool) return fail(-32602, `Herramienta desconocida: ${name}`);
          if (!canUse(tool.scope)) return reply({ isError: true, content: [{ type: 'text', text: `Tu clave API no tiene el scope "${tool.scope}" necesario para "${name}".` }] });
          try {
            const out = await tool.handler(managerId, msg?.params?.arguments || {});
            return reply({ content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] });
          } catch (e: any) {
            return reply({ isError: true, content: [{ type: 'text', text: `Error: ${e?.message || String(e)}` }] });
          }
        }
        default:
          if (isNotification) return null;
          return fail(-32601, `Método no soportado: ${msg?.method}`);
      }
    } catch (e: any) {
      return fail(-32603, e?.message || 'Internal error');
    }
  };

  try {
    const body = req.body;
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map(handleOne))).filter(Boolean);
      if (out.length === 0) return res.status(202).end();
      return res.json(out);
    }
    const out = await handleOne(body);
    if (out === null) return res.status(202).end();
    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({ jsonrpc: '2.0', id: null, error: { code: -32603, message: e?.message || 'Internal error' } });
  }
});

// GET informativo (probe + capacidades para la UI). No expone nada sensible:
// solo nombres/descripciones de las herramientas disponibles.
router.get('/', (_req, res) => res.json({
  name: 'nutrifit-manager',
  transport: 'http',
  protocolVersion: PROTOCOL_VERSION,
  toolCount: TOOLS.length,
  tools: TOOLS.map((t) => ({ name: t.name, description: t.description, scope: t.scope })),
}));

export default router;
