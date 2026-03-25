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
  AlertCircle,
  Clock,
  Layout,
  Layers,
  Camera,
  LineChart,
  Target
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

// Full set of default questions based on the premium experience
const DEFAULT_QUESTIONS: CheckInQuestion[] = [
  // Overall
  { id: 'overallWeek', category: 'General', label: '¿Cómo ha ido la semana en general?', type: 'select', options: ['Muy mal', 'Mal', 'Normal', 'Bien', 'Excelente'], isMandatory: true },
  
  // Body - MANDATORY
  { id: 'weight', category: 'Cuerpo', label: 'Peso actual', type: 'number', unit: 'kg', isMandatory: true },
  { id: 'visibleChanges', category: 'Cuerpo', label: '¿Has notado cambios visuales?', type: 'select', options: ['Ninguno', 'Leves', 'Moderados', 'Notables'], isMandatory: false },
  { id: 'biggestChangeArea', category: 'Cuerpo', label: '¿En qué zona has notado más cambio?', type: 'multi-chips', options: ['Cintura', 'Abdomen', 'Piernas', 'Glúteos', 'Brazos', 'Espalda', 'Cara', 'General'], isMandatory: false },
  { id: 'satisfaction', category: 'Cuerpo', label: 'Nivel de satisfacción con el progreso', type: 'select', options: ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'], isMandatory: false },
  
  // Nutrition - MANDATORY
  { id: 'nutritionAdherence', category: 'Nutrición', label: 'Cumplimiento nutricional (%)', type: 'select', options: ['Perfecto (>95%)', 'Bueno (80-95%)', 'Medio (50-80%)', 'Pobre (<50%)'], isMandatory: true },
  { id: 'hitCalories', category: 'Nutrición', label: '¿Cumpliste el objetivo de calorías?', type: 'select', options: ['Sí, a diario', 'Casi siempre', 'Por encima', 'Por debajo', 'No lo sé'], isMandatory: false },
  { id: 'hitProtein', category: 'Nutrición', label: '¿Cumpliste el objetivo de proteínas?', type: 'select', options: ['Sí, a diario', 'La mayoría', 'A veces', 'Rara vez', 'No lo sé'], isMandatory: false },
  
  // Biofeedback
  { id: 'energy', category: 'Biofeedback', label: 'Nivel de energía', type: 'select', options: ['Muy bajo', 'Bajo', 'Normal', 'Alto', 'Excelente'], isMandatory: false },
  { id: 'sleep', category: 'Biofeedback', label: 'Calidad del sueño', type: 'select', options: ['Muy mala', 'Mala', 'Normal', 'Buena', 'Excelente'], isMandatory: false },
  { id: 'hunger', category: 'Biofeedback', label: 'Nivel de hambre', type: 'chips', options: ['Muy bajo', 'Bajo', 'Manejable', 'Alto', 'Extremo'], isMandatory: false },
  { id: 'digestion', category: 'Biofeedback', label: 'Digestión', type: 'select', options: ['Muy mala', 'Mala', 'Normal', 'Buena', 'Excelente'], isMandatory: false },
  
  // Training
  { id: 'trainingAdherence', category: 'Entrenamiento', label: 'Sesiones completadas', type: 'number', unit: 'sesiones', isMandatory: true },
  { id: 'effort', category: 'Entrenamiento', label: 'Esfuerzo/Intensidad media', type: 'select', options: ['Bajo', 'Medio', 'Alto', 'Extremo'], isMandatory: false },
  { id: 'performance', category: 'Entrenamiento', label: 'Rendimiento en el entrenamiento', type: 'select', options: ['Mal', 'Normal', 'Bien', 'Muy bien', 'Récord personal'], isMandatory: false },
  
  // Photos
  { id: 'photoFront', category: 'Fotos', label: 'Foto Frontal', type: 'photo', isMandatory: false },
  { id: 'photoSide', category: 'Fotos', label: 'Foto Lateral', type: 'photo', isMandatory: false },
  { id: 'photoBack', category: 'Fotos', label: 'Foto Trasera', type: 'photo', isMandatory: false }
];

const INITIAL_MODELS: CheckInModel[] = [
  {
    id: 'standard-weekly',
    name: 'Estándar Semanal',
    description: 'Check-in completo recomendado para la mayoría de clientes. Cubre KPIs críticos.',
    isDefault: true,
    questions: DEFAULT_QUESTIONS
  },
  {
    id: 'fat-loss-focus',
    name: 'Pérdida de Grasa',
    description: 'Enfocado en medidas corporales y hambre/ansiedad.',
    questions: DEFAULT_QUESTIONS.filter(q => ['weight', 'waist', 'hunger', 'cravings', 'overallWeek', 'nutritionAdherence'].includes(q.id))
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
      questions: [...DEFAULT_QUESTIONS.filter(q => q.isMandatory)]
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

  // Group questions by category for the categories view
  const categories = selectedModel ? Array.from(new Set(selectedModel.questions.map(q => q.category))) : [];

  return (
    <div className="flex flex-col h-full bg-[#f6f8f6] dark:bg-[#112116]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-100 dark:border-slate-800 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Modelos de Check-in</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedModel?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1
              ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {message.text}
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Models List */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col pt-4">
          <div className="px-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleAddModel}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Modelo
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 pt-6">
            <div className="px-2 mb-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plantillas Disponibles</h3>
            </div>
            {models.map(model => (
              <div 
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`group p-5 rounded-3xl cursor-pointer transition-all border-2 relative overflow-hidden
                  ${selectedModelId === model.id 
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl' 
                    : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-md'}`}
              >
                {selectedModelId === model.id && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full -mr-6 -mt-6" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-black uppercase tracking-tight ${selectedModelId === model.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
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
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2">
                  {model.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    <Layers className="w-3 h-3" />
                    {model.questions.length} Preguntas
                  </div>
                  {model.isDefault && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {selectedModel ? (
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Info & Config Header */}
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row gap-8">
                   <div className="flex-1 space-y-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Configuración del Modelo</label>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                           <div>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Identificador Visual</span>
                              <input 
                                type="text" 
                                value={selectedModel.name}
                                onChange={(e) => handleUpdateModel({ ...selectedModel, name: e.target.value })}
                                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 outline-none placeholder:text-slate-100 uppercase tracking-tighter"
                              />
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Resumen Estratégico</span>
                              <textarea 
                                value={selectedModel.description}
                                onChange={(e) => handleUpdateModel({ ...selectedModel, description: e.target.value })}
                                rows={2}
                                className="w-full text-sm font-medium text-slate-500 dark:text-slate-400 bg-transparent border-none p-0 focus:ring-0 outline-none resize-none leading-relaxed"
                                placeholder="..."
                              />
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="w-full md:w-80">
                      <div className="bg-emerald-500 dark:bg-emerald-900/20 p-8 rounded-3xl shadow-xl shadow-emerald-500/20 text-white flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Target className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Business Rules</span>
                        </div>
                        <h4 className="text-lg font-black leading-tight uppercase tracking-tighter mb-4">Control de Calidad de Datos</h4>
                        <p className="text-xs text-emerald-50/70 font-bold leading-relaxed">
                          Las preguntas críticas para el Dashboard de Analytics están bloqueadas. Puedes editar sus títulos pero no eliminarlas.
                        </p>
                        <div className="mt-auto pt-6 flex items-center gap-6">
                           <div>
                              <div className="text-[10px] font-black uppercase text-emerald-300 block mb-1">Mandatorios</div>
                              <div className="text-2xl font-black">{selectedModel.questions.filter(q => q.isMandatory).length}</div>
                           </div>
                           <div className="w-px h-8 bg-white/10" />
                           <div>
                              <div className="text-[10px] font-black uppercase text-emerald-300 block mb-1">Flexibles</div>
                              <div className="text-2xl font-black">{selectedModel.questions.filter(q => !q.isMandatory).length}</div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Categorised Question List */}
              <div className="space-y-12">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                      <Layout className="w-4 h-4 text-emerald-500" />
                      Estructura del Formulario
                    </h3>
                    <button 
                      onClick={addQuestion}
                      className="px-5 py-2.5 bg-[#17cf54] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#17cf54]/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir Campo
                    </button>
                 </div>

                 <div className="space-y-16 pb-32">
                    {categories.map(category => (
                      <div key={category} className="space-y-8">
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-[#17cf54] uppercase tracking-tighter bg-[#17cf54]/10 px-4 py-1.5 rounded-xl border border-[#17cf54]/20">
                              {category}
                            </span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                         </div>

                         <div className="grid grid-cols-1 gap-6">
                            {selectedModel.questions.filter(q => q.category === category).map((q, idx) => (
                              <div 
                                key={q.id}
                                className={`group bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all p-8 relative
                                  ${q.isMandatory ? 'border-slate-50 dark:border-slate-800 shadow-sm' : 'border-transparent hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 shadow-md'}`}
                              >
                                {q.isMandatory && (
                                  <div className="absolute top-4 right-4 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                )}
                                
                                <div className="flex flex-col lg:flex-row gap-8">
                                   <div className="flex-shrink-0 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8 lg:min-w-[120px]">
                                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Orden</span>
                                         <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{(idx + 1).toString().padStart(2, '0')}</span>
                                      </div>
                                   </div>

                                   <div className="flex-1 space-y-6">
                                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                         <div className="flex-1">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Título de la Pregunta</label>
                                            <input 
                                              type="text"
                                              value={q.label}
                                              onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                                              className="w-full text-xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 outline-none placeholder:text-slate-100 uppercase tracking-tight"
                                              placeholder="..."
                                            />
                                         </div>

                                         <div className="w-full sm:w-48 shrink-0">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Dato</label>
                                            <select 
                                              value={q.type}
                                              disabled={q.isMandatory}
                                              onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                                              className="w-full text-xs font-black text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl border-none p-3 shadow-inner focus:ring-2 focus:ring-emerald-500 transition-all uppercase tracking-widest"
                                            >
                                              <option value="text">Texto</option>
                                              <option value="number">Métrica</option>
                                              <option value="select">Selección</option>
                                              <option value="chips">Chips</option>
                                              <option value="multi-chips">Habilidades</option>
                                              <option value="photo">Multimedia</option>
                                            </select>
                                         </div>
                                      </div>

                                      {/* Preview / Detailed Config Area */}
                                      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                         {(q.type === 'select' || q.type === 'chips' || q.type === 'multi-chips') && (
                                            <div className="space-y-4">
                                               <div className="flex items-center justify-between">
                                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vista Previa de Opciones</span>
                                                  <button 
                                                    onClick={() => {
                                                      const current = q.options?.join('\n') || '';
                                                      const updated = window.prompt('Introduce las opciones separadas por saltos de línea:', current);
                                                      if (updated !== null) {
                                                        updateQuestion(q.id, { options: updated.split('\n').filter(o => o.trim()) });
                                                      }
                                                    }}
                                                    className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                                                  >
                                                    Editar Valores
                                                  </button>
                                               </div>
                                               <div className="flex flex-wrap gap-2">
                                                  {q.options?.map(opt => (
                                                    <div key={opt} className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-tight">
                                                      {opt}
                                                    </div>
                                                  ))}
                                                  {(!q.options || q.options.length === 0) && <span className="text-[10px] text-slate-300 font-bold italic">Cero opciones configuradas</span>}
                                               </div>
                                            </div>
                                         )}

                                         {q.type === 'number' && (
                                            <div className="flex items-center gap-4">
                                               <div className="flex-1">
                                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unidad de Medida</span>
                                                  <input 
                                                    type="text"
                                                    value={q.unit || ''}
                                                    onChange={(e) => updateQuestion(q.id, { unit: e.target.value })}
                                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                                    placeholder="Ej: kg"
                                                  />
                                               </div>
                                               <div className="flex-shrink-0 text-center px-8 border-l border-slate-100 dark:border-slate-800">
                                                  <LineChart className="w-5 h-5 text-emerald-500 mb-1 mx-auto" />
                                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tracking KPI</span>
                                               </div>
                                            </div>
                                         )}

                                         {q.type === 'photo' && (
                                            <div className="flex items-center gap-4">
                                               <Camera className="w-5 h-5 text-emerald-500" />
                                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entrada de Cámara Habilitada</span>
                                            </div>
                                         )}

                                         {q.type === 'text' && (
                                            <div className="text-[10px] text-slate-400 font-bold italic">Input de texto multilínea para respuestas abiertas.</div>
                                         )}
                                      </div>
                                   </div>

                                   <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                                      <div className={`p-2 rounded-xl border flex items-center justify-center transition-all
                                        ${q.isMandatory ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}>
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      
                                      {!q.isMandatory && (
                                        <button 
                                          onClick={() => removeQuestion(q.id)}
                                          className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all transform hover:-rotate-12"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                   </div>
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl mb-4 text-emerald-500/20">
                <Settings className="w-10 h-10 animate-spin-slow" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Selecciona un modelo estratégico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
