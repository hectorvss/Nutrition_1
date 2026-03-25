import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  ChevronRight,
  GripVertical,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CheckInQuestion {
  id: string;
  category: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'chips' | 'multi-chips' | 'photo';
  options?: string[];
  isMandatory: boolean;
  unit?: string;
}

interface CheckInModel {
  id: string;
  name: string;
  description: string;
  questions: CheckInQuestion[];
  isDefault?: boolean;
}

interface CheckInModelsProps {
  onBack: () => void;
}

// Initial default models based on the existing flow
const INITIAL_MODELS: CheckInModel[] = [
  {
    id: 'standard-weekly',
    name: 'Estándar Semanal',
    description: 'Check-in completo recomendado para la mayoría de clientes.',
    isDefault: true,
    questions: [
      { id: 'overallWeek', category: 'Overall', label: '¿Cómo ha ido la semana en general?', type: 'select', options: ['Muy mal', 'Mal', 'Normal', 'Bien', 'Excelente'], isMandatory: true },
      { id: 'weight', category: 'Body', label: 'Peso actual', type: 'number', unit: 'kg', isMandatory: true },
      { id: 'nutritionAdherence', category: 'Nutrition', label: 'Cumplimiento nutricional', type: 'select', options: ['Perfecto (>95%)', 'Bueno (80-95%)', 'Medio (50-80%)', 'Pobre (<50%)'], isMandatory: true },
      { id: 'trainingAdherence', category: 'Training', label: 'Cumplimiento de entrenamiento', type: 'select', options: ['Todas las sesiones', 'Me salté 1', 'Me salté 2+', 'No entrené'], isMandatory: true },
      { id: 'photoFront', category: 'Photos', label: 'Foto Frontal', type: 'photo', isMandatory: false },
      { id: 'photoSide', category: 'Photos', label: 'Foto Lateral', type: 'photo', isMandatory: false },
      { id: 'photoBack', category: 'Photos', label: 'Foto Trasera', type: 'photo', isMandatory: false }
    ]
  },
  {
    id: 'fat-loss-focus',
    name: 'Pérdida de Grasa',
    description: 'Enfocado en medidas corporales y hambre/ansiedad.',
    questions: [
      { id: 'weight', category: 'Body', label: 'Peso actual', type: 'number', unit: 'kg', isMandatory: true },
      { id: 'waist', category: 'Body', label: 'Medida cintura', type: 'number', unit: 'cm', isMandatory: false },
      { id: 'hunger', category: 'Biofeedback', label: 'Nivel de hambre', type: 'select', options: ['Muy bajo', 'Bajo', 'Manejable', 'Alto', 'Extremo'], isMandatory: true },
      { id: 'cravings', category: 'Biofeedback', label: 'Intensidad de antojos', type: 'select', options: ['Ninguno', 'Leves', 'Moderados', 'Fuertes'], isMandatory: false }
    ]
  }
];

export default function CheckInModels({ onBack }: CheckInModelsProps) {
  const [models, setModels] = useState<CheckInModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('check_in_models');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModels(parsed);
        if (parsed.length > 0) setSelectedModelId(parsed[0].id);
      } catch (e) {
        setModels(INITIAL_MODELS);
        setSelectedModelId(INITIAL_MODELS[0].id);
      }
    } else {
      setModels(INITIAL_MODELS);
      setSelectedModelId(INITIAL_MODELS[0].id);
    }
  }, []);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('check_in_models', JSON.stringify(models));
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Modelos guardados correctamente' });
      setTimeout(() => setMessage(null), 3000);
    }, 800);
  };

  const handleUpdateModel = (updatedModel: CheckInModel) => {
    setModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
  };

  const handleAddModel = () => {
    const newId = `model-${Date.now()}`;
    const newModel: CheckInModel = {
      id: newId,
      name: 'Nuevo Modelo',
      description: 'Sin descripción',
      questions: [...INITIAL_MODELS[0].questions.filter(q => q.isMandatory)]
    };
    setModels(prev => [...prev, newModel]);
    setSelectedModelId(newId);
  };

  const handleDeleteModel = (id: string) => {
    if (models.length <= 1) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      const nextModels = models.filter(m => m.id !== id);
      setModels(nextModels);
      if (selectedModelId === id) setSelectedModelId(nextModels[0].id);
    }
  };

  const addQuestion = () => {
    if (!selectedModel) return;
    const newQuestion: CheckInQuestion = {
      id: `q-${Date.now()}`,
      category: 'General',
      label: 'Nueva Pregunta',
      type: 'text',
      isMandatory: false
    };
    handleUpdateModel({
      ...selectedModel,
      questions: [...selectedModel.questions, newQuestion]
    });
  };

  const removeQuestion = (qId: string) => {
    if (!selectedModel) return;
    const question = selectedModel.questions.find(q => q.id === qId);
    if (question?.isMandatory) return;
    
    handleUpdateModel({
      ...selectedModel,
      questions: selectedModel.questions.filter(q => q.id !== qId)
    });
  };

  const updateQuestion = (qId: string, updates: Partial<CheckInQuestion>) => {
    if (!selectedModel) return;
    handleUpdateModel({
      ...selectedModel,
      questions: selectedModel.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Modelos de Check-in</h1>
            <p className="text-xs text-slate-500 font-medium">Gestiona las plantillas de seguimiento para tus clientes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1
              ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {message.text}
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Models List */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={handleAddModel}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Modelo
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {models.map(model => (
              <div 
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all border-2
                  ${selectedModelId === model.id 
                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${selectedModelId === model.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {model.name}
                  </span>
                  {selectedModelId !== model.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <HelpCircle className="w-3 h-3" />
                    {model.questions.length} Preguntas
                  </div>
                  {model.isDefault && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
          {selectedModel ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Model Info Header */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre del Modelo</label>
                      <input 
                        type="text" 
                        value={selectedModel.name}
                        onChange={(e) => handleUpdateModel({ ...selectedModel, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Descripción</label>
                      <textarea 
                        value={selectedModel.description}
                        onChange={(e) => handleUpdateModel({ ...selectedModel, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                  <div className="bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                        <Info className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Reglas del Modelo</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-emerald-800/70 dark:text-emerald-500/70 font-medium">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        Las preguntas marcadas como obligatorias son críticas para los KPIs del Panel de Analytics.
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        Puedes personalizar las etiquetas y añadir nuevas preguntas específicas por objetivo.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Preguntas del Check-in</h3>
                  <button 
                    onClick={addQuestion}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir Pregunta
                  </button>
                </div>

                <div className="space-y-4 pb-20">
                  {selectedModel.questions.map((q, idx) => (
                    <div 
                      key={q.id}
                      className={`group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all
                        ${q.isMandatory ? 'border-amber-100 dark:border-amber-900/30' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-2 text-slate-300">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col justify-center pr-2">
                             <span className="text-xl font-black text-slate-200 dark:text-slate-800">{(idx + 1).toString().padStart(2, '0')}</span>
                          </div>
                          
                          <div className="md:col-span-5">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Título de la Pregunta</label>
                            <input 
                              type="text"
                              value={q.label}
                              onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                              className="w-full text-sm font-bold text-slate-700 dark:text-slate-200 bg-transparent border-none p-0 focus:ring-0 outline-none placeholder:text-slate-300"
                              placeholder="Ej: ¿Cómo has dormido?"
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                {q.category}
                              </span>
                              {q.isMandatory && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                                  <AlertCircle className="w-2.5 h-2.5" /> Mandatorio
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de Respuesta</label>
                            <select 
                              value={q.type}
                              disabled={q.isMandatory}
                              onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                              className="w-full text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                            >
                              <option value="text">Texto Libre</option>
                              <option value="number">Numérico</option>
                              <option value="select">Selección Única</option>
                              <option value="chips">Chips (Única)</option>
                              <option value="multi-chips">Multi-Chips</option>
                              <option value="photo">Foto / Multimedia</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                             {q.type === 'number' && (
                               <div>
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidad</label>
                                 <input 
                                   type="text"
                                   value={q.unit || ''}
                                   onChange={(e) => updateQuestion(q.id, { unit: e.target.value })}
                                   className="w-full text-xs font-bold text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-lg border-none py-2 px-3 shadow-sm"
                                   placeholder="kg, cm..."
                                 />
                               </div>
                             )}
                             {(q.type === 'select' || q.type === 'chips' || q.type === 'multi-chips') && (
                               <div>
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Opciones</label>
                                 <p className="text-[10px] font-bold text-slate-500 truncate">{q.options?.length || 0} opciones</p>
                                 <button 
                                   onClick={() => {
                                     const current = q.options?.join('\n') || '';
                                     const updated = window.prompt('Introduce las opciones separadas por saltos de línea:', current);
                                     if (updated !== null) {
                                       updateQuestion(q.id, { options: updated.split('\n').filter(o => o.trim()) });
                                     }
                                   }}
                                   className="text-[10px] font-bold text-emerald-500 mt-1 hover:underline"
                                 >
                                   Editar opciones
                                 </button>
                               </div>
                             )}
                          </div>

                          <div className="md:col-span-1 flex items-center justify-end">
                            {!q.isMandatory && (
                              <button 
                                onClick={() => removeQuestion(q.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Settings className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold">Selecciona un modelo para empezar a editar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
