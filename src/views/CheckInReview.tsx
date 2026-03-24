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
import { useClient } from '../context/ClientContext';

interface CheckInReviewProps {
  clientId: string;
  checkInId: string;
  onBack: () => void;
  readonly?: boolean;
  isClient?: boolean;
}

export default function CheckInReview({ clientId, checkInId, onBack, readonly = false, isClient = false }: CheckInReviewProps) {
  const { reloadClients } = useClient();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coachNotes, setCoachNotes] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const loadCheckIn = async () => {
      setIsLoading(true);
      try {
        console.log('DEBUG: CheckInReview fetching for:', { clientId, checkInId, isClient });
        const endpoint = isClient 
          ? `/check-ins/client/check-ins/${checkInId}`
          : `/check-ins/manager/clients/${clientId}/check-ins/${checkInId}`;
        const result = await fetchWithAuth(endpoint);
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
    loadCheckIn();
  }, [clientId, checkInId]);

  const handlePublish = async () => {
    if (!coachNotes.trim()) return;
    setIsPublishing(true);
    try {
      // 1. Update the check-in review in the DB
      await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins/${checkInId}/review`, {
        method: 'POST',
        body: JSON.stringify({ coach_notes: coachNotes, next_week_focus: nextWeekFocus })
      });

      // 2. Send the feedback message to the chat
      await fetchWithAuth('/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: clientId,
          content: coachNotes,
          attachment_type: 'check_in',
          attachment_url: checkInId
        })
      });

      // 3. Refresh the manager's client list to sync review status
      await reloadClients();

      onBack();
    } catch (err) {
      console.error('Error publishing review:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    setIsPublishing(true);
    try {
      // 1. Update the check-in as reviewed in the DB
      await fetchWithAuth(`/check-ins/manager/clients/${clientId}/check-ins/${checkInId}/review`, {
        method: 'POST',
        body: JSON.stringify({ 
          coach_notes: coachNotes || '', 
          next_week_focus: nextWeekFocus || '' 
        })
      });

      // 2. Refresh the manager's client list
      await reloadClients();

      onBack();
    } catch (err) {
      console.error('Error marking as reviewed:', err);
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
  
  // Robust parsing for data_json
  let dj: any = {};
  try {
    dj = typeof check_in.data_json === 'string' ? JSON.parse(check_in.data_json) : (check_in.data_json || {});
    if (Object.keys(dj).length === 0) {
      console.warn('CheckInReview: data_json is empty for check-in', checkInId);
    }
  } catch (e) {
    console.error('CheckInReview: Failed to parse data_json', e);
    dj = {};
  }

  const Section = ({ title, subtitle, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 mb-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value }: any) => (
    <div className="w-full">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {value.map((v: string) => (
                <span key={v} className="px-3 py-1 bg-[#17cf54]/10 text-[#17cf54] rounded-lg text-[11px] font-bold uppercase">{v}</span>
              ))}
            </div>
          ) : (
            value || '—'
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
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

      <div className="w-full space-y-6">
        {/* Section 1: Overview */}
        <Section title="Overall Experience" subtitle="Client's general thoughts on the past week." icon="mood">
          <InfoField label="Overall Week" value={dj.overallWeek} />
          <InfoField label="Primary Context" value={dj.contextChips} />
          <InfoField label="Plan Alignment" value={dj.matchPlan} />
          <InfoField label="Consistency" value={dj.consistency} />
          <InfoField label="Mental Health" value={dj.mentalHealth} />
          <InfoField label="Weekly Notes" value={dj.weekNotes} />
          {dj.reviewNotes && <InfoField label="Review Request for Coach" value={dj.reviewNotes} />}
        </Section>

        {/* Section 2: Body & Progress */}
        <Section title="Body & Progress" subtitle="Physical updates and measurements." icon="straighten">
          <InfoField label="Current Weight" value={dj.weight ? `${dj.weight} kg` : null} />
          <InfoField label="Average Weight" value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Waist" value={dj.waist ? `${dj.waist}cm` : null} />
            <InfoField label="Hips" value={dj.hips ? `${dj.hips}cm` : null} />
            <InfoField label="Chest" value={dj.chest ? `${dj.chest}cm` : null} />
          </div>
          <InfoField label="Visible Changes" value={dj.visibleChanges} />
          <InfoField label="Body Perception" value={dj.bodyPerception} />
          <InfoField label="Satisfaction" value={dj.satisfaction} />
          <InfoField label="Menstrual Impact" value={dj.menstrualImpact} />
          <InfoField label="Biggest Change" value={dj.biggestChangeArea} />

          {/* Progress Photos */}
          <div className="w-full mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Progress Photos</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'photoFront', label: 'Front' },
                { id: 'photoSide', label: 'Side' },
                { id: 'photoBack', label: 'Back' }
              ].map(p => (
                <div key={p.id} className="aspect-[3/4] rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                  {dj[p.id] ? (
                    <img src={dj[p.id]} alt={p.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-bold uppercase">{p.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Section 3: Nutrition Compliance */}
        <Section title="Nutrition Compliance" subtitle="Tracking and dietary adherence." icon="restaurant">
          <InfoField label="Adherence Level" value={dj.nutritionAdherence} />
          <InfoField label="Calorie Target" value={dj.hitCalories} />
          <InfoField label="Protein Target" value={dj.hitProtein} />
          <InfoField label="Hardest Meal" value={dj.hardestMeal} />
          <InfoField label="Obstacles" value={dj.adherenceObstacles} />
          <InfoField label="Off-Plan Frequency" value={dj.offPlanCount} />
          <InfoField label="Eat Out Count" value={dj.eatOutCount} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Tracking Accuracy" value={dj.trackingAccuracy} />
            <InfoField label="Meals Followed" value={dj.mealsFollowed} />
          </div>
          <InfoField label="Nutrition Notes" value={dj.foodNotes || dj.digestiveIssues} />
        </Section>

        {/* Section 4: Digestion & Biofeedback */}
        <Section title="Digestion & Biofeedback" icon="health_and_safety">
          <InfoField label="Digestion Quality" value={dj.digestionQuality} />
          <InfoField label="Stool Consistency" value={dj.bowelRegularity} />
          <InfoField label="Symptoms" value={dj.digestiveSymptoms} />
          <InfoField label="Energy Post-Meal" value={dj.energyResponse} />
          <InfoField label="Hunger Level" value={dj.hunger} />
          <InfoField label="Cravings Intensity" value={dj.cravings} />
          <InfoField label="Cravings Timing" value={dj.cravingsTime} />
          <InfoField label="Fullness Response" value={dj.fullnessResponse} />
          <InfoField label="Bloating Level" value={dj.bloatingLevel} />
          <InfoField label="Digestion Notes" value={dj.foodNotes} />
        </Section>

        {/* Section 5: Habits */}
        <Section title="Daily Habits" icon="task_alt">
           <InfoField label="Water Amount" value={dj.waterAmount} />
           <InfoField label="Water Consistency" value={dj.waterIntake} />
           <InfoField label="Alcohol Intake" value={dj.alcoholIntake} />
           <InfoField label="Snacking Frequency" value={dj.snackingFrequency} />
           <InfoField label="Routine Structure" value={dj.routineStructure} />
           <InfoField label="Meal Timing" value={dj.mealTimingConsistency} />
           <InfoField label="Supplements" value={dj.supplements} />
           <InfoField label="Habit Notes" value={dj.habitNotes} />
        </Section>

        {/* Section 6: Training */}
        <Section title="Training Performance" icon="fitness_center">
           <InfoField label="Training Adherence" value={dj.trainingAdherence} />
           <InfoField label="Strength Levels" value={dj.strength} />
           <InfoField label="Overall Energy" value={dj.trainingEnergy} />
           <InfoField label="Training Quality" value={dj.trainingQuality} />
           <InfoField label="Intensity" value={dj.trainingIntensity} />
           <InfoField label="Recovery" value={dj.trainingRecovery} />
           <InfoField label="Performance Trend" value={dj.performance} />
           <InfoField label="Performance Drop" value={dj.performanceDropReasons} />
           <InfoField label="Exercise Wins" value={dj.prWins} />
           <InfoField label="Training Notes" value={dj.trainingNotes || dj.awkwardExerciseNotes} />
        </Section>

        {/* Section 7: Recovery */}
        <Section title="Recovery & Sleep" icon="bedtime">
           <InfoField label="Average Sleep" value={dj.sleepQuantity} />
           <InfoField label="Sleep Quality" value={dj.sleepQuality} />
           <InfoField label="Interruptions" value={dj.sleepInterruptions} />
           <InfoField label="Consistency" value={dj.sleepScheduleConsistency} />
           <InfoField label="Stress Levels" value={dj.stress} />
           <InfoField label="General Fatigue" value={dj.generalFatigue} />
           <InfoField label="Motivation" value={dj.motivation} />
           <InfoField label="Recovery Impacts" value={dj.recoveryImpacts} />
           <InfoField label="Recovery Notes" value={dj.recoveryNotes} />
        </Section>

        {/* Section 8: Activity & Pain */}
        <Section title="Activity & Pain" icon="healing">
           <InfoField label="Step Range" value={dj.stepRange} />
           <InfoField label="Steps Adherence" value={dj.stepsAdherence} />
           <InfoField label="Cardio Adherence" value={dj.cardioAdherence} />
           <InfoField label="Activity Level" value={dj.activityLevel} />
           <InfoField label="Pain Level" value={dj.painLevel} />
           <InfoField label="Affected Area" value={dj.affectedArea} />
           <InfoField label="Modified Training?" value={dj.modifiedTraining} />
           <InfoField label="Activity Notes" value={dj.activityNotes} />
           <InfoField label="Pain Notes" value={dj.painNotes} />
        </Section>

        {/* Section 9: Looking Ahead */}
        <Section title="Looking Ahead" icon="flag">
           <InfoField label="Improvement Focus" value={dj.improvementGoals} />
           <InfoField label="Next Week Readiness" value={dj.readiness} />
           <InfoField label="Non-negotiables" value={dj.nonNegotiables} />
           <InfoField label="Coach Support Request" value={dj.supportNeeded} />
           <InfoField label="Final Thoughts" value={dj.extraNotes} />
        </Section>

        {/* Coach Assessment Form - Hidden for clients */}
        {!isClient && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">reviews</span>
              </div>
              Coach Assessment
            </h2>
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-950/5">
              Load Template
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Column */}
            <div className="lg:col-span-2 space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Internal Notes & Feedback</label>
              <div className="relative group">
                <textarea 
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full bg-yellow-50/50 dark:bg-amber-900/10 border-2 border-yellow-100/50 dark:border-amber-900/20 rounded-2xl p-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-200 transition-all min-h-[200px] resize-none outline-none font-medium placeholder-slate-400" 
                  placeholder="Write your feedback here... e.g. 'Great progress on waist measurements, let's keep the carb cycling for another week...'"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Next Focus Column */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Next Week Focus</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                  <input 
                    value={nextWeekFocus}
                    onChange={(e) => setNextWeekFocus(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100/50 dark:border-blue-900/20 rounded-2xl text-[14px] font-semibold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all outline-none placeholder-slate-400" 
                    placeholder="e.g. Increase daily steps to 10k" 
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <label className="flex items-center gap-3 cursor-pointer group">
                     <div className="relative flex items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 rounded-lg group-hover:border-slate-300 transition-all"></div>
                        <Check className="absolute w-3.5 h-3.5 text-emerald-500 opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" />
                     </div>
                     <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Send via Email</span>
                   </label>
                   <button className="text-[12px] font-bold text-red-500 hover:text-red-600 transition-colors">
                     Clarification needed?
                   </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={handleMarkAsReviewed}
                    disabled={isPublishing}
                    className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[14px] font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 h-[56px]"
                  >
                    {isPublishing ? (
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Reviewed
                      </>
                    )}
                  </button>

                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing || !coachNotes.trim()}
                    className="w-full py-4 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-100 text-[14px] font-bold transition-all shadow-xl shadow-slate-900/20 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group h-[56px]"
                  >
                    {isPublishing ? (
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        Publish Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Display coach feedback to client if available */}
        {isClient && check_in.reviewed_at && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-800/50 mb-8">
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              Coach Feedback
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-emerald-900 dark:text-emerald-200">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest uppercase mb-1">Internal Notes & Feedback</p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 whitespace-pre-wrap italic font-semibold leading-relaxed">
                  {check_in.coach_notes || 'No feedback provided yet.'}
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest uppercase mb-1">Next Week Focus</p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shadow-sm">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{check_in.next_week_focus || 'Keep it up!'}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-12"></div>
    </div>
  );
}
