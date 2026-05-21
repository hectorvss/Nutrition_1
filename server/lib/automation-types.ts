// Shared automation types. Lives in lib/ so both the route handler
// (server/routes/automations.ts) and the template catalog
// (server/lib/automation-templates.ts) can import it without a circular
// dependency between a route file and a lib file.

export type AutomationStep =
  | { kind: 'message'; message: string }
  | { kind: 'wait'; amount: number; unit: 'hours' | 'days'; cancelIfReplied?: boolean }
  | { kind: 'create_task'; title: string; type?: string; priority?: 'low' | 'medium' | 'high'; date?: string }
  | { kind: 'set_field'; field: 'status' | 'goal' | 'notes'; value: string }
  | { kind: 'stop_if'; conditionType: string; operator: string; value: string };
