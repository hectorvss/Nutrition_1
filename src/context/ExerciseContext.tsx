import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exercise } from '../constants/exercises';
import { supabase } from '../supabase';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

// Mutations on the global `exercises` catalog must NEVER fire from a client
// session. The provider is mounted globally (managers and clients share the
// same tree), so this guard lives at the context level. Server-side RLS
// should also reject these writes — the front-end check is defense in depth
// to keep the catalog clean even if RLS regresses.
const assertManagerOrThrow = (role: string | undefined) => {
  if (role !== 'MANAGER') {
    throw new Error('Only managers can modify the exercise catalog.');
  }
};

export type { Exercise };

interface ExerciseContextType {
  exercises: Exercise[];
  isLoading: boolean;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  refreshExercises: () => Promise<void>;
  /** Fetch the long-form fields (instructions, common_mistakes, tips,
   *  description) for a single exercise. They are intentionally excluded
   *  from the bulk list query — at ~660 rows the catalog would otherwise
   *  ship ~600 KB on every login and every language switch. */
  getExerciseFullDetails: (id: string) => Promise<Pick<Exercise, 'instructions' | 'commonMistakes' | 'tips' | 'description'> | null>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { user } = useAuth();

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      // Bulk list query — explicit light column list. The heavy long-text
      // fields (instructions / common_mistakes / tips / description) live
      // on the detail view and are pulled on demand via
      // `getExerciseFullDetails` to keep the global load under control.
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,category,subcategory,video_url,type,muscle_groups,secondary_muscles,tools,difficulty_level,icon,manager_id,source_exercise_id')
        .eq('language', language)
        .order('name');

      if (error) throw error;

      const rows = data || [];
      // Hide a global once the current manager has forked it (copy-on-write),
      // so the catalog never shows both the original and the edited copy.
      const forkedGlobalIds = new Set(
        rows
          .filter(r => r.manager_id && r.manager_id === user?.id && r.source_exercise_id)
          .map(r => r.source_exercise_id)
      );

      const mappedExercises: Exercise[] = rows
        .filter(item => !(item.manager_id == null && forkedGlobalIds.has(item.id)))
        .map(item => ({
          id: item.id,
          name: item.name,
          category: item.category as any,
          subcategory: item.subcategory,
          video_url: item.video_url,
          description: undefined,
          type: item.type as any,
          muscleGroups: item.muscle_groups || [],
          secondaryMuscles: item.secondary_muscles || [],
          tools: item.tools || [],
          level: item.difficulty_level as any,
          icon: item.icon || 'fitness_center',
          instructions: undefined,
          commonMistakes: undefined,
          tips: undefined,
          owned: !!item.manager_id && item.manager_id === user?.id,
        }));

      setExercises(mappedExercises);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseFullDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('description,instructions,common_mistakes,tips')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        description: data.description || undefined,
        instructions: data.instructions || undefined,
        commonMistakes: data.common_mistakes || undefined,
        tips: data.tips || undefined,
      };
    } catch (err) {
      console.error('Error fetching exercise details:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, user?.id]);

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    assertManagerOrThrow(user?.role);
    if (!user?.id) throw new Error('Not authenticated');
    try {
      // Stamp ownership so the row is the manager's own (RLS requires it).
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
          instructions: exercise.instructions ?? null,
          common_mistakes: exercise.commonMistakes ?? null,
          tips: exercise.tips ?? null,
          safety_rating: (exercise as any).safety_rating ?? null,
          language: language,
          is_custom: true,
          manager_id: user.id,
        }]);

      if (error) throw error;
      await fetchExercises();
    } catch (err) {
      console.error('Error adding exercise:', err);
      throw err;
    }
  };

  const deleteExercise = async (id: string) => {
    assertManagerOrThrow(user?.role);
    if (!user?.id) throw new Error('Not authenticated');
    try {
      const original = exercises.find(e => e.id === id);
      if (original && !original.owned) {
        // Shared catalog exercises can't be deleted — they belong to everyone.
        throw new Error('Cannot delete a shared catalog exercise. You can only delete your own.');
      }
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting exercise:', err);
      throw err;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    assertManagerOrThrow(user?.role);
    if (!user?.id) throw new Error('Not authenticated');
    try {
      const original = exercises.find(e => e.id === id);
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
      if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
      if (updates.commonMistakes !== undefined) dbUpdates.common_mistakes = updates.commonMistakes;
      if (updates.tips !== undefined) dbUpdates.tips = updates.tips;

      if (original && original.owned) {
        // The manager owns this row → edit in place.
        const { error } = await supabase
          .from('exercises')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Global (or not owned) → copy-on-write. Never mutate the shared
        // catalog; create the manager's own copy with the edits merged in.
        const merged: any = {
          name: dbUpdates.name ?? original?.name,
          category: dbUpdates.category ?? original?.category,
          subcategory: dbUpdates.subcategory ?? original?.subcategory,
          video_url: dbUpdates.video_url ?? original?.video_url,
          description: dbUpdates.description ?? original?.description ?? null,
          type: dbUpdates.type ?? original?.type,
          muscle_groups: dbUpdates.muscle_groups ?? original?.muscleGroups,
          secondary_muscles: dbUpdates.secondary_muscles ?? original?.secondaryMuscles,
          tools: dbUpdates.tools ?? original?.tools,
          difficulty_level: dbUpdates.difficulty_level ?? original?.level,
          icon: dbUpdates.icon ?? original?.icon,
          instructions: dbUpdates.instructions ?? null,
          common_mistakes: dbUpdates.common_mistakes ?? null,
          tips: dbUpdates.tips ?? null,
          language: language,
          is_custom: true,
          manager_id: user.id,
          source_exercise_id: id,
        };
        const { error } = await supabase.from('exercises').insert([merged]);
        if (error) throw error;
      }
      await fetchExercises();
    } catch (err) {
      console.error('Error updating exercise:', err);
      throw err;
    }
  };

  return (
    <ExerciseContext.Provider value={{
      exercises,
      isLoading,
      addExercise,
      deleteExercise,
      updateExercise,
      refreshExercises: fetchExercises,
      getExerciseFullDetails,
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
