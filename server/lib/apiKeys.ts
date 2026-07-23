// Claves API personales del manager: generación, hash y resolución. Dan acceso
// programático (REST + MCP) a la cuenta del manager, con scopes opcionales.
//
// Seguridad: la clave en claro SOLO se muestra una vez al crearla; en la BD se
// guarda un hash SHA-256. La comparación en cada request es por hash (indexado).
import crypto from 'crypto';
import { supabaseAdmin } from '../db/index.js';

export const API_KEY_PREFIX = 'nfm_'; // "nutrifit manager"

// Scopes disponibles. 'full' = acceso completo (todo el SaaS del manager).
export const API_SCOPES = ['full', 'clients', 'billing', 'messages', 'tasks', 'nutrition', 'training', 'automations', 'analytics', 'settings'] as const;
export type ApiScope = typeof API_SCOPES[number];

export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const secret = crypto.randomBytes(24).toString('hex'); // 48 hex chars
  const plaintext = `${API_KEY_PREFIX}${secret}`;
  const hash = hashApiKey(plaintext);
  const prefix = plaintext.slice(0, 12); // p.ej. nfm_ab12cd34 (para mostrar)
  return { plaintext, hash, prefix };
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export function looksLikeApiKey(token?: string | null): boolean {
  return typeof token === 'string' && token.startsWith(API_KEY_PREFIX);
}

interface ResolvedKey {
  managerId: string;
  scopes: string[];
  keyId: string;
}

// Resuelve una clave en claro a su manager + scopes. Devuelve null si no existe,
// está revocada o caducada. Actualiza last_used_at de forma best-effort.
export async function resolveApiKey(plaintext: string): Promise<ResolvedKey | null> {
  if (!looksLikeApiKey(plaintext)) return null;
  const hash = hashApiKey(plaintext);
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, manager_id, scopes, revoked_at, expires_at')
    .eq('key_hash', hash)
    .maybeSingle();
  if (!data) return null;
  if (data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
  // Confirma que el manager sigue siendo MANAGER (defensa ante cambios de rol).
  const { data: usr } = await supabaseAdmin.from('users').select('role').eq('id', data.manager_id).maybeSingle();
  if (!usr || usr.role !== 'MANAGER') return null;
  // last_used_at (no bloquea la request).
  supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id).then(() => {}, () => {});
  return { managerId: data.manager_id, scopes: Array.isArray(data.scopes) ? data.scopes : [], keyId: data.id };
}

// Mapea una URL de la API al scope requerido. Las áreas núcleo están mapeadas;
// lo no mapeado exige 'full' (deny-by-default) para no filtrar accesos.
export function scopeForUrl(url: string): ApiScope {
  const u = (url || '').toLowerCase();
  if (u.includes('/api-keys')) return 'settings';
  if (u.includes('/client-billing') || u.includes('/billing')) return 'billing';
  if (u.includes('/clients') || u.includes('/profile-stats')) return 'clients';
  if (u.includes('/messages')) return 'messages';
  if (u.includes('/tasks') || u.includes('/calendar')) return 'tasks';
  if (u.includes('/recipes') || u.includes('/foods') || u.includes('/nutrition') || u.includes('/supplements')) return 'nutrition';
  if (u.includes('/training') || u.includes('/exercises')) return 'training';
  if (u.includes('/workflows') || u.includes('/automations')) return 'automations';
  if (u.includes('/analytics') || u.includes('/insights')) return 'analytics';
  if (u.includes('/integrations') || u.includes('/settings') || u.includes('/notification')) return 'settings';
  return 'full';
}

// ¿La clave (con estos scopes) puede acceder a esta URL?
export function apiKeyAllowsUrl(url: string, scopes: string[]): boolean {
  if (scopes.includes('full')) return true;
  const required = scopeForUrl(url);
  return scopes.includes(required);
}
