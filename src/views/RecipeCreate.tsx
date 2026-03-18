import React from 'react';

interface RecipeCreateProps {
  onBack: () => void;
}

export default function RecipeCreate({ onBack }: RecipeCreateProps) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Library
              </button>
              <h2 className="text-3xl font-bold text-slate-900">Create New Recipe</h2>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-bold">
                Save Draft
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Recipe
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Form */}
            <div className="flex-1 space-y-8 pb-20">
              {/* Basic Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">info</span>
                  Basic Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Recipe Title</label>
                    <input 
                      type="text" 
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                      placeholder="e.g. Mediterranean Quinoa Bowl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all appearance-none">
                        <option>Lunch/Dinner</option>
                        <option>Breakfast</option>
                        <option>Snack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prep Time (min)</label>
                      <input 
                        type="number" 
                        className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none p-4 text-sm font-medium transition-all"
                        placeholder="25"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Recipe Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px] text-emerald-500">add</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">Click to upload or drag and drop</span>
                      <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">shopping_basket</span>
                    Ingredients
                  </h3>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Quinoa, cooked', amount: 150, unit: 'grams' },
                    { name: 'Chicken Breast, grilled', amount: 120, unit: 'grams' },
                    { name: 'Cherry Tomatoes', amount: 80, unit: 'grams' },
                    { name: 'Olive Oil, Extra Virgin', amount: 10, unit: 'ml' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 group hover:border-emerald-500/30 transition-all">
                      <span className="material-symbols-outlined text-slate-300 cursor-move">drag_indicator</span>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 placeholder-slate-400"
                          value={item.name}
                          readOnly
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          className="w-full rounded-xl border-slate-200 bg-white py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                          value={item.amount}
                          readOnly
                        />
                      </div>
                      <div className="w-32">
                        <select className="w-full rounded-xl border-slate-200 bg-white py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500">
                          <option>{item.unit}</option>
                        </select>
                      </div>
                      <button className="text-slate-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Guide */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">menu_book</span>
                    Preparation Guide
                  </h3>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Step
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="relative flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/20">1</div>
                      <div className="w-0.5 h-full bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 focus:ring-0"
                          value="Prepare the Quinoa"
                          readOnly
                        />
                        <div className="flex items-center gap-2">
                          <button className="text-slate-300 hover:text-emerald-500 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
                          <button className="text-slate-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </div>
                      <textarea 
                        className="w-full rounded-2xl border-slate-200 bg-white text-sm p-4 focus:ring-2 focus:ring-emerald-500 min-h-[100px] font-medium"
                        defaultValue="Rinse the quinoa thoroughly in a fine-mesh sieve. In a medium saucepan, combine quinoa and 2 cups of water. Bring to a boil, then reduce heat to low, cover, and simmer for 15 minutes."
                      />
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> 15 min
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">thermostat</span> 100°C
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Stats */}
            <div className="lg:w-96 space-y-8">
              {/* Nutrition Stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Nutrition per Serving</h3>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-400 uppercase tracking-widest">Base Recipe</span>
                </div>
                <div className="p-8">
                  <div className="flex justify-center mb-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                        <circle className="text-emerald-500" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset="110" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">485</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kcal</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {[
                      { label: 'Protein', value: '38g', color: 'bg-emerald-500', percent: 75 },
                      { label: 'Carbs', value: '45g', color: 'bg-blue-500', percent: 60 },
                      { label: 'Fats', value: '14g', color: 'bg-amber-400', percent: 30 }
                    ].map((macro, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-500">{macro.label}</span>
                          <span className="text-slate-900">{macro.value}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`${macro.color} h-2 rounded-full`} style={{ width: `${macro.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client Scale Preview */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">science</span>
                    Client Scale Preview
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Simulate portion adjustments for clients</p>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select Client</label>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500 bg-white shadow-sm cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf0Q3uAjHC8p014ZEXi-XOqgXIRaqRf0R1dawNQFMSEqrtIhBl997C3o6iGILTMLcGdyoP1VfSeZrtgvvQQ-hVjchh-eGdHuWGvBVI19wQvtu4SMW4Qwy809bw1FKZjwadQQ6pkJb5CaIrmomnOXQiloCBpKeBZ00l53VC9TijpiLDgjqcQ_pAw7psb_m0b-dpBrXlwCrZvjZFOJ4BwSxnkeFTJ4H9_DddUPYVgWypgllSmAkHkI6pkuxMW3pn8MYu5aXBRPDKxWoH" alt="Sarah" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">Sarah Jenkins</div>
                        <div className="text-[10px] font-bold text-slate-400">Target: 1,500 kcal / day</div>
                      </div>
                      <span className="material-symbols-outlined text-emerald-500">expand_more</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scaled Values</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">x0.85 Ratio</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: 'Chicken Breast', original: '120g', scaled: '102g', down: true },
                        { name: 'Quinoa', original: '150g', scaled: '127g', down: true },
                        { name: 'Calories', original: '485', scaled: '412 kcal', down: false }
                      ].map((val, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-500">{val.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-slate-300 text-xs">{val.original}</span>
                            <span className="text-emerald-600">{val.scaled}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-2xl border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-sm font-bold">
                    Apply Scale to Client Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
