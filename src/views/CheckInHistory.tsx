import React from 'react';
import { 
  ArrowLeft, 
  Filter, 
  Calendar as CalendarIcon, 
  Scale, 
  CheckCircle2, 
  Flag, 
  ChevronRight,
  History,
  Archive
} from 'lucide-react';

interface CheckInHistoryProps {
  clientId: number;
  onBack: () => void;
  onViewReview: (week: number) => void;
}

const historyWeeks = [
  {
    week: 4,
    date: 'Today, 10:42 AM',
    weight: '74.5 kg',
    change: '-0.8 kg',
    compliance: 88,
    status: 'Flagged',
    statusColor: 'text-amber-600 bg-amber-50 border-amber-100',
    isNew: true,
    action: 'Review'
  },
  {
    week: 3,
    date: 'Oct 5, 2023',
    weight: '75.3 kg',
    change: '-0.5 kg',
    compliance: 92,
    status: 'Reviewed',
    statusColor: 'text-slate-500 bg-slate-100 border-slate-200',
    action: 'View'
  },
  {
    week: 2,
    date: 'Sep 28, 2023',
    weight: '75.8 kg',
    change: '-1.2 kg',
    compliance: 96,
    status: 'Reviewed',
    statusColor: 'text-slate-500 bg-slate-100 border-slate-200',
    action: 'View'
  },
  {
    week: 1,
    date: 'Sep 21, 2023',
    weight: '77.0 kg',
    change: '-1.0 kg',
    compliance: 100,
    status: 'Reviewed',
    statusColor: 'text-slate-500 bg-slate-100 border-slate-200',
    action: 'View'
  },
  {
    week: 0,
    label: 'Baseline',
    date: 'Aug 15, 2023',
    weight: '78.0 kg',
    change: 'Starting Weight',
    compliance: null,
    status: 'Archived',
    statusColor: 'text-slate-400 bg-slate-100 border-slate-200',
    isArchived: true,
    action: 'View'
  }
];

export default function CheckInHistory({ clientId, onBack, onViewReview }: CheckInHistoryProps) {
  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">Check-ins</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">Sarah Jenkins</span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical ID: 8992-B</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-md border-2 border-white" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop")' }}></div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Sarah Jenkins</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <History className="w-3 h-3" /> History
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">Active Client • Started Aug 15, 2023</p>
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="space-y-4">
        {historyWeeks.map((item, idx) => (
          <div 
            key={idx}
            className={`bg-white rounded-2xl shadow-sm p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group ${
              item.isNew ? 'border-amber-200' : 'border-slate-200 hover:border-slate-300'
            } ${item.isArchived ? 'opacity-60 border-dashed' : ''}`}
          >
            {item.isNew && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />}
            
            <div className="flex items-center gap-6 min-w-[180px] pl-2">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {item.label || `Week ${item.week}`}
                  {item.isNew && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">New</span>
                  )}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {item.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 flex-1 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Scale className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{item.weight}</span>
                  <span className={`text-xs font-bold ${item.change.includes('-') ? 'text-emerald-600' : 'text-slate-400'}`}>{item.change}</span>
                </div>
              </div>

              {item.compliance !== null ? (
                <div className="flex flex-col gap-1.5 flex-1 max-w-[180px] hidden lg:flex">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Compliance</span>
                    <span className="text-slate-900">{item.compliance}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.compliance}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 max-w-[180px] hidden lg:block">
                  <span className="text-xs text-slate-400 italic font-medium">Initial onboarding setup</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${item.statusColor}`}>
                  {item.status === 'Flagged' && <Flag className="w-3 h-3" />}
                  {item.status === 'Reviewed' && <CheckCircle2 className="w-3 h-3" />}
                  {item.status === 'Archived' && <Archive className="w-3 h-3" />}
                  {item.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end min-w-[120px]">
              <button 
                onClick={() => onViewReview(item.week)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 w-full text-sm ${
                  item.action === 'Review' 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' 
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.action}
                {item.action === 'Review' && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
