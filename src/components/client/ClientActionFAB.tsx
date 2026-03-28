import React from 'react';
import { motion } from 'framer-motion';

interface ClientActionFABProps {
  onboardingData: any;
  onOpenOnboarding: () => void;
  onOpenCheckIn: () => void;
}

export default function ClientActionFAB({ onboardingData, onOpenOnboarding, onOpenCheckIn }: ClientActionFABProps) {
  const today = new Date().getDay();
  const isWeekend = today === 6 || today === 0; // Saturday=6, Sunday=0

  // Priority 1: Onboarding
  if (onboardingData) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenOnboarding}
        className="fixed bottom-8 right-8 z-[150] w-16 h-16 rounded-full bg-gradient-to-br from-[#17cf54] to-[#15b84a] shadow-xl shadow-emerald-500/40 flex items-center justify-center text-white group"
      >
        <div className="absolute inset-0 rounded-full bg-[#17cf54] animate-ping opacity-20" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">rocket_launch</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-[#17cf54]">
            <div className="w-1.5 h-1.5 bg-[#17cf54] rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
           <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Setup Profile</p>
        </div>
      </motion.button>
    );
  }

  // Priority 2: Weekly Check-in (Sat/Sun)
  if (isWeekend) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenCheckIn}
        className="fixed bottom-8 right-8 z-[150] w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/40 flex items-center justify-center text-white group"
      >
        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">assignment</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-blue-500">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
           <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Check-in Semanal</p>
        </div>
      </motion.button>
    );
  }

  return null;
}
