import React, { useState } from 'react';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import AddClient from './AddClient';

export type ClientViewMode = 'list' | 'detail' | 'add';

export default function Clients() {
  const [viewMode, setViewMode] = useState<ClientViewMode>('list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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
