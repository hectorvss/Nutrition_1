import React, { useState } from 'react';
import OnboardingTemplates from './OnboardingTemplates';
import OnboardingSubmissions from './OnboardingSubmissions';
import OnboardingFlowEditor from './OnboardingFlowEditor';
import { Layout, History } from 'lucide-react';

export default function OnboardingDashboard() {
  const [view, setView] = useState<'submissions' | 'templates' | 'editor'>('submissions');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  if (view === 'editor') {
    return (
      <OnboardingFlowEditor 
        templateId={editingTemplateId!} 
        onBack={() => {
          setEditingTemplateId(null);
          setView('templates');
        }} 
      />
    );
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Onboarding</h1>
          <p className="text-slate-500 font-medium mt-1">Manage new client intakes and questionnaire templates</p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
          <button 
            onClick={() => setView('submissions')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === 'submissions' 
                ? 'bg-white text-emerald-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <History className="w-4 h-4" />
            Submissions
          </button>
          <button 
            onClick={() => setView('templates')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === 'templates' 
                ? 'bg-white text-emerald-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layout className="w-4 h-4" />
            Templates
          </button>
        </div>
      </div>

      <div className="mt-8">
        {view === 'submissions' ? (
          <OnboardingSubmissions />
        ) : (
          <OnboardingTemplates onEdit={(id) => {
            setEditingTemplateId(id);
            setView('editor');
          }} />
        )}
      </div>
    </div>
  );
}
