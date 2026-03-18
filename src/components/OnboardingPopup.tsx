import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Clock,
  ChevronRight
} from 'lucide-react';
import { fetchWithAuth } from '../api';

interface OnboardingPopupProps {
  onComplete: () => void;
}

export default function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const [flows, setFlows] = useState<any[]>([]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadOnboarding();
  }, []);

  const loadOnboarding = async () => {
    try {
      const data = await fetchWithAuth('/client/onboarding');
      if (data && data.length > 0) {
        setFlows(data);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to load onboarding:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (flows.length === 0) return null;

  const currentFlow = flows[currentFlowIndex];
  const flowContent = currentFlow.onboarding_messages.content || [];
  const currentBlock = flowContent[currentBlockIndex];

  const handleNext = async () => {
    if (currentBlockIndex < flowContent.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      // Flow completed
      await markAsCompleted();
    }
  };

  const markAsCompleted = async () => {
    setCompleting(true);
    try {
      await fetchWithAuth(`/client/onboarding/${currentFlow.id}/complete`, {
        method: 'POST'
      });
      
      if (currentFlowIndex < flows.length - 1) {
        setCurrentFlowIndex(currentFlowIndex + 1);
        setCurrentBlockIndex(0);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (!currentBlock) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative aspect-[9/16] max-h-[800px]"
      >
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={() => onComplete()}
            className="p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-800 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentBlock.type === 'header' && (
          <div className="relative h-2/5 w-full bg-slate-900 overflow-hidden shrink-0">
            {currentBlock.imageUrl && (
              <img src={currentBlock.imageUrl} className="w-full h-full object-cover opacity-70" alt="Onboarding" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl font-bold text-white mb-2 leading-tight">{currentBlock.title}</h3>
              <p className="text-slate-300 text-base">{currentBlock.subtitle}</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide flex flex-col">
          {currentBlock.type === 'text' && (
            <div className="space-y-6 flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{currentBlock.title}</h3>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {currentBlock.content}
              </p>
            </div>
          )}

          {currentBlock.type === 'list' && (
            <div className="space-y-6 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">What's included:</h3>
              <div className="space-y-3">
                {(currentBlock.items || []).map((item: string, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-6 h-6" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {currentBlock.type === 'cta' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                <Sparkles className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{currentBlock.title}</h3>
                <p className="text-slate-500 mt-2">{currentBlock.subtitle}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between gap-6">
            <div className="flex gap-1.5">
              {flowContent.map((_: any, i: number) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${i === currentBlockIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`} 
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              disabled={completing}
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-3 transition-all hover:bg-emerald-600 hover:gap-4 disabled:opacity-50"
            >
              <span>{currentBlockIndex === flowContent.length - 1 ? 'Finish' : 'Next Step'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
