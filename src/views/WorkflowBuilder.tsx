import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, Handle, Position, useReactFlow,
  MarkerType, ConnectionLineType,
  type Node, type Edge, type Connection, type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Rocket, Play, Trash2, X, Search,
  Zap, GitBranch, Send, Clock, Square, Pencil, ListTodo, Shuffle,
  UserPlus, ClipboardCheck, MessageCircle, GripVertical,
  Scale, FileCheck, Dumbbell,
  AlarmClockOff, CalendarDays, BadgeCheck, ClipboardList, CalendarClock,
  Database, Calculator, CalendarPlus, ClipboardPlus, UserCog, PenSquare, BellRing,
  Cake, UserSearch, FileSearch, Bell, Tag,
  CreditCard, DollarSign, XCircle, Mail, Utensils, Star,
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

/* ---- types ---- */
interface CatalogNode {
  type: string; key: string; label: string; category: string;
  icon: string; description: string;
  configFields: { name: string; label: string; type: string; options?: string[]; source?: string }[];
  branches?: string[];
}
// Dynamic option lists keyed by configField.source (templates, clients…).
type ConfigOptions = Record<string, Array<{ value: string; label: string }>>;
interface WorkflowBuilderProps {
  workflowId: string | null;
  onBack: () => void;
}

const ICONS: Record<string, React.ElementType> = {
  Play, UserPlus, ClipboardCheck, MessageCircle, Clock,
  GitBranch, Shuffle, Timer: Clock, Square, Pencil, Send, ListTodo,
  Scale, FileCheck, Dumbbell,
  AlarmClockOff, CalendarDays,
  BadgeCheck, ClipboardList, CalendarClock,
  Database, Calculator,
  CalendarPlus, ClipboardPlus, UserCog, PenSquare, BellRing,
  Cake, UserSearch, FileSearch, Bell, Tag,
  CreditCard, DollarSign, XCircle, Mail, Utensils, Star,
};

// Minimalist palette: one colour accent per node type rendered as a thin left
// strip + a soft icon badge. The card itself stays white for a clean,
// professional look that doesn't visually compete with the canvas.
interface TypeStyle { stripe: string; iconBg: string; iconText: string }
const TYPE_STYLE: Record<string, TypeStyle> = {
  trigger:   { stripe: 'bg-emerald-500', iconBg: 'bg-emerald-50',  iconText: 'text-emerald-600' },
  condition: { stripe: 'bg-amber-500',   iconBg: 'bg-amber-50',    iconText: 'text-amber-600'   },
  flow:      { stripe: 'bg-slate-400',   iconBg: 'bg-slate-100',   iconText: 'text-slate-600'   },
  data:      { stripe: 'bg-blue-500',    iconBg: 'bg-blue-50',     iconText: 'text-blue-600'    },
  action:    { stripe: 'bg-violet-500',  iconBg: 'bg-violet-50',   iconText: 'text-violet-600'  },
};
const styleFor = (t: string): TypeStyle => TYPE_STYLE[t] || TYPE_STYLE.flow;

const DND_MIME = 'application/wf-node';

/* ---- custom node — minimalist, professional ---- */
function WorkflowNodeCard({ data, selected }: NodeProps) {
  const nd: any = data;
  const Icon = ICONS[nd.icon] || Zap;
  // flow.switch declares its branches dynamically via the `branches` config
  // field (comma-separated) — plus an implicit "default" outlet — so the
  // card renders one labelled output handle per route.
  const branches: string[] = nd.key === 'flow.switch'
    ? [...String(nd.config?.branches || '').split(',').map((s: string) => s.trim()).filter(Boolean), 'default']
    : (nd.branches || []);
  const isStop = nd.key === 'flow.stop';
  const s = styleFor(nd.nodeType);
  // NOTE: the card must NOT use `overflow-hidden`. React Flow handles sit on
  // the card edge and stick half-way out; clipping them is what made the
  // connection dots look "cut off". Corners are rounded on the inner pieces
  // (accent strip + branch footer) so we keep clean edges without clipping.
  const handleBase = '!w-3 !h-3 !rounded-full !border-2 !border-white dark:!border-slate-900 !shadow-sm transition-colors';
  return (
    <div
      className={`relative bg-white dark:bg-slate-900 rounded-lg border min-w-[210px] transition-shadow ${
        selected
          ? 'border-emerald-400 shadow-md ring-2 ring-emerald-500/15'
          : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Left accent strip — only colour signal for the node type. */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${s.stripe}`} />

      {nd.nodeType !== 'trigger' && (
        <Handle type="target" position={Position.Top}
          className={`${handleBase} !bg-slate-400 hover:!bg-slate-600`} />
      )}

      <div className="pl-3 pr-3 py-2.5 flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${s.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${s.iconText}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-[0.08em] font-semibold text-slate-400 leading-tight">
            {nd.nodeType}
          </div>
          <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight mt-0.5">
            {nd.label}
          </div>
        </div>
      </div>

      {branches.length > 0 ? (
        <div className="flex border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-lg">
          {branches.map((b, i) => (
            <div key={b} className="relative flex-1 px-2 py-1.5 text-center first:border-r first:border-slate-100 dark:first:border-slate-800">
              <span className="text-[9px] uppercase tracking-wide font-semibold text-slate-500">{b}</span>
              <Handle type="source" position={Position.Bottom} id={b}
                className={`${handleBase} !bg-emerald-500 hover:!bg-emerald-600`}
                style={{ left: `${((i + 0.5) / branches.length) * 100}%` }} />
            </div>
          ))}
        </div>
      ) : !isStop ? (
        <Handle type="source" position={Position.Bottom}
          className={`${handleBase} !bg-emerald-500 hover:!bg-emerald-600`} />
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
  const [configOptions, setConfigOptions] = useState<ConfigOptions>({});
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
    // Real-data option lists for the config dropdowns (templates, clients…).
    fetchWithAuth('/workflows/config-options')
      .then(d => setConfigOptions(d || {}))
      .catch(() => {});
  }, []);

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
  // New edges inherit the same smoothstep + arrowhead styling as defaultEdgeOptions
  // so a freshly drawn connection looks identical to a loaded one.
  const onConnect = useCallback((c: Connection) =>
    setEdges(eds => addEdge({
      ...c,
      id: `e${Date.now()}_${nodeSeq++}`,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#10b981' },
      style: { strokeWidth: 2, stroke: '#10b981' },
    }, eds)), [setEdges]);

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
    } catch (err: any) {
      const msg = String(err?.message || '');
      // Detect the plan-cap 402 response from the backend (makeEnforceLimit).
      if (msg.includes('plan_limit_reached') || msg.toLowerCase().includes('activeworkflows')) {
        setStatus(t('workflow_limit_reached', {
          defaultValue: 'You have reached the active-workflow limit for your plan. Unpublish one or upgrade to activate this workflow.',
        }));
      } else {
        setStatus('Publish failed: ' + msg);
      }
    }
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
                <div className="flex flex-col gap-1">
                  {(items as CatalogNode[]).map(c => {
                    const Icon = ICONS[c.icon] || Zap;
                    const s = styleFor(c.type);
                    return (
                      <div key={c.key} draggable
                        onDragStart={e => onDragStart(e, c.key)}
                        onClick={() => clickAdd(c)}
                        title={c.description}
                        className="group relative flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-sm transition-all overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${s.stripe}`} />
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${s.iconBg}`}>
                          <Icon className={`w-3 h-3 ${s.iconText}`} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate flex-1">{c.label}</span>
                        <GripVertical className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
            // Consistent edge styling: smoothstep curves with an arrowhead so
            // the direction of every connection is unambiguous.
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#94a3b8' },
              style: { strokeWidth: 2, stroke: '#94a3b8' },
            }}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={{ strokeWidth: 2, stroke: '#10b981' }}
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
                // Dynamic source (templates/clients) wins over static options.
                const dynOpts = f.source ? (configOptions[f.source] || []) : null;
                return (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.label}</label>
                    {f.type === 'select' && dynOpts ? (
                      <>
                        <Select value={val} onChange={(v) => updateConfig(f.name, v)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5">
                          <option value="">{t('select_one', { defaultValue: '— Elige una opción —' })}</option>
                          {dynOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                        {dynOpts.length === 0 && (
                          <span className="text-[11px] text-amber-600">
                            {t('no_options_available', { defaultValue: 'No hay elementos disponibles — crea uno primero.' })}
                          </span>
                        )}
                      </>
                    ) : f.type === 'select' ? (
                      <Select value={val} onChange={(v) => updateConfig(f.name, v)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1.5">
                        <option value="">—</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </Select>
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
