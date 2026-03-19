import React, { useState } from 'react';
import { trainingPrograms } from '../constants/training';
import { useClient } from '../context/ClientContext';

interface AssignProgramProps {
  clientId: string;
  onBack: () => void;
  onAssign: (programId: string) => void;
  onCreateScratch: () => void;
}

const AssignProgram: React.FC<AssignProgramProps> = ({ clientId, onBack, onAssign, onCreateScratch }) => {
  const { clients } = useClient();
  const client = clients.find(c => c.id === clientId as any) || {
    name: 'Unknown Client',
    avatar: '',
    phase: 'No phase'
  };
  const [selectedProgramId, setSelectedProgramId] = useState<string>(trainingPrograms[0].id);
  const selectedProgram = trainingPrograms.find(p => p.id === selectedProgramId) || trainingPrograms[0];

  return (
    <div className="flex-1 flex flex-col min-h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 md:p-6 pb-20">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span onClick={onBack} className="hover:text-emerald-500 cursor-pointer transition-colors">Training</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-medium text-slate-900">{client.name}</span>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
                    style={{ backgroundImage: `url("${client.avatar}")` }}
                  ></div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{client.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-500">flag</span>
                      Goal: {client.phase === 'Not Assigned' ? 'Muscle Gain' : client.phase}
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="text-slate-400">32 yrs</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                <span className="material-symbols-outlined text-slate-400">info</span>
                <span className="text-sm font-bold text-slate-600">
                  Status: <span className="text-amber-500">No Plan Yet</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content: Program List */}
            <div className="w-full lg:w-[70%] space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-1.5 rounded-xl">library_add</span>
                Assign Training Program
              </h2>

              <div className="flex flex-col gap-4">
                {/* Create from Scratch */}
                <div 
                  onClick={onCreateScratch}
                  className="group relative bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-white">add</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Create from Scratch</h3>
                    <p className="text-sm text-slate-500 font-medium">Build a fully custom program tailored to specific needs.</p>
                  </div>
                </div>

                {/* Program Templates */}
                {trainingPrograms.map((program) => (
                  <div 
                    key={program.id}
                    onClick={() => setSelectedProgramId(program.id)}
                    className={`group p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                      selectedProgramId === program.id 
                        ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10' 
                        : 'bg-white border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Left: Icon/Type */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className={`relative w-20 h-28 rounded-2xl flex items-center justify-center overflow-hidden transition-colors ${
                          selectedProgramId === program.id ? 'bg-emerald-50' : 'bg-slate-50'
                        }`}>
                          <span className="material-symbols-outlined text-5xl text-slate-200 absolute opacity-20">accessibility_new</span>
                          <span className={`material-symbols-outlined text-4xl ${
                            selectedProgramId === program.id ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {program.focus.includes('Running') ? 'directions_run' : 
                             program.focus.includes('Mobility') ? 'self_improvement' : 'fitness_center'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{program.focus.split(' ')[0]}</span>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{program.name}</h3>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider border ${
                              program.level === 'Beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              program.level === 'Intermediate' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              program.level === 'Advanced' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                              {program.level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-6">{program.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              <span>Intensity</span>
                              <span className="text-slate-900">{program.level === 'Beginner' ? 'Low' : program.level === 'Intermediate' ? 'Moderate' : 'High'}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${
                                program.level === 'Beginner' ? 'bg-emerald-400 w-[30%]' : 
                                program.level === 'Intermediate' ? 'bg-amber-400 w-[60%]' : 'bg-red-400 w-[85%]'
                              }`}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              <span>Volume</span>
                              <span className="text-slate-900">Medium</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 w-[50%] rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span> {program.frequency}x / week</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">timer</span> {program.duration} min</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-400">bolt</span> {program.focus}</span>
                        </div>
                      </div>

                      {/* Right: Schedule */}
                      <div className="md:w-48 pt-4 md:pt-0 md:border-l border-slate-100 md:pl-8 flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Schedule</div>
                        <div className="flex justify-between items-center relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10 rounded-full"></div>
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                            const isActive = program.schedule.includes(day);
                            return (
                              <div key={idx} className="flex flex-col items-center gap-1 z-0">
                                {isActive ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20 ring-2 ring-white">
                                    {day}
                                  </div>
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
                          {program.frequency} days active
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: Settings & Preview */}
            <div className="w-full lg:w-[30%] flex flex-col gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Program Settings</h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weekly Frequency</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map(freq => (
                        <button 
                          key={freq}
                          className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            selectedProgram.frequency === freq 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                          }`}
                        >
                          {freq}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Focus</label>
                    <div className="relative">
                      <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pl-4 pr-10 text-sm font-bold text-slate-700 focus:ring-emerald-500 focus:border-emerald-500 appearance-none outline-none transition-all">
                        <option>{selectedProgram.focus}</option>
                        <option>Hypertrophy</option>
                        <option>Endurance</option>
                        <option>Mobility</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Program Preview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{selectedProgram.name}</div>
                          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Selected Template</div>
                        </div>
                      </div>
                      <div className="h-px bg-slate-200 w-full"></div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {selectedProgram.description} Ideally suited for {selectedProgram.level.toLowerCase()}s. Focuses on building a solid foundation.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onAssign(selectedProgramId)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    <span className="material-symbols-outlined text-[22px]">assignment_add</span>
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
};

export default AssignProgram;
