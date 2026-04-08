import React from 'react';
import { ArrowLeft, Bookmark, Flame, Clock, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Recipe } from '../../types/library';
import { useLanguage } from '../../context/LanguageContext';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export default function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <button onClick={onBack} className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_library')}
      </button>

      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white">{recipe.category}</span>
            {recipe.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">{tag}</span>
            ))}
          </div>
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              {t('ingredients')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder ingredients */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">Q</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Quinoa</div>
                  <div className="text-xs text-slate-500">1 cup, uncooked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          {/* Nutrition info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('macronutrients')}</h3>
            <div className="text-3xl font-bold text-slate-900 mb-4">{recipe.calories} <span className="text-sm font-medium text-slate-500">{t('kcal')}</span></div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">{t('protein')}</span>
                  <span className="font-bold text-slate-900">{recipe.protein}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(recipe.protein / (recipe.protein + recipe.carbs + recipe.fats)) * 100}%` }}></div>
                </div>
              </div>
              {/* Add carbs and fats similarly */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
