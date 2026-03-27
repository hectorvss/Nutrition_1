import React from 'react';

export const Chip = ({ label, selected, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    type="button"
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap
      ${selected ? 'bg-[#17cf54] text-white border-[#17cf54] shadow-md shadow-[#17cf54]/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {label}
  </button>
);

export const OptionCard = ({ label, selected, onClick, disabled }: any) => (
  <div 
    onClick={disabled ? undefined : onClick}
    className={`p-3 rounded-xl border transition-all flex items-center justify-center text-center text-sm font-bold
      ${selected ? 'border-[#17cf54] bg-[#17cf54]/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-[#17cf54]/50'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {label}
  </div>
);

export const Section = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      )}
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

export const FieldLabel = ({ children }: any) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{children}</h3>
);
