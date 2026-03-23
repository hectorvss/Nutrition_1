import React, { useState } from 'react';
import CheckInList from './CheckInList';
import CheckInHistory from './CheckInHistory';
import CheckInReview from './CheckInReview';

export type CheckInViewMode = 'list' | 'history' | 'review';

export default function CheckIns() {
  const [viewMode, setViewMode] = useState<CheckInViewMode>('list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);

  const handleViewHistory = (clientId: string) => {
    setSelectedClientId(clientId);
    setViewMode('history');
  };

  const handleViewReview = (checkInId: string) => {
    setSelectedCheckInId(checkInId);
    setViewMode('review');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClientId(null);
    setSelectedCheckInId(null);
  };

  const handleBackToHistory = () => {
    setViewMode('history');
    setSelectedCheckInId(null);
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
      {viewMode === 'review' && selectedClientId && selectedCheckInId && (
        <CheckInReview
          clientId={selectedClientId}
          checkInId={selectedCheckInId}
          onBack={handleBackToHistory}
        />
      )}
    </div>
  );
}
