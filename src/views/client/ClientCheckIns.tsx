import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientCheckIns() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    calories_intake: '',
    calories_goal: 2200,
    fruit_veg: 5,
    hydration_percent: 80,
    alcohol_consumed: 0,
    supplements_logged: true,
    workout_completion: 90,
    total_volume: '',
    avg_rpe: 7,
    fatigue_level: 5,
    pr_back_squat: '',
    pr_deadlift: '',
    pr_bench_press: '',
    energy_level: 7,
    stress_level: 4,
    mood_score: 8,
    motivation_level: 9,
    sleep_hours: 8,
    notes: ''
  });

  const loadCheckIns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/client/check-ins');
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/client/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          data_json: formData
        })
      });
      setIsModalOpen(false);
      loadCheckIns();
    } catch (err) {
      console.error('Error submitting check-in:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17cf54]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 bg-[#f6f8f6] dark:bg-[#112116] min-h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Your Check-ins</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Consistency is the key to your transformation. Keep it up!</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">help</span>
            Need Help?
          </button>
        </header>

        {/* Top Action Card */}
        <section className="relative overflow-hidden dark:bg-slate-900/50 rounded-2xl shadow-xl p-8 group bg-white border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-64 rounded-full bg-[#17cf54]/5 blur-3xl group-hover:bg-[#17cf54]/10 transition-all duration-500"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden shadow-2xl rotate-2">
              <img 
                alt="Fitness tracking" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
              />
            </div>
            <div className="flex-1 text-slate-900 dark:text-slate-100">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-[#17cf54] text-white">Coach is waiting</span>
              <h3 className="text-2xl font-bold mb-2 leading-tight">Weekly Review Window</h3>
              <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">Complete your weekly check-in to keep your coach updated on your progress and receive your updated plan for next week.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#17cf54] text-white font-bold hover:bg-[#15b84a] transition-all transform active:scale-95 shadow-lg shadow-[#17cf54]/20"
              >
                Start Check-in
                <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* History List */}
        <section className="space-y-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Check-in History</h4>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
            </div>
          </div>

          {checkIns.length > 0 ? (
            checkIns.map((ci) => (
              <div key={ci.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#17cf54]/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-12 flex items-center justify-center rounded-xl bg-[#17cf54]/10 text-[#17cf54] shrink-0">
                    <span className="material-symbols-outlined fill-1">task_alt</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">
                      Check-in: {new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h5>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">scale</span> {ci.data_json?.weight}kg
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">checklist</span> {ci.data_json?.workout_completion}% Adherence
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#17cf54]/10 text-[#17cf54]">
                    Submitted
                  </span>
                  <button className="text-slate-400 hover:text-[#17cf54] transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">history</span>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No check-ins yet</p>
            </div>
          )}
        </section>
      </div>

      {/* Check-in Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Check-in</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Submit your progress to your coach</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                  {/* Calories & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Calories Consumed (kcal)</label>
                      <input 
                        required
                        type="number"
                        value={formData.calories_intake}
                        onChange={(e) => setFormData({...formData, calories_intake: e.target.value})}
                        placeholder="0000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-[#17cf54]"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Weight (kg)</label>
                      <input 
                        required
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        placeholder="00.0"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-[#17cf54] transition-all"
                      />
                    </div>
                  </div>

                  {/* Nutrition Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fruits & Veg (Servings)</label>
                      <input 
                        type="range"
                        min="0"
                        max="10"
                        value={formData.fruit_veg}
                        onChange={(e) => setFormData({...formData, fruit_veg: parseInt(e.target.value)})}
                        className="w-full accent-emerald-500"
                      />
                      <div className="text-lg font-bold text-center text-emerald-600">{formData.fruit_veg} servings</div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hydration Goal (%)</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={formData.hydration_percent}
                        onChange={(e) => setFormData({...formData, hydration_percent: parseInt(e.target.value)})}
                        className="w-full accent-blue-500"
                      />
                      <div className="text-lg font-bold text-center text-blue-600">{formData.hydration_percent}%</div>
                    </div>
                  </div>

                  {/* Training Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Workout Completion (%)</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={formData.workout_completion}
                        onChange={(e) => setFormData({...formData, workout_completion: parseInt(e.target.value)})}
                        className="w-full accent-[#17cf54]"
                      />
                      <div className="text-lg font-bold text-center text-slate-900 dark:text-white">{formData.workout_completion}%</div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Accumulated Weekly Volume (kg)</label>
                      <input 
                        type="number"
                        value={formData.total_volume}
                        onChange={(e) => setFormData({...formData, total_volume: e.target.value})}
                        placeholder="00000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-[#17cf54]"
                      />
                    </div>
                  </div>

                  {/* RPE & Fatigue */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Avg. Session RPE</label>
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={formData.avg_rpe}
                        onChange={(e) => setFormData({...formData, avg_rpe: parseFloat(e.target.value)})}
                        className="w-full accent-purple-500"
                      />
                      <div className="text-lg font-bold text-center text-purple-600">{formData.avg_rpe} / 10</div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">General Fatigue Level</label>
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        value={formData.fatigue_level}
                        onChange={(e) => setFormData({...formData, fatigue_level: parseInt(e.target.value)})}
                        className="w-full accent-orange-500"
                      />
                      <div className="text-lg font-bold text-center text-orange-600">{formData.fatigue_level} / 10</div>
                    </div>
                  </div>

                  {/* Personal Records */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">Personal Records Update</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Back Squat (kg)</label>
                        <input 
                          type="number"
                          value={formData.pr_back_squat}
                          onChange={(e) => setFormData({...formData, pr_back_squat: e.target.value})}
                          placeholder="000"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Deadlift (kg)</label>
                        <input 
                          type="number"
                          value={formData.pr_deadlift}
                          onChange={(e) => setFormData({...formData, pr_deadlift: e.target.value})}
                          placeholder="000"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bench Press (kg)</label>
                        <input 
                          type="number"
                          value={formData.pr_bench_press}
                          onChange={(e) => setFormData({...formData, pr_bench_press: e.target.value})}
                          placeholder="000"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mindset & Wellness */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">Mindset & Wellness</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Energy Levels</label>
                        <input 
                          type="range" min="1" max="10"
                          value={formData.energy_level}
                          onChange={(e) => setFormData({...formData, energy_level: parseInt(e.target.value)})}
                          className="w-full accent-yellow-500"
                        />
                        <div className="text-lg font-bold text-center text-yellow-600">{formData.energy_level} / 10</div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Stress Levels</label>
                        <input 
                          type="range" min="1" max="10"
                          value={formData.stress_level}
                          onChange={(e) => setFormData({...formData, stress_level: parseInt(e.target.value)})}
                          className="w-full accent-red-500"
                        />
                        <div className="text-lg font-bold text-center text-red-600">{formData.stress_level} / 10</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Mood</label>
                        <input 
                          type="range" min="1" max="10"
                          value={formData.mood_score}
                          onChange={(e) => setFormData({...formData, mood_score: parseInt(e.target.value)})}
                          className="w-full accent-pink-500"
                        />
                        <div className="text-lg font-bold text-center text-pink-600">{formData.mood_score} / 10</div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Motivation</label>
                        <input 
                          type="range" min="1" max="10"
                          value={formData.motivation_level}
                          onChange={(e) => setFormData({...formData, motivation_level: parseInt(e.target.value)})}
                          className="w-full accent-blue-500"
                        />
                        <div className="text-lg font-bold text-center text-blue-600">{formData.motivation_level} / 10</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Weekly Volume (kg)</label>
                      <input 
                        type="number"
                        value={formData.total_volume}
                        onChange={(e) => setFormData({...formData, total_volume: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xl font-bold focus:ring-2 focus:ring-[#17cf54]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notes for Coach</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="How was your week? Any struggles or wins?"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 min-h-[100px] text-sm focus:ring-2 focus:ring-[#17cf54]"
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 px-6 rounded-2xl bg-[#17cf54] text-white font-black uppercase tracking-widest hover:bg-[#15b84a] shadow-lg shadow-[#17cf54]/20 transition-all active:scale-[0.98]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
