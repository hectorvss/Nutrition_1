import React from 'react';
import { 
  ArrowLeft, 
  Grid, 
  Plus, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Settings2,
  Utensils,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NutritionPlanTemplatesProps {
  client?: any;
  onBack: () => void;
  onSelect: (isNew?: boolean, templateId?: string | number) => void;
}

export default function NutritionPlanTemplates({ client, onBack, onSelect }: NutritionPlanTemplatesProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/manager/nutrition-templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          // Map backend fields to frontend UI expectations
          const formatted = data.map(t => ({
            id: t.key || t.id,
            name: t.name,
            calories: t.target_calories || 0,
            desc: t.description || '',
            type: t.name.includes('Bulk') || t.name.includes('Gain') ? 'High Carb' : 'Balanced', // heuristic
            typeColor: t.name.includes('Bulk') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600',
            macros: t.data_json?.macros || { p: 30, c: 40, f: 30 },
            weekView: [80, 80, 80, 80, 80, 80, 80], // placeholder for list icon
            stats: `${t.data_json?.meals?.length || 3} ${t('meals')}`
          }));
          setTemplates(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const selectedTemplateId = client?.recommendedNutritionId;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ... Header remains same ... */}
      <div className="p-4 md:p-6 pb-2">
        {/* ... */}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 lg:basis-[70%] flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-emerald-500" />
              {t('start_from_template')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-sm font-medium">{t('loading_templates')}</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onSelect(true)}
                  className="group w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-slate-700">{t('create_new_plan')}</h3>
                      <p className="text-sm text-slate-500">{t('create_new_plan_desc')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </button>

                {templates.map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => onSelect(false, template.id)}
                    className={`group w-full bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer relative flex flex-col sm:flex-row items-center gap-6 ${
                      selectedTemplateId === template.id ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-200'
                    }`}
                  >
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-3 right-3 text-emerald-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}

                    {client?.recommendedNutritionId === template.id && (
                      <div className="absolute top-3 right-3 sm:right-auto sm:left-3 flex items-center gap-1.5 px-2 py-1 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 z-10 animate-bounce-subtle">
                        <Flame className="w-3 h-3 fill-current" />
                        {t('recommended')}
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('week_view_label')}</span>
                        <span className="text-[10px] font-bold text-slate-500">{template.stats}</span>
                      </div>
                      <div className="flex gap-1 h-8 items-end justify-between">
                        {template.weekView.map((h: number, i: number) => (
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
              </>
            )}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="flex-1 lg:basis-[30%] flex flex-col gap-6 overflow-y-auto pr-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('template_preview')}</h3>
            <p className="text-sm text-slate-500">
              {t('template_preview_desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm h-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900">{t('plan_settings')}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">{t('target_calories')}</label>
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
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">{t('daily_structure')}</label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer">
                    <option>{t('three_meals')}</option>
                    <option>{t('three_meals_one_snack')}</option>
                    <option>{t('three_meals_two_snacks')}</option>
                    <option>{t('four_meals')}</option>
                    <option>{t('five_meals')}</option>
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">{t('macro_split')}</label>
                <div className="relative">
                  <PieChart className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer">
                    <option>{t('balanced_option')}</option>
                    <option>{t('low_carb_option')}</option>
                    <option selected>{t('high_carb_option')}</option>
                    <option>{t('ketogenic_option')}</option>
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button 
                onClick={() => onSelect(false, selectedTemplateId)}
                disabled={!selectedTemplateId}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group ${
                  selectedTemplateId 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 group-hover:animate-pulse" />
                {t('create_draft_plan')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
