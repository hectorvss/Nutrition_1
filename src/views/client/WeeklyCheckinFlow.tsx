import React, { useState } from 'react';
import { fetchWithAuth } from '../../api';

interface CheckinAnswers {
  // Page 1
  overallWeek: string;
  contextChips: string[];
  weekNotes: string;
  matchPlan: string;
  mentalHealth: string;
  consistency: string;
  // Page 2
  weight: string;
  avgWeight: string;
  waist: string;
  hips: string;
  chest: string;
  arms: string;
  thighs: string;
  bodyPerception: string;
  visibleChanges: string;
  biggestChangeArea: string;
  satisfaction: string;
  menstrualImpact: string;
  // Page 3
  nutritionAdherence: string;
  mealsFollowed: string;
  hitCalories: string;
  hitProtein: string;
  offPlanCount: string;
  skippedMeals: string;
  trackingAccuracy: string;
  adherenceObstacles: string[];
  hardestMeal: string;
  digestiveIssues: string;
  // Page 4
  hunger: string;
  cravings: string;
  cravingsTime: string;
  digestionQuality: string;
  bloatingLevel: string;
  bowelRegularity: string;
  fullnessResponse: string;
  energyResponse: string;
  digestiveSymptoms: string[];
  foodNotes: string;
  // Page 5
  waterIntake: string;
  waterAmount: string;
  supplements: string;
  mealTimingConsistency: string;
  eatOutCount: string;
  alcoholIntake: string;
  snackingFrequency: string;
  routineStructure: string;
  habitNotes: string;
  // Page 6
  trainingAdherence: string;
  performance: string;
  strength: string;
  trainingEnergy: string;
  trainingQuality: string;
  trainingRecovery: string;
  trainingIntensity: string;
  strongExerciseNotes: string;
  awkwardExerciseNotes: string;
  prWins: string;
  performanceDropReasons: string[];
  trainingNotes: string;
  // Page 7
  sleepQuantity: string;
  sleepQuality: string;
  sleepInterruptions: string;
  sleepScheduleConsistency: string;
  stress: string;
  energy: string;
  motivation: string;
  generalFatigue: string;
  recoveryImpacts: string[];
  recoveryNotes: string;
  // Page 8
  painLevel: string;
  affectedArea: string;
  painType: string;
  trainingImpact: string;
  painDuration: string;
  painProgression: string;
  modifiedTraining: string;
  painNotes: string;
  // Page 9
  cardioAdherence: string;
  cardioPerformance: string;
  stepsAdherence: string;
  stepRange: string;
  activityLevel: string;
  activityTired: string;
  activityLimitations: string[];
  activityNotes: string;
  // Page 10
  improvementGoals: string[];
  nonNegotiables: string;
  reviewNotes: string;
  supportNeeded: string;
  readiness: string;
  // Final Review
  extraNotes: string;
  // Photos
  photoFront: string;
  photoSide: string;
  photoBack: string;
}

const defaultAnswers: CheckinAnswers = {
  overallWeek: '', contextChips: [], weekNotes: '', matchPlan: '', mentalHealth: '', consistency: '',
  weight: '', avgWeight: '', waist: '', hips: '', chest: '', arms: '', thighs: '', bodyPerception: '', visibleChanges: '', biggestChangeArea: '', satisfaction: '', menstrualImpact: '',
  nutritionAdherence: '', mealsFollowed: '', hitCalories: '', hitProtein: '', offPlanCount: '', skippedMeals: '', trackingAccuracy: '', adherenceObstacles: [], hardestMeal: '', digestiveIssues: '',
  hunger: '', cravings: '', cravingsTime: '', digestionQuality: '', bloatingLevel: '', bowelRegularity: '', fullnessResponse: '', energyResponse: '', digestiveSymptoms: [], foodNotes: '',
  waterIntake: '', waterAmount: '', supplements: '', mealTimingConsistency: '', eatOutCount: '', alcoholIntake: '', snackingFrequency: '', routineStructure: '', habitNotes: '',
  trainingAdherence: '', performance: '', strength: '', trainingEnergy: '', trainingQuality: '', trainingRecovery: '', trainingIntensity: '', strongExerciseNotes: '', awkwardExerciseNotes: '', prWins: '', performanceDropReasons: [], trainingNotes: '',
  sleepQuantity: '', sleepQuality: '', sleepInterruptions: '', sleepScheduleConsistency: '', stress: '', energy: '', motivation: '', generalFatigue: '', recoveryImpacts: [], recoveryNotes: '',
  painLevel: '', affectedArea: '', painType: '', trainingImpact: '', painDuration: '', painProgression: '', modifiedTraining: '', painNotes: '',
  cardioAdherence: '', cardioPerformance: '', stepsAdherence: '', stepRange: '', activityLevel: '', activityTired: '', activityLimitations: [], activityNotes: '',
  improvementGoals: [], nonNegotiables: '', reviewNotes: '', supportNeeded: '', readiness: '',
  extraNotes: '',
  photoFront: '', photoSide: '', photoBack: ''
};

interface WeeklyCheckinFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

// --- Reusable UI Primitives (defined outside to prevent focus loss on re-render) ---
const Chip = ({ label, selected, onClick }: any) => (
  <button onClick={onClick}
    type="button"
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap
      ${selected ? 'bg-[#17cf54] text-white border-[#17cf54] shadow-md shadow-[#17cf54]/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'}`}
  >{label}</button>
);

const OptionCard = ({ label, selected, onClick }: any) => (
  <div onClick={onClick}
    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center text-center text-sm font-bold
      ${selected ? 'border-[#17cf54] bg-[#17cf54]/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-[#17cf54]/50'}`}
  >{label}</div>
);

const Section = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined">{icon}</span></div>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

const FieldLabel = ({ children }: any) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{children}</h3>
);

const compressImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- Page Components ---
interface PageProps {
  answers: CheckinAnswers;
  updateAnswer: (key: keyof CheckinAnswers, value: any) => void;
  toggleArrayItem: (key: keyof CheckinAnswers, item: string) => void;
  nextStep: () => void;
  onCancel: () => void;
  setCurrentStep: (step: number) => void;
}

const PageIntro = ({ nextStep, onCancel, answers }: PageProps) => (
  <div className="flex-1 flex flex-col gap-6 w-full">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Weekly Check-in</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md uppercase">Due Today</span>
      </div>
      <div className="flex flex-col items-start gap-6">
        <div className="flex-1">
          <p className="text-slate-500 text-sm mb-4">Detailed feedback = Better results. Complete your weekly check-in to keep your coach updated on your progress, biofeedback, and adherence. It only takes 3-5 minutes.</p>
        </div>
        <button onClick={nextStep} className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-sm shadow-lg shadow-[#17cf54]/20 whitespace-nowrap shrink-0">
          <span className="material-symbols-outlined text-[18px]">play_arrow</span> Start Check-in
        </button>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Check-in History</h2>
          <p className="text-sm text-slate-500">Last 3 weeks</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {[
          { date: 'Oct 24, 2023', score: 'Excellent', status: 'Reviewed' },
          { date: 'Oct 17, 2023', score: 'Good', status: 'Reviewed' },
          { date: 'Oct 10, 2023', score: 'Fair', status: 'Reviewed' }
        ].map((h, i) => (
          <div key={i} className="group border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">{i + 1}</div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{h.date}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{h.status}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${h.score === 'Excellent' ? 'text-[#17cf54] bg-[#17cf54]/10' : h.score === 'Good' ? 'text-blue-500 bg-blue-50' : 'text-amber-500 bg-amber-50'}`}>{h.score}</span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onCancel} className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors">Close & Return</button>
      </div>
    </div>
  </div>
);

const Page1 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="How did your week go overall?" subtitle="Your general sentiment sets the context for everything else." icon="mood">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Select Sentiment</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very bad', 'Bad', 'Average', 'Good', 'Excellent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.overallWeek === l} onClick={() => updateAnswer('overallWeek', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>How closely did this week match the plan?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Not at all', 'Slightly', 'Moderately', 'Mostly', 'Completely'].map(l => (
            <OptionCard key={l} label={l} selected={answers.matchPlan === l} onClick={() => updateAnswer('matchPlan', l)} />
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>How did you feel mentally this week?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very overwhelmed', 'A bit overwhelmed', 'Neutral', 'Focused', 'Very good'].map(l => (
            <OptionCard key={l} label={l} selected={answers.mentalHealth === l} onClick={() => updateAnswer('mentalHealth', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>How consistent did you feel overall?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very inconsistent', 'Inconsistent', 'Average', 'Consistent', 'Very consistent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.consistency === l} onClick={() => updateAnswer('consistency', l)} />
          ))}
        </div>
      </div>
    </div>
    <div>
      <FieldLabel>Key Influencers</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {['Stress', 'Travel', 'Busy week', 'Sick', 'Good routine', 'Low motivation', 'Great energy', 'Social events', 'Family commitments', 'Work / studies', 'Poor sleep', 'Anxiety', 'Menstrual cycle', 'Poor routine'].map(c => (
          <Chip key={c} label={c} selected={answers.contextChips.includes(c)} onClick={() => toggleArrayItem('contextChips', c)} />
        ))}
      </div>
    </div>
    <div>
      <FieldLabel>Additional Context (Optional)</FieldLabel>
      <textarea placeholder="Briefly describe any major events or feelings..." value={answers.weekNotes} onChange={e => updateAnswer('weekNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);

const Page2 = ({ answers, updateAnswer }: PageProps) => (
  <Section title="Body Progress" subtitle="Track your physical metrics and how you feel in your own skin." icon="monitoring">
    <div className="grid grid-cols-1 gap-6">
      <div>
        <FieldLabel>Current Weight (kg)</FieldLabel>
        <div className="relative">
          <input type="number" step="0.1" placeholder="00.0" value={answers.weight} onChange={e => updateAnswer('weight', e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-3 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-200" />
          <div className="absolute right-0 bottom-4 text-lg font-bold text-slate-300">KG</div>
        </div>
      </div>
      <div>
        <FieldLabel>Average Weekly Weight (kg)</FieldLabel>
        <div className="relative">
          <input type="number" step="0.1" placeholder="00.0" value={answers.avgWeight} onChange={e => updateAnswer('avgWeight', e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-3 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-200" />
          <div className="absolute right-0 bottom-4 text-lg font-bold text-slate-300">KG</div>
        </div>
      </div>
      <div>
        <FieldLabel>Body Perception</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'Defined', 'Flatter', 'Fuller', 'Tighter waist', 'More watery'].map(o => (
            <Chip key={o} label={o} selected={answers.bodyPerception === o} onClick={() => updateAnswer('bodyPerception', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Did you notice any visible changes?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['No changes', 'Slight', 'Moderate', 'Big changes'].map(l => (
            <OptionCard key={l} label={l} selected={answers.visibleChanges === l} onClick={() => updateAnswer('visibleChanges', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Where did you notice the biggest change?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['Waist', 'Stomach', 'Legs', 'Glutes', 'Arms', 'Back', 'Face', 'Overall', 'Hard to tell'].map(l => (
            <Chip key={l} label={l} selected={answers.biggestChangeArea === l} onClick={() => updateAnswer('biggestChangeArea', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>How satisfied are you with your current progress?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'].map(l => (
            <OptionCard key={l} label={l} selected={answers.satisfaction === l} onClick={() => updateAnswer('satisfaction', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Menstrual / hormonal impact this week</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['No impact', 'Mild', 'Moderate', 'Strong', 'N/A'].map(l => (
            <OptionCard key={l} label={l} selected={answers.menstrualImpact === l} onClick={() => updateAnswer('menstrualImpact', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>Measurements (Optional)</FieldLabel>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[{ id: 'waist', label: 'Waist' }, { id: 'hips', label: 'Hips' }, { id: 'chest', label: 'Chest' }, { id: 'arms', label: 'Arms' }, { id: 'thighs', label: 'Thighs' }].map(m => (
          <div key={m.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 focus-within:border-[#17cf54] transition-all">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{m.label}</label>
            <div className="flex items-baseline gap-1">
              <input type="number" step="0.5" placeholder="--" value={(answers as any)[m.id]} onChange={e => updateAnswer(m.id as any, e.target.value)}
                className="w-full text-xl font-bold bg-transparent border-none p-0 outline-none focus:ring-0 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-300">CM</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>Progress Photos (Front, Side, Back)</FieldLabel>
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: 'photoFront', label: 'Front' },
          { id: 'photoSide', label: 'Side' },
          { id: 'photoBack', label: 'Back' }
        ].map(view => (
          <label key={view.id} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-[#17cf54] hover:text-[#17cf54] transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/20 relative overflow-hidden">
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const compressed = await compressImage(file);
                  updateAnswer(view.id as any, compressed);
                } catch (err) {
                  console.error('Error compressing image:', err);
                }
              }
            }} />
            {(answers as any)[view.id] ? (
              <img src={(answers as any)[view.id]} alt={view.label} className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="material-symbols-outlined text-3xl mb-2">add_a_photo</span>
                <span className="text-xs font-bold uppercase tracking-wider">{view.label}</span>
              </>
            )}
          </label>
        ))}
      </div>
    </div>
  </Section>
);

const Page3 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Nutrition Adherence" subtitle="How consistently did you follow your fuel plan?" icon="restaurant">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Weekly Compliance (Overall %)</FieldLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)'].map(o => (
            <OptionCard key={o} label={o} selected={answers.nutritionAdherence === o} onClick={() => updateAnswer('nutritionAdherence', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>How many meals did you follow as planned?</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {['Almost all', 'Most', 'About half', 'Few', 'Almost none'].map(o => (
            <OptionCard key={o} label={o} selected={answers.mealsFollowed === o} onClick={() => updateAnswer('mealsFollowed', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Did you hit your calorie target?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Yes, daily', 'Mostly', 'Above', 'Below', 'No track'].map(o => (
            <OptionCard key={o} label={o} selected={answers.hitCalories === o} onClick={() => updateAnswer('hitCalories', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Did you hit your protein target?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Yes, daily', 'Most days', 'Sometimes', 'Rarely', 'Unknown'].map(o => (
            <OptionCard key={o} label={o} selected={answers.hitProtein === o} onClick={() => updateAnswer('hitProtein', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>How often did you eat off-plan?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Never', '1–2 meals', '3–4', '5+', 'Many'].map(o => (
            <OptionCard key={o} label={o} selected={answers.offPlanCount === o} onClick={() => updateAnswer('offPlanCount', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Did you skip any meals?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Never', '1–2 times', 'A few', 'Frequently'].map(o => (
            <OptionCard key={o} label={o} selected={answers.skippedMeals === o} onClick={() => updateAnswer('skippedMeals', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Did you track your food accurately?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Accurately', 'Mostly', 'Estimate', 'Barely', 'No track'].map(o => (
            <OptionCard key={o} label={o} selected={answers.trackingAccuracy === o} onClick={() => updateAnswer('trackingAccuracy', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Which meal was hardest to follow?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Night', 'Weekend', 'All same'].map(o => (
            <Chip key={o} label={o} selected={answers.hardestMeal === o} onClick={() => updateAnswer('hardestMeal', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>What made adherence harder? (Select all that apply)</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {['Hunger', 'Cravings', 'Social events', 'Eating out', 'Stress', 'Anxiety', 'No time', 'Poor planning', 'Travel', 'Low motivation', 'Boredom with meals', 'Family environment'].map(c => (
          <Chip key={c} label={c} selected={answers.adherenceObstacles.includes(c)} onClick={() => toggleArrayItem('adherenceObstacles', c)} />
        ))}
      </div>
    </div>

    <div>
      <FieldLabel>Nutrition Notes & Observations</FieldLabel>
      <textarea placeholder="Any specific meals you struggled with? Did you feel low energy at certain times? Did you find any foods too restrictive?" 
        value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);
const Page4 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Digestion & Satiety" subtitle="Internal biofeedback is key to adjusting your plan." icon="health_and_safety">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Hunger Levels</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very low', 'Low', 'Manageable', 'High', 'Extreme'].map(l => (
            <OptionCard key={l} label={l} selected={answers.hunger === l} onClick={() => updateAnswer('hunger', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Cravings Intensity</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['None', 'Mild', 'Moderate', 'Strong', 'Unstoppable'].map(l => (
            <OptionCard key={l} label={l} selected={answers.cravings === l} onClick={() => updateAnswer('cravings', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>At what time were cravings strongest?</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {['Morning', 'Midday', 'Afternoon', 'Evening', 'Night', 'Random'].map(l => (
            <Chip key={l} label={l} selected={answers.cravingsTime === l} onClick={() => updateAnswer('cravingsTime', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Digestion Quality</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Excellent', 'Good', 'Okay', 'Poor', 'Very poor'].map(l => (
            <OptionCard key={l} label={l} selected={answers.digestionQuality === l} onClick={() => updateAnswer('digestionQuality', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Bloating Level</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['None', 'Mild', 'Moderate', 'Strong', 'Constant'].map(l => (
            <OptionCard key={l} label={l} selected={answers.bloatingLevel === l} onClick={() => updateAnswer('bloatingLevel', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Bowel Movement Regularity</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Regular', 'Mildly irregular', 'Irregular', 'Constipated', 'Loose'].map(l => (
            <OptionCard key={l} label={l} selected={answers.bowelRegularity === l} onClick={() => updateAnswer('bowelRegularity', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Fullness After Meals</FieldLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['Not full', 'Satisfied', 'Very full', 'Too heavy'].map(l => (
            <OptionCard key={l} label={l} selected={answers.fullnessResponse === l} onClick={() => updateAnswer('fullnessResponse', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Energy Response After Meals</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Better', 'Stable', 'Sleepy', 'Heavy', 'Crashes'].map(l => (
            <OptionCard key={l} label={l} selected={answers.energyResponse === l} onClick={() => updateAnswer('energyResponse', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Any Digestive Symptoms? (Select all that apply)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['Gas', 'Acid reflux', 'Abdominal pain', 'Constipation', 'Loose stools', 'Nausea', 'Intolerance', 'None'].map(c => (
            <Chip key={c} label={c} selected={answers.digestiveSymptoms.includes(c)} onClick={() => toggleArrayItem('digestiveSymptoms', c)} />
          ))}
        </div>
      </div>
    </div>

    <div>
      <FieldLabel>Additional Food & Digestion Notes</FieldLabel>
      <textarea placeholder="Tell us more about your digestion or any specific food reactions..." value={answers.foodNotes} onChange={e => updateAnswer('foodNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);
const Page5 = ({ answers, updateAnswer }: PageProps) => (
  <Section title="Daily Foundations" subtitle="The small habits that drive the big results." icon="water_drop">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Hydration Consistency</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Met goal daily', 'Met most days', 'Struggled', 'Very low'].map(o => (
            <OptionCard key={o} label={o} selected={answers.waterIntake === o} onClick={() => updateAnswer('waterIntake', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Approximate daily water intake</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['<1L', '1–1.5L', '1.5–2L', '2–3L', '3L+'].map(o => (
            <Chip key={o} label={o} selected={answers.waterAmount === o} onClick={() => updateAnswer('waterAmount', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Supplements Consistency</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Took all', 'Missed some', 'Missed most', 'None'].map(o => (
            <OptionCard key={o} label={o} selected={answers.supplements === o} onClick={() => updateAnswer('supplements', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Meal timing consistency</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Very consistent', 'Mostly', 'Irregular', 'Very chaotic'].map(o => (
            <OptionCard key={o} label={o} selected={answers.mealTimingConsistency === o} onClick={() => updateAnswer('mealTimingConsistency', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Eating out frequency</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {['None', '1–2 times', '3–4', '5+ times'].map(o => (
            <Chip key={o} label={o} selected={answers.eatOutCount === o} onClick={() => updateAnswer('eatOutCount', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Alcohol intake</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {['None', 'Low', 'Moderate', 'High'].map(o => (
            <Chip key={o} label={o} selected={answers.alcoholIntake === o} onClick={() => updateAnswer('alcoholIntake', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Snacking outside plan</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {['Never', 'Occasionally', 'Frequently', 'Daily'].map(o => (
            <Chip key={o} label={o} selected={answers.snackingFrequency === o} onClick={() => updateAnswer('snackingFrequency', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>Routine structure this week</FieldLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Very structured', 'Fairly structured', 'Chaotic days', 'Very chaotic'].map(o => (
          <OptionCard key={o} label={o} selected={answers.routineStructure === o} onClick={() => updateAnswer('routineStructure', o)} />
        ))}
      </div>
    </div>

    <div>
      <FieldLabel>Daily Habit Notes (Optional)</FieldLabel>
      <textarea placeholder="Anything related to hydration, supplements, alcohol, meal timing or routine?" value={answers.habitNotes} onChange={e => updateAnswer('habitNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);
const Page6 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Training Performance" subtitle="Analyze your physical execution and strength levels." icon="fitness_center">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Training Adherence</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['All sessions', 'Missed 1', 'Missed 2', 'Missed several', 'Didn\'t train'].map(o => (
            <OptionCard key={o} label={o} selected={answers.trainingAdherence === o} onClick={() => updateAnswer('trainingAdherence', o)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Overall Strength Perception</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          {['Down', 'Same', 'Up'].map(o => (
            <OptionCard key={o} label={o} selected={answers.strength === o} onClick={() => updateAnswer('strength', o)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Energy during training</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very low', 'Low', 'Average', 'Good', 'Excellent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.trainingEnergy === l} onClick={() => updateAnswer('trainingEnergy', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Session Quality & Connection</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very poor', 'Poor', 'Average', 'Good', 'Excellent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.trainingQuality === l} onClick={() => updateAnswer('trainingQuality', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Recovery between sessions</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.trainingRecovery === l} onClick={() => updateAnswer('trainingRecovery', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Did you hit prescribed intensity?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Yes', 'Mostly', 'Sometimes', 'Rarely'].map(l => (
            <OptionCard key={l} label={l} selected={answers.trainingIntensity === l} onClick={() => updateAnswer('trainingIntensity', l)} />
          ))}
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>General Performance Trend</FieldLabel>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {['Much worse', 'Slightly worse', 'Same', 'Slightly better', 'Much better'].map(o => (
          <OptionCard key={o} label={o} selected={answers.performance === o} onClick={() => updateAnswer('performance', o)} />
        ))}
      </div>
      {(answers.performance === 'Much worse' || answers.performance === 'Slightly worse') && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 mb-4">
          <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Why did performance drop?</h4>
          <div className="flex flex-wrap gap-2">
            {['Poor sleep', 'Stress', 'Low calories', 'Pain', 'Menstrual cycle', 'Low motivation', 'Bad recovery', 'Too much fatigue', 'Unknown'].map(c => (
              <Chip key={c} label={c} selected={answers.performanceDropReasons.includes(c)} onClick={() => toggleArrayItem('performanceDropReasons', c)} />
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Exercise wins (PRs, progress)</FieldLabel>
        <textarea placeholder="Did any exercise feel especially strong? Any PRs?" value={answers.prWins} onChange={e => updateAnswer('prWins', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[80px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
      <div>
        <FieldLabel>Struggles or Painful movements</FieldLabel>
        <textarea placeholder="Did any exercise feel awkward, painful or unusually weak?" value={answers.awkwardExerciseNotes} onChange={e => updateAnswer('awkwardExerciseNotes', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[80px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
    </div>

    <div>
      <FieldLabel>Additional Training Notes</FieldLabel>
      <textarea placeholder="Any additional feedback about your sessions..." value={answers.trainingNotes} onChange={e => updateAnswer('trainingNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);

const Page7 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Recovery & Sleep" subtitle="The foundation of your progress happens while you rest." icon="dark_mode">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Sleep Quantity (Average nightly)</FieldLabel>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {['<5h', '5–6h', '6–7h', '7–8h', '8h+'].map(o => <OptionCard key={o} label={o} selected={answers.sleepQuantity === o} onClick={() => updateAnswer('sleepQuantity', o)} />)}
        </div>
      </div>
      <div>
        <FieldLabel>Sleep Quality</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very poor', 'Poor', 'Average', 'Good', 'Excellent'].map(o => <OptionCard key={o} label={o} selected={answers.sleepQuality === o} onClick={() => updateAnswer('sleepQuality', o)} />)}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Sleep Interruptions</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Never', 'Occasionally', 'Frequently', 'Almost every night'].map(o => <OptionCard key={o} label={o} selected={answers.sleepInterruptions === o} onClick={() => updateAnswer('sleepInterruptions', o)} />)}
        </div>
      </div>
      <div>
        <FieldLabel>Sleep Schedule Consistency</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Very consistent', 'Mostly', 'Irregular', 'Very chaotic'].map(o => <OptionCard key={o} label={o} selected={answers.sleepScheduleConsistency === o} onClick={() => updateAnswer('sleepScheduleConsistency', o)} />)}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      {[{ id: 'stress', title: 'Stress Level' }, { id: 'energy', title: 'Energy Level' }, { id: 'motivation', title: 'Motivation' }, { id: 'generalFatigue', title: 'General Fatigue' }].map(block => (
        <div key={block.id}>
          <FieldLabel>{block.title}</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['Very low', 'Low', 'Average', 'High', 'Extreme'].map(o => <Chip key={o} label={o} selected={(answers as any)[block.id] === o} onClick={() => updateAnswer(block.id as any, o)} />)}
          </div>
        </div>
      ))}
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>What affected your recovery the most? (Select all)</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {['Work', 'Studies', 'Family', 'Travel', 'Anxiety', 'Late meals', 'Screen time', 'Poor routine', 'High training fatigue', 'Under-eating', 'Menstrual cycle', 'Pain', 'Unknown'].map(c => (
          <Chip key={c} label={c} selected={answers.recoveryImpacts.includes(c)} onClick={() => toggleArrayItem('recoveryImpacts', c)} />
        ))}
      </div>
    </div>

    <div>
      <FieldLabel>Recovery & Motivation Notes (Optional)</FieldLabel>
      <textarea placeholder="Anything that affected sleep, recovery or motivation this week?" value={answers.recoveryNotes} onChange={e => updateAnswer('recoveryNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);

const Page8 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Injury & Pain Tracking" subtitle="Your safety is our priority. Report any discomfort immediately." icon="healing">
    <div>
      <FieldLabel>Current Pain / Discomfort Level</FieldLabel>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'].map(o => (
          <OptionCard key={o} label={o} selected={answers.painLevel === o} onClick={() => updateAnswer('painLevel', o)} />
        ))}
      </div>
    </div>
    {answers.painLevel && answers.painLevel !== 'No issues' && (
      <>
        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <FieldLabel>Affected Area</FieldLabel>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {['Neck', 'Shoulder', 'Upper back', 'Lower back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Foot', 'Abdomen', 'Other'].map(o => <Chip key={o} label={o} selected={answers.affectedArea === o} onClick={() => updateAnswer('affectedArea', o)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Type of Issue</FieldLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Mobility restriction', 'Digestive', 'Other'].map(o => <Chip key={o} label={o} selected={answers.painType === o} onClick={() => updateAnswer('painType', o)} />)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <FieldLabel>Impact on Training</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {['No impact', 'Small impact', 'Moderate', 'Couldn\'t train properly', 'Had to stop'].map(o => <OptionCard key={o} label={o} selected={answers.trainingImpact === o} onClick={() => updateAnswer('trainingImpact', o)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Duration</FieldLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Just this week', 'A few days', '1–2 weeks', '2+ weeks', 'Chronic'].map(o => <Chip key={o} label={o} selected={answers.painDuration === o} onClick={() => updateAnswer('painDuration', o)} />)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <FieldLabel>Progression</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              {['Improved', 'Stayed same', 'Got worse'].map(o => <OptionCard key={o} label={o} selected={answers.painProgression === o} onClick={() => updateAnswer('painProgression', o)} />)}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Did you modify training?</span>
            <div className="flex gap-2">
              {['Yes', 'No'].map(o => <Chip key={o} label={o} selected={answers.modifiedTraining === o} onClick={() => updateAnswer('modifiedTraining', o)} />)}
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Describe what happened & Details</FieldLabel>
          <textarea placeholder="How did it start? What movements make it worse? What did you modify?" value={answers.painNotes} onChange={e => updateAnswer('painNotes', e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
        </div>
      </>
    )}
  </Section>
);

const Page9 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Activity & Movement" subtitle="Tracking your non-exercise activity and cardio adherence." icon="directions_run">
    <div className="grid grid-cols-1 gap-8">
      <div>
        <FieldLabel>Cardio Adherence</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Did all', 'Missed some', 'Very little', 'Did none'].map(o => <OptionCard key={o} label={o} selected={answers.cardioAdherence === o} onClick={() => updateAnswer('cardioAdherence', o)} />)}
        </div>
      </div>
      <div>
        <FieldLabel>Daily Steps (Average Range)</FieldLabel>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {['<4k', '4k–6k', '6k–8k', '8k–10k', '10k+'].map(o => <Chip key={o} label={o} selected={answers.stepRange === o} onClick={() => updateAnswer('stepRange', o)} />)}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Was cardio performance normal?</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Better', 'Normal', 'Worse', 'N/A'].map(o => <OptionCard key={o} label={o} selected={answers.cardioPerformance === o} onClick={() => updateAnswer('cardioPerformance', o)} />)}
        </div>
      </div>
      <div>
        <FieldLabel>General Activity Level</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Sedentary', 'Low', 'Moderate', 'High'].map(o => <OptionCard key={o} label={o} selected={answers.activityLevel === o} onClick={() => updateAnswer('activityLevel', o)} />)}
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>Were activities limited by anything?</FieldLabel>
      <div className="flex flex-wrap gap-2 mb-4">
        {['Fatigue', 'No time', 'Bad weather', 'Pain / discomfort', 'Low motivation', 'Travel', 'No limitation'].map(c => (
          <Chip key={c} label={c} selected={answers.activityLimitations.includes(c)} onClick={() => toggleArrayItem('activityLimitations', c)} />
        ))}
      </div>
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Felt more tired than usual?</span>
        <div className="flex gap-2">
          {['Yes', 'No'].map(o => <Chip key={o} label={o} selected={answers.activityTired === o} onClick={() => updateAnswer('activityTired', o)} />)}
        </div>
      </div>
    </div>

    <div>
      <FieldLabel>Activity Notes (Optional)</FieldLabel>
      <textarea placeholder="Anything related to your movement or cardio this week..." value={answers.activityNotes} onChange={e => updateAnswer('activityNotes', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>
  </Section>
);

const Page10 = ({ answers, updateAnswer, toggleArrayItem }: PageProps) => (
  <Section title="Looking Ahead" subtitle="Define your focus for the upcoming week." icon="flag">
    <div>
      <FieldLabel>Primary Focus Areas (Select all that apply)</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {['Nutrition adherence', 'Hunger management', 'Meal prep / organization', 'Training intensity', 'Technique / form', 'Sleep hygiene', 'Stress management', 'Activity (Steps/Cardio)', 'Daily habits / Routine', 'Mental focus', 'Social events management'].map(c => (
          <Chip key={c} label={c} selected={answers.improvementGoals.includes(c)} onClick={() => toggleArrayItem('improvementGoals', c)} />
        ))}
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>What are your absolute non-negotiables for next week?</FieldLabel>
      <textarea placeholder="3 things you WILL get done no matter what..." value={answers.nonNegotiables} onChange={e => updateAnswer('nonNegotiables', e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
    </div>

    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <FieldLabel>Coach Review Request</FieldLabel>
        <textarea placeholder="Anything specific your coach should analyze or explain? (e.g. 'check my technique on deadlifts')" value={answers.reviewNotes} onChange={e => updateAnswer('reviewNotes', e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
      <div>
        <FieldLabel>Support Needed</FieldLabel>
        <textarea placeholder="How can your coach best support you next week?" value={answers.supportNeeded} onChange={e => updateAnswer('supportNeeded', e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[100px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <FieldLabel>Next Week Readiness</FieldLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Not ready', 'Somewhat ready', 'Ready', 'Very ready'].map(o => (
          <OptionCard key={o} label={o} selected={answers.readiness === o} onClick={() => updateAnswer('readiness', o)} />
        ))}
      </div>
    </div>
  </Section>
);

const Page11 = ({ answers, setCurrentStep }: PageProps) => (
  <Section title="Final Review" subtitle="Review your data points before locking in your week." icon="fact_check">
    <div className="space-y-4">
      {[
        { title: 'Overall & Progress', icon: 'mood', step: 1, desc: `Week: ${answers.overallWeek || '--'} • Weight Avg: ${answers.avgWeight ? `${answers.avgWeight}kg` : '--'} • Mental: ${answers.mentalHealth || '--'}` },
        { title: 'Nutrition & Adherence', icon: 'restaurant', step: 3, desc: `Adherence: ${answers.nutritionAdherence || '--'} • Nutri-Notes: ${answers.digestiveIssues?.substring(0, 30)}${answers.digestiveIssues?.length > 30 ? '...' : ''}` },
        { title: 'Digestion & Biofeedback', icon: 'health_and_safety', step: 4, desc: `Digestion: ${answers.digestionQuality || '--'} • Hunger: ${answers.hunger || '--'} • Energy: ${answers.energyResponse || '--'}` },
        { title: 'Training & Performance', icon: 'fitness_center', step: 6, desc: `Sessions: ${answers.trainingAdherence || '--'} • Performance: ${answers.performance || '--'} • Energy: ${answers.trainingEnergy || '--'}` },
        { title: 'Recovery & Vitality', icon: 'dark_mode', step: 7, desc: `Sleep: ${answers.sleepQuantity || '--'} • Quality: ${answers.sleepQuality || '--'} • Stress: ${answers.stress || '--'}` },
        { title: 'Activity & Pain', icon: 'healing', step: 8, desc: `Pain: ${answers.painLevel || 'No issues'} • Steps: ${answers.stepRange || '--'} • Cardio: ${answers.cardioAdherence || '--'}` }
      ].map((item, idx) => (
        <div key={idx} onClick={() => setCurrentStep(item.step)}
          className="group border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-[#17cf54]/50 transition-all bg-white dark:bg-slate-800/50 shadow-sm flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:text-[#17cf54] transition-colors">Edit</span>
        </div>
      ))}
    </div>
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Check-in Analysis</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Based on your detailed feedback, your coach will generate a personalized Loom video review. You've provided excellent data for an actionable calibration.</p>
        </div>
      </div>
    </div>
  </Section>
);

const Page12 = ({ onCancel }: PageProps) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center flex flex-col items-center">
    <div className="w-20 h-20 rounded-2xl bg-[#17cf54] flex items-center justify-center mb-8 shadow-lg shadow-[#17cf54]/20">
      <span className="material-symbols-outlined text-4xl text-white">check_circle</span>
    </div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Mission Accomplished.</h1>
    <p className="text-sm text-slate-500 mb-8 max-w-md">Your data is safely in your coach's hands. We'll calibrate your plan for the week ahead based on these insights.</p>
    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
      <button onClick={onCancel} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm transition-all hover:opacity-90">
        Back to Dashboard
      </button>
      <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all hover:bg-slate-50">
        Share Progress
      </button>
    </div>
  </div>
);

export default function WeeklyCheckinFlow({ onComplete, onCancel }: WeeklyCheckinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<CheckinAnswers>(defaultAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_STEPS = 12;

  const updateAnswer = (key: keyof CheckinAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: keyof CheckinAnswers, item: string) => {
    setAnswers(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item] };
    });
  };

  const nextStep = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(c => c + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(c => c - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await fetchWithAuth('/check-ins/client/check-ins', {
        method: 'POST',
        body: JSON.stringify({ date: new Date().toISOString(), data_json: answers }),
      });
      setCurrentStep(TOTAL_STEPS);
    } catch (err: any) {
      console.error('Error submitting check-in:', err);
      setError(err.message || 'Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = { answers, updateAnswer, toggleArrayItem, nextStep, onCancel, setCurrentStep };
    switch (currentStep) {
      case 0: return <PageIntro {...props} />;
      case 1: return <Page1 {...props} />;
      case 2: return <Page2 {...props} />;
      case 3: return <Page3 {...props} />;
      case 4: return <Page4 {...props} />;
      case 5: return <Page5 {...props} />;
      case 6: return <Page6 {...props} />;
      case 7: return <Page7 {...props} />;
      case 8: return <Page8 {...props} />;
      case 9: return <Page9 {...props} />;
      case 10: return <Page10 {...props} />;
      case 11: return <Page11 {...props} />;
      case 12: return <Page12 {...props} />;
      default: return <div>Step {currentStep} under construction...</div>;
    }
  };

  const progressPct = currentStep === 0 ? 0 : Math.max(5, (currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116]">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Submitting your check-in...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-3xl">error</span>
              <h3 className="text-lg font-bold">Submission Error</h3>
            </div>
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={() => setError(null)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm">
              Try Again
            </button>
          </div>
        </div>
      )}
      {/* Toolbar Header */}
      {currentStep > 0 && currentStep < TOTAL_STEPS && (
        <div className="p-6 pb-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in Progress</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Step {currentStep} of {TOTAL_STEPS}</div>
            </div>
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#17cf54] transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="flex flex-col gap-6">
          {renderStep()}
        </div>
      </div>

      {/* Bottom Navigation */}
      {currentStep > 0 && currentStep <= TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-gradient-to-t from-[#f6f8f6] dark:from-[#112116] to-transparent p-6 pointer-events-none">
          <div className="flex justify-end pointer-events-auto">
            <button
              onClick={currentStep === TOTAL_STEPS ? onComplete : currentStep === 11 ? handleSubmit : nextStep}
              disabled={isSubmitting}
              className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#17cf54]/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : currentStep === TOTAL_STEPS ? 'Back to Dashboard' : currentStep === 11 ? 'Submit Check-in' : 'Continue'}
              {!isSubmitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
