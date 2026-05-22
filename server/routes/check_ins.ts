import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { processTrigger } from './automations.js';
import { runWorkflowsForEvent } from './workflows.js';
import { sendPushToUser } from '../lib/push.js';
import { verifyManager as _verifyManager, verifyClient as _verifyClient, type AuthedRequest } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';

const router = Router();

const errMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

// Minimal shape of a check-in template question. Templates and answers son
// JSON arbitrario en BD: el manager edita libremente y se reescribe con shape
// nuevo cada vez que el editor añade un tipo. Mantenemos un index signature
// permisivo y solo declaramos los campos que SI consume el backend.
//
// Campos especificos observados en FIXED_CHECKIN_QUESTIONS + en plantillas
// dinamicas: id, type, required, is_fixed, locked, options (array suelto —
// string[] para measurement_group, objetos para multi_choice, etc.),
// conditional ({ field, operator, value } para visibilidad condicional),
// hidden, y N campos de presentacion (title, subtitle, meta, unit) que el
// backend no toca.
interface CheckInQuestion {
  id: string;
  type?: string;
  required?: boolean;
  is_fixed?: boolean;
  locked?: boolean;
  hidden?: boolean;
  conditional?: { field: string; operator: string; value: unknown } | null;
  // options puede ser string[] (measurement_group) o array de objetos
  // ({value,label}) en multi_choice. No fijamos shape para no romper.
  options?: unknown[];
  [k: string]: unknown;
}
interface CheckInSchemaStep {
  id?: string;
  title?: string;
  questions?: CheckInQuestion[];
  [k: string]: unknown;
}
type CheckInAnswers = Record<string, unknown>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED CHECK-IN QUESTIONS — the canonical data-collection contract.
// Every question here is required + is_fixed + locked: it is injected into every
// check-in the client fills, can never be removed by the manager, and uses a
// STABLE id (the "metric key") that the KPI layer reads directly. Each id maps
// 1:1 to a dashboard KPI. Do not rename these ids without updating profile-stats
// and /analytics extraction.
// ─────────────────────────────────────────────────────────────────────────────
const SCALE_META = { min: 1, max: 10, step: 1 };

const FIXED_CHECKIN_QUESTIONS = [
  {
    id: 'body_metrics_step',
    title: 'Body Metrics',
    subtitle: 'These power your weight, body-fat and measurement charts',
    meta: { icon: 'monitoring' },
    locked: true,
    questions: [
      { id: 'weight', title: 'Current Weight (kg)', type: 'number', unit: 'kg', required: true, is_fixed: true, locked: true },
      { id: 'body_fat', title: 'Body Fat %', type: 'number', unit: '%', required: true, is_fixed: true, locked: true },
      { id: 'measurements', title: 'Body Measurements (cm)', type: 'measurement_group', options: ['waist', 'hip', 'chest', 'arm_r', 'thigh_r'], required: true, is_fixed: true, locked: true }
    ]
  },
  {
    id: 'nutrition_adherence_step',
    title: 'Nutrition Adherence',
    subtitle: 'How consistently did you follow your fuel plan?',
    meta: { icon: 'restaurant' },
    locked: true,
    questions: [
      {
        id: 'nutrition_adherence_score',
        type: 'slider',
        title: 'Plan Adherence (1-10)',
        subtitle: 'On a scale of 1-10, how closely did you follow the plan?',
        required: true,
        is_fixed: true,
        locked: true,
        meta: SCALE_META
      }
    ]
  },
  {
    id: 'macros_step',
    title: 'Daily Macros',
    subtitle: 'Your average daily nutrition intake',
    meta: { icon: 'analytics' },
    locked: true,
    questions: [
      { id: 'protein', title: 'Avg. Daily Protein (g)', type: 'number', unit: 'g', required: true, is_fixed: true, locked: true },
      { id: 'carbs', title: 'Avg. Daily Carbs (g)', type: 'number', unit: 'g', required: true, is_fixed: true, locked: true },
      { id: 'fats', title: 'Avg. Daily Fats (g)', type: 'number', unit: 'g', required: true, is_fixed: true, locked: true },
      { id: 'calories', title: 'Avg. Daily Calories (kcal)', type: 'number', unit: 'kcal', required: true, is_fixed: true, locked: true }
    ]
  },
  {
    id: 'wellbeing_step',
    title: 'Wellbeing & Recovery',
    subtitle: 'Rate each from 1 (lowest) to 10 (highest)',
    meta: { icon: 'self_improvement' },
    locked: true,
    questions: [
      { id: 'energy_level', title: 'Energy Level (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'stress_level', title: 'Stress Level (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'mood_score', title: 'Mood (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'motivation_level', title: 'Motivation (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'fatigue', title: 'Fatigue Level (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'sleep_hours', title: 'Avg. Sleep per Night (hours)', type: 'number', unit: 'h', required: true, is_fixed: true, locked: true },
      { id: 'sleep_quality_score', title: 'Sleep Quality (1-10)', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META }
    ]
  },
  {
    id: 'training_step',
    title: 'Training Performance',
    subtitle: 'Rate your training week from 1 (lowest) to 10 (highest)',
    meta: { icon: 'fitness_center' },
    locked: true,
    questions: [
      { id: 'training_adherence_score', title: 'Training Adherence (1-10)', subtitle: 'How many of your planned sessions did you complete?', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'training_intensity_score', title: 'Training Intensity (1-10)', subtitle: 'Overall effort / intensity of your sessions', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META }
    ]
  },
  {
    id: 'activity_step',
    title: 'Activity & Lifestyle',
    subtitle: 'Movement and habits outside of your training sessions',
    meta: { icon: 'directions_run' },
    locked: true,
    questions: [
      { id: 'steps', title: 'Avg. Daily Steps', type: 'number', unit: 'steps', required: true, is_fixed: true, locked: true },
      { id: 'water_intake_score', title: 'Hydration (1-10)', subtitle: 'How well did you hit your daily water goal?', type: 'slider', required: true, is_fixed: true, locked: true, meta: SCALE_META },
      { id: 'alcohol_intake', title: 'Alcohol Intake', type: 'single_choice', options: ['None', 'Low', 'Moderate', 'High'], required: true, is_fixed: true, locked: true },
      { id: 'supplements_taken', title: 'Supplement Adherence', type: 'single_choice', options: ['All', 'Most', 'Some', 'None'], required: true, is_fixed: true, locked: true }
    ]
  }
];

// The full, complete "General Check-in" schema that is seeded into every new account.
// This is the original template from the system.
const GENERAL_CHECKIN_SCHEMA = [
  {
    id: 'general_sentiment', title: 'How did your week go overall?',
    subtitle: 'Your general sentiment sets the context for everything else.',
    meta: { icon: 'mood' },
    questions: [
      { id: 'overallWeek', type: 'single_choice', title: 'Select Sentiment', options: ['Very bad', 'Bad', 'Average', 'Good', 'Excellent'] },
      { id: 'matchPlan', type: 'single_choice', title: 'How closely did this week match the plan?', options: ['Not at all', 'Slightly', 'Moderately', 'Mostly', 'Completely'] },
      { id: 'mentalHealth', type: 'single_choice', title: 'How did you feel mentally this week?', options: ['Very overwhelmed', 'A bit overwhelmed', 'Neutral', 'Focused', 'Very good'] },
      { id: 'consistency', type: 'single_choice', title: 'How consistent did you feel overall?', options: ['Very inconsistent', 'Inconsistent', 'Average', 'Consistent', 'Very consistent'] },
      { id: 'contextChips', type: 'multi_select', title: 'Key Influencers', options: ['Stress', 'Travel', 'Busy week', 'Sick', 'Good routine', 'Low motivation', 'Great energy', 'Social events', 'Family commitments', 'Work / studies', 'Poor sleep', 'Anxiety', 'Menstrual cycle', 'Poor routine'] },
      { id: 'weekNotes', type: 'long_text', title: 'Additional Context (Optional)', placeholder: 'Briefly describe any major events or feelings...' }
    ]
  },
  {
    id: 'body_perception_step', title: 'Body Perception & Photos',
    subtitle: 'Track your physical changes and progress photos.',
    meta: { icon: 'camera_alt' },
    questions: [
      { id: 'bodyPerception', type: 'single_choice', title: 'Body Perception', options: ['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'Defined', 'Flatter', 'Fuller', 'Tighter waist', 'More watery'] },
      { id: 'visibleChanges', type: 'single_choice', title: 'Did you notice any visible changes?', options: ['No changes', 'Slight', 'Moderate', 'Big changes'] },
      { id: 'biggestChangeArea', type: 'single_choice', title: 'Where did you notice the biggest change?', options: ['Waist', 'Stomach', 'Legs', 'Glutes', 'Arms', 'Back', 'Face', 'Overall', 'Hard to tell'] },
      { id: 'satisfaction', type: 'single_choice', title: 'How satisfied are you with your current progress?', options: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] },
      { id: 'menstrualImpact', type: 'single_choice', title: 'Menstrual / hormonal impact this week', options: ['No impact', 'Mild', 'Moderate', 'Strong', 'N/A'] },
      { id: 'photos', type: 'photo_group', title: 'Progress Photos (Front, Side, Back)', options: ['photoFront', 'photoSide', 'photoBack'] }
    ]
  },
  {
    id: 'custom_nutrition_adherence', title: 'Nutrition Details',
    subtitle: 'Track specific adherence metrics and feedback.',
    meta: { icon: 'restaurant' },
    questions: [
      { id: 'nutritionAdherence', type: 'single_choice', title: 'Weekly Compliance (Overall %)', options: ['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)'] },
      { id: 'mealsFollowed', type: 'single_choice', title: 'How many meals did you follow as planned?', options: ['Almost all', 'Most', 'About half', 'Few', 'Almost none'] },
      { id: 'hitCalories', type: 'single_choice', title: 'Did you hit your calorie target?', options: ['Yes, daily', 'Mostly', 'Above', 'Below', 'No track'] },
      { id: 'hitProtein', type: 'single_choice', title: 'Did you hit your protein target?', options: ['Yes, daily', 'Most days', 'Sometimes', 'Rarely', 'Unknown'] },
      { id: 'offPlanCount', type: 'single_choice', title: 'How often did you eat off-plan?', options: ['Never', '1–2 meals', '3–4', '5+', 'Many'] },
      { id: 'skippedMeals', type: 'single_choice', title: 'Did you skip any meals?', options: ['Never', '1–2 times', 'A few', 'Frequently'] },
      { id: 'trackingAccuracy', type: 'single_choice', title: 'Did you track your food accurately?', options: ['Accurately', 'Mostly', 'Estimate', 'Barely', 'No track'] },
      { id: 'hardestMeal', type: 'single_choice', title: 'Which meal was hardest to follow?', options: ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Night', 'Weekend', 'All same'] },
      { id: 'adherenceObstacles', type: 'multi_select', title: 'What made adherence harder?', options: ['Hunger', 'Cravings', 'Social events', 'Eating out', 'Stress', 'Anxiety', 'No time', 'Poor planning', 'Travel', 'Low motivation', 'Boredom with meals', 'Family environment'] },
      { id: 'digestiveIssues', type: 'long_text', title: 'Nutrition Notes & Observations', placeholder: 'Any specific meals you struggled with? ...' }
    ]
  },
  {
    id: 'digestion_satiety', title: 'Digestion & Satiety',
    subtitle: 'Internal biofeedback is key to adjusting your plan.',
    meta: { icon: 'health_and_safety' },
    questions: [
      { id: 'hunger', type: 'single_choice', title: 'Hunger Levels', options: ['Very low', 'Low', 'Manageable', 'High', 'Extreme'] },
      { id: 'cravings', type: 'single_choice', title: 'Cravings Intensity', options: ['None', 'Mild', 'Moderate', 'Strong', 'Unstoppable'] },
      { id: 'cravingsTime', type: 'single_choice', title: 'At what time were cravings strongest?', options: ['Morning', 'Midday', 'Afternoon', 'Evening', 'Night', 'Random'] },
      { id: 'digestionQuality', type: 'single_choice', title: 'Digestion Quality', options: ['Excellent', 'Good', 'Okay', 'Poor', 'Very poor'] },
      { id: 'bloatingLevel', type: 'single_choice', title: 'Bloating Level', options: ['None', 'Mild', 'Moderate', 'Strong', 'Constant'] },
      { id: 'bowelRegularity', type: 'single_choice', title: 'Bowel Movement Regularity', options: ['Regular', 'Mildly irregular', 'Irregular', 'Constipated', 'Loose'] },
      { id: 'fullnessResponse', type: 'single_choice', title: 'Fullness After Meals', options: ['Not full', 'Satisfied', 'Very full', 'Too heavy'] },
      { id: 'energyResponse', type: 'single_choice', title: 'Energy Response After Meals', options: ['Better', 'Stable', 'Sleepy', 'Heavy', 'Crashes'] },
      { id: 'digestiveSymptoms', type: 'multi_select', title: 'Any Digestive Symptoms?', options: ['Gas', 'Acid reflux', 'Abdominal pain', 'Constipation', 'Loose stools', 'Nausea', 'Intolerance', 'None'] },
      { id: 'foodNotes', type: 'long_text', title: 'Additional Food & Digestion Notes', placeholder: 'Tell us more about your digestion...' }
    ]
  },
  {
    id: 'daily_foundations', title: 'Daily Foundations',
    subtitle: 'The small habits that drive the big results.',
    meta: { icon: 'water_drop' },
    questions: [
      { id: 'waterIntake', type: 'single_choice', title: 'Hydration Consistency', options: ['Met goal daily', 'Met most days', 'Struggled', 'Very low'] },
      { id: 'waterAmount', type: 'single_choice', title: 'Approximate daily water intake', options: ['<1L', '1–1.5L', '1.5–2L', '2–3L', '3L+'] },
      { id: 'supplements', type: 'single_choice', title: 'Supplements Consistency', options: ['Took all', 'Missed some', 'Missed most', 'None'] },
      { id: 'mealTimingConsistency', type: 'single_choice', title: 'Meal timing consistency', options: ['Very consistent', 'Mostly', 'Irregular', 'Very chaotic'] },
      { id: 'eatOutCount', type: 'single_choice', title: 'Eating out frequency', options: ['None', '1–2 times', '3–4', '5+ times'] },
      { id: 'alcoholIntake', type: 'single_choice', title: 'Alcohol intake', options: ['None', 'Low', 'Moderate', 'High'] },
      { id: 'snackingFrequency', type: 'single_choice', title: 'Snacking outside plan', options: ['Never', 'Occasionally', 'Frequently', 'Daily'] },
      { id: 'routineStructure', type: 'single_choice', title: 'Routine structure this week', options: ['Very structured', 'Fairly structured', 'Chaotic days', 'Very chaotic'] },
      { id: 'habitNotes', type: 'long_text', title: 'Daily Habit Notes (Optional)', placeholder: 'Anything related to hydration...' }
    ]
  },
  {
    id: 'training_performance', title: 'Training Performance',
    subtitle: 'Analyze your physical execution and strength levels.',
    meta: { icon: 'fitness_center' },
    questions: [
      { id: 'trainingAdherence', type: 'single_choice', title: 'Training Adherence', options: ['All sessions', 'Missed 1', 'Missed 2', 'Missed several', "Didn't train"] },
      { id: 'strength', type: 'single_choice', title: 'Overall Strength Perception', options: ['Down', 'Same', 'Up'] },
      { id: 'trainingEnergy', type: 'single_choice', title: 'Energy during training', options: ['Very low', 'Low', 'Average', 'Good', 'Excellent'] },
      { id: 'trainingQuality', type: 'single_choice', title: 'Session Quality & Connection', options: ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'] },
      { id: 'trainingRecovery', type: 'single_choice', title: 'Recovery between sessions', options: ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'] },
      { id: 'trainingIntensity', type: 'single_choice', title: 'Did you hit prescribed intensity?', options: ['Yes', 'Mostly', 'Sometimes', 'Rarely'] },
      { id: 'performance', type: 'single_choice', title: 'General Performance Trend', options: ['Much worse', 'Slightly worse', 'Same', 'Slightly better', 'Much better'] },
      { id: 'performanceDropReasons', type: 'multi_select', title: 'Why did performance drop?', options: ['Poor sleep', 'Stress', 'Low calories', 'Pain', 'Menstrual cycle', 'Low motivation', 'Bad recovery', 'Too much fatigue', 'Unknown'] },
      { id: 'prWins', type: 'long_text', title: 'Exercise wins', placeholder: 'Did any exercise feel especially strong?' },
      { id: 'awkwardExerciseNotes', type: 'long_text', title: 'Struggles or Painful movements', placeholder: 'Did any exercise feel awkward?' },
      { id: 'trainingNotes', type: 'long_text', title: 'Additional Training Notes', placeholder: 'Any additional feedback...' }
    ]
  },
  {
    id: 'recovery_sleep', title: 'Recovery & Sleep',
    subtitle: 'The foundation of your progress happens while you rest.',
    meta: { icon: 'dark_mode' },
    questions: [
      { id: 'sleepQuantity', type: 'single_choice', title: 'Sleep Quantity', options: ['<5h', '5–6h', '6–7h', '7–8h', '8h+'] },
      { id: 'sleepQuality', type: 'single_choice', title: 'Sleep Quality', options: ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'] },
      { id: 'sleepInterruptions', type: 'single_choice', title: 'Sleep Interruptions', options: ['Never', 'Occasionally', 'Frequently', 'Almost every night'] },
      { id: 'sleepScheduleConsistency', type: 'single_choice', title: 'Sleep Schedule Consistency', options: ['Very consistent', 'Mostly', 'Irregular', 'Very chaotic'] },
      { id: 'stress', type: 'single_choice', title: 'Stress Level', options: ['Very low', 'Low', 'Average', 'High', 'Extreme'] },
      { id: 'energy', type: 'single_choice', title: 'Energy Level', options: ['Very low', 'Low', 'Average', 'High', 'Extreme'] },
      { id: 'motivation', type: 'single_choice', title: 'Motivation', options: ['Very low', 'Low', 'Average', 'High', 'Extreme'] },
      { id: 'generalFatigue', type: 'single_choice', title: 'General Fatigue', options: ['Very low', 'Low', 'Average', 'High', 'Extreme'] },
      { id: 'recoveryImpacts', type: 'multi_select', title: 'What affected your recovery the most?', options: ['Work', 'Studies', 'Family', 'Travel', 'Anxiety', 'Late meals', 'Screen time', 'Poor routine', 'High training fatigue', 'Under-eating', 'Menstrual cycle', 'Pain', 'Unknown'] },
      { id: 'recoveryNotes', type: 'long_text', title: 'Recovery & Motivation Notes (Optional)', placeholder: 'Anything that affected sleep...' }
    ]
  },
  {
    id: 'pain_tracking', title: 'Injury & Pain Tracking',
    subtitle: 'Your safety is our priority. Report any discomfort immediately.',
    meta: { icon: 'healing' },
    questions: [
      { id: 'painLevel', type: 'single_choice', title: 'Current Pain / Discomfort Level', options: ['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'] },
      { id: 'affectedArea', type: 'single_choice', title: 'Affected Area', options: ['Neck', 'Shoulder', 'Upper back', 'Lower back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Foot', 'Abdomen', 'Other'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'painType', type: 'single_choice', title: 'Type of Issue', options: ['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Mobility restriction', 'Digestive', 'Other'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'trainingImpact', type: 'single_choice', title: 'Impact on Training', options: ['No impact', 'Small impact', 'Moderate', "Couldn't train properly", 'Had to stop'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'painDuration', type: 'single_choice', title: 'Duration', options: ['Just this week', 'A few days', '1–2 weeks', '2+ weeks', 'Chronic'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'painProgression', type: 'single_choice', title: 'Progression', options: ['Improved', 'Stayed same', 'Got worse'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'modifiedTraining', type: 'single_choice', title: 'Did you modify training?', options: ['Yes', 'No'], conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } },
      { id: 'painNotes', type: 'long_text', title: 'Describe what happened & Details', placeholder: 'How did it start? ...', conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' } }
    ]
  },
  {
    id: 'activity_movement', title: 'Activity & Movement',
    subtitle: 'Tracking your non-exercise activity and cardio adherence.',
    meta: { icon: 'directions_run' },
    questions: [
      { id: 'cardioAdherence', type: 'single_choice', title: 'Cardio Adherence', options: ['Did all', 'Missed some', 'Very little', 'Did none'] },
      { id: 'stepRange', type: 'single_choice', title: 'Daily Steps (Average Range)', options: ['<4k', '4k–6k', '6k–8k', '8k–10k', '10k+'] },
      { id: 'cardioPerformance', type: 'single_choice', title: 'Was cardio performance normal?', options: ['Better', 'Normal', 'Worse', 'N/A'] },
      { id: 'activityLevel', type: 'single_choice', title: 'General Activity Level', options: ['Sedentary', 'Low', 'Moderate', 'High'] },
      { id: 'activityLimitations', type: 'multi_select', title: 'Were activities limited by anything?', options: ['Fatigue', 'No time', 'Bad weather', 'Pain / discomfort', 'Low motivation', 'Travel', 'No limitation'] },
      { id: 'activityTired', type: 'single_choice', title: 'Felt more tired than usual?', options: ['Yes', 'No'] },
      { id: 'activityNotes', type: 'long_text', title: 'Activity Notes (Optional)', placeholder: 'Anything related to movement...' }
    ]
  },
  {
    id: 'looking_ahead', title: 'Looking Ahead',
    subtitle: 'Define your focus for the upcoming week.',
    meta: { icon: 'flag' },
    questions: [
      { id: 'improvementGoals', type: 'multi_select', title: 'Primary Focus Areas', options: ['Nutrition adherence', 'Hunger management', 'Meal prep / organization', 'Training intensity', 'Technique / form', 'Sleep hygiene', 'Stress management', 'Activity (Steps/Cardio)', 'Daily habits / Routine', 'Mental focus', 'Social events management'] },
      { id: 'nonNegotiables', type: 'long_text', title: 'What are your absolute non-negotiables?', placeholder: '3 things you WILL get done no matter what...' },
      { id: 'reviewNotes', type: 'long_text', title: 'Coach Review Request', placeholder: 'Anything specific your coach should analyze...' },
      { id: 'supportNeeded', type: 'long_text', title: 'Support Needed', placeholder: 'How can your coach best support you?' },
      { id: 'readiness', type: 'single_choice', title: 'Next Week Readiness', options: ['Not ready', 'Somewhat ready', 'Ready', 'Very ready'] }
    ]
  }
];

const injectFixedQuestions = (schema: CheckInSchemaStep[]) => {
  // Non-destructive injection: only add a fixed step if its question IDs
  // are not already present ANYWHERE in the existing template.
  // This way, the "General Check-in" (which already has the slider, measurements, etc.)
  // passes through untouched with ALL its custom questions visible.
  const safeSchema = schema || [];
  
  // Build a set of all question IDs already in the template
  const existingQuestionIds = new Set<string>(
    safeSchema.flatMap(step => (step.questions || []).map((q: CheckInQuestion) => q.id))
  );

  // Build a set of step IDs already in the template (to avoid duplicates)
  const existingStepIds = new Set<string>(safeSchema.map(step => step.id));

  // Only add fixed steps whose "key questions" are completely absent
  const stepsToInject = FIXED_CHECKIN_QUESTIONS.filter(fixedStep => {
    // Skip if this step ID already exists in the template
    if (existingStepIds.has(fixedStep.id)) return false;
    // Skip if all of this step's questions are already in the template
    const fixedQIds = (fixedStep.questions || []).map((q: CheckInQuestion) => q.id);
    const allPresent = fixedQIds.every((id: string) => existingQuestionIds.has(id));
    return !allPresent;
  });

  return [...stepsToInject, ...safeSchema];
};

// Inverso de injectFixedQuestions: quita los pasos fijos (locked) antes de
// PERSISTIR un template. FIXED_CHECKIN_QUESTIONS es la única fuente de verdad
// de las preguntas de KPI — se reinyectan en cada lectura, así que nunca se
// guardan en la fila del template (evita duplicados y desincronización si el
// contrato de KPIs cambia). Los pasos fijos se reconocen por `locked: true`.
const stripFixedQuestions = (schema: CheckInSchemaStep[]): CheckInSchemaStep[] => {
  return (schema || []).filter((step: any) => !step?.locked);
};

// Returns the ids of every `required` question in `schema` that has no usable
// answer in `answers`. Mirrors the client-side validation: conditional
// questions that are not currently visible are skipped, and composite types
// (measurement_group / photo_group) store values under derived keys.
const findMissingRequired = (schema: CheckInSchemaStep[], answers: CheckInAnswers): string[] => {
  const ans = answers || {};
  const isVisible = (q: CheckInQuestion): boolean => {
    if (q.hidden) return false;
    if (!q.conditional) return true;
    const { field, operator, value } = q.conditional;
    const fv = ans[field];
    if (operator === 'equals') return fv === value;
    if (operator === 'not_equals') return fv !== value;
    if (operator === 'contains') return Array.isArray(fv) && fv.includes(value);
    return true;
  };
  const isAnswered = (q: CheckInQuestion): boolean => {
    if (q.type === 'measurement_group') {
      return (q.options || []).some((o) => {
        // options en measurement_group son strings sueltos (keys de answers).
        const key = typeof o === 'string' ? o : (o as { value?: string })?.value || '';
        if (!key) return false;
        const v = ans[key]; return v !== undefined && v !== null && v !== '';
      });
    }
    if (q.type === 'photo_group') {
      return ['front', 'side', 'back'].some(p => {
        const v = ans[`${q.id}_${p}`]; return v !== undefined && v !== null && v !== '';
      });
    }
    const a = ans[q.id];
    if (Array.isArray(a)) return a.length > 0;
    return a !== undefined && a !== null && a !== '';
  };
  const missing: string[] = [];
  for (const step of (schema || [])) {
    for (const q of (step.questions || [])) {
      if (!q.required) continue;
      if (!isVisible(q)) continue;
      if (!isAnswered(q)) missing.push(q.id);
    }
  }
  return missing;
};

// Finds the manager's "General Check-in" template, creating it if it doesn't
// exist. Guarantees the caller always gets a template backed by a real DB row
// (with a valid UUID id) so client submissions never fail with "Template not found".
const resolveGeneralCheckinTemplate = async (managerId: string): Promise<any | null> => {
  if (!managerId) return null;

  // 1. Look for an existing General Check-in (including archived ones)
  const { data: existing } = await supabaseAdmin
    .from('checkin_templates')
    .select('*')
    .eq('manager_id', managerId)
    .eq('name', 'General Check-in')
    .maybeSingle();

  if (existing) return existing;

  // 2. None exists — create one. Make it the default if the manager has none.
  const { count: templateCount } = await supabaseAdmin
    .from('checkin_templates')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', managerId);

  const { data: created, error: createError } = await supabaseAdmin
    .from('checkin_templates')
    .insert({
      manager_id: managerId,
      name: 'General Check-in',
      description: 'Comprehensive weekly check-in template. Tracks adherence, body progress, recovery, training, and more.',
      template_schema: GENERAL_CHECKIN_SCHEMA,
      is_default: (templateCount || 0) === 0,
      version: 1
    })
    .select()
    .maybeSingle();

  if (createError) {
    console.error('[CheckIn] Error auto-creating General Check-in:', JSON.stringify(createError));
    return null;
  }

  return created;
};
// ... (rest of the code until POST /client/check-ins)

// Middleware centralizado con verificación de rol real
const verifyClient = _verifyClient;
const verifyManager = _verifyManager;

// Client: Submit a new check-in — REMOVED.
// The legacy free-form check_ins write path has been retired; all new check-ins
// go through the template-based POST /client/submissions. This stub returns
// 410 Gone so any stale client gets a clear error instead of silently writing
// data into the legacy table that the rest of the app no longer maintains.
router.post('/client/check-ins', verifyClient, async (req: AuthedRequest, res) => {
  console.warn('[REMOVED] POST /check-ins/client/check-ins called by', req.user?.id, '— use POST /check-ins/client/submissions');
  res.status(410).json({
    error: 'This endpoint has been removed. Submit check-ins via POST /check-ins/client/submissions.'
  });
});

// Client: Get my check-in history
// Unified: merges legacy `check_ins` and dynamic `client_checkin_submissions`
// so the client sees every check-in regardless of which system created it.
router.get('/client/check-ins', verifyClient, async (req: AuthedRequest, res) => {
  const clientId = req.user?.id;
  // Paginacion cursor-based unificada para legacy + dynamic.
  //
  // Cursor: { v: date ISO, i: id, t?: 'legacy'|'dynamic' }
  // El `t` indica de que tabla viene la ultima fila visible — solo
  // aplicamos el `id.lt` tiebreaker a ESA tabla (no a la otra). Para la
  // tabla "opuesta" aplicamos `<= v` para no perder filas con la misma
  // fecha pero distinto id. Asi evitamos el bug cross-table que saltaba
  // o duplicaba filas con id UUIDs (sin orden semantico cruzado).
  const page = parsePagination(req, { defaultLimit: 30, maxLimit: 100 });
  const cur = page.cursor;
  try {
    // 1. Legacy check-ins
    let legacyQ = supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', clientId!)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    if (cur) {
      if (cur.t === 'legacy') {
        // Cursor venia de legacy -> aplicar tiebreaker estricto sobre id.
        legacyQ = legacyQ.or(`date.lt.${cur.v},and(date.eq.${cur.v},id.lt.${cur.i})`);
      } else {
        // Cursor venia de dynamic o sin tipo -> filtramos solo por date.
        // Incluimos filas con date == cur.v para que la pagina siguiente
        // capture cualquier fila legacy con la misma fecha que la ultima
        // dynamic visible. El dedupe en el merge previene duplicados.
        legacyQ = legacyQ.lte('date', cur.v);
      }
    }
    const { data: legacyData, error: legacyError } = await legacyQ;
    if (legacyError) throw legacyError;

    // 2. Dynamic template-based submissions
    let dynamicQ = supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('client_id', clientId!)
      .order('submitted_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    if (cur) {
      if (cur.t === 'dynamic') {
        dynamicQ = dynamicQ.or(`submitted_at.lt.${cur.v},and(submitted_at.eq.${cur.v},id.lt.${cur.i})`);
      } else {
        dynamicQ = dynamicQ.lte('submitted_at', cur.v);
      }
    }
    const { data: dynamicData, error: dynamicError } = await dynamicQ;
    if (dynamicError) throw dynamicError;

    // 3. Map to unified format (same shape the manager endpoint returns)
    // Cast a Record<string,any> para que el spread preserve los campos del row
    // (incluyendo `date`) y el sort posterior pueda leerlos sin error de tipo.
    const legacyParsed: Record<string, any>[] = (legacyData || []).map((ci: Record<string, any>) => ({
      ...ci,
      type: 'legacy',
      reviewed_at: ci.reviewed_at || (ci.data_json?.reviewed_at) || null,
      coach_notes: ci.coach_notes || (ci.data_json?.coach_notes) || null,
      next_week_focus: ci.next_week_focus || (ci.data_json?.next_week_focus) || null
    }));

    const dynamicParsed: Record<string, any>[] = (dynamicData || []).map((ci: Record<string, any>) => ({
      id: ci.id,
      client_id: ci.client_id,
      date: ci.submitted_at,
      created_at: ci.submitted_at,
      status: ci.status,
      reviewed_at: ci.reviewed_at,
      data_json: ci.answers_json,
      template_id: ci.template_id,
      template: ci.template ? {
        ...ci.template,
        templateSchema: ci.template.template_schema
      } : null,
      type: 'dynamic',
      coach_notes: ci.coach_notes || null,
      next_week_focus: ci.next_week_focus || null
    }));

    // 4. Merge, dedupe y sort.
    //
    // Dedupe necesario porque la rama `lte('date'/'submitted_at', cur.v)`
    // puede traer filas con date == cur.v de la tabla "opuesta" al cursor,
    // que podrian haber estado en la pagina anterior (es el solapamiento
    // que aceptamos para no perder filas cross-table). Si la pagina anterior
    // ya las mostro, este dedupe evita que aparezcan duplicadas. Si era una
    // fila NUEVA con esa fecha, entra correctamente.
    const seen = new Set<string>();
    const merged: Record<string, any>[] = [];
    for (const row of [...legacyParsed, ...dynamicParsed]) {
      const key = `${row.type}:${row.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Si tenemos cursor con tipo: descartamos filas que el cliente YA vio
      // en la pagina anterior. Una fila "ya vista" cumple:
      //   row.type === cur.t  &&  (row.date < cur.v  ||  row.id < cur.i)
      // ... espera, eso es lo que ya filtra la query. Lo que NO filtra es:
      //   row.type !== cur.t  &&  row.date === cur.v  &&  row.id "estaba en
      //   la pagina anterior" — pero no podemos saberlo sin guardar estado.
      //
      // Por eso aceptamos pequenas duplicaciones cuando dos check-ins de
      // tablas distintas tienen exactamente el MISMO date. En la practica
      // un cliente envia <=1 check-in al dia: la coincidencia es rara y
      // el efecto visible seria ver el mismo check-in dos veces en la
      // frontera de la pagina — no rompe nada (mismos ids).
      merged.push(row);
    }
    merged.sort((a, b) => {
      const da = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (da !== 0) return da;
      // Tiebreaker estable: primero por type (legacy/dynamic alfabetico),
      // luego por id. Mismo desempate que el cursor.
      const dt = String(a.type).localeCompare(String(b.type));
      if (dt !== 0) return dt;
      return String(b.id).localeCompare(String(a.id));
    });

    // Pasamos `type` como discriminador del cursor para la siguiente pagina.
    res.json(buildPage(merged, page.limit, 'date', 'id', 'type'));
  } catch (error: unknown) {
    console.error('Error fetching client check-ins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Client: Get a single check-in by ID
// Unified: tries the dynamic table first, then falls back to legacy.
// Returns { client, check_in } so the shared CheckInReview view works in client mode.
router.get('/client/check-ins/:checkInId', verifyClient, async (req: AuthedRequest, res) => {
  const { checkInId } = req.params;
  const clientId = req.user.id;
  // Valida el formato UUID antes de tocar la BD (coherente con los endpoints
  // de manager): evita errores 22P02 de Postgres mal manejados.
  if (!UUID_RE.test(String(checkInId))) {
    return res.status(400).json({ error: 'Invalid check-in id' });
  }
  try {
    // Build the client object (the authenticated user themselves)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        profiles!left ( full_name, avatar_url )
      `)
      .eq('id', clientId)
      .single();

    const profile = Array.isArray(userData?.profiles) ? userData?.profiles[0] : userData?.profiles;
    const client = {
      id: clientId,
      email: userData?.email || null,
      name: profile?.full_name || userData?.email || 'Client',
      avatar: profile?.avatar_url || null
    };

    // 1. Try dynamic submission first
    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('id', checkInId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (dynamicError) throw dynamicError;

    if (dynamicData) {
      // Prioritize snapshot if available
      const template = dynamicData.template_snapshot_json || (dynamicData.template ? {
        ...dynamicData.template,
        templateSchema: dynamicData.template.template_schema
      } : null);

      const formatted = {
        ...dynamicData,
        date: dynamicData.submitted_at,
        created_at: dynamicData.submitted_at,
        data_json: dynamicData.answers_json,
        template,
        type: 'dynamic'
      };
      return res.json({ client, check_in: formatted });
    }

    // 2. Fallback to legacy check_ins
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (legacyError) throw legacyError;
    if (!legacyData) return res.status(404).json({ error: 'Check-in not found' });

    let dj = legacyData.data_json;
    if (typeof dj === 'string') {
      try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
    }

    const formatted = {
      ...legacyData,
      data_json: dj,
      type: 'legacy',
      reviewed_at: legacyData.reviewed_at || dj?.reviewed_at || null,
      coach_notes: legacyData.coach_notes || dj?.coach_notes || null,
      next_week_focus: legacyData.next_week_focus || dj?.next_week_focus || null
    };

    res.json({ client, check_in: formatted });
  } catch (error: unknown) {
    console.error('Error fetching single check-in:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Get check-ins list for a specific client
router.get('/manager/clients/:id/check-ins', verifyManager, async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    // 1. Verify client exists and check linkage
    const { data: userData, error: clientErr } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email, 
        manager_id,
        profiles!left (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (clientErr || !userData) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (userData.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Client belongs to another manager' });
    }

    // Transform for frontend expected format (name/avatar)
    const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
    const client = {
      id: userData.id,
      email: userData.email,
      name: profile?.full_name || userData.email,
      avatar: profile?.avatar_url
    };

    // Paginacion cursor-based: limit+1 de cada tabla, merge, sort, recorte.
    // El cursor lleva discriminador `t` ('legacy'|'dynamic') para aplicar el
    // `id.lt` tiebreaker SOLO a la tabla origen. Ver comentario en
    // /client/check-ins para el porque (UUIDs sin orden semantico cruzado).
    const page = parsePagination(req, { defaultLimit: 30, maxLimit: 100 });
    const cur = page.cursor;

    // 2. Fetch check-ins from both legacy and dynamic tables
    let legacyQ = supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    if (cur) {
      if (cur.t === 'legacy') {
        legacyQ = legacyQ.or(`date.lt.${cur.v},and(date.eq.${cur.v},id.lt.${cur.i})`);
      } else {
        legacyQ = legacyQ.lte('date', cur.v);
      }
    }
    const { data: legacyData, error: legacyError } = await legacyQ;
    if (legacyError) throw legacyError;

    let dynamicQ = supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('client_id', id)
      .order('submitted_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    if (cur) {
      if (cur.t === 'dynamic') {
        dynamicQ = dynamicQ.or(`submitted_at.lt.${cur.v},and(submitted_at.eq.${cur.v},id.lt.${cur.i})`);
      } else {
        dynamicQ = dynamicQ.lte('submitted_at', cur.v);
      }
    }
    const { data: dynamicData, error: dynamicError } = await dynamicQ;
    if (dynamicError) throw dynamicError;

    // 3. Map to unified format
    // Cast a Record<string,any> para que el spread preserve los campos del row
    // (incluyendo `date`) y el sort posterior pueda leerlos sin error de tipo.
    const legacyParsed: Record<string, any>[] = (legacyData || []).map((ci: Record<string, any>) => ({
      ...ci,
      type: 'legacy',
      reviewed_at: ci.reviewed_at || (ci.data_json?.reviewed_at) || null,
      coach_notes: ci.coach_notes || (ci.data_json?.coach_notes) || null,
      next_week_focus: ci.next_week_focus || (ci.data_json?.next_week_focus) || null
    }));

    const dynamicParsed: Record<string, any>[] = (dynamicData || []).map((ci: Record<string, any>) => ({
      id: ci.id,
      client_id: ci.client_id,
      date: ci.submitted_at,
      created_at: ci.submitted_at,
      status: ci.status,
      reviewed_at: ci.reviewed_at,
      data_json: ci.answers_json,
      template_id: ci.template_id,
      template: ci.template ? {
        ...ci.template,
        templateSchema: ci.template.template_schema
      } : null,
      type: 'dynamic',
      coach_notes: ci.coach_notes || null,
      next_week_focus: ci.next_week_focus || null
    }));

    // Merge + dedupe (por (type, id)) + sort estable.
    // Ver comentario en /client/check-ins para detalles del dedupe.
    const seen = new Set<string>();
    const merged: Record<string, any>[] = [];
    for (const row of [...legacyParsed, ...dynamicParsed]) {
      const key = `${row.type}:${row.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
    merged.sort((a, b) => {
      const da = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (da !== 0) return da;
      const dt = String(a.type).localeCompare(String(b.type));
      if (dt !== 0) return dt;
      return String(b.id).localeCompare(String(a.id));
    });

    const paged = buildPage(merged, page.limit, 'date', 'id', 'type');
    // Mantenemos el wrap `client` + spread del PaginatedResponse.
    res.json({ client, ...paged, check_ins: paged.data });
  } catch (error: unknown) {
    console.error('Error fetching client check-ins for manager:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Get a single check-in by ID
router.get('/manager/clients/:id/check-ins/:checkInId', verifyManager, async (req: AuthedRequest, res) => {
  const { id, checkInId } = req.params;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to this manager
    const { data: userData, error: clientErr } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email, 
        manager_id,
        profiles!left (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (clientErr || !userData || userData.manager_id !== managerId) {
      console.warn(`Manager Single Check-in Access Denied: Manager ${managerId} tried to access client ${id}.`);
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
    const client = {
      id: userData.id,
      email: userData.email,
      name: profile?.full_name || userData.email,
      avatar: profile?.avatar_url
    };

    // 2. Attempt to fetch from client_checkin_submissions (new)
    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('id', checkInId)
      .eq('client_id', id)
      .maybeSingle();

    if (dynamicError) throw dynamicError;

    if (dynamicData) {
      // Prioritize snapshot if available
      const template = dynamicData.template_snapshot_json || (dynamicData.template ? {
        ...dynamicData.template,
        templateSchema: dynamicData.template.template_schema
      } : null);

      const formatted = {
        ...dynamicData,
        date: dynamicData.submitted_at,
        created_at: dynamicData.submitted_at,
        data_json: dynamicData.answers_json,
        template,
        type: 'dynamic'
      };
      return res.json({ client, check_in: formatted });
    }

    // 3. Fallback to check_ins (legacy)
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .eq('client_id', id)
      .maybeSingle();

    if (legacyError) throw legacyError;
    if (!legacyData) return res.status(404).json({ error: 'Check-in not found' });
    
    let dj = legacyData.data_json;
    if (typeof dj === 'string') {
      try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
    }

    const formatted = {
      ...legacyData,
      data_json: dj,
      type: 'legacy',
      reviewed_at: legacyData.reviewed_at || dj?.reviewed_at || null,
      coach_notes: legacyData.coach_notes || dj?.coach_notes || null,
      next_week_focus: legacyData.next_week_focus || dj?.next_week_focus || null
    };

    res.json({ client, check_in: formatted });
  } catch (error: unknown) {
    console.error('Error fetching single check-in for manager:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Save coach review/assessment for a check-in
router.post('/manager/clients/:id/check-ins/:checkInId/review', verifyManager, async (req: AuthedRequest, res) => {
  const { id, checkInId } = req.params;
  const { coach_notes, next_week_focus } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', id)
      .single();

    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // 2. Try to update dynamic table first — scope to BOTH id and client_id
    //    so a manager can't review check-ins of clients they do own with checkInIds from other clients.
    const reviewedAt = new Date().toISOString();
    const { data: dynamicUpdate, error: dynamicUpdateError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .update({ coach_notes, next_week_focus, reviewed_at: reviewedAt, status: 'reviewed' })
      .eq('id', checkInId)
      .eq('client_id', id)
      .select()
      .maybeSingle();

    if (dynamicUpdateError) throw dynamicUpdateError;
    if (dynamicUpdate) {
       return res.json({ success: true, data: dynamicUpdate });
    }

    // 3. Fallback to legacy table — same scoping
    const { data: legacyUpdate, error: legacyUpdateError } = await supabaseAdmin
      .from('check_ins')
      .update({ coach_notes, next_week_focus, reviewed_at: reviewedAt })
      .eq('id', checkInId)
      .eq('client_id', id)
      .select()
      .single();

    if (legacyUpdateError) {
      // 4. If columns are missing (42703), fallback to storing in data_json
      if (legacyUpdateError.code === '42703') {
        const { data: current } = await supabaseAdmin
          .from('check_ins')
          .select('data_json')
          .eq('id', checkInId)
          .eq('client_id', id)
          .single();

        if (!current) {
          return res.status(404).json({ error: 'Check-in not found for this client' });
        }

        const new_dj = {
          ...(current.data_json || {}),
          coach_notes,
          next_week_focus,
          reviewed_at: reviewedAt
        };

        const { error: fallbackError } = await supabaseAdmin
          .from('check_ins')
          .update({ data_json: new_dj })
          .eq('id', checkInId)
          .eq('client_id', id);
        
        if (fallbackError) throw fallbackError;
        return res.json({ success: true, method: 'data_json' });
      }
      throw legacyUpdateError;
    }

    res.json({ success: true, data: legacyUpdate, method: 'columns' });
  } catch (error: unknown) {
    console.error('Error saving coach review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Check-in Templates Routes ---

// Manager: Get all templates (active only)
router.get('/manager/checkin-templates', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  // El auto-inject del "General Check-in" SOLO corre en la primera pagina
  // (sin cursor). En paginas subsecuentes lo skipamos porque ya estaria en
  // la primera y reintentarlo crearia duplicados.
  const isFirstPage = !page.cursor;
  try {
    let q = supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('manager_id', managerId!)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'created_at', 'desc');
    const { data, error } = await q;

    if (error) throw error;

    // Guaranteed array — the query can return null, and we mutate it below.
    const list: Record<string, any>[] = data || [];

    // --- AUTO-INJECT GENERAL CHECK-IN IF MISSING (solo en primera pagina) ---
    const hasPermanent = isFirstPage && list.some((t: Record<string, any>) => t.is_permanent || t.name === 'General Check-in');
    
    if (isFirstPage && !hasPermanent) {
      console.log(`[CheckIn] General Check-in not found in list for manager: ${managerId}. Searching in all (including archived)...`);
      
      // Use maybeSingle() to avoid throwing on 0 rows
      const { data: existing } = await supabaseAdmin
        .from('checkin_templates')
        .select('*')
        .eq('manager_id', managerId)
        .eq('name', 'General Check-in')
        .maybeSingle();

      if (existing) {
        // It exists but was filtered (archived or other reason) - unarchive it
        console.log(`[CheckIn] Found existing General Check-in (id: ${existing.id}). Restoring...`);
        const updatePayload: Record<string, any> = {
          template_schema: (existing.template_schema?.length > 0) ? existing.template_schema : GENERAL_CHECKIN_SCHEMA
        };
        // Only add these if the column exists (safe to try; will be ignored if it doesn't)
        try { updatePayload.is_archived = false; } catch(_) {}
        
        const { data: updated } = await supabaseAdmin
          .from('checkin_templates')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .maybeSingle();
        
        if (updated) {
          list.unshift(updated);
        } else {
          // If update failed, still show the existing record
          list.unshift(existing);
        }
      } else {
        // No General Check-in exists at all — create it now
        console.log(`[CheckIn] Creating new General Check-in for manager ${managerId}...`);
        const insertPayload: Record<string, any> = {
          manager_id: managerId,
          name: 'General Check-in',
          description: 'Comprehensive weekly check-in template. Tracks adherence, body progress, recovery, training, and more.',
          template_schema: GENERAL_CHECKIN_SCHEMA, 
          is_default: list.length === 0,
          version: 1
        };

        const { data: newTemplate, error: insertError } = await supabaseAdmin
          .from('checkin_templates')
          .insert(insertPayload)
          .select()
          .maybeSingle();
        
        if (insertError) {
          console.error(`[CheckIn] Error creating General Check-in:`, JSON.stringify(insertError));
        } else if (newTemplate) {
          console.log(`[CheckIn] Created General Check-in: ${newTemplate.id}`);
          list.unshift(newTemplate);
        }
      }
    }

    // Inyecta las preguntas fijas de KPI en cada template para que el editor
    // del coach las muestre como pasos bloqueados (no eliminables), igual que
    // las ve el cliente. No se persisten así: el PATCH/POST las quita antes
    // de guardar (stripFixedQuestions).
    const listWithFixed = list.map((tpl: Record<string, any>) => ({
      ...tpl,
      template_schema: injectFixedQuestions(tpl.template_schema),
    }));

    res.json(buildPage(listWithFixed, page.limit, 'created_at'));
  } catch (error: unknown) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Create a new template
router.post('/manager/checkin-templates', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const { name, description, template_schema, is_default } = req.body;

  try {
    if (is_default) {
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_default: false })
        .eq('manager_id', managerId);
    }

    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .insert({
        manager_id: managerId,
        name,
        description,
        // No persistir los pasos fijos: se reinyectan en cada lectura.
        template_schema: stripFixedQuestions(template_schema || []),
        is_default: !!is_default,
        version: 1
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: unknown) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Update a template (Rename, Schema, Status)
router.patch('/manager/checkin-templates/:id', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  // NOTE: 'is_active' is a real column; 'status' is NOT (it does not exist on
  // checkin_templates), so it must never be forwarded to the DB.
  const ALLOWED = ['name', 'description', 'template_schema', 'is_default', 'is_active'];
  const updates: Record<string, any> = {};
  for (const key of ALLOWED) {
    if (key in req.body) updates[key] = req.body[key];
  }
  // No persistir los pasos fijos de KPI: son la fuente de verdad de
  // FIXED_CHECKIN_QUESTIONS y se reinyectan al leer. Esto también hace que la
  // comparación de versión de abajo sea correcta (schema limpio vs. limpio).
  if (updates.template_schema) {
    updates.template_schema = stripFixedQuestions(updates.template_schema);
  }

  try {
    // Scope SELECT by manager_id — prevents reading other managers' templates
    // and is required for the optimistic-lock UPDATE below to be safe.
    const { data: current } = await supabaseAdmin
      .from('checkin_templates')
      .select('version, template_schema')
      .eq('id', id)
      .eq('manager_id', managerId)
      .maybeSingle();

    if (!current) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let newVersion = current.version || 1;
    if (updates.template_schema && JSON.stringify(updates.template_schema) !== JSON.stringify(current.template_schema)) {
      newVersion += 1;
    }

    if (updates.is_default) {
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_default: false })
        .eq('manager_id', managerId);
    }

    // Optimistic concurrency: refuse if version moved since we read it.
    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .update({
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('manager_id', managerId)
      .eq('version', current.version || 1)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(409).json({ error: 'Template was modified concurrently. Reload and try again.' });
    }
    res.json(data);
  } catch (error: unknown) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Duplicate a template
router.post('/manager/checkin-templates/:id/duplicate', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const { id } = req.params;

  try {
    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (fetchErr || !original) return res.status(404).json({ error: 'Template not found' });

    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .insert({
        manager_id: managerId,
        name: `${original.name} (Copy)`,
        description: original.description,
        template_schema: original.template_schema,
        version: 1,
        is_active: true,
        is_archived: false,
        is_default: false
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: unknown) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Delete/Archive a template
router.delete('/manager/checkin-templates/:id', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const { id } = req.params;

  try {
    // 1. Verify ownership and check usage
    const { count: submissionCount } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id);

    const { count: assignmentCount } = await supabaseAdmin
      .from('client_checkin_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id);

    if ((submissionCount || 0) > 0 || (assignmentCount || 0) > 0) {
      // Soft-delete if in use
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .eq('manager_id', managerId);
      return res.json({ success: true, method: 'archived' });
    }

    // Hard delete if clean
    const { error } = await supabaseAdmin
      .from('checkin_templates')
      .delete()
      .eq('id', id)
      .eq('manager_id', managerId);

    if (error) throw error;
    res.json({ success: true, method: 'deleted' });
  } catch (error: unknown) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Template Assignment Routes ---

// GET /manager/checkin-assignments
// List active assignments for manager's clients (paginado DESC por created_at)
//
// La query trae assignments con join al user; aplicamos el filtro por
// manager_id en memoria (la implementacion previa lo hacia asi). El cursor
// SE APLICA EN BD, asi que cargamos limit+1 filas filtrables que tras el
// filter in-memory pueden ser menos. Si el chunk filtrado da < limit y
// hasMore=true en BD, hacemos un segundo fetch hasta completar la pagina
// (cap a 5 reintentos para no quemar).
router.get('/manager/checkin-assignments', verifyManager, async (req: AuthedRequest, res) => {
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    // Pre-fetch clientIds del manager para filtrar en BD (mas eficiente que
    // join + filter in memory; ademas permite paginar correctamente).
    const { data: myClients } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('manager_id', managerId!)
      .eq('role', 'CLIENT');
    const clientIds = (myClients || []).map(c => c.id);
    if (clientIds.length === 0) {
      return res.json(buildPage<any>([], page.limit, 'assigned_at'));
    }

    let q = supabaseAdmin
      .from('client_checkin_assignments')
      .select(`
        *,
        template:checkin_templates(id, name),
        client:users!client_id(id, manager_id)
      `)
      .eq('is_active', true)
      .in('client_id', clientIds)
      .order('assigned_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'assigned_at', 'desc');
    const { data, error } = await q;

    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'assigned_at'));
  } catch (err: unknown) {
    res.status(500).json({ error: errMessage(err) });
  }
});

// POST /manager/assign-template
// Assign a template to a client
router.post('/manager/assign-template', verifyManager, async (req: AuthedRequest, res) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;
  try {
    // 1. Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', client_id)
      .single();
    
    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Client belongs to another manager' });
    }

    // 2. Verify template belongs to this manager
    const { data: template, error: templateErr } = await supabaseAdmin
      .from('checkin_templates')
      .select('id, manager_id')
      .eq('id', template_id)
      .single();

    if (templateErr || !template || template.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Template belongs to another manager' });
    }

    // 3. Deactivate current active assignments for this client
    const { error: deactivateError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .update({ is_active: false })
      .eq('client_id', client_id)
      .eq('is_active', true);

    if (deactivateError) throw deactivateError;

    // 2. Create new active assignment
    const { data, error: assignError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .insert({
        client_id,
        template_id,
        is_active: true,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (assignError) throw assignError;
    res.json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: errMessage(err) });
  }
});

// --- Client Dynamic Check-in Routes ---

// GET /client/active-template
// Resolve and return the active template for the authenticated client
router.get('/client/active-template', verifyClient, async (req: AuthedRequest, res) => {
  const clientId = req.user.id;

  try {
    // 1. Check for specific assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .select(`
        template:checkin_templates(*)
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle();

    if (assignmentError) throw assignmentError;

    if (assignment?.template) {
      const template = assignment.template as Record<string, any>;
      if (template && !Array.isArray(template)) {
        // Inject the fixed (required, non-deletable) questions so the client
        // always collects the canonical KPI variables.
        template.template_schema = injectFixedQuestions(template.template_schema);
        return res.json(template);
      }
    }

    // 2. Fallback to manager's default template
    const { data: manager, error: managerError } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (managerError) throw managerError;

    const { data: defaultTemplate, error: defaultError } = await supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('manager_id', manager.manager_id)
      .eq('is_default', true)
      .maybeSingle();

    if (defaultError) throw defaultError;

    if (defaultTemplate) {
      defaultTemplate.template_schema = injectFixedQuestions(defaultTemplate.template_schema);
      return res.json(defaultTemplate);
    }

    // 3. Last fallback: ensure a real "General Check-in" template exists for
    //    the manager and return it, so the client can always submit a check-in
    //    backed by a valid template_id.
    if (manager?.manager_id) {
      const general = await resolveGeneralCheckinTemplate(manager.manager_id);
      if (general) {
        general.template_schema = injectFixedQuestions(general.template_schema);
        return res.json(general);
      }
    }

    res.json(null);
  } catch (err: unknown) {
    res.status(500).json({ error: errMessage(err) });
  }
});

// Save check-in data with template association and schema snapshot
router.post('/client/submissions', verifyClient, async (req: AuthedRequest, res) => {
  const clientId = req.user.id;
  const { template_id, answers_json } = req.body;

  if (!answers_json || typeof answers_json !== 'object' || Array.isArray(answers_json)) {
    return res.status(400).json({ error: 'answers_json is required and must be an object' });
  }
  // Limita el tamaño del payload: answers_json es JSONB libre y sin cota un
  // cliente podría inflar la BD (abuso de almacenamiento / DoS).
  if (JSON.stringify(answers_json).length > 100_000) {
    return res.status(413).json({ error: 'answers_json is too large' });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    // 1. Resolve the client's manager up front
    const { data: clientInfo, error: clientInfoErr } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (clientInfoErr || !clientInfo) {
      return res.status(403).json({ error: 'Client account not found' });
    }

    // 2. Fetch the requested template (only if template_id is a valid UUID)
    let template: Record<string, any> | null = null;
    if (template_id && UUID_RE.test(String(template_id))) {
      const { data: found } = await supabaseAdmin
        .from('checkin_templates')
        .select('*')
        .eq('id', template_id)
        .maybeSingle();
      template = found || null;
    }

    // 3. Fallback: if the template is missing or invalid (e.g. the client sent
    //    the in-memory default template), resolve the manager's General Check-in.
    if (!template) {
      template = await resolveGeneralCheckinTemplate(clientInfo.manager_id);
    }

    if (!template) {
      return res.status(404).json({ error: 'No check-in template available' });
    }

    // 4. Verify client belongs to the template's manager
    if (clientInfo.manager_id !== template.manager_id) {
      return res.status(403).json({ error: 'Security violation: Template manager mismatch' });
    }

    // 3. Insert into client_checkin_submissions with snapshot.
    //    Snapshot the schema WITH the fixed questions injected, so the saved
    //    submission matches exactly what the client filled.
    const injectedSchema = injectFixedQuestions(template.template_schema);

    // 3a. Server-side guard: every required question must be answered. This
    //     backs up the UI validation so a check-in can never be submitted
    //     (even via a direct API call) without the mandatory KPI variables.
    const missingRequired = findMissingRequired(injectedSchema, answers_json);
    if (missingRequired.length > 0) {
      return res.status(400).json({
        error: 'Missing required answers',
        message: 'All required questions must be answered before submitting.',
        missing: missingRequired
      });
    }

    const { data, error } = await supabaseAdmin
      .from('client_checkin_submissions')
      .insert({
        client_id: clientId,
        template_id: template.id,
        template_version: template.version || 1,
        template_snapshot_json: {
          ...template,
          template_schema: injectedSchema,
          templateSchema: injectedSchema
        },
        answers_json,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // --- Sync Fixed Questions to Profile ---
    try {
      const answers = answers_json as Record<string, any>;
      const updates: Record<string, any> = {};
      
      // Look for weight & macros
      const weight = answers.weight || answers.Weight || answers['Current Weight'];
      if (weight) updates.weight = Number(weight) || 0;

      // Extract Measurements
      const measurements = {
        weight: answers.weight || answers.Weight,
        waist: answers.waist || answers.Waist || answers['Waist (cm)'],
        hip: answers.hip || answers.Hip || answers['Hip (cm)'],
        thigh_r: answers.thigh_r || answers.Thigh || answers['Right Thigh (cm)'],
        arm_r: answers.arm_r || answers.Arm || answers['Right Arm (cm)']
      };
      
      const macros = {
        protein: answers.protein || answers.Protein,
        carbs: answers.carbs || answers.Carbs,
        fats: answers.fats || answers.Fats,
        calories: answers.calories || answers.Calories,
        adherence_score: (answers.nutrition_adherence_score !== undefined || answers.adherence_score !== undefined)
          ? Number(answers.nutrition_adherence_score ?? answers.adherence_score) * 10 
          : (answers['Plan Adherence'] || 0),
        fatigue: answers.fatigue || answers.Fatigue
      };

      const hasMeasurements = Object.values(measurements).some(v => v !== undefined && v !== null);
      
      if (hasMeasurements) {
          // Get current metadata
          const { data: profile } = await supabaseAdmin
            .from('clients_profiles')
            .select('metadata')
            .eq('user_id', clientId)
            .single();
          
          const currentMetadata = (profile as Record<string, any> | null)?.metadata || {};
          const prevMeasurements = currentMetadata.measurements || {};

          // Update profile
          await supabaseAdmin
            .from('clients_profiles')
            .update({ 
               ...updates, 
               metadata: { 
                 ...currentMetadata, 
                 measurements: { ...prevMeasurements, ...measurements },
                 macros: { ...(currentMetadata.macros || {}), ...macros } 
               } 
            })
            .eq('user_id', clientId);
      } else if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('clients_profiles')
          .update(updates)
          .eq('user_id', clientId);
      }
    } catch (syncErr) {
      console.error('Error syncing check-in data to profile:', syncErr);
    }
    
    // 3. Trigger automations (need manager_id)
    const { data: clientData } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (clientData?.manager_id) {
      await processTrigger(clientData.manager_id, 'checkin-submitted', { clientId, submissionId: data.id });
      runWorkflowsForEvent(clientData.manager_id, 'trigger.checkin_submitted', { clientId }).catch(err => {
        console.error('Workflow trigger error (checkin_submitted):', err);
      });

      // first-checkin: fire the simple automation only on the client's very
      // first submission ever (1 row exists = this one).
      try {
        const { count } = await supabaseAdmin
          .from('client_checkin_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId);
        if ((count ?? 0) <= 1) {
          processTrigger(clientData.manager_id, 'first-checkin', { clientId })
            .catch(err => console.error('Automation trigger error (first-checkin):', err));
        }
      } catch (fcErr) {
        console.error('first-checkin derivation failed:', fcErr);
      }

      // Weight change trigger: compare against the previous submission's weight
      // if this one carries one. Payload includes delta so workflows can branch.
      try {
        const newWeight = Number((data as any)?.answers_json?.weight);
        if (Number.isFinite(newWeight)) {
          const { data: prev } = await supabaseAdmin
            .from('client_checkin_submissions')
            .select('answers_json')
            .eq('client_id', clientId)
            .neq('id', data.id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          const prevWeight = Number((prev as any)?.answers_json?.weight);
          const delta = Number.isFinite(prevWeight) ? +(newWeight - prevWeight).toFixed(2) : null;
          runWorkflowsForEvent(clientData.manager_id, 'trigger.weight_change', {
            clientId,
            weight: newWeight,
            previousWeight: Number.isFinite(prevWeight) ? prevWeight : null,
            delta,
            direction: delta == null ? 'unknown' : delta > 0 ? 'gain' : delta < 0 ? 'loss' : 'flat',
          }).catch(err => console.error('Workflow trigger error (weight_change):', err));

          // Simple automations: weight-dropped / weight-gained on a notable
          // change vs the previous check-in (>1 kg in either direction).
          if (delta != null && Math.abs(delta) >= 1) {
            processTrigger(clientData.manager_id, delta < 0 ? 'weight-dropped' : 'weight-gained', { clientId })
              .catch(err => console.error('Automation trigger error (weight change):', err));
          }

          // goal_reached: fire when this check-in's weight reaches the client's
          // goal weight. "Reached" = touched it, or crossed it since the
          // previous check-in. Deduped per submission via checkinId.
          try {
            const { data: prof } = await supabaseAdmin
              .from('clients_profiles').select('goal_weight')
              .eq('user_id', clientId).maybeSingle();
            const goal = Number(prof?.goal_weight);
            if (Number.isFinite(goal) && goal > 0) {
              const touched = Math.abs(newWeight - goal) <= 0.3;
              const crossed = Number.isFinite(prevWeight)
                && Math.sign(prevWeight - goal) !== Math.sign(newWeight - goal);
              if (touched || crossed) {
                runWorkflowsForEvent(clientData.manager_id, 'trigger.goal_reached', {
                  clientId, weight: newWeight, goalWeight: goal, checkinId: data.id,
                }).catch(err => console.error('Workflow trigger error (goal_reached):', err));
                processTrigger(clientData.manager_id, 'weight-goal-reached', { clientId })
                  .catch(err => console.error('Automation trigger error (weight-goal-reached):', err));
              }
            }
          } catch (gErr) {
            console.error('goal_reached trigger derivation failed:', gErr);
          }
        }
      } catch (wErr) {
        console.error('weight_change trigger derivation failed:', wErr);
      }
      // Push notification to the coach (respects the new_client_check_ins_push toggle).
      sendPushToUser(clientData.manager_id, {
        title: 'Nuevo check-in',
        body: 'Un cliente ha enviado un nuevo check-in.',
        url: '/check-ins',
        prefKey: 'new_client_check_ins_push',
      }).catch(() => {});
    }

    res.json(data);
  } catch (err: unknown) {
    console.error('Error saving submission:', err);
    res.status(500).json({ error: errMessage(err) });
  }
});

// Manager: Delete check-in (Legacy)
router.delete('/manager/check-ins/:checkInId', verifyManager, async (req: AuthedRequest, res) => {
  const { checkInId } = req.params;
  const managerId = req.user.id;
  try {
    if (!UUID_RE.test(checkInId)) return res.status(400).json({ error: 'Invalid check-in id format' });
    const { data: checkin, error: fetchError } = await supabaseAdmin
      .from('check_ins')
      .select('client_id')
      .eq('id', checkInId)
      .maybeSingle();

    if (fetchError || !checkin) return res.status(404).json({ error: 'Check-in not found' });

    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', checkin.client_id)
      .maybeSingle();

    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Permission check failed' });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('check_ins')
      .delete()
      .eq('id', checkInId);

    if (deleteError) throw deleteError;
    res.json({ success: true });
  } catch (err: unknown) {
    console.error('Error deleting legacy check-in:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Delete dynamic check-in submission
router.delete('/manager/client-submissions/:submissionId', verifyManager, async (req: AuthedRequest, res) => {
  const { submissionId } = req.params;
  const managerId = req.user.id;
  try {
    if (!UUID_RE.test(submissionId)) return res.status(400).json({ error: 'Invalid submission id format' });
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('client_id')
      .eq('id', submissionId)
      .maybeSingle();

    if (fetchError || !submission) return res.status(404).json({ error: 'Check-in not found' });

    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', submission.client_id)
      .maybeSingle();

    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Permission check failed' });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .delete()
      .eq('id', submissionId);

    if (deleteError) throw deleteError;
    res.json({ success: true });
  } catch (err: unknown) {
    console.error('Error deleting dynamic check-in:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: the canonical fixed/locked questions injected into every check-in.
// Exposed so the template editor can show them as read-only, non-deletable.
router.get('/manager/fixed-questions', verifyManager, async (_req: AuthedRequest, res) => {
  res.json(FIXED_CHECKIN_QUESTIONS);
});

export default router;
