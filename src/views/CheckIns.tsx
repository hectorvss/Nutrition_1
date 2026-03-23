import React, { useState } from 'react';
import CheckInList from './CheckInList';
import CheckInHistory from './CheckInHistory';
import CheckInReview from './CheckInReview';

export type CheckInViewMode = 'list' | 'history' | 'review';

interface CheckInsProps {
  initialClientId?: string;
  initialCheckInId?: string;
  onViewChange?: (clientId: string | null, checkInId: string | null) => void;
}

export default function CheckIns({ initialClientId, initialCheckInId, onViewChange }: CheckInsProps) {
  const [viewMode, setViewMode] = useState<CheckInViewMode>(
    initialCheckInId ? 'review' : (initialClientId ? 'history' : 'list')
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(initialCheckInId || null);

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
