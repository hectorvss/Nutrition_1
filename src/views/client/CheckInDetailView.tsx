import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface CheckInDetailViewProps {
  checkIn: any;
  onBack: () => void;
}

export default function CheckInDetailView({ checkIn, onBack }: CheckInDetailViewProps) {
  const { t, language } = useLanguage();
  const dj = checkIn.data_json || {};
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const Section = ({ title, subtitle, icon, children, gridCols = "grid-cols-1" }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className={`grid ${gridCols} gap-6`}>
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value, fullWidth = false }: any) => (
    <div className={fullWidth ? "col-span-full" : ""}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">{label}</p>
      <div className="min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center">
        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2">
              {value.map((v: string) => (
                <span key={v} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{v}</span>
              ))}
            </div>
          ) : (
            value || <span className="text-slate-300 dark:text-slate-600">—</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#112116] p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-bold text-sm">{t('back_to_history')}</span>
          </button>
          <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-1">{t('submitted_on')}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {new Date(checkIn.created_at || checkIn.date).toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        {/* Section 1: Overview */}
        <Section title={t('overall_experience')} subtitle={t('general_thoughts_past_week')} icon="mood">
          <InfoField label={t('overall_week')} value={dj.overallWeek} />
          <InfoField label={t('primary_context')} value={dj.contextChips} />
          <InfoField label={t('plan_alignment')} value={dj.matchPlan} />
          <InfoField label={t('consistency')} value={dj.consistency} />
          <InfoField label={t('mental_health')} value={dj.mentalHealth} />
          <InfoField label={t('weekly_notes')} value={dj.weekNotes} fullWidth />
          {dj.reviewNotes && <InfoField label={t('review_request_for_coach')} value={dj.reviewNotes} fullWidth />}
        </Section>

        {/* Section 2: Body & Progress */}
        <Section title={t('body_progress')} subtitle={t('physical_updates_measurements')} icon="straighten" gridCols="grid-cols-1 md:grid-cols-3">
          <div className="col-span-1 md:col-span-2">
            <InfoField label={t('current_weight')} value={dj.weight ? `${dj.weight} kg` : null} />
          </div>
          <InfoField label={t('average_weight')} value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
          
          <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoField label={t('waist')} value={dj.waist ? `${dj.waist}cm` : null} />
            <InfoField label={t('hips')} value={dj.hips ? `${dj.hips}cm` : null} />
            <InfoField label={t('chest')} value={dj.chest ? `${dj.chest}cm` : null} />
          </div>
          
          <InfoField label={t('visible_changes')} value={dj.visibleChanges} />
          <InfoField label={t('body_perception')} value={dj.bodyPerception} />
          <InfoField label={t('satisfaction')} value={dj.satisfaction} />
          <InfoField label={t('menstrual_impact')} value={dj.menstrualImpact} />
          <InfoField label={t('biggest_change')} value={dj.biggestChangeArea} />

          {/* Progress Photos */}
          <div className="col-span-full pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('progress_photos')}</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'photoFront', label: t('front') },
                { id: 'photoSide', label: t('side') },
                { id: 'photoBack', label: t('back') }
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
        <Section title={t('nutrition_compliance')} subtitle={t('tracking_dietary_adherence')} icon="restaurant">
          <InfoField label={t('adherence_level')} value={dj.nutritionAdherence} />
          <InfoField label={t('calorie_target')} value={dj.hitCalories} />
          <InfoField label={t('protein_target')} value={dj.hitProtein} />
          <InfoField label={t('hardest_meal')} value={dj.hardestMeal} />
          <InfoField label={t('obstacles')} value={dj.adherenceObstacles} />
          <InfoField label={t('off_plan_frequency')} value={dj.offPlanCount} />
          <InfoField label={t('eat_out_count')} value={dj.eatOutCount} />
          <InfoField label={t('tracking_accuracy')} value={dj.trackingAccuracy} />
          <InfoField label={t('nutrition_notes')} value={dj.foodNotes} fullWidth />
        </Section>

        {/* Section 4: Digestion & Biofeedback */}
        <Section title={t('digestion_biofeedback')} icon="health_and_safety">
          <InfoField label={t('digestion_quality')} value={dj.digestionQuality} />
          <InfoField label={t('stool_consistency')} value={dj.bowelRegularity} />
          <InfoField label={t('symptoms')} value={dj.digestiveSymptoms} />
          <InfoField label={t('energy_post_meal')} value={dj.energyResponse} />
          <InfoField label={t('hunger_level')} value={dj.hunger} />
          <InfoField label={t('cravings_timing')} value={dj.cravingsTime} />
          <InfoField label={t('fullness_response')} value={dj.fullnessResponse} />
          <InfoField label={t('digestion_notes')} value={dj.digestiveIssues} fullWidth />
        </Section>

        {/* Section 5: Habits */}
        <Section title={t('daily_habits')} icon="task_alt">
           <InfoField label={t('water_amount')} value={dj.waterAmount} />
           <InfoField label={t('water_consistency')} value={dj.waterIntake} />
           <InfoField label={t('alcohol_intake')} value={dj.alcoholIntake} />
           <InfoField label={t('snacking_frequency')} value={dj.snackingFrequency} />
           <InfoField label={t('routine_structure')} value={dj.routineStructure} />
           <InfoField label={t('meal_timing')} value={dj.mealTimingConsistency} />
           <InfoField label={t('supplements')} value={dj.supplements} />
           <InfoField label={t('habit_notes')} value={dj.habitNotes} fullWidth />
        </Section>

        {/* Section 6: Training */}
        <Section title={t('training_performance')} icon="fitness_center">
           <InfoField label={t('training_adherence')} value={dj.trainingAdherence} />
           <InfoField label={t('strength_levels')} value={dj.strength} />
           <InfoField label={t('overall_energy')} value={dj.trainingEnergy} />
           <InfoField label={t('training_quality')} value={dj.trainingQuality} />
           <InfoField label={t('intensity')} value={dj.trainingIntensity} />
           <InfoField label={t('recovery')} value={dj.trainingRecovery} />
           <InfoField label={t('performance_drop')} value={dj.performanceDropReasons} />
           <InfoField label={t('exercise_wins')} value={dj.prWins} fullWidth />
           <InfoField label={t('training_notes')} value={dj.trainingNotes} fullWidth />
        </Section>

        {/* Section 7: Recovery */}
        <Section title={t('recovery_sleep')} icon="bedtime">
           <InfoField label={t('average_sleep')} value={dj.sleepQuantity} />
           <InfoField label={t('sleep_quality')} value={dj.sleepQuality} />
           <InfoField label={t('interruptions')} value={dj.sleepInterruptions} />
           <InfoField label={t('consistency')} value={dj.sleepScheduleConsistency} />
           <InfoField label={t('stress_levels')} value={dj.stress} />
           <InfoField label={t('general_fatigue')} value={dj.generalFatigue} />
           <InfoField label={t('motivation')} value={dj.motivation} />
           <InfoField label={t('recovery_impacts')} value={dj.recoveryImpacts} />
           <InfoField label={t('recovery_notes')} value={dj.recoveryNotes} fullWidth />
        </Section>

        {/* Section 8: Activity & Pain */}
        <Section title={t('activity_pain')} icon="healing">
           <InfoField label={t('step_range')} value={dj.stepRange} />
           <InfoField label={t('steps_adherence')} value={dj.stepsAdherence} />
           <InfoField label={t('cardio_adherence')} value={dj.cardioAdherence} />
           <InfoField label={t('activity_level')} value={dj.activityLevel} />
           <InfoField label={t('pain_level')} value={dj.painLevel} />
           <InfoField label={t('affected_area')} value={dj.affectedArea} />
           <InfoField label={t('modified_training')} value={dj.modifiedTraining} />
           <InfoField label={t('activity_notes')} value={dj.activityNotes} />
           <InfoField label={t('pain_notes')} value={dj.painNotes} fullWidth />
        </Section>

        {/* Section 9: Looking Ahead */}
        <Section title={t('looking_ahead')} icon="flag">
           <InfoField label={t('improvement_focus')} value={dj.improvementGoals} />
           <InfoField label={t('next_week_readiness')} value={dj.readiness} />
           <InfoField label={t('non_negotiables')} value={dj.nonNegotiables} fullWidth />
           <InfoField label={t('coach_support_request')} value={dj.supportNeeded} fullWidth />
           <InfoField label={t('final_thoughts')} value={dj.extraNotes} fullWidth />
        </Section>

        {/* Coach Feedback Section (If available) */}
        {checkIn.reviewed_at && (
          <div className="bg-[#17cf54] rounded-3xl p-8 text-white shadow-lg space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">chat_bubble</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('coach_feedback')}</h2>
                <p className="text-sm text-white/80">{t('reviewed_on')} {new Date(checkIn.reviewed_at).toLocaleDateString(locale)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                 <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{t('coach_notes')}</p>
                 <p className="text-sm leading-relaxed">{checkIn.coach_notes || t('good_work_this_week')}</p>
              </div>
              {checkIn.next_week_focus && (
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                   <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{t('focus_for_next_week')}</p>
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
