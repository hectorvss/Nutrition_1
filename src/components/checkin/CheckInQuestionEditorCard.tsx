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
  Info
} from 'lucide-react';
import { CheckInQuestion, CheckInStepType } from '../../types/checkIn';
import { motion } from 'framer-motion';

interface CheckInQuestionEditorCardProps {
  question: CheckInQuestion;
  onUpdate: (updates: Partial<CheckInQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QUESTION_TYPES: { id: CheckInStepType; label: string; icon: any }[] = [
  { id: 'single_choice', label: 'Single Choice', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'multi_select', label: 'Multi Select', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'number', label: 'Number Input', icon: <Hash className="w-4 h-4" /> },
  { id: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
  { id: 'info_card', label: 'Information', icon: <Info className="w-4 h-4" /> },
];

export default function CheckInQuestionEditorCard({ 
  question, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: CheckInQuestionEditorCardProps) {
  
  const [showTypeSelector, setShowTypeSelector] = React.useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group/q p-6 space-y-6">
      {/* Header Area */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1 flex items-center gap-1">
             <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                <GripVertical className="w-5 h-5" />
             </div>
          </div>
          <div className="flex-1 space-y-1">
            <input 
              type="text" 
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Type your question here..."
              className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300"
            />
            <input 
              type="text" 
              value={question.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Add an optional instruction or description..."
              className="w-full bg-transparent border-none p-0 text-xs font-medium text-slate-400 focus:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover/q:opacity-100 transition-opacity">
          <button 
            onClick={onDuplicate}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl transition-all"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type Selector & Configuration */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
        {/* Inline Type Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-300 transition-all"
          >
            {QUESTION_TYPES.find(t => t.id === question.type)?.icon}
            <span>{QUESTION_TYPES.find(t => t.id === question.type)?.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showTypeSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showTypeSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-2"
              >
                {QUESTION_TYPES.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => {
                      onUpdate({ type: type.id });
                      setShowTypeSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-[11px] font-bold transition-all ${
                      question.type === type.id 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Fields (Unit / Options) */}
        {question.type === 'number' && (
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unit:</span>
             <input 
               type="text" 
               value={question.unit || ''}
               onChange={(e) => onUpdate({ unit: e.target.value })}
               placeholder="kg, cm..."
               className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 w-20 focus:ring-2 focus:ring-emerald-500/20"
             />
          </div>
        )}

        {(question.type === 'single_choice' || question.type === 'multi_select') && (
          <div className="flex-1 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Options:</span>
             <input 
               type="text" 
               value={question.options?.join(', ') || ''}
               onChange={(e) => onUpdate({ options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
               placeholder="Option 1, Option 2, ..."
               className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/20"
             />
          </div>
        )}
      </div>
    </div>
  );
}
