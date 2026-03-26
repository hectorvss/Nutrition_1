import React, { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';
import { PROGRAM_TEMPLATES } from '../constants/training_presets';
import { trainingPrograms } from '../constants/training';

interface TrainingNoPlanProps {
  client: any;
  onBack: () => void;
  onStartPlan: (dataJson?: any) => void;
}
const PRESETS = [
  {
    id: 'p1',
    title: 'Fuerza Start',
    level: 'Beginner',
    levelColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900',
    type: 'Full Body',
    desc: 'Foundation strength program focusing on compound lifts.',
    intensity: { label: 'Low', pct: 30, color: 'bg-emerald-400' },
    volume: { label: 'Medium', pct: 50, color: 'bg-blue-400' },
    tags: [
      { icon: 'calendar_today', text: '3x / week' },
      { icon: 'timer', text: '45 min' },
      { icon: 'fitness_center', text: 'Strength' }
    ],
    scheduleLabel: 'Mon, Wed, Fri active',
    schedule: ['M', null, 'W', null, 'F', null, null],
    freqValue: '3x',
    focusValue: 'Full Body Strength',
    recommended: ['Not Set']
  },
  {
    id: 'p2',
    title: 'Fuerza Regular',
    level: 'Intermediate',
    levelColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    type: 'Split',
    desc: 'Upper/Lower split designed for intermediate lifters.',
    intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
    volume: { label: 'High', pct: 70, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'timer', text: '60 min' },
      { icon: 'arrow_upward', text: 'Upper/Lower' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', null, 'T', 'F', null, null],
    freqValue: '4x',
    focusValue: 'Full Body Strength',
    recommended: ['Weight Loss']
  },
  {
    id: 'p3',
    title: 'Fuerza Pro',
    level: 'Advanced',
    levelColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    type: 'Hybrid',
    desc: 'High frequency training with specialized blocks.',
    intensity: { label: 'High', pct: 80, color: 'bg-red-400' },
    volume: { label: 'Max', pct: 90, color: 'bg-purple-500' },
    tags: [
      { icon: 'calendar_today', text: '5x / week' },
      { icon: 'timer', text: '75 min' },
      { icon: 'horizontal_split', text: 'PPL' }
    ],
    scheduleLabel: 'Weekdays active',
    schedule: ['M', 'T', 'W', 'T', 'F', null, null],
    freqValue: '5x',
    focusValue: 'Full Body Strength',
    recommended: []
  },
  {
    id: 'p4',
    title: 'Pérdida de Grasa',
    level: 'High Intensity',
    levelColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
    type: 'Cardio',
    desc: 'Metabolic conditioning mixed with strength circuits.',
    intensity: { label: 'Very High', pct: 90, color: 'bg-orange-500' },
    volume: { label: 'High', pct: 75, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'bolt', text: 'Cardio & Strength' },
      { icon: 'directions_run', text: 'HIIT' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', null, 'T', 'F', null, null],
    freqValue: '4x',
    focusValue: 'Endurance',
    recommended: ['Weight Loss']
  },
  {
    id: 'p5',
    title: 'Hipertrofia',
    level: 'Volume',
    levelColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    type: 'Growth',
    desc: 'Maximal hypertrophy focus with moderate intensity.',
    intensity: { label: 'Moderate', pct: 65, color: 'bg-amber-400' },
    volume: { label: 'Very High', pct: 95, color: 'bg-purple-500' },
    tags: [
      { icon: 'calendar_today', text: '5x / week' },
      { icon: 'timer', text: '60 min' },
      { icon: 'expand', text: 'High Volume' }
    ],
    scheduleLabel: 'Weekdays active',
    schedule: ['M', 'T', 'W', 'T', 'F', null, null],
    freqValue: '5x',
    focusValue: 'Hypertrophy',
    recommended: ['Muscle Gain']
  },
  {
    id: 'p6',
    title: 'Movilidad & Recuperación',
    level: 'Restorative',
    levelColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    type: 'Mobility',
    desc: 'Improve flexibility and joint health.',
    intensity: { label: 'Low', pct: 20, color: 'bg-teal-400' },
    volume: { label: 'Low', pct: 30, color: 'bg-teal-400' },
    tags: [
      { icon: 'calendar_today', text: '3x / week' },
      { icon: 'self_improvement', text: 'Mobility' },
      { icon: 'spa', text: 'Yoga' }
    ],
    scheduleLabel: '3 days active',
    schedule: ['M', 'W', 'F'],
    freqValue: '3x',
    focusValue: 'Mobility',
    recommended: ['Maintenance']
  },
  {
    id: 'resistencia',
    title: 'Resistencia',
    level: 'Endurance',
    levelColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
    type: 'Endurance',
    desc: 'Sustained activity training to improve cardiovascular health.',
    intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
    volume: { label: 'High', pct: 85, color: 'bg-blue-500' },
    tags: [
      { icon: 'calendar_today', text: '4x / week' },
      { icon: 'speed', text: 'High Volume' },
      { icon: 'sprint', text: 'Running' }
    ],
    scheduleLabel: '4 days active',
    schedule: ['M', 'T', 'T', 'F'],
    freqValue: '4x',
    focusValue: 'Endurance',
    recommended: ['Performance']
  }
];

const WEEKDAYS = [
  { char: 'M', full: 'Monday' },
  { char: 'T', full: 'Tuesday' },
  { char: 'W', full: 'Wednesday' },
  { char: 'T', full: 'Thursday' },
  { char: 'F', full: 'Friday' },
  { char: 'S', full: 'Saturday' },
  { char: 'S', full: 'Sunday' }
];

export default function TrainingNoPlan({ client, onBack, onStartPlan }: TrainingNoPlanProps) {
  const { assignTrainingPlan, reloadClients } = useClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const clientGoal = client?.goal || 'Not Set';
  
  // Fetch templates from backend on mount
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch('/api/manager/training-templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
        });
        const data = await response.json();
        setTemplates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching templates in NoPlan:', err);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Combine hardcoded PRESETS with DB templates
  const allPresets = [...PRESETS];
  if (Array.isArray(templates)) {
    templates.forEach(t => {
      const existingIdx = allPresets.findIndex(p => p.id === t.key);
      const mapped = {
        id: t.key,
        title: t.name,
        level: t.level || 'Intermediate',
        levelColor: t.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' :
                    t.level === 'Advanced' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
        type: t.type || 'Full Body',
        desc: t.description || 'Template from database',
        intensity: { label: 'Moderate', pct: 60, color: 'bg-amber-400' },
        volume: { label: 'Moderate', pct: 60, color: 'bg-blue-400' },
        tags: [
          { icon: 'calendar_today', text: `${t.weekly_frequency || 3}x / week` },
          { icon: 'timer', text: `${t.data_json?.duration || 60} min` },
          { icon: 'fitness_center', text: t.type || 'Strength' }
        ],
        scheduleLabel: `${t.weekly_frequency || 3} days active`,
        schedule: t.data_json?.schedule || ['M', null, 'W', null, 'F', null, null],
        freqValue: `${t.weekly_frequency || 3}x`,
        focusValue: t.data_json?.focus || 'Full Body Strength',
        recommended: t.data_json?.recommended || [],
        isDbTemplate: true,
        data_json: t.data_json
      };
      if (existingIdx >= 0) {
        allPresets[existingIdx] = mapped;
      } else {
        allPresets.push(mapped);
      }
    });
  }

  // Define recommendations and selection state based on combined presets
  const recommendedPreset = allPresets.find(p => Array.isArray(p.recommended) && p.recommended.includes(clientGoal)) || 
                           allPresets.find(p => p.id === 'p1') || 
                           allPresets[0];
  
  const [selectedId, setSelectedId] = useState<string>(recommendedPreset.id);
  const selectedPreset = allPresets.find(p => p.id === selectedId) || recommendedPreset;

  const handleConfirm = async () => {
    try {
      const selectedProgram = allPresets.find(p => p.id === selectedId) || recommendedPreset;
      let dataJson: any;

      if ((selectedProgram as any).isDbTemplate) {
        dataJson = (selectedProgram as any).data_json;
      } else {
        const template = PROGRAM_TEMPLATES[selectedId];
        const prog = trainingPrograms.find(p => p.id === selectedId) || trainingPrograms[0];

        dataJson = {
          name: prog.name,
          level: prog.level,
          focus: prog.focus,
          frequency: prog.frequency,
          duration: prog.duration,
          schedule: prog.schedule,
          description: prog.description,
          workouts: template?.workouts || [],
          weeklySchedule: template?.defaultSchedule || {}
        };
      }

      await fetchWithAuth(`/manager/clients/${client.id}/training-program`, {
        method: 'POST',
        body: JSON.stringify({
          name: dataJson.name,
          data_json: dataJson
        })
      });

      await reloadClients();
      onStartPlan(dataJson);
    } catch (err) {
      console.error('Error applying training program:', err);
    }
  };

  const handleCreateNew = () => {
    assignTrainingPlan(client.id);
    onStartPlan(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header Breadcrumb & Status */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={onBack} className="hover:text-emerald-500 cursor-pointer transition-colors">Training</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-medium text-slate-900 dark:text-white">{client?.name}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
                  style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{client?.name}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">flag</span>
                    Goal: {clientGoal}
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-1 text-slate-400">
                    {client?.age || '28'} yrs
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400">info</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Status: <span className="text-amber-500 font-bold animate-pulse">No Plan Yet</span></span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Programs */}
          <div className="w-full lg:w-[70%] space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-emerald-500">library_add</span>
              Assign Training Program
            </h2>

            <div className="flex flex-col gap-4">
              {/* Scratch / Blank option */}
              <button 
                onClick={handleCreateNew}
                className="group w-full relative bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">add</span>
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Create from Scratch</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Build a fully custom program tailored to specific needs.</p>
                </div>
              </button>

              {/* Template Cards */}
              {isLoadingTemplates ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading templates...</p>
                </div>
              ) : allPresets.map((preset) => {
                const isSelected = selectedId === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedId(preset.id)}
                    className={`group w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden ${
                      isSelected 
                        ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Left Side: Avatar/Type */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className={`relative w-16 h-24 rounded-lg flex items-center justify-center overflow-hidden ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 absolute opacity-20 z-0">accessibility_new</span>
                          {/* Decorative SVG placeholder similar to the HTML mockup */}
                          <div className="z-10 text-emerald-500">
                             <span className="material-symbols-outlined text-3xl">directions_run</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{preset.type}</span>
                      </div>

                      {/* Middle Side: Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{preset.title}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide border ${preset.levelColor}`}>{preset.level}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{preset.desc}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>Intensity</span>
                              <span>{preset.intensity.label}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${preset.intensity.color} rounded-full`} style={{ width: `${preset.intensity.pct}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>Volume</span>
                              <span>{preset.volume.label}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${preset.volume.color} rounded-full`} style={{ width: `${preset.volume.pct}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {preset.tags.map((tag, tIndex) => (
                            <span key={tIndex} className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px] text-slate-400">{tag.icon}</span> 
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Schedule UI */}
                      <div className="md:w-48 pt-2 md:pt-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-6 flex flex-col justify-center">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          <span>Schedule</span>
                        </div>
                        <div className="flex justify-between items-center relative gap-1">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                          
                          {/* Rendering the 7 days schedule dots */}
                          {WEEKDAYS.map((day, dIdx) => {
                            // Find how many of this day (M, T, W, ...) exist in the preset's schedule array
                            // Simplified for the UI mockup matching: we just map based on the preset.schedule array
                            // which has an exact matching logic in the HTML.
                            // The HTML hardcoded the days active. Let's do a simple check.
                            const isActive = preset.schedule[dIdx] || false; 
                            
                            if (isActive) {
                              return (
                                <div key={dIdx} className="flex flex-col items-center gap-1 z-0">
                                  <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white dark:ring-slate-800 ${isSelected ? 'bg-emerald-600' : 'bg-emerald-500'}`}>{isActive}</div>
                                </div>
                              );
                            } else {
                              return (
                                <div key={dIdx} className="flex flex-col items-center gap-1 z-0">
                                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                              );
                            }
                          })}
                        </div>
                        <div className="mt-3 text-[10px] text-center text-slate-400">{preset.scheduleLabel}</div>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Program Settings</h2>
              
              <div className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Weekly Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['2x', '3x', '4x', '5x'].map((freq) => {
                      const isFreqSelected = selectedPreset.freqValue === freq;
                      return (
                        <button key={freq} className={`p-2 rounded-lg border text-sm transition-colors ${
                          isFreqSelected 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/50' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-medium'
                        }`}>
                          {freq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Primary Focus</label>
                  <select 
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium py-2.5 px-3"
                    value={selectedPreset.focusValue}
                    onChange={() => {}}
                  >
                    <option value="Full Body Strength">Full Body Strength</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Program Preview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedPreset.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Selected Template</div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200 dark:border-slate-700 w-full"></div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {selectedPreset.desc}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleConfirm}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4 group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">assignment_add</span>
                  Assign Program
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
