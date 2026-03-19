import { Exercise } from './exercises';

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  type: string;
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  rest: string;
}

export interface WorkoutBlock {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  exercises: PlannedExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  blocks: WorkoutBlock[];
}

export interface ProgramTemplate {
  workouts: WorkoutTemplate[];
  defaultSchedule: Record<string, string>; // dayId -> workoutId
}

export const PROGRAM_TEMPLATES: Record<string, ProgramTemplate> = {
  'p1': { // Fuerza Start - 3 days Full Body
    workouts: [
      {
        id: 'p1-w1',
        name: 'Full Body A (Push Focus)',
        blocks: [
          {
            id: 1, name: 'Warm-up', subtitle: 'Mobility', icon: 'arrow_warm_up', iconBg: 'bg-orange-50 text-orange-600',
            exercises: [{ id: '1-1', exerciseId: 'w1', name: 'Jumping Jacks', type: 'Compound', weight: '-', sets: '2', reps: '30s', rir: '-', rest: '30s' }]
          },
          {
            id: 2, name: 'Torso (Push)', subtitle: 'Chest & Shoulders', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600',
            exercises: [{ id: '1-2', exerciseId: '2', name: 'Dumbbell Bench Press', type: 'Compound', weight: '12kg', sets: '3', reps: '10', rir: '2', rest: '90s' }]
          },
          {
            id: 3, name: 'Legs', subtitle: 'Quads', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600',
            exercises: [{ id: '1-3', exerciseId: '1', name: 'Barbell Back Squat', type: 'Compound', weight: '20kg', sets: '3', reps: '10', rir: '2', rest: '120s' }]
          }
        ]
      },
      {
        id: 'p1-w2',
        name: 'Full Body B (Pull Focus)',
        blocks: [
          {
            id: 1, name: 'Torso (Pull)', subtitle: 'Back & Biceps', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600',
            exercises: [{ id: '2-1', exerciseId: '6', name: 'Pull Up', type: 'Compound', weight: 'BW', sets: '3', reps: '8', rir: '1', rest: '90s' }]
          },
          {
            id: 2, name: 'Legs', subtitle: 'Hams & Glutes', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600',
            exercises: [{ id: '2-2', exerciseId: '3', name: 'Romanian Deadlift', type: 'Compound', weight: '30kg', sets: '3', reps: '10', rir: '2', rest: '90s' }]
          }
        ]
      }
    ],
    defaultSchedule: { 'monday': 'p1-w1', 'wednesday': 'p1-w2', 'friday': 'p1-w1' }
  },
  'p2': { // Fuerza Regular - 4 days Upper/Lower
    workouts: [
      {
        id: 'p2-w1',
        name: 'Torso Upper A',
        blocks: [
          {
            id: 1, name: 'Chest', subtitle: 'Heavy Push', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600',
            exercises: [{ id: 'p2-1-1', exerciseId: '2', name: 'Dumbbell Bench Press', type: 'Compound', weight: '20kg', sets: '4', reps: '8', rir: '2', rest: '90s' }]
          },
          {
            id: 2, name: 'Back', subtitle: 'Vertical Pull', icon: 'fitness_center', iconBg: 'bg-indigo-50 text-indigo-600',
            exercises: [{ id: 'p2-1-2', exerciseId: '6', name: 'Pull Up', type: 'Compound', weight: 'BW', sets: '4', reps: '8', rir: '2', rest: '90s' }]
          }
        ]
      },
      {
        id: 'p2-w2',
        name: 'Piernas Lower A',
        blocks: [
          {
            id: 1, name: 'Quads', subtitle: 'Compound Lift', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600',
            exercises: [{ id: 'p2-2-1', exerciseId: '1', name: 'Barbell Back Squat', type: 'Compound', weight: '60kg', sets: '4', reps: '8', rir: '2', rest: '120s' }]
          }
        ]
      }
    ],
    defaultSchedule: { 'monday': 'p2-w1', 'tuesday': 'p2-w2', 'thursday': 'p2-w1', 'friday': 'p2-w2' }
  },
  'p3': { // Fuerza Pro - 5 days PPL
    workouts: [
      { 
        id: 'p3-w1', name: 'Torso (Push) - Chest/Shoulders', 
        blocks: [
          { id: 1, name: 'Main Lift', subtitle: 'Heavy Push', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600', exercises: [{ id: 'p3-1-1', exerciseId: '2', name: 'Dumbbell Bench Press', type: 'Compound', weight: '30kg', sets: '4', reps: '6', rir: '1', rest: '120s' }] },
          { id: 2, name: 'Shoulders', subtitle: 'Overhead', icon: 'fitness_center', iconBg: 'bg-indigo-50 text-indigo-600', exercises: [{ id: 'p3-1-2', exerciseId: '10', name: 'Barbell Military Press', type: 'Compound', weight: '40kg', sets: '3', reps: '10', rir: '2', rest: '90s' }] }
        ] 
      },
      { 
        id: 'p3-w2', name: 'Torso (Pull) - Back/Biceps', 
        blocks: [
          { id: 1, name: 'Back', subtitle: 'Vertical Pull', icon: 'fitness_center', iconBg: 'bg-indigo-50 text-indigo-600', exercises: [{ id: 'p3-2-1', exerciseId: '6', name: 'Pull Up', type: 'Compound', weight: 'BW+5kg', sets: '4', reps: '8', rir: '1', rest: '90s' }] }
        ] 
      },
      { 
        id: 'p3-w3', name: 'Piernas (Legs) - Quads/Hams', 
        blocks: [
          { id: 1, name: 'Lower', subtitle: 'Heavy Squat', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600', exercises: [{ id: 'p3-3-1', exerciseId: '1', name: 'Barbell Back Squat', type: 'Compound', weight: '80kg', sets: '5', reps: '5', rir: '1', rest: '180s' }] }
        ] 
      }
    ],
    defaultSchedule: { 'monday': 'p3-w1', 'tuesday': 'p3-w2', 'wednesday': 'p3-w3', 'thursday': 'p3-w1', 'friday': 'p3-w2' }
  },
  'p4': { // Pérdida de Grasa - 4 days HIIT/Strength
    workouts: [
      { 
        id: 'p4-w1', name: 'Metabolic Strength A', 
        blocks: [
          { id: 1, name: 'Circuit', subtitle: 'High Intensity', icon: 'bolt', iconBg: 'bg-orange-50 text-orange-600', exercises: [{ id: 'p4-1-1', exerciseId: 'w1', name: 'Barbell Squat', type: 'Compound', weight: '40kg', sets: '4', reps: '15', rir: '0', rest: '30s' }] }
        ] 
      },
      { 
        id: 'p4-w2', name: 'HIIT & Core', 
        blocks: [
          { id: 1, name: 'HIIT', subtitle: 'Cardio Blast', icon: 'timer', iconBg: 'bg-red-50 text-red-600', exercises: [{ id: 'p4-2-1', exerciseId: 'w2', name: 'Treadmill Sprint', type: 'Cardio', weight: '-', sets: '10', reps: '30s', rir: '-', rest: '30s' }] }
        ] 
      }
    ],
    defaultSchedule: { 'monday': 'p4-w1', 'tuesday': 'p4-w2', 'thursday': 'p4-w1', 'friday': 'p4-w2' }
  },
  'p5': { // Hipertrofia - 5 days Split
    workouts: [
      { id: 'p5-w1', name: 'Pecho & Tríceps', blocks: [{ id: 1, name: 'Chest', subtitle: 'Growth', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600', exercises: [{ id: 'p5-1-1', exerciseId: '2', name: 'Bench Press', type: 'Compound', weight: '60kg', sets: '4', reps: '12', rir: '1', rest: '75s' }] }] },
      { id: 'p5-w2', name: 'Espalda & Bíceps', blocks: [{ id: 1, name: 'Back', subtitle: 'Width', icon: 'fitness_center', iconBg: 'bg-indigo-50 text-indigo-600', exercises: [{ id: 'p5-2-1', exerciseId: '6', name: 'Pull Ups', type: 'Compound', weight: 'BW', sets: '4', reps: '10', rir: '1', rest: '75s' }] }] },
      { id: 'p5-w3', name: 'Hombros', blocks: [{ id: 1, name: 'Shoulders', subtitle: 'Delts', icon: 'fitness_center', iconBg: 'bg-purple-50 text-purple-600', exercises: [{ id: 'p5-3-1', exerciseId: '10', name: 'Military Press', type: 'Compound', weight: '30kg', sets: '4', reps: '12', rir: '1', rest: '75s' }] }] },
      { id: 'p5-w4', name: 'Piernas (Quads Focus)', blocks: [{ id: 1, name: 'Quads', subtitle: 'Teardrop', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600', exercises: [{ id: 'p5-4-1', exerciseId: '1', name: 'Front Squat', type: 'Compound', weight: '40kg', sets: '4', reps: '12', rir: '1', rest: '90s' }] }] },
      { id: 'p5-w5', name: 'Piernas (Ham Focus)', blocks: [{ id: 1, name: 'Hams', subtitle: 'Posterior', icon: 'accessibility_new', iconBg: 'bg-emerald-50 text-emerald-600', exercises: [{ id: 'p5-5-1', exerciseId: '3', name: 'Romanian Deadlift', type: 'Compound', weight: '50kg', sets: '4', reps: '12', rir: '1', rest: '90s' }] }] }
    ],
    defaultSchedule: { 'monday': 'p5-w1', 'tuesday': 'p5-w2', 'wednesday': 'p5-w3', 'thursday': 'p5-w4', 'friday': 'p5-w5' }
  },
  'p6': { // Movilidad
    workouts: [
      { id: 'p6-w1', name: 'Full Body Mobility', blocks: [{ id: 1, name: 'Mobility', subtitle: 'Flow', icon: 'self_improvement', iconBg: 'bg-teal-50 text-teal-600', exercises: [{ id: 'p6-1-1', exerciseId: 'w1', name: 'Cat Cow', type: 'Bodyweight', weight: '-', sets: '3', reps: '12', rir: '-', rest: '0s' }] }] }
    ],
    defaultSchedule: { 'monday': 'p6-w1', 'wednesday': 'p6-w1', 'friday': 'p6-w1' }
  },
  'p7': { // Resistencia
    workouts: [
      { id: 'p7-w1', name: 'Endurance Run', blocks: [{ id: 1, name: 'Cardio', subtitle: 'Steady', icon: 'directions_run', iconBg: 'bg-blue-50 text-blue-600', exercises: [{ id: 'p7-1-1', exerciseId: 'w2', name: 'Running', type: 'Cardio', weight: '-', sets: '1', reps: '30min', rir: '-', rest: '-' }] }] },
      { id: 'p7-w2', name: 'Recovery Walk', blocks: [{ id: 1, name: 'Recovery', subtitle: 'Active', icon: 'directions_walk', iconBg: 'bg-emerald-50 text-emerald-600', exercises: [{ id: 'p7-2-1', exerciseId: 'w3', name: 'Walking', type: 'Cardio', weight: '-', sets: '1', reps: '45min', rir: '-', rest: '-' }] }] }
    ],
    defaultSchedule: { 'monday': 'p7-w1', 'tuesday': 'p7-w2', 'thursday': 'p7-w1', 'friday': 'p7-w2' }
  }
};
