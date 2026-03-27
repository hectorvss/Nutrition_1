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
  Archive
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate } from '../types/checkIn';
import { DEFAULT_CHECKIN_TEMPLATE } from '../constants/defaultCheckInTemplate';

interface CheckInTemplatesProps {
  onEdit?: (templateId: string) => void;
}

export default function CheckInTemplates({ onEdit }: CheckInTemplatesProps) {
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth('/check-ins/manager/checkin-templates');
      // Normalize templates from API
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

  const handleCreateFromDefault = async () => {
    try {
      const newTemplate = {
        name: 'Standard Check-in',
        description: 'New template based on the standard flow',
        template_schema: DEFAULT_CHECKIN_TEMPLATE.templateSchema,
        is_default: templates.length === 0
      };
      await fetchWithAuth('/check-ins/manager/checkin-templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error creating template: ' + err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}/duplicate`, {
        method: 'POST'
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error duplicating template: ' + err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
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
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const message = `Are you sure you want to remove "${name}"?
It will be archived if it has active submissions.`;
    if (!confirm(message)) return;
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${id}`, {
        method: 'DELETE'
      });
      loadTemplates();
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check-in Templates Library</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage and create custom check-in structures for your clients</p>
        </div>
        <button 
          onClick={handleCreateFromDefault}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Total: {templates.length}</span>
        </div>
      </div>

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-red-900 font-bold">Error Loading Library</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={loadTemplates} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all">
            Try Again
          </button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No templates found</h3>
          <p className="text-slate-500 mt-1 max-w-sm text-sm">
            {searchQuery ? 'Try adjusting your search' : 'Start by creating your first check-in template to use with your clients.'}
          </p>
          {!searchQuery && (
            <button 
              onClick={handleCreateFromDefault}
              className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Initial Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  {template.is_default && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  )}
                  <div className="relative group/menu">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {renamingId === template.id ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500 outline-none text-sm font-bold"
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(template.id)}
                  />
                  <button onClick={() => handleRename(template.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRenamingId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{template.name}</h3>
                  <button 
                    onClick={() => { setRenamingId(template.id); setNewName(template.name); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed min-h-[40px]">
                {template.description || 'No description provided for this template.'}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(template.updatedAt || template.createdAt || '').toLocaleDateString()}
                  </span>
                  <span>{template.templateSchema?.length || 0} Steps</span>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <button 
                    onClick={() => handleSetDefault(template.id)}
                    disabled={template.is_default}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      template.is_default 
                        ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    Set Default
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(template.id, !!template.is_active)}
                    className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all ${
                      template.is_active 
                        ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200' 
                        : 'text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    title={template.is_active ? 'Active' : 'Inactive'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicate(template.id)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id, template.name)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Delete / Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit?.(template.id)}
                    className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
