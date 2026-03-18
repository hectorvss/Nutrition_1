export interface Food {
  name: string;
  category: string;
  calories: number;
  p: number;
  c: number;
  f: number;
  amount: string;
}

export const foodCategories = [
  { name: 'All Categories', count: 1240 },
  { name: 'Proteins', count: 320 },
  { name: 'Vegetables', count: 450 },
  { name: 'Fruits', count: 180 },
  { name: 'Carbohydrates', count: 210 },
  { name: 'Fats', count: 80 }
];

export const foods: Food[] = [];
