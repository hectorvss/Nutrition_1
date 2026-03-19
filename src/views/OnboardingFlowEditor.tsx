import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Edit2, 
  Check, 
  ChevronUp, 
  Image as ImageIcon, 
  Type, 
  Diamond, 
  MousePointer2, 
  Smartphone, 
  ArrowRight,
  Bolt,
  Shield,
  Badge,
  Accessibility,
  Weight,
  Cake,
  Users,
  Ruler,
  Scale,
  Mail,
  User,
  Activity,
  Heart,
  Stethoscope,
  History,
  Target,
  Camera,
  FileText,
  IdCard,
  PenTool,
  Calendar,
  Gavel,
  Clock,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  X,
  LayoutList,
  ChevronDown,
  Filter,
  Search,
  CheckCircle2,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithAuth } from '../api';

interface OnboardingFlowEditorProps {
  flowId?: string;
  onBack: () => void;
}

type StepId = 'welcome' | 'profile' | 'health' | 'files' | 'agreement' | 'confirmation';

export default function OnboardingFlowEditor({ flowId, onBack }: OnboardingFlowEditorProps) {
  const [activeStep, setActiveStep] = useState<string>('welcome');
  const [title, setTitle] = useState('New Onboarding Flow');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [blocks, setBlocks] = useState<any[]>([
    { id: 'welcome', type: 'header', title: 'Welcome to your new journey', subtitle: "Let's get you set up for success.", imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop' }
  ]);
  const [loading, setLoading] = useState(!!flowId);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (flowId) {
      loadFlow();
    }
  }, [flowId]);

  const loadFlow = async () => {
    try {
      const data = await fetchWithAuth(`/manager/onboarding/${flowId}`);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status);
      setBlocks(data.content || []);
      if (data.content?.length > 0) {
        setActiveStep(data.content[0].id);
      }
    } catch (err) {
      console.error('Failed to load flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isPublishing = false) => {
    setIsSaving(true);
    try {
      const payload = {
        id: flowId,
        title,
        description,
        content: blocks,
        status: isPublishing ? 'published' : status
      };
      await fetchWithAuth('/manager/onboarding', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!isPublishing) {
        alert('Flow saved as draft!');
      }
    } catch (err) {
      console.error('Failed to save flow:', err);
      alert('Error saving flow');
    } finally {
      setIsSaving(false);
    }
  };


  const updateBlock = (id: string, updates: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const renderStepSettings = () => {
    const block = blocks.find(b => b.id === activeStep);
    if (!block) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutListIcon className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900">Step Settings</h2>
          </div>
          <select 
            value={block.type}
            onChange={(e) => updateBlock(block.id, { type: e.target.value })}
            className="rounded-lg border-slate-200 text-sm py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="header">Header Block</option>
            <option value="text">Text Block</option>
            <option value="list">Item List</option>
            <option value="cta">CTA Button</option>
          </select>
        </div>
        
        {block.type === 'header' && (
          <SettingCard icon={ImageIcon} title="Hero Header">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Subtitle</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                  value={block.subtitle || ''}
                  onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Image URL</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                  value={block.imageUrl || ''}
                  onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </SettingCard>
        )}

        {block.type === 'text' && (
          <>
            <SettingCard icon={Type} title="Block Title">
              <input 
                type="text" 
                className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                value={block.title || ''}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              />
            </SettingCard>
            <SettingCard icon={FileText} title="Content Text">
              <textarea 
                className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5 h-32 resize-none"
                value={block.content || ''}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              />
            </SettingCard>
          </>
        )}

        {block.type === 'list' && (
          <SettingCard icon={Diamond} title="Key Points">
            <div className="space-y-3">
              {(block.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 rounded-xl border-slate-200 bg-white text-slate-900 text-sm py-2"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [])];
                      newItems[idx] = e.target.value;
                      updateBlock(block.id, { items: newItems });
                    }}
                  />
                  <button 
                    onClick={() => {
                      const newItems = (block.items || []).filter((_: any, i: number) => i !== idx);
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateBlock(block.id, { items: [...(block.items || []), 'New Point'] })}
                className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </SettingCard>
        )}

        {block.type === 'cta' && (
          <SettingCard icon={MousePointer2} title="Button Action">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Button Label</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="e.g. Get Started"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Button Subtitle (optional)</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5"
                  value={block.subtitle || ''}
                  onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                />
              </div>
            </div>
          </SettingCard>
        )}

        <button 
          onClick={() => {
            const index = blocks.findIndex(b => b.id === activeStep);
            const newId = `block-${Date.now()}`;
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, { id: newId, type: 'text', title: 'New Step', content: '...' });
            setBlocks(newBlocks);
            setActiveStep(newId);
          }}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Insert Step Below</span>
        </button>
      </div>
    );
  };

  const renderPreview = () => {
    const block = blocks.find(b => b.id === activeStep);
    if (!block) return null;

    return (
      <div className="flex flex-col h-full">
        {block.type === 'header' && (
          <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
            {block.imageUrl ? (
              <img src={block.imageUrl} className="w-full h-full object-cover opacity-60" alt="Preview" />
            ) : (
              <div className="w-full h-full bg-emerald-600/20 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-emerald-500/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold text-white mb-2">{block.title || 'Step Title'}</h3>
              <p className="text-slate-300 text-sm">{block.subtitle || 'Step subtitle goes here'}</p>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {block.type === 'text' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{block.title || 'The Importance of Nutrition'}</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {block.content || 'Your nutrition is the foundation of your success...'}
              </p>
            </div>
          )}

          {block.type === 'list' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Key Benefits</h4>
              <div className="space-y-3">
                {(block.items || []).map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {block.type === 'cta' && (
            <div className="pt-4">
              <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center gap-1 group transition-all hover:bg-emerald-600">
                <span>{block.title || 'Continue'}</span>
                {block.subtitle && <span className="text-[10px] font-medium text-emerald-100 opacity-80">{block.subtitle}</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 px-6 md:px-8 lg:px-10 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold text-slate-900 border-none p-0 focus:ring-0 bg-transparent"
              />
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wide ${
                status === 'published' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2">
              <span>{blocks.length} Steps</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{isSaving ? 'Saving...' : 'All changes saved'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium text-sm shadow-sm shadow-emerald-500/30"
          >
            Publish Flow
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-12 h-full">
        {/* Left Sidebar - Steps */}
        <div className="col-span-12 lg:col-span-3 bg-white border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Flow Steps</h2>
            <button 
              onClick={() => {
                const newId = `block-${Date.now()}`;
                setBlocks([...blocks, { id: newId, type: 'text', title: 'New Step', content: 'Enter your content here...' }]);
                setActiveStep(newId);
              }}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>
          <div className="space-y-2">
            {blocks.map((block, index) => {
              const isActive = activeStep === block.id;
              
              return (
                <button
                  key={block.id}
                  onClick={() => setActiveStep(block.id)}
                  className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 relative overflow-hidden text-left ${
                    isActive 
                      ? 'bg-emerald-50/50 border-emerald-500/20' 
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className={`text-sm truncate ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                      {block.title || 'Untitled Step'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wide ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {block.type} Block
                    </span>
                  </div>
                  {isActive ? (
                    <Edit2 className="w-4 h-4 text-emerald-600 ml-auto" />
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlocks(blocks.filter(b => b.id !== block.id));
                        if (activeStep === block.id) setActiveStep(blocks[0]?.id || '');
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Section - Settings */}
        <div className="col-span-12 lg:col-span-5 bg-slate-50 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-xl mx-auto">
            {renderStepSettings()}
          </div>
        </div>

        {/* Right Section - Preview */}
        <div className="col-span-12 lg:col-span-4 bg-white border-l border-slate-200 p-8 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="mb-4 flex items-center gap-2 text-slate-400">
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Client Preview</span>
          </div>
          <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-20 flex justify-center">
              <div className="w-32 h-4 bg-black rounded-b-xl"></div>
            </div>
            {renderPreview()}
          </div>
        </div>
      </div>
      {showPublishModal && (
        <PublishModal 
          flowId={flowId} 
          onClose={() => setShowPublishModal(false)}
          onPublished={() => {
            alert('Flow published successfully!');
            onBack();
          }}
        />
      )}
    </div>
  );
}

function PublishModal({ flowId, onClose, onPublished }: { flowId?: string, onClose: () => void, onPublished: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await fetchWithAuth('/manager/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (selectedClients.length === 0) return alert('Select at least one client');
    setPublishing(true);
    try {
      await fetchWithAuth(`/manager/onboarding/${flowId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ user_ids: selectedClients })
      });
      onPublished();
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Error publishing flow');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Publish Flow</h2>
            <p className="text-sm text-slate-500">Select clients to receive this onboarding.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setSelectedClients(selectedClients.length === clients.length ? [] : clients.map(c => c.id))}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider mb-2"
            >
              {selectedClients.length === clients.length ? 'Deselect All' : 'Select All Clients'}
            </button>

            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading clients...</div>
            ) : clients.map(client => (
              <label 
                key={client.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedClients.includes(client.id) ? 'bg-emerald-50 border-emerald-500/30' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {client.full_name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{client.full_name}</p>
                    <p className="text-xs text-slate-500">{client.email}</p>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => {
                    if (selectedClients.includes(client.id)) {
                      setSelectedClients(selectedClients.filter(id => id !== client.id));
                    } else {
                      setSelectedClients([...selectedClients, client.id]);
                    }
                  }}
                  className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 w-5 h-5"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handlePublish}
            disabled={publishing || selectedClients.length === 0}
            className="flex-[2] py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-700">{title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-1'}`} />
    </div>
  );
}

function LayoutListIcon({ className }: { className?: string }) {
  return <LayoutList className={className} />;
}

function XIcon({ className }: { className?: string }) {
  return <X className={className} />;
}

function MessageSquareIcon({ className }: { className?: string }) {
  return <MessageSquare className={className} />;
}
