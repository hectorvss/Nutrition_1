import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  ChevronRight,
  MoreVertical,
  Flame,
  PieChart
} from 'lucide-react';
import { foodCategories } from '../constants/foods';
import { useFoodContext } from '../context/FoodContext';
import { useLanguage } from '../context/LanguageContext';
interface FoodLibraryProps {
  onBack: () => void;
}


export default function FoodLibrary({ onBack }: FoodLibraryProps) {
  const { t } = useLanguage();
  const { foods } = useFoodContext();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button onClick={onBack} className="hover:text-emerald-600 transition-colors">{t('nutrition')}</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{t('food_library_btn')}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-500" />
            {t('food_recipe_library')}
          </h2>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold">
          <Plus className="w-5 h-5" />
          {t('add_custom_food')}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Sidebar: Categories */}
        <div className="lg:w-64 shrink-0 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('categories')}</h3>
            <div className="space-y-1">
              {foodCategories.map((cat, idx) => (
                <button 
                  key={idx}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    idx === 0 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">Smart Search</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Search by nutrient density, glycemic index, or specific dietary requirements.
            </p>
          </div>
        </div>

        {/* Main: Food List */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Filters and Search removed as requested */}

          {/* Grid */}
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {foods
                .filter(food => {
                  const matchSearch = !search || food.name.toLowerCase().includes(search.toLowerCase());
                  const matchCat = activeCategory === 'All Categories' || food.category === activeCategory;
                  return matchSearch && matchCat;
                })
                .map((food) => (
                <div key={food.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest mb-2 inline-block">
                        {food.category}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{food.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{food.servingSize}</p>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-bold text-slate-700">{food.calories}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">kcal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100 group-hover:border-blue-100 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('protein_label')}</p>
                      <p className="text-sm font-bold text-blue-600">{food.protein}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100 group-hover:border-emerald-100 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('carbs_label')}</p>
                      <p className="text-sm font-bold text-emerald-600">{food.carbs}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100 group-hover:border-amber-100 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('fats_label')}</p>
                      <p className="text-sm font-bold text-amber-600">{food.fats}g</p>
                    </div>
                  </div>

                  {/* Hover Action */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
