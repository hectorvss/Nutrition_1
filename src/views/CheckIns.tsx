import React, { useState } from 'react';
import CheckInList from './CheckInList';
import CheckInHistory from './CheckInHistory';
import CheckInReview from './CheckInReview';

export type CheckInViewMode = 'list' | 'history' | 'review';

export default function CheckIns() {
  const [viewMode, setViewMode] = useState<CheckInViewMode>('list');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const handleViewHistory = (clientId: number) => {
    setSelectedClientId(clientId);
    setViewMode('history');
  };

  const handleViewReview = (week: number) => {
    setSelectedWeek(week);
    setViewMode('review');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClientId(null);
    setSelectedWeek(null);
  };

  const handleBackToHistory = () => {
    setViewMode('history');
    setSelectedWeek(null);
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && (
        <CheckInList 
          onViewHistory={handleViewHistory} 
        />
      )}
      {viewMode === 'history' && selectedClientId && (
        <CheckInHistory 
          clientId={selectedClientId} 
          onBack={handleBackToList}
          onViewReview={handleViewReview}
        />
      )}
      {viewMode === 'review' && selectedClientId && selectedWeek && (
        <CheckInReview 
          clientId={selectedClientId}
          week={selectedWeek}
          onBack={handleBackToHistory} 
        />
      )}
    </div>
  );
}
