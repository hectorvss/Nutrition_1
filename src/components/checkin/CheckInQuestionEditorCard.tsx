import React from 'react';
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  ChevronDown, 
  Plus, 
  X,
  CheckCircle2,
  LayoutGrid,
  Type,
  Hash,
  Info,
  Camera,
  Ruler,
  Image as ImageIcon
} from 'lucide-react';
import { CheckInQuestion, CheckInStepType } from '../../types/checkIn';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInQuestionEditorCardProps {
  question: CheckInQuestion;
  onUpdate: (updates: Partial<CheckInQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QUESTION_TYPES: { id: CheckInStepType; label: string; icon: any; color: string }[] = [
  { id: 'single_choice', label: 'Single Choice', icon: <CheckCircle2 className="w-4 h-4" />, color: 'emerald' },
  { id: 'multi_select', label: 'Multi Select', icon: <LayoutGrid className="w-4 h-4" />, color: 'blue' },
  { id: 'number', label: 'Number Input', icon: <Hash className="w-4 h-4" />, color: 'orange' },
  { id: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" />, color: 'purple' },
  { id: 'info_card', label: 'Information', icon: <Info className="w-4 h-4" />, color: 'slate' },
  { id: 'photo_group', label: 'Photo Module', icon: <Camera className="w-4 h-4" />, color: 'rose' },
  { id: 'measurement_group', label: 'Measurements', icon: <Ruler className="w-4 h-4" />, color: 'cyan' },
];

export default function CheckInQuestionEditorCard({ 
  question, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: CheckInQuestionEditorCardProps) {
  const { settings } = useTheme();
  const [showTypeSelector, setShowTypeSelector] = React.useState(false);
  const [editingOptionIdx, setEditingOptionIdx] = React.useState<number | null>(null);

  const activeType = QUESTION_TYPES.find(t => t.id === question.type) || QUESTION_TYPES[0];

  const handleUpdateOption = (idx: number, newVal: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[idx] = newVal;
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
    setEditingOptionIdx(newOptions.length - 1);
  };

  const handleRemoveOption = (idx: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== idx);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group/q p-8 space-y-8">
      {/* Header Area */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5 flex-1">
          <div className="mt-1 flex items-center gap-1">
             <div className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl">
                <GripVertical className="w-5 h-5" />
             </div>
          </div>
          <div className="flex-1 space-y-2">
            <input 
              type="text" 
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Question Title..."
              className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-200 tracking-tight"
            />
            <input 
              type="text" 
              value={question.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Add an optional instruction or description..."
              className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-400 focus:ring-0 placeholder:text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover/q:opacity-100 transition-opacity">
          <button 
            onClick={onDuplicate}
            className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-2xl transition-all"
            title="Duplicate Question"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
            title="Delete Question"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: The Interactive Preview */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl p-6 min-h-[100px] border border-slate-50 dark:border-slate-800/50 flex flex-col justify-center">
        
        {/* Render Choice Preview */}
        {(question.type === 'single_choice' || question.type === 'multi_select') && (
          <div className="flex flex-wrap gap-3">
             {question.options?.map((opt, idx) => (
                <div 
                  key={idx}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all group/opt
                    ${editingOptionIdx === idx 
                      ? 'bg-white border-brand-primary shadow-lg scale-105 z-10' 
                      : 'bg-white border-slate-100 hover:border-brand-primary hover:shadow-sm'}`}
                  style={editingOptionIdx === idx ? { borderColor: settings.theme_color } : {}}
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0
                    ${question.type === 'single_choice' ? 'rounded-full' : 'rounded-md'}`} 
                  />
                  
                  {editingOptionIdx === idx ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={opt}
                      onChange={(e) => handleUpdateOption(idx, e.target.value)}
                      onBlur={() => setEditingOptionIdx(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingOptionIdx(null)}
                      className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 w-max min-w-[60px]"
                    />
                  ) : (
                    <span 
                      onClick={() => setEditingOptionIdx(idx)}
                      className="text-sm font-bold text-slate-600 cursor-text"
                    >
                      {opt}
                    </span>
                  )}

                  <button 
                    onClick={() => handleRemoveOption(idx)}
                    className="opacity-0 group-hover/opt:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
             ))}
             <button 
               onClick={handleAddOption}
               style={{ color: settings.theme_color, borderColor: `${settings.theme_color}40` }}
               className="px-5 py-3 rounded-2xl border-2 border-dashed text-slate-400 hover:opacity-80 transition-all flex items-center gap-2 text-sm font-bold"
             >
               <Plus className="w-4 h-4" />
               Add Option
             </button>
          </div>
        )}

        {/* Render Number Preview */}
        {question.type === 'number' && (
          <div className="flex items-center gap-4 max-w-xs">
            <div className="flex-1 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 flex items-center justify-between">
              <span className="text-slate-300 font-bold tracking-widest text-[11px]">VALUE</span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={question.unit || ''}
                  onChange={(e) => onUpdate({ unit: e.target.value })}
                  placeholder="Unit"
                  style={{ color: settings.theme_color, backgroundColor: `${settings.theme_color}10` }}
                  className="border-none rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-center focus:ring-0 min-w-[40px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Render Text Preview */}
        {question.type === 'text' && (
          <div className="w-full h-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-end">
             <div className="h-0.5 w-full bg-slate-50 mb-2 rounded-full" />
             <div className="h-0.5 w-3/4 bg-slate-50 mb-4 rounded-full" />
             <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Type your answer...</span>
          </div>
        )}

        {/* Render Info Preview */}
        {question.type === 'info_card' && (
          <div 
            className="w-full rounded-2xl border p-6 flex items-start gap-4"
            style={{ backgroundColor: `${settings.theme_color}08`, borderColor: `${settings.theme_color}20` }}
          >
             <div 
               className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: `${settings.theme_color}15`, color: settings.theme_color }}
             >
                <Info className="w-6 h-6" />
             </div>
             <p className="text-sm font-semibold leading-relaxed italic" style={{ color: settings.theme_color }}>
               This card will display the description text above as a highlighted information block for your client.
             </p>
          </div>
        )}

        {/* Render Photo Module Preview */}
        {question.type === 'photo_group' && (
          <div className="grid grid-cols-3 gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="aspect-square bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-300 transition-all hover:bg-slate-50">
                  <ImageIcon className="w-8 h-8 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Photo {i}</span>
               </div>
             ))}
          </div>
        )}

        {/* Render Measurements Preview */}
        {question.type === 'measurement_group' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['Chest', 'Waist', 'Hips', 'Thigh'].map(m => (
               <div key={m} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{m}</span>
                  <div className="h-8 bg-slate-50 rounded-lg" />
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Footer Area: Type Selector & Settings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
        <div className="relative">
          <button 
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            style={{ backgroundColor: settings.theme_color }}
            className="flex items-center justify-between gap-3 px-8 py-3.5 min-w-[280px] rounded-2xl text-white text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20 active:scale-95 z-20"
          >
            <div className="flex items-center gap-3">
              {activeType.icon}
              <span>{activeType.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTypeSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showTypeSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] shadow-2xl z-40 p-3 overflow-hidden"
              >
                <div className="py-2 px-4 mb-2">
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Select Question Type</span>
                </div>
                {QUESTION_TYPES.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => {
                      onUpdate({ type: type.id });
                      setShowTypeSelector(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-[11px] font-semibold transition-all group/item ${
                      question.type === type.id 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${question.type === type.id ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-700'}`}>
                         {type.icon}
                      </div>
                      {type.label}
                    </div>
                    {question.type === type.id && <CheckCircle2 className="w-4 h-4 opacity-40" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-5">
           <label className="flex items-center gap-2 cursor-pointer group/toggle">
              <input 
                type="checkbox" 
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="hidden"
              />
              <div 
                className={`w-10 h-6 rounded-full p-1 transition-all ${question.required ? 'bg-emerald-500' : 'bg-slate-200'}`}
                style={question.required ? { backgroundColor: settings.theme_color } : {}}
              >
                 <div className={`w-4 h-4 bg-white rounded-full transition-all ${question.required ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required</span>
           </label>

           <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

           <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300 uppercase italic">
              ID: {question.id.substring(0, 8)}...
           </div>
        </div>
      </div>
    </div>
  );
}
