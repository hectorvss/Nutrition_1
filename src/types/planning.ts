// --- TYPES ---

export interface BlockStrategicDetails {
  summary: string;
  primaryObjective: string;
  secondaryObjectives: string[];
  trainingVolume?: string;
  trainingIntensity?: string;
  cardio?: string;
  kpis: string[];
  successCriteria: string[];
  coachNotes: string;
  risksAndConstraints: string[];
  // Extended fields for specific strategies
  kcal?: string;
  macros?: string;
  freq?: string;
  water?: string;
  trainingFocus?: string;
  sessions?: string;
  deload?: string;
  intensityTargets?: string[];
}

export interface RoadmapBlock {
  id: string;
  type: 'nutrition' | 'training';
  title: string;
  startWeek: number;
  endWeek: number;
  duration: number;
  colorToken?: string;
  isSelected?: boolean;
  order: number;
  stratData: BlockStrategicDetails;
  // Legacy/Direct access fields (keeping for compatibility with existing UI logic if possible, but transitioning to stratData)
  kcal?: string;
  macros?: string;
  deficit?: string;
  freq?: string;
  water?: string;
  rationale?: string;
  timing?: string[];
  focusItems?: string[];
  focus?: string;
  sessions?: string;
  deload?: string;
  intensityTargets?: string[];
}

export interface Milestone {
  id: string;
  label: string;
  week: string;
  status: 'done' | 'next' | 'future';
}

export interface Goal {
  id: string;
  type: 'physical' | 'nutrition' | 'training' | 'mindset';
  label: string;
  desc: string;
  value: number;
  currentLabel: string;
  targetLabel: string;
}

export interface TrajectoryGoals {
  targetWeight: number;
  startWeight: number;
  currentWeight?: number;   // auto-filled from the latest check-in unless the coach overrides it
  targetStrengthKg: number;
  startStrengthKg: number;
  exerciseName: string;
  programStartDate: string; // ISO date string YYYY-MM-DD
  totalWeeks: number;       // managed here, overrides roadmap.totalWeeks for trajectory purposes
}

export interface RoadmapConfig {
  primaryGoal?: string;
  nutritionApproach?: string;
  trainingFreq?: string;
  intensityLevel?: string;
  duration?: number;
}

export interface RoadmapData {
  status: string;
  currentWeek: number;
  totalWeeks: number;
  nutrition: RoadmapBlock[];
  training: RoadmapBlock[];
  goals: Goal[];
  milestones: Milestone[];
  assumptions: {
    steps: string;
    sleep: string;
    constraints: string;
  };
  trajectoryGoals?: TrajectoryGoals;
  config?: RoadmapConfig;
}
