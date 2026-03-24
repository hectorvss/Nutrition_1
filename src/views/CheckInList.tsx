import React, { useState } from 'react';
import {
  Search,
  Download,
  ChevronRight
} from 'lucide-react';
import { useClient } from '../context/ClientContext';

interface CheckInListProps {
  onViewHistory: (clientId: string) => void;
}

export default function CheckInList({ onViewHistory }: CheckInListProps) {
  const { clients, isLoading } = useClient();
  const [filter, setFilter] = useState<'All' | 'Unreviewed' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'All', label: 'All Clients', count: clients.length },
    { id: 'Unreviewed', label: 'Unreviewed', count: clients.filter(c => c.isUnreviewed).length },
    { id: 'Completed', label: 'Completed', count: clients.filter(c => !c.isUnreviewed && c.lastCheckInDate).length },
  ];

  const enrichedClients = clients.map((c) => {
    return {
      id: c.id,
      name: c.name,
      adherence: c.progress || 0,
      weight: c.weight ? `${c.weight}kg` : '--',
      nutritionAdherence: c.plan_name || '--',
      submitted: c.lastCheckInDate
        ? new Date(c.lastCheckInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'No check-ins',
      avatar: c.avatar,
      initials: c.name.substring(0, 2).toUpperCase(),
      unreviewed: c.isUnreviewed,
      hasCheckIns: !!c.lastCheckInDate,
    };
  });

  const filteredClients = enrichedClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Unreviewed') return matchesSearch && client.unreviewed;
    if (filter === 'Completed') return matchesSearch && client.hasCheckIns && !client.unreviewed;
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Check-ins</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review weekly progress and adherence</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {(['All', 'Unreviewed', 'Completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'Unreviewed' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 font-medium text-sm">No clients match this filter.</p>
            </div>
          ) : filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => onViewHistory(client.id)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer overflow-hidden relative"
            >
              {client.unreviewed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
              )}
              <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="relative">
                    {client.avatar ? (
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border-2 border-white shadow-sm">
                        {client.initials}
                      </div>
                    )}
                    {client.unreviewed && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{client.name}</h3>
                      {client.unreviewed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider text-amber-600 bg-amber-50 border-amber-200">
                          Pending Review
                        </span>
                      )}
                      {!client.hasCheckIns && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider text-slate-400 bg-slate-50 border-slate-200">
                          No check-ins
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Adherence Score</span>
                        <span className="text-slate-900">{client.adherence}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            client.adherence >= 90 ? 'bg-emerald-500' :
                            client.adherence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${client.adherence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Check-in</p>
                    <p className="text-xs font-bold text-slate-600">{client.submitted}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{client.weight}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{client.nutritionAdherence || '--'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Nutrition</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
