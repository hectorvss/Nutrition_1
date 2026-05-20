// Recurrence helpers — translate between the calendar UI's "repeat" label,
// iCalendar RRULE strings, and the actual expanded set of dates a series
// occupies in a given window. Used by POST /tasks (to derive the RRULE that
// gets persisted) and GET /tasks (to expand it back into virtual instances).
//
// We never materialise recurring instances into the DB — a "weekly forever"
// event is one row with rrule='FREQ=WEEKLY;BYDAY=MO'. This keeps storage
// flat and makes deleting / rescheduling the whole series trivial.

// rrule v2 publica como CommonJS — Node ESM (tsx) NO expone named exports
// directos al importar `from 'rrule'`. Hay que tomar el default y
// desestructurar. (Sin este interop el server crashea al arrancar.)
import rrulePkg from 'rrule';
const { RRule, RRuleSet, rrulestr, Weekday } = rrulePkg as any;

export interface TaskRow {
  id: string;
  manager_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  type: string | null;
  date: string;            // 'YYYY-MM-DD'
  time: string | null;     // 'HH:MM:SS'
  end_time: string | null;
  duration: string | null;
  status: string | null;
  recurrence_rule: string | null;
  recurrence_end: string | null;
  created_at: string;
  updated_at: string | null;
  google_event_id: string | null;
  [key: string]: any;
}

export interface TaskException {
  task_id: string;
  original_date: string;   // 'YYYY-MM-DD'
  action: 'skip' | 'override';
  override_payload: any;
}

// Map of UI day → RRule weekday constant. Sunday-first convention.
// `Weekday` comes from rrule via CommonJS interop above — it's an `any` value
// at compile time, so we annotate with `any` (the rrule typings aren't usable
// without proper named exports under the ESM bridge).
const WD_MAP: Record<string, any> = {
  MO: RRule.MO, TU: RRule.TU, WE: RRule.WE, TH: RRule.TH,
  FR: RRule.FR, SA: RRule.SA, SU: RRule.SU,
};

const DOW_BY_INDEX: any[] = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];

// Translate the legacy free-text "repeat" value the UI sends into a proper
// RRULE. The selector currently emits localised labels in some languages; we
// match against the well-known canonical English strings the form ships.
//
// `anchorDateIso` is the event's start date; used to derive BYDAY for Weekly
// and BYMONTHDAY for Monthly (so "weekly starting on a Tuesday" really means
// every Tuesday).
export function repeatLabelToRrule(label: string | null | undefined, anchorDateIso: string): string | null {
  if (!label) return null;
  const norm = label.trim().toLowerCase();
  // Treat all "no repeat" copy as null. Custom is handled separately by the
  // frontend (it submits an explicit RRULE string already).
  if (!norm || norm === 'does not repeat' || norm === 'no repetir' || norm === 'no se repite') return null;
  if (norm === 'custom' || norm === 'personalizada' || norm === 'personalizado') return null;

  const anchor = new Date(`${anchorDateIso}T00:00:00`);
  if (Number.isNaN(anchor.getTime())) return null;

  if (norm === 'daily' || norm === 'diaria' || norm === 'diario') {
    return 'FREQ=DAILY';
  }
  if (norm === 'weekly' || norm === 'semanal') {
    const dow = DOW_BY_INDEX[anchor.getDay()];
    return `FREQ=WEEKLY;BYDAY=${dow.toString()}`;
  }
  if (norm === 'monthly' || norm === 'mensual') {
    return `FREQ=MONTHLY;BYMONTHDAY=${anchor.getDate()}`;
  }
  return null;
}

// Inverse of repeatLabelToRrule, for the form to know which option to preselect
// when editing an existing task. We only recognise the canonical shapes — any
// hand-crafted RRULE falls back to 'Custom'.
export function rruleToRepeatLabel(rule: string | null | undefined): string {
  if (!rule) return 'Does not repeat';
  const r = rule.trim().toUpperCase();
  if (r === 'FREQ=DAILY') return 'Daily';
  if (/^FREQ=WEEKLY(;BYDAY=[A-Z]{2})?$/.test(r)) return 'Weekly';
  if (/^FREQ=MONTHLY(;BYMONTHDAY=\d{1,2})?$/.test(r)) return 'Monthly';
  return 'Custom';
}

// Build an RRuleSet for a task: the base RRULE constrained by DTSTART and
// optionally UNTIL (recurrence_end). Returns null when the task isn't recurring.
function buildRuleSet(task: TaskRow): any {
  if (!task.recurrence_rule) return null;
  try {
    const dtstart = new Date(`${task.date}T${task.time || '00:00:00'}`);
    if (Number.isNaN(dtstart.getTime())) return null;
    const opts: Record<string, any> = { ...RRule.parseString(task.recurrence_rule), dtstart };
    if (task.recurrence_end) {
      const until = new Date(task.recurrence_end);
      if (!Number.isNaN(until.getTime())) opts.until = until;
    }
    const set = new RRuleSet();
    set.rrule(new RRule(opts as any));
    return set;
  } catch (e) {
    // Bad RRULE shouldn't 500 the whole calendar. Log and skip silently.
    console.error('recurrence.rrule_parse_failed', { taskId: task.id, rule: task.recurrence_rule, err: (e as any)?.message });
    return null;
  }
}

// Expand a single recurring task into the list of dates (YYYY-MM-DD) it
// touches in [from, to]. Returns an empty array for non-recurring tasks.
export function expandTaskDates(task: TaskRow, from: Date, to: Date): string[] {
  const set = buildRuleSet(task);
  if (!set) return [];
  // RRule's between is inclusive of both ends when the third arg is true.
  const occurrences = set.between(from, to, true);
  return occurrences.map(d => d.toISOString().slice(0, 10));
}

// Apply exceptions to an expanded list. `skip` removes a date; `override`
// returns a sentinel so the caller can substitute the row with the override
// payload. Idempotent if no matching exception exists.
export function applyExceptions(
  dates: string[],
  exceptions: TaskException[],
): { kept: string[]; overrides: Map<string, TaskException> } {
  const skipSet = new Set(exceptions.filter(e => e.action === 'skip').map(e => e.original_date));
  const overrides = new Map<string, TaskException>();
  for (const ex of exceptions) {
    if (ex.action === 'override') overrides.set(ex.original_date, ex);
  }
  return {
    kept: dates.filter(d => !skipSet.has(d)),
    overrides,
  };
}

// Compose a synthetic id for a virtual instance: "<parentId>:<YYYY-MM-DD>".
// The frontend uses this to tell single-instance edits from series edits.
export function virtualInstanceId(parentId: string, dateIso: string): string {
  return `${parentId}:${dateIso}`;
}

// Inverse: parse a virtual id into its parts. Returns null when the id is
// a real (non-recurring) task id.
export function parseVirtualId(id: string): { parentId: string; date: string } | null {
  const idx = id.indexOf(':');
  if (idx < 0) return null;
  const date = id.slice(idx + 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { parentId: id.slice(0, idx), date };
}
