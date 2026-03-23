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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value, fullWidth = false }: any) => (
    <div className={fullWidth ? "col-span-1 md:col-span-2" : ""}>
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
      <div className="max-w-4xl mx-auto w-full space-y-6">
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
        </Section>

        {/* Section 2: Metrics */}
        <Section title="Body & Progress" subtitle="Physical updates and measurements." icon="straighten">
          <InfoField label="Current Weight" value={dj.weight ? `${dj.weight} kg` : null} />
          <InfoField label="Average Weight" value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
          <InfoField label="Waist Measurement" value={dj.waist ? `${dj.waist} cm` : null} />
          <InfoField label="Visible Changes" value={dj.visibleChanges} />
          <InfoField label="Body Perception" value={dj.bodyPerception} />
          <InfoField label="Satisfaction" value={dj.satisfaction} />
        </Section>

        {/* Section 3: Nutrition */}
        <Section title="Nutrition Compliance" subtitle="Tracking and dietary adherence." icon="restaurant">
          <InfoField label="Adherence Level" value={dj.nutritionAdherence} />
          <InfoField label="Calorie Target" value={dj.hitCalories} />
          <InfoField label="Protein Target" value={dj.hitProtein} />
          <InfoField label="Hardest Meal" value={dj.hardestMeal} />
          <InfoField label="Obstacles" value={dj.adherenceObstacles} />
          <InfoField label="Off-Plan Frequency" value={dj.offPlanCount} />
          <InfoField label="Tracking Accuracy" value={dj.trackingAccuracy} />
        </Section>

        {/* Section 4: Digestion */}
        <Section title="Digestion & Biofeedback" icon="health_and_safety">
          <InfoField label="Digestion Quality" value={dj.digestionQuality} />
          <InfoField label="Stool Consistency" value={dj.bowelRegularity} />
          <InfoField label="Symptoms" value={dj.digestiveSymptoms} />
          <InfoField label="Energy Post-Meal" value={dj.energyResponse} />
          <InfoField label="Hunger Level" value={dj.hunger} />
          <InfoField label="Energy Level" value={dj.energyFood} />
        </Section>

        {/* Section 5: Training */}
        <Section title="Training Performance" icon="fitness_center">
           <InfoField label="Training Adherence" value={dj.trainingAdherence} />
           <InfoField label="Strength Levels" value={dj.strength} />
           <InfoField label="Overall Energy" value={dj.trainingEnergy} />
           <InfoField label="Training Wins" value={dj.prWins} fullWidth />
        </Section>

        {/* Section 6: Recovery */}
        <Section title="Recovery & Sleep" icon="bedtime">
           <InfoField label="Sleep Quantity" value={dj.sleepQuantity} />
           <InfoField label="Sleep Quality" value={dj.sleepQuality} />
           <InfoField label="Stress Levels" value={dj.stress} />
           <InfoField label="General Fatigue" value={dj.generalFatigue} />
           <InfoField label="Motivation" value={dj.motivation} />
        </Section>

        {/* Section 7: Looking Ahead */}
        <Section title="Looking Ahead" icon="flag">
           <InfoField label="Improvement Focus" value={dj.improvementGoals} />
           <InfoField label="Next Week Readiness" value={dj.readiness} />
           <InfoField label="Non-Negotiables" value={dj.nonNegotiables} fullWidth />
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
