import { describe, expect, it } from 'vitest';
import { getDefaultAutomations, getLocalizedAutomationPreview } from './automation-defaults';

describe('getDefaultAutomations', () => {
  it('returns the English seed by default', () => {
    const defaults = getDefaultAutomations('en', 'manager-1');
    const weekly = defaults.find(a => a.trigger_id === 'weekly-checkin');
    expect(weekly?.name).toBe('Weekly Check-in Reminder');
    expect(weekly?.message).toContain("it's check-in day");
  });

  it('returns Spanish seeds when language is es', () => {
    const defaults = getDefaultAutomations('es', 'manager-1');
    const weekly = defaults.find(a => a.trigger_id === 'weekly-checkin');
    const birthday = defaults.find(a => a.trigger_id === 'birthday');
    expect(weekly?.name).toContain('check-in');
    expect(weekly?.message).toContain('check-in semanal');
    expect(birthday?.name).toContain('Cumple');
    expect(birthday?.message).toContain('Feliz');
  });

  it('localizes seed previews without touching custom copy', () => {
    const englishDefault = getDefaultAutomations('en', 'manager-1').find(a => a.trigger_id === 'weekly-checkin')?.message || '';
    const enPreview = getLocalizedAutomationPreview('weekly-checkin', englishDefault, 'en');
    const esPreview = getLocalizedAutomationPreview('weekly-checkin', englishDefault, 'es');
    const custom = getLocalizedAutomationPreview('weekly-checkin', 'Texto propio del coach', 'es');

    expect(enPreview).toContain('check-in day');
    expect(esPreview).toContain('check-in semanal');
    expect(custom).toBe('Texto propio del coach');
  });
});
