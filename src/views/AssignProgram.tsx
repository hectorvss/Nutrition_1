import React, { useState } from 'react';
import { trainingPrograms } from '../constants/training';
import { PROGRAM_TEMPLATES } from '../constants/training_presets';
import { useClient } from '../context/ClientContext';
import { fetchWithAuth } from '../api';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

interface AssignProgramProps {
  clientId: string;
  onBack: () => void;
  onAssign: (programId: string, dataJson: any) => void;
  onCreateScratch: () => void;
}

const AssignProgram: React.FC<AssignProgramProps> = ({ clientId, onBack, onAssign, onCreateScratch }) => {
  const { t } = useLanguage();
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId as any) || {
    name: t('unknown_client'),
    avatar: '',
    phase: t('no_phase')
  };
  const [selectedProgramId, setSelectedProgramId] = useState<string>(trainingPrograms[0].id);
  const selectedProgram = trainingPrograms.find(p => p.id === selectedProgramId) || trainingPrograms[0];
  const [frequency, setFrequency] = useState<number>(trainingPrograms[0].frequency);
  const [focus, setFocus] = useState<string>(trainingPrograms[0].focus);

  // When the selected program changes, sync the editable settings to its defaults.
  React.useEffect(() => {
    setFrequency(selectedProgram.frequency);
    setFocus(selectedProgram.focus);
  }, [selectedProgramId]);

  const handleAssign = async () => {
    // Get the template for the selected program
    const template = PROGRAM_TEMPLATES[selectedProgramId];

    // Prepare the data_json structure
    const dataJson = {
      name: selectedProgram.name,
      level: selectedProgram.level,
      focus: focus,
      frequency: frequency,
      duration: selectedProgram.duration,
      schedule: selectedProgram.schedule,
      description: selectedProgram.description,
      // Store the full list of available workouts for this program
      workouts: template?.workouts || [],
      // Store the mapping of days to specific workout IDs
      weeklySchedule: template?.defaultSchedule || {}
    };

    onAssign(selectedProgramId, dataJson);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 md:p-6 pb-20">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span onClick={onBack} className="hover:text-emerald-500 cursor-pointer transition-colors">{t('training')}</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-medium text-slate-900 dark:text-white">{client.name}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {client.avatar ? (
                    <div
                      className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm"
                      style={{ backgroundImage: `url("${client.avatar}")` }}
                    ></div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 shadow-sm flex items-center justify-center text-emerald-500 dark:text-emerald-400 font-bold text-2xl">
                      {String(client.name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{client.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-500">flag</span>
                      {t('goal')}: {(client as any).goal || t('not_assigned')}
                    </div>
                    {(client as any).age && (
                      <>
                        <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="text-slate-400">{(client as any).age} {t('years_short')}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-400">info</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {t('status')}: <span className="text-amber-500 dark:text-amber-400">{t('no_plan_yet')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content: Program List */}
            <div className="w-full lg:w-[70%] space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-xl">library_add</span>
                {t('assign_training_program')}
              </h2>

              <div className="flex flex-col gap-4">
                {/* Create from Scratch */}
                <div 
                  onClick={onCreateScratch}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all cursor-pointer flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-white">add</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('create_from_scratch', { defaultValue: 'Crear desde cero' })}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('create_scratch_program_desc')}</p>
                  </div>
                </div>

                {/* Program Templates */}
                {trainingPrograms.map((program) => (
                  <div 
                    key={program.id}
                    onClick={() => setSelectedProgramId(program.id)}
                    className={`group p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                      selectedProgramId === program.id
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Left: Icon/Type */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className={`relative w-20 h-28 rounded-2xl flex items-center justify-center overflow-hidden transition-colors ${
                          selectedProgramId === program.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800'
                        }`}>
                          <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 absolute opacity-20">accessibility_new</span>
                          <span className={`material-symbols-outlined text-4xl ${
                            selectedProgramId === program.id ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {program.focus.includes('Running') ? 'directions_run' : 
                             program.focus.includes('Mobility') ? 'self_improvement' : 'fitness_center'}
                          </span>
                          
                          {client?.recommendedTrainingId === program.id && (
                            <div className="absolute top-0 right-0 left-0 bg-blue-500 text-white py-0.5 px-1 text-[8px] font-black uppercase text-center tracking-tighter">
                              {t('recommended')}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{program.focus.split(' ')[0]}</span>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{program.name}</h3>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider border ${
                              program.level === 'Beginner' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' :
                              program.level === 'Intermediate' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40' :
                              program.level === 'Advanced' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40' :
                              'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40'
                            }`}>
                              {program.level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mb-6">{program.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              <span>{t('intensity')}</span>
                              <span className="text-slate-900 dark:text-white">{program.level === 'Beginner' ? t('low') : program.level === 'Intermediate' ? t('moderate') : t('high')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${
                                program.level === 'Beginner' ? 'bg-emerald-400 w-[30%]' : 
                                program.level === 'Intermediate' ? 'bg-amber-400 w-[60%]' : 'bg-red-400 w-[85%]'
                              }`}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              <span>{t('volume')}</span>
                              <span className="text-slate-900 dark:text-white">{t('medium')}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 w-[50%] rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span> {program.frequency}x / week</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">timer</span> {program.duration} min</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">bolt</span> {program.focus}</span>
                        </div>
                      </div>

                      {/* Right: Schedule */}
                      <div className="md:w-48 pt-4 md:pt-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8 flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('schedule')}</div>
                        <div className="flex justify-between items-center relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                            const isActive = program.schedule.includes(day);
                            return (
                              <div key={idx} className="flex flex-col items-center gap-1 z-0">
                                {isActive ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20 ring-2 ring-white dark:ring-slate-900">
                                    {day}
                                  </div>
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
                          {t('days_active_count', { count: program.frequency })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: Settings & Preview */}
            <div className="w-full lg:w-[30%] flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t('program_settings')}</h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('weekly_frequency')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFrequency(freq)}
                          className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            frequency === freq
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-200'
                          }`}
                        >
                          {freq}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('primary_focus')}</label>
                    <Select
                      value={focus}
                      onChange={(val) => setFocus(val)}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={selectedProgram.focus}>{selectedProgram.focus}</option>
                      <option value={t('training_phase_hypertrophy')}>{t('training_phase_hypertrophy')}</option>
                      <option value={t('training_focus_endurance')}>{t('training_focus_endurance')}</option>
                      <option value={t('training_focus_mobility')}>{t('training_focus_mobility')}</option>
                    </Select>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('program_preview')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{selectedProgram.name}</div>
                          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('selected_template')}</div>
                        </div>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {selectedProgram.description}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleAssign}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    <span className="material-symbols-outlined text-[22px]">assignment_add</span>
                    {t('assign_program')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProgram;
