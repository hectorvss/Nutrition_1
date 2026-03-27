import React, { useState } from 'react';
import CheckInList from './CheckInList';
import CheckInHistory from './CheckInHistory';
import CheckInReview from './CheckInReview';
import CheckInTemplates from './CheckInTemplates';
import CheckInTemplateEditor from './CheckInTemplateEditor';

export type CheckInViewMode = 'list' | 'history' | 'review' | 'templates' | 'editor';

interface CheckInsProps {
  initialClientId?: string;
  initialCheckInId?: string;
  onViewChange?: (clientId: string | null, checkInId: string | null) => void;
}

export default function CheckIns({ initialClientId, initialCheckInId, onViewChange }: CheckInsProps) {
  console.log('DEBUG: CheckIns received:', { initialClientId, initialCheckInId });
  const [viewMode, setViewMode] = useState<CheckInViewMode>(
    initialCheckInId ? 'review' : (initialClientId ? 'history' : 'list')
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(initialCheckInId || null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleViewHistory = (clientId: string) => {
    setSelectedClientId(clientId);
    setViewMode('history');
    onViewChange?.(clientId, null);
  };

  const handleViewReview = (checkInId: string) => {
    setSelectedCheckInId(checkInId);
    setViewMode('review');
    onViewChange?.(selectedClientId, checkInId);
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
    setSelectedCheckInId(null);
    onViewChange?.(null, null);
  };

  const handleBackToHistory = () => {
    setViewMode('history');
    setSelectedCheckInId(null);
    onViewChange?.(selectedClientId, null);
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && (
        <CheckInList
          onViewHistory={handleViewHistory}
          onManageTemplates={handleViewTemplates}
        />
      )}
      {viewMode === 'history' && selectedClientId && (
        <CheckInHistory
          clientId={selectedClientId}
          onBack={handleBackToList}
          onViewReview={handleViewReview}
        />
      )}
      {viewMode === 'review' && selectedClientId && selectedCheckInId && (
        <CheckInReview
          clientId={selectedClientId}
          checkInId={selectedCheckInId}
          onBack={handleBackToHistory}
        />
      )}
      {viewMode === 'templates' && (
        <div className="p-6 md:p-8">
          <button onClick={handleBackToList} className="mb-4 text-emerald-600 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Check-ins
          </button>
          <CheckInTemplates onEdit={handleEditTemplate} />
        </div>
      )}

      {viewMode === 'editor' && editingTemplateId && (
        <CheckInTemplateEditor 
          templateId={editingTemplateId} 
          onClose={() => setViewMode('templates')} 
        />
      )}
    </div>
  );
}
