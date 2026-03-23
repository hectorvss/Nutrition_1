import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Flag, 
  History, 
  FileText, 
  MoreHorizontal, 
  Camera, 
  Check, 
  X, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Smile,
  AlertTriangle,
  Edit3,
  PieChart,
  Activity,
  Footprints,
  Droplets,
  Stethoscope,
  Mic,
  Paperclip,
  Send,
  Target,
  Moon,
  Clock,
  CheckCircle2,
  Brain,
  Scale,
  Zap,
  Coffee,
  Heart,
  Calendar,
  Shield,
  Dumbbell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { fetchWithAuth } from '../api';

interface CheckInReviewProps {
  clientId: string;
  checkInId: string;
  onBack: () => void;
}

export default function CheckInReview({ clientId, checkInId, onBack }: CheckInReviewProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coachNotes, setCoachNotes] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins/${checkInId}`);
        if (result) {
          setData(result);
          setCoachNotes(result.check_in?.coach_notes || '');
          setNextWeekFocus(result.check_in?.next_week_focus || '');
        }
      } catch (err) {
        console.error('Error loading check-in review:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId, checkInId]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins/${checkInId}/review`, {
        method: 'POST',
        body: JSON.stringify({ coach_notes: coachNotes, next_week_focus: nextWeekFocus })
      });
      onBack();
    } catch (err) {
      console.error('Error publishing review:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data || !data.check_in) {
    return <div className="p-8 text-center text-slate-500">Check-in not found.</div>;
  }

  const { client, check_in } = data;
  const dj = check_in.data_json || {};

  const KPICard = ({ title, icon: Icon, children, color = "emerald" }: any) => {
    const colorClasses: any = {
      emerald: "text-emerald-500",
      blue: "text-blue-500",
      amber: "text-amber-500",
      purple: "text-purple-500",
      red: "text-red-500",
      slate: "text-slate-500"
    };
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 h-full">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
          {title}
        </h2>
        {children}
      </div>
    );
  };

  const MetricItem = ({ label, value, subtext, color = "emerald" }: any) => {
    const colorClasses: any = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      red: "bg-red-50 text-red-600 border-red-100",
      slate: "bg-slate-50 text-slate-600 border-slate-100"
    };
    return (
      <div className={`p-4 rounded-xl border ${colorClasses[color]} text-center relative overflow-hidden h-full flex flex-col justify-center`}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">{label}</p>
        <p className="text-xl font-bold truncate">{value || '--'}</p>
        {subtext && <p className="text-[10px] font-bold mt-1 opacity-70">{subtext}</p>}
      </div>
    );
  };

  const Badge = ({ label, color = "emerald" }: any) => {
    const colorClasses: any = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      red: "bg-red-50 text-red-600 border-red-100",
      slate: "bg-slate-50 text-slate-600 border-slate-100"
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">Check-ins</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">{client.name}</span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client ID: {client.id.substring(0,8)}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {client.avatar ? (
              <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-md border-2 border-white" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl border-2 border-white shadow-md">
                {client.name.substring(0,2).toUpperCase()}
              </div>
            )}
            {!check_in.reviewed_at && <div className="absolute -top-1 -right-1 bg-amber-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
              {!check_in.reviewed_at ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Pending Review
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Reviewed
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> Submitted {new Date(check_in.created_at).toLocaleString()}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              Date: {new Date(check_in.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <History className="w-4 h-4" />
            History
          </button>
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <FileText className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 0: Coach Review Request */}
          {dj.reviewNotes && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-600" />
                Client Review Request
              </h2>
              <p className="text-sm text-amber-800 font-medium leading-relaxed italic">"{dj.reviewNotes}"</p>
            </div>
          )}

          {/* Section 1: Overall & Body */}
          <KPICard title="Overall & Body metrics" icon={Smile} color="emerald">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricItem label="Overall Week" value={dj.overallWeek} color="emerald" />
                <MetricItem label="Current Weight" value={dj.weight ? `${dj.weight}kg` : '--'} color="blue" />
                <MetricItem label="Avg Weight" value={dj.avgWeight ? `${dj.avgWeight}kg` : '--'} color="blue" />
                <MetricItem label="Satisfaction" value={dj.satisfaction} color="amber" />
                <MetricItem label="Menstrual Impact" value={dj.menstrualImpact || 'N/A'} color="purple" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Body Perception</h4>
                  <p className="text-sm text-slate-700 font-medium">{dj.bodyPerception || '—'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Visible Changes</h4>
                  <p className="text-sm text-slate-700 font-medium">{dj.visibleChanges || '—'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Plan Alignment</h4>
                  <p className="text-sm text-slate-700 font-medium">{dj.matchPlan || '—'}</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Consistency</span> <span className="font-bold text-slate-900">{dj.consistency || '--'}</span></div>
                   <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Mental Health</span> <span className="font-bold text-slate-900">{dj.mentalHealth || '--'}</span></div>
                   <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Biggest Change</span> <span className="font-bold text-slate-900">{dj.biggestChangeArea || '--'}</span></div>
                </div>
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/50">
                   <h4 className="text-[9px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Client Feedback</h4>
                   <p className="text-sm text-slate-600 font-medium italic">"{dj.weekNotes || 'No notes provided'}"</p>
                </div>
             </div>
             {/* Measurements Table */}
             <div className="mt-6 overflow-hidden rounded-xl border border-slate-100">
               <table className="w-full text-[11px] text-left">
                 <thead className="bg-slate-50 font-bold uppercase tracking-widest text-slate-400 text-[9px] border-b border-slate-100">
                   <tr><th className="px-4 py-3">Waist</th><th className="px-4 py-3">Hips</th><th className="px-4 py-3">Chest</th><th className="px-4 py-3">Arms</th><th className="px-4 py-3">Thighs</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   <tr className="font-bold text-slate-700">
                     <td className="px-4 py-3">{dj.waist ? dj.waist+'cm' : '--'}</td>
                     <td className="px-4 py-3">{dj.hips ? dj.hips+'cm' : '--'}</td>
                     <td className="px-4 py-3">{dj.chest ? dj.chest+'cm' : '--'}</td>
                     <td className="px-4 py-3">{dj.arms ? dj.arms+'cm' : '--'}</td>
                     <td className="px-4 py-3">{dj.thighs ? dj.thighs+'cm' : '--'}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
             {/* Progress Photos */}
             <div className="mt-6">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Progress Photos</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'photoFront', label: 'Front' },
                    { id: 'photoSide', label: 'Side' },
                    { id: 'photoBack', label: 'Back' }
                  ].map(p => (
                    <div key={p.id} className="aspect-[3/4] rounded-xl bg-slate-50 border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center">
                      {dj[p.id] ? (
                        <img src={dj[p.id]} alt={p.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300">
                          <Camera className="w-6 h-6 mb-1 text-slate-200" />
                          <span className="text-[10px] font-bold uppercase">{p.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
          </KPICard>

          {/* Section 2: Nutrition */}
          <KPICard title="Nutrition Adherence" icon={PieChart} color="emerald">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <MetricItem label="Overall Adherence" value={dj.nutritionAdherence} color="emerald" />
              <MetricItem label="Calorie Target" value={dj.hitCalories} color="amber" />
              <MetricItem label="Protein Target" value={dj.hitProtein} color="red" />
              <MetricItem label="Eat Out Count" value={dj.eatOutCount} color="amber" />
              <MetricItem label="Accuracy" value={dj.trackingAccuracy} color="slate" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Meals Followed</span> <span className="font-bold text-slate-900">{dj.mealsFollowed || '--'}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Off-Plan Count</span> <span className="font-bold text-slate-900">{dj.offPlanCount || '0'}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Skipped Meals</span> <span className="font-bold text-slate-900">{dj.skippedMeals || 'None'}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Hardest Meal</span> <span className="font-bold text-slate-900">{dj.hardestMeal || '--'}</span></div>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Obstacles & Context</h4>
                  <div className="flex flex-wrap gap-2">
                    {dj.adherenceObstacles?.length > 0 ? dj.adherenceObstacles.map((o:string) => <Badge key={o} label={o} color="red" />) : <span className="text-xs text-slate-400 italic">None reported</span>}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                     <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Digestive Issues?</h4>
                     <p className="text-sm font-bold text-slate-700">{dj.digestiveIssues || 'No'}</p>
                  </div>
               </div>
            </div>
          </KPICard>

          {/* Section 3: Digestion & Biofeedback */}
          <KPICard title="Digestion & Biofeedback" icon={Stethoscope} color="purple">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricItem label="Digestion" value={dj.digestionQuality} color="purple" />
              <MetricItem label="Bloating" value={dj.bloatingLevel} color="purple" />
              <MetricItem label="Hunger" value={dj.hunger} color="amber" />
              <MetricItem label="Cravings" value={dj.cravings} color="red" />
            </div>
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Bowel Regularity</h4>
                     <p className="text-sm font-bold text-slate-700">{dj.bowelRegularity || '--'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cravings Timing</h4>
                     <p className="text-sm font-bold text-slate-700">{dj.cravingsTime || '--'}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricItem label="Energy Post-Meal" value={dj.energyResponse} color="emerald" />
                  <MetricItem label="Fullness Response" value={dj.fullnessResponse} color="blue" />
               </div>
               <div>
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Reported Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                     {dj.digestiveSymptoms?.length > 0 ? dj.digestiveSymptoms.map((s:string) => <Badge key={s} label={s} color="purple" />) : <span className="text-xs text-slate-400 italic">None reported</span>}
                  </div>
               </div>
               {dj.foodNotes && (
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Biofeedback Notes</h4>
                    <p className="text-sm text-slate-600 italic">"{dj.foodNotes}"</p>
                 </div>
               )}
            </div>
          </KPICard>

          {/* Section 4: Training Performance */}
          <KPICard title="Training Performance" icon={Dumbbell} color="emerald">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <MetricItem label="Adherence" value={dj.trainingAdherence} color="emerald" />
              <MetricItem label="Performance" value={dj.performance} color="blue" />
              <MetricItem label="Strength" value={dj.strength} color="red" />
              <MetricItem label="Intensity" value={dj.trainingIntensity} color="amber" />
            </div>
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                    <h4 className="text-[9px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3"/> Training Wins & PRs</h4>
                    <p className="text-sm text-slate-700 font-bold mb-1">{dj.prWins || 'No PRs this week'}</p>
                    <p className="text-xs text-slate-500">{dj.strongExerciseNotes}</p>
                  </div>
                  <div className="p-4 bg-red-50/30 rounded-xl border border-red-100/50">
                    <h4 className="text-[9px] font-bold text-red-600 uppercase mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/> Struggles & Drops</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {dj.performanceDropReasons?.map((r:string) => <Badge key={r} label={r} color="red" />)}
                    </div>
                    <p className="text-xs text-slate-500">{dj.awkwardExerciseNotes}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between text-[11px] items-center p-2 bg-slate-50 rounded-lg"><span className="text-slate-400 font-bold uppercase">Energy</span> <span className="font-bold text-slate-900">{dj.trainingEnergy || '--'}</span></div>
                  <div className="flex justify-between text-[11px] items-center p-2 bg-slate-50 rounded-lg"><span className="text-slate-400 font-bold uppercase">Quality</span> <span className="font-bold text-slate-900">{dj.trainingQuality || '--'}</span></div>
                  <div className="flex justify-between text-[11px] items-center p-2 bg-slate-50 rounded-lg"><span className="text-slate-400 font-bold uppercase">Recovery</span> <span className="font-bold text-slate-900">{dj.trainingRecovery || '--'}</span></div>
               </div>
               {dj.trainingNotes && <p className="text-xs text-slate-500 italic">"{dj.trainingNotes}"</p>}
            </div>
          </KPICard>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recovery & Foundations */}
          <KPICard title="Recovery & Sleep" icon={Moon} color="blue">
             <div className="grid grid-cols-2 gap-4 mb-4">
                <MetricItem label="Sleep Qty" value={dj.sleepQuantity} color="blue" />
                <MetricItem label="Sleep Qual" value={dj.sleepQuality} color="blue" />
                <MetricItem label="Stress" value={dj.stress} color="red" />
                <MetricItem label="Motivation" value={dj.motivation} color="amber" />
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Interruptions</span> <span className="font-bold text-slate-900">{dj.sleepInterruptions || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Consistency</span> <span className="font-bold text-slate-900">{dj.sleepScheduleConsistency || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Fatigue</span> <span className="font-bold text-slate-900">{dj.generalFatigue || '--'}</span></div>
                <div className="mt-4">
                   <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Recovery Impacts</h4>
                   <div className="flex flex-wrap gap-2">
                      {dj.recoveryImpacts?.map((i:string) => <Badge key={i} label={i} color="slate" />)}
                   </div>
                </div>
                {dj.recoveryNotes && <p className="text-xs text-slate-500 italic mt-2">"{dj.recoveryNotes}"</p>}
             </div>
          </KPICard>
          {/* Activity & Cardio */}
          <KPICard title="Activity & Cardio" icon={Footprints} color="slate">
             <MetricItem label="Step Range" value={dj.stepRange} color="slate" />
             <div className="mt-4 space-y-3">
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Steps Adherence</span> <span className="font-bold text-slate-700">{dj.stepsAdherence || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Cardio Adherence</span> <span className="font-bold text-slate-700">{dj.cardioAdherence || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Cardio Perf.</span> <span className="font-bold text-slate-700">{dj.cardioPerformance || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Activity Level</span> <span className="font-bold text-slate-700">{dj.activityLevel || '--'}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Tired post-act</span> <span className="font-bold text-slate-700">{dj.activityTired || '--'}</span></div>
                {dj.activityLimitations?.length > 0 && (
                   <div className="mt-2">
                      <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Limitations</h4>
                      <div className="flex flex-wrap gap-1">{dj.activityLimitations.map((l:string) => <span key={l} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{l}</span>)}</div>
                   </div>
                )}
             </div>
             {dj.activityNotes && (
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Activity Notes</h4>
                  <p className="text-sm text-slate-600 italic">"{dj.activityNotes}"</p>
               </div>
             )}
          </KPICard>

          {/* Habits & Routine */}
          <KPICard title="Habits & Routine" icon={Shield} color="purple">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div><p className="text-[9px] font-bold text-blue-400 uppercase">Hydration</p><p className="text-sm font-bold text-slate-900">{dj.waterAmount || '--'}</p></div>
                <Badge label={dj.waterIntake} color="blue" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                 <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Meal Timing</span> <span className="font-bold text-slate-700">{dj.mealTimingConsistency || '--'}</span></div>
                 <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Routine Structure</span> <span className="font-bold text-slate-700">{dj.routineStructure || '--'}</span></div>
                 <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Supplements</span> <span className="font-bold text-slate-700">{dj.supplements || '--'}</span></div>
                 <div className="flex justify-between text-[11px]"><span className="text-slate-400 font-bold uppercase">Alcohol Int.</span> <span className="font-bold text-slate-700">{dj.alcoholIntake || '--'}</span></div>
                 <div className="flex justify-between text-[11px] items-center"><span className="text-slate-400 font-bold uppercase">Snacking</span> <Badge label={dj.snackingFrequency} color="amber" /></div>
              </div>
              {dj.habitNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                   <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1">Habit Notes</h4>
                   <p className="text-sm text-slate-600 italic">"{dj.habitNotes}"</p>
                </div>
              )}
            </div>
          </KPICard>

          {/* Looking Ahead */}
          <KPICard title="Looking Ahead" icon={Calendar} color="amber">
            <div className="space-y-4">
              <MetricItem label="Next Week Readiness" value={dj.readiness} color="emerald" />
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-[9px] font-bold text-amber-800 uppercase mb-2 tracking-widest">Non-Negotiables</h4>
                <p className="text-sm text-slate-700 font-medium italic">"{dj.nonNegotiables || 'None set'}"</p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="text-[9px] font-bold text-blue-800 uppercase mb-2 tracking-widest">Requested Support</h4>
                <p className="text-sm text-slate-700 font-medium italic">"{dj.supportNeeded || 'No specific requests'}"</p>
              </div>
              <div>
                 <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Primary Focus Areas</h4>
                 <div className="flex flex-wrap gap-2">
                    {dj.improvementGoals?.map((g:string) => <Badge key={g} label={g} color="amber" />)}
                 </div>
              </div>
              {dj.extraNotes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-4 shadow-sm text-center">
                   <h4 className="text-[10px] font-bold text-amber-900 uppercase mb-2 flex items-center justify-center gap-1.5"><FileText className="w-3 h-3"/> Final Thoughts</h4>
                   <p className="text-sm text-slate-700 leading-relaxed italic">"{dj.extraNotes}"</p>
                </div>
              )}
            </div>
          </KPICard>

          {/* Pain Tracking (Conditionally visible) */}
          {(dj.painLevel && dj.painLevel !== 'None') && (
            <KPICard title="Pain Tracking" icon={AlertTriangle} color="red">
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <MetricItem label="Pain Level" value={dj.painLevel} color="red" />
                 <MetricItem label="Affected Area" value={dj.affectedArea} color="red" />
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold uppercase">Pain Type</span> <span className="font-bold text-slate-900">{dj.painType}</span></div>
                 <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold uppercase">Impact</span> <span className="font-bold text-slate-900">{dj.trainingImpact}</span></div>
                 <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold uppercase">Progression</span> <span className="font-bold text-slate-900">{dj.painProgression}</span></div>
                 <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-bold uppercase">Modified Training?</span> <span className="font-bold text-slate-900">{dj.modifiedTraining}</span></div>
                 <p className="text-xs text-slate-500 bg-red-50 p-2 rounded border border-red-100 italic">"{dj.painNotes}"</p>
              </div>
            </KPICard>
          )}

          {/* Coach Assessment Form */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-900 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Coach Assessment
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Internal Notes & Feedback</label>
                  <textarea 
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[160px] resize-none outline-none" 
                    placeholder="Write your feedback here..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Next Week Focus</label>
                  <div className="relative">
                    <Target className="absolute top-3.5 left-3.5 text-slate-400 w-4 h-4" />
                    <input 
                      value={nextWeekFocus}
                      onChange={(e) => setNextWeekFocus(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors outline-none font-medium" 
                      placeholder="e.g. Focus on sleep quality" 
                      type="text"
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isPublishing ? 'Publishing...' : 'Publish Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12"></div>
    </div>
  );
}
