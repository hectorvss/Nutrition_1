import React, { useState, useRef, useCallback } from 'react';
import { useClient } from '../context/ClientContext';
import { useExerciseContext, Exercise } from '../context/ExerciseContext';
import { fetchWithAuth } from '../api';

interface WorkoutEditorProps {
  onBack: () => void;
  onEditActivity: (activityId: string, activityName?: string) => void;
  clientId?: string | null;
  mode?: 'default' | 'blank';
}

interface PlannedExercise {
  id: string; 
  exerciseId: string;
  name: string;
  type: string;
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  rest: string;
}

interface WorkoutBlock {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  exercises: PlannedExercise[];
}

export default function WorkoutEditor({ onBack, onEditActivity, clientId, mode = 'default' }: WorkoutEditorProps) {
  const { clients } = useClient();
  const { exercises } = useExerciseContext();
  const client = clients.find(c => c.id === clientId as any) || {
    name: 'Unknown Client',
    avatar: '',
    online: false,
    phase: 'No phase'
  };
  const isBlank = mode === 'blank';

  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing program on mount
  React.useEffect(() => {
    const loadProgram = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/training-program`);
        if (data && data.data_json && data.data_json.blocks) {
          setBlocks(data.data_json.blocks);
        } else if (!isBlank) {
          // If no data found and not blank, use defaults
          setBlocks([
            {
              id: 1, name: 'Mobility & Warm-up', subtitle: 'Warm-up Protocol', icon: 'arrow_warm_up', iconBg: 'bg-orange-50 text-orange-600',
              exercises: [
                { id: '1', exerciseId: 'e1', name: 'Shoulder Circles', type: 'Bodyweight', weight: '-', sets: '2', reps: '30s', rir: '-', rest: '0s' },
                { id: '2', exerciseId: 'e2', name: "World's Greatest Stretch", type: 'Bodyweight', weight: '-', sets: '1', reps: '5/side', rir: '-', rest: '0s' }
              ]
            },
            {
              id: 2, name: 'Strength Block', subtitle: 'Heavy Load', icon: 'fitness_center', iconBg: 'bg-blue-50 text-blue-600',
              exercises: [
                { id: '3', exerciseId: 'e3', name: 'Back Squats', type: 'Barbell', weight: '60 kg', sets: '3', reps: '5', rir: '2', rest: '180s' },
                { id: '4', exerciseId: 'e4', name: 'Bench Press', type: 'Barbell', weight: '75% 1RM', sets: '3', reps: '5', rir: '1', rest: '120s' }
              ]
            },
            {
              id: 3, name: 'Cool Down & Stretching', subtitle: 'Static Holds', icon: 'self_improvement', iconBg: 'bg-teal-50 text-teal-600',
              exercises: [
                { id: '5', exerciseId: 'e5', name: 'Pigeon Stretch', type: 'Stretch', weight: '-', sets: '2m', reps: 'Each', rir: '-', rest: '0s' },
                { id: '6', exerciseId: 'e6', name: "Child's Pose", type: 'Stretch', weight: '-', sets: '1', reps: '60s', rir: '-', rest: '0s' }
              ]
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading training program:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgram();
  }, [clientId, isBlank]);

  const saveProgram = async () => {
    if (!clientId) return;
    setIsSaving(true);
    try {
      await fetchWithAuth(`/manager/clients/${clientId}/training-program`, {
        method: 'POST',
        body: JSON.stringify({
          name: `Programa de Entrenamiento - ${client.name}`,
          data_json: { blocks }
        })
      });
      alert('Programa guardado correctamente');
    } catch (err) {
      console.error('Error saving training program:', err);
      alert('Error al guardar el programa');
    } finally {
      setIsSaving(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  // Drag and drop state
  const dragExerciseRef = useRef<Exercise | null>(null);
  const dragBlockRef = useRef<number | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<number | null>(null);

  // Edit blocks inline
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editingBlockName, setEditingBlockName] = useState('');

  const filteredExercises = exercises.filter(ex => !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Drag from Library
  const handleDragStart = (ex: Exercise) => {
    dragExerciseRef.current = ex;
    dragBlockRef.current = null;
  };

  const handleDragOver = useCallback((e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    if (dragExerciseRef.current) setDragOverBlockId(blockId);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverBlockId(null), []);

  const handleDrop = useCallback((e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    setDragOverBlockId(null);
    if (!dragExerciseRef.current) return;
    
    const ex = dragExerciseRef.current;
    const newEx: PlannedExercise = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: ex.id,
      name: ex.name,
      type: ex.type || 'Standard',
      weight: '-',
      sets: '3',
      reps: '10',
      rir: '2',
      rest: '90s'
    };

    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, newEx] } : b));
    dragExerciseRef.current = null;
  }, []);

  // Drag Blocks for reordering
  const handleBlockDragStart = (e: React.DragEvent, blockId: number) => {
    dragExerciseRef.current = null;
    dragBlockRef.current = blockId;
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleBlockDragOver = (e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    if (dragBlockRef.current === null || dragBlockRef.current === blockId) return;
    setDragOverBlockId(blockId);
  };
  
  const handleBlockDrop = (e: React.DragEvent, targetBlockId: number) => {
    e.preventDefault();
    setDragOverBlockId(null);
    const fromId = dragBlockRef.current;
    dragBlockRef.current = null;
    if (fromId === null || fromId === targetBlockId) return;
    
    setBlocks(prev => {
      const fromIdx = prev.findIndex(b => b.id === fromId);
      const toIdx = prev.findIndex(b => b.id === targetBlockId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed);
      return next;
    });
  };

  const handleBlockDragEnd = () => {
    dragBlockRef.current = null;
    setDragOverBlockId(null);
  };

  const addBlock = () => {
    const icons = ['fitness_center', 'arrow_warm_up', 'self_improvement', 'run_circle'];
    const colors = ['bg-blue-50 text-blue-600', 'bg-orange-50 text-orange-600', 'bg-teal-50 text-teal-600', 'bg-purple-50 text-purple-600'];
    const idx = blocks.length;
    setBlocks(prev => [
      ...prev,
      {
        id: Date.now(),
        name: 'New Training Block',
        subtitle: 'Custom Block',
        icon: icons[idx % icons.length],
        iconBg: colors[idx % colors.length],
        exercises: []
      }
    ]);
  };

  const removeBlock = (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const removeExercise = (blockId: number, exId: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, exercises: b.exercises.filter(e => e.id !== exId) } : b));
  };
  
  const updateExerciseField = (blockId: number, exId: string, field: keyof PlannedExercise, value: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
    } : b));
  };
  
  const startEditBlockName = (block: WorkoutBlock) => {
    setEditingBlockId(block.id);
    setEditingBlockName(block.name);
  };
  
  const commitEditBlockName = () => {
    if (editingBlockId) {
      setBlocks(prev => prev.map(b => b.id === editingBlockId ? { ...b, name: editingBlockName || b.name } : b));
    }
    setEditingBlockId(null);
  };

  const totalExercises = blocks.reduce((acc, b) => acc + b.exercises.length, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-10 w-px bg-slate-100 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-100" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
              {client.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{client.name}</h2>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Training</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span>{isBlank ? 'New Workout Plan' : client.phase}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
            {isBlank ? 'Draft - Not saved' : 'Last autosave: 2 min ago'}
          </span>
          <button className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
          <button 
            onClick={saveProgram}
            disabled={isSaving}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : (isBlank ? 'save' : 'edit_note')}</span>
            {isSaving ? 'Guardando...' : (isBlank ? 'Save Draft' : 'Edit Workout')}
          </button>
          <button 
            onClick={saveProgram}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">publish</span>
            {isSaving ? 'Guardando...' : 'Publish to App'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Left Column: Workout Blocks */}
          <div className="flex-1 flex flex-col gap-6 pr-2 pb-20">
            {blocks.map((block) => {
              const isDropTarget = dragOverBlockId === block.id;

              return (
                <div 
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleBlockDragStart(e, block.id)}
                  onDragOver={(e) => handleBlockDragOver(e, block.id)}
                  onDrop={(e) => handleBlockDrop(e, block.id)}
                  onDragEnd={handleBlockDragEnd}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden ${isDropTarget ? 'border-emerald-400 shadow-emerald-100 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 shadow-sm'}`}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-slate-300 hover:text-slate-500 mr-2">
                         <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${block.iconBg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[24px]">{block.icon}</span>
                      </div>
                      <div>
                        {editingBlockId === block.id ? (
                           <input
                             autoFocus
                             className="text-sm font-bold text-slate-900 bg-transparent border-b-2 border-emerald-500 outline-none w-48"
                             value={editingBlockName}
                             onChange={(e) => setEditingBlockName(e.target.value)}
                             onBlur={commitEditBlockName}
                             onKeyDown={(e) => { if (e.key === 'Enter') commitEditBlockName(); }}
                           />
                        ) : (
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {block.name}
                            <button onClick={() => startEditBlockName(block)} className="text-slate-300 hover:text-emerald-500 transition-colors">
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                          </h3>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {block.exercises.length} Exercises • {block.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => removeBlock(block.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-[4.5rem] hidden md:grid">
                    <div className="col-span-4">Exercise</div>
                    <div className="col-span-8 grid grid-cols-5 gap-2 text-center pr-24">
                      <div>Weight</div><div>Sets</div><div>Reps</div><div>RIR</div><div>Rest</div>
                    </div>
                  </div>

                  <div 
                    className="min-h-[100px]"
                    onDragOver={(e) => { e.preventDefault(); if (dragExerciseRef.current) setDragOverBlockId(block.id); }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, block.id)}
                  >
                    {block.exercises.length === 0 ? (
                      <div className={`py-12 flex flex-col items-center justify-center text-center transition-colors ${isDropTarget ? 'bg-emerald-50' : ''}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDropTarget ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                          <span className="material-symbols-outlined text-[24px]">assignment_add</span>
                        </div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${isDropTarget ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isDropTarget ? 'Drop exercise here' : 'Drag exercises from the library here'}
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y divide-slate-100 ${isDropTarget ? 'bg-emerald-50/30' : ''}`}>
                        {block.exercises.map((ex) => (
                           <div key={ex.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                             <div className="grid grid-cols-12 gap-4 items-center">
                               <div className="col-span-4 flex items-center gap-3">
                                 <div className="cursor-grab text-slate-200 group-hover:text-slate-400 shrink-0">
                                   <span className="material-symbols-outlined text-[20px]">drag_handle</span>
                                 </div>
                                 <div className="min-w-0 flex flex-col gap-1 flex-1">
                                   <h4 className="text-sm font-bold text-slate-900 truncate">{ex.name}</h4>
                                   <div className="flex items-center gap-2">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{ex.type}</p>
                                   </div>
                                 </div>
                               </div>
                               <div className="col-span-8 grid grid-cols-5 gap-2 relative pr-24">
                                 <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.weight} onChange={(e) => updateExerciseField(block.id, ex.id, 'weight', e.target.value)} />
                                 <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.sets} onChange={(e) => updateExerciseField(block.id, ex.id, 'sets', e.target.value)} />
                                 <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.reps} onChange={(e) => updateExerciseField(block.id, ex.id, 'reps', e.target.value)} />
                                 <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.rir} onChange={(e) => updateExerciseField(block.id, ex.id, 'rir', e.target.value)} />
                                 <input className="w-full text-center text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:ring-1 focus:ring-emerald-500 outline-none" value={ex.rest} onChange={(e) => updateExerciseField(block.id, ex.id, 'rest', e.target.value)} />
                                 
                                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEditActivity(ex.exerciseId, ex.name)} className="p-1 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors mr-1">
                                      <span className="material-symbols-outlined text-[16px]">info</span>
                                    </button>
                                    <button onClick={() => removeExercise(block.id, ex.id)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                      <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                 </div>
                               </div>
                             </div>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <button onClick={addBlock} className="w-full py-6 rounded-3xl border-2 border-dashed border-slate-300 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs shrink-0">
              <span className="material-symbols-outlined">add_circle</span> Add Training Block
            </button>
          </div>

          {/* Right Column: Summary & Library */}
          <div className="w-full lg:w-[400px] flex flex-col gap-8">
            {/* Workout Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-8 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Workout Summary</h3>
                <button className="text-slate-300 hover:text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </button>
              </div>
              <div className="flex flex-col items-center">
                <div className={`relative w-44 h-44 ${totalExercises === 0 ? 'opacity-40 grayscale' : ''}`}>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-slate-100" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" />
                    {totalExercises > 0 && (
                      <>
                        <circle className="text-blue-500" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" strokeDasharray="50 100" />
                        <circle className="text-purple-500" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-50" />
                        <circle className="text-orange-500" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-75" />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-3xl font-black leading-none ${totalExercises === 0 ? 'text-slate-400' : 'text-slate-900'}`}>{totalExercises}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exercises</span>
                  </div>
                </div>
                <div className="mt-8 w-full text-center">
                  {totalExercises === 0 ? (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Add exercises to see breakdown</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <span className="text-slate-500 uppercase tracking-tight">Legs</span>
                        </div>
                        <span className="text-slate-900">50%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                          <span className="text-slate-500 uppercase tracking-tight">Chest</span>
                        </div>
                        <span className="text-slate-900">25%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                          <span className="text-slate-500 uppercase tracking-tight">Shoulders</span>
                        </div>
                        <span className="text-slate-900">25%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exercise Library */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl flex flex-col relative sticky top-6">
              <div className="px-6 py-6 border-b border-slate-100 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">Exercise Library</h3>
                  <button className="text-slate-300 hover:text-slate-500">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-400" 
                    placeholder="Search for exercises..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="material-symbols-outlined text-[20px] text-emerald-500">filter_list</span>
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Filter by Category</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                </button>
              </div>
              
              <div className="p-4 bg-slate-50/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2 mt-2">Master List</h4>
                  {filteredExercises.map((ex, idx) => (
                    <div 
                      key={idx} 
                      className="w-full text-left p-3.5 bg-white hover:bg-slate-50 border border-transparent hover:border-emerald-500/20 rounded-2xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleDragStart(ex)}
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full">
                        <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0">
                          <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0`}>
                          <span className="material-symbols-outlined text-[20px]">{ex.icon || 'fitness_center'}</span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                           <span className="text-sm font-bold text-slate-900 truncate pr-2">{ex.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tight">{ex.muscleGroups?.[0] || 'VARIOUS'}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">• {ex.type || 'EXERCISE'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredExercises.length === 0 && (
                     <div className="text-center p-8 text-slate-400 text-sm">No exercises found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
