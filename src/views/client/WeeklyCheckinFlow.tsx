import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, 
  Activity, Flame, Droplets, Utensils, Moon, 
  Dumbbell, Target, AlertTriangle, Brain, RefreshCcw
} from 'lucide-react';

interface CheckinAnswers {
  // Page 1
  overallWeek: string;
  contextChips: string[];
  weekNotes: string;
  // Page 2
  weight: string;
  waist: string;
  hips: string;
  chest: string;
  arms: string;
  thighs: string;
  bodyPerception: string;
  // Page 3
  nutritionAdherence: string;
  mealsMissed: string;
  trackedFood: string;
  offPlanFrequency: string;
  offPlanReasons: string[];
  // Page 4
  hunger: string;
  cravings: string;
  digestion: string;
  bloating: string;
  bowel: string;
  energyFood: string;
  digestiveIssues: string;
  // Page 5
  waterIntake: string;
  steps: string;
  mealTiming: string;
  supplements: string;
  alcohol: string;
  eatingOut: string;
  // Page 6
  trainingAdherence: string;
  performance: string;
  strength: string;
  cardio: string;
  sessionQuality: string;
  trainingNotes: string;
  performanceDropReasons: string[];
  // Page 7
  sleepQuantity: string;
  sleepQuality: string;
  stress: string;
  energy: string;
  motivation: string;
  recoveryImpacts: string[];
  // Page 8
  painLevel: string;
  affectedArea: string;
  painType: string;
  trainingImpact: string;
  painNotes: string;
  // Page 9
  cardioAdherence: string;
  stepsAdherence: string;
  activityLevel: string;
  activityTired: string;
  // Page 10
  improvementGoals: string[];
  helpNotes: string;
  reviewNotes: string;
  readiness: string;
}

const defaultAnswers: CheckinAnswers = {
  overallWeek: '', contextChips: [], weekNotes: '',
  weight: '', waist: '', hips: '', chest: '', arms: '', thighs: '', bodyPerception: '',
  nutritionAdherence: '', mealsMissed: '', trackedFood: '', offPlanFrequency: '', offPlanReasons: [],
  hunger: '', cravings: '', digestion: '', bloating: '', bowel: '', energyFood: '', digestiveIssues: '',
  waterIntake: '', steps: '', mealTiming: '', supplements: '', alcohol: '', eatingOut: '',
  trainingAdherence: '', performance: '', strength: '', cardio: '', sessionQuality: '', trainingNotes: '', performanceDropReasons: [],
  sleepQuantity: '', sleepQuality: '', stress: '', energy: '', motivation: '', recoveryImpacts: [],
  painLevel: '', affectedArea: '', painType: '', trainingImpact: '', painNotes: '',
  cardioAdherence: '', stepsAdherence: '', activityLevel: '', activityTired: '',
  improvementGoals: [], helpNotes: '', reviewNotes: '', readiness: ''
};

interface WeeklyCheckinFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function WeeklyCheckinFlow({ onComplete, onCancel }: WeeklyCheckinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<CheckinAnswers>(defaultAnswers);

  const TOTAL_STEPS = 12; // 0 to 12

  const updateAnswer = (key: keyof CheckinAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: keyof CheckinAnswers, item: string) => {
    setAnswers(prev => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(item)) {
        return { ...prev, [key]: currentArray.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...currentArray, item] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const OptionCard = ({ label, selected, onClick, icon: Icon }: any) => (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center h-full
        ${selected 
          ? 'border-[#17cf54] bg-[#17cf54]/10 text-slate-900 dark:text-white' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-[#17cf54]/50'
        }`}
    >
      {Icon && <Icon className={`w-6 h-6 ${selected ? 'text-[#17cf54]' : 'text-slate-400'}`} />}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );

  const Chip = ({ label, selected, onClick }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border
        ${selected 
          ? 'bg-[#17cf54] text-slate-900 border-[#17cf54]' 
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#17cf54]/50'
        }`}
    >
      {label}
    </button>
  );

  // ---------------------------------------------------------------------------
  // PAGE RENDERERS
  // ---------------------------------------------------------------------------

  const renderIntro = () => (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Visual / Brand */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#17cf54] to-emerald-700 p-12 flex flex-col justify-between text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
           
           <div className="relative z-10 font-black text-2xl tracking-tighter flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#17cf54] shadow-lg">
                 <Target className="w-6 h-6" />
              </div>
              WEEKLY FLOW
           </div>

           <div className="relative z-10 space-y-6">
              <h2 className="text-5xl font-black leading-tight tracking-tighter">Your progress,<br/>perfectly calibrated.</h2>
              <p className="text-emerald-50 text-lg font-medium max-w-sm">Every data point you share helps us refine your path to excellence. This is the core of your transformation.</p>
           </div>

           <div className="relative z-10 flex items-center gap-4 text-emerald-100 font-bold text-sm bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-emerald-600 bg-slate-300 dark:bg-slate-700 shadow-sm" />)}
              </div>
              Join +1,000 elite performers
           </div>
        </div>

        {/* Right Side: Action */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-full">
           <div className="space-y-4 mb-8 text-center pt-8">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ready for a new week?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Detailed feedback = Better results. It only takes 3-5 minutes.</p>
           </div>

           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 w-full mb-8">
             <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={nextStep}
                  className="w-full py-5 bg-[#17cf54] hover:bg-[#15b84a] text-slate-900 shadow-2xl shadow-[#17cf54]/30 rounded-2xl font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Start Your Check-in 
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           </div>

           <div className="w-full space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Check-in History</h4>
                 <div className="text-[10px] font-black text-[#17cf54] uppercase tracking-widest bg-[#17cf54]/10 px-2 py-1 rounded-md">Last 3 Weeks</div>
              </div>

              <div className="space-y-3">
                 {[
                   { date: 'Oct 24, 2023', score: 'Excellent', status: 'Reviewed' },
                   { date: 'Oct 17, 2023', score: 'Good', status: 'Reviewed' },
                   { date: 'Oct 10, 2023', score: 'Fair', status: 'Reviewed' }
                 ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">{i+1}</div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{h.date}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{h.status}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-[#17cf54]">{h.score}</span>
                         <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors group-hover:text-[#17cf54]">
                            <ArrowRight className="w-4 h-4" />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <button 
                onClick={onCancel}
                className="w-full py-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors text-sm"
              >
                Close & Return
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderPage1 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">How did your week go overall?</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Your general sentiment sets the context for everything else.</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Select Sentiment</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Very bad', 'Bad', 'Average', 'Good', 'Excellent'].map(level => (
                <OptionCard 
                  key={level} label={level} 
                  selected={answers.overallWeek === level} 
                  onClick={() => updateAnswer('overallWeek', level)} 
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Key Influencers</h3>
            <div className="flex flex-wrap gap-3">
              {['Stress', 'Travel', 'Busy week', 'Sick', 'Good routine', 'Low motivation', 'Great energy'].map(chip => (
                <Chip 
                  key={chip} label={chip} 
                  selected={answers.contextChips.includes(chip)} 
                  onClick={() => toggleArrayItem('contextChips', chip)} 
                />
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Additional Context (Optional)</h3>
             <textarea 
               placeholder="Briefly describe any major events or feelings..."
               value={answers.weekNotes}
               onChange={e => updateAnswer('weekNotes', e.target.value)}
               className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-lg"
             />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Body Progress</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Track your physical metrics and how you feel in your own skin.</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Current Weight (kg)</h3>
              <div className="relative">
                <input 
                  type="number" step="0.1" placeholder="00.0"
                  value={answers.weight} onChange={e => updateAnswer('weight', e.target.value)}
                  className="w-full text-6xl font-black bg-transparent border-b-4 border-slate-100 dark:border-slate-800 py-4 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-200"
                />
                <div className="absolute right-0 bottom-6 text-2xl font-black text-slate-300">KG</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Body Perception</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'Defined'].map(o => (
                  <Chip key={o} label={o} selected={answers.bodyPerception === o} onClick={() => updateAnswer('bodyPerception', o)} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Measurements (Optional)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { id: 'waist', label: 'Waist' }, { id: 'hips', label: 'Hips' },
                { id: 'chest', label: 'Chest' }, { id: 'arms', label: 'Arms' }, { id: 'thighs', label: 'Thighs' }
              ].map(m => (
                <div key={m.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 focus-within:border-[#17cf54] transition-all">
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{m.label}</label>
                  <div className="flex items-baseline gap-1">
                    <input 
                      type="number" step="0.5" placeholder="--"
                      value={(answers as any)[m.id]} onChange={e => updateAnswer(m.id as any, e.target.value)}
                      className="w-full text-2xl font-black bg-transparent border-none p-0 outline-none focus:ring-0 text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-300">CM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage3 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nutrition Adherence</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">How consistently did you follow your fuel plan?</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Utensils className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Weekly Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)'].map(o => (
                   <OptionCard key={o} label={o} selected={answers.nutritionAdherence === o} onClick={() => updateAnswer('nutritionAdherence', o)} />
                 ))}
              </div>
           </div>

           {(answers.nutritionAdherence === 'Average (50-80%)' || answers.nutritionAdherence === 'Poor (<50%)') && (
            <div className="p-8 rounded-[2rem] bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 animate-in fade-in zoom-in-95">
              <h4 className="text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-6">Identify the Obstacles</h4>
              <div className="flex flex-wrap gap-3">
                {['Social event', 'Cravings', 'Lack of time', 'Poor planning', 'Too hungry', 'Emotional eating'].map(c => (
                  <Chip key={c} label={c} selected={answers.offPlanReasons.includes(c)} onClick={() => toggleArrayItem('offPlanReasons', c)} />
                ))}
              </div>
            </div>
          )}

          <div>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Nutrition Notes & Observations</h3>
             <textarea 
               placeholder="Did you feel low energy? Any specific meals you struggled with?"
               value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
               className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-lg" 
             />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage4 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Digestion & Satiety</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">How is your body processing the plan?</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500">
            <Flame className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Hunger Levels</h3>
              <div className="flex flex-col gap-3">
                {['No hunger', 'Manageable', 'Noticeable but OK', 'Very hungry', 'Starving'].map(o => (
                  <Chip key={o} label={o} selected={answers.hunger === o} onClick={() => updateAnswer('hunger', o)} />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Cravings Intensity</h3>
              <div className="flex flex-col gap-3">
                {['None', 'Occasional', 'Frequent', 'Constant'].map(o => (
                  <Chip key={o} label={o} selected={answers.cravings === o} onClick={() => updateAnswer('cravings', o)} />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Bowel & Bloating</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {['Perfect', 'Minor bloating', 'Uncomfortable', 'Very poor'].map(o => (
                <OptionCard key={o} label={o} selected={answers.digestion === o} onClick={() => updateAnswer('digestion', o)} />
              ))}
            </div>

            {(answers.digestion === 'Uncomfortable' || answers.digestion === 'Very poor') && (
              <div className="animate-in fade-in zoom-in-95">
                <input 
                  type="text" placeholder="Specify any discomfort or problematic foods..."
                  value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
                  className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#17cf54] focus:ring-0 outline-none transition-all text-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage5 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daily Foundations</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">The small habits that drive the big results.</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-400/10 text-blue-400">
            <Droplets className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Hydration Targets</h3>
              <div className="flex flex-col gap-3">
                 {['Met goal daily', 'Met it most days', 'Struggled', 'Very low'].map(o => (
                  <Chip key={o} label={o} selected={answers.waterIntake === o} onClick={() => updateAnswer('waterIntake', o)} />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Supplements Consistency</h3>
              <div className="flex flex-col gap-3">
                 {['Took all', 'Missed some', 'Missed most', 'Did not take any'].map(o => (
                  <Chip key={o} label={o} selected={answers.supplements === o} onClick={() => updateAnswer('supplements', o)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage6 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Training Performance</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Analyze your physical execution and strength levels.</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Dumbbell className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Training Adherence</h3>
              <select 
                value={answers.trainingAdherence} 
                onChange={e => updateAnswer('trainingAdherence', e.target.value)} 
                className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-lg font-bold outline-none focus:border-[#17cf54] appearance-none cursor-pointer transition-all"
              >
                <option value="">Select consistency...</option>
                {['Completed all sessions', 'Missed 1 session', 'Missed 2 sessions', 'Missed several sessions'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Overall Strength Perception</h3>
              <div className="grid grid-cols-3 gap-4">
                {['Down', 'Same', 'Up'].map(o => (
                  <Chip key={o} label={o} selected={answers.strength === o} onClick={() => updateAnswer('strength', o)} />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Session Quality & Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {['Much worse', 'Slightly worse', 'Same', 'Slightly better', 'Much better'].map(o => (
                <OptionCard key={o} label={o} selected={answers.performance === o} onClick={() => updateAnswer('performance', o)} />
              ))}
            </div>

            {(answers.performance === 'Much worse' || answers.performance === 'Slightly worse') && (
              <div className="p-8 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 mb-8">
                <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-6">Potential Performance Caps</h4>
                <div className="flex flex-wrap gap-3">
                  {['Sleep', 'Stress', 'Low calories', 'Pain', 'Motivation', 'Bad recovery'].map(c => (
                    <Chip key={c} label={c} selected={answers.performanceDropReasons.includes(c)} onClick={() => toggleArrayItem('performanceDropReasons', c)} />
                  ))}
                </div>
              </div>
            )}

            <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Training Notes (Optional)</h3>
               <textarea 
                 placeholder="Any PRs? Any exercises that felt awkward?"
                 value={answers.trainingNotes} onChange={e => updateAnswer('trainingNotes', e.target.value)} 
                 className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-lg" 
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage7 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recovery & Sleep</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">The foundation of your progress happens while you rest.</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500">
            <Moon className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sleep Quantity (Avg)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {['<5h', '5–6h', '6–7h', '7–8h', '8h+'].map(o => <Chip key={o} label={o} selected={answers.sleepQuantity === o} onClick={() => updateAnswer('sleepQuantity', o)} />)}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sleep Quality</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {['Very poor', 'Poor', 'Average', 'Good', 'Excellent'].map(o => <Chip key={o} label={o} selected={answers.sleepQuality === o} onClick={() => updateAnswer('sleepQuality', o)} />)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-100 dark:border-slate-800">
            {[{ id: 'stress', title: 'Stress Level' }, { id: 'energy', title: 'Energy Level' }, { id: 'motivation', title: 'Motivation' }].map(block => (
              <div key={block.id} className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{block.title}</h3>
                <div className="flex flex-col gap-2">
                  {['Very low', 'Low', 'Average', 'High', 'Excellent'].map(o => <Chip key={o} label={o} selected={(answers as any)[block.id] === o} onClick={() => updateAnswer(block.id as any, o)} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage8 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Injury & Pain Tracking</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Your safety is our priority. Report any discomfort immediately.</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Current Pain Level</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'].map(o => (
                   <OptionCard key={o} label={o} selected={answers.painLevel === o} onClick={() => updateAnswer('painLevel', o)} />
                 ))}
              </div>
           </div>

           {answers.painLevel && answers.painLevel !== 'No issues' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-amber-600">Affected Area</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Neck', 'Shoulder', 'Back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Other'].map(o => <Chip key={o} label={o} selected={answers.affectedArea === o} onClick={() => updateAnswer('affectedArea', o)} />)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-amber-600">Type of Issue</h3>
                   <div className="flex flex-wrap gap-2">
                    {['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Other'].map(o => <Chip key={o} label={o} selected={answers.painType === o} onClick={() => updateAnswer('painType', o)} />)}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-amber-600">Impact on Training</h3>
                   <select 
                     value={answers.trainingImpact} 
                     onChange={e => updateAnswer('trainingImpact', e.target.value)} 
                     className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-lg font-bold outline-none focus:border-amber-400 transition-all appearance-none cursor-pointer"
                   >
                    <option value="">Select impact...</option>
                    {['No impact', 'Small impact', 'Moderate impact', 'Couldn’t train well'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-amber-600">Details</h3>
                  <textarea 
                    placeholder="How did it start? What movements make it worse?" 
                    value={answers.painNotes} onChange={e => updateAnswer('painNotes', e.target.value)} 
                    className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-amber-500 focus:ring-0 outline-none resize-none transition-all text-lg" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPage9 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Activity & Movement</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Tracking your non-exercise activity and cardio adherence.</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500">
            <Flame className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Cardio Goals</h3>
              <div className="flex flex-col gap-3">
                {['Did all', 'Missed some', 'Did very little', 'Did none'].map(o => <Chip key={o} label={o} selected={answers.cardioAdherence === o} onClick={() => updateAnswer('cardioAdherence', o)} />)}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Daily Steps (Avg)</h3>
              <div className="flex flex-col gap-3">
                {['Met goal daily', 'Met it most days', 'Rarely met it', 'Didn’t track'].map(o => <Chip key={o} label={o} selected={answers.stepsAdherence === o} onClick={() => updateAnswer('stepsAdherence', o)} />)}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">General Activity Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {['Sedentary', 'Low', 'Moderate', 'High'].map(o => <OptionCard key={o} label={o} selected={answers.activityLevel === o} onClick={() => updateAnswer('activityLevel', o)} />)}
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 transition-colors flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Felt more tired than usual?</h3>
              <div className="flex gap-4">
                {['Yes', 'No'].map(o => <Chip key={o} label={o} selected={answers.activityTired === o} onClick={() => updateAnswer('activityTired', o)} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage10 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Looking Ahead</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Define your focus for the upcoming week.</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Target className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Primary Focus Areas</h3>
            <div className="flex flex-wrap gap-3">
              {['Nutrition', 'Hunger control', 'Meal organization', 'Training performance', 'Energy', 'Sleep', 'Motivation', 'Consistency', 'Digestion', 'Stress management'].map(c => (
                <Chip key={c} label={c} selected={answers.improvementGoals.includes(c)} onClick={() => toggleArrayItem('improvementGoals', c)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Coach Review Request</h3>
               <textarea 
                 placeholder="Anything specific your coach should look at?"
                 value={answers.reviewNotes} onChange={e => updateAnswer('reviewNotes', e.target.value)} 
                 className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-lg" 
               />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Open Support</h3>
               <textarea 
                 placeholder="How can we help you win next week?"
                 value={answers.helpNotes} onChange={e => updateAnswer('helpNotes', e.target.value)} 
                 className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[150px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-lg" 
               />
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Next Week Readiness</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Not ready', 'Somewhat ready', 'Ready', 'Very ready'].map(o => (
                <OptionCard key={o} label={o} selected={answers.readiness === o} onClick={() => updateAnswer('readiness', o)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage11 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Final Review</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Review your data points before locking in your week.</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
            <RefreshCcw className="w-8 h-8" />
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-6">
           {[
             { title: 'Overall & Body', icon: Activity, color: 'text-blue-500', step: 1, desc: `Week: ${answers.overallWeek || '--'} • Weight: ${answers.weight ? `${answers.weight}kg` : '--'}` },
             { title: 'Nutrition & Digestion', icon: Utensils, color: 'text-emerald-500', step: 3, desc: `Adherence: ${answers.nutritionAdherence || '--'} • Digestion: ${answers.digestion || '--'}` },
             { title: 'Training & Performance', icon: Dumbbell, color: 'text-indigo-500', step: 6, desc: `Adherence: ${answers.trainingAdherence || '--'} • Quality: ${answers.sessionQuality || '--'}` },
             { title: 'Recovery & Vitality', icon: Moon, color: 'text-purple-500', step: 7, desc: `Sleep: ${answers.sleepQuantity || '--'} • Stress: ${answers.stress || '--'}` }
           ].map((item, idx) => (
             <div key={idx} className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" onClick={() => setCurrentStep(item.step)}>
                <div className="flex items-center gap-6">
                   <div className={`p-4 rounded-2xl bg-white dark:bg-slate-700 shadow-sm ${item.color}`}><item.icon className="w-6 h-6"/></div>
                   <div>
                      <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                   </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#17cf54] transition-colors shadow-sm">Edit</div>
             </div>
           ))}

           <div className="mt-8 p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-6 items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg"><Brain className="w-8 h-8"/></div>
              <div>
                 <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Smart Check-in Analysis</h4>
                 <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Your data suggests excellent training adherence but a slight dip in recovery. Your coach will focus on optimizing your rest protocols.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderPage12 = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 md:p-24 shadow-2xl overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-700 border border-slate-100 dark:border-slate-800">
         <div className="w-32 h-32 rounded-[2.5rem] bg-[#17cf54] flex items-center justify-center mb-12 shadow-2xl shadow-[#17cf54]/40 animate-bounce relative">
            <div className="absolute inset-0 rounded-[2.5rem] bg-[#17cf54] animate-ping opacity-20" />
            <CheckCircle2 className="w-16 h-16 text-white relative z-10" />
         </div>

         <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Mission Accomplished.</h1>
         <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-md font-medium leading-relaxed">
           Your data is safely in your coach's hands. We'll calibrate your plan for the week ahead based on these insights.
         </p>

         <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button 
              onClick={onCancel}
              className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/20"
            >
              Back to Dashboard
            </button>
            <button 
              className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Share Progress
            </button>
         </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // RENDER CONTROLLER
  // ---------------------------------------------------------------------------
  const renderStep = () => {
    switch(currentStep) {
      case 0: return renderIntro();
      case 1: return renderPage1();
      case 2: return renderPage2();
      case 3: return renderPage3();
      case 4: return renderPage4();
      case 5: return renderPage5();
      case 6: return renderPage6();
      case 7: return renderPage7();
      case 8: return renderPage8();
      case 9: return renderPage9();
      case 10: return renderPage10();
      case 11: return renderPage11();
      case 12: return renderPage12();
      default: return <div>Step {currentStep} under construction...</div>;
    }
  };

  const progressPct = currentStep === 0 ? 0 : Math.max(5, (currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
      {/* Floating Header Card */}
      {currentStep > 0 && currentStep < TOTAL_STEPS && (
        <div className="fixed top-6 left-4 right-4 md:left-8 md:right-8 z-30 pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
                <div className="px-6 py-4 flex items-center justify-between">
                   <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-colors group">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100 transition-colors">
                         <ArrowLeft className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:inline">Back</span>
                   </button>
                   <div className="flex flex-col items-center">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Check-in Progress</div>
                     <div className="text-sm font-black text-slate-900 dark:text-white">Step {currentStep} of {TOTAL_STEPS}</div>
                   </div>
                   <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                      <span className="material-symbols-outlined text-xl">close</span>
                   </button>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
                   <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-[#17cf54] shadow-[0_0_10px_rgba(23,207,84,0.3)] transition-all duration-700 ease-out" 
                      style={{ width: `${progressPct}%` }}
                   />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-24 md:pt-32">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {renderStep()}
        </div>
      </div>

      {/* Bottom Floating Navigation for Steps > 0 */}
      {currentStep > 0 && currentStep <= TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-gradient-to-t from-[#f6f8f6] via-[#f6f8f6] dark:from-[#112116] dark:via-[#112116] to-transparent p-6 pointer-events-none">
          <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
            <button 
              onClick={currentStep === TOTAL_STEPS ? onComplete : nextStep}
              className="bg-[#17cf54] hover:bg-[#15b84a] text-slate-900 px-8 py-4 rounded-xl font-black shadow-xl shadow-[#17cf54]/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              {currentStep === TOTAL_STEPS ? 'Submit Check-in' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
