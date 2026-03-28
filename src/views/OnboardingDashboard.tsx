import React, { useState } from 'react';
import OnboardingTemplates from './OnboardingTemplates';
import OnboardingFlowEditor from './OnboardingFlowEditor';

export type OnboardingViewMode = 'templates' | 'editor';

interface OnboardingDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export default function OnboardingDashboard({ onNavigate }: OnboardingDashboardProps) {
  const [viewMode, setViewMode] = useState<OnboardingViewMode>('templates');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setViewMode('editor');
  };

  const handleBackToLibrary = () => {
    setViewMode('templates');
    setEditingTemplateId(null);
  };

  return (
    <div className="h-full">
      {viewMode === 'templates' && (
        <div className="p-6 md:p-8">
          <OnboardingTemplates onEdit={handleEditTemplate} />
        </div>
      )}

      {viewMode === 'editor' && editingTemplateId && (
        <OnboardingFlowEditor 
          flowId={editingTemplateId} 
          onBack={handleBackToLibrary} 
        />
      )}
    </div>
  );
}
