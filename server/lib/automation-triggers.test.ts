import { describe, it, expect } from 'vitest';
import {
  TRIGGERS,
  TRIGGER_BY_ID,
  filterTriggersByTier,
  type TriggerDef,
  type TriggerCategory,
} from './automation-triggers';

// ─── Catalog invariants ────────────────────────────────────────────────────

describe('TRIGGERS catalog', () => {
  it('is non-empty', () => {
    expect(TRIGGERS.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty id, name, desc, icon', () => {
    for (const t of TRIGGERS) {
      expect(t.id.length, `id empty on "${t.name}"`).toBeGreaterThan(0);
      expect(t.name.length, `name empty on "${t.id}"`).toBeGreaterThan(0);
      expect(t.desc.length, `desc empty on "${t.id}"`).toBeGreaterThan(0);
      expect(t.icon.length, `icon empty on "${t.id}"`).toBeGreaterThan(0);
    }
  });

  it('all ids are unique', () => {
    const ids = TRIGGERS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tier is either "basic" or "advanced" for every entry', () => {
    for (const t of TRIGGERS) {
      expect(['basic', 'advanced']).toContain(t.tier);
    }
  });

  it('has at least one basic and one advanced trigger', () => {
    expect(TRIGGERS.some(t => t.tier === 'basic')).toBe(true);
    expect(TRIGGERS.some(t => t.tier === 'advanced')).toBe(true);
  });

  it('category is a valid TriggerCategory for every entry', () => {
    const validCategories: TriggerCategory[] = [
      'lifecycle', 'checkins', 'messaging', 'metrics', 'training', 'schedule',
    ];
    for (const t of TRIGGERS) {
      expect(validCategories, `invalid category "${t.category}" on "${t.id}"`).toContain(t.category);
    }
  });

  it('wired is a boolean for every entry', () => {
    for (const t of TRIGGERS) {
      expect(typeof t.wired).toBe('boolean');
    }
  });

  it('every catalog trigger is wired to a real backend event or cron sweep', () => {
    expect(TRIGGERS.filter(t => !t.wired).map(t => t.id)).toEqual([]);
  });

  it('params, when present, is an array with at least one field', () => {
    const withParams = TRIGGERS.filter(t => t.params !== undefined);
    expect(withParams.length).toBeGreaterThan(0);
    for (const t of withParams) {
      expect(t.params!.length).toBeGreaterThan(0);
    }
  });

  it('each param field has a non-empty key, label, and valid type', () => {
    const validTypes = ['number', 'select', 'text'];
    for (const t of TRIGGERS) {
      for (const p of t.params ?? []) {
        expect(p.key.length, `param key empty on trigger "${t.id}"`).toBeGreaterThan(0);
        expect(p.label.length, `param label empty on trigger "${t.id}"`).toBeGreaterThan(0);
        expect(validTypes, `invalid param type "${p.type}" on "${t.id}"`).toContain(p.type);
      }
    }
  });
});

// ─── TRIGGER_BY_ID lookup map ─────────────────────────────────────────────

describe('TRIGGER_BY_ID', () => {
  it('contains every trigger in TRIGGERS', () => {
    for (const t of TRIGGERS) {
      expect(TRIGGER_BY_ID[t.id]).toBeDefined();
    }
  });

  it('maps id -> the correct object', () => {
    const sample = TRIGGERS[0];
    expect(TRIGGER_BY_ID[sample.id]).toBe(sample);
  });

  it('total size equals TRIGGERS length', () => {
    expect(Object.keys(TRIGGER_BY_ID).length).toBe(TRIGGERS.length);
  });

  it('returns undefined for unknown id', () => {
    expect(TRIGGER_BY_ID['__no_such_trigger__']).toBeUndefined();
  });
});

// ─── filterTriggersByTier ─────────────────────────────────────────────────

describe('filterTriggersByTier', () => {
  it('basic tier returns only basic triggers', () => {
    const result = filterTriggersByTier('basic');
    expect(result.every(t => t.tier === 'basic')).toBe(true);
  });

  it('basic tier excludes advanced triggers', () => {
    const result = filterTriggersByTier('basic');
    const advancedIds = TRIGGERS.filter(t => t.tier === 'advanced').map(t => t.id);
    const resultIds = result.map(t => t.id);
    for (const id of advancedIds) {
      expect(resultIds).not.toContain(id);
    }
  });

  it('advanced tier returns all triggers', () => {
    const result = filterTriggersByTier('advanced');
    expect(result).toEqual(TRIGGERS);
  });

  it('advanced tier returns same reference as TRIGGERS', () => {
    expect(filterTriggersByTier('advanced')).toBe(TRIGGERS);
  });

  it('basic tier returns fewer results than advanced', () => {
    expect(filterTriggersByTier('basic').length).toBeLessThan(
      filterTriggersByTier('advanced').length,
    );
  });

  it('every basic trigger is also present in advanced results', () => {
    const basic = filterTriggersByTier('basic');
    const advanced = filterTriggersByTier('advanced');
    for (const t of basic) {
      expect(advanced).toContain(t);
    }
  });
});

// ─── Categories coverage ─────────────────────────────────────────────────

describe('category coverage', () => {
  const categories: TriggerCategory[] = [
    'lifecycle', 'checkins', 'messaging', 'metrics', 'training', 'schedule',
  ];

  it('each category has at least one trigger', () => {
    for (const cat of categories) {
      const found = TRIGGERS.filter(t => t.category === cat);
      expect(found.length, `no triggers for category "${cat}"`).toBeGreaterThan(0);
    }
  });
});

// ─── Known-entry spot checks ──────────────────────────────────────────────

describe('known entries', () => {
  it('new-client trigger exists and is basic + wired', () => {
    const t = TRIGGER_BY_ID['new-client'];
    expect(t).toBeDefined();
    expect(t.tier).toBe('basic');
    expect(t.wired).toBe(true);
    expect(t.category).toBe('lifecycle');
  });

  it('custom trigger is basic and wired', () => {
    const t = TRIGGER_BY_ID['custom'];
    expect(t).toBeDefined();
    expect(t.tier).toBe('basic');
    expect(t.wired).toBe(true);
  });

  it('weekly-checkin trigger is basic and wired', () => {
    const t = TRIGGER_BY_ID['weekly-checkin'];
    expect(t).toBeDefined();
    expect(t.tier).toBe('basic');
    expect(t.wired).toBe(true);
    expect(t.category).toBe('checkins');
  });

  it('onboarding-stalled trigger has hours param', () => {
    const t = TRIGGER_BY_ID['onboarding-stalled'];
    expect(t).toBeDefined();
    expect(t.tier).toBe('advanced');
    expect(t.params).toBeDefined();
    const hoursParam = t.params!.find(p => p.key === 'hours');
    expect(hoursParam).toBeDefined();
    expect(hoursParam!.type).toBe('number');
    expect(hoursParam!.defaultValue).toBe(48);
  });

  it('weight-dropped trigger has kg param', () => {
    const t = TRIGGER_BY_ID['weight-dropped'];
    expect(t).toBeDefined();
    expect(t.params).toBeDefined();
    const kgParam = t.params!.find(p => p.key === 'kg');
    expect(kgParam).toBeDefined();
    expect(kgParam!.type).toBe('number');
  });

  it('subscription-renewal-soon trigger is wired (client_billing renewal reminders)', () => {
    const t = TRIGGER_BY_ID['subscription-renewal-soon'];
    expect(t).toBeDefined();
    expect(t.wired).toBe(true);
  });

  it('birthday trigger is basic and wired with no params', () => {
    const t = TRIGGER_BY_ID['birthday'];
    expect(t).toBeDefined();
    expect(t.tier).toBe('basic');
    expect(t.wired).toBe(true);
    expect(t.params).toBeUndefined();
  });
});
