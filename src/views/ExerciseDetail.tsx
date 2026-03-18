import React, { useState, useEffect } from 'react';
import { useExerciseContext } from '../context/ExerciseContext';
import { TrainingCategory } from '../types/training';

interface ExerciseDetailProps {
  exerciseName?: string;
  onBack: () => void;
}

export default function ExerciseDetail({ exerciseName, onBack }: ExerciseDetailProps) {
  const { exercises, updateExercise } = useExerciseContext();
  const exercise = exercises.find(e => e.name === exerciseName);

  const [isEditing, setIsEditing] = useState(false);

  // Editable fields state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TrainingCategory>("Strength");
  const [subcategory, setSubcategory] = useState("");
  const [type, setType] = useState<"Compound" | "Isolation" | "Stretch" | "Hold">("Compound");
  const [difficultyLevel, setDifficultyLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  
  const [musclesStr, setMusclesStr] = useState("");
  const [secondaryMusclesStr, setSecondaryMusclesStr] = useState("");
  const [equipmentStr, setEquipmentStr] = useState("");
  
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Initialize fields
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setCategory(exercise.category);
      setSubcategory(exercise.subcategory || "");
      setType(exercise.type);
      setDifficultyLevel(exercise.difficultyLevel);
      setMusclesStr(exercise.muscleGroups?.join(', ') || "");
      setSecondaryMusclesStr(exercise.secondaryMuscles?.join(', ') || "");
      setEquipmentStr(exercise.tools?.join(', ') || "");
      setVideoUrl(exercise.video_url || "");
      setNotes(exercise.description || "");
    } else if (exerciseName) {
      setName(exerciseName);
    }
  }, [exercise, exerciseName, isEditing]);

  const handleSave = async () => {
    if (!exercise) return;
    
    await updateExercise(exercise.id, {
      name,
      category,
      subcategory,
      type,
      difficultyLevel,
      muscleGroups: musclesStr.split(',').map(s => s.trim()).filter(Boolean),
      secondaryMuscles: secondaryMusclesStr.split(',').map(s => s.trim()).filter(Boolean),
      tools: equipmentStr.split(',').map(s => s.trim()).filter(Boolean),
      video_url: videoUrl,
      description: notes
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Exercise not found</p>
          <button onClick={onBack} className="bg-emerald-500 text-white px-4 py-2 rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex justify-center items-start">
      <div className="bg-white dark:bg-slate-800 w-full max-w-6xl rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col h-auto min-h-[calc(100vh-4rem)] md:min-h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Activity" : "See Activity"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit
                </button>
                <button onClick={onBack} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-semibold text-sm">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Done
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleCancel} 
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-semibold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 h-full">
            {/* General Information */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Activity Name</label>
                  <div className="relative">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default">
                        {name}
                      </div>
                    )}
                    {!isEditing && <span className="material-symbols-outlined absolute right-3 top-3.5 text-emerald-500">check_circle</span>}
                  </div>
                </div>
                
                {/* Category Fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
                  {isEditing ? (
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="Strength">Strength</option>
                      <option value="Mobility">Mobility</option>
                      <option value="Warm-up">Warm-up</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Rehab">Rehab</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {category}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Subcategory</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={subcategory} 
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Empuje horizontal"
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {subcategory || "None"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Type</label>
                  {isEditing ? (
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="Compound">Compound</option>
                      <option value="Isolation">Isolation</option>
                      <option value="Stretch">Stretch</option>
                      <option value="Hold">Hold</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {type}
                    </div>
                  )}
                </div>

                {/* Body and Gear Fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Primary Muscle Groups (comma separated)</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={musclesStr} 
                      onChange={(e) => setMusclesStr(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {musclesStr || "None"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Secondary Muscles (comma separated)</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={secondaryMusclesStr} 
                      onChange={(e) => setSecondaryMusclesStr(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {secondaryMusclesStr || "None"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Equipment / Tools (comma separated)</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={equipmentStr} 
                      onChange={(e) => setEquipmentStr(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {equipmentStr || "None"}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Difficulty Level</label>
                  {isEditing ? (
                    <select 
                      value={difficultyLevel} 
                      onChange={(e) => setDifficultyLevel(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                      {difficultyLevel}
                    </div>
                  )}
                </div>

              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />
            
            {/* Video & Media */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">video_library</span>
                Video & Media
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={videoUrl} 
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste YouTube or Vimeo link"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                      />
                    ) : (
                      <div className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium opacity-90 cursor-default truncate">
                        {videoUrl || "No video link available"}
                      </div>
                    )}
                    <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400">link</span>
                  </div>
                </div>
                {videoUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl bg-slate-900 overflow-hidden group shadow-md border border-slate-200 dark:border-slate-700">
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <iframe 
                        className="w-full h-full"
                        src={videoUrl.replace('watch?v=', 'embed/').split('?')[0].replace('shorts/', 'embed/')}
                        title="Exercise Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">videocam_off</span>
                      <p className="text-slate-500 font-medium mt-2">No video available</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Prescription Preview (Readonly generally, part of protocol logic, keeping as visual) */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Default Prescription Preview
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 relative shadow-sm">
                  <div className="absolute top-2 right-2 text-emerald-500">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                  <span className="font-bold text-base mb-1">Hypertrophy</span>
                  <span className="text-xs opacity-80 font-medium bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">3 x 10-12</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60">
                  <span className="font-bold text-base mb-1 text-slate-600 dark:text-slate-300">Strength</span>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">5 x 5</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60">
                  <span className="font-bold text-base mb-1 text-slate-600 dark:text-slate-300">Endurance</span>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">3 x 15+</span>
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Coach's Notes */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Exercise details & Description
                </h3>
              </div>
              <div className={`relative bg-white dark:bg-slate-800/50 rounded-2xl border ${isEditing ? 'border-emerald-300 dark:border-emerald-700/50 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'} p-0 overflow-hidden min-h-[160px] transition-all`}>
                {isEditing ? (
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-[160px] p-5 bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 resize-y placeholder:text-slate-400 outline-none text-sm leading-relaxed"
                    placeholder="Add specific instructions, form cues, or progression strategies for this exercise..."
                  />
                ) : (
                  <div className="p-5 min-h-[160px]">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {notes || "No description provided."}
                    </p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
