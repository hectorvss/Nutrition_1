export interface Client {
  id: string;
  name: string;
  phase: string;
  adherence: number;
  frequency: string;
  nextSession: string;
  status: 'active' | 'draft' | 'completed' | 'onboarding';
  avatar: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  videoUrl?: string;
  sets?: number;
  reps?: string;
  weight?: string;
  rir?: number;
  rest?: string;
}

export interface WorkoutBlock {
  id: string;
  name: string;
  exercises: Exercise[];
}

export type TrainingCategory = 'Strength' | 'Mobility' | 'Warm-up' | 'Cardio' | 'Rehab';

export interface TrainingProgram {
  id: string;
  name: string;
  level: string;
  focus: string;
  frequency: number;
  duration: number;
  schedule: string[];
  description: string;
}
