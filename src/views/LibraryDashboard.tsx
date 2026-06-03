import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Flame, 
  Clock, 
  Star, 
  MoreVertical, 
  ChevronRight,
  Trash2,
  Loader2
} from 'lucide-react';
import { useFoodContext } from '../context/FoodContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import { unwrapList } from '../api/unwrap';
import { categoryLabel } from '../constants/recipeMeta';
import { matchFood } from '../lib/search';

type Tab = 'recipes' | 'food' | 'supplements';

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
  rating?: number;
  tags?: string[];
}

interface LibraryDashboardProps {
  onNavigate: (view: string, recipeId?: string) => void;
}

export default function LibraryDashboard({ onNavigate }: LibraryDashboardProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(30);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { foods: foodItems, deleteFood, isLoading: isCtxLoading } = useFoodContext();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  const loadRecipes = async () => {
    setRecipesLoading(true);
    setRecipesError(null);
    try {
      const data = unwrapList(await fetchWithAuth('/recipes?limit=200'));
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRecipesError(err.message || 'Error loading recipes');
    } finally {
      setRecipesLoading(false);
    }
  };

  const [supplementsList, setSupplementsList] = useState<any[]>([]);
  const [supplementsLoading, setSupplementsLoading] = useState(true);

  const loadSupplements = async () => {
    setSupplementsLoading(true);
    try {
      const data = unwrapList(await fetchWithAuth('/manager/supplements?limit=300'));
      setSupplementsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading supplements:', err);
    } finally {
      setSupplementsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
    loadSupplements();
  }, []);

  const handleDeleteRecipe = async (id: string, title?: string) => {
    const recipeName = title || t('this_recipe', { defaultValue: 'esta receta' });
    if (!window.confirm(t('confirm_delete_recipe', { defaultValue: `¿Borrar "${recipeName}"? Esta acción no se puede deshacer.` }))) return;
    try {
      await fetchWithAuth('/recipes/' + id, { method: 'DELETE' });
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setRecipesError(err.message || 'Error deleting recipe');
    }
  };

  const matchesCat = (cat?: string) => !categoryFilter || cat === categoryFilter;
  const filteredRecipes = recipes.filter(
    r => matchFood({ ...r, name: r.title }, search) && matchesCat(r.category)
  );
  // Categories available for the active tab's filter panel.
  const tabCategories = Array.from(new Set(
    ((activeTab === 'recipes' ? recipes : activeTab === 'food' ? foodItems : supplementsList) as any[])
      .map(x => x?.category).filter(Boolean)
  )).sort() as string[];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 30);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [activeTab, search]);

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-500" />
            {t('library_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('library_subtitle')}</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'recipes') onNavigate('recipe-create');
            else if (activeTab === 'food') onNavigate('food-create');
            else if (activeTab === 'supplements') onNavigate('supplement-create');
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'recipes' ? t('new_recipe') : activeTab === 'food' ? t('add_food') : t('add_supplement')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-hide">
        {(['recipes', 'food', 'supplements'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (activeTab === tab) return;
              setCategoryFilter('');  // categories differ per tab
              setActiveTab(tab);
            }}
            className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'recipes' ? t('recipes_tab') : tab === 'food' ? t('food_database') : t('supplements_tab')}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full sm:w-[500px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={search}
            onChange={e => {
                setSearch(e.target.value);
                setVisibleCount(30); // reset visible count on new search
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 dark:text-white"
            placeholder={activeTab === 'recipes' ? t('search_recipes') : activeTab === 'food' ? t('search_food') : t('search_supplements')}
            type="text"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-6 py-3.5 border rounded-2xl text-sm font-bold transition-all shadow-sm ${
            showFilters || categoryFilter
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-5 h-5" />
          {t('show_filters')}
          {categoryFilter && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">1</span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-8 -mt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            {t('category', { defaultValue: 'Categoría' })}:
          </span>
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              !categoryFilter ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t('all', { defaultValue: 'Todas' })}
          </button>
          {tabCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                categoryFilter === cat ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {categoryLabel(cat, language)}
            </button>
          ))}
          {tabCategories.length === 0 && (
            <span className="text-xs text-slate-400 italic">{t('no_categories', { defaultValue: 'Sin categorías disponibles' })}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-20">
        {isLoading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
             <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
             <span className="font-bold">{t('loading_library')}</span>
          </div>
        ) : activeTab === 'recipes' && (
          <div className="flex flex-col gap-6">
            {recipesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-bold text-lg">{t('loading_library')}</p>
              </div>
            ) : (
              <>
            {!recipesLoading && filteredRecipes.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_foods_found')}</h3>
                <p className="text-slate-500 dark:text-slate-400">{recipesError || t('library_empty_msg')}</p>
              </div>
            )}
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onNavigate('recipe-detail', recipe.id)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-52 hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="relative w-full sm:w-72 h-52 sm:h-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-emerald-300" />
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{recipe.rating ?? '—'}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col sm:flex-row flex-1 gap-8 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">{categoryLabel(recipe.category, language)}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-4">{recipe.description || t('recipe_card_sample_desc')}</p>
                    <div className="flex flex-wrap gap-2">
                      {(recipe.tags || []).map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-8 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-6 sm:pt-0 sm:pl-8">
                    <div className="flex flex-row sm:flex-col gap-6 sm:gap-3 text-sm font-bold text-slate-400 mr-auto sm:mr-0 text-right">
                      <div className="flex items-center sm:justify-end gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-slate-700 dark:text-slate-300">{recipe.calories} kcal</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{recipe.prep_time} min</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigate('recipe-detail', recipe.id); }}
                        className="p-3 rounded-2xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center"
                        title={t('view_recipe', { defaultValue: 'View recipe' })}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id, recipe.title); }}
                        className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                        title={t('delete_label')}
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </>
            )}

            <div
              onClick={() => onNavigate('recipe-create')}
              className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/50 transition-all cursor-pointer group p-8 flex items-center justify-center h-24"
            >
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-emerald-500 transition-all">
                <Plus className="w-6 h-6" />
                <span className="font-bold text-xl">{t('create_custom_recipe')}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50 dark:bg-slate-950 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <div className="col-span-5">{t('food_item')}</div>
              <div className="col-span-7 grid grid-cols-5 gap-4 text-center">
                <div>{t('kcal')}</div>
                <div>{t('protein')}</div>
                <div>{t('carbs')}</div>
                <div>{t('fats')}</div>
                <div>{t('actions')}</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {isCtxLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-slate-500 font-bold text-lg">{t('loading_library')}</p>
                </div>
              ) : foodItems
                .filter(food => matchFood(food, search) && matchesCat(food.category))
                .slice(0, visibleCount)
                .map((food) => (
                <div key={food.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all p-4 md:p-6">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                    <div className="col-span-5 w-full flex items-center gap-6">
                      <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                        {food.emoji || (food.name.toLowerCase().includes('chicken') ? '🍗' : food.name.toLowerCase().includes('egg') ? '🥚' : food.name.toLowerCase().includes('avocado') ? '🥑' : food.name.toLowerCase().includes('salmon') ? '🐟' : '🥗')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight truncate group-hover:text-emerald-600 transition-colors">{food.name}</h3>
                        <p className="text-sm text-slate-400 font-bold mt-1">{food.servingSize}</p>
                        {food.custom && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">{t('custom_label')}</span>}
                      </div>
                    </div>
                    <div className="col-span-7 w-full grid grid-cols-4 md:grid-cols-5 gap-4 items-center border-t md:border-t-0 border-slate-50 dark:border-slate-800 pt-4 md:pt-0 mt-2 md:mt-0">
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">{t('kcal_short')}</span>
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{food.calories}</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">{t('protein_short')}</span>
                        <span className="text-lg font-bold text-blue-600">{food.protein}g</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">{t('carbs_short')}</span>
                        <span className="text-lg font-bold text-emerald-600">{food.carbs}g</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">{t('fat_short')}</span>
                        <span className="text-lg font-bold text-amber-600">{food.fats}g</span>
                      </div>
                      <div className="hidden md:flex justify-center gap-2">
                        <button onClick={() => deleteFood(food.id)} className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white transition-all" title={t('delete_label')}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!isCtxLoading && foodItems.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_foods_found')}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t('library_empty_msg')}</p>
                </div>
              )}
              
              {!isCtxLoading && foodItems.filter(food => matchFood(food, search) && matchesCat(food.category)).length > visibleCount && (
                <div ref={observerTarget} className="w-full h-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div 
                onClick={() => onNavigate('food-create')}
                className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all p-6 cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <Plus className="text-slate-400 group-hover:text-emerald-500 w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">{t('create_custom_food')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'supplements' && (
          <div className="flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <div className="col-span-5">{t('supplement_col')}</div>
              <div className="col-span-3">{t('serving_col')}</div>
              <div className="col-span-4">{t('best_time')}</div>
            </div>

            <div className="flex flex-col gap-4">
              {supplementsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-slate-500 font-bold text-lg">{t('loading_library')}</p>
                </div>
              ) : (
              supplementsList
                .filter(s => s.language === language)
                .filter(s => matchFood(s, search) && matchesCat(s.category))
                .map((supp) => (
                <div key={supp.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 flex items-center gap-6">
                      <div className="w-16 h-16 shrink-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {supp.emoji || '💊'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">{supp.name}</h3>
                          {supp.category && <span className="hidden sm:inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">{supp.category}</span>}
                        </div>
                        {supp.purpose && <p className="text-sm text-slate-400 font-medium line-clamp-1">{supp.purpose}</p>}
                      </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col md:block">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">{t('serving_col')}</span>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{supp.recommended_dose || '--'}</div>
                    </div>

                    <div className="md:col-span-4 flex flex-col md:block">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">{t('best_time')}</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{supp.timing || '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )))}

              <div 
                onClick={() => onNavigate('supplement-create')}
                className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all p-6 cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <div className="flex items-center gap-3">
                  <Plus className="text-slate-400 group-hover:text-emerald-500 w-6 h-6" />
                  <span className="font-bold text-lg text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">{t('add_custom_supplement')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
