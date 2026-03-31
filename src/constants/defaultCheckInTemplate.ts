import { CheckInTemplate } from '../types/checkIn';

export const DEFAULT_CHECKIN_TEMPLATE: CheckInTemplate = {
  id: 'default-template-1',
  key: 'weekly_checkin',
  name: 'Standard Weekly Check-in',
  version: 1,
  templateSchema: [
    {
      id: 'general_sentiment',
      title: 'How did your week go overall?',
      subtitle: 'Your general sentiment sets the context for everything else.',
      icon: 'mood',
      questions: [
        {
          id: 'overallWeek',
          type: 'single_choice',
          title: 'Select Sentiment',
          options: ['Very bad', 'Bad', 'Average', 'Good', 'Excellent']
        },
        {
          id: 'matchPlan',
          type: 'single_choice',
          title: 'How closely did this week match the plan?',
          options: ['Not at all', 'Slightly', 'Moderately', 'Mostly', 'Completely']
        },
        {
          id: 'mentalHealth',
          type: 'single_choice',
          title: 'How did you feel mentally this week?',
          options: ['Very overwhelmed', 'A bit overwhelmed', 'Neutral', 'Focused', 'Very good']
        },
        {
          id: 'consistency',
          type: 'single_choice',
          title: 'How consistent did you feel overall?',
          options: ['Very inconsistent', 'Inconsistent', 'Average', 'Consistent', 'Very consistent']
        },
        {
          id: 'contextChips',
          type: 'multi_select',
          title: 'Key Influencers',
          options: ['Stress', 'Travel', 'Busy week', 'Sick', 'Good routine', 'Low motivation', 'Great energy', 'Social events', 'Family commitments', 'Work / studies', 'Poor sleep', 'Anxiety', 'Menstrual cycle', 'Poor routine']
        },
        {
          id: 'weekNotes',
          type: 'long_text',
          title: 'Additional Context (Optional)',
          placeholder: 'Briefly describe any major events or feelings...'
        }
      ]
    },
    {
      id: 'body_progress',
      title: 'Body Progress',
      subtitle: 'Track your physical metrics and how you feel in your own skin.',
      icon: 'monitoring',
      questions: [
        {
          id: 'weight',
          type: 'number',
          title: 'Current Weight (kg)',
          unit: 'KG',
          placeholder: '00.0'
        },
        {
          id: 'avgWeight',
          type: 'number',
          title: 'Average Weekly Weight (kg)',
          unit: 'KG',
          placeholder: '00.0'
        },
        {
          id: 'bodyPerception',
          type: 'single_choice',
          title: 'Body Perception',
          options: ['Leaner', 'Same', 'More bloated', 'Stronger look', 'Softer', 'Defined', 'Flatter', 'Fuller', 'Tighter waist', 'More watery']
        },
        {
          id: 'visibleChanges',
          type: 'single_choice',
          title: 'Did you notice any visible changes?',
          options: ['No changes', 'Slight', 'Moderate', 'Big changes']
        },
        {
          id: 'biggestChangeArea',
          type: 'single_choice',
          title: 'Where did you notice the biggest change?',
          options: ['Waist', 'Stomach', 'Legs', 'Glutes', 'Arms', 'Back', 'Face', 'Overall', 'Hard to tell']
        },
        {
          id: 'satisfaction',
          type: 'single_choice',
          title: 'How satisfied are you with your current progress?',
          options: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied']
        },
        {
          id: 'menstrualImpact',
          type: 'single_choice',
          title: 'Menstrual / hormonal impact this week',
          options: ['No impact', 'Mild', 'Moderate', 'Strong', 'N/A']
        },
        {
          id: 'measurements',
          type: 'measurement_group',
          title: 'Measurements (Optional)',
          options: ['Waist', 'Hips', 'Chest', 'Arms', 'Thighs']
        },
        {
          id: 'photos',
          type: 'photo_group',
          title: 'Progress Photos (Front, Side, Back)',
          options: ['photoFront', 'photoSide', 'photoBack']
        }
      ]
    },
    {
      id: 'nutrition_adherence',
      title: 'Nutrition Adherence',
      subtitle: 'How consistently did you follow your fuel plan?',
      icon: 'restaurant',
      questions: [
        {
          id: 'adherence_score',
          type: 'slider',
          title: 'Plan Adherence Score',
          subtitle: 'On a scale of 1-10, how closely did you follow the plan?',
          required: true,
          is_fixed: true,
          meta: { min: 1, max: 10, step: 1 }
        },
        {
          id: 'nutritionAdherence',
          type: 'single_choice',
          title: 'Weekly Compliance (Overall %)',
          options: ['Perfect (>95%)', 'Good (80-95%)', 'Average (50-80%)', 'Poor (<50%)']
        },
        {
          id: 'mealsFollowed',
          type: 'single_choice',
          title: 'How many meals did you follow as planned?',
          options: ['Almost all', 'Most', 'About half', 'Few', 'Almost none']
        },
        {
          id: 'hitCalories',
          type: 'single_choice',
          title: 'Did you hit your calorie target?',
          options: ['Yes, daily', 'Mostly', 'Above', 'Below', 'No track']
        },
        {
          id: 'hitProtein',
          type: 'single_choice',
          title: 'Did you hit your protein target?',
          options: ['Yes, daily', 'Most days', 'Sometimes', 'Rarely', 'Unknown']
        },
        {
          id: 'offPlanCount',
          type: 'single_choice',
          title: 'How often did you eat off-plan?',
          options: ['Never', '1–2 meals', '3–4', '5+', 'Many']
        },
        {
          id: 'skippedMeals',
          type: 'single_choice',
          title: 'Did you skip any meals?',
          options: ['Never', '1–2 times', 'A few', 'Frequently']
        },
        {
          id: 'trackingAccuracy',
          type: 'single_choice',
          title: 'Did you track your food accurately?',
          options: ['Accurately', 'Mostly', 'Estimate', 'Barely', 'No track']
        },
        {
          id: 'hardestMeal',
          type: 'single_choice',
          title: 'Which meal was hardest to follow?',
          options: ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Night', 'Weekend', 'All same']
        },
        {
          id: 'adherenceObstacles',
          type: 'multi_select',
          title: 'What made adherence harder?',
          options: ['Hunger', 'Cravings', 'Social events', 'Eating out', 'Stress', 'Anxiety', 'No time', 'Poor planning', 'Travel', 'Low motivation', 'Boredom with meals', 'Family environment']
        },
        {
          id: 'digestiveIssues',
          type: 'long_text',
          title: 'Nutrition Notes & Observations',
          placeholder: 'Any specific meals you struggled with? ...'
        }
      ]
    },
    {
      id: 'digestion_satiety',
      title: 'Digestion & Satiety',
      subtitle: 'Internal biofeedback is key to adjusting your plan.',
      icon: 'health_and_safety',
      questions: [
        {
          id: 'hunger',
          type: 'single_choice',
          title: 'Hunger Levels',
          options: ['Very low', 'Low', 'Manageable', 'High', 'Extreme']
        },
        {
          id: 'cravings',
          type: 'single_choice',
          title: 'Cravings Intensity',
          options: ['None', 'Mild', 'Moderate', 'Strong', 'Unstoppable']
        },
        {
          id: 'cravingsTime',
          type: 'single_choice',
          title: 'At what time were cravings strongest?',
          options: ['Morning', 'Midday', 'Afternoon', 'Evening', 'Night', 'Random']
        },
        {
          id: 'digestionQuality',
          type: 'single_choice',
          title: 'Digestion Quality',
          options: ['Excellent', 'Good', 'Okay', 'Poor', 'Very poor']
        },
        {
          id: 'bloatingLevel',
          type: 'single_choice',
          title: 'Bloating Level',
          options: ['None', 'Mild', 'Moderate', 'Strong', 'Constant']
        },
        {
          id: 'bowelRegularity',
          type: 'single_choice',
          title: 'Bowel Movement Regularity',
          options: ['Regular', 'Mildly irregular', 'Irregular', 'Constipated', 'Loose']
        },
        {
          id: 'fullnessResponse',
          type: 'single_choice',
          title: 'Fullness After Meals',
          options: ['Not full', 'Satisfied', 'Very full', 'Too heavy']
        },
        {
          id: 'energyResponse',
          type: 'single_choice',
          title: 'Energy Response After Meals',
          options: ['Better', 'Stable', 'Sleepy', 'Heavy', 'Crashes']
        },
        {
          id: 'digestiveSymptoms',
          type: 'multi_select',
          title: 'Any Digestive Symptoms?',
          options: ['Gas', 'Acid reflux', 'Abdominal pain', 'Constipation', 'Loose stools', 'Nausea', 'Intolerance', 'None']
        },
        {
          id: 'foodNotes',
          type: 'long_text',
          title: 'Additional Food & Digestion Notes',
          placeholder: 'Tell us more about your digestion...'
        }
      ]
    },
    {
      id: 'daily_foundations',
      title: 'Daily Foundations',
      subtitle: 'The small habits that drive the big results.',
      icon: 'water_drop',
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
      id: 'training_performance',
      title: 'Training Performance',
      subtitle: 'Analyze your physical execution and strength levels.',
      icon: 'fitness_center',
      questions: [
        { id: 'trainingAdherence', type: 'single_choice', title: 'Training Adherence', options: ['All sessions', 'Missed 1', 'Missed 2', 'Missed several', 'Didn\'t train'] },
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
      id: 'recovery_sleep',
      title: 'Recovery & Sleep',
      subtitle: 'The foundation of your progress happens while you rest.',
      icon: 'dark_mode',
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
      id: 'pain_tracking',
      title: 'Injury & Pain Tracking',
      subtitle: 'Your safety is our priority. Report any discomfort immediately.',
      icon: 'healing',
      questions: [
        { id: 'painLevel', type: 'single_choice', title: 'Current Pain / Discomfort Level', options: ['No issues', 'Minor discomfort', 'Moderate pain', 'Serious issue'] },
        { 
          id: 'affectedArea', 
          type: 'single_choice', 
          title: 'Affected Area', 
          options: ['Neck', 'Shoulder', 'Upper back', 'Lower back', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Foot', 'Abdomen', 'Other'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'painType', 
          type: 'single_choice', 
          title: 'Type of Issue', 
          options: ['Pain', 'Tightness', 'Inflammation', 'Fatigue', 'Injury', 'Mobility restriction', 'Digestive', 'Other'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'trainingImpact', 
          type: 'single_choice', 
          title: 'Impact on Training', 
          options: ['No impact', 'Small impact', 'Moderate', 'Couldn\'t train properly', 'Had to stop'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'painDuration', 
          type: 'single_choice', 
          title: 'Duration', 
          options: ['Just this week', 'A few days', '1–2 weeks', '2+ weeks', 'Chronic'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'painProgression', 
          type: 'single_choice', 
          title: 'Progression', 
          options: ['Improved', 'Stayed same', 'Got worse'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'modifiedTraining', 
          type: 'single_choice', 
          title: 'Did you modify training?', 
          options: ['Yes', 'No'],
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        },
        { 
          id: 'painNotes', 
          type: 'long_text', 
          title: 'Describe what happened & Details', 
          placeholder: 'How did it start? ...',
          conditional: { field: 'painLevel', operator: 'not_equals', value: 'No issues' }
        }
      ]
    },
    {
      id: 'activity_movement',
      title: 'Activity & Movement',
      subtitle: 'Tracking your non-exercise activity and cardio adherence.',
      icon: 'directions_run',
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
      id: 'looking_ahead',
      title: 'Looking Ahead',
      subtitle: 'Define your focus for the upcoming week.',
      icon: 'flag',
      questions: [
        { id: 'improvementGoals', type: 'multi_select', title: 'Primary Focus Areas', options: ['Nutrition adherence', 'Hunger management', 'Meal prep / organization', 'Training intensity', 'Technique / form', 'Sleep hygiene', 'Stress management', 'Activity (Steps/Cardio)', 'Daily habits / Routine', 'Mental focus', 'Social events management'] },
        { id: 'nonNegotiables', type: 'long_text', title: 'What are your absolute non-negotiables?', placeholder: '3 things you WILL get done no matter what...' },
        { id: 'reviewNotes', type: 'long_text', title: 'Coach Review Request', placeholder: 'Anything specific your coach should analyze...' },
        { id: 'supportNeeded', type: 'long_text', title: 'Support Needed', placeholder: 'How can your coach best support you?' },
        { id: 'readiness', type: 'single_choice', title: 'Next Week Readiness', options: ['Not ready', 'Somewhat ready', 'Ready', 'Very ready'] }
      ]
    }
  ]
};
