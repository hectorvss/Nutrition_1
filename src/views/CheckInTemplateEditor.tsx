import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  X, 
  Settings2, 
  ListOrdered,
  Layout,
  Type,
  Hash,
  Info,
  CheckSquare,
  CircleDot
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../types/checkIn';
import CheckInStepRenderer from '../components/checkin/CheckInStepRenderer';

interface CheckInTemplateEditorProps {
  templateId: string;
  onClose: () => void;
  onSave?: (template: CheckInTemplate) => void;
}

export default function CheckInTemplateEditor({ templateId, onClose, onSave }: CheckInTemplateEditorProps) {
  const [template, setTemplate] = useState<CheckInTemplate | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/check-ins/manager/checkin-templates`);
        const found = data.find((t: any) => t.id === templateId);
        if (found) {
          // Normalize snake_case from API to camelCase for UI
          setTemplate({
            ...found,
            templateSchema: found.template_schema || found.templateSchema || []
          });
        } else {
          setError('Template not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading template');
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, [templateId]);

  const handleSave = async () => {
    if (!template) return;
    setIsSaving(true);
    try {
      await fetchWithAuth(`/check-ins/manager/checkin-templates/${templateId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: template.name,
          template_schema: template.templateSchema // Send back as snake_case
        })
      });
      if (onSave) onSave(template);
      onClose();
    } catch (err: any) {
      alert('Error saving template: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateStep = (index: number, updates: Partial<CheckInStep>) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    newSchema[index] = { ...newSchema[index], ...updates };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const updateQuestion = (stepIndex: number, questionId: string, updates: Partial<CheckInQuestion>) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    const newQuestions = (newSchema[stepIndex].questions || []).map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    newSchema[stepIndex] = { ...newSchema[stepIndex], questions: newQuestions };
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const addStep = () => {
    if (!template) return;
    const newStep: CheckInStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'question',
      title: 'New Step',
      subtitle: 'Optional description for the client',
      questions: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'single_choice',
          title: 'New Question',
          options: ['Option 1', 'Option 2', 'Option 3']
        }
      ]
    };
    const newSchema = [...template.templateSchema, newStep];
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(newSchema.length - 1);
  };

  const duplicateStep = (index: number) => {
    if (!template) return;
    const stepToCopy = template.templateSchema[index];
    const newStep: CheckInStep = {
      ...stepToCopy,
      id: Math.random().toString(36).substr(2, 9),
      questions: (stepToCopy.questions || []).map(q => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9)
      }))
    };
    const newSchema = [...template.templateSchema];
    newSchema.splice(index + 1, 0, newStep);
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(index + 1);
  };

  const deleteStep = (index: number) => {
    if (!template || template.templateSchema.length <= 1) return;
    if (!confirm('Are you sure you want to delete this step?')) return;
    const newSchema = template.templateSchema.filter((_, i) => i !== index);
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(Math.max(0, index - 1));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSchema.length) return;
    [newSchema[index], newSchema[newIndex]] = [newSchema[newIndex], newSchema[index]];
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(newIndex);
  };

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !template) return (
    <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 m-8">
      <h3 className="text-red-900 font-bold text-lg">Error</h3>
      <p className="text-red-600 mt-2">{error || 'Something went wrong'}</p>
      <button onClick={onClose} className="mt-4 text-emerald-600 font-bold underline">Back to Library</button>
    </div>
  );

  const selectedStep = template.templateSchema[selectedStepIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <input 
            type="text" 
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            className="text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2 py-1 outline-none w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">Auto-saving enabled</span>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-black transition-all disabled:opacity-50"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Template
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Navigator */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Steps Flow</h3>
            <button onClick={addStep} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {template.templateSchema.map((step, idx) => (
              <div 
                key={step.id}
                onClick={() => setSelectedStepIndex(idx)}
                className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border-2
                  ${selectedStepIndex === idx 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-100'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black
                  ${selectedStepIndex === idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <span className="flex-1 text-sm font-bold truncate">{step.title}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); moveStep(idx, 'up'); }} disabled={idx === 0} className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                   <button onClick={(e) => { e.stopPropagation(); moveStep(idx, 'down'); }} disabled={idx === template.templateSchema.length - 1} className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 bg-slate-50 p-12 overflow-y-auto flex justify-center">
          <div className="w-full max-w-2xl space-y-8">
            <div className="flex flex-col items-center">
               <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                 PREVIEW MODE: STEP {selectedStepIndex + 1} OF {template.templateSchema.length}
               </div>
            </div>
            
            <CheckInStepRenderer 
              step={selectedStep}
              answers={{}}
              onUpdateAnswer={() => {}}
              onToggleArrayItem={() => {}}
              isEditMode={true}
            />

            <div className="flex justify-between items-center mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 border-dashed">
               <div className="flex items-center gap-2">
                  <button onClick={() => deleteStep(selectedStepIndex)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Step
                  </button>
                  <button onClick={() => duplicateStep(selectedStepIndex)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedStepIndex(Math.max(0, selectedStepIndex - 1))} className="text-slate-400 hover:text-slate-900 font-bold transition-colors"><ChevronUp className="w-6 h-6 rotate-[-90deg]" /></button>
                  <button onClick={() => setSelectedStepIndex(Math.min(template.templateSchema.length - 1, selectedStepIndex + 1))} className="px-8 py-3 bg-[#17cf54] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#17cf54]/20 hover:bg-black transition-all">
                    Continue <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Step Properties */}
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-4 border-b border-slate-50 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Step Settings</h3>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Step Meta */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Step Title</label>
                <input 
                  type="text" 
                  value={selectedStep.title}
                  onChange={(e) => updateStep(selectedStepIndex, { title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subtitle / Instructions</label>
                <textarea 
                  value={selectedStep.subtitle || ''}
                  onChange={(e) => updateStep(selectedStepIndex, { subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-600 outline-none transition-all h-24 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* Questions Configuration */}
            {(selectedStep.questions || []).map((q, qIdx) => (
              <div key={q.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Question Type</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'single_choice', label: 'Single', icon: CircleDot },
                    { id: 'multi_select', label: 'Multi', icon: CheckSquare },
                    { id: 'number', label: 'Number', icon: Hash },
                    { id: 'long_text', label: 'Text', icon: Type },
                    { id: 'info_card', label: 'Info', icon: Info }
                  ].map(type => (
                    <button 
                      key={type.id}
                      onClick={() => {
                        if (type.id === 'info_card') {
                          updateStep(selectedStepIndex, { type: 'info_card', questions: [] });
                        } else {
                          updateQuestion(selectedStepIndex, q.id, { type: type.id as any });
                          updateStep(selectedStepIndex, { type: 'question' as any });
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5
                        ${(selectedStep.type === 'info_card' ? type.id === 'info_card' : q.type === type.id)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>

                {q.type !== 'info_card' && (
                  <div className="pt-4 space-y-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Options (separated by comma)</label>
                      <textarea 
                        value={(q.options || []).join(', ')}
                        onChange={(e) => {
                          const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          updateQuestion(selectedStepIndex, q.id, { options: opts });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-600 outline-none transition-all h-32 placeholder:text-slate-300"
                        placeholder="Option 1, Option 2, Option 3..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
