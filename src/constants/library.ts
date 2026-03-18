import { Recipe, FoodItem, Supplement } from '../types/library';

export const recipes: Recipe[] = [
  { id: '1', title: 'Quinoa Salmon Bowl', image: 'https://picsum.photos/seed/salmon/400/300', category: 'High Protein', prepTime: 25, calories: 450, protein: 38, carbs: 45, fats: 14, rating: 4.9, tags: ['Gluten Free', 'Low Carb'] },
  { id: '2', title: 'Green Detox Smoothie', image: 'https://picsum.photos/seed/smoothie/400/300', category: 'Detox', prepTime: 5, calories: 180, protein: 5, carbs: 30, fats: 2, rating: 4.7, tags: ['Vegan', 'Raw'] },
  { id: '3', title: 'Avocado & Egg Toast', image: 'https://picsum.photos/seed/toast/400/300', category: 'Keto', prepTime: 15, calories: 320, protein: 12, carbs: 15, fats: 25, rating: 5.0, tags: ['Breakfast', 'Vegetarian'] },
  { id: '4', title: 'Mediterranean Salad', image: 'https://picsum.photos/seed/salad/400/300', category: 'Vegetarian', prepTime: 10, calories: 290, protein: 8, carbs: 20, fats: 18, rating: 4.5, tags: ['Lunch', 'Healthy Fat'] },
];

export const foodItems: FoodItem[] = [];

export const supplements: Supplement[] = [
  { id: '1', name: 'Whey Protein Isolate', brand: 'Optimum Nutrition', serving: '1 scoop (30g)', primaryIngredient: 'Isolate Protein', bestTime: 'Post-workout', score: 4.8, category: 'Recovery' },
  { id: '2', name: 'Creatine Monohydrate', brand: 'Thorne', serving: '1 scoop (5g)', primaryIngredient: 'Creatine Mono.', bestTime: 'Anytime', score: 5.0, category: 'Performance' },
  { id: '3', name: 'Daily Multivitamin', brand: 'Garden of Life', serving: '1 capsule', primaryIngredient: 'Vitamins A-K', bestTime: 'Morning', score: 4.6, category: 'Wellness' },
  { id: '4', name: 'Omega-3 Fish Oil', brand: 'Nordic Naturals', serving: '2 softgels', primaryIngredient: 'EPA & DHA', bestTime: 'With Meals', score: 4.9, category: 'Heart Health' },
];
