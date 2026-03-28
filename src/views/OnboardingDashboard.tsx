import React, { useState } from 'react';
import OnboardingList from './OnboardingList';
import OnboardingHistory from './OnboardingHistory';
import OnboardingReview from './OnboardingReview';
import OnboardingTemplates from './OnboardingTemplates';
import OnboardingFlowEditor from './OnboardingFlowEditor';

export type OnboardingViewMode = 'list' | 'history' | 'review' | 'templates' | 'editor';

interface OnboardingDashboardProps {
  initialClientId?: string;
  initialSubmissionId?: string;
}

export default function OnboardingDashboard({ initialClientId, initialSubmissionId }: OnboardingDashboardProps) {
  const [viewMode, setViewMode] = useState<OnboardingViewMode>(
    initialSubmissionId ? 'review' : (initialClientId ? 'history' : 'list')
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(initialSubmissionId || null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleViewHistory = (clientId: string) => {
    setSelectedClientId(clientId);
    setViewMode('history');
  };

  const handleViewReview = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setViewMode('review');
  };

  const handleViewTemplates = () => {
    setViewMode('templates');
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setViewMode('editor');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClientId(null);
    setSelectedSubmissionId(null);
  };

  const handleBackToHistory = () => {
    setViewMode('history');
    setSelectedSubmissionId(null);
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && (
        <OnboardingList
          onViewHistory={handleViewHistory}
          onManageTemplates={handleViewTemplates}
        />
      )}
      
      {viewMode === 'history' && selectedClientId && (
        <OnboardingHistory
          clientId={selectedClientId}
          onBack={handleBackToList}
          onViewReview={handleViewReview}
        />
      )}
      
      {viewMode === 'review' && selectedClientId && selectedSubmissionId && (
        <OnboardingReview
          clientId={selectedClientId}
          submissionId={selectedSubmissionId}
          onBack={handleBackToHistory}
        />
      )}
      
      {viewMode === 'templates' && (
        <div className="p-6 md:p-8">
          <button 
            onClick={handleBackToList} 
            className="mb-4 text-emerald-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Onboarding
          </button>
          <OnboardingTemplates onEdit={handleEditTemplate} />
        </div>
      )}

      {viewMode === 'editor' && editingTemplateId && (
        <OnboardingFlowEditor 
          templateId={editingTemplateId} 
          onBack={() => setViewMode('templates')} 
        />
      )}
    </div>
  );
}
