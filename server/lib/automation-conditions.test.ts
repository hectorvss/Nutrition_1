import { describe, it, expect } from 'vitest';
import {
  ACTIVATION_CONDITIONS,
  STOP_CONDITIONS,
  CONDITIONS_BY_ID,
  filterConditionsByTier,
  type ConditionDef,
} from './automation-conditions';

// ─── Catalog invariants ────────────────────────────────────────────────────

describe('ACTIVATION_CONDITIONS catalog', () => {
  it('has at least one basic and one advanced entry', () => {
    expect(ACTIVATION_CONDITIONS.some(c => c.tier === 'basic')).toBe(true);
    expect(ACTIVATION_CONDITIONS.some(c => c.tier === 'advanced')).toBe(true);
  });

  it('every entry has a non-empty id, label, desc, color', () => {
    for (const c of ACTIVATION_CONDITIONS) {
      expect(c.id.length, `id empty on "${c.label}"`).toBeGreaterThan(0);
      expect(c.label.length, `label empty on "${c.id}"`).toBeGreaterThan(0);
      expect(c.desc.length, `desc empty on "${c.id}"`).toBeGreaterThan(0);
      expect(c.color.length, `color empty on "${c.id}"`).toBeGreaterThan(0);
    }
  });

  it('all ids are unique', () => {
    const ids = ACTIVATION_CONDITIONS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has at least one operator', () => {
    for (const c of ACTIVATION_CONDITIONS) {
      expect(c.operators.length, `no operators on "${c.id}"`).toBeGreaterThan(0);
    }
  });

  it('defaultOperator is in the operators array for each entry', () => {
    for (const c of ACTIVATION_CONDITIONS) {
      expect(
        c.operators,
        `defaultOperator "${c.defaultOperator}" not in operators for "${c.id}"`,
      ).toContain(c.defaultOperator);
    }
  });

  it('all entries have category === "activation"', () => {
    for (const c of ACTIVATION_CONDITIONS) {
      expect(c.category).toBe('activation');
    }
  });
});

describe('STOP_CONDITIONS catalog', () => {
  it('has at least one basic and one advanced entry', () => {
    expect(STOP_CONDITIONS.some(c => c.tier === 'basic')).toBe(true);
    expect(STOP_CONDITIONS.some(c => c.tier === 'advanced')).toBe(true);
  });

  it('every entry has a non-empty id, label, desc, color', () => {
    for (const c of STOP_CONDITIONS) {
      expect(c.id.length, `id empty on "${c.label}"`).toBeGreaterThan(0);
      expect(c.label.length, `label empty on "${c.id}"`).toBeGreaterThan(0);
      expect(c.desc.length, `desc empty on "${c.id}"`).toBeGreaterThan(0);
      expect(c.color.length, `color empty on "${c.id}"`).toBeGreaterThan(0);
    }
  });

  it('all ids are unique', () => {
    const ids = STOP_CONDITIONS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all entries have category === "stop"', () => {
    for (const c of STOP_CONDITIONS) {
      expect(c.category).toBe('stop');
    }
  });

  it('defaultOperator is in the operators array for each entry', () => {
    for (const c of STOP_CONDITIONS) {
      expect(
        c.operators,
        `defaultOperator "${c.defaultOperator}" not in operators for "${c.id}"`,
      ).toContain(c.defaultOperator);
    }
  });
});

// ─── Cross-catalog uniqueness ──────────────────────────────────────────────

describe('combined conditions catalog', () => {
  const all = [...ACTIVATION_CONDITIONS, ...STOP_CONDITIONS];

  it('no id collisions between activation and stop lists', () => {
    const ids = all.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── CONDITIONS_BY_ID lookup map ──────────────────────────────────────────

describe('CONDITIONS_BY_ID', () => {
  it('contains every activation condition', () => {
    for (const c of ACTIVATION_CONDITIONS) {
      expect(CONDITIONS_BY_ID[c.id]).toBeDefined();
    }
  });

  it('contains every stop condition', () => {
    for (const c of STOP_CONDITIONS) {
      expect(CONDITIONS_BY_ID[c.id]).toBeDefined();
    }
  });

  it('maps id -> the correct object', () => {
    const sample = ACTIVATION_CONDITIONS[0];
    expect(CONDITIONS_BY_ID[sample.id]).toBe(sample);
  });

  it('returns undefined for unknown id', () => {
    expect(CONDITIONS_BY_ID['__not_a_real_id__']).toBeUndefined();
  });

  it('total size equals activation + stop lengths', () => {
    expect(Object.keys(CONDITIONS_BY_ID).length).toBe(
      ACTIVATION_CONDITIONS.length + STOP_CONDITIONS.length,
    );
  });
});

// ─── filterConditionsByTier ────────────────────────────────────────────────

describe('filterConditionsByTier', () => {
  it('basic tier returns only basic entries', () => {
    const result = filterConditionsByTier(ACTIVATION_CONDITIONS, 'basic');
    expect(result.every(c => c.tier === 'basic')).toBe(true);
  });

  it('basic tier hides advanced entries', () => {
    const result = filterConditionsByTier(ACTIVATION_CONDITIONS, 'basic');
    const advanced = ACTIVATION_CONDITIONS.filter(c => c.tier === 'advanced');
    for (const adv of advanced) {
      expect(result).not.toContain(adv);
    }
  });

  it('advanced tier returns all entries', () => {
    const result = filterConditionsByTier(ACTIVATION_CONDITIONS, 'advanced');
    expect(result).toEqual(ACTIVATION_CONDITIONS);
  });

  it('works on stop conditions list too', () => {
    const basicOnly = filterConditionsByTier(STOP_CONDITIONS, 'basic');
    expect(basicOnly.every(c => c.tier === 'basic')).toBe(true);
    expect(filterConditionsByTier(STOP_CONDITIONS, 'advanced')).toEqual(STOP_CONDITIONS);
  });

  it('returns same reference for advanced tier', () => {
    const result = filterConditionsByTier(ACTIVATION_CONDITIONS, 'advanced');
    expect(result).toBe(ACTIVATION_CONDITIONS);
  });

  it('basic tier returns a subset (fewer items than advanced)', () => {
    const basic = filterConditionsByTier(ACTIVATION_CONDITIONS, 'basic');
    const advanced = filterConditionsByTier(ACTIVATION_CONDITIONS, 'advanced');
    expect(basic.length).toBeLessThan(advanced.length);
  });
});

// ─── Known-entry spot checks ───────────────────────────────────────────────

describe('known entries', () => {
  it('weight condition exists in ACTIVATION_CONDITIONS', () => {
    const w = CONDITIONS_BY_ID['weight'];
    expect(w).toBeDefined();
    expect(w.tier).toBe('basic');
    expect(w.operators).toContain('>');
    expect(w.hint).toBe('kg');
  });

  it('adherence condition is basic and has % hint', () => {
    const a = CONDITIONS_BY_ID['adherence'];
    expect(a).toBeDefined();
    expect(a.tier).toBe('basic');
    expect(a.hint).toBe('%');
  });

  it('reply stop condition has "within" operator', () => {
    const r = CONDITIONS_BY_ID['reply'];
    expect(r).toBeDefined();
    expect(r.category).toBe('stop');
    expect(r.operators).toContain('within');
  });

  it('workflow_paused stop condition has basic tier', () => {
    const wp = CONDITIONS_BY_ID['workflow_paused'];
    expect(wp).toBeDefined();
    expect(wp.tier).toBe('basic');
  });
});
