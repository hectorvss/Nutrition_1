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
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-full bg-[#17cf54]/20 flex items-center justify-center mb-8">
        <Target className="w-10 h-10 text-[#17cf54]" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Weekly Check-in</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-lg">
        Take a few minutes to reflect on your week. Your detailed feedback enables us to perfectly calibrate your nutrition, training, and habits for the upcoming week.
      </p>
      
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 mb-12">
        <Activity className="w-4 h-4 text-emerald-500" />
        Estimated time: ~3-5 minutes
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <button 
          onClick={nextStep}
          className="w-full sm:w-auto px-8 py-4 bg-[#17cf54] hover:bg-[#15b84a] text-slate-900 shadow-xl shadow-[#17cf54]/20 rounded-xl font-black text-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          Start Check-in <ArrowRight className="w-5 h-5" />
        </button>
        <button 
          onClick={onCancel}
          className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-lg transition-all"
        >
          Do it later
        </button>
      </div>
    </div>
  );

  const renderPage1 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How did your week go overall?</h2>
          <p className="text-sm text-slate-500 mt-1">Reflect on the general sentiment of the past 7 days.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {['Very bad', 'Bad', 'Average', 'Good', 'Excellent'].map(level => (
              <OptionCard 
                key={level} label={level} 
                selected={answers.overallWeek === level} 
                onClick={() => updateAnswer('overallWeek', level)} 
              />
            ))}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Context (Select all that apply)</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
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
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Anything important about this week? (Optional)</h3>
            <textarea 
              placeholder="Briefly describe any major events or feelings..."
              value={answers.weekNotes}
              onChange={e => updateAnswer('weekNotes', e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      
      {/* Weight & Body Perception Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">What changed in your body this week?</h2>
          <p className="text-sm text-slate-500 mt-1">Track your physical progress and metrics.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500"/> Current Weight (kg)</h3>
              <input 
                type="number" step="0.1" placeholder="00.0"
                value={answers.weight} onChange={e => updateAnswer('weight', e.target.value)}
                className="w-full text-4xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-2 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-purple-500"/> Body Perception</h3>
              <select 
                value={answers.bodyPerception} onChange={e => updateAnswer('bodyPerception', e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 focus:border-[#17cf54] outline-none transition-colors"
              >
                <option value="">Select how you feel...</option>
                {['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'More defined'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Measurements */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Measurements (cm) - Optional</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { id: 'waist', label: 'Waist' }, { id: 'hips', label: 'Hips' },
                { id: 'chest', label: 'Chest' }, { id: 'arms', label: 'Arms' }, { id: 'thighs', label: 'Thighs' }
              ].map(m => (
                <div key={m.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 focus-within:border-[#17cf54]/50 transition-colors">
                  <label className="text-xs font-bold text-slate-400 block mb-1">{m.label}</label>
                  <input 
                    type="number" step="0.5" placeholder="--"
                    value={(answers as any)[m.id]} onChange={e => updateAnswer(m.id as any, e.target.value)}
                    className="w-full text-lg font-bold bg-transparent border-none p-0 outline-none focus:ring-0 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photos Placeholder */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Progress Photos</h3>
            <div className="grid grid-cols-3 gap-4">
              {['Front', 'Side', 'Back'].map(view => (
                <div key={view} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#17cf54] hover:border-[#17cf54] cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-3xl mb-2">add_a_photo</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{view}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage3 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">How was your nutrition adherence?</h2>
            <p className="text-sm text-slate-500 mt-1">Reflect on your meals, cravings, and macro compliance.</p>
          </div>
          <Utensils className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)'].map(o => (
              <OptionCard key={o} label={o} selected={answers.nutritionAdherence === o} onClick={() => updateAnswer('nutritionAdherence', o)} />
            ))}
          </div>

          {(answers.nutritionAdherence === 'Average (50-80%)' || answers.nutritionAdherence === 'Poor (<50%)') && (
            <div className="mb-8 p-6 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 animate-in fade-in slide-in-from-top-4">
              <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-4">What made it difficult?</h4>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['Social event', 'Cravings', 'Lack of time', 'Poor planning', 'Too hungry', 'Emotional eating'].map(c => (
                  <Chip key={c} label={c} selected={answers.offPlanReasons.includes(c)} onClick={() => toggleArrayItem('offPlanReasons', c)} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest mb-4">Any extra context about your nutrition? (Optional)</h3>
            <textarea 
               value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
               className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-colors" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage4 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hunger, Cravings & Digestion</h2>
          <p className="text-sm text-slate-500 mt-1">How did your body respond to the food this week?</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Average Hunger Level</h3>
              <div className="flex flex-col gap-2">
                {['No hunger', 'Manageable', 'Noticeable but OK', 'Very hungry', 'Starving'].map(o => (
                  <Chip key={o} label={o} selected={answers.hunger === o} onClick={() => updateAnswer('hunger', o)} />
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Cravings Level</h3>
              <div className="flex flex-col gap-2">
                {['None', 'Occasional', 'Frequent', 'Constant'].map(o => (
                  <Chip key={o} label={o} selected={answers.cravings === o} onClick={() => updateAnswer('cravings', o)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
         <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Digestion</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Perfect', 'Minor bloating', 'Uncomfortable', 'Very poor'].map(o => (
              <OptionCard key={o} label={o} selected={answers.digestion === o} onClick={() => updateAnswer('digestion', o)} />
            ))}
          </div>

          {(answers.digestion === 'Uncomfortable' || answers.digestion === 'Very poor') && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Did any specific food cause this?</h3>
              <input 
                type="text" placeholder="e.g. Dairy, spicy food, too much fiber..."
                value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#17cf54] focus:ring-0 outline-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );

  const renderPage5 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Habits Adherence</h2>
          <p className="text-sm text-slate-500 mt-1">Water and supplement targets.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">Water Intake</h3>
              <div className="flex flex-col gap-2">
                 {['Met goal daily', 'Met it most days', 'Struggled', 'Very low'].map(o => (
                  <Chip key={o} label={o} selected={answers.waterIntake === o} onClick={() => updateAnswer('waterIntake', o)} />
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">Supplements</h3>
              <div className="flex flex-col gap-2">
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
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How did training go this week?</h2>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Training Adherence</h3>
            <select value={answers.trainingAdherence} onChange={e => updateAnswer('trainingAdherence', e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:border-[#17cf54]">
              <option value="">Select...</option>
              {['Completed all sessions', 'Missed 1 session', 'Missed 2 sessions', 'Missed several sessions'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Much worse', 'Slightly worse', 'Same', 'Slightly better', 'Much better'].map(o => (
                <OptionCard key={o} label={o} selected={answers.performance === o} onClick={() => updateAnswer('performance', o)} />
              ))}
            </div>
            {(answers.performance === 'Much worse' || answers.performance === 'Slightly worse') && (
              <div className="mt-4 p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Why do you think performance dropped?</h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['Sleep', 'Stress', 'Low calories', 'Pain', 'Motivation', 'Bad recovery'].map(c => (
                    <Chip key={c} label={c} selected={answers.performanceDropReasons.includes(c)} onClick={() => toggleArrayItem('performanceDropReasons', c)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Strength perception</h3>
              <div className="flex flex-col gap-2">
                {['Down', 'Same', 'Up'].map(o => <Chip key={o} label={o} selected={answers.strength === o} onClick={() => updateAnswer('strength', o)} />)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Cardio / Conditioning</h3>
               <div className="flex flex-col gap-2">
                {['Worse', 'Same', 'Better'].map(o => <Chip key={o} label={o} selected={answers.cardio === o} onClick={() => updateAnswer('cardio', o)} />)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Session Quality</h3>
               <div className="flex flex-col gap-2">
                {['Poor', 'Average', 'Good', 'Excellent'].map(o => <Chip key={o} label={o} selected={answers.sessionQuality === o} onClick={() => updateAnswer('sessionQuality', o)} />)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Any exercise felt especially good or bad? (Optional)</h3>
            <textarea value={answers.trainingNotes} onChange={e => updateAnswer('trainingNotes', e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] outline-none resize-none" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage7 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How well did you recover this week?</h2>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Sleep Quantity</h3>
              <div className="flex flex-wrap gap-2">
                {['<5h', '5–6h', '6–7h', '7–8h', '8h+'].map(o => <Chip key={o} label={o} selected={answers.sleepQuantity === o} onClick={() => updateAnswer('sleepQuantity', o)} />)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Sleep Quality</h3>
              <div className="flex flex-wrap gap-2">
                {['Very poor', 'Poor', 'Average', 'Good', 'Excellent'].map(o => <Chip key={o} label={o} selected={answers.sleepQuality === o} onClick={() => updateAnswer('sleepQuality', o)} />)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ id: 'stress', title: 'Stress Level' }, { id: 'energy', title: 'Energy Level' }, { id: 'motivation', title: 'Motivation' }].map(block => (
              <div key={block.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{block.title}</h3>
                <div className="flex flex-col gap-2">
                  {['Very low', 'Low', 'Moderate/Average', 'High/Good', 'Very high/Excellent'].map(o => <Chip key={o} label={o} selected={(answers as any)[block.id] === o} onClick={() => updateAnswer(block.id as any, o)} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">What impacted your recovery the most? (Optional)</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {['Work', 'Studies', 'Family', 'Travel', 'Anxiety', 'Poor routine', 'Late meals', 'Screen time', 'Not sure'].map(c => (
                <Chip key={c} label={c} selected={answers.recoveryImpacts.includes(c)} onClick={() => toggleArrayItem('recoveryImpacts', c)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage8 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Did you have any issue, pain or limitation?</h2>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'].map(o => (
              <OptionCard key={o} label={o} selected={answers.painLevel === o} onClick={() => updateAnswer('painLevel', o)} />
            ))}
          </div>

          {answers.painLevel && answers.painLevel !== 'No issues' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Affected Area</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['Neck', 'Shoulder', 'Back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Other'].map(o => <Chip key={o} label={o} selected={answers.affectedArea === o} onClick={() => updateAnswer('affectedArea', o)} />)}
                </div>
                
                <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mt-8 mb-4">Type of Issue</h3>
                 <div className="flex flex-wrap gap-2 md:gap-3">
                  {['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Digestive issue', 'Other'].map(o => <Chip key={o} label={o} selected={answers.painType === o} onClick={() => updateAnswer('painType', o)} />)}
                </div>

                <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mt-8 mb-4">Impact on Training</h3>
                 <select value={answers.trainingImpact} onChange={e => updateAnswer('trainingImpact', e.target.value)} className="w-full p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 font-bold outline-none focus:border-amber-400">
                  <option value="">Select...</option>
                  {['No impact', 'Small impact', 'Moderate impact', 'Couldn’t train well'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Describe what happened</h3>
                 <textarea placeholder="How did it start? How bad is it?" value={answers.painNotes} onChange={e => updateAnswer('painNotes', e.target.value)} className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-colors" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPage9 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How did you do with cardio and activity goals?</h2>
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Cardio Adherence</h3>
              <div className="flex flex-col gap-2">
                {['Did all', 'Missed some', 'Did very little', 'Did none'].map(o => <Chip key={o} label={o} selected={answers.cardioAdherence === o} onClick={() => updateAnswer('cardioAdherence', o)} />)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Daily Steps Adherence</h3>
              <div className="flex flex-col gap-2">
                {['Met goal daily', 'Met it most days', 'Rarely met it', 'Didn’t track'].map(o => <Chip key={o} label={o} selected={answers.stepsAdherence === o} onClick={() => updateAnswer('stepsAdherence', o)} />)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">General Activity Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Sedentary', 'Low', 'Moderate', 'High'].map(o => <OptionCard key={o} label={o} selected={answers.activityLevel === o} onClick={() => updateAnswer('activityLevel', o)} />)}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">Did you feel more tired than usual from activity? (Optional)</h3>
            <div className="flex gap-4">
              {['Yes', 'No'].map(o => <Chip key={o} label={o} selected={answers.activityTired === o} onClick={() => updateAnswer('activityTired', o)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage10 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">What would you like to improve or change next week?</h2>
            <p className="text-sm text-slate-500 mt-1">Reflect on your upcoming week's strategy.</p>
          </div>
          <Target className="w-5 h-5 text-indigo-500" />
        </div>
        
        <div className="p-6 space-y-8">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Focus areas (Select multiple)</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {['Nutrition', 'Hunger control', 'Meal organization', 'Training performance', 'Energy', 'Sleep', 'Motivation', 'Consistency', 'Digestion', 'Stress management'].map(c => (
                <Chip key={c} label={c} selected={answers.improvementGoals.includes(c)} onClick={() => toggleArrayItem('improvementGoals', c)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Is there anything you want help with?</h3>
               <textarea value={answers.helpNotes} onChange={e => updateAnswer('helpNotes', e.target.value)} className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Anything you want your coach to review?</h3>
               <textarea value={answers.reviewNotes} onChange={e => updateAnswer('reviewNotes', e.target.value)} className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">How ready do you feel for next week?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Not ready', 'Somewhat ready', 'Ready', 'Very ready'].map(o => <OptionCard key={o} label={o} selected={answers.readiness === o} onClick={() => updateAnswer('readiness', o)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage11 = () => (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review before submit</h2>
            <p className="text-sm text-slate-500 mt-1">Make sure your answers look correct before locking them in.</p>
          </div>
          <RefreshCcw className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-start group">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-[#17cf54]"/> Overall & Body</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Week: <span className="font-bold">{answers.overallWeek || '--'}</span> • Weight: <span className="font-bold">{answers.weight ? `${answers.weight}kg` : '--'}</span> • Perception: <span className="font-bold">{answers.bodyPerception || '--'}</span></p>
            </div>
            <button onClick={() => setCurrentStep(1)} className="text-slate-400 hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all font-bold text-sm uppercase">Edit</button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-start group">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Utensils className="w-4 h-4 text-emerald-500"/> Nutrition & Digestion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Adherence: <span className="font-bold">{answers.nutritionAdherence || '--'}</span> • Hunger: <span className="font-bold">{answers.hunger || '--'}</span> • Digestion: <span className="font-bold">{answers.digestion || '--'}</span></p>
            </div>
            <button onClick={() => setCurrentStep(3)} className="text-slate-400 hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all font-bold text-sm uppercase">Edit</button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-start group">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-indigo-500"/> Training & Cardio</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300">Training Adherence: <span className="font-bold">{answers.trainingAdherence || '--'}</span> • Perf: <span className="font-bold">{answers.performance || '--'}</span> • Cardio: <span className="font-bold">{answers.cardioAdherence || '--'}</span></p>
            </div>
            <button onClick={() => setCurrentStep(6)} className="text-slate-400 hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all font-bold text-sm uppercase">Edit</button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-start group">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Moon className="w-4 h-4 text-purple-500"/> Recovery & Issues</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Sleep: <span className="font-bold">{answers.sleepQuantity || '--'}</span> • Stress: <span className="font-bold">{answers.stress || '--'}</span> • Issues: <span className="font-bold">{answers.painLevel || 'No issues'}</span></p>
            </div>
            <button onClick={() => setCurrentStep(7)} className="text-slate-400 hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all font-bold text-sm uppercase">Edit</button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-4">
            <Brain className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-100">Smart Insight</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Based on your selections, you had strong training performance but high stress levels. Prioritize rest this upcoming week to maintain gains.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage12 = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12 md:py-24 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-full bg-[#17cf54] flex items-center justify-center mb-8 shadow-xl shadow-[#17cf54]/30 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Check-in Complete!</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-lg">
        Incredible work this week. Your coach will review your data and calibrate your plan immediately. Stay focused.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <button 
          onClick={onCancel}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-lg transition-transform active:scale-95"
        >
          Back to Dashboard
        </button>
        <button 
          className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-lg transition-all"
        >
          View Summary
        </button>
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      {/* Top Bar for Steps > 0 */}
      {currentStep > 0 && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentStep} of {TOTAL_STEPS}</div>
            <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full bg-[#17cf54] transition-all duration-500 ease-out" 
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {renderStep()}
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
