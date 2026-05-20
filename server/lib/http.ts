// Helpers para responder errores HTTP sin filtrar info interna.
//
// Problema que resuelve: muchos endpoints hacian `res.status(500).json({
// error: error.message })` directamente, lo que filtraba al cliente
// stacks de Supabase, mensajes de Stripe con IDs internos, queries SQL
// concretas, etc. En produccion eso es un leak de seguridad.
//
// Politica:
// - En desarrollo (NODE_ENV !== 'production') devolvemos el mensaje real
//   para que el coach pueda diagnosticar.
// - En produccion devolvemos un mensaje generico al cliente y logueamos
//   el error completo via NDJSON (Vercel lo captura como structured log).
//
// Uso:
//   try { ... } catch (err: unknown) {
//     return sendError(res, 500, 'manager.clients.list_failed', err);
//   }

import type { Response } from 'express';
import { logger } from './logger.js';

const IS_PROD = process.env.NODE_ENV === 'production';

export const errMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';

/**
 * Mensaje de error seguro para el cliente. En produccion siempre devuelve
 * 'Server error' (no filtra detalles internos); en desarrollo devuelve el
 * mensaje real para diagnosticar. Pensado para drop-in:
 *   res.status(500).json({ error: error.message || 'Server error' })
 * pasa a:
 *   res.status(500).json({ error: safeErr(error) })
 */
export const safeErr = (e: unknown, fallback = 'Server error'): string =>
  IS_PROD ? fallback : errMessage(e) || fallback;

/**
 * Loguea el error real con event-id estructurado y responde al cliente
 * con un mensaje seguro segun el entorno.
 *
 * @param res          express Response
 * @param status       codigo HTTP (400/403/404/500/...)
 * @param event        nombre del evento para logger.error (dotted, e.g.
 *                     "stripe.checkout.create_failed")
 * @param err          el error original (puede ser unknown)
 * @param publicMessage  mensaje seguro para el cliente. Si omitido, en prod
 *                     se usa "Server error", en dev se usa el mensaje real.
 * @param extra        metadata adicional para el log (sin PII ni secretos)
 */
export function sendError(
  res: Response,
  status: number,
  event: string,
  err: unknown,
  publicMessage?: string,
  extra?: Record<string, unknown>,
): void {
  const internal = errMessage(err);
  logger.error(event, { err: internal, status, ...extra });
  const out = publicMessage ?? (IS_PROD ? 'Server error' : internal);
  res.status(status).json({ error: out });
}
