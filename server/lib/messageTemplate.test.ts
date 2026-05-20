import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderMessage, KNOWN_VARIABLES, type RenderContext } from './messageTemplate';

// ---- renderMessage — basic substitution ----------------------------------

describe('renderMessage', () => {
  it('returns empty string for empty template', () => {
    expect(renderMessage('', {})).toBe('');
  });

  it('returns the template unchanged when no tokens present', () => {
    expect(renderMessage('Hello, no tokens here!', {})).toBe('Hello, no tokens here!');
  });

  it('leaves unknown tokens intact (visible for debugging)', () => {
    expect(renderMessage('{Unknown Token}', {})).toBe('{Unknown Token}');
  });

  it('substitutes {Client Name} from full_name', () => {
    const ctx: RenderContext = { client: { full_name: 'Ana García', email: 'ana@test.com' } };
    expect(renderMessage('{Client Name}', ctx)).toBe('Ana García');
  });

  it('falls back to email when full_name is null', () => {
    const ctx: RenderContext = { client: { full_name: null, email: 'ana@test.com' } };
    expect(renderMessage('{Client Name}', ctx)).toBe('ana@test.com');
  });

  it('falls back to default string when client is null', () => {
    expect(renderMessage('{Client Name}', { client: null })).toBe('tu cliente');
  });

  it('substitutes {First Name} — first word only', () => {
    const ctx: RenderContext = { client: { full_name: 'Ana García López' } };
    expect(renderMessage('{First Name}', ctx)).toBe('Ana');
  });

  it('substitutes {Coach Name}', () => {
    const ctx: RenderContext = { coachName: 'Carlos Ruiz' };
    expect(renderMessage('Hola, soy {Coach Name}', ctx)).toBe('Hola, soy Carlos Ruiz');
  });

  it('falls back to default coach name when null', () => {
    expect(renderMessage('{Coach Name}', { coachName: null })).toBe('tu coach');
  });

  it('substitutes multiple tokens in a single template', () => {
    const ctx: RenderContext = {
      client: { full_name: 'Ana García' },
      coachName: 'Carlos',
    };
    expect(renderMessage('Hola {First Name}, soy {Coach Name}', ctx)).toBe('Hola Ana, soy Carlos');
  });

  it('uses overrides over resolver values', () => {
    const ctx: RenderContext = {
      client: { full_name: 'Ana García' },
      overrides: { '{Client Name}': 'Override Name' },
    };
    expect(renderMessage('{Client Name}', ctx)).toBe('Override Name');
  });

  it('override wins even when resolver would produce a different result', () => {
    const ctx: RenderContext = {
      coachName: 'Original Coach',
      overrides: { '{Coach Name}': 'Test Coach' },
    };
    expect(renderMessage('{Coach Name}', ctx)).toBe('Test Coach');
  });
});

// ---- {Current Weight} ---------------------------------------------------

describe('renderMessage — {Current Weight}', () => {
  it('reads weight from latestCheckIn.weight', () => {
    expect(renderMessage('{Current Weight}', { latestCheckIn: { weight: 75.5 } })).toBe('75.5');
  });

  it('falls back to avgWeight', () => {
    expect(renderMessage('{Current Weight}', { latestCheckIn: { avgWeight: 80 } })).toBe('80');
  });

  it('falls back to bodyWeight', () => {
    expect(renderMessage('{Current Weight}', { latestCheckIn: { bodyWeight: 70 } })).toBe('70');
  });

  it('returns 0 when no weight data', () => {
    expect(renderMessage('{Current Weight}', { latestCheckIn: {} })).toBe('0');
  });
});

// ---- {Goal Weight} ------------------------------------------------------

describe('renderMessage — {Goal Weight}', () => {
  it('reads goal_weight from profile', () => {
    expect(renderMessage('{Goal Weight}', { profile: { goal_weight: 65 } })).toBe('65');
  });

  it('returns 0 when profile is null', () => {
    expect(renderMessage('{Goal Weight}', { profile: null })).toBe('0');
  });
});

// ---- {Adherence Rate} ---------------------------------------------------

describe('renderMessage — {Adherence Rate}', () => {
  it('converts nutrition_adherence_score (0-10 scale) to percent', () => {
    expect(renderMessage('{Adherence Rate}', { latestCheckIn: { nutrition_adherence_score: 8 } })).toBe('80%');
  });

  it('uses adherence_score as fallback', () => {
    expect(renderMessage('{Adherence Rate}', { latestCheckIn: { adherence_score: 7 } })).toBe('70%');
  });

  it('returns — when no adherence data', () => {
    expect(renderMessage('{Adherence Rate}', { latestCheckIn: {} })).toBe('—');
  });

  it('rounds non-integer results', () => {
    expect(renderMessage('{Adherence Rate}', { latestCheckIn: { nutrition_adherence_score: 7.5 } })).toBe('75%');
  });
});

// ---- {Check-in Day} / {Days Inactive} -----------------------------------

describe('renderMessage — {Check-in Day}', () => {
  it('returns check_in_day from profile', () => {
    expect(renderMessage('{Check-in Day}', { profile: { check_in_day: 'Monday' } })).toBe('Monday');
  });

  it('returns default when missing', () => {
    expect(renderMessage('{Check-in Day}', { profile: null })).toBe('tu dia de check-in');
  });
});

describe('renderMessage — {Days Inactive}', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates days since last_login', () => {
    expect(renderMessage('{Days Inactive}', { profile: { last_login: '2025-06-07T12:00:00Z' } })).toBe('3');
  });

  it('returns — when no last_login', () => {
    expect(renderMessage('{Days Inactive}', { profile: {} })).toBe('—');
  });
});

// ---- {Days Until Expiry} ------------------------------------------------

describe('renderMessage — {Days Until Expiry}', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-10T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts days until plan_expires_at', () => {
    expect(renderMessage('{Days Until Expiry}', { profile: { plan_expires_at: '2025-06-15T00:00:00Z' } })).toBe('5');
  });

  it('returns 0 for expired plans (not negative)', () => {
    expect(renderMessage('{Days Until Expiry}', { profile: { plan_expires_at: '2025-06-01T00:00:00Z' } })).toBe('0');
  });

  it('returns — when no expiry', () => {
    expect(renderMessage('{Days Until Expiry}', { profile: {} })).toBe('—');
  });
});

// ---- {Mood} / {RPE} -----------------------------------------------------

describe('renderMessage — {Mood} and {RPE}', () => {
  it('reads mood from latestCheckIn.mood', () => {
    expect(renderMessage('{Mood}', { latestCheckIn: { mood: 7 } })).toBe('7');
  });

  it('falls back to mood_score', () => {
    expect(renderMessage('{Mood}', { latestCheckIn: { mood_score: 8 } })).toBe('8');
  });

  it('returns — when no mood data', () => {
    expect(renderMessage('{Mood}', { latestCheckIn: {} })).toBe('—');
  });

  it('reads rpe from latestCheckIn.rpe', () => {
    expect(renderMessage('{RPE}', { latestCheckIn: { rpe: 9 } })).toBe('9');
  });

  it('falls back to rpe_score', () => {
    expect(renderMessage('{RPE}', { latestCheckIn: { rpe_score: 6 } })).toBe('6');
  });

  it('returns — when no rpe data', () => {
    expect(renderMessage('{RPE}', { latestCheckIn: {} })).toBe('—');
  });
});

// ---- KNOWN_VARIABLES catalog --------------------------------------------

describe('KNOWN_VARIABLES', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(KNOWN_VARIABLES)).toBe(true);
    expect(KNOWN_VARIABLES.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty token wrapped in braces', () => {
    for (const v of KNOWN_VARIABLES) {
      expect(v.token).toMatch(/^\{.+\}$/);
    }
  });

  it('every entry has a resolve function', () => {
    for (const v of KNOWN_VARIABLES) {
      expect(typeof v.resolve).toBe('function');
    }
  });

  it('all tokens are unique', () => {
    const tokens = KNOWN_VARIABLES.map(v => v.token);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('resolve never throws on an empty context', () => {
    for (const v of KNOWN_VARIABLES) {
      expect(() => v.resolve({})).not.toThrow();
    }
  });
});
