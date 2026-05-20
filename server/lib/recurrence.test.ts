import { describe, it, expect } from 'vitest';
import {
  repeatLabelToRrule,
  rruleToRepeatLabel,
  expandTaskDates,
  applyExceptions,
  virtualInstanceId,
  parseVirtualId,
  type TaskRow,
  type TaskException,
} from './recurrence';

// ---- repeatLabelToRrule --------------------------------------------------

describe('repeatLabelToRrule', () => {
  const anchor = '2025-06-02'; // Monday

  it('returns null for null label', () => {
    expect(repeatLabelToRrule(null, anchor)).toBeNull();
  });

  it('returns null for "does not repeat" (English)', () => {
    expect(repeatLabelToRrule('does not repeat', anchor)).toBeNull();
  });

  it('returns null for "no repetir" (Spanish)', () => {
    expect(repeatLabelToRrule('no repetir', anchor)).toBeNull();
  });

  it('returns null for "custom"', () => {
    expect(repeatLabelToRrule('custom', anchor)).toBeNull();
  });

  it('returns null for "personalizada"', () => {
    expect(repeatLabelToRrule('personalizada', anchor)).toBeNull();
  });

  it('maps "daily" to FREQ=DAILY', () => {
    expect(repeatLabelToRrule('daily', anchor)).toBe('FREQ=DAILY');
  });

  it('maps "diaria" to FREQ=DAILY', () => {
    expect(repeatLabelToRrule('diaria', anchor)).toBe('FREQ=DAILY');
  });

  it('maps "weekly" with Monday anchor to FREQ=WEEKLY;BYDAY=MO', () => {
    expect(repeatLabelToRrule('weekly', anchor)).toBe('FREQ=WEEKLY;BYDAY=MO');
  });

  it('maps "semanal" the same as "weekly"', () => {
    expect(repeatLabelToRrule('semanal', anchor)).toBe(repeatLabelToRrule('weekly', anchor));
  });

  it('maps "monthly" with day-2 anchor to FREQ=MONTHLY;BYMONTHDAY=2', () => {
    expect(repeatLabelToRrule('monthly', anchor)).toBe('FREQ=MONTHLY;BYMONTHDAY=2');
  });

  it('maps "mensual" the same as "monthly"', () => {
    expect(repeatLabelToRrule('mensual', anchor)).toBe(repeatLabelToRrule('monthly', anchor));
  });

  it('returns null for invalid anchor date', () => {
    expect(repeatLabelToRrule('daily', 'not-a-date')).toBeNull();
  });
});

// ---- rruleToRepeatLabel --------------------------------------------------

describe('rruleToRepeatLabel', () => {
  it('returns "Does not repeat" for null', () => {
    expect(rruleToRepeatLabel(null)).toBe('Does not repeat');
  });

  it('returns "Does not repeat" for undefined', () => {
    expect(rruleToRepeatLabel(undefined)).toBe('Does not repeat');
  });

  it('maps FREQ=DAILY to "Daily"', () => {
    expect(rruleToRepeatLabel('FREQ=DAILY')).toBe('Daily');
  });

  it('maps FREQ=WEEKLY;BYDAY=MO to "Weekly"', () => {
    expect(rruleToRepeatLabel('FREQ=WEEKLY;BYDAY=MO')).toBe('Weekly');
  });

  it('maps bare FREQ=WEEKLY to "Weekly"', () => {
    expect(rruleToRepeatLabel('FREQ=WEEKLY')).toBe('Weekly');
  });

  it('maps FREQ=MONTHLY;BYMONTHDAY=15 to "Monthly"', () => {
    expect(rruleToRepeatLabel('FREQ=MONTHLY;BYMONTHDAY=15')).toBe('Monthly');
  });

  it('maps bare FREQ=MONTHLY to "Monthly"', () => {
    expect(rruleToRepeatLabel('FREQ=MONTHLY')).toBe('Monthly');
  });

  it('maps unknown rule to "Custom"', () => {
    expect(rruleToRepeatLabel('FREQ=YEARLY;BYMONTH=1')).toBe('Custom');
  });

  it('round-trips daily through repeatLabelToRrule', () => {
    const rule = repeatLabelToRrule('daily', '2025-06-02')!;
    expect(rruleToRepeatLabel(rule)).toBe('Daily');
  });
});

// ---- expandTaskDates -----------------------------------------------------

const makeTask = (overrides: Partial<TaskRow> = {}): TaskRow => ({
  id: 'task-1',
  manager_id: 'mgr-1',
  client_id: null,
  title: 'Test',
  description: null,
  type: 'appointment',
  date: '2025-06-02',
  time: '10:00:00',
  end_time: null,
  duration: null,
  status: 'pending',
  recurrence_rule: null,
  recurrence_end: null,
  created_at: '2025-06-01T00:00:00Z',
  updated_at: null,
  google_event_id: null,
  ...overrides,
});

describe('expandTaskDates', () => {
  it('returns [] for a non-recurring task', () => {
    const task = makeTask();
    const from = new Date('2025-06-01');
    const to = new Date('2025-06-30');
    expect(expandTaskDates(task, from, to)).toEqual([]);
  });

  it('expands a daily task within a week', () => {
    const task = makeTask({ recurrence_rule: 'FREQ=DAILY' });
    const from = new Date('2025-06-02T00:00:00');
    const to = new Date('2025-06-06T00:00:00');
    const dates = expandTaskDates(task, from, to);
    expect(dates).toContain('2025-06-02');
    expect(dates).toContain('2025-06-03');
    expect(dates.length).toBeGreaterThanOrEqual(3);
  });

  it('respects recurrence_end cutoff', () => {
    const task = makeTask({ recurrence_rule: 'FREQ=DAILY', recurrence_end: '2025-06-04T00:00:00Z' });
    const from = new Date('2025-06-01T00:00:00');
    const to = new Date('2025-06-10T00:00:00');
    const dates = expandTaskDates(task, from, to);
    expect(dates.every(d => d <= '2025-06-04')).toBe(true);
    expect(dates).not.toContain('2025-06-05');
  });

  it('returns [] for a bad RRULE without throwing', () => {
    const task = makeTask({ recurrence_rule: 'NOT_A_VALID_RRULE' });
    expect(() => expandTaskDates(task, new Date('2025-06-01'), new Date('2025-06-30'))).not.toThrow();
  });
});

// ---- applyExceptions -----------------------------------------------------

describe('applyExceptions', () => {
  it('returns all dates when no exceptions', () => {
    const { kept, overrides } = applyExceptions(['2025-06-02', '2025-06-09'], []);
    expect(kept).toEqual(['2025-06-02', '2025-06-09']);
    expect(overrides.size).toBe(0);
  });

  it('removes a skipped date', () => {
    const exceptions: TaskException[] = [
      { task_id: 't1', original_date: '2025-06-09', action: 'skip', override_payload: null },
    ];
    const { kept } = applyExceptions(['2025-06-02', '2025-06-09', '2025-06-16'], exceptions);
    expect(kept).not.toContain('2025-06-09');
    expect(kept).toContain('2025-06-02');
    expect(kept).toContain('2025-06-16');
  });

  it('maps override exceptions into the returned Map', () => {
    const exceptions: TaskException[] = [
      { task_id: 't1', original_date: '2025-06-09', action: 'override', override_payload: { title: 'New title' } },
    ];
    const { overrides } = applyExceptions(['2025-06-02', '2025-06-09'], exceptions);
    expect(overrides.has('2025-06-09')).toBe(true);
    expect(overrides.get('2025-06-09')?.override_payload).toEqual({ title: 'New title' });
  });

  it('keeps overridden dates in the kept array (only skip removes)', () => {
    const exceptions: TaskException[] = [
      { task_id: 't1', original_date: '2025-06-09', action: 'override', override_payload: {} },
    ];
    const { kept } = applyExceptions(['2025-06-02', '2025-06-09'], exceptions);
    expect(kept).toContain('2025-06-09');
  });
});

// ---- virtualInstanceId / parseVirtualId ----------------------------------

describe('virtualInstanceId', () => {
  it('formats as parentId:YYYY-MM-DD', () => {
    expect(virtualInstanceId('task-abc', '2025-06-09')).toBe('task-abc:2025-06-09');
  });
});

describe('parseVirtualId', () => {
  it('parses a valid virtual id', () => {
    expect(parseVirtualId('task-abc:2025-06-09')).toEqual({ parentId: 'task-abc', date: '2025-06-09' });
  });

  it('returns null for a real (non-virtual) id', () => {
    expect(parseVirtualId('some-uuid-without-colon')).toBeNull();
  });

  it('returns null when the date part is malformed', () => {
    expect(parseVirtualId('task-abc:not-a-date')).toBeNull();
  });

  it('round-trips with virtualInstanceId', () => {
    const id = virtualInstanceId('parent-xyz', '2025-12-25');
    expect(parseVirtualId(id)).toEqual({ parentId: 'parent-xyz', date: '2025-12-25' });
  });
});
