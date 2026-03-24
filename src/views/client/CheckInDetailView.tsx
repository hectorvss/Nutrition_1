import React from 'react';

interface CheckInDetailViewProps {
  checkIn: any;
  onBack: () => void;
}

export default function CheckInDetailView({ checkIn, onBack }: CheckInDetailViewProps) {
  const dj = checkIn.data_json || {};

  const Section = ({ title, subtitle, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
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

  const InfoField = ({ label, value, fullWidth = false }: any) => (
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116] p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-bold text-sm">Back to History</span>
          </button>
          <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Submitted On</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(checkIn.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        {/* Section 1: Overview */}
        <Section title="Overall Experience" subtitle="Your general thoughts on the past week." icon="mood">
          <InfoField label="Overall Week" value={dj.overallWeek} />
          <InfoField label="Primary Context" value={dj.contextChips} />
          <InfoField label="Plan Alignment" value={dj.matchPlan} />
          <InfoField label="Consistency" value={dj.consistency} />
          <InfoField label="Mental Health" value={dj.mentalHealth} />
          <InfoField label="Weekly Notes" value={dj.weekNotes} fullWidth />
          {dj.reviewNotes && <InfoField label="Review Request for Coach" value={dj.reviewNotes} fullWidth />}
        </Section>

        {/* Section 2: Body & Progress */}
        <Section title="Body & Progress" subtitle="Physical updates and measurements." icon="straighten">
          <InfoField label="Current Weight" value={dj.weight ? `${dj.weight} kg` : null} />
          <InfoField label="Average Weight" value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 col-span-1 md:col-span-2">
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
          <div className="col-span-1 md:col-span-2 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Progress Photos</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'photoFront', label: 'Front' },
                { id: 'photoSide', label: 'Side' },
                { id: 'photoBack', label: 'Back' }
              ].map(p => (
                <div key={p.id} className="aspect-[3/4] rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  {dj[p.id] ? (
                    <img src={dj[p.id]} alt={p.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center">
                      <span className="material-symbols-outlined text-2xl">no_photography</span>
                      <span className="text-[9px] font-bold uppercase">{p.label}</span>
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
          <InfoField label="Tracking Accuracy" value={dj.trackingAccuracy} />
          <InfoField label="Nutrition Notes" value={dj.foodNotes} fullWidth />
        </Section>

        {/* Section 4: Digestion & Biofeedback */}
        <Section title="Digestion & Biofeedback" icon="health_and_safety">
          <InfoField label="Digestion Quality" value={dj.digestionQuality} />
          <InfoField label="Stool Consistency" value={dj.bowelRegularity} />
          <InfoField label="Symptoms" value={dj.digestiveSymptoms} />
          <InfoField label="Energy Post-Meal" value={dj.energyResponse} />
          <InfoField label="Hunger Level" value={dj.hunger} />
          <InfoField label="Cravings Timing" value={dj.cravingsTime} />
          <InfoField label="Fullness Response" value={dj.fullnessResponse} />
          <InfoField label="Digestion Notes" value={dj.digestiveIssues} fullWidth />
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
           <InfoField label="Habit Notes" value={dj.habitNotes} fullWidth />
        </Section>

        {/* Section 6: Training */}
        <Section title="Training Performance" icon="fitness_center">
           <InfoField label="Training Adherence" value={dj.trainingAdherence} />
           <InfoField label="Strength Levels" value={dj.strength} />
           <InfoField label="Overall Energy" value={dj.trainingEnergy} />
           <InfoField label="Training Quality" value={dj.trainingQuality} />
           <InfoField label="Intensity" value={dj.trainingIntensity} />
           <InfoField label="Recovery" value={dj.trainingRecovery} />
           <InfoField label="Performance Drop" value={dj.performanceDropReasons} />
           <InfoField label="Exercise Wins" value={dj.prWins} fullWidth />
           <InfoField label="Training Notes" value={dj.trainingNotes} fullWidth />
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
           <InfoField label="Recovery Notes" value={dj.recoveryNotes} fullWidth />
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
           <InfoField label="Pain Notes" value={dj.painNotes} fullWidth />
        </Section>

        {/* Section 9: Looking Ahead */}
        <Section title="Looking Ahead" icon="flag">
           <InfoField label="Improvement Focus" value={dj.improvementGoals} />
           <InfoField label="Next Week Readiness" value={dj.readiness} />
           <InfoField label="Non-negotiables" value={dj.nonNegotiables} fullWidth />
           <InfoField label="Coach Support Request" value={dj.supportNeeded} fullWidth />
           <InfoField label="Final Thoughts" value={dj.extraNotes} fullWidth />
        </Section>

        {/* Coach Feedback Section (If available) */}
        {checkIn.reviewed_at && (
          <div className="bg-[#17cf54] rounded-3xl p-8 text-white shadow-lg space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">chat_bubble</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Coach Feedback</h2>
                <p className="text-sm text-white/80">Reviewed on {new Date(checkIn.reviewed_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                 <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Coach Notes</p>
                 <p className="text-sm leading-relaxed">{checkIn.coach_notes || 'Good work this week!'}</p>
              </div>
              {checkIn.next_week_focus && (
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                   <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Focus for Next Week</p>
                   <p className="text-sm font-bold">{checkIn.next_week_focus}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-12"></div>
      </div>
    </div>
  );
}
