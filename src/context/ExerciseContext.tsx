import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Exercise } from '../constants/exercises';
import { supabase } from '../supabase';
import { useLanguage } from './LanguageContext';

export type { Exercise };

interface ExerciseContextType {
  exercises: Exercise[];
  isLoading: boolean;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  refreshExercises: () => Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('language', language)
        .order('name');
  
      if (error) throw error;
  
      const mappedExercises: Exercise[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as any,
        subcategory: item.subcategory,
        video_url: item.video_url,
        description: item.description,
        type: item.type as any,
        muscleGroups: item.muscle_groups || [],
        secondaryMuscles: item.secondary_muscles || [],
        tools: item.tools || [],
        level: item.difficulty_level as any,
        icon: item.icon || 'fitness_center'
      }));
  
      setExercises(mappedExercises);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);
  
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .insert([{
          name: exercise.name,
          category: exercise.category,
          subcategory: exercise.subcategory,
          video_url: exercise.video_url,
          description: exercise.description,
          type: exercise.type,
          muscle_groups: exercise.muscleGroups,
          secondary_muscles: exercise.secondaryMuscles,
          tools: exercise.tools,
          difficulty_level: exercise.level,
          icon: exercise.icon,
          language: language
        }]);

      if (error) throw error;
      await fetchExercises();
    } catch (err) {
      console.error('Error adding exercise:', err);
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting exercise:', err);
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.subcategory) dbUpdates.subcategory = updates.subcategory;
      if (updates.video_url) dbUpdates.video_url = updates.video_url;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.muscleGroups) dbUpdates.muscle_groups = updates.muscleGroups;
      if (updates.secondaryMuscles) dbUpdates.secondary_muscles = updates.secondaryMuscles;
      if (updates.tools) dbUpdates.tools = updates.tools;
      if (updates.level) dbUpdates.difficulty_level = updates.level;
      if (updates.icon) dbUpdates.icon = updates.icon;

      const { error } = await supabase
        .from('exercises')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchExercises();
    } catch (err) {
      console.error('Error updating exercise:', err);
    }
  };

  return (
    <ExerciseContext.Provider value={{ 
      exercises, 
      isLoading, 
      addExercise, 
      deleteExercise, 
      updateExercise,
      refreshExercises: fetchExercises 
    }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExerciseContext = () => {
  const ctx = useContext(ExerciseContext);
  if (!ctx) throw new Error('useExerciseContext must be used within ExerciseProvider');
  return ctx;
};
