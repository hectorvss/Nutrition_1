/**
 * Bilingual layer for check-in & onboarding templates.
 *
 * The default / fixed templates are authored in English (server seeds + the
 * `defaultCheckInTemplate` constant). This module provides a flat English→
 * Spanish dictionary plus `localizeSchema()`, which deep-walks any template
 * schema and swaps every known title / subtitle / placeholder / option into
 * the requested language at render time.
 *
 * Live switching: renderers call `localizeSchema(schema, language)` inside a
 * `useMemo([schema, language])`, so toggling the app language re-localizes
 * instantly with no re-fetch. Unknown strings (manager-authored custom
 * questions) pass through untouched.
 *
 * `measurement_group` / `photo_group` options are field KEYS (e.g. 'waist',
 * 'photoFront'), never display labels — `localizeSchema` never translates
 * those option arrays. Their question `title` is still localized.
 */

// English → Spanish for every string used by the fixed + default templates.
export const TEMPLATE_ES: Record<string, string> = {
  // ── Step titles ──────────────────────────────────────────────────────────
  'Body Metrics': 'Métricas corporales',
  'Nutrition Adherence': 'Adherencia nutricional',
  'Daily Macros': 'Macros diarios',
  'Wellbeing & Recovery': 'Bienestar y recuperación',
  'Training Performance': 'Rendimiento en el entrenamiento',
  'Activity & Lifestyle': 'Actividad y estilo de vida',
  'How did your week go overall?': '¿Cómo te ha ido la semana en general?',
  'Body Perception & Photos': 'Percepción corporal y fotos',
  'Nutrition Details': 'Detalles de nutrición',
  'Digestion & Satiety': 'Digestión y saciedad',
  'Daily Foundations': 'Hábitos diarios',
  'Recovery & Sleep': 'Recuperación y sueño',
  'Injury & Pain Tracking': 'Seguimiento de lesiones y dolor',
  'Activity & Movement': 'Actividad y movimiento',
  'Looking Ahead': 'Mirando hacia delante',
  'Body Progress': 'Progreso corporal',
  'Core Information': 'Información básica',
  'Dietary & Health': 'Dieta y salud',
  'Initial Measurements': 'Medidas iniciales',

  // ── Step subtitles ───────────────────────────────────────────────────────
  'These power your weight, body-fat and measurement charts':
    'Alimentan tus gráficas de peso, grasa corporal y medidas',
  'How consistently did you follow your fuel plan?':
    '¿Con qué constancia seguiste tu plan de alimentación?',
  'Your average daily nutrition intake': 'Tu ingesta nutricional media diaria',
  'Rate each from 1 (lowest) to 10 (highest)':
    'Puntúa cada uno del 1 (más bajo) al 10 (más alto)',
  'Rate your training week from 1 (lowest) to 10 (highest)':
    'Puntúa tu semana de entrenamiento del 1 (más bajo) al 10 (más alto)',
  'Movement and habits outside of your training sessions':
    'Movimiento y hábitos fuera de tus sesiones de entrenamiento',
  'Your general sentiment sets the context for everything else.':
    'Tu sensación general da contexto a todo lo demás.',
  'Track your physical changes and progress photos.':
    'Registra tus cambios físicos y fotos de progreso.',
  'Track specific adherence metrics and feedback.':
    'Registra métricas de adherencia específicas y comentarios.',
  'Internal biofeedback is key to adjusting your plan.':
    'El biofeedback interno es clave para ajustar tu plan.',
  'The small habits that drive the big results.':
    'Los pequeños hábitos que generan los grandes resultados.',
  'Analyze your physical execution and strength levels.':
    'Analiza tu ejecución física y tus niveles de fuerza.',
  'The foundation of your progress happens while you rest.':
    'La base de tu progreso ocurre mientras descansas.',
  'Your safety is our priority. Report any discomfort immediately.':
    'Tu seguridad es nuestra prioridad. Informa de cualquier molestia de inmediato.',
  'Tracking your non-exercise activity and cardio adherence.':
    'Seguimiento de tu actividad fuera del entrenamiento y adherencia al cardio.',
  'Define your focus for the upcoming week.':
    'Define tu enfoque para la próxima semana.',
  'Track your physical metrics and how you feel in your own skin.':
    'Registra tus métricas físicas y cómo te sientes contigo mismo.',
  'Basic data for your profile': 'Datos básicos para tu perfil',
  'Nutritional preferences and health status':
    'Preferencias nutricionales y estado de salud',
  'Base metrics for progress tracking':
    'Métricas base para el seguimiento del progreso',

  // ── Question titles ──────────────────────────────────────────────────────
  'Current Weight (kg)': 'Peso actual (kg)',
  'Body Fat %': '% de grasa corporal',
  'Body Measurements (cm)': 'Medidas corporales (cm)',
  'Plan Adherence (1-10)': 'Adherencia al plan (1-10)',
  'On a scale of 1-10, how closely did you follow the plan?':
    'En una escala del 1 al 10, ¿con qué precisión seguiste el plan?',
  'Avg. Daily Protein (g)': 'Proteína diaria media (g)',
  'Avg. Daily Carbs (g)': 'Carbohidratos diarios medios (g)',
  'Avg. Daily Fats (g)': 'Grasas diarias medias (g)',
  'Avg. Daily Calories (kcal)': 'Calorías diarias medias (kcal)',
  'Energy Level (1-10)': 'Nivel de energía (1-10)',
  'Stress Level (1-10)': 'Nivel de estrés (1-10)',
  'Mood (1-10)': 'Estado de ánimo (1-10)',
  'Motivation (1-10)': 'Motivación (1-10)',
  'Fatigue Level (1-10)': 'Nivel de fatiga (1-10)',
  'Avg. Sleep per Night (hours)': 'Sueño medio por noche (horas)',
  'Sleep Quality (1-10)': 'Calidad del sueño (1-10)',
  'Training Adherence (1-10)': 'Adherencia al entrenamiento (1-10)',
  'How many of your planned sessions did you complete?':
    '¿Cuántas de tus sesiones planificadas completaste?',
  'Training Intensity (1-10)': 'Intensidad del entrenamiento (1-10)',
  'Overall effort / intensity of your sessions':
    'Esfuerzo / intensidad general de tus sesiones',
  'Avg. Daily Steps': 'Pasos diarios medios',
  'Hydration (1-10)': 'Hidratación (1-10)',
  'How well did you hit your daily water goal?':
    '¿Cómo de bien alcanzaste tu objetivo diario de agua?',
  'Alcohol Intake': 'Consumo de alcohol',
  'Supplement Adherence': 'Adherencia a los suplementos',
  'Select Sentiment': 'Selecciona cómo te sientes',
  'How closely did this week match the plan?':
    '¿Cuánto se ajustó esta semana al plan?',
  'How did you feel mentally this week?':
    '¿Cómo te sentiste mentalmente esta semana?',
  'How consistent did you feel overall?':
    '¿Cómo de constante te sentiste en general?',
  'Key Influencers': 'Factores clave',
  'Additional Context (Optional)': 'Contexto adicional (opcional)',
  'Body Perception': 'Percepción corporal',
  'Did you notice any visible changes?':
    '¿Notaste algún cambio visible?',
  'Where did you notice the biggest change?':
    '¿Dónde notaste el mayor cambio?',
  'How satisfied are you with your current progress?':
    '¿Cómo de satisfecho estás con tu progreso actual?',
  'Menstrual / hormonal impact this week':
    'Impacto menstrual / hormonal esta semana',
  'Progress Photos (Front, Side, Back)':
    'Fotos de progreso (frente, lateral, espalda)',
  'Average Weekly Weight (kg)': 'Peso medio semanal (kg)',
  'Measurements (Optional)': 'Medidas (opcional)',
  'Measurements (cm)': 'Medidas (cm)',
  'Weekly Compliance (Overall %)': 'Cumplimiento semanal (% general)',
  'How many meals did you follow as planned?':
    '¿Cuántas comidas seguiste según lo planificado?',
  'Did you hit your calorie target?':
    '¿Alcanzaste tu objetivo de calorías?',
  'Did you hit your protein target?':
    '¿Alcanzaste tu objetivo de proteína?',
  'How often did you eat off-plan?':
    '¿Con qué frecuencia comiste fuera del plan?',
  'Did you skip any meals?': '¿Te saltaste alguna comida?',
  'Did you track your food accurately?':
    '¿Registraste tu comida con precisión?',
  'Which meal was hardest to follow?':
    '¿Qué comida fue la más difícil de seguir?',
  'What made adherence harder?':
    '¿Qué dificultó la adherencia?',
  'Nutrition Notes & Observations':
    'Notas y observaciones sobre nutrición',
  'Plan Adherence Score': 'Puntuación de adherencia al plan',
  'Hunger Levels': 'Niveles de hambre',
  'Cravings Intensity': 'Intensidad de los antojos',
  'At what time were cravings strongest?':
    '¿A qué hora fueron más intensos los antojos?',
  'Digestion Quality': 'Calidad de la digestión',
  'Bloating Level': 'Nivel de hinchazón',
  'Bowel Movement Regularity': 'Regularidad intestinal',
  'Fullness After Meals': 'Saciedad después de las comidas',
  'Energy Response After Meals':
    'Respuesta de energía después de las comidas',
  'Any Digestive Symptoms?': '¿Algún síntoma digestivo?',
  'Additional Food & Digestion Notes':
    'Notas adicionales sobre comida y digestión',
  'Hydration Consistency': 'Constancia en la hidratación',
  'Approximate daily water intake':
    'Ingesta diaria de agua aproximada',
  'Supplements Consistency': 'Constancia con los suplementos',
  'Meal timing consistency':
    'Constancia en los horarios de las comidas',
  'Eating out frequency': 'Frecuencia de comer fuera',
  'Alcohol intake': 'Consumo de alcohol',
  'Snacking outside plan': 'Picoteo fuera del plan',
  'Routine structure this week':
    'Estructura de la rutina esta semana',
  'Daily Habit Notes (Optional)':
    'Notas sobre hábitos diarios (opcional)',
  'Training Adherence': 'Adherencia al entrenamiento',
  'Overall Strength Perception':
    'Percepción general de fuerza',
  'Energy during training':
    'Energía durante el entrenamiento',
  'Session Quality & Connection':
    'Calidad y conexión de la sesión',
  'Recovery between sessions':
    'Recuperación entre sesiones',
  'Did you hit prescribed intensity?':
    '¿Alcanzaste la intensidad prescrita?',
  'General Performance Trend':
    'Tendencia general de rendimiento',
  'Why did performance drop?':
    '¿Por qué bajó el rendimiento?',
  'Exercise wins': 'Logros en los ejercicios',
  'Struggles or Painful movements':
    'Dificultades o movimientos dolorosos',
  'Additional Training Notes':
    'Notas adicionales sobre el entrenamiento',
  'Sleep Quantity': 'Cantidad de sueño',
  'Sleep Quality': 'Calidad del sueño',
  'Sleep Interruptions': 'Interrupciones del sueño',
  'Sleep Schedule Consistency':
    'Constancia en el horario de sueño',
  'Stress Level': 'Nivel de estrés',
  'Energy Level': 'Nivel de energía',
  'Motivation': 'Motivación',
  'General Fatigue': 'Fatiga general',
  'What affected your recovery the most?':
    '¿Qué afectó más a tu recuperación?',
  'Recovery & Motivation Notes (Optional)':
    'Notas sobre recuperación y motivación (opcional)',
  'Current Pain / Discomfort Level':
    'Nivel actual de dolor / molestia',
  'Affected Area': 'Zona afectada',
  'Type of Issue': 'Tipo de problema',
  'Impact on Training': 'Impacto en el entrenamiento',
  'Duration': 'Duración',
  'Progression': 'Progresión',
  'Did you modify training?':
    '¿Modificaste el entrenamiento?',
  'Describe what happened & Details':
    'Describe qué ocurrió y los detalles',
  'Cardio Adherence': 'Adherencia al cardio',
  'Daily Steps (Average Range)':
    'Pasos diarios (rango medio)',
  'Was cardio performance normal?':
    '¿El rendimiento en el cardio fue normal?',
  'General Activity Level': 'Nivel de actividad general',
  'Were activities limited by anything?':
    '¿Algo limitó tus actividades?',
  'Felt more tired than usual?':
    '¿Te sentiste más cansado de lo habitual?',
  'Activity Notes (Optional)': 'Notas de actividad (opcional)',
  'Primary Focus Areas': 'Áreas de enfoque principales',
  'What are your absolute non-negotiables?':
    '¿Cuáles son tus innegociables absolutos?',
  'Coach Review Request': 'Petición de revisión al coach',
  'Support Needed': 'Apoyo necesario',
  'Next Week Readiness': 'Preparación para la próxima semana',
  'Age': 'Edad',
  'Gender': 'Género',
  'Current Height (cm)': 'Altura actual (cm)',
  'Primary Goal': 'Objetivo principal',
  'Target Weight (kg)': 'Peso objetivo (kg)',
  'Estimated Body Fat %': '% de grasa corporal estimado',
  'Dietary Style': 'Estilo de alimentación',
  'Allergies / Intolerances': 'Alergias / intolerancias',
  'Current Supplementation': 'Suplementación actual',

  // ── Placeholders ─────────────────────────────────────────────────────────
  'Briefly describe any major events or feelings...':
    'Describe brevemente cualquier evento o sensación importante...',
  'Any specific meals you struggled with? ...':
    '¿Alguna comida concreta con la que tuviste dificultades? ...',
  'Tell us more about your digestion...':
    'Cuéntanos más sobre tu digestión...',
  'Anything related to hydration...':
    'Cualquier cosa relacionada con la hidratación...',
  'Did any exercise feel especially strong?':
    '¿Algún ejercicio se sintió especialmente fuerte?',
  'Did any exercise feel awkward?':
    '¿Algún ejercicio se sintió incómodo?',
  'Any additional feedback...':
    'Cualquier comentario adicional...',
  'Anything that affected sleep...':
    'Cualquier cosa que afectara al sueño...',
  'How did it start? ...': '¿Cómo empezó? ...',
  'Anything related to movement...':
    'Cualquier cosa relacionada con el movimiento...',
  '3 things you WILL get done no matter what...':
    '3 cosas que VAS a cumplir pase lo que pase...',
  'Anything specific your coach should analyze...':
    'Cualquier cosa concreta que tu coach deba analizar...',
  'How can your coach best support you?':
    '¿Cómo puede apoyarte mejor tu coach?',
  'List any allergies or intolerances...':
    'Indica cualquier alergia o intolerancia...',
  'List supplements you are currently taking, or "None"...':
    'Indica los suplementos que tomas actualmente, o «Ninguno»...',

  // ── Options — sentiment / generic scales ─────────────────────────────────
  'Very bad': 'Muy mal',
  'Bad': 'Mal',
  'Average': 'Normal',
  'Good': 'Bien',
  'Excellent': 'Excelente',
  'Not at all': 'Nada',
  'Slightly': 'Un poco',
  'Moderately': 'Moderadamente',
  'Mostly': 'En su mayoría',
  'Completely': 'Completamente',
  'Very overwhelmed': 'Muy agobiado',
  'A bit overwhelmed': 'Algo agobiado',
  'Neutral': 'Neutral',
  'Focused': 'Concentrado',
  'Very good': 'Muy bien',
  'Very inconsistent': 'Muy inconstante',
  'Inconsistent': 'Inconstante',
  'Consistent': 'Constante',
  'Very consistent': 'Muy constante',

  // ── Options — context chips / influencers ────────────────────────────────
  'Stress': 'Estrés',
  'Travel': 'Viajes',
  'Busy week': 'Semana ajetreada',
  'Sick': 'Enfermo',
  'Good routine': 'Buena rutina',
  'Low motivation': 'Poca motivación',
  'Great energy': 'Mucha energía',
  'Social events': 'Eventos sociales',
  'Family commitments': 'Compromisos familiares',
  'Work / studies': 'Trabajo / estudios',
  'Poor sleep': 'Mal sueño',
  'Anxiety': 'Ansiedad',
  'Menstrual cycle': 'Ciclo menstrual',
  'Poor routine': 'Mala rutina',

  // ── Options — body perception ────────────────────────────────────────────
  'Leaner': 'Más definido',
  'Same': 'Igual',
  'More bloated': 'Más hinchado',
  'Stronger look': 'Aspecto más fuerte',
  'Softer': 'Más blando',
  'Defined': 'Definido',
  'Flatter': 'Más plano',
  'Fuller': 'Más lleno',
  'Tighter waist': 'Cintura más estrecha',
  'More watery': 'Más retención de líquidos',
  'No changes': 'Sin cambios',
  'Slight': 'Leve',
  'Moderate': 'Moderado',
  'Big changes': 'Grandes cambios',
  'Waist': 'Cintura',
  'Stomach': 'Abdomen',
  'Legs': 'Piernas',
  'Glutes': 'Glúteos',
  'Arms': 'Brazos',
  'Back': 'Espalda',
  'Face': 'Cara',
  'Overall': 'En general',
  'Hard to tell': 'Difícil de saber',
  'Very dissatisfied': 'Muy insatisfecho',
  'Dissatisfied': 'Insatisfecho',
  'Satisfied': 'Satisfecho',
  'Very satisfied': 'Muy satisfecho',
  'No impact': 'Sin impacto',
  'Mild': 'Leve',
  'Strong': 'Fuerte',
  'N/A': 'N/D',

  // ── Options — nutrition compliance ───────────────────────────────────────
  'Perfect (>95%)': 'Perfecto (>95%)',
  'Good (80-95%)': 'Bueno (80-95%)',
  'Average (50-80%)': 'Normal (50-80%)',
  'Poor (<50%)': 'Bajo (<50%)',
  'Almost all': 'Casi todas',
  'Most': 'La mayoría',
  'About half': 'Aproximadamente la mitad',
  'Few': 'Pocas',
  'Almost none': 'Casi ninguna',
  'Yes, daily': 'Sí, a diario',
  'Above': 'Por encima',
  'Below': 'Por debajo',
  'No track': 'Sin registro',
  'Most days': 'La mayoría de los días',
  'Sometimes': 'A veces',
  'Rarely': 'Casi nunca',
  'Unknown': 'No lo sé',
  'Never': 'Nunca',
  '1–2 meals': '1–2 comidas',
  '3–4': '3–4',
  '5+': '5+',
  'Many': 'Muchas',
  '1–2 times': '1–2 veces',
  'A few': 'Algunas',
  'Frequently': 'Con frecuencia',
  'Accurately': 'Con precisión',
  'Estimate': 'A estima',
  'Barely': 'Apenas',
  'Breakfast': 'Desayuno',
  'Lunch': 'Comida',
  'Snack': 'Snack',
  'Dinner': 'Cena',
  'Night': 'Noche',
  'Weekend': 'Fin de semana',
  'All same': 'Todas igual',
  'Hunger': 'Hambre',
  'Cravings': 'Antojos',
  'Eating out': 'Comer fuera',
  'No time': 'Falta de tiempo',
  'Poor planning': 'Mala planificación',
  'Boredom with meals': 'Aburrimiento con las comidas',
  'Family environment': 'Entorno familiar',

  // ── Options — digestion ──────────────────────────────────────────────────
  'Very low': 'Muy bajo',
  'Low': 'Bajo',
  'Manageable': 'Llevadero',
  'High': 'Alto',
  'Extreme': 'Extremo',
  'None': 'Ninguno',
  'Unstoppable': 'Incontrolable',
  'Morning': 'Mañana',
  'Midday': 'Mediodía',
  'Afternoon': 'Tarde',
  'Evening': 'Noche temprana',
  'Random': 'Aleatorio',
  'Okay': 'Aceptable',
  'Poor': 'Mala',
  'Very poor': 'Muy mala',
  'Constant': 'Constante',
  'Regular': 'Regular',
  'Mildly irregular': 'Algo irregular',
  'Irregular': 'Irregular',
  'Constipated': 'Estreñido',
  'Loose': 'Suelto',
  'Not full': 'Sin saciedad',
  'Very full': 'Muy lleno',
  'Too heavy': 'Demasiado pesado',
  'Better': 'Mejor',
  'Stable': 'Estable',
  'Sleepy': 'Somnoliento',
  'Heavy': 'Pesado',
  'Crashes': 'Bajones',
  'Gas': 'Gases',
  'Acid reflux': 'Reflujo ácido',
  'Abdominal pain': 'Dolor abdominal',
  'Constipation': 'Estreñimiento',
  'Loose stools': 'Heces sueltas',
  'Nausea': 'Náuseas',
  'Intolerance': 'Intolerancia',

  // ── Options — hydration / habits ─────────────────────────────────────────
  'Met goal daily': 'Cumplí el objetivo a diario',
  'Met most days': 'Lo cumplí la mayoría de días',
  'Struggled': 'Me costó',
  '<1L': '<1 L',
  '1–1.5L': '1–1,5 L',
  '1.5–2L': '1,5–2 L',
  '2–3L': '2–3 L',
  '3L+': '3 L+',
  'Took all': 'Los tomé todos',
  'Missed some': 'Me salté algunos',
  'Missed most': 'Me salté la mayoría',
  'Mostly consistent': 'Bastante constante',
  'Very chaotic': 'Muy caótico',
  '5+ times': '5+ veces',
  'Occasionally': 'Ocasionalmente',
  'Daily': 'A diario',
  'Very structured': 'Muy estructurada',
  'Fairly structured': 'Bastante estructurada',
  'Chaotic days': 'Días caóticos',

  // ── Options — training ───────────────────────────────────────────────────
  'All sessions': 'Todas las sesiones',
  'Missed 1': 'Me salté 1',
  'Missed 2': 'Me salté 2',
  'Missed several': 'Me salté varias',
  "Didn't train": 'No entrené',
  'Down': 'A la baja',
  'Up': 'Al alza',
  'Yes': 'Sí',
  'No': 'No',
  'Much worse': 'Mucho peor',
  'Slightly worse': 'Algo peor',
  'Slightly better': 'Algo mejor',
  'Much better': 'Mucho mejor',
  'Low calories': 'Pocas calorías',
  'Pain': 'Dolor',
  'Bad recovery': 'Mala recuperación',
  'Too much fatigue': 'Demasiada fatiga',

  // ── Options — sleep / recovery ───────────────────────────────────────────
  '<5h': '<5 h',
  '5–6h': '5–6 h',
  '6–7h': '6–7 h',
  '7–8h': '7–8 h',
  '8h+': '8 h+',
  'Almost every night': 'Casi cada noche',
  'Work': 'Trabajo',
  'Studies': 'Estudios',
  'Family': 'Familia',
  'Late meals': 'Comidas tardías',
  'Screen time': 'Tiempo de pantallas',
  'High training fatigue': 'Mucha fatiga del entrenamiento',
  'Under-eating': 'Comer poco',

  // ── Options — pain ───────────────────────────────────────────────────────
  'No issues': 'Sin problemas',
  'Minor discomfort': 'Molestia leve',
  'Moderate pain': 'Dolor moderado',
  'Serious issue': 'Problema serio',
  'Neck': 'Cuello',
  'Shoulder': 'Hombro',
  'Upper back': 'Espalda alta',
  'Lower back': 'Espalda baja',
  'Elbow': 'Codo',
  'Wrist': 'Muñeca',
  'Hip': 'Cadera',
  'Knee': 'Rodilla',
  'Ankle': 'Tobillo',
  'Foot': 'Pie',
  'Abdomen': 'Abdomen',
  'Other': 'Otro',
  'Tightness': 'Tensión',
  'Inflammation': 'Inflamación',
  'Fatigue': 'Fatiga',
  'Injury': 'Lesión',
  'Mobility restriction': 'Restricción de movilidad',
  'Digestive': 'Digestivo',
  'Small impact': 'Impacto pequeño',
  "Couldn't train properly": 'No pude entrenar bien',
  'Had to stop': 'Tuve que parar',
  'Just this week': 'Solo esta semana',
  'A few days': 'Unos días',
  '1–2 weeks': '1–2 semanas',
  '2+ weeks': '2+ semanas',
  'Chronic': 'Crónico',
  'Improved': 'Mejoró',
  'Stayed same': 'Se mantuvo igual',
  'Got worse': 'Empeoró',

  // ── Options — activity ───────────────────────────────────────────────────
  'Did all': 'Lo hice todo',
  'Very little': 'Muy poco',
  'Did none': 'No hice nada',
  '<4k': '<4 k',
  '4k–6k': '4 k–6 k',
  '6k–8k': '6 k–8 k',
  '8k–10k': '8 k–10 k',
  '10k+': '10 k+',
  'Normal': 'Normal',
  'Worse': 'Peor',
  'Sedentary': 'Sedentario',
  'Bad weather': 'Mal tiempo',
  'Pain / discomfort': 'Dolor / molestia',
  'No limitation': 'Sin limitación',

  // ── Options — looking ahead ──────────────────────────────────────────────
  'Nutrition adherence': 'Adherencia nutricional',
  'Hunger management': 'Gestión del hambre',
  'Meal prep / organization': 'Preparación / organización de comidas',
  'Training intensity': 'Intensidad del entrenamiento',
  'Technique / form': 'Técnica / ejecución',
  'Sleep hygiene': 'Higiene del sueño',
  'Stress management': 'Gestión del estrés',
  'Activity (Steps/Cardio)': 'Actividad (pasos/cardio)',
  'Daily habits / Routine': 'Hábitos diarios / rutina',
  'Mental focus': 'Enfoque mental',
  'Social events management': 'Gestión de eventos sociales',
  'Not ready': 'No preparado',
  'Somewhat ready': 'Algo preparado',
  'Ready': 'Preparado',
  'Very ready': 'Muy preparado',

  // ── Options — activity & alcohol & supplements (fixed step) ──────────────
  'All': 'Todos',
  'Some': 'Algunos',

  // ── Options — onboarding ─────────────────────────────────────────────────
  'Male': 'Hombre',
  'Female': 'Mujer',
  'Vegan': 'Vegana',
  'Vegetarian': 'Vegetariana',
  'Keto': 'Keto',
  'Paleo': 'Paleo',
  'Omnivore': 'Omnívora',
  'No preference': 'Sin preferencia',
};

const OPTION_KEY_TYPES = new Set(['measurement_group', 'photo_group']);

const tr = (s: unknown, lang: string): unknown => {
  if (lang !== 'es' || typeof s !== 'string') return s;
  return TEMPLATE_ES[s] ?? s;
};

/**
 * Deep-localizes a check-in / onboarding template schema. Returns a NEW array
 * (never mutates the input). For `lang !== 'es'` the schema is returned as-is.
 */
export function localizeSchema<T = any>(schema: T, lang: string): T {
  if (lang !== 'es' || !Array.isArray(schema)) return schema;
  return (schema as any[]).map((step) => {
    if (!step || typeof step !== 'object') return step;
    const localized: any = {
      ...step,
      title: tr(step.title, lang),
      subtitle: tr(step.subtitle, lang),
    };
    if (Array.isArray(step.questions)) {
      localized.questions = step.questions.map((q: any) => {
        if (!q || typeof q !== 'object') return q;
        const lq: any = {
          ...q,
          title: tr(q.title, lang),
          subtitle: tr(q.subtitle, lang),
          placeholder: tr(q.placeholder, lang),
        };
        // Only translate option arrays that hold display labels — never the
        // field-key arrays of measurement_group / photo_group.
        if (Array.isArray(q.options) && !OPTION_KEY_TYPES.has(q.type)) {
          lq.options = q.options.map((o: unknown) => tr(o, lang));
        }
        // Keep conditional.value in sync with the (now localized) option
        // values it is compared against — otherwise a conditional question
        // would mis-evaluate (e.g. show the pain detail when there is none).
        if (q.conditional && typeof q.conditional === 'object' && typeof q.conditional.value === 'string') {
          lq.conditional = { ...q.conditional, value: tr(q.conditional.value, lang) };
        }
        return lq;
      });
    }
    return localized;
  }) as T;
}

/**
 * Localizes a full template object, handling both `templateSchema` and
 * `template_schema` shapes used across the codebase.
 */
export function localizeTemplate<T extends Record<string, any>>(template: T | null | undefined, lang: string): T | null | undefined {
  if (!template || lang !== 'es') return template;
  const out: any = { ...template };
  if (Array.isArray(template.templateSchema)) out.templateSchema = localizeSchema(template.templateSchema, lang);
  if (Array.isArray(template.template_schema)) out.template_schema = localizeSchema(template.template_schema, lang);
  return out;
}
