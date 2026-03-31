import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { 
  Search, 
  Download, 
  Plus, 
  Mail, 
  Share2, 
  Archive, 
  MoreVertical, 
  AlertTriangle,
  TrendingDown,
  CalendarDays,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  HelpCircle,
  Trash2
} from 'lucide-react';

import { useClient } from '../context/ClientContext';

// We don't need the local Client interface or mock data anymore
// The interface is now defined in ClientContext.tsx

interface ClientListProps {
  onViewDetail: (id: string) => void;
  onAddClient: () => void;
}

export default function ClientList({ onViewDetail, onAddClient }: ClientListProps) {
  const { clients, isLoading: loading, error, deleteClient, archiveClient } = useClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'At Risk' | 'Archived'>('All');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    // Search filter
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase()) && !client.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filter === 'Active') return client.status === 'Active';
    if (filter === 'Archived') return client.status === 'Archived';
    if (filter === 'At Risk') return client.isAtRisk;
    return true; // All
  });

  // ─── Delete confirmation modal ─────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteConfirmText('');
    setDeleteError(null);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClient(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteError('Failed to delete client. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id.toString()));
    }
  };

  const toggleSelectClient = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(cid => cid !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const getRiskIcon = (status: string | undefined) => {
    if (!status) return null;
    switch (status) {
      case 'Missing Data': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Rapid Drop': return <TrendingDown className="w-4 h-4 text-amber-500" />;
      case 'Missed Appt': return <CalendarDays className="w-4 h-4 text-amber-500" />;
      case 'Low Adherence': return <UserCheck className="w-4 h-4 text-amber-500" />;
      case 'High BP Report': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 md:p-8 lg:p-10">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Clients</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">Manage your client base, track progress, and organize your coaching.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-bold">
                <Download className="w-4 h-4" />
                Export List
              </button>
              <button 
                onClick={onAddClient}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                New Client
              </button>
            </div>
          </header>

          {error && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
               Error loading clients: {error}
             </div>
          )}
          
          {loading && (
             <div className="bg-white p-12 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-200">
                Loading clients...
             </div>
          )}

          {!loading && !error && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 overflow-visible">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  {['All Clients', 'Active', 'At Risk', 'Archived'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f.replace(' Clients', '') as any)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                        (f === 'All Clients' && filter === 'All') || f === filter
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {f}
                      {f === 'At Risk' && clients.some(c => c.isAtRisk) && (
                        <span className="ml-2 bg-amber-500 text-white text-[10px] rounded-full h-5 w-5 inline-flex items-center justify-center">
                          {clients.filter(c => c.isAtRisk).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400" 
                    placeholder="Search clients..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {selectedClients.length > 0 && (
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="bg-emerald-500/10 px-2.5 py-1 rounded-lg">{selectedClients.length} selected</span>
                    <button 
                      onClick={() => setSelectedClients([])}
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium ml-1"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filters:</span>
                    <div className="flex gap-2">
                      <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        Tag: High Priority 
                        <X className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                      </span>
                      <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        Last Check-in: &gt; 7 days 
                        <X className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                      </span>
                    </div>
                    <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1">Reset all</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-bold shadow-sm">
                    <Mail className="w-3.5 h-3.5" />
                    Message ({selectedClients.length})
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-bold shadow-sm">
                    <Share2 className="w-3.5 h-3.5" />
                    Export ({selectedClients.length})
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 font-bold">Client</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Last Check-in</th>
                    <th className="p-4">Next Appointment</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-sm">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id} 
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors relative"
                    >
                      <td className={`p-4 relative ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : ''}`}>
                        {client.isAtRisk && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewDetail(client.id.toString())}>
                          <img src={client.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{client.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{client.gender}, {client.age}y</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : ''}`}>
                        {client.isAtRisk ? (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            <span>At Risk</span>
                            <HelpCircle className="w-3 h-3 text-slate-300 dark:text-slate-600 cursor-help" />
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            client.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                            client.status === 'Archived' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 
                            client.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {client.status}
                          </span>
                        )}
                      </td>
                      <td className={`p-4 ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : ''}`}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50">
                          {client.plan}
                        </span>
                      </td>
                      <td className={`p-4 ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : ''}`}>
                        <span className={`text-xs font-bold ${client.riskStatus ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          {client.lastCheckIn}
                        </span>
                      </td>
                      <td className={`p-4 text-xs font-bold ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : 'text-slate-600 dark:text-slate-300'}`}>
                        {client.nextAppointment === 'Not Scheduled' ? (
                          <span className="text-amber-500">Not Scheduled</span>
                        ) : client.nextAppointment}
                      </td>
                      <td className={`p-4 ${client.status === 'Archived' ? 'grayscale opacity-60 contrast-75' : ''}`}>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${
                              client.progressLabel === 'On Track' ? 'bg-emerald-500' : 
                              client.progressLabel === 'Stalled' ? 'bg-amber-500' : 
                              client.progressLabel === 'Regression' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`} 
                            style={{ width: `${client.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{client.progressLabel}</p>
                      </td>
                      <td className="p-4 text-right relative overflow-visible">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === client.id ? null : client.id); }}
                            className="text-slate-400 hover:text-emerald-500 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === client.id && (
                            <div
                              className="absolute right-4 top-[85%] mt-1 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => { onViewDetail(client.id.toString()); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => { 
                                  const targetStatus = client.status === 'Archived' ? 'Active' : 'Archived';
                                  archiveClient(client.id.toString(), targetStatus); 
                                  setOpenMenuId(null); 
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4 text-slate-400" />
                                {client.status === 'Archived' ? 'Restore Client' : 'Archive Client'}
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800" />
                              <button
                                onClick={() => openDeleteModal(client.id.toString(), client.name)}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                Delete permanently
                              </button>
                            </div>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white">1-{filteredClients.length}</span> of <span className="text-slate-900 dark:text-white">{filteredClients.length}</span> clients
                </p>
                <select className="text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 py-1.5 pr-8 text-slate-600 dark:text-slate-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none shadow-sm">
                  <option>10 per page</option>
                  <option>20 per page</option>
                  <option>50 per page</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 cursor-not-allowed shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-away to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Client</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">⚠ This action cannot be undone</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  All data for <span className="font-bold">{deleteTarget.name}</span> — including plans, sessions, and check-ins — will be permanently erased.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                  Type <span className="text-red-600">{deleteTarget.name}</span> to confirm
                </label>
                <input
                  autoFocus
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && deleteConfirmText === deleteTarget.name) handleConfirmDelete(); }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder={deleteTarget.name}
                />
                {deleteError && (
                  <p className="text-xs text-red-500 font-medium mt-1.5">{deleteError}</p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== deleteTarget.name || isDeleting}
                  className="flex-1 py-2.5 font-bold bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Delete permanently</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
