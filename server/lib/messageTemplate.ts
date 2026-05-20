// Sustituye variables {Curly Braced} en el cuerpo de un mensaje de
// automation. El frontend ofrece chips para insertarlas; este modulo es
// el unico sitio donde se materializan a valores reales.
//
// Solo se reemplazan tokens que CONOCEMOS — un token desconocido se deja
// tal cual (no se borra) para que el coach pueda diagnosticar visualmente.
//
// Uso:
//   const text = renderMessage("Hola {First Name}, hoy toca check-in!",
//                              { client, profile, latestCheckIn, coachName });

export interface RenderContext {
  client?: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
  } | null;
  /** clients_profiles row (goal_weight, check_in_day, last_login, etc.) */
  profile?: Record<string, any> | null;
  /** Manager full_name (para `{Coach Name}`). */
  coachName?: string | null;
  /** Ultimo check-in del cliente (data_json desplegado). */
  latestCheckIn?: Record<string, any> | null;
  /** Override puntual de variables (e.g. tests). Sustituye a todo lo anterior. */
  overrides?: Record<string, string | number>;
}

/** Tabla central de tokens reconocidos. */
export const KNOWN_VARIABLES: Array<{ token: string; resolve: (ctx: RenderContext) => string }> = [
  { token: '{Client Name}', resolve: ctx => String(ctx.client?.full_name || ctx.client?.email || 'tu cliente') },
  { token: '{First Name}',  resolve: ctx => {
      const n = ctx.client?.full_name || ctx.client?.email || 'tu cliente';
      return String(n).split(' ')[0];
    }
  },
  { token: '{Coach Name}', resolve: ctx => String(ctx.coachName || 'tu coach') },
  // {Current Weight}/{Goal Weight} NO incluyen "kg" en el output: el coach
  // suele escribir "estas a {Current Weight} kg de tu meta" y se duplicaria.
  // Mantenemos el shape numerico para compat con la version anterior.
  { token: '{Current Weight}', resolve: ctx => {
      const w = ctx.latestCheckIn?.weight ?? ctx.latestCheckIn?.avgWeight ?? ctx.latestCheckIn?.bodyWeight;
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
      if (a == null) return '—';
      const pct = Number(a) * 10;
      return Number.isFinite(pct) ? `${Math.round(pct)}%` : '—';
    }
  },
  { token: '{Check-in Day}', resolve: ctx => String(ctx.profile?.check_in_day || 'tu dia de check-in') },
  { token: '{Days Inactive}', resolve: ctx => {
      const last = ctx.profile?.last_login;
      if (!last) return '—';
      const days = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
      return String(days);
    }
  },
  { token: '{Days Until Expiry}', resolve: ctx => {
      const exp = ctx.profile?.plan_expires_at;
      if (!exp) return '—';
      const days = Math.ceil((new Date(exp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return String(Math.max(0, days));
    }
  },
  { token: '{Mood}', resolve: ctx => {
      const m = ctx.latestCheckIn?.mood ?? ctx.latestCheckIn?.mood_score;
      return m != null ? String(m) : '—';
    }
  },
  { token: '{RPE}', resolve: ctx => {
      const r = ctx.latestCheckIn?.rpe ?? ctx.latestCheckIn?.rpe_score;
      return r != null ? String(r) : '—';
    }
  },
];

const TOKEN_RE = /\{[^}]+\}/g;

export function renderMessage(template: string, ctx: RenderContext): string {
  if (!template) return '';
  return template.replace(TOKEN_RE, (match) => {
    // overrides ganan sobre los resolvers (util en tests / sandbox)
    if (ctx.overrides && match in ctx.overrides) {
      return String(ctx.overrides[match]);
    }
    const def = KNOWN_VARIABLES.find(v => v.token === match);
    if (!def) return match; // token desconocido -> dejamos tal cual
    try {
      return def.resolve(ctx);
    } catch {
      return match; // resolver crasheo -> conservamos el placeholder visible
    }
  });
}
