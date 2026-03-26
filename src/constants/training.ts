import { Client, TrainingProgram } from '../types/training';

export const clients: Client[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phase: 'Phase 2: Power',
    adherence: 92,
    frequency: '4x / Week',
    nextSession: 'Tomorrow, Lower Body',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0Q3uAjHC8p014ZEXi-XOqgXIRaqRf0R1dawNQFMSEqrtIhBl997C3o6iGILTMLcGdyoP1VfSeZrtgvvQQ-hVjchh-eGdHuWGvBVI19wQvtu4SMW4Qwy809bw1FKZjwadQQ6pkJb5CaIrmomnOXQiloCBpKeBZ00l53VC9TijpiLDgjqcQ_pAw7psb_m0b-dpBrXlwCrZvjZFOJ4BwSxnkeFTJ4H9_DddUPYVgWypgllSmAkHkI6pkuxMW3pn8MYu5aXBRPDKxWoH'
  },
  {
    id: '2',
    name: 'Mike Ross',
    phase: 'Phase 1: Hypertrophy',
    adherence: 65,
    frequency: '3x / Week',
    nextSession: 'Today, Push Day',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD_vMvwpXoLlTvndeGwZKVEVR9LnlKTY7x4v283aQEkHNrFvOf2FkhHnA2XWrpxhHT4mMLcSoItEUxba42nxgxqNNuJvTyVHzS5fD0_swZBoYKN7-CW08PkSgsQQgyX3byp77LYkuTbJDioLGOyeHyuZ54ihPXcsmArA7syTYH1qzDcJmdVBUe6fK_UZWms6dpr23NkxWlBZfBKtVbuDmMxducfpVG6A6mF7ZwEgsfEuv-6bD2fA_NmTqRSu1WbFh9EoRTlr3G3qzI'
  }
];

export const trainingPrograms: TrainingProgram[] = [
  {
    id: 'strength_start',
    name: 'Fuerza Start',
    level: 'Beginner',
    focus: 'Full Body Strength',
    frequency: 3,
    duration: 45,
    schedule: ['M', 'W', 'F'],
    description: 'Foundation strength program focusing on compound lifts.'
  },
  {
    id: 'strength_regular',
    name: 'Fuerza Regular',
    level: 'Intermediate',
    focus: 'Upper/Lower Split',
    frequency: 4,
    duration: 60,
    schedule: ['M', 'T', 'Th', 'F'],
    description: 'Upper/Lower split designed for intermediate lifters.'
  },
  {
    id: 'strength_pro',
    name: 'Fuerza Pro',
    level: 'Advanced',
    focus: 'PPL',
    frequency: 5,
    duration: 75,
    schedule: ['M', 'T', 'W', 'Th', 'F'],
    description: 'High frequency training with specialized blocks.'
  },
  {
    id: 'p4',
    name: 'Pérdida de Grasa',
    level: 'High Intensity',
    focus: 'Cardio & Strength',
    frequency: 4,
    duration: 50,
    schedule: ['M', 'T', 'Th', 'F'],
    description: 'Metabolic conditioning mixed with strength circuits.'
  },
  {
    id: 'hypertrophy_volume',
    name: 'Hipertrofia',
    level: 'Volume',
    focus: 'Bodybuilding',
    frequency: 5,
    duration: 70,
    schedule: ['M', 'T', 'W', 'Th', 'F'],
    description: 'Maximal hypertrophy focus with moderate intensity.'
  },
  {
    id: 'mobility_recovery',
    name: 'Movilidad & Recuperación',
    level: 'Restorative',
    focus: 'Mobility',
    frequency: 3,
    duration: 30,
    schedule: ['M', 'W', 'F'],
    description: 'Improve flexibility and joint health.'
  },
  {
    id: 'p7',
    name: 'Resistencia',
    level: 'Endurance',
    focus: 'Running',
    frequency: 4,
    duration: 60,
    schedule: ['M', 'T', 'Th', 'F'],
    description: 'Sustained activity training to improve cardiovascular health.'
  }
];
