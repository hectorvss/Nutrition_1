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
  instructions?: string;
  commonMistakes?: string;
  tips?: string;
  /** True when this exercise belongs to the current manager (editable/
   *  deletable in place). Global catalog rows are read-only and get forked
   *  into an owned copy on edit. */
  owned?: boolean;
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
  },
  // Expanded strength library
  {
    id: 's9',
    name: 'Barbell Bench Press',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    tools: ['Barbell', 'Bench'],
    level: 'Intermediate',
    icon: 'fitness_center',
    instructions: 'Set shoulder blades, lower the bar under control to the lower chest, and press while keeping feet planted.'
  },
  {
    id: 's10',
    name: 'Incline Dumbbell Press',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    tools: ['Dumbbells', 'Bench'],
    level: 'Intermediate',
    icon: 'fitness_center'
  },
  {
    id: 's11',
    name: 'Cable Fly',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Shoulders'],
    tools: ['Cable Machine'],
    level: 'Beginner',
    icon: 'conversion_path'
  },
  {
    id: 's12',
    name: 'Push-Up',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Core'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'accessibility'
  },
  {
    id: 's13',
    name: 'Lat Pulldown',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps'],
    tools: ['Cable Machine'],
    level: 'Beginner',
    icon: 'vertical_align_bottom'
  },
  {
    id: 's14',
    name: 'Barbell Row',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    tools: ['Barbell'],
    level: 'Intermediate',
    icon: 'fitness_center'
  },
  {
    id: 's15',
    name: 'Seated Cable Row',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps'],
    tools: ['Cable Machine'],
    level: 'Beginner',
    icon: 'rowing'
  },
  {
    id: 's16',
    name: 'Single-Arm Dumbbell Row',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Core'],
    tools: ['Dumbbell', 'Bench'],
    level: 'Beginner',
    icon: 'fitness_center'
  },
  {
    id: 's17',
    name: 'Leg Press',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    tools: ['Leg Press'],
    level: 'Beginner',
    icon: 'airline_seat_legroom_extra'
  },
  {
    id: 's18',
    name: 'Bulgarian Split Squat',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    tools: ['Dumbbells', 'Bench'],
    level: 'Intermediate',
    icon: 'accessibility_new'
  },
  {
    id: 's19',
    name: 'Walking Lunge',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Legs'],
    secondaryMuscles: ['Glutes', 'Core'],
    tools: ['Dumbbells'],
    level: 'Beginner',
    icon: 'directions_walk'
  },
  {
    id: 's20',
    name: 'Leg Extension',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Quads'],
    tools: ['Machine'],
    level: 'Beginner',
    icon: 'airline_seat_legroom_extra'
  },
  {
    id: 's21',
    name: 'Seated Leg Curl',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Hamstrings'],
    tools: ['Machine'],
    level: 'Beginner',
    icon: 'airline_seat_recline_extra'
  },
  {
    id: 's22',
    name: 'Hip Thrust',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    tools: ['Barbell', 'Bench'],
    level: 'Intermediate',
    icon: 'fitness_center'
  },
  {
    id: 's23',
    name: 'Cable Kickback',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Glutes'],
    tools: ['Cable Machine', 'Ankle Strap'],
    level: 'Beginner',
    icon: 'conversion_path'
  },
  {
    id: 's24',
    name: 'Standing Calf Raise',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Calves'],
    tools: ['Machine'],
    level: 'Beginner',
    icon: 'vertical_align_top'
  },
  {
    id: 's25',
    name: 'Overhead Press',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    tools: ['Barbell'],
    level: 'Intermediate',
    icon: 'fitness_center'
  },
  {
    id: 's26',
    name: 'Rear Delt Fly',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Rear Delts'],
    secondaryMuscles: ['Upper Back'],
    tools: ['Dumbbells'],
    level: 'Beginner',
    icon: 'sync_alt'
  },
  {
    id: 's27',
    name: 'Biceps Curl',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Biceps'],
    tools: ['Dumbbells'],
    level: 'Beginner',
    icon: 'fitness_center'
  },
  {
    id: 's28',
    name: 'Hammer Curl',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    tools: ['Dumbbells'],
    level: 'Beginner',
    icon: 'fitness_center'
  },
  {
    id: 's29',
    name: 'Triceps Rope Pushdown',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Triceps'],
    tools: ['Cable Machine', 'Rope'],
    level: 'Beginner',
    icon: 'vertical_align_bottom'
  },
  {
    id: 's30',
    name: 'Overhead Triceps Extension',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Triceps'],
    tools: ['Dumbbell'],
    level: 'Beginner',
    icon: 'fitness_center'
  },
  {
    id: 's31',
    name: 'Plank',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'horizontal_rule'
  },
  {
    id: 's32',
    name: 'Cable Woodchop',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Obliques'],
    tools: ['Cable Machine'],
    level: 'Intermediate',
    icon: 'conversion_path'
  },
  {
    id: 's33',
    name: 'Dead Bug',
    type: 'Isolation',
    category: 'Strength',
    muscleGroups: ['Core'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'accessibility'
  },
  {
    id: 's34',
    name: 'Kettlebell Swing',
    type: 'Compound',
    category: 'Strength',
    muscleGroups: ['Full Body'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    tools: ['Kettlebell'],
    level: 'Intermediate',
    icon: 'fitness_center'
  },
  {
    id: 'm3',
    name: 'World Greatest Stretch',
    type: 'Compound',
    category: 'Mobility',
    muscleGroups: ['Full Body'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'accessibility_new'
  },
  {
    id: 'm4',
    name: 'Thoracic Rotation',
    type: 'Isolation',
    category: 'Mobility',
    muscleGroups: ['Upper Back'],
    tools: ['Bodyweight'],
    level: 'Beginner',
    icon: 'rotate_right'
  },
  {
    id: 'w3',
    name: 'Band External Rotation',
    type: 'Isolation',
    category: 'Warm-up',
    muscleGroups: ['Shoulders'],
    tools: ['Resistance Band'],
    level: 'Beginner',
    icon: 'rebase_edit'
  },
  {
    id: 'c3',
    name: 'Row Ergometer',
    type: 'Compound',
    category: 'Cardio',
    muscleGroups: ['Full Body'],
    tools: ['Row Ergometer'],
    level: 'Beginner',
    icon: 'rowing'
  },
  {
    id: 'c4',
    name: 'Incline Walk',
    type: 'Compound',
    category: 'Cardio',
    muscleGroups: ['Legs'],
    secondaryMuscles: ['Glutes'],
    tools: ['Treadmill'],
    level: 'Beginner',
    icon: 'directions_walk'
  },
  {
    id: 'r3',
    name: 'Side-Lying Clamshell',
    type: 'Isolation',
    category: 'Rehab',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hip Stabilizers'],
    tools: ['Mini Band'],
    level: 'Beginner',
    icon: 'accessibility'
  }
];
