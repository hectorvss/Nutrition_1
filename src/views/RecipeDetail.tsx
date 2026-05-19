import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Flame,
  Users,
  Bookmark,
  Edit3,
  Zap,
  Loader2,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import ClientScalePreview from '../components/recipes/ClientScalePreview';

interface Ingredient { name: string; amount?: string | number; unit?: string; }
interface Step { title?: string; text?: string; }

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  prep_time?: number;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  tags?: string[];
  ingredients?: Ingredient[];
  steps?: Step[];
}

interface RecipeDetailProps {
  recipeId?: string;
  onBack: () => void;
  onEdit?: (id: string) => void;
}

const INGREDIENT_COLORS = [
  'bg-orange-100 text-orange-600',
  'bg-red-100 text-red-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-yellow-100 text-yellow-600',
  'bg-blue-100 text-blue-600',
  'bg-slate-100 text-slate-600',
];

export default function RecipeDetail({ recipeId, onBack, onEdit }: RecipeDetailProps) {
  const { t } = useLanguage();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setError(t('screen_under_development'));
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithAuth('/recipes/' + recipeId);
        if (!cancelled) setRecipe(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error loading recipe');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [recipeId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-bold">{t('loading_library')}</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 gap-4 p-10">
        <h2 className="text-xl font-bold text-slate-900">{error || t('no_foods_found')}</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all"
        >
          {t('back_to_library')}
        </button>
      </div>
    );
  }

  const protein = Number(recipe.protein) || 0;
  const carbs = Number(recipe.carbs) || 0;
  const fats = Number(recipe.fats) || 0;
  const macroTotal = protein + carbs + fats;
  const pct = (v: number) => (macroTotal > 0 ? (v / macroTotal) * 100 : 0);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
        {/* Hero Section */}
        <div className="w-full relative h-[400px] lg:h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${recipe.image_url || ''}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
          </div>

          <div className="absolute top-8 left-8">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {recipe.category && (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">{recipe.category}</span>
                  )}
                  {(recipe.tags || []).map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-xl text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">{tag}</span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{recipe.title}</h1>
                <div className="flex items-center gap-8 text-white/90 text-sm font-bold flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    {recipe.prep_time} min
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    {recipe.calories} kcal
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    {recipe.servings} {t('recipe_servings_sample')}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/30 transition-all flex items-center gap-2 font-bold">
                  <Bookmark className="w-5 h-5" />
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full space-y-12 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Ingredients */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-emerald-500" />
                  {t('ingredients_section')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(recipe.ingredients || []).map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className={`w-12 h-12 rounded-full ${INGREDIENT_COLORS[idx % INGREDIENT_COLORS.length]} flex items-center justify-center font-bold text-sm`}>
                        {(ing.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{ing.name}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-emerald-500" />
                  {t('preparation_guide')}
                </h2>
                <div className="space-y-8">
                  {(recipe.steps || []).map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100">{idx + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.text}</p>
                        {idx < (recipe.steps || []).length - 1 && <div className="w-full h-px bg-slate-100 mt-8"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Macronutrients */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{t('macronutrients')}</h3>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-4xl font-bold text-slate-900 tracking-tight">{recipe.calories || 0} <span className="text-sm font-bold text-slate-400">kcal</span></div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-6">
                  <div className="h-full bg-emerald-500" style={{ width: `${pct(protein)}%` }}></div>
                  <div className="h-full bg-blue-400" style={{ width: `${pct(carbs)}%` }}></div>
                  <div className="h-full bg-amber-400" style={{ width: `${pct(fats)}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('protein')}</div>
                    <div className="text-sm font-bold text-emerald-600">{protein}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('carbs')}</div>
                    <div className="text-sm font-bold text-blue-500">{carbs}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('fats')}</div>
                    <div className="text-sm font-bold text-amber-500">{fats}g</div>
                  </div>
                </div>
              </div>

              {/* Client Scale Preview — available on the default recipe view */}
              <ClientScalePreview
                ingredients={recipe.ingredients || []}
                calories={recipe.calories || 0}
                recipeTitle={recipe.title}
                protein={protein}
                carbs={carbs}
                fats={fats}
              />

              {(recipe.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(recipe.tags || []).map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-2xl text-xs font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-10 right-10 z-20">
        <button
          onClick={() => onEdit && onEdit(recipe.id)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white pl-6 pr-8 py-5 rounded-full transition-all shadow-2xl shadow-emerald-500/40 flex items-center gap-4 font-bold text-xl group transform hover:-translate-y-2"
        >
          <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform duration-500">
            <Plus className="w-6 h-6" />
          </div>
          {t('edit_recipe')}
        </button>
      </div>
    </div>
  );
}
