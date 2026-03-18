import React from 'react';
import { Star, Flame, Clock, Plus, Heart } from 'lucide-react';
import { Recipe } from '../../types/library';

interface RecipeListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onCreate: () => void;
}

export default function RecipeList({ recipes, onSelect, onCreate }: RecipeListProps) {
  return (
    <div className="flex flex-col gap-4">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          onClick={() => onSelect(recipe)}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-48 cursor-pointer"
        >
          <div className="relative w-full sm:w-64 h-48 sm:h-full flex-shrink-0">
            <img src={recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-700">{recipe.rating}</span>
            </div>
          </div>
          <div className="p-6 flex flex-col sm:flex-row flex-1 gap-6 items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">{recipe.category}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">A nutritious bowl packed with omega-3 fatty acids, fiber, and fresh greens. Perfect for post-workout recovery and sustained energy throughout the day.</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {recipe.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 text-sm font-medium text-slate-500 mr-auto sm:mr-0 text-right">
                <div className="flex items-center sm:justify-end gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{recipe.calories} kcal</span>
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{recipe.prepTime} min</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div
        onClick={onCreate}
        className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-500/50 transition-all cursor-pointer group p-4 flex items-center justify-center h-24"
      >
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
          <Plus className="w-6 h-6" />
          <span className="font-bold text-lg">Create Custom Recipe</span>
        </div>
      </div>
    </div>
  );
}
