export interface PlanFamily {
  id: string;
  key: string;
  label: string;
  planningTemplateId: string;
  nutritionTemplateId: number;
  trainingTemplateId: string;
}

export const PLAN_FAMILIES: PlanFamily[] = [
  {
    id: 'f1',
    key: 'fat_loss',
    label: 'Fat Loss Focus',
    planningTemplateId: 'pt1',
    nutritionTemplateId: 1, // Fat Loss Basic
    trainingTemplateId: 'p4', // Pérdida de Grasa
  },
  {
    id: 'f2',
    key: 'recomposition',
    label: 'Body Recomposition',
    planningTemplateId: 'pt2',
    nutritionTemplateId: 2, // Active Maintain
    trainingTemplateId: 'p2', // Fuerza Regular
  },
  {
    id: 'f3',
    key: 'muscle_gain',
    label: 'Muscle Gain / Bulking',
    planningTemplateId: 'pt3',
    nutritionTemplateId: 3, // Moderate Gain
    trainingTemplateId: 'p5', // Hipertrofia
  },
  {
    id: 'f4',
    key: 'performance',
    label: 'Sport Performance',
    planningTemplateId: 'pt4',
    nutritionTemplateId: 5, // Athlete Perform
    trainingTemplateId: 'p7', // Resistencia
  },
  {
    id: 'f5',
    key: 'lifestyle',
    label: 'Lifestyle & Health',
    planningTemplateId: 'pt5',
    nutritionTemplateId: 2, // Active Maintain (Standard)
    trainingTemplateId: 'p6', // Movilidad & Recuperación
  }
];

export const getRecommendationsByPlanningId = (planningId: string) => {
  const family = PLAN_FAMILIES.find(f => f.planningTemplateId === planningId);
  if (!family) return null;
  return {
    nutritionTemplateId: family.nutritionTemplateId,
    trainingTemplateId: family.trainingTemplateId,
    familyKey: family.key,
    familyLabel: family.label
  };
};
