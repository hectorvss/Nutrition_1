import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, Handle, Position,
  type Node, type Edge, type Connection, type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Rocket, Play, Plus, Trash2, X, Search,
  Zap, GitBranch, Send, Clock, Square, Pencil, ListTodo, Shuffle,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';

/* ---- types ---- */
interface CatalogNode {
  type: string; key: string; label: string; category: string;
  icon: string; description: string;
  configFields: { name: string; label: string; type: string; options?: string[] }[];
  branches?: string[];
}
interface WorkflowBuilderProps {
  workflowId: string | null;
  onBack: () => void;
}

const ICONS: Record<string, React.ElementType> = {
  Play: Zap, UserPlus: Zap, ClipboardCheck: Zap, MessageCircle: Zap, Clock,
  GitBranch, Shuffle, Timer: Clock, Square, Pencil, Send, ListTodo,
};
const TYPE_COLOR: Record<string, string> = {
  trigger: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  condition: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
  flow: 'border-slate-400 bg-slate-50 dark:bg-slate-800/40',
  data: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  action: 'border-violet-400 bg-violet-50 dark:bg-violet-900/20',
};

/* ---- custom node ---- */
function WorkflowNodeCard({ data, selected }: NodeProps) {
  const nd: any = data;
  const Icon = ICONS[nd.icon] || Zap;
  const branches: string[] = nd.branches || [];
  return (
    <div className={`rounded-xl border-2 shadow-sm px-3 py-2 min-w-[170px] ${TYPE_COLOR[nd.nodeType] || TYPE_COLOR.flow} ${selected ? 'ring-2 ring-emerald-500' : ''}`}>
      {nd.nodeType !== 'trigger' && <Handle type="target" position={Position.Top} />}
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-700 dark:text-slate-200 shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{nd.nodeType}</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{nd.label}</div>
        </div>
      </div>
      {branches.length > 0 ? (
        <div className="flex justify-around mt-2 pt-1">
          {branches.map((b, i) => (
            <div key={b} className="relative px-2">
              <span className="text-[9px] font-bold text-slate-500">{b}</span>
              <Handle type="source" position={Position.Bottom} id={b}
                style={{ left: `${((i + 0.5) / branches.length) * 100}%` }} />
            </div>
          ))}
        </div>
      ) : nd.nodeType !== 'flow' || nd.key !== 'flow.stop' ? (
        <Handle type="source" position={Position.Bottom} />
      ) : null}
    </div>
  );
}
const nodeTypes = { wfNode: WorkflowNodeCard };

function WorkflowBuilderInner({ workflowId, onBack }: WorkflowBuilderProps) {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<CatalogNode[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [wfId, setWfId] = useState<string | null>(workflowId);
  const [name, setName] = useState('Untitled workflow');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [runResult, setRunResult] = useState<any>(null);
  const idCounter = useRef(1);

  /* load catalog + (optional) existing workflow */
  useEffect(() => {
    fetchWithAuth('/workflows/catalog').then(d => setCatalog(d.nodes || [])).catch(() => {});
    if (workflowId) {
      fetchWithAuth(`/workflows/${workflowId}`).then(wf => {
        setName(wf.name || 'Untitled workflow');
        const v = wf.current_version;
        if (v) {
          setNodes((v.nodes || []).map((n: any) => toRFNode(n)));
          setEdges((v.edges || []).map((e: any) => ({ ...e })));
        }
      }).catch(() => {});
    }
  }, [workflowId]);

  const catByKey = useCallback((k: string) => catalog.find(c => c.key === k), [catalog]);

  function toRFNode(n: any): Node {
    const cat = catalog.find(c => c.key === n.key);
    return {
      id: n.id, type: 'wfNode',
      position: n.position || { x: 250, y: 100 },
      data: {
        label: n.label || cat?.label || n.key, key: n.key, nodeType: n.type,
        icon: cat?.icon, branches: cat?.branches, config: n.config || {},
      },
    };
  }

  const onConnect = useCallback((c: Connection) => setEdges(eds => addEdge({ ...c, id: `e${Date.now()}` }, eds)), [setEdges]);

  const addNode = (cat: CatalogNode) => {
    if (cat.type === 'trigger' && nodes.some(n => (n.data as any).nodeType === 'trigger')) {
      setStatus('Only one trigger allowed'); return;
    }
    const id = `n${Date.now()}_${idCounter.current++}`;
    setNodes(nds => [...nds, {
      id, type: 'wfNode',
      position: { x: 120 + Math.random() * 240, y: 80 + nds.length * 90 },
      data: { label: cat.label, key: cat.key, nodeType: cat.type, icon: cat.icon, branches: cat.branches, config: {} },
    }]);
    setShowPalette(false);
  };

  const selected = nodes.find(n => n.id === selectedId);
  const selectedCat = selected ? catByKey((selected.data as any).key) : null;

  const updateConfig = (field: string, value: any) => {
    setNodes(nds => nds.map(n => n.id === selectedId
      ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, [field]: value } } } : n));
  };
  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes(nds => nds.filter(n => n.id !== selectedId));
    setEdges(eds => eds.filter(e => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  /* serialize RF -> backend shape */
  const serialize = () => ({
    nodes: nodes.map(n => {
      const d: any = n.data;
      return { id: n.id, type: d.nodeType, key: d.key, label: d.label, position: n.position, config: d.config || {} };
    }),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle || null })),
  });

  const save = async (): Promise<string | null> => {
    setStatus('Saving...');
    try {
      const { nodes: n, edges: e } = serialize();
      const trigger = { type: n.find(x => x.type === 'trigger')?.key || '' };
      let id = wfId;
      if (!id) {
        const created = await fetchWithAuth('/workflows', {
          method: 'POST', body: JSON.stringify({ name, nodes: n, edges: e, trigger }) });
        id = created.id; setWfId(id);
      } else {
        await fetchWithAuth(`/workflows/${id}`, {
          method: 'PUT', body: JSON.stringify({ name, nodes: n, edges: e, trigger }) });
      }
      setStatus('Saved ✓');
      return id;
    } catch (err: any) { setStatus('Save failed: ' + err.message); return null; }
  };

  const publish = async () => {
    const id = await save();
    if (!id) return;
    try {
      const r = await fetchWithAuth(`/workflows/${id}/publish`, { method: 'POST' });
      setStatus(r.warnings?.length ? `Published (warnings: ${r.warnings.length})` : 'Published ✓');
    } catch (err: any) { setStatus('Publish failed: ' + err.message); }
  };

  const runNow = async () => {
    const id = await save();
    if (!id) return;
    setStatus('Running...');
    try {
      const r = await fetchWithAuth(`/workflows/${id}/run`, {
        method: 'POST', body: JSON.stringify({ dryRun: true }) });
      setRunResult(r);
      setStatus(`Dry-run ${r.status} — ${r.steps?.length || 0} steps`);
    } catch (err: any) { setStatus('Run failed: ' + err.message); }
  };

  const filteredCatalog = catalog.filter(c =>
    c.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(paletteSearch.toLowerCase()));
  const grouped = filteredCatalog.reduce((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c); return acc;
  }, {} as Record<string, CatalogNode[]>);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t('back', { defaultValue: 'Back' })}
          </button>
          <input value={name} onChange={e => setName(e.target.value)}
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-slate-500 mr-2">{status}</span>}
          <button onClick={() => setShowPalette(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200">
            <Plus className="w-4 h-4" /> {t('add_node', { defaultValue: 'Add node' })}
          </button>
          <button onClick={runNow} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200">
            <Play className="w-4 h-4" /> {t('test_run', { defaultValue: 'Test run' })}
          </button>
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200">
            <Save className="w-4 h-4" /> {t('save', { defaultValue: 'Save' })}
          </button>
          <button onClick={publish} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold">
            <Rocket className="w-4 h-4" /> {t('publish', { defaultValue: 'Publish' })}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-slate-400">
                <Zap className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t('workflow_empty_hint', { defaultValue: 'Add a trigger node to start building' })}</p>
              </div>
            </div>
          )}
        </div>

        {/* Inspector */}
        {selected && selectedCat && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedCat.label}</h3>
              <div className="flex gap-1">
                <button onClick={deleteSelected} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setSelectedId(null)} className="p-1.5 text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <p className="text-xs text-slate-500">{selectedCat.description}</p>
              {selectedCat.configFields.length === 0 && (
                <p className="text-xs text-slate-400 italic">{t('no_config_needed', { defaultValue: 'No configuration needed.' })}</p>
              )}
              {selectedCat.configFields.map(f => {
                const val = (selected.data as any).config?.[f.name] ?? '';
                return (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={val} onChange={e => updateConfig(f.name, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5">
                        <option value="">—</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' || f.type === 'json' ? (
                      <textarea value={typeof val === 'object' ? JSON.stringify(val) : val}
                        onChange={e => updateConfig(f.name, e.target.value)} rows={4}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 resize-none" />
                    ) : (
                      <input type={f.type === 'number' ? 'number' : 'text'} value={val}
                        onChange={e => updateConfig(f.name, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Run result drawer */}
      {runResult && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-44 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Test run — {runResult.status}</span>
            <button onClick={() => setRunResult(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-col gap-1">
            {(runResult.steps || []).map((s: any, i: number) => (
              <div key={i} className="text-xs flex gap-2">
                <span className={`font-bold ${s.status === 'completed' ? 'text-emerald-600' : s.status === 'failed' ? 'text-red-500' : 'text-slate-400'}`}>{s.status}</span>
                <span className="text-slate-600 dark:text-slate-300">{s.node_key}</span>
                <span className="text-slate-400 truncate">{JSON.stringify(s.output)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Palette modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPalette(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-[560px] max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input autoFocus value={paletteSearch} onChange={e => setPaletteSearch(e.target.value)}
                  placeholder={t('search_nodes', { defaultValue: 'Search nodes...' })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-4">
              {(Object.entries(grouped) as [string, CatalogNode[]][]).map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2">{cat}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map(c => {
                      const Icon = ICONS[c.icon] || Zap;
                      return (
                        <button key={c.key} onClick={() => addNode(c)}
                          className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-left transition-colors">
                          <Icon className="w-4 h-4 mt-0.5 text-slate-600 dark:text-slate-300 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800 dark:text-white">{c.label}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-2">{c.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}
