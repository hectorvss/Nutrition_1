import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Flag, 
  History, 
  FileText, 
  Camera, 
  Check, 
  Mic,
  Paperclip,
  Send,
  Target,
  Clock,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';
import CheckInReviewRenderer from '../components/checkin/CheckInReviewRenderer';
import { useLanguage } from '../context/LanguageContext';

interface CheckInReviewProps {
  clientId: string;
  checkInId: string;
  onBack: () => void;
  readonly?: boolean;
  isClient?: boolean;
}

export default function CheckInReview({ clientId, checkInId, onBack, readonly = false, isClient = false }: CheckInReviewProps) {
  const { reloadClients } = useClient();
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coachNotes, setCoachNotes] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [publishingState, setPublishingState] = useState<'idle' | 'publishing' | 'marking_reviewed'>('idle');

  useEffect(() => {
    const loadCheckIn = async () => {
      setIsLoading(true);
      try {
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
    setPublishingState('publishing');
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
      setPublishingState('idle');
    }
  };

  const handleMarkAsReviewed = async () => {
    setPublishingState('marking_reviewed');
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
      setPublishingState('idle');
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
    return <div className="p-8 text-center text-slate-500">{t('checkin_not_found')}</div>;
  }

  const { client, check_in } = data;
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  
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
      <div className={`grid gap-x-8 gap-y-6 ${!isClient ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
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
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">{t('checkins')}</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">{client.name}</span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('client_id')}: {client.id.substring(0,8)}</div>
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
                  <Flag className="w-3 h-3" /> {t('pending_review')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t('reviewed_status')}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> {t('submitted_on', { date: new Date(check_in.created_at).toLocaleString(locale) })}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {t('date')}: {new Date(check_in.date).toLocaleDateString(locale)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <History className="w-4 h-4" />
            {t('history_badge')}
          </button>
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <FileText className="w-4 h-4" />
            {t('export_btn')}
          </button>
        </div>
      </div>

      <div className="w-full space-y-6">
        {check_in.type === 'dynamic' && check_in.template ? (
          <CheckInReviewRenderer 
            template={{
              ...check_in.template,
              templateSchema: check_in.template.template_schema || check_in.template.templateSchema || []
            }} 
            answers={dj} 
            isClient={isClient} 
          />
        ) : (
          <>
            {/* Section 1: Overview */}
            <Section title={t('overall_experience')} subtitle={t('client_general_thoughts')} icon="mood">
              <InfoField label={t('overall_week')} value={dj.overallWeek} />
              <InfoField label={t('primary_context')} value={dj.contextChips} />
              <InfoField label={t('plan_alignment')} value={dj.matchPlan} />
              <InfoField label={t('consistency_label')} value={dj.consistency} />
              <InfoField label={t('mental_health')} value={dj.mentalHealth} />
              <InfoField label={t('weekly_notes')} value={dj.weekNotes} />
              {dj.reviewNotes && <InfoField label={t('review_request')} value={dj.reviewNotes} />}
            </Section>

            {/* Section 2: Body & Progress */}
            <Section title={t('body_progress')} subtitle={t('physical_updates')} icon="straighten">
              <InfoField label={t('current_weight')} value={dj.weight ? `${dj.weight} kg` : null} />
              <InfoField label={t('average_weight')} value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoField label={t('waist')} value={dj.waist ? `${dj.waist}cm` : null} />
                <InfoField label={t('hips')} value={dj.hips ? `${dj.hips}cm` : null} />
                <InfoField label={t('chest')} value={dj.chest ? `${dj.chest}cm` : null} />
              </div>
              <InfoField label={t('visible_changes')} value={dj.visibleChanges} />
              <InfoField label={t('body_perception')} value={dj.bodyPerception} />
              <InfoField label={t('satisfaction_label')} value={dj.satisfaction} />
              <InfoField label={t('menstrual_impact')} value={dj.menstrualImpact} />
              <InfoField label={t('biggest_change')} value={dj.biggestChangeArea} />

              {/* Progress Photos */}
              <div className="w-full mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('progress_photos')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'photoFront', label: t('front') },
                    { id: 'photoSide', label: t('side') },
                    { id: 'photoBack', label: t('back_muscle') }
                  ].map(p => (
                    <div key={p.id} className="aspect-[3/4] rounded-2xl bg-slate-50 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center">
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
            <Section title={t('nutrition_compliance')} subtitle={t('tracking_dietary')} icon="restaurant">
              <InfoField label={t('adherence_level')} value={dj.nutritionAdherence} />
              <InfoField label={t('calorie_target')} value={dj.hitCalories} />
              <InfoField label={t('protein_target')} value={dj.hitProtein} />
              <InfoField label={t('hardest_meal')} value={dj.hardestMeal} />
              <InfoField label={t('obstacles_label')} value={dj.adherenceObstacles} />
              <InfoField label={t('off_plan_frequency')} value={dj.offPlanCount} />
              <InfoField label={t('eat_out_count')} value={dj.eatOutCount} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label={t('tracking_accuracy')} value={dj.trackingAccuracy} />
                <InfoField label={t('meals_followed')} value={dj.mealsFollowed} />
              </div>
              <InfoField label={t('nutrition_notes')} value={dj.foodNotes || dj.digestiveIssues} />
            </Section>

            {/* Section 4: Digestion & Biofeedback */}
            <Section title={t('digestion_biofeedback')} icon="health_and_safety">
              <InfoField label={t('digestion_quality')} value={dj.digestionQuality} />
              <InfoField label={t('stool_consistency')} value={dj.bowelRegularity} />
              <InfoField label={t('symptoms_label')} value={dj.digestiveSymptoms} />
              <InfoField label={t('energy_post_meal')} value={dj.energyResponse} />
              <InfoField label={t('hunger_level')} value={dj.hunger} />
              <InfoField label={t('cravings_intensity')} value={dj.cravings} />
              <InfoField label={t('cravings_timing')} value={dj.cravingsTime} />
              <InfoField label={t('fullness_response')} value={dj.fullnessResponse} />
              <InfoField label={t('bloating_level')} value={dj.bloatingLevel} />
              <InfoField label={t('digestion_notes')} value={dj.foodNotes} />
            </Section>

            {/* Section 5: Habits */}
            <Section title={t('daily_habits')} icon="task_alt">
               <InfoField label={t('water_amount')} value={dj.waterAmount} />
               <InfoField label={t('water_consistency')} value={dj.waterIntake} />
               <InfoField label={t('alcohol_intake')} value={dj.alcoholIntake} />
               <InfoField label={t('snacking_frequency')} value={dj.snackingFrequency} />
               <InfoField label={t('routine_structure')} value={dj.routineStructure} />
               <InfoField label={t('meal_timing')} value={dj.mealTimingConsistency} />
               <InfoField label={t('supplements_label')} value={dj.supplements} />
               <InfoField label={t('habit_notes')} value={dj.habitNotes} />
            </Section>

            {/* Section 6: Training */}
            <Section title={t('training_performance')} icon="fitness_center">
               <InfoField label={t('training_adherence')} value={dj.trainingAdherence} />
               <InfoField label={t('strength_levels')} value={dj.strength} />
               <InfoField label={t('overall_energy')} value={dj.trainingEnergy} />
               <InfoField label={t('training_quality')} value={dj.trainingQuality} />
               <InfoField label={t('intensity_label')} value={dj.trainingIntensity} />
               <InfoField label={t('recovery_label')} value={dj.trainingRecovery} />
               <InfoField label={t('performance_trend')} value={dj.performance} />
               <InfoField label={t('performance_drop')} value={dj.performanceDropReasons} />
               <InfoField label={t('exercise_wins')} value={dj.prWins} />
               <InfoField label={t('training_notes')} value={dj.trainingNotes || dj.awkwardExerciseNotes} />
            </Section>

            {/* Section 7: Recovery */}
            <Section title={t('recovery_sleep')} icon="bedtime">
               <InfoField label={t('average_sleep')} value={dj.sleepQuantity} />
               <InfoField label={t('sleep_quality')} value={dj.sleepQuality} />
               <InfoField label={t('sleep_interruptions')} value={dj.sleepInterruptions} />
               <InfoField label={t('sleep_consistency')} value={dj.sleepScheduleConsistency} />
               <InfoField label={t('stress_levels')} value={dj.stress} />
               <InfoField label={t('general_fatigue')} value={dj.generalFatigue} />
               <InfoField label={t('motivation_label')} value={dj.motivation} />
               <InfoField label={t('recovery_impacts')} value={dj.recoveryImpacts} />
               <InfoField label={t('recovery_notes')} value={dj.recoveryNotes} />
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
               <InfoField label={t('pain_notes')} value={dj.painNotes} />
            </Section>

            {/* Section 9: Looking Ahead */}
            <Section title={t('looking_ahead')} icon="flag">
               <InfoField label={t('improvement_focus')} value={dj.improvementGoals} />
               <InfoField label={t('next_week_readiness')} value={dj.readiness} />
               <InfoField label={t('non_negotiables')} value={dj.nonNegotiables} />
               <InfoField label={t('coach_support_request')} value={dj.supportNeeded} />
               <InfoField label={t('final_thoughts')} value={dj.extraNotes} />
            </Section>
          </>
        )}

        {/* Coach Assessment Form - Hidden for clients */}
        {!isClient && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#17cf54]/10 text-[#17cf54] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">reviews</span>
              </div>
              {t('coach_assessment')}
            </h2>
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-950/5">
              {t('load_template')}
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Column */}
            <div className="lg:col-span-2 space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('internal_notes')}</label>
              <div className="relative group">
                <textarea 
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full bg-yellow-50/50 dark:bg-amber-900/10 border-2 border-yellow-100/50 dark:border-amber-900/20 rounded-2xl p-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-200 transition-all min-h-[200px] resize-none outline-none font-medium placeholder-slate-400" 
                  placeholder={t('feedback_placeholder')}
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">{t('next_week_focus')}</label>
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
                    placeholder={t('next_week_focus_placeholder')} 
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
                     <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('send_via_email')}</span>
                   </label>
                   <button className="text-[12px] font-bold text-red-500 hover:text-red-600 transition-colors">
                     {t('clarification_needed')}
                   </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={handleMarkAsReviewed}
                    disabled={publishingState !== 'idle'}
                    className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[14px] font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 h-[56px]"
                  >
                    {publishingState === 'marking_reviewed' ? (
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {t('mark_reviewed')}
                      </>
                    )}
                  </button>

                  <button 
                    onClick={handlePublish}
                    disabled={publishingState !== 'idle' || !coachNotes.trim()}
                    className="w-full py-4 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-100 text-[14px] font-bold transition-all shadow-xl shadow-slate-900/20 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group h-[56px]"
                  >
                    {publishingState === 'publishing' ? (
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        {t('publish_feedback')}
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
              {t('coach_feedback')}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-emerald-900 dark:text-emerald-200">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest uppercase mb-1">{t('internal_notes')}</p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 whitespace-pre-wrap italic font-semibold leading-relaxed">
                  {check_in.coach_notes || t('no_feedback_yet')}
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest uppercase mb-1">{t('next_week_focus')}</p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shadow-sm">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{check_in.next_week_focus || t('keep_it_up')}</h4>
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
