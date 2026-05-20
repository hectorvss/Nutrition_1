// Structured JSON logger for server endpoints.
//
// Output: one JSON object per line (NDJSON). Vercel/CloudWatch pick this up as
// structured fields automatically. In dev, jq is your friend:
//     npm run dev:server | jq 'select(.level=="error")'
//
// Usage:
//     import { logger } from '../lib/logger';
//     logger.info('webhook.received', { eventId, type });
//     logger.error('checkout.failed', { userId, err: err.message });
//
// Conventions:
// - `event`: dotted "domain.action" string (always present, first positional arg).
// - `meta`: structured fields (userId, requestId, etc). Avoid logging tokens/PII.
// - `level`: debug | info | warn | error. Debug is silenced unless LOG_LEVEL=debug.

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: number = LEVELS[(process.env.LOG_LEVEL as Level) || 'info'] ?? LEVELS.info;

function emit(level: Level, event: string, meta: Record<string, unknown> = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;
  const line = {
    ts: new Date().toISOString(),
    level,
    event,
    ...meta,
  };
  const out = level === 'error' || level === 'warn' ? console.error : console.log;
  try {
    out(JSON.stringify(line));
  } catch {
    // Fall back if meta has circular refs.
    out(JSON.stringify({ ...line, meta: '[unserializable]' }));
  }
}

export const logger = {
  debug: (event: string, meta?: Record<string, unknown>) => emit('debug', event, meta),
  info:  (event: string, meta?: Record<string, unknown>) => emit('info',  event, meta),
  warn:  (event: string, meta?: Record<string, unknown>) => emit('warn',  event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit('error', event, meta),
};
