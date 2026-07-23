import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

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
  /** True when this row belongs to the current manager (editable/deletable
   *  in place). Global catalog rows are read-only and get forked on edit. */
  owned?: boolean;
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
  const { user } = useAuth();

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      // RLS already scopes rows to: globals + your own + (for a client) your
      // manager's customs. We additionally hide a global once the current
      // manager has forked it (copy-on-write), so the library never shows
      // both the original and the edited copy.
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('language', language)
        .order('name');

      if (error) throw error;

      const rows = data || [];
      const forkedGlobalIds = new Set(
        rows
          .filter(r => r.manager_id && r.manager_id === user?.id && r.source_food_id)
          .map(r => r.source_food_id)
      );

      const mappedFoods: FoodItem[] = rows
        .filter(item => !(item.manager_id == null && forkedGlobalIds.has(item.id)))
        .map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || 'General',
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          servingSize: item.serving_size || '100g',
          emoji: item.emoji,
          custom: item.is_custom,
          owned: !!item.manager_id && item.manager_id === user?.id,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, user?.id]);

  const addFood = async (food: Omit<FoodItem, 'id'>) => {
    if (!user?.id) throw new Error('Not authenticated');
    try {
      // Stamp ownership so the row is the manager's own (RLS requires it).
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
          is_custom: true,
          manager_id: user.id,
        }]);

      if (error) throw error;
      await fetchFoods();
    } catch (err) {
      console.error('Error adding food:', err);
      throw err;
    }
  };

  const updateFood = async (id: string, updates: Partial<FoodItem>) => {
    if (!user?.id) throw new Error('Not authenticated');
    try {
      const original = foods.find(f => f.id === id);
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
      if (updates.protein !== undefined) dbUpdates.protein = updates.protein;
      if (updates.carbs !== undefined) dbUpdates.carbs = updates.carbs;
      if (updates.fats !== undefined) dbUpdates.fats = updates.fats;
      if (updates.servingSize) dbUpdates.serving_size = updates.servingSize;
      if (updates.emoji) dbUpdates.emoji = updates.emoji;

      if (original && original.owned) {
        // The manager owns this row → edit in place.
        const { error } = await supabase
          .from('foods')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Global (or not owned) → copy-on-write. Never mutate the shared
        // catalog; create the manager's own copy with the edits merged in.
        const merged = {
          name: dbUpdates.name ?? original?.name,
          category: dbUpdates.category ?? original?.category,
          calories: dbUpdates.calories ?? original?.calories,
          protein: dbUpdates.protein ?? original?.protein,
          carbs: dbUpdates.carbs ?? original?.carbs,
          fats: dbUpdates.fats ?? original?.fats,
          serving_size: dbUpdates.serving_size ?? original?.servingSize,
          emoji: dbUpdates.emoji ?? original?.emoji,
          language: language,
          is_custom: true,
          manager_id: user.id,
          source_food_id: id,
        };
        const { error } = await supabase.from('foods').insert([merged]);
        if (error) throw error;
      }
      await fetchFoods();
    } catch (err) {
      console.error('Error updating food:', err);
      throw err;
    }
  };

  const deleteFood = async (id: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    try {
      const original = foods.find(f => f.id === id);
      if (original && !original.owned) {
        // Shared catalog items can't be deleted — they belong to everyone.
        throw new Error('Cannot delete a shared catalog item. You can only delete your own.');
      }
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFoods(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting food:', err);
      throw err;
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
