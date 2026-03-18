export interface Exercise {
  id: string;
  name: string;
  type: 'Compound' | 'Isolation';
  category: 'Strength' | 'Mobility' | 'Warm-up' | 'Cardio' | 'Rehab';
  subcategory?: string;
  video_url?: string;
  description?: string;
  muscleGroups: string[];
  secondaryMuscles?: string[];
  tools: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

export const exercises: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Back Squat',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Quadriceps'],
    secondaryMuscles: ['Glutes'],
    tools: ['Barbell', 'Rack'],
    level: 'Intermediate',
    icon: 'directions_run'
  },
  {
    id: '2',
    name: 'Dumbbell Bench Press',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps'],
    tools: ['Dumbbells', 'Bench'],
    level: 'Beginner',
    icon: 'fitness_center'
  },
  {
    id: '3',
    name: 'Romanian Deadlift',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Hamstrings'],
    secondaryMuscles: ['Lower Back'],
    tools: ['Barbell'],
    level: 'Intermediate',
    icon: 'horizontal_rule'
  },
  {
    id: '4',
    name: 'Lateral Raise',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Deltoids'],
    tools: ['Dumbbells'],
    level: 'Beginner',
    icon: 'accessibility_new'
  },
  {
    id: '5',
    name: 'Cable Face Pull',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Rear Delts'],
    secondaryMuscles: ['Rotator Cuff'],
    tools: ['Cable Machine', 'Rope'],
    level: 'Beginner',
    icon: 'vertical_align_bottom'
  },
  {
    id: '6',
    name: 'Pull Up',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Lats'],
    secondaryMuscles: ['Biceps'],
    tools: ['Pull Up Bar'],
    level: 'Advanced',
    icon: 'upload'
  },
  // Mobility
  {
    id: 'm1',
    name: 'World\'s Greatest Stretch',
    type: 'Isolation',
    category: 'Mobility',
    muscleGroups: ['Full Body'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'accessibility'
  },
  {
    id: 'm2',
    name: 'Couch Stretch',
    type: 'Isolation',
    category: 'Mobility',
    muscleGroups: ['Hip Flexors'],
    tools: ['Wall'],
    level: 'Beginner',
    icon: 'airline_seat_recline_extra'
  },
  // Warm-up
  {
    id: 'w1',
    name: 'Jumping Jacks',
    type: 'Compound',
    category: 'Warm-up',
    muscleGroups: ['Full Body'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'directions_run'
  },
  {
    id: 'w2',
    name: 'Arm Circles',
    type: 'Isolation',
    category: 'Warm-up',
    muscleGroups: ['Shoulders'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'refresh'
  },
  // Cardio
  {
    id: 'c1',
    name: 'Treadmill Run',
    type: 'Compound',
    category: 'Cardio',
    muscleGroups: ['Legs'],
    tools: ['Treadmill'],
    level: 'Beginner',
    icon: 'directions_run'
  },
  {
    id: 'c2',
    name: 'Assault Bike',
    type: 'Compound',
    category: 'Cardio',
    muscleGroups: ['Full Body'],
    tools: ['Assault Bike'],
    level: 'Intermediate',
    icon: 'pedal_bike'
  },
  // Rehab
  {
    id: 'r1',
    name: 'Band Pull Aparts',
    type: 'Isolation',
    category: 'Rehab',
    muscleGroups: ['Shoulders'],
    tools: ['Resistance Band'],
    level: 'Beginner',
    icon: 'rebase_edit'
  },
  {
    id: 'r2',
    name: 'Glute Bridges',
    type: 'Isolation',
    category: 'Rehab',
    muscleGroups: ['Glutes'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'accessibility'
  }
];
