import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Star, 
  MoreVertical,
  Search,
  Layout,
  Clock,
  ChevronRight,
  AlertCircle,
  Edit2,
  Check,
  X,
  Archive,
  UserPlus,
  Loader2
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate } from '../types/checkIn';
import { useTheme } from '../context/ThemeContext';

interface OnboardingTemplatesProps {
  onEdit?: (templateId: string) => void;
}

export default function OnboardingTemplates({ onEdit }: OnboardingTemplatesProps) {
  const { settings } = useTheme();
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [assigningTemplateId, setAssigningTemplateId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth('/onboarding/manager/templates');
      const normalized = data.map((t: any) => ({
        ...t,
        templateSchema: t.template_schema || t.templateSchema || []
      }));
      setTemplates(normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    try {
      const newTemplate = {
        name: 'New Onboarding Flow',
        description: 'Complete this flow to help us personalize your experience.',
        template_schema: [],
        is_default: templates.length === 0
      };
      const data = await fetchWithAuth('/onboarding/manager/templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });
      if (data?.id) onEdit?.(data.id);
      loadTemplates();
    } catch (err: any) {
      alert('Error creating template: ' + err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      // For now we do a manual duplication if backend doesn't have it yet
      // But let's assume we implement it in onboarding.ts
      await fetchWithAuth(`/onboarding/manager/templates/${id}/duplicate`, {
        method: 'POST'
      }).catch(async () => {
          // Fallback if duplicate route not ready
          const original = templates.find(t => t.id === id);
          if (original) {
              await fetchWithAuth('/onboarding/manager/templates', {
                  method: 'POST',
                  body: JSON.stringify({
                      name: `${original.name} (Copy)`,
                      description: original.description,
                      template_schema: original.templateSchema,
                      is_default: false
                  })
              });
          }
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error duplicating template: ' + err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_default: true })
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error setting default: ' + err.message);
    }
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName.trim() })
      });
      setRenamingId(null);
      setNewName('');
      loadTemplates();
    } catch (err: any) {
      alert('Error renaming template: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await fetchWithAuth(`/onboarding/manager/templates/${id}`, {
        method: 'DELETE'
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
    }
  };

  const openAssignModal = async (id: string) => {
    setAssigningTemplateId(id);
    setLoadingClients(true);
    try {
      const data = await fetchWithAuth('/manager/clients');
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleAssign = async () => {
    if (selectedClients.length === 0 || !assigningTemplateId) return;
    setIsAssigning(true);
    try {
      await Promise.all(selectedClients.map(clientId => 
        fetchWithAuth('/onboarding/manager/assign', {
          method: 'POST',
          body: JSON.stringify({
            client_id: clientId,
            template_id: assigningTemplateId
          })
        })
      ));
      alert('Onboarding assigned successfully!');
      setAssigningTemplateId(null);
      setSelectedClients([]);
    } catch (err: any) {
      alert('Error assigning onboarding: ' + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Onboarding Flow Library</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Design and manage onboarding questionnaires for your clients</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{ backgroundColor: settings.theme_color }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search onboarding flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 font-medium transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading library...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-red-900 font-bold">Error Loading Library</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={loadTemplates} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all">Try Again</button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No onboarding flows found</h3>
          <p className="text-slate-500 mt-1 max-w-sm text-sm">Create your first onboarding template to collect vital information from new clients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                {template.is_default && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                )}
              </div>

              {renamingId === template.id ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500 outline-none text-sm font-bold"
                  />
                  <button onClick={() => handleRename(template.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{template.name}</h3>
                </div>
              )}
              
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed min-h-[40px]">
                {template.description || 'No description provided.'}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(template.updated_at || template.created_at || '').toLocaleDateString()}
                  </span>
                  <span>{template.templateSchema?.length || 0} Steps</span>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <button onClick={() => handleSetDefault(template.id)} disabled={template.is_default} className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${template.is_default ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600'}`}>Set Default</button>
                  <button onClick={() => handleDuplicate(template.id)} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(template.id, template.name)} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => openAssignModal(template.id)} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-500 transition-all" title="Assign to Clients"><UserPlus className="w-4 h-4" /></button>
                  <button onClick={() => onEdit?.(template.id)} style={{ backgroundColor: settings.theme_color }} className="flex items-center justify-center w-10 h-10 text-white rounded-xl hover:opacity-90 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningTemplateId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Onboarding</h2>
                <p className="text-sm text-slate-500 font-medium">Select clients who should receive this flow.</p>
              </div>
              <button 
                onClick={() => { setAssigningTemplateId(null); setSelectedClients([]); }} 
                className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {loadingClients ? (
                <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No clients found.</div>
              ) : clients.map(client => (
                <label 
                  key={client.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedClients.includes(client.id) ? 'bg-emerald-50 border-emerald-500/30' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {client.full_name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{client.full_name}</p>
                      <p className="text-xs text-slate-500 font-medium">{client.email}</p>
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

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => { setAssigningTemplateId(null); setSelectedClients([]); }}
                className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-white transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssign}
                disabled={isAssigning || selectedClients.length === 0}
                style={{ backgroundColor: settings.theme_color }}
                className="flex-[2] py-3 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
