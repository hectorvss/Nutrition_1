// Substitutes {Curly Braced} variables in automation/workflow messages.
// Unknown tokens are intentionally left visible so the coach can diagnose
// template mistakes instead of silently sending incomplete copy.

export type MessageLanguage = 'es' | 'en';

export interface RenderContext {
  client?: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
  } | null;
  /** clients_profiles row (goal_weight, check_in_day, last_login, etc.) */
  profile?: Record<string, any> | null;
  /** Manager full_name (for `{Coach Name}`). */
  coachName?: string | null;
  /** Latest client check-in, usually expanded from data_json/answers_json. */
  latestCheckIn?: Record<string, any> | null;
  /** Active billing payment URL for `{Payment Link}` reminders. */
  paymentUrl?: string | null;
  /** Language used for fallback words and dates in generated messages. */
  language?: MessageLanguage | string | null;
  /** One-off variable overrides, mostly for tests/sandbox runs. */
  overrides?: Record<string, string | number>;
}

function languageOf(ctx: RenderContext): MessageLanguage {
  return ctx.language === 'en' ? 'en' : 'es';
}

function localeOf(ctx: RenderContext): string {
  return languageOf(ctx) === 'en' ? 'en-US' : 'es-ES';
}

function fallback(ctx: RenderContext, es: string, en: string): string {
  return languageOf(ctx) === 'en' ? en : es;
}

const DASH = '—';

/** Central catalog of recognized tokens. */
export const KNOWN_VARIABLES: Array<{ token: string; resolve: (ctx: RenderContext) => string }> = [
  { token: '{Client Name}', resolve: ctx => String(ctx.client?.full_name || ctx.client?.email || fallback(ctx, 'tu cliente', 'your client')) },
  { token: '{First Name}', resolve: ctx => {
      const n = ctx.client?.full_name || ctx.client?.email || fallback(ctx, 'tu cliente', 'your client');
      return String(n).split(' ')[0];
    }
  },
  { token: '{Coach Name}', resolve: ctx => String(ctx.coachName || fallback(ctx, 'tu coach', 'your coach')) },
  { token: '{Coach First Name}', resolve: ctx => String(ctx.coachName || fallback(ctx, 'tu coach', 'your coach')).split(' ')[0] },
  { token: '{Current Weight}', resolve: ctx => {
      const w = ctx.latestCheckIn?.weight ?? ctx.latestCheckIn?.avgWeight
        ?? ctx.latestCheckIn?.bodyWeight ?? ctx.profile?.weight;
      return w != null ? String(w) : '0';
    }
  },
  { token: '{Goal Weight}', resolve: ctx => {
      const g = ctx.profile?.goal_weight;
      return g != null ? String(g) : '0';
    }
  },
  { token: '{Adherence Rate}', resolve: ctx => {
      const a = ctx.latestCheckIn?.nutrition_adherence_score ?? ctx.latestCheckIn?.adherence_score;
      if (a == null) return DASH;
      const pct = Number(a) * 10;
      return Number.isFinite(pct) ? `${Math.round(pct)}%` : DASH;
    }
  },
  { token: '{Check-in Day}', resolve: ctx => String(ctx.profile?.check_in_day || fallback(ctx, 'tu dia de check-in', 'your check-in day')) },
  { token: '{Days Inactive}', resolve: ctx => {
      const last = ctx.profile?.last_login;
      if (!last) return DASH;
      const days = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
      return String(days);
    }
  },
  { token: '{Days Until Expiry}', resolve: ctx => {
      const exp = ctx.profile?.plan_expires_at;
      if (!exp) return DASH;
      const days = Math.ceil((new Date(exp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return String(Math.max(0, days));
    }
  },
  { token: '{Mood}', resolve: ctx => {
      const m = ctx.latestCheckIn?.mood ?? ctx.latestCheckIn?.mood_score;
      return m != null ? String(m) : DASH;
    }
  },
  { token: '{RPE}', resolve: ctx => {
      const r = ctx.latestCheckIn?.rpe ?? ctx.latestCheckIn?.rpe_score;
      return r != null ? String(r) : DASH;
    }
  },
  { token: '{Goal}', resolve: ctx => String(ctx.profile?.goal || fallback(ctx, 'tu objetivo', 'your goal')) },
  { token: '{Height}', resolve: ctx => {
      const h = ctx.profile?.height;
      return h != null ? String(h) : DASH;
    }
  },
  { token: '{Age}', resolve: ctx => {
      const a = ctx.profile?.age;
      return a != null ? String(a) : DASH;
    }
  },
  { token: '{Today}', resolve: ctx => new Date().toLocaleDateString(localeOf(ctx), { weekday: 'long', day: 'numeric', month: 'long' }) },
  { token: '{Payment Link}', resolve: ctx => String(ctx.paymentUrl || '') },
];

const TOKEN_RE = /\{[^}]+\}/g;

export function renderMessage(template: string, ctx: RenderContext): string {
  if (!template) return '';
  return template.replace(TOKEN_RE, (match) => {
    if (ctx.overrides && match in ctx.overrides) return String(ctx.overrides[match]);
    const def = KNOWN_VARIABLES.find(v => v.token === match);
    if (!def) return match;
    try {
      return def.resolve(ctx);
    } catch {
      return match;
    }
  });
}
