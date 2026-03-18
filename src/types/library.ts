export interface Recipe {
  id: string;
  title: string;
  image: string;
  category: string;
  prepTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  rating: number;
  tags: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
}

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  serving: string;
  primaryIngredient: string;
  bestTime: string;
  score: number;
  category: string;
}
