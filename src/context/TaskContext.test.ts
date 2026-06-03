import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildAutomatedTasksPure } from './TaskContext';
import type { AutomationRule } from './TaskContext';
import type { ClientData } from './ClientContext';

// Passthrough translation function (key → key) for deterministic tests.
const t = (key: string, _params?: Record<string, string | number>) => key;

// ─── Helpers ──────────────────────────────────────────────────────────────

const NOW = new Date('2024-06-15T12:00:00Z').getTime();

function daysAgo(n: number): string {
  return new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(NOW - n * 60 * 60 * 1000).toISOString();
}

function makeClient(overrides: Partial<ClientData> = {}): ClientData {
  return {
    id: 'c1',
    email: 'test@example.com',
    name: 'Test Client',
    age: 30,
    gender: 'M',
    status: 'Active',
    isAtRisk: false,
    riskStatus: null,
    plan: 'Nutrition Plan A',
    lastCheckIn: '2024-06-01',
    nextAppointment: 'Scheduled',
    progress: 75,
    progressLabel: '75%',
    avatar: '',
    created_at: daysAgo(30),
    goal: 'Weight Loss',
    notes: '',
    weight: 80,
    nutritionPlanAssigned: true,
    trainingPlanAssigned: false,
    planningAssigned: false,
    check_ins: [],
    unreadMessages: 0,
    oldestUnreadAt: null,
    lastActivityAt: null,
    lastWorkoutAt: null,
    planUpdatedAt: null,
    ...overrides,
  };
}

function makeRule(id: string, enabled = true, priority: 'High' | 'Medium' | 'Low' = 'Medium'): AutomationRule {
  return {
    id,
    category: 'OPERATIONS',
    title: id,
    desc: '',
    priority,
    enabled,
    priorityColor: '',
  };
}

// ─── Empty / no-op cases ──────────────────────────────────────────────────

describe('buildAutomatedTasksPure — empty inputs', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns [] for empty client list', () => {
    expect(buildAutomatedTasksPure([], [makeRule('weekly-overdue')], t)).toEqual([]);
  });

  it('returns [] for empty rule list', () => {
    expect(buildAutomatedTasksPure([makeClient()], [], t)).toEqual([]);
  });

  it('returns [] when all rules are disabled', () => {
    const rules = [
      makeRule('weekly-overdue', false),
      makeRule('low-adherence', false),
      makeRule('plan-update', false),
    ];
    expect(buildAutomatedTasksPure([makeClient()], rules, t)).toEqual([]);
  });
});

// ─── Weekly check-in overdue ──────────────────────────────────────────────

describe('weekly-overdue rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with lastCheckIn=Never after 7+ days', () => {
    const client = makeClient({ lastCheckIn: 'Never', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:weekly-overdue:c1');
    expect(tasks[0].type).toBe('WEEKLY CHECK-IN');
  });

  it('fires for Inactive client after 7+ days', () => {
    const client = makeClient({ status: 'Inactive', lastCheckIn: '2024-05-01', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(1);
  });

  it('does NOT fire for brand-new client (< 7 days)', () => {
    const client = makeClient({ lastCheckIn: 'Never', created_at: daysAgo(3) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(0);
  });

  it('does NOT fire when client is Active with a real lastCheckIn', () => {
    const client = makeClient({ lastCheckIn: '2024-06-10', status: 'Active', created_at: daysAgo(30) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(0);
  });

  it('status is overdue when priority is High', () => {
    const client = makeClient({ lastCheckIn: 'Never', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue', true, 'High')], t);
    expect(tasks[0].status).toBe('overdue');
  });

  it('status is today when priority is Medium', () => {
    const client = makeClient({ lastCheckIn: 'Never', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('weekly-overdue', true, 'Medium')], t);
    expect(tasks[0].status).toBe('today');
  });
});

// ─── Low adherence ────────────────────────────────────────────────────────

describe('low-adherence rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with progress < 50 and 2+ check-ins', () => {
    const client = makeClient({
      progress: 40,
      status: 'Active',
      check_ins: [{ date: daysAgo(7) }, { date: daysAgo(14) }],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('low-adherence')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:low-adherence:c1');
  });

  it('does NOT fire with only 1 check-in (no evidence)', () => {
    const client = makeClient({
      progress: 40,
      status: 'Active',
      check_ins: [{ date: daysAgo(7) }],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('low-adherence')], t)).toHaveLength(0);
  });

  it('does NOT fire with no check-ins (day-0 client)', () => {
    const client = makeClient({ progress: 0, status: 'Active', check_ins: [] });
    expect(buildAutomatedTasksPure([client], [makeRule('low-adherence')], t)).toHaveLength(0);
  });

  it('does NOT fire when progress >= 50', () => {
    const client = makeClient({
      progress: 55,
      status: 'Active',
      check_ins: [{ date: daysAgo(7) }, { date: daysAgo(14) }],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('low-adherence')], t)).toHaveLength(0);
  });

  it('does NOT fire for Inactive clients', () => {
    const client = makeClient({
      progress: 30,
      status: 'Inactive',
      check_ins: [{ date: daysAgo(7) }, { date: daysAgo(14) }],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('low-adherence')], t)).toHaveLength(0);
  });

  it('status is overdue when priority is High', () => {
    const client = makeClient({
      progress: 30,
      status: 'Active',
      check_ins: [{ date: daysAgo(7) }, { date: daysAgo(14) }],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('low-adherence', true, 'High')], t);
    expect(tasks[0].status).toBe('overdue');
  });
});

// ─── Plan update (missing plan) ───────────────────────────────────────────

describe('plan-update rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with No Plan after 48h grace', () => {
    const client = makeClient({ plan: 'No Plan', status: 'Active', created_at: daysAgo(5) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('plan-update')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:plan-update:c1');
    expect(tasks[0].type).toBe('PLAN UPDATE');
  });

  it('does NOT fire within 48h grace period', () => {
    const client = makeClient({ plan: 'No Plan', status: 'Active', created_at: hoursAgo(24) });
    expect(buildAutomatedTasksPure([client], [makeRule('plan-update')], t)).toHaveLength(0);
  });

  it('does NOT fire when client has a plan', () => {
    const client = makeClient({ plan: 'Nutrition Plan A', status: 'Active', created_at: daysAgo(5) });
    expect(buildAutomatedTasksPure([client], [makeRule('plan-update')], t)).toHaveLength(0);
  });
});

// ─── Unread DM ────────────────────────────────────────────────────────────

describe('unread-dm rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires when client has unread messages older than 2h', () => {
    const client = makeClient({
      unreadMessages: 3,
      oldestUnreadAt: hoursAgo(4),
      status: 'Active',
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('unread-dm')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:unread-dm:c1');
    expect(tasks[0].type).toBe('DIRECT MESSAGE');
  });

  it('does NOT fire when message is < 2h old', () => {
    const client = makeClient({
      unreadMessages: 1,
      oldestUnreadAt: hoursAgo(1),
      status: 'Active',
    });
    expect(buildAutomatedTasksPure([client], [makeRule('unread-dm')], t)).toHaveLength(0);
  });

  it('does NOT fire for Archived clients', () => {
    const client = makeClient({
      unreadMessages: 5,
      oldestUnreadAt: hoursAgo(10),
      status: 'Archived',
    });
    expect(buildAutomatedTasksPure([client], [makeRule('unread-dm')], t)).toHaveLength(0);
  });

  it('does NOT fire when unreadMessages is 0', () => {
    const client = makeClient({ unreadMessages: 0, oldestUnreadAt: hoursAgo(5), status: 'Active' });
    expect(buildAutomatedTasksPure([client], [makeRule('unread-dm')], t)).toHaveLength(0);
  });
});

// ─── New leads ────────────────────────────────────────────────────────────

describe('new-leads rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Invited client', () => {
    const client = makeClient({ status: 'Invited' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('new-leads')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:new-leads:c1');
  });

  it('fires for Pending client', () => {
    const client = makeClient({ status: 'Pending' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('new-leads')], t);
    expect(tasks).toHaveLength(1);
  });

  it('does NOT fire for Active client', () => {
    const client = makeClient({ status: 'Active' });
    expect(buildAutomatedTasksPure([client], [makeRule('new-leads')], t)).toHaveLength(0);
  });
});

// ─── Sudden weight drop ───────────────────────────────────────────────────

describe('sudden-weight rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  function makeWeightCheckIn(date: string, weight: number, id = `ci-${date}`) {
    return { id, date, data_json: { weight } };
  }

  it('fires when latest weight dropped > 2kg within 10 days', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        makeWeightCheckIn(daysAgo(1), 76, 'latest-ci'),
        makeWeightCheckIn(daysAgo(7), 80, 'previous-ci'),
      ],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('sudden-weight')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:sudden-weight:c1');
    expect(tasks[0].target).toEqual({
      view: 'check-ins',
      data: { clientId: 'c1', checkInId: 'latest-ci' },
    });
  });

  it('does NOT fire for a drop ≤ 2kg', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        makeWeightCheckIn(daysAgo(1), 79),
        makeWeightCheckIn(daysAgo(7), 80),
      ],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('sudden-weight')], t)).toHaveLength(0);
  });

  it('does NOT fire when check-ins are > 10 days apart', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        makeWeightCheckIn(daysAgo(1), 76),
        makeWeightCheckIn(daysAgo(15), 80),
      ],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('sudden-weight')], t)).toHaveLength(0);
  });

  it('does NOT fire with fewer than 2 check-ins', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [makeWeightCheckIn(daysAgo(1), 76)],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('sudden-weight')], t)).toHaveLength(0);
  });

  it('parses data_json string format', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        { date: daysAgo(1), data_json: JSON.stringify({ weight: 76 }) },
        { date: daysAgo(7), data_json: JSON.stringify({ weight: 80 }) },
      ],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('sudden-weight')], t);
    expect(tasks).toHaveLength(1);
  });
});

// ─── Sudden weight gain ───────────────────────────────────────────────────

describe('sudden-weight-gain rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires when latest weight gained > 2kg within 10 days', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        { id: 'latest-gain-ci', date: daysAgo(1), data_json: { weight: 84 } },
        { id: 'previous-gain-ci', date: daysAgo(7), data_json: { weight: 80 } },
      ],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('sudden-weight-gain')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:sudden-weight-gain:c1');
    expect(tasks[0].target).toEqual({
      view: 'check-ins',
      data: { clientId: 'c1', checkInId: 'latest-gain-ci' },
    });
  });

  it('does NOT fire for a gain ≤ 2kg', () => {
    const client = makeClient({
      status: 'Active',
      check_ins: [
        { date: daysAgo(1), data_json: { weight: 81 } },
        { date: daysAgo(7), data_json: { weight: 80 } },
      ],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('sudden-weight-gain')], t)).toHaveLength(0);
  });
});

// ─── No login / inactivity ────────────────────────────────────────────────

describe('no-login rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires when Active client inactive for 3+ days', () => {
    const client = makeClient({ status: 'Active', lastActivityAt: daysAgo(5) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('no-login')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:no-login:c1');
  });

  it('does NOT fire when inactive < 3 days', () => {
    const client = makeClient({ status: 'Active', lastActivityAt: daysAgo(2) });
    expect(buildAutomatedTasksPure([client], [makeRule('no-login')], t)).toHaveLength(0);
  });

  it('does NOT fire when lastActivityAt is null', () => {
    const client = makeClient({ status: 'Active', lastActivityAt: null });
    expect(buildAutomatedTasksPure([client], [makeRule('no-login')], t)).toHaveLength(0);
  });
});

// ─── Goal milestone ───────────────────────────────────────────────────────

describe('goal-milestone rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with progress >= 95', () => {
    const client = makeClient({ status: 'Active', progress: 95 });
    const tasks = buildAutomatedTasksPure([client], [makeRule('goal-milestone')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:goal-milestone:c1');
  });

  it('does NOT fire when progress < 95', () => {
    const client = makeClient({ status: 'Active', progress: 94 });
    expect(buildAutomatedTasksPure([client], [makeRule('goal-milestone')], t)).toHaveLength(0);
  });
});

// ─── Onboarding not finished ──────────────────────────────────────────────

describe('onboarding-not-finished rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Invited client after 48h', () => {
    const client = makeClient({ status: 'Invited', created_at: hoursAgo(72) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('onboarding-not-finished')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:onboarding-not-finished:c1');
  });

  it('does NOT fire within 48h grace period', () => {
    const client = makeClient({ status: 'Invited', created_at: hoursAgo(24) });
    expect(buildAutomatedTasksPure([client], [makeRule('onboarding-not-finished')], t)).toHaveLength(0);
  });

  it('does NOT fire for non-Invited status', () => {
    const client = makeClient({ status: 'Active', created_at: hoursAgo(72) });
    expect(buildAutomatedTasksPure([client], [makeRule('onboarding-not-finished')], t)).toHaveLength(0);
  });
});

// ─── Check-in to review ───────────────────────────────────────────────────

describe('checkin-to-review rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires when client has unreviewed check-in', () => {
    const client = makeClient({
      isUnreviewed: true,
      check_ins: [
        { id: 'reviewed-ci', date: daysAgo(1), reviewed_at: daysAgo(1), data_json: {} },
        { id: 'pending-ci', date: daysAgo(2), data_json: {} },
      ],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('checkin-to-review')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:checkin-to-review:c1');
    expect(tasks[0].target).toEqual({
      view: 'check-ins',
      data: { clientId: 'c1', checkInId: 'pending-ci' },
    });
  });

  it('does NOT fire when isUnreviewed is false', () => {
    const client = makeClient({ isUnreviewed: false });
    expect(buildAutomatedTasksPure([client], [makeRule('checkin-to-review')], t)).toHaveLength(0);
  });
});

// ─── Stale plan ───────────────────────────────────────────────────────────

describe('stale-plan rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with plan not updated in 4+ weeks', () => {
    const client = makeClient({ status: 'Active', planUpdatedAt: daysAgo(30) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('stale-plan')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:stale-plan:c1');
  });

  it('does NOT fire when plan updated < 4 weeks ago', () => {
    const client = makeClient({ status: 'Active', planUpdatedAt: daysAgo(20) });
    expect(buildAutomatedTasksPure([client], [makeRule('stale-plan')], t)).toHaveLength(0);
  });

  it('does NOT fire when planUpdatedAt is null', () => {
    const client = makeClient({ status: 'Active', planUpdatedAt: null });
    expect(buildAutomatedTasksPure([client], [makeRule('stale-plan')], t)).toHaveLength(0);
  });
});

// ─── Missed workout ───────────────────────────────────────────────────────

describe('missed-workout rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with training plan and no workout for 5+ days', () => {
    const client = makeClient({ status: 'Active', trainingPlanAssigned: true, lastWorkoutAt: daysAgo(7) });
    const tasks = buildAutomatedTasksPure([client], [makeRule('missed-workout')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:missed-workout:c1');
  });

  it('does NOT fire when last workout < 5 days ago', () => {
    const client = makeClient({ status: 'Active', trainingPlanAssigned: true, lastWorkoutAt: daysAgo(3) });
    expect(buildAutomatedTasksPure([client], [makeRule('missed-workout')], t)).toHaveLength(0);
  });

  it('does NOT fire when no training plan assigned', () => {
    const client = makeClient({ status: 'Active', trainingPlanAssigned: false, lastWorkoutAt: daysAgo(10) });
    expect(buildAutomatedTasksPure([client], [makeRule('missed-workout')], t)).toHaveLength(0);
  });
});

// ─── No appointment ───────────────────────────────────────────────────────

describe('no-appointment rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires for Active client with no appointment', () => {
    const client = makeClient({ status: 'Active', nextAppointment: 'Not Scheduled' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('no-appointment')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:no-appointment:c1');
  });

  it('does NOT fire when appointment is scheduled', () => {
    const client = makeClient({ status: 'Active', nextAppointment: '2024-07-01' });
    expect(buildAutomatedTasksPure([client], [makeRule('no-appointment')], t)).toHaveLength(0);
  });
});

// ─── First check-in ───────────────────────────────────────────────────────

describe('first-checkin rule', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires when client has exactly 1 check-in within 3 days', () => {
    const client = makeClient({
      check_ins: [{ date: daysAgo(1), data_json: {} }],
    });
    const tasks = buildAutomatedTasksPure([client], [makeRule('first-checkin')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('auto:first-checkin:c1');
  });

  it('does NOT fire when check-in is older than 3 days', () => {
    const client = makeClient({
      check_ins: [{ date: daysAgo(5), data_json: {} }],
    });
    expect(buildAutomatedTasksPure([client], [makeRule('first-checkin')], t)).toHaveLength(0);
  });

  it('does NOT fire with 0 or 2+ check-ins', () => {
    const client0 = makeClient({ check_ins: [] });
    const client2 = makeClient({
      check_ins: [
        { date: daysAgo(1), data_json: {} },
        { date: daysAgo(8), data_json: {} },
      ],
    });
    expect(buildAutomatedTasksPure([client0], [makeRule('first-checkin')], t)).toHaveLength(0);
    expect(buildAutomatedTasksPure([client2], [makeRule('first-checkin')], t)).toHaveLength(0);
  });
});

// ─── statusFor priority mapping ───────────────────────────────────────────

describe('priority → status mapping', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('High priority maps to overdue for unread-dm', () => {
    const client = makeClient({ unreadMessages: 1, oldestUnreadAt: hoursAgo(5), status: 'Active' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('unread-dm', true, 'High')], t);
    expect(tasks[0].status).toBe('overdue');
  });

  it('Medium priority maps to today for unread-dm', () => {
    const client = makeClient({ unreadMessages: 1, oldestUnreadAt: hoursAgo(5), status: 'Active' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('unread-dm', true, 'Medium')], t);
    expect(tasks[0].status).toBe('today');
  });

  it('Low priority maps to pending for unread-dm', () => {
    const client = makeClient({ unreadMessages: 1, oldestUnreadAt: hoursAgo(5), status: 'Active' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('unread-dm', true, 'Low')], t);
    expect(tasks[0].status).toBe('pending');
  });

  it('priority field is lowercase regardless of rule priority', () => {
    const client = makeClient({ unreadMessages: 1, oldestUnreadAt: hoursAgo(5), status: 'Active' });
    const tasks = buildAutomatedTasksPure([client], [makeRule('unread-dm', true, 'High')], t);
    expect(tasks[0].priority).toBe('high');
  });
});

// ─── Multi-client / multi-rule ────────────────────────────────────────────

describe('multiple clients', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it('generates tasks for each matching client independently', () => {
    const c1 = makeClient({ id: 'c1', lastCheckIn: 'Never', created_at: daysAgo(10) });
    const c2 = makeClient({ id: 'c2', lastCheckIn: 'Never', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([c1, c2], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(2);
    expect(tasks.map(t => t.clientId).sort()).toEqual(['c1', 'c2']);
  });

  it('does not cross-contaminate clients when one matches and one does not', () => {
    const matching = makeClient({ id: 'match', lastCheckIn: 'Never', created_at: daysAgo(10) });
    const nonMatch = makeClient({ id: 'skip', lastCheckIn: '2024-06-12', created_at: daysAgo(10) });
    const tasks = buildAutomatedTasksPure([matching, nonMatch], [makeRule('weekly-overdue')], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].clientId).toBe('match');
  });
});

describe('task navigation targets', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  const cases: Array<[string, Partial<ClientData>, string]> = [
    ['weekly-overdue', { lastCheckIn: 'Never', created_at: daysAgo(10) }, 'check-ins'],
    ['low-adherence', { progress: 20, check_ins: [{ id: 'ci-1', date: daysAgo(1), data_json: {} }, { id: 'ci-2', date: daysAgo(2), data_json: {} }] }, 'check-ins'],
    ['plan-update', { plan: 'No Plan', created_at: hoursAgo(72) }, 'planning-template-selector'],
    ['unread-dm', { unreadMessages: 1, oldestUnreadAt: hoursAgo(3) }, 'messages'],
    ['new-leads', { status: 'Pending' }, 'clients'],
    ['sudden-weight', { check_ins: [{ id: 'ci-new', date: daysAgo(1), data_json: { weight: 76 } }, { id: 'ci-old', date: daysAgo(7), data_json: { weight: 80 } }] }, 'check-ins'],
    ['no-login', { lastActivityAt: daysAgo(5) }, 'clients'],
    ['goal-milestone', { progress: 96 }, 'clients'],
    ['onboarding-not-finished', { status: 'Invited', created_at: hoursAgo(72) }, 'clients'],
    ['checkin-to-review', { isUnreviewed: true, check_ins: [{ id: 'pending-ci', date: daysAgo(1), data_json: {} }] }, 'check-ins'],
    ['sudden-weight-gain', { check_ins: [{ id: 'gain-new', date: daysAgo(1), data_json: { weight: 84 } }, { id: 'gain-old', date: daysAgo(7), data_json: { weight: 80 } }] }, 'check-ins'],
    ['stale-plan', { planUpdatedAt: daysAgo(30) }, 'planning-detail'],
    ['no-appointment', { nextAppointment: 'Not Scheduled' }, 'calendar'],
    ['first-checkin', { check_ins: [{ id: 'first-ci', date: daysAgo(1), data_json: {} }] }, 'check-ins'],
    ['missed-workout', { trainingPlanAssigned: true, lastWorkoutAt: daysAgo(7) }, 'training'],
  ];

  it.each(cases)('sets an exact navigation target for %s', (ruleId, clientOverrides, expectedView) => {
    const tasks = buildAutomatedTasksPure([makeClient(clientOverrides)], [makeRule(ruleId)], t);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].target?.view).toBe(expectedView);
    expect(tasks[0].target?.data?.clientId).toBe('c1');
  });
});
