import React from 'react';
import { 
  ArrowLeft, 
  Grid, 
  Filter, 
  Plus, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Settings2,
  Utensils,
  PieChart
} from 'lucide-react';

interface NutritionPlanTemplatesProps {
  client?: any;
  onBack: () => void;
  onSelect: (isNew?: boolean) => void;
}

export default function NutritionPlanTemplates({ client, onBack, onSelect }: NutritionPlanTemplatesProps) {
  const templates = [
    {
      id: 1,
      name: 'Fat Loss Basic',
      calories: 1500,
      desc: 'Conservative cut',
      type: 'Balanced',
      typeColor: 'bg-blue-50 text-blue-600',
      macros: { p: 32, c: 38, f: 30 },
      weekView: [60, 80, 70, 60, 90, 50, 40],
      stats: '3+2'
    },
    {
      id: 2,
      name: 'Active Maintain',
      calories: 1800,
      desc: 'Recommended for current goal',
      type: 'High Carb',
      typeColor: 'bg-purple-50 text-purple-600',
      macros: { p: 25, c: 50, f: 25 },
      weekView: [70, 70, 70, 80, 80, 60, 60],
      stats: '4 meals',
      selected: true
    },
    {
      id: 3,
      name: 'Moderate Gain',
      calories: 2000,
      desc: 'Lean bulk approach',
      type: 'High Protein',
      typeColor: 'bg-red-50 text-red-600',
      macros: { p: 40, c: 35, f: 25 },
      weekView: [80, 80, 80, 80, 80, 80, 80],
      stats: '3+2'
    },
    {
      id: 4,
      name: 'Active Build',
      calories: 2200,
      desc: 'Standard muscle gain',
      type: 'Standard',
      typeColor: 'bg-green-50 text-green-600',
      macros: { p: 30, c: 40, f: 30 },
      weekView: [90, 90, 90, 90, 90, 90, 70],
      stats: '3+3'
    },
    {
      id: 5,
      name: 'Athlete Perform',
      calories: 2500,
      desc: 'Sport performance',
      type: 'High Energy',
      typeColor: 'bg-yellow-50 text-yellow-600',
      macros: { p: 25, c: 48, f: 27 },
      weekView: [100, 100, 100, 100, 100, 100, 60],
      stats: '4+2'
    },
    {
      id: 6,
      name: 'Mass Builder',
      calories: 2800,
      desc: 'Significant surplus',
      type: 'High Carb',
      typeColor: 'bg-purple-50 text-purple-600',
      macros: { p: 25, c: 55, f: 20 },
      weekView: [100, 100, 100, 100, 100, 100, 100],
      stats: '5 meals'
    },
    {
      id: 7,
      name: 'Power Lifting',
      calories: 3100,
      desc: 'Strength focus',
      type: 'Balanced+',
      typeColor: 'bg-blue-50 text-blue-600',
      macros: { p: 30, c: 40, f: 30 },
      weekView: [100, 100, 100, 100, 100, 100, 100],
      stats: '5+1'
    },
    {
      id: 8,
      name: 'Extreme Bulk',
      calories: 3300,
      desc: 'Maximum surplus',
      type: 'Max Carb',
      typeColor: 'bg-red-50 text-red-600',
      macros: { p: 20, c: 60, f: 20 },
      weekView: [100, 100, 100, 100, 100, 100, 100],
      stats: '6 meals'
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Breadcrumb & Header */}
      <div className="p-4 md:p-6 pb-2">
        <nav className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors">
                Nutrition
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                <span className="text-slate-800 font-medium">{client?.name || 'Sarah Jenkins'}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}")` }} 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900">{client?.name || 'Sarah Jenkins'}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                Goal: {client?.goal || 'Fat Loss'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                Female, 28
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                68kg
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              {client?.macros ? 'Active Plan' : 'No Plan Yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Column: Templates */}
        <div className="flex-1 lg:basis-[70%] flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-emerald-500" />
              Start from a Template
            </h2>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
            {/* Create New Plan Card */}
            <button 
              onClick={() => onSelect(true)}
              className="group w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-slate-700">Create New Plan</h3>
                  <p className="text-sm text-slate-500">Start from scratch with custom macros</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            {/* Template Cards */}
            {templates.map((template) => (
              <div 
                key={template.id}
                onClick={() => onSelect(false)}
                className={`group w-full bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer relative flex flex-col sm:flex-row items-center gap-6 ${
                  template.selected ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-200'
                }`}
              >
                {template.selected && (
                  <div className="absolute top-3 right-3 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                {client?.recommendedNutritionId === template.id && (
                  <div className="absolute top-3 right-3 sm:right-auto sm:left-3 flex items-center gap-1.5 px-2 py-1 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 z-10 animate-bounce-subtle">
                    <Flame className="w-3 h-3 fill-current" />
                    Recommended
                  </div>
                )}
                
                {/* Calories & Info */}
                <div className="w-full sm:w-1/4 flex-shrink-0 flex sm:block flex-col items-center text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-4">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start text-orange-500 font-bold text-xl mb-1">
                    <Flame className="w-5 h-5" />
                    {template.calories.toLocaleString()}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{template.desc}</p>
                </div>

                {/* Macros Bar */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`${template.typeColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide`}>
                      {template.type}
                    </span>
                    <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{template.macros.p}% P</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{template.macros.c}% C</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{template.macros.f}% F</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${template.macros.p}%` }}></div>
                    <div className="bg-emerald-500 h-full" style={{ width: `${template.macros.c}%` }}></div>
                    <div className="bg-amber-500 h-full" style={{ width: `${template.macros.f}%` }}></div>
                  </div>
                </div>

                {/* Week View Chart */}
                <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Week View</span>
                    <span className="text-[10px] font-bold text-slate-500">{template.stats}</span>
                  </div>
                  <div className="flex gap-1 h-8 items-end justify-between">
                    {template.weekView.map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 rounded-t-sm transition-all ${i >= 5 ? 'bg-emerald-500/60' : 'bg-slate-200'}`} 
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="flex-1 lg:basis-[30%] flex flex-col gap-6 overflow-y-auto pr-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Template Preview</h3>
            <p className="text-sm text-slate-500">
              Select a template on the left to see detailed meal distribution and macro breakdowns here.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm h-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900">Plan Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Target Calories</label>
                <div className="relative">
                  <Flame className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold" 
                    type="number" 
                    defaultValue="1800"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase">kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Daily Structure</label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer">
                    <option>3 Meals</option>
                    <option selected>3 Meals + 1 Snack</option>
                    <option>3 Meals + 2 Snacks</option>
                    <option>4 Meals</option>
                    <option>5 Meals</option>
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Macro Split</label>
                <div className="relative">
                  <PieChart className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer">
                    <option>Balanced (40/30/30)</option>
                    <option>Low Carb (40/40/20)</option>
                    <option selected>High Carb (25/50/25)</option>
                    <option>Ketogenic (20/5/75)</option>
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button 
                onClick={() => onSelect(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:animate-pulse" />
                Create Draft Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
