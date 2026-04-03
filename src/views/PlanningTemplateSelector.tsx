import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Grid, 
  Filter, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Settings2,
  Calendar,
  Layers,
  Zap,
  Target
} from 'lucide-react';

interface PlanningTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  phases: number;
  goalType: string;
  intensity: 'low' | 'moderate' | 'high';
  roadmapPreview: string; // Text summary or simplified visual
  badge?: string;
}

interface PlanningTemplateSelectorProps {
  client?: any;
  onBack: () => void;
  onSelect: (templateId: string, settings: any) => void;
}

// Helper: ICON COMPONENT (Material Symbols compatibility)
const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>{name}</span>
);

export default function PlanningTemplateSelector({ client, onBack, onSelect }: PlanningTemplateSelectorProps) {
  const templates: PlanningTemplate[] = [
    {
      id: 'pt1',
      name: 'Fat Loss Foundation',
      description: 'Metabolic adaptation followed by steady deficit',
      duration: 12,
      phases: 3,
      goalType: 'Fat Loss',
      intensity: 'low',
      badge: 'Balanced',
      roadmapPreview: 'Maintain (4w) → Deficit (4w) → Reverse (4w)'
    },
    {
      id: 'pt2',
      name: 'Recomposition Starter',
      description: 'Simultaneous fat loss and muscle retention',
      duration: 16,
      phases: 4,
      goalType: 'Recomp',
      intensity: 'moderate',
      badge: 'High Carb',
      roadmapPreview: 'Maintenance (4w) → Body Recomp (8w) → Consolidation (4w)'
    },
    {
      id: 'pt3',
      name: 'Muscle Gain Base',
      description: 'Progressive surplus with volume peaking',
      duration: 12,
      phases: 3,
      goalType: 'Muscle Gain',
      intensity: 'high',
      badge: 'High Protein',
      roadmapPreview: 'Hypertrophy Focus (6w) → Strength Peak (6w)'
    },
    {
      id: 'pt4',
      name: 'Performance Build',
      description: 'Athletic capacity and strength optimization',
      duration: 10,
      phases: 2,
      goalType: 'Performance',
      intensity: 'high',
      badge: 'Standard',
      roadmapPreview: 'Power Output (5w) → Skill Integration (5w)'
    },
    {
      id: 'pt5',
      name: 'Lifestyle Reset',
      description: 'Habit formation and health baseline reset',
      duration: 8,
      phases: 2,
      goalType: 'Health',
      intensity: 'low',
      badge: 'Balanced+',
      roadmapPreview: 'Base Reset (4w) → Maintenance Plus (4w)'
    }
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Settings state
  const [settings, setSettings] = useState({
    duration: 12,
    trainingFreq: '4 days/week',
    nutritionApproach: 'High Protein',
    intensityLevel: 'Moderate',
    primaryGoal: 'Fat Loss'
  });

  const handleCreateDraft = () => {
    if (!selectedTemplateId) return;
    onSelect(selectedTemplateId, settings);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Breadcrumb & Header */}
      <div className="p-4 md:p-6 pb-2">
        <nav className="flex text-sm text-slate-500 mb-4 font-medium">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors">
                Planning
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                <span className="text-slate-800 font-bold">{client?.name || 'Sarah Jenkins'}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl shadow-sm">Setup Required</div>
          
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-inner border-2 border-slate-50" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}")` }} 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{client?.name || 'Sarah Jenkins'}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Icon name="target" className="text-slate-400" />
                No Strategic Plan Set
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span className="flex items-center gap-1 uppercase tracking-widest text-[10px] font-bold">
                Female, 28
              </span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Ready to Program
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 pt-2 overflow-hidden">
        {/* Left Column: Templates */}
        <div className="flex-1 lg:basis-[70%] flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Grid className="w-5 h-5 text-emerald-500" />
              Strategic Roadmap Templates
            </h2>
            <button className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
            {/* Create New Roadmap Card (Mirroring Nutrition's "Create New Plan") */}
            <button 
              className="group w-full flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-left leading-tight">
                  <h3 className="font-bold text-lg text-slate-700 uppercase tracking-tight">Custom Strategy</h3>
                  <p className="text-sm text-slate-500 font-medium">Build a roadmap from scratch with manual phases</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            {/* Template Cards */}
            {templates.map((template) => (
              <div 
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`group w-full bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer relative flex flex-col sm:flex-row items-center gap-6 ${
                  selectedTemplateId === template.id ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-200'
                }`}
              >
                {selectedTemplateId === template.id && (
                  <div className="absolute top-4 right-4 text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                
                {/* Duration & Basic Info (Mirroring Nutrition Calories/Name) */}
                <div className="w-full sm:w-1/4 flex-shrink-0 flex sm:block flex-col items-center text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-6">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start text-emerald-600 font-bold text-xl mb-1">
                    <Calendar className="w-5 h-5" />
                    {template.duration} Weeks
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight uppercase tracking-tight">{template.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">{template.description}</p>
                </div>

                {/* Strategy Summary Info (Mirroring Macros Bar) */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-widest border border-emerald-100">
                      {template.badge || 'Standard'}
                    </span>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        {template.phases} Phases
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {template.intensity} Intensity
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                      {/* Simple visual preview based on phases */}
                      {Array.from({ length: template.phases }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-full border-r border-white last:border-0 ${
                            idx % 2 === 0 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${100 / template.phases}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 italic tracking-tight flex items-center gap-2">
                    <Icon name="route" className="text-slate-400" />
                    {template.roadmapPreview}
                  </p>
                </div>

                {/* Small Visual Chart (Mirroring Week View Chart) */}
                <div className="hidden sm:flex w-full sm:w-1/5 flex-shrink-0 flex-col pl-6 border-l border-slate-100 h-20 justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Load Projection</span>
                  </div>
                  <div className="flex gap-1.5 h-10 items-end justify-between">
                    {[40, 60, 80, 70, 90, 100, 80, 60, 40].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-2 rounded-full transition-all ${h > 80 ? 'bg-emerald-500' : 'bg-slate-200'}`} 
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
        <div className="flex-1 lg:basis-[30%] flex flex-col gap-6 overflow-y-auto pr-1 scrollbar-hide">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
              <Eye className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">Template Preview</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {selectedTemplate 
                ? `You've selected ${selectedTemplate.name}. Initial block distribution: ${selectedTemplate.roadmapPreview}.`
                : "Select a strategic template on the left to see the initial roadmap distribution and phase breakdown here."
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-6 shadow-sm flex-1">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-tight">Planning Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">Total Duration</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Icon name="schedule" className="text-[20px]" />
                  </div>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer"
                    value={settings.duration}
                    onChange={(e) => setSettings({...settings, duration: Number(e.target.value)})}
                  >
                    <option value={8}>8 Weeks</option>
                    <option value={10}>10 Weeks</option>
                    <option value={12}>12 Weeks</option>
                    <option value={16}>16 Weeks</option>
                    <option value={20}>20 Weeks</option>
                  </select>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">Training Frequency</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors">
                    <Icon name="fitness_center" className="text-[20px]" />
                  </div>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer"
                    value={settings.trainingFreq}
                    onChange={(e) => setSettings({...settings, trainingFreq: e.target.value})}
                  >
                    <option>2 days/week</option>
                    <option>3 days/week</option>
                    <option>4 days/week</option>
                    <option>5 days/week</option>
                    <option>6 days/week</option>
                  </select>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">Intensity Level</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-rose-500 transition-colors">
                    <Icon name="speed" className="text-[20px]" />
                  </div>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer"
                    value={settings.intensityLevel}
                    onChange={(e) => setSettings({...settings, intensityLevel: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Moderate</option>
                    <option>Aggressive</option>
                    <option>Elite (Peaking)</option>
                  </select>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1 leading-none">Primary Goal Override</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Icon name="target" className="text-[20px]" />
                  </div>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all appearance-none font-bold cursor-pointer"
                    value={settings.primaryGoal}
                    onChange={(e) => setSettings({...settings, primaryGoal: e.target.value})}
                  >
                    <option>Fat Loss</option>
                    <option>Muscle Gain</option>
                    <option>Body Recomposition</option>
                    <option>Metabolic Reset</option>
                    <option>Endurance Focus</option>
                  </select>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                disabled={!selectedTemplateId}
                onClick={handleCreateDraft}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed border border-transparent active:scale-95 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:animate-pulse" />
                Create Draft Planning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
