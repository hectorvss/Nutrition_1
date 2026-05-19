import React, { useState } from 'react';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import AddClient from './AddClient';

export type ClientViewMode = 'list' | 'detail' | 'add';

interface ClientsProps {
  onNavigate?: (view: string, data?: any) => void;
  /** When provided, open straight on that client's detail view. */
  initialClientId?: string;
}

export default function Clients({ onNavigate, initialClientId }: ClientsProps) {
  const [viewMode, setViewMode] = useState<ClientViewMode>(initialClientId ? 'detail' : 'list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);

  const handleViewDetail = (id: string) => {
    setSelectedClientId(id);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClientId(null);
  };

  const handleAddClient = () => {
    setViewMode('add');
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && (
        <ClientList 
          onViewDetail={handleViewDetail} 
          onAddClient={handleAddClient} 
        />
      )}
      {viewMode === 'detail' && selectedClientId && (
        <ClientDetail
          clientId={selectedClientId}
          onBack={handleBackToList}
          onNavigate={onNavigate}
        />
      )}
      {viewMode === 'add' && (
        <AddClient 
          onBack={handleBackToList} 
        />
      )}
    </div>
  );
}
