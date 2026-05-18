import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, Handle, Position, useReactFlow,
  type Node, type Edge, type Connection, type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Rocket, Play, Trash2, X, Search,
  Zap, GitBranch, Send, Clock, Square, Pencil, ListTodo, Shuffle,
  UserPlus, ClipboardCheck, MessageCircle, GripVertical,
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
  Play: Zap, UserPlus, ClipboardCheck, MessageCircle, Clock,
  GitBranch, Shuffle, Timer: Clock, Square, Pencil, Send, ListTodo,
};
const TYPE_COLOR: Record<string, string> = {
  trigger: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  condition: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
  flow: 'border-slate-400 bg-slate-100 dark:bg-slate-800/60',
  data: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  action: 'border-violet-400 bg-violet-50 dark:bg-violet-900/20',
};
const DND_MIME = 'application/wf-node';

/* ---- custom node ---- */
function WorkflowNodeCard({ data, selected }: NodeProps) {
  const nd: any = data;
  const Icon = ICONS[nd.icon] || Zap;
  const branches: string[] = nd.branches || [];
  const isStop = nd.key === 'flow.stop';
  return (
    <div className={`rounded-xl border-2 shadow-sm px-3 py-2 min-w-[180px] ${TYPE_COLOR[nd.nodeType] || TYPE_COLOR.flow} ${selected ? 'ring-2 ring-emerald-500' : ''}`}>
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
            <div key={b} className="relative px-3">
              <span className="text-[9px] font-bold text-slate-500">{b}</span>
              <Handle type="source" position={Position.Bottom} id={b}
                style={{ left: `${((i + 0.5) / branches.length) * 100}%` }} />
            </div>
          ))}
        </div>
      ) : !isStop ? (
        <Handle type="source" position={Position.Bottom} />
      ) : null}
    </div>
  );
}
const nodeTypes = { wfNode: WorkflowNodeCard };

let nodeSeq = 1;

function WorkflowBuilderInner({ workflowId, onBack }: WorkflowBuilderProps) {
  const { t } = useLanguage();
  const { screenToFlowPosition } = useReactFlow();
  const [catalog, setCatalog] = useState<CatalogNode[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [wfId, setWfId] = useState<string | null>(workflowId);
  const [name, setName] = useState('Untitled workflow');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [status, setStatus] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* load catalog + (optional) existing workflow */
  useEffect(() => {
    let cat: CatalogNode[] = [];
    fetchWithAuth('/workflows/catalog')
      .then(d => { cat = d.nodes || []; setCatalog(cat); })
      .then(() => {
        if (!workflowId) return;
        return fetchWithAuth(`/workflows/${workflowId}`).then(wf => {
          setName(wf.name || 'Untitled workflow');
          const v = wf.current_version;
          if (v) {
            setNodes((v.nodes || []).map((n: any) => toRFNode(n, cat)));
            setEdges((v.edges || []).map((e: any) => ({ ...e })));
          }
        });
      })
      .catch(() => {});
  }, [workflowId]);

  function toRFNode(n: any, cat: CatalogNode[]): Node {
    const c = cat.find(x => x.key === n.key);
    return {
      id: n.id, type: 'wfNode',
      position: n.position || { x: 240, y: 120 },
      data: { label: n.label || c?.label || n.key, key: n.key, nodeType: n.type,
              icon: c?.icon, branches: c?.branches, config: n.config || {} },
    };
  }

  const catByKey = useCallback((k: string) => catalog.find(c => c.key === k), [catalog]);
  const onConnect = useCallback((c: Connection) =>
    setEdges(eds => addEdge({ ...c, id: `e${Date.now()}_${nodeSeq++}` }, eds)), [setEdges]);

  const placeNode = (cat: CatalogNode, position: { x: number; y: number }) => {
    if (cat.type === 'trigger' && nodes.some(n => (n.data as any).nodeType === 'trigger')) {
      setStatus(t('one_trigger_only', { defaultValue: 'A workflow can only have one trigger.' }));
      return;
    }
    const id = `n${Date.now()}_${nodeSeq++}`;
    setNodes(nds => [...nds, {
      id, type: 'wfNode', position,
      data: { label: cat.label, key: cat.key, nodeType: cat.type,
              icon: cat.icon, branches: cat.branches, config: {} },
    }]);
    setSelectedId(id);
    setStatus('');
  };

  /* drag & drop from the palette onto the canvas */
  const onDragStart = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData(DND_MIME, key);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const key = e.dataTransfer.getData(DND_MIME);
    const cat = catByKey(key);
    if (!cat) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    placeNode(cat, position);
  };
  /* click-to-add fallback (drops near the centre of the canvas) */
  const clickAdd = (cat: CatalogNode) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    const center = rect
      ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 })
      : { x: 250, y: 150 };
    placeNode(cat, { x: center.x + (nodes.length % 3) * 40, y: center.y + nodes.length * 20 });
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

  const serialize = () => ({
    nodes: nodes.map(n => {
      const d: any = n.data;
      return { id: n.id, type: d.nodeType, key: d.key, label: d.label, position: n.position, config: d.config || {} };
    }),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle || null })),
  });

  const save = async (): Promise<string | null> => {
    setStatus(t('saving', { defaultValue: 'Saving...' }));
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
      setStatus(t('saved', { defaultValue: 'Saved ✓' }));
      return id;
    } catch (err: any) { setStatus('Save failed: ' + err.message); return null; }
  };

  const publish = async () => {
    const id = await save();
    if (!id) return;
    try {
      const r = await fetchWithAuth(`/workflows/${id}/publish`, { method: 'POST' });
      setStatus(r.warnings?.length
        ? t('published_with_warnings', { defaultValue: `Published (${r.warnings.length} warnings)`, n: r.warnings.length })
        : t('published_ok', { defaultValue: 'Published ✓' }));
    } catch (err: any) { setStatus('Publish failed: ' + err.message); }
  };

  const runNow = async () => {
    const id = await save();
    if (!id) return;
    setStatus(t('running', { defaultValue: 'Running...' }));
    try {
      const r = await fetchWithAuth(`/workflows/${id}/run`, {
        method: 'POST', body: JSON.stringify({ dryRun: true }) });
      setRunResult(r);
      setStatus(`Dry-run: ${r.status} — ${r.steps?.length || 0} steps`);
    } catch (err: any) { setStatus('Run failed: ' + err.message); }
  };

  const filtered = catalog.filter(c =>
    c.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(paletteSearch.toLowerCase()));
  const grouped = filtered.reduce((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c); return acc;
  }, {} as Record<string, CatalogNode[]>);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="text-slate-500 hover:text-emerald-500 flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t('back', { defaultValue: 'Back' })}
          </button>
          <input value={name} onChange={e => setName(e.target.value)}
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-slate-500 mr-2 max-w-[220px] truncate">{status}</span>}
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
        {/* ---- Left: node palette (drag from here) ---- */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={paletteSearch} onChange={e => setPaletteSearch(e.target.value)}
                placeholder={t('search_nodes', { defaultValue: 'Search nodes...' })}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {t('drag_nodes_hint', { defaultValue: 'Drag a node onto the canvas (or click it).' })}
            </p>
          </div>
          <div className="overflow-y-auto p-3 flex flex-col gap-4 flex-1">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">{cat}</div>
                <div className="flex flex-col gap-1.5">
                  {(items as CatalogNode[]).map(c => {
                    const Icon = ICONS[c.icon] || Zap;
                    return (
                      <div key={c.key} draggable
                        onDragStart={e => onDragStart(e, c.key)}
                        onClick={() => clickAdd(c)}
                        title={c.description}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-colors ${TYPE_COLOR[c.type] || 'border-slate-200 dark:border-slate-700'}`}>
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-400 italic">{t('no_matching_nodes', { defaultValue: 'No matching nodes.' })}</p>
            )}
          </div>
        </div>

        {/* ---- Center: canvas ---- */}
        <div ref={wrapperRef} className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            deleteKeyCode={['Backspace', 'Delete']}
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
                <p className="text-sm font-medium">{t('workflow_empty_hint', { defaultValue: 'Drag a trigger from the left panel to start' })}</p>
              </div>
            </div>
          )}
        </div>

        {/* ---- Right: inspector ---- */}
        {selected && selectedCat && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0">
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
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 resize-none font-mono" />
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
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-44 overflow-y-auto p-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Test run — {runResult.status}</span>
            <button onClick={() => setRunResult(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-col gap-1">
            {(runResult.steps || []).map((s: any, i: number) => (
              <div key={i} className="text-xs flex gap-2">
                <span className={`font-bold w-20 shrink-0 ${s.status === 'completed' ? 'text-emerald-600' : s.status === 'failed' ? 'text-red-500' : 'text-slate-400'}`}>{s.status}</span>
                <span className="text-slate-600 dark:text-slate-300 w-40 shrink-0 truncate">{s.node_key}</span>
                <span className="text-slate-400 truncate">{JSON.stringify(s.output)}</span>
              </div>
            ))}
            {(!runResult.steps || runResult.steps.length === 0) && (
              <span className="text-xs text-slate-400 italic">No steps executed.</span>
            )}
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
