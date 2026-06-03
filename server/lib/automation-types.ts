// Shared automation types. Lives in lib/ so both the route handler
// (server/routes/automations.ts) and the template catalog
// (server/lib/automation-templates.ts) can import it without a circular
// dependency between a route file and a lib file.

export type AutomationStep =
  | { kind: 'message'; message: string }
  | { kind: 'wait'; amount: number; unit: 'hours' | 'days'; cancelIfReplied?: boolean }
  | { kind: 'create_task'; title: string; description?: string; type?: string; priority?: 'low' | 'medium' | 'high'; date?: string; linkUrl?: string }
  | { kind: 'set_field'; field: 'status' | 'goal' | 'notes'; value: string }
  | { kind: 'stop_if'; conditionType: string; operator: string; value: string }
  // Notify the coach with a web-push notification (escalation without a task).
  | { kind: 'notify_coach'; title: string; body: string }
  // Schedule a calendar event for the coach, `offsetDays` after the trigger.
  | { kind: 'create_event'; title: string; description?: string; eventType?: string; offsetDays?: number; time?: string; linkUrl?: string }
  // Assign a check-in template to the client so they get a fresh form.
  | { kind: 'assign_checkin'; templateId: string }
  // Assign an onboarding template (welcome form) to the client.
  | { kind: 'assign_onboarding'; templateId: string };
