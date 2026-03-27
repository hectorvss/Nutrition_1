import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  ChevronRight, 
  GripVertical, 
  Trash2, 
  Layout,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  Info,
  Type,
  Hash,
  Copy,
  PlusCircle
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { CheckInTemplate, CheckInStep, CheckInQuestion } from '../types/checkIn';
import CheckInStepRenderer from '../components/checkin/CheckInStepRenderer';
import { Reorder, AnimatePresence } from 'framer-motion';

interface CheckInTemplateEditorProps {
  templateId: string;
  onClose: () => void;
  onSave?: (template: CheckInTemplate) => void;
}

export default function CheckInTemplateEditor({ templateId, onClose, onSave }: CheckInTemplateEditorProps) {
  const [template, setTemplate] = useState<CheckInTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/check-ins/manager/checkin-templates`);
        const found = data.find((t: any) => t.id === templateId);
        if (found) {
          setTemplate({
            ...found,
            templateSchema: found.template_schema || found.templateSchema || []
          });
        } else {
          setError('Template not found');
        }
      } catch (err) {
        setError('Error loading template');
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
          template_schema: template.templateSchema
        })
      });
      if (onSave) onSave(template);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Error saving template');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStep = (index: number, updatedStep: CheckInStep) => {
    if (!template) return;
    const newSchema = [...template.templateSchema];
    newSchema[index] = updatedStep;
    setTemplate({ ...template, templateSchema: newSchema });
  };

  const addStep = () => {
    if (!template) return;
    const newStep: CheckInStep = {
      id: `step_${Date.now()}`,
      title: 'New Step',
      subtitle: 'Optional description for the client',
      questions: []
    };
    const newSchema = [...template.templateSchema, newStep];
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(newSchema.length - 1);
  };

  const removeStep = (index: number) => {
    if (!template) return;
    if (!confirm('Are you sure you want to delete this step?')) return;
    const newSchema = template.templateSchema.filter((_, i) => i !== index);
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(Math.max(0, index - 1));
  };

  const duplicateStep = (index: number) => {
    if (!template) return;
    const stepToCopy = template.templateSchema[index];
    const newStep: CheckInStep = {
      ...stepToCopy,
      id: `step_${Date.now()}_copy`,
    };
    const newSchema = [...template.templateSchema];
    newSchema.splice(index + 1, 0, newStep);
    setTemplate({ ...template, templateSchema: newSchema });
    setSelectedStepIndex(index + 1);
  };

  const handleReorder = (newOrder: CheckInStep[]) => {
    if (!template) return;
    setTemplate({ ...template, templateSchema: newOrder });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!template || error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm m-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">{error || 'Something went wrong'}</h3>
        <button onClick={onClose} className="mt-4 text-emerald-600 font-bold hover:underline">Return to Library</button>
      </div>
    );
  }

  const selectedStep = template.templateSchema[selectedStepIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Native Page Header */}
      <div className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="bg-transparent border-none text-xl font-bold text-slate-900 dark:text-white p-0 focus:ring-0 min-w-[200px]"
            />
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Template Editor</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {success ? 'All Changes Saved' : 'Live Editing Mode'}
             </div>
             <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Database Connected</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-slate-900/10 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Save className="w-5 h-5" />)}
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Steps Flow (Sidebar) */}
        <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence Flow</h3>
            <button onClick={addStep} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <Reorder.Group axis="y" values={template.templateSchema} onReorder={handleReorder} className="space-y-2">
              <AnimatePresence initial={false}>
                {template.templateSchema.map((step, idx) => (
                  <Reorder.Item 
                    key={step.id} 
                    value={step}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border-2
                      ${selectedStepIndex === idx 
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700'}`}
                  >
                    <div className="p-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                       <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0
                      ${selectedStepIndex === idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <span className="flex-1 text-xs font-bold truncate tracking-tight">{step.title}</span>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
          <div className="p-4 border-t border-slate-50 dark:border-slate-800">
             <button 
               onClick={addStep}
               className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:border-emerald-200 hover:text-emerald-500 transition-all text-[11px] font-bold flex items-center justify-center gap-2"
             >
               <Plus className="w-3.5 h-3.5" />
               New Step Card
             </button>
          </div>
        </div>

        {/* CENTER: Canvas / Preview Area */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12 flex justify-center scroll-smooth">
          <div className="w-full max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col items-center mb-8">
                <div className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm mb-4">
                   Preview Mode: Step {selectedStepIndex + 1} of {template.templateSchema.length}
                </div>
             </div>

             {selectedStep ? (
               <div className="transform scale-[1.02] origin-top transition-transform">
                 <CheckInStepRenderer 
                   step={selectedStep} 
                   answers={{}} 
                   onUpdateAnswer={() => {}} 
                   onToggleArrayItem={() => {}} 
                   onUploadFile={async () => {}}
                 />
                 
                 <div className="mt-12 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                       <button onClick={() => removeStep(selectedStepIndex)} className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete Step
                       </button>
                       <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />
                       <button onClick={() => duplicateStep(selectedStepIndex)} className="flex items-center gap-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Copy className="w-4 h-4" /> Duplicate
                       </button>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                         disabled={selectedStepIndex === 0}
                         onClick={() => setSelectedStepIndex(selectedStepIndex - 1)}
                         className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-all shadow-sm"
                       >
                          <span className="material-symbols-outlined transform rotate-180">arrow_forward</span>
                       </button>
                       <button 
                         onClick={() => setSelectedStepIndex(Math.min(template.templateSchema.length - 1, selectedStepIndex + 1))}
                         className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold flex items-center gap-2 transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95"
                       >
                          Continue <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               </div>
             ) : (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm">
                   <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Editor Canvas Ready</h3>
                   <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">Select or create a step from the flow list on the left to start architecting your check-in.</p>
                   <button onClick={addStep} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                      Create First Step
                   </button>
                </div>
             )}
          </div>
        </div>

        {/* RIGHT: Step Settings (Sidebar) */}
        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
            <Layout className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step Configuration</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {selectedStep ? (
              <>
                {/* Step Title */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Display Title</label>
                  <input 
                    type="text" 
                    value={selectedStep.title}
                    onChange={(e) => updateStep(selectedStepIndex, { ...selectedStep, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Step Subtitle */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subtitle / Context</label>
                  <textarea 
                    value={selectedStep.subtitle || ''}
                    onChange={(e) => updateStep(selectedStepIndex, { ...selectedStep, subtitle: e.target.value })}
                    placeholder="Short description for the client..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none min-h-[100px]"
                  />
                </div>

                {/* Questions Block */}
                <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Card Questions</h4>
                      <button 
                        onClick={() => {
                          const newQ: CheckInQuestion = { id: `q_${Date.now()}`, title: 'New Question', type: 'single_choice', required: true, options: ['Option 1', 'Option 2'] };
                          updateStep(selectedStepIndex, { ...selectedStep, questions: [...(selectedStep.questions || []), newQ] });
                        }}
                        className="p-1 px-2.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-emerald-100 transition-all"
                      >
                        Add Question
                      </button>
                   </div>
                   
                   <div className="space-y-4">
                     {(selectedStep.questions || []).map((q, qIdx) => (
                       <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4 group/q">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-slate-300 uppercase">Question #{qIdx + 1}</span>
                            <button 
                              onClick={() => {
                                const newQs = selectedStep.questions!.filter((_, i) => i !== qIdx);
                                updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                         </div>
                         
                         <div className="space-y-2">
                           <input 
                              type="text" 
                              value={q.title}
                              onChange={(e) => {
                                const newQs = [...selectedStep.questions!];
                                newQs[qIdx] = { ...q, title: e.target.value };
                                updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                              }}
                              placeholder="Title"
                              className="w-full bg-white dark:bg-slate-900 border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-sm"
                           />
                         </div>

                         <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'single_choice', label: 'Single', icon: <CheckCircle2 className="w-3 h-3" /> },
                              { id: 'multi_select', label: 'Multi', icon: <LayoutGrid className="w-3 h-3" /> },
                              { id: 'number', label: 'Number', icon: <Hash className="w-3 h-3" /> },
                              { id: 'text', label: 'Text', icon: <Type className="w-3 h-3" /> },
                              { id: 'info_card', label: 'Info', icon: <Info className="w-3 h-3" /> },
                              { id: 'measurement_group', label: 'Meas.', icon: <Layout className="w-3 h-3" /> },
                              { id: 'photo_group', label: 'Photos', icon: <PlusCircle className="w-3 h-3" /> }
                            ].map(type => (
                              <button 
                                key={type.id}
                                onClick={() => {
                                  const newQs = [...selectedStep.questions!];
                                  newQs[qIdx] = { ...q, type: type.id as any };
                                  updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                                }}
                                className={`px-2 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 border transition-all ${
                                  q.type === type.id 
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                                }`}
                              >
                                 {type.label}
                              </button>
                            ))}
                         </div>

                         {/* Number/Text Extras */}
                         {(q.type === 'number' || q.type === 'text') && (
                           <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-2">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unit</p>
                               <input 
                                 type="text" 
                                 value={q.unit || ''}
                                 onChange={(e) => {
                                   const newQs = [...selectedStep.questions!];
                                   newQs[qIdx] = { ...q, unit: e.target.value };
                                   updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                                 }}
                                 placeholder="kg, cm..."
                                 className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-[11px] font-bold shadow-sm"
                               />
                             </div>
                             <div className="space-y-2">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Placeholder</p>
                               <input 
                                 type="text" 
                                 value={q.placeholder || ''}
                                 onChange={(e) => {
                                   const newQs = [...selectedStep.questions!];
                                   newQs[qIdx] = { ...q, placeholder: e.target.value };
                                   updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                                 }}
                                 placeholder="Enter..."
                                 className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-[11px] font-bold shadow-sm"
                               />
                             </div>
                           </div>
                         )}

                         {/* Options Editor */}
                         {(q.type === 'single_choice' || q.type === 'multi_select') && (
                           <div className="space-y-2">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Options (CSV)</p>
                             <textarea 
                               value={q.options?.join(', ')}
                               onChange={(e) => {
                                 const newQs = [...selectedStep.questions!];
                                 newQs[qIdx] = { ...q, options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') };
                                 updateStep(selectedStepIndex, { ...selectedStep, questions: newQs });
                               }}
                               className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-3 text-[11px] font-medium min-h-[80px] shadow-sm resize-none"
                             />
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
              </>
            ) : (
               <div className="text-center py-20 opacity-50">
                  <Settings className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Selection</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
