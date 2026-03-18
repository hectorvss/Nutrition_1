import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Flame, 
  Users, 
  Bookmark, 
  Star, 
  CheckCircle, 
  Zap, 
  Weight, 
  Edit3,
  ChevronRight,
  Plus
} from 'lucide-react';

interface RecipeDetailProps {
  onBack: () => void;
}

export default function RecipeDetail({ onBack }: RecipeDetailProps) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
        {/* Hero Section */}
        <div className="w-full relative h-[400px] lg:h-[500px]">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDf0Q3uAjHC8p014ZEXi-XOqgXIRaqRf0R1dawNQFMSEqrtIhBl997C3o6iGILTMLcGdyoP1VfSeZrtgvvQQ-hVjchh-eGdHuWGvBVI19wQvtu4SMW4Qwy809bw1FKZjwadQQ6pkJb5CaIrmomnOXQiloCBpKeBZ00l53VC9TijpiLDgjqcQ_pAw7psb_m0b-dpBrXlwCrZvjZFOJ4BwSxnkeFTJ4H9_DddUPYVgWypgllSmAkHkI6pkuxMW3pn8MYu5aXBRPDKxWoH")' }}
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
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">Healthy Choice</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">Vegan</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">Gluten Free</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Mediterranean Quinoa Bowl</h1>
                <div className="flex items-center gap-8 text-white/90 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    25 min prep
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    450 kcal
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    2 Servings
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/30 transition-all flex items-center gap-2 font-bold">
                  <Bookmark className="w-5 h-5" />
                  Save
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
                  Ingredients
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Quinoa', amount: '1 cup, uncooked', color: 'bg-orange-100 text-orange-600', char: 'Q' },
                    { name: 'Cherry Tomatoes', amount: '1 cup, halved', color: 'bg-red-100 text-red-600', char: 'T' },
                    { name: 'Cucumber', amount: '1 medium, diced', color: 'bg-green-100 text-green-600', char: 'C' },
                    { name: 'Kalamata Olives', amount: '1/4 cup, pitted', color: 'bg-purple-100 text-purple-600', char: 'O' },
                    { name: 'Feta Cheese', amount: '1/3 cup, crumbled', color: 'bg-yellow-100 text-yellow-600', char: 'F' },
                    { name: 'Olive Oil', amount: '2 tbsp, extra virgin', color: 'bg-slate-100 text-slate-600', char: 'O' }
                  ].map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className={`w-12 h-12 rounded-full ${ing.color} flex items-center justify-center font-bold text-sm`}>{ing.char}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{ing.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{ing.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-emerald-500" />
                  Preparation
                </h2>
                <div className="space-y-8">
                  {[
                    { title: 'Cook the Quinoa', desc: 'Rinse quinoa under cold water. Combine with 2 cups of water in a pot. Bring to a boil, then reduce heat, cover, and simmer for 15 minutes.' },
                    { title: 'Prepare Vegetables', desc: 'While quinoa is cooking, wash and chop the cucumber and cherry tomatoes. Pit the olives if necessary.' },
                    { title: 'Make the Dressing', desc: 'In a small bowl, whisk together olive oil, lemon juice, salt, pepper, and dried oregano until emulsified.' },
                    { title: 'Combine and Serve', desc: 'Fluff the quinoa with a fork. Combine with vegetables and dressing in a large bowl. Top with crumbled feta cheese.' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100">{idx + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                        {idx < 3 && <div className="w-full h-px bg-slate-100 mt-8"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Portion Automation */}
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
                <div className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-500" />
                      Portion Automation
                    </h2>
                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase px-2 py-1 rounded-lg border border-emerald-500/20">Active</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">
                    This recipe automatically scales ingredients based on your client's assigned meal plan goals.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">Muscle Gain</span>
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight">+20% Protein</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">540 kcal</span>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between opacity-50 grayscale">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Weight className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">Weight Loss</span>
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight">-15% Carbs</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-400">380 kcal</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview for:</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD_vMvwpXoLlTvndeGwZKVEVR9LnlKTY7x4v283aQEkHNrFvOf2FkhHnA2XWrpxhHT4mMLcSoItEUxba42nxgxqNNuJvTyVHzS5fD0_swZBoYKN7-CW08PkSgsQQgyX3byp77LYkuTbJDioLGOyeHyuZ54ihPXcsmArA7syTYH1qzDcJmdVBUe6fK_UZWms6dpr23NkxWlBZfBKtVbuDmMxducfpVG6A6mF7ZwEgsfEuv-6bD2fA_NmTqRSu1WbFh9EoRTlr3G3qzI" alt="Mike" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Mike Ross</span>
                      <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold">Muscle Gain</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Quinoa scaled to 1.5 cups (+0.5)
                    </div>
                  </div>
                </div>
              </div>

              {/* Macronutrients */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Macronutrients</h3>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-4xl font-bold text-slate-900 tracking-tight">450 <span className="text-sm font-bold text-slate-400">kcal</span></div>
                  <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">+ High Protein</div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-6">
                  <div className="h-full bg-emerald-500 w-[35%]"></div>
                  <div className="h-full bg-blue-400 w-[45%]"></div>
                  <div className="h-full bg-amber-400 w-[20%]"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Protein</div>
                    <div className="text-sm font-bold text-emerald-600">24g</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Carbs</div>
                    <div className="text-sm font-bold text-blue-500">58g</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fat</div>
                    <div className="text-sm font-bold text-amber-500">16g</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Lunch', 'Quick', 'Summer'].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-2xl text-xs font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-10 right-10 z-20">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white pl-6 pr-8 py-5 rounded-full transition-all shadow-2xl shadow-emerald-500/40 flex items-center gap-4 font-bold text-xl group transform hover:-translate-y-2">
          <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform duration-500">
            <Plus className="w-6 h-6" />
          </div>
          Edit Recipe
        </button>
      </div>
    </div>
  );
}
