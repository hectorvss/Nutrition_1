import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from './LanguageContext';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  emoji?: string;
  custom?: boolean;
}

interface FoodContextType {
  foods: FoodItem[];
  isLoading: boolean;
  addFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  updateFood: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  refreshFoods: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const FoodProvider = ({ children }: { children: ReactNode }) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('language', language)
        .order('name');

      if (error) throw error;

      const mappedFoods: FoodItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || 'General',
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        servingSize: item.serving_size || '100g',
        emoji: item.emoji,
        custom: item.is_custom
      }));

      setFoods(mappedFoods);
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [language]);

  const addFood = async (food: Omit<FoodItem, 'id'>) => {
    try {
      const { error } = await supabase
        .from('foods')
        .insert([{
          name: food.name,
          category: food.category,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          serving_size: food.servingSize,
          emoji: food.emoji,
          language: language,
          is_custom: true // When added via UI, it's custom
        }]);

      if (error) throw error;
      await fetchFoods();
    } catch (err) {
      console.error('Error adding food:', err);
    }
  };

  const updateFood = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
      if (updates.protein !== undefined) dbUpdates.protein = updates.protein;
      if (updates.carbs !== undefined) dbUpdates.carbs = updates.carbs;
      if (updates.fats !== undefined) dbUpdates.fats = updates.fats;
      if (updates.servingSize) dbUpdates.serving_size = updates.servingSize;
      if (updates.emoji) dbUpdates.emoji = updates.emoji;

      const { error } = await supabase
        .from('foods')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchFoods();
    } catch (err) {
      console.error('Error updating food:', err);
    }
  };

  const deleteFood = async (id: string) => {
    try {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFoods(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting food:', err);
    }
  };

  return (
    <FoodContext.Provider value={{ 
      foods, 
      isLoading, 
      addFood, 
      updateFood, 
      deleteFood,
      refreshFoods: fetchFoods
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFoodContext = () => {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error('useFoodContext must be used within FoodProvider');
  return ctx;
};

