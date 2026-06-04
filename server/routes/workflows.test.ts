import { describe, expect, it } from 'vitest';
import { WORKFLOW_CATALOG, validateWorkflow, type WorkflowNode, type WorkflowEdge } from './workflows';

const trigger = (id = 'trigger'): WorkflowNode => ({
  id,
  type: 'trigger',
  key: 'trigger.manual',
  label: 'Manual run',
});

const edge = (source: string, target: string, sourceHandle?: string): WorkflowEdge => ({
  id: `${source}-${target}-${sourceHandle || 'main'}`,
  source,
  target,
  sourceHandle,
});

describe('WORKFLOW_CATALOG', () => {
  it('has unique, fully described node keys', () => {
    const keys = WORKFLOW_CATALOG.map(n => n.key);
    expect(new Set(keys).size).toBe(keys.length);

    for (const node of WORKFLOW_CATALOG) {
      expect(node.key).toMatch(/^[a-z]+\.[a-z0-9_]+$/);
      expect(['trigger', 'condition', 'action', 'data', 'flow']).toContain(node.type);
      expect(node.label).toBeTruthy();
      expect(node.category).toBeTruthy();
      expect(node.icon).toBeTruthy();
      expect(Array.isArray(node.configFields)).toBe(true);
    }
  });

  it('keeps every non-trigger catalog node valid inside a minimal graph', () => {
    for (const catalogNode of WORKFLOW_CATALOG.filter(n => n.type !== 'trigger')) {
      const node: WorkflowNode = {
        id: 'node',
        type: catalogNode.type as WorkflowNode['type'],
        key: catalogNode.key,
        label: catalogNode.label,
      };
      const edges = [edge('trigger', 'node')];
      if ('branches' in catalogNode && Array.isArray(catalogNode.branches)) {
        edges.push(edge('node', 'end', catalogNode.branches[0]));
      } else if (catalogNode.key !== 'flow.stop') {
        edges.push(edge('node', 'end'));
      }
      const nodes = catalogNode.key === 'flow.stop'
        ? [trigger(), node]
        : [trigger(), node, { id: 'end', type: 'flow', key: 'flow.stop', label: 'Stop' } as WorkflowNode];

      expect(validateWorkflow(nodes, edges).ok, catalogNode.key).toBe(true);
    }
  });
});

describe('validateWorkflow', () => {
  it('requires exactly one trigger', () => {
    expect(validateWorkflow([], []).errors).toContain('The workflow needs exactly one trigger node.');
    expect(validateWorkflow([trigger('a'), trigger('b')], []).errors).toContain('Only one trigger node is allowed.');
  });

  it('rejects dangling edges', () => {
    const result = validateWorkflow([trigger()], [edge('trigger', 'missing')]);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('unknown target node');
  });

  it('allows the standard trigger to action graph', () => {
    const result = validateWorkflow([
      trigger(),
      { id: 'message', type: 'action', key: 'action.send_message', label: 'Send message' },
    ], [edge('trigger', 'message')]);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
