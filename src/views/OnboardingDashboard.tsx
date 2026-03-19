import React, { useEffect, useState } from 'react';
import { 
  Rocket, 
  Dumbbell, 
  Activity, 
  Plus, 
  ArrowRight, 
  Users, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  ArrowUpDown,
  Edit2,
  CheckCircle2,
  LayoutList,
  Loader2
} from 'lucide-react';
import { fetchWithAuth } from '../api';

interface OnboardingDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export default function OnboardingDashboard({ onNavigate }: OnboardingDashboardProps) {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      const data = await fetchWithAuth('/manager/onboarding');
      setFlows(data);
    } catch (err) {
      console.error('Failed to load onboarding flows:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'athlete': return Dumbbell;
      case 'rehab': return Activity;
      default: return Rocket;
    }
  };

  const getIconColor = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: 'bg-blue-50', text: 'text-blue-600' },
      { bg: 'bg-orange-50', text: 'text-orange-600' },
      { bg: 'bg-purple-50', text: 'text-purple-600' },
      { bg: 'bg-emerald-50', text: 'text-emerald-600' }
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6 w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button className="hover:text-emerald-600 transition-colors">Management</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">Onboarding Flows</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {loading ? 'Syncing...' : 'Synced Just Now'}
          </span>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border-2 border-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Onboarding Manager</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> V2
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Manage intake flows, assignments, and contract automations.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('onboarding-editor')}
          className="px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 bg-white font-bold"
        >
          <Plus className="w-5 h-5" />
          New Flow
        </button>
      </div>

      {/* Active Flows List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-emerald-500" />
            Active Flows
          </h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg text-slate-500 transition-all">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white rounded-lg text-slate-500 transition-all">
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium">Loading flows...</p>
            </div>
          ) : flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              <Rocket className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-slate-500">No onboarding flows found</p>
              <button 
                onClick={() => onNavigate('onboarding-editor')}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                Create your first one
              </button>
            </div>
          ) : flows.map((flow) => {
            const Icon = getIcon(flow.id % 2 === 0 ? 'athlete' : 'standard');
            const colors = getIconColor(flow.id);
            return (
              <div 
                key={flow.id}
                className={`group border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-emerald-500/30 relative bg-white ${flow.status === 'draft' ? 'opacity-75' : ''}`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                    flow.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {flow.status}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">{flow.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{flow.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Updated {new Date(flow.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end items-center">
                  <button 
                    onClick={() => onNavigate('onboarding-editor', { flowId: flow.id })}
                    className={`text-sm font-bold flex items-center gap-1 transition-colors ${
                      flow.status === 'draft' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    {flow.status === 'draft' ? (
                      <>Edit Draft <Edit2 className="w-4 h-4" /></>
                    ) : (
                      <>Manage Flow <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

