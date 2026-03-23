import React, { useState } from 'react';
import { fetchWithAuth } from '../../api';

interface CheckinAnswers {
  overallWeek: string; contextChips: string[]; weekNotes: string;
  weight: string; waist: string; hips: string; chest: string; arms: string; thighs: string; bodyPerception: string;
  nutritionAdherence: string; mealsMissed: string; trackedFood: string; offPlanFrequency: string; offPlanReasons: string[];
  hunger: string; cravings: string; digestion: string; bloating: string; bowel: string; energyFood: string; digestiveIssues: string;
  waterIntake: string; steps: string; mealTiming: string; supplements: string; alcohol: string; eatingOut: string;
  trainingAdherence: string; performance: string; strength: string; cardio: string; sessionQuality: string; trainingNotes: string; performanceDropReasons: string[];
  sleepQuantity: string; sleepQuality: string; stress: string; energy: string; motivation: string; recoveryImpacts: string[];
  painLevel: string; affectedArea: string; painType: string; trainingImpact: string; painNotes: string;
  cardioAdherence: string; stepsAdherence: string; activityLevel: string; activityTired: string;
  improvementGoals: string[]; helpNotes: string; reviewNotes: string; readiness: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      await fetchWithAuth('/client/check-ins', {
        method: 'POST',
        body: JSON.stringify({ date: new Date().toISOString(), data_json: answers }),
      });
      setCurrentStep(TOTAL_STEPS);
    } catch (err) {
      console.error('Error submitting check-in:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reusable UI Primitives (matching Nutrition section) ---
  const Chip = ({ label, selected, onClick }: any) => (
    <button onClick={onClick}
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

  // Section = a full-width card containing one logical section of inputs
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

  // --- Page Renderers ---
  const renderIntro = () => (
    <div className="flex-1 flex flex-col gap-6">
      {/* Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Weekly Check-in</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md uppercase">Due Today</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-slate-500 text-sm mb-4">Detailed feedback = Better results. Complete your weekly check-in to keep your coach updated on your progress, biofeedback, and adherence. It only takes 3-5 minutes.</p>
          </div>
          <button onClick={nextStep} className="bg-[#17cf54] hover:bg-[#15b84a] text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-sm shadow-lg shadow-[#17cf54]/20 whitespace-nowrap shrink-0">
            <span className="material-symbols-outlined text-[18px]">play_arrow</span> Start Check-in
          </button>
        </div>
      </div>

      {/* History Card */}
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

  const renderPage1 = () => (
    <Section title="How did your week go overall?" subtitle="Your general sentiment sets the context for everything else." icon="mood">
      <div>
        <FieldLabel>Select Sentiment</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Very bad', 'Bad', 'Average', 'Good', 'Excellent'].map(l => (
            <OptionCard key={l} label={l} selected={answers.overallWeek === l} onClick={() => updateAnswer('overallWeek', l)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Key Influencers</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['Stress', 'Travel', 'Busy week', 'Sick', 'Good routine', 'Low motivation', 'Great energy'].map(c => (
            <Chip key={c} label={c} selected={answers.contextChips.includes(c)} onClick={() => toggleArrayItem('contextChips', c)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Additional Context (Optional)</FieldLabel>
        <textarea placeholder="Briefly describe any major events or feelings..." value={answers.weekNotes} onChange={e => updateAnswer('weekNotes', e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
    </Section>
  );

  const renderPage2 = () => (
    <Section title="Body Progress" subtitle="Track your physical metrics and how you feel in your own skin." icon="monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Current Weight (kg)</FieldLabel>
          <div className="relative">
            <input type="number" step="0.1" placeholder="00.0" value={answers.weight} onChange={e => updateAnswer('weight', e.target.value)}
              className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-3 focus:border-[#17cf54] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-200" />
            <div className="absolute right-0 bottom-4 text-lg font-bold text-slate-300">KG</div>
          </div>
        </div>
        <div>
          <FieldLabel>Body Perception</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'Defined'].map(o => (
              <Chip key={o} label={o} selected={answers.bodyPerception === o} onClick={() => updateAnswer('bodyPerception', o)} />
            ))}
          </div>
        </div>
      </div>
      <div>
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
    </Section>
  );

  const renderPage3 = () => (
    <Section title="Nutrition Adherence" subtitle="How consistently did you follow your fuel plan?" icon="restaurant">
      <div>
        <FieldLabel>Weekly Compliance</FieldLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)'].map(o => (
            <OptionCard key={o} label={o} selected={answers.nutritionAdherence === o} onClick={() => updateAnswer('nutritionAdherence', o)} />
          ))}
        </div>
      </div>
      {(answers.nutritionAdherence === 'Average (50-80%)' || answers.nutritionAdherence === 'Poor (<50%)') && (
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Identify the Obstacles</h4>
          <div className="flex flex-wrap gap-2">
            {['Social event', 'Cravings', 'Lack of time', 'Poor planning', 'Too hungry', 'Emotional eating'].map(c => (
              <Chip key={c} label={c} selected={answers.offPlanReasons.includes(c)} onClick={() => toggleArrayItem('offPlanReasons', c)} />
            ))}
          </div>
        </div>
      )}
      <div>
        <FieldLabel>Nutrition Notes & Observations</FieldLabel>
        <textarea placeholder="Did you feel low energy? Any specific meals you struggled with?" value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
    </Section>
  );

  const renderPage4 = () => (
    <Section title="Digestion & Satiety" subtitle="How is your body processing the plan?" icon="local_fire_department">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Hunger Levels</FieldLabel>
          <div className="flex flex-col gap-2">
            {['No hunger', 'Manageable', 'Noticeable but OK', 'Very hungry', 'Starving'].map(o => (
              <Chip key={o} label={o} selected={answers.hunger === o} onClick={() => updateAnswer('hunger', o)} />
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Cravings Intensity</FieldLabel>
          <div className="flex flex-col gap-2">
            {['None', 'Occasional', 'Frequent', 'Constant'].map(o => (
              <Chip key={o} label={o} selected={answers.cravings === o} onClick={() => updateAnswer('cravings', o)} />
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <FieldLabel>Bowel & Bloating</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {['Perfect', 'Minor bloating', 'Uncomfortable', 'Very poor'].map(o => (
            <OptionCard key={o} label={o} selected={answers.digestion === o} onClick={() => updateAnswer('digestion', o)} />
          ))}
        </div>
        {(answers.digestion === 'Uncomfortable' || answers.digestion === 'Very poor') && (
          <input type="text" placeholder="Specify any discomfort or problematic foods..." value={answers.digestiveIssues} onChange={e => updateAnswer('digestiveIssues', e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#17cf54] focus:ring-0 outline-none transition-all text-sm" />
        )}
      </div>
    </Section>
  );

  const renderPage5 = () => (
    <Section title="Daily Foundations" subtitle="The small habits that drive the big results." icon="water_drop">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Hydration Targets</FieldLabel>
          <div className="flex flex-col gap-2">
            {['Met goal daily', 'Met it most days', 'Struggled', 'Very low'].map(o => (
              <Chip key={o} label={o} selected={answers.waterIntake === o} onClick={() => updateAnswer('waterIntake', o)} />
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Supplements Consistency</FieldLabel>
          <div className="flex flex-col gap-2">
            {['Took all', 'Missed some', 'Missed most', 'Did not take any'].map(o => (
              <Chip key={o} label={o} selected={answers.supplements === o} onClick={() => updateAnswer('supplements', o)} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );

  const renderPage6 = () => (
    <Section title="Training Performance" subtitle="Analyze your physical execution and strength levels." icon="fitness_center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Training Adherence</FieldLabel>
          <select value={answers.trainingAdherence} onChange={e => updateAnswer('trainingAdherence', e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-[#17cf54] appearance-none cursor-pointer transition-all text-slate-900 dark:text-white">
            <option value="">Select consistency...</option>
            {['Completed all sessions', 'Missed 1 session', 'Missed 2 sessions', 'Missed several sessions'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Overall Strength Perception</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {['Down', 'Same', 'Up'].map(o => (
              <Chip key={o} label={o} selected={answers.strength === o} onClick={() => updateAnswer('strength', o)} />
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <FieldLabel>Session Quality & Performance</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {['Much worse', 'Slightly worse', 'Same', 'Slightly better', 'Much better'].map(o => (
            <OptionCard key={o} label={o} selected={answers.performance === o} onClick={() => updateAnswer('performance', o)} />
          ))}
        </div>
        {(answers.performance === 'Much worse' || answers.performance === 'Slightly worse') && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 mb-4">
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Potential Performance Caps</h4>
            <div className="flex flex-wrap gap-2">
              {['Sleep', 'Stress', 'Low calories', 'Pain', 'Motivation', 'Bad recovery'].map(c => (
                <Chip key={c} label={c} selected={answers.performanceDropReasons.includes(c)} onClick={() => toggleArrayItem('performanceDropReasons', c)} />
              ))}
            </div>
          </div>
        )}
        <FieldLabel>Training Notes (Optional)</FieldLabel>
        <textarea placeholder="Any PRs? Any exercises that felt awkward?" value={answers.trainingNotes} onChange={e => updateAnswer('trainingNotes', e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
      </div>
    </Section>
  );

  const renderPage7 = () => (
    <Section title="Recovery & Sleep" subtitle="The foundation of your progress happens while you rest." icon="dark_mode">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Sleep Quantity (Avg)</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {['<5h', '5–6h', '6–7h', '7–8h', '8h+'].map(o => <Chip key={o} label={o} selected={answers.sleepQuantity === o} onClick={() => updateAnswer('sleepQuantity', o)} />)}
          </div>
        </div>
        <div>
          <FieldLabel>Sleep Quality</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {['Very poor', 'Poor', 'Average', 'Good', 'Excellent'].map(o => <Chip key={o} label={o} selected={answers.sleepQuality === o} onClick={() => updateAnswer('sleepQuality', o)} />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        {[{ id: 'stress', title: 'Stress Level' }, { id: 'energy', title: 'Energy Level' }, { id: 'motivation', title: 'Motivation' }].map(block => (
          <div key={block.id}>
            <FieldLabel>{block.title}</FieldLabel>
            <div className="flex flex-col gap-2">
              {['Very low', 'Low', 'Average', 'High', 'Excellent'].map(o => <Chip key={o} label={o} selected={(answers as any)[block.id] === o} onClick={() => updateAnswer(block.id as any, o)} />)}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const renderPage8 = () => (
    <Section title="Injury & Pain Tracking" subtitle="Your safety is our priority. Report any discomfort immediately." icon="healing">
      <div>
        <FieldLabel>Current Pain Level</FieldLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'].map(o => (
            <OptionCard key={o} label={o} selected={answers.painLevel === o} onClick={() => updateAnswer('painLevel', o)} />
          ))}
        </div>
      </div>
      {answers.painLevel && answers.painLevel !== 'No issues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <div>
              <FieldLabel>Affected Area</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {['Neck', 'Shoulder', 'Back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Other'].map(o => <Chip key={o} label={o} selected={answers.affectedArea === o} onClick={() => updateAnswer('affectedArea', o)} />)}
              </div>
            </div>
            <div>
              <FieldLabel>Type of Issue</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Other'].map(o => <Chip key={o} label={o} selected={answers.painType === o} onClick={() => updateAnswer('painType', o)} />)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel>Impact on Training</FieldLabel>
              <select value={answers.trainingImpact} onChange={e => updateAnswer('trainingImpact', e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-[#17cf54] transition-all appearance-none cursor-pointer text-slate-900 dark:text-white">
                <option value="">Select impact...</option>
                {['No impact', 'Small impact', 'Moderate impact', 'Couldn\'t train well'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Details</FieldLabel>
              <textarea placeholder="How did it start? What movements make it worse?" value={answers.painNotes} onChange={e => updateAnswer('painNotes', e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
            </div>
          </div>
        </div>
      )}
    </Section>
  );

  const renderPage9 = () => (
    <Section title="Activity & Movement" subtitle="Tracking your non-exercise activity and cardio adherence." icon="directions_run">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Cardio Goals</FieldLabel>
          <div className="flex flex-col gap-2">
            {['Did all', 'Missed some', 'Did very little', 'Did none'].map(o => <Chip key={o} label={o} selected={answers.cardioAdherence === o} onClick={() => updateAnswer('cardioAdherence', o)} />)}
          </div>
        </div>
        <div>
          <FieldLabel>Daily Steps (Avg)</FieldLabel>
          <div className="flex flex-col gap-2">
            {['Met goal daily', 'Met it most days', 'Rarely met it', 'Didn\'t track'].map(o => <Chip key={o} label={o} selected={answers.stepsAdherence === o} onClick={() => updateAnswer('stepsAdherence', o)} />)}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <FieldLabel>General Activity Level</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {['Sedentary', 'Low', 'Moderate', 'High'].map(o => <OptionCard key={o} label={o} selected={answers.activityLevel === o} onClick={() => updateAnswer('activityLevel', o)} />)}
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Felt more tired than usual?</span>
          <div className="flex gap-2">
            {['Yes', 'No'].map(o => <Chip key={o} label={o} selected={answers.activityTired === o} onClick={() => updateAnswer('activityTired', o)} />)}
          </div>
        </div>
      </div>
    </Section>
  );

  const renderPage10 = () => (
    <Section title="Looking Ahead" subtitle="Define your focus for the upcoming week." icon="flag">
      <div>
        <FieldLabel>Primary Focus Areas</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['Nutrition', 'Hunger control', 'Meal organization', 'Training performance', 'Energy', 'Sleep', 'Motivation', 'Consistency', 'Digestion', 'Stress management'].map(c => (
            <Chip key={c} label={c} selected={answers.improvementGoals.includes(c)} onClick={() => toggleArrayItem('improvementGoals', c)} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Coach Review Request</FieldLabel>
          <textarea placeholder="Anything specific your coach should look at?" value={answers.reviewNotes} onChange={e => updateAnswer('reviewNotes', e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
        </div>
        <div>
          <FieldLabel>Open Support</FieldLabel>
          <textarea placeholder="How can we help you win next week?" value={answers.helpNotes} onChange={e => updateAnswer('helpNotes', e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white min-h-[120px] focus:border-[#17cf54] focus:ring-0 outline-none resize-none transition-all text-sm" />
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

  const renderPage11 = () => (
    <Section title="Final Review" subtitle="Review your data points before locking in your week." icon="fact_check">
      <div className="space-y-4">
        {[
          { title: 'Overall & Body', icon: 'mood', step: 1, desc: `Week: ${answers.overallWeek || '--'} • Weight: ${answers.weight ? `${answers.weight}kg` : '--'}` },
          { title: 'Nutrition & Digestion', icon: 'restaurant', step: 3, desc: `Adherence: ${answers.nutritionAdherence || '--'} • Digestion: ${answers.digestion || '--'}` },
          { title: 'Training & Performance', icon: 'fitness_center', step: 6, desc: `Adherence: ${answers.trainingAdherence || '--'} • Quality: ${answers.performance || '--'}` },
          { title: 'Recovery & Vitality', icon: 'dark_mode', step: 7, desc: `Sleep: ${answers.sleepQuantity || '--'} • Stress: ${answers.stress || '--'}` }
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
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Check-in Analysis</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Your data suggests excellent training adherence but a slight dip in recovery. Your coach will focus on optimizing your rest protocols.</p>
        </div>
      </div>
    </Section>
  );

  const renderPage12 = () => (
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

  // --- Render Controller ---
  const renderStep = () => {
    switch (currentStep) {
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
