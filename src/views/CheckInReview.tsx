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
    const loadCheckIn = async () => {
      setIsLoading(true);
      try {
        console.log('DEBUG: CheckInReview fetching for:', { clientId, checkInId });
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
    loadCheckIn();
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
      <div className="h-12"></div>
    </div>
  );
}
