import { describe, expect, it } from 'vitest';
import { getDefaultAutomations } from './automation-defaults';

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
    expect(weekly?.name).toBe('Recordatorio semanal de check-in');
    expect(weekly?.message).toContain('check-in semanal');
    expect(birthday?.name).toBe('Cumpleaños del cliente');
    expect(birthday?.message).toContain('Feliz cumpleaños');
  });
});
