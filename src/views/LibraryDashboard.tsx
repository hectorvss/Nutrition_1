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
  Heart,
  Trash2,
  Loader2
} from 'lucide-react';
import { recipes, supplements } from '../constants/library';
import { useFoodContext } from '../context/FoodContext';

type Tab = 'recipes' | 'food' | 'supplements';

interface LibraryDashboardProps {
  onNavigate: (view: string) => void;
}

export default function LibraryDashboard({ onNavigate }: LibraryDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(30);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { foods: foodItems, deleteFood, isLoading: isCtxLoading } = useFoodContext();

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
    <div className="max-w-[1400px] mx-auto p-6 md:p-8 lg:p-10 h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-500" />
            Library
          </h2>
          <p className="text-slate-500 font-medium mt-1">Manage your nutrition resources</p>
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
          {activeTab === 'recipes' ? 'New Recipe' : activeTab === 'food' ? 'Add New Food' : 'Add New Supplement'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        {(['recipes', 'food', 'supplements'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (activeTab === tab) return;
              setIsLoading(true);
              setTimeout(() => {
                setActiveTab(tab);
                setIsLoading(false);
              }, 400); // artificially slightly slow it down to show a mask
            }}
            className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'recipes' ? 'Recipes' : tab === 'food' ? 'Food Database' : 'Supplements'}
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
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
            placeholder={`Search ${activeTab}...`}
            type="text"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Filter className="w-5 h-5" />
          Show Filters
          <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">2</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-20">
        {isLoading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
             <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
             <span className="font-bold">Loading Library...</span>
          </div>
        ) : activeTab === 'recipes' && (
          <div className="flex flex-col gap-6">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                onClick={() => onNavigate('recipe-detail')}
                className="group bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-52 hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="relative w-full sm:w-72 h-52 sm:h-full flex-shrink-0 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-700">{recipe.rating}</span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col sm:flex-row flex-1 gap-8 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-2xl text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">{recipe.category}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
                      A nutritious bowl packed with omega-3 fatty acids, fiber, and fresh greens. Perfect for post-workout recovery and sustained energy throughout the day.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-8 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-6 sm:pt-0 sm:pl-8">
                    <div className="flex flex-row sm:flex-col gap-6 sm:gap-3 text-sm font-bold text-slate-400 mr-auto sm:mr-0 text-right">
                      <div className="flex items-center sm:justify-end gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-slate-700">{recipe.calories} kcal</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-700">{recipe.prepTime} min</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                        <Heart className="w-6 h-6" />
                      </button>
                      <button className="p-3 rounded-2xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div 
              onClick={() => onNavigate('recipe-create')}
              className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-emerald-500/50 transition-all cursor-pointer group p-8 flex items-center justify-center h-24"
            >
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-emerald-500 transition-all">
                <Plus className="w-6 h-6" />
                <span className="font-bold text-xl">Create Custom Recipe</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <div className="col-span-5">Food Item</div>
              <div className="col-span-7 grid grid-cols-5 gap-4 text-center">
                <div>Kcal</div>
                <div>Protein</div>
                <div>Carbs</div>
                <div>Fat</div>
                <div>Actions</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {isCtxLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-slate-500 font-bold text-lg">Loading Food Library...</p>
                </div>
              ) : foodItems
                .filter(food => !search || food.name.toLowerCase().includes(search.toLowerCase()))
                .slice(0, visibleCount)
                .map((food) => (
                <div key={food.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all p-4 md:p-6">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                    <div className="col-span-5 w-full flex items-center gap-6">
                      <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                        {food.emoji || (food.name.toLowerCase().includes('chicken') ? '🍗' : food.name.toLowerCase().includes('egg') ? '🥚' : food.name.toLowerCase().includes('avocado') ? '🥑' : food.name.toLowerCase().includes('salmon') ? '🐟' : '🥗')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xl text-slate-900 leading-tight truncate group-hover:text-emerald-600 transition-colors">{food.name}</h3>
                        <p className="text-sm text-slate-400 font-bold mt-1">{food.servingSize}</p>
                        {food.custom && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Custom</span>}
                      </div>
                    </div>
                    <div className="col-span-7 w-full grid grid-cols-4 md:grid-cols-5 gap-4 items-center border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 mt-2 md:mt-0">
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Kcal</span>
                        <span className="text-lg font-bold text-slate-700">{food.calories}</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Prot</span>
                        <span className="text-lg font-bold text-blue-600">{food.protein}g</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Carb</span>
                        <span className="text-lg font-bold text-emerald-600">{food.carbs}g</span>
                      </div>
                      <div className="flex flex-col md:block text-center">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1">Fat</span>
                        <span className="text-lg font-bold text-amber-600">{food.fats}g</span>
                      </div>
                      <div className="hidden md:flex justify-center gap-2">
                        <button onClick={() => deleteFood(food.id)} className="p-3 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!isCtxLoading && foodItems.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No foods found</h3>
                  <p className="text-slate-500">Your library is currently empty. Wait for the population script or start by adding a new food.</p>
                </div>
              )}
              
              {!isCtxLoading && foodItems.filter(food => !search || food.name.toLowerCase().includes(search.toLowerCase())).length > visibleCount && (
                <div ref={observerTarget} className="w-full h-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div 
                onClick={() => onNavigate('food-create')}
                className="bg-white border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all p-6 cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <Plus className="text-slate-400 group-hover:text-emerald-500 w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg text-slate-500 group-hover:text-emerald-600 transition-colors">Create Custom Food Item</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'supplements' && (
          <div className="flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <div className="col-span-5">Supplement</div>
              <div className="col-span-2">Serving</div>
              <div className="col-span-2">Primary Ingredient</div>
              <div className="col-span-2">Best Time</div>
              <div className="col-span-1 text-right">Score</div>
            </div>
            
            <div className="flex flex-col gap-4">
              {supplements.map((supp) => (
                <div key={supp.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 flex items-center gap-6">
                      <div className="w-16 h-16 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:scale-110 transition-transform">
                        {supp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-xl text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{supp.name}</h3>
                          <span className="hidden sm:inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">{supp.category}</span>
                        </div>
                        <p className="text-sm text-slate-400 font-bold truncate">{supp.brand} • {supp.serving}</p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Serving</span>
                      <div className="text-sm font-bold text-slate-700">{supp.serving}</div>
                      <div className="text-xs text-slate-400 font-bold">Daily</div>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Ingredient</span>
                      <div className="text-sm font-bold text-slate-700">{supp.primaryIngredient}</div>
                      <div className="text-xs text-slate-400 font-bold">Micronized</div>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Best Time</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{supp.bestTime}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-1 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Score</span>
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-slate-700">{supp.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={() => onNavigate('supplement-create')}
                className="bg-white border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all p-6 cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <div className="flex items-center gap-3">
                  <Plus className="text-slate-400 group-hover:text-emerald-500 w-6 h-6" />
                  <span className="font-bold text-lg text-slate-500 group-hover:text-emerald-600 transition-colors">Add Custom Supplement</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
