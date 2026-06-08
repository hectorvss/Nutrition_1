import { describe, expect, it } from 'vitest';
import { localizeFlowTemplates, templateForTrigger } from './automation-templates';

describe('automation template localization', () => {
  it('keeps Spanish as the default catalog', () => {
    const tpl = templateForTrigger('new-client');
    expect(tpl?.title).toBe('Bienvenida al nuevo cliente');
    expect(tpl?.steps[0]).toHaveProperty('message');
  });

  it('returns English overlays for the builder catalog', () => {
    const catalog = localizeFlowTemplates('en');
    expect(catalog['new-client'].title).toBe('Welcome new client');
    expect(catalog['new-client'].steps[0]).toMatchObject({ kind: 'message' });
    expect((catalog['new-client'].steps[0] as any).message).toContain('great to start this journey');
    expect(catalog['weight-dropped'].title).toBe('Sudden weight drop');
    expect((catalog['weight-dropped'].steps[0] as any).message).toContain('weight drop');
  });

  it('supports localized template lookups by trigger', () => {
    const tpl = templateForTrigger('birthday', 'en');
    expect(tpl?.title).toBe('Client birthday');
    expect((tpl?.steps[0] as any).message).toContain('Happy birthday');
  });
});
