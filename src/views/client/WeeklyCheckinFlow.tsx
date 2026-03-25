import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';

// --- Types & Interfaces ---
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

interface WeeklyCheckinFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

// --- Reusable UI Primitives ---
const Chip = ({ label, selected, onClick }: any) => (
  <button onClick={onClick}
    type="button"
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap
      ${selected ? 'bg-[#17cf54] text-white border-[#17cf54] shadow-md shadow-[#17cf54]/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'}`}
  >{label}</button>
);

const OptionCard = ({ label, selected, onClick }: any) => (
  <div onClick={onClick}
    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center text-center text-sm font-bold h-full
      ${selected ? 'border-[#17cf54] bg-[#17cf54]/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-[#17cf54]/50'}`}
  >{label}</div>
);

const Section = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined">{icon}</span></div>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

const FieldLabel = ({ children, mandatory }: any) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
    {children}
    {mandatory && <span className="text-rose-500">*</span>}
  </h3>
);

// --- Main Component ---
export default function WeeklyCheckinFlow({ onComplete, onCancel }: WeeklyCheckinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [model, setModel] = useState<CheckInModel | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load assigned model or default
  useEffect(() => {
    // For this implementation, we'll try to find a mock assignment in localStorage
    const loadModel = () => {
      const savedModels = localStorage.getItem('check_in_models');
      const models: CheckInModel[] = savedModels ? JSON.parse(savedModels) : [];
      
      // Try to get assigned model for current user
      // For this implementation, we'll try to find an assignment in localStorage
      // In a real scenario, this would come from the client's profile in the database
      const assignedModelId = localStorage.getItem('current_client_model_id') || 'standard-weekly';
      const selected = models.find(m => m.id === assignedModelId) || models.find(m => m.isDefault) || models[0];
      
      if (selected) {
        setModel(selected);
      } else {
        // Fallback to a hardcoded standard model if nothing in localStorage
        setModel({
          id: 'standard-weekly',
          name: 'Estándar',
          description: 'Basic following',
          questions: [
            { id: 'overallWeek', category: 'General', label: 'Cómo ha ido la semana?', type: 'select', options: ['Muy mal', 'Mal', 'Normal', 'Bien', 'Excelente'], isMandatory: true },
            { id: 'weight', category: 'Cuerpo', label: 'Peso actual', type: 'number', unit: 'kg', isMandatory: true },
            { id: 'nutritionAdherence', category: 'Nutrición', label: 'Cumplimiento nutricional', type: 'select', options: ['Perfecto (>95%)', 'Bueno (80-95%)', 'Medio (50-80%)', 'Pobre (<50%)'], isMandatory: true }
          ]
        });
      }
    };
    loadModel();
  }, []);

  if (!model) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#17cf54]"></div>
    </div>
  );

  // Group questions by category to create pages
  const categories = Array.from(new Set(model.questions.map(q => q.category)));
  const totalSteps = categories.length + 2; // Intro + Categories + Summary

  const updateAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const toggleArrayItem = (id: string, item: string) => {
    const current = answers[id] || [];
    if (current.includes(item)) {
      updateAnswer(id, current.filter((i: string) => i !== item));
    } else {
      updateAnswer(id, [...current, item]);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/check-ins/client/check-ins', {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          data_json: {
            ...answers,
            model_id: model.id,
            model_name: model.name
          }
        })
      });
      onComplete();
    } catch (err) {
      console.error('Error submitting check-in:', err);
      alert('Hubo un error al enviar el check-in. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Functions ---
  const renderIntro = () => (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#17cf54]/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
              <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter">Reporte Semanal</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{model.name}</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-3 py-1 bg-amber-100 text-amber-600 rounded-full uppercase tracking-widest border border-amber-200">Pendiente</span>
        </div>
        
        <div className="space-y-6">
          <p className="text-slate-500 font-medium leading-relaxed">
            Un buen reporte nos permite ajustar tu plan con precisión. Tómate 5 minutos para contarnos cómo ha ido tu semana.
          </p>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preguntas</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">{model.questions.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiempo Est.</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">~4 min</span>
            </div>
          </div>

          <button 
            onClick={nextStep} 
            className="w-full bg-[#17cf54] hover:bg-[#15b84a] text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-lg shadow-xl shadow-[#17cf54]/20 uppercase tracking-tight group"
          >
            Empezar Ahora
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
      
      <button onClick={onCancel} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Volver al panel</button>
    </div>
  );

  const renderQuestion = (q: CheckInQuestion) => {
    switch (q.type) {
      case 'number':
        return (
          <div key={q.id} className="space-y-2">
            <FieldLabel mandatory={q.isMandatory}>{q.label}</FieldLabel>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="--"
                className="w-full text-4xl font-black bg-transparent border-b-4 border-slate-100 dark:border-slate-800 py-4 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-100 dark:placeholder:text-slate-800"
              />
              {q.unit && <div className="absolute right-0 bottom-6 text-xl font-black text-slate-300 uppercase">{q.unit}</div>}
            </div>
          </div>
        );
      case 'select':
      case 'chips':
        return (
          <div key={q.id} className="space-y-3">
            <FieldLabel mandatory={q.isMandatory}>{q.label}</FieldLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {q.options?.map(opt => (
                <OptionCard 
                  key={opt} 
                  label={opt} 
                  selected={answers[q.id] === opt} 
                  onClick={() => updateAnswer(q.id, opt)} 
                />
              ))}
            </div>
          </div>
        );
      case 'multi-chips':
        return (
          <div key={q.id} className="space-y-3">
            <FieldLabel mandatory={q.isMandatory}>{q.label}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {q.options?.map(opt => (
                <Chip 
                  key={opt} 
                  label={opt} 
                  selected={(answers[q.id] || []).includes(opt)} 
                  onClick={() => toggleArrayItem(q.id, opt)} 
                />
              ))}
            </div>
          </div>
        );
      case 'photo':
        return (
          <div key={q.id} className="space-y-3">
            <FieldLabel mandatory={q.isMandatory}>{q.label}</FieldLabel>
            <label className="aspect-[4/5] rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 hover:border-[#17cf54] hover:text-[#17cf54] transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/20 overflow-hidden relative group max-w-[200px]">
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => updateAnswer(q.id, reader.result);
                  reader.readAsDataURL(file);
                }
              }} />
              {answers[q.id] ? (
                <img src={answers[q.id]} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{q.label}</span>
                </>
              )}
            </label>
          </div>
        );
      default: // text
        return (
          <div key={q.id} className="space-y-3">
            <FieldLabel mandatory={q.isMandatory}>{q.label}</FieldLabel>
            <textarea 
              value={answers[q.id] || ''}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              placeholder="Escribe aquí..."
              className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] outline-none transition-all font-medium text-sm resize-none shadow-inner"
            />
          </div>
        );
    }
  };

  const renderCategoryPage = (catIdx: number) => {
    const category = categories[catIdx];
    const categoryQuestions = model.questions.filter(q => q.category === category);
    
    return (
      <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
        <Section 
          title={category} 
          subtitle={`${categoryQuestions.length} preguntas`}
          icon="insights"
        >
          <div className="space-y-12">
            {categoryQuestions.map(q => renderQuestion(q))}
          </div>
        </Section>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 p-8 shadow-xl max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
          <span className="material-symbols-outlined text-4xl">task_alt</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">¡Todo listo!</h2>
        <p className="text-slate-500 font-medium mt-2">Revisa tus respuestas antes de enviar el reporte final.</p>
      </div>

      <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {model.questions.map(q => (
          <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-400 capitalize">{q.label}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
              {answers[q.id] ? (q.type === 'photo' ? 'Imagen adjunta' : (Array.isArray(answers[q.id]) ? answers[q.id].join(', ') : answers[q.id])) : '--'}
            </span>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#17cf54] hover:bg-[#15b84a] text-white py-5 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-xl shadow-xl shadow-[#17cf54]/20 uppercase tracking-tight disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <span className="material-symbols-outlined">send</span>
            Enviar Reporte
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col py-8 px-4 md:px-8">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentStep === 0 ? 'Inicio' : (currentStep === totalSteps - 1 ? 'Resumen' : `Sección ${currentStep} de ${totalSteps - 2}`)}
          </span>
          <span className="text-[10px] font-black text-[#17cf54] uppercase tracking-widest">
            {Math.round((currentStep / (totalSteps - 1)) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#17cf54] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(23,207,84,0.5)]" 
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} 
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        {currentStep === 0 && renderIntro()}
        {currentStep > 0 && currentStep < totalSteps - 1 && renderCategoryPage(currentStep - 1)}
        {currentStep === totalSteps - 1 && renderSummary()}
      </div>

      {/* Navigation Controls */}
      {currentStep > 0 && (
        <div className="max-w-2xl mx-auto w-full mt-8 flex items-center justify-between">
          <button 
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Anterior
          </button>
          
          {currentStep < totalSteps - 1 && (
            <button 
              onClick={nextStep}
              className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-[#17cf54] hover:text-[#17cf54] transition-all shadow-sm"
            >
              Siguiente
            </button>
          )}
        </div>
      )}
    </div>
  );
}
