import React from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  Camera,
  Flag
} from 'lucide-react';
import CheckInReviewRenderer from '../../components/checkin/CheckInReviewRenderer';

interface CheckInDetailViewProps {
  checkIn: any;
  onBack: () => void;
}

export default function CheckInDetailView({ checkIn, onBack }: CheckInDetailViewProps) {
  const dj = checkIn.data_json || {};
  const isDynamic = checkIn.type === 'dynamic';

  const Section = ({ title, subtitle, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 mb-8">
      <div className="flex items-center gap-5 mb-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 dark:bg-rose-950/30">
          <span className="material-symbols-outlined text-3xl font-light">{icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value, fullWidth = false, isChips = false }: any) => (
    <div className={`${fullWidth ? 'md:col-span-2' : ''} space-y-2`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</p>
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-slate-200">
        <div className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
          {isChips && Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2">
              {value.map((v: string) => (
                <span key={v} className="px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">{v}</span>
              ))}
            </div>
          ) : (
            value || <span className="text-slate-300 dark:text-slate-700 italic font-medium">Not specified</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8faf8] dark:bg-[#0f1a12] p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-slate-500 hover:text-emerald-600 transition-all font-bold text-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back to History
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ID: {checkIn.id.substring(0,8)}
          </div>
        </div>

        {/* Status Hero Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex flex-col items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-2xl font-black">{new Date(checkIn.date).getDate()}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{new Date(checkIn.date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Weekly Review</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Submitted on {new Date(checkIn.created_at || checkIn.date).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
              checkIn.reviewed_at 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              {checkIn.reviewed_at ? 'Reviewed by Coach' : 'Pending Review'}
            </span>
            {checkIn.reviewed_at && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                Last updated {new Date(checkIn.reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isDynamic && checkIn.template ? (
          <CheckInReviewRenderer 
            template={{
              ...checkIn.template,
              templateSchema: checkIn.template.template_schema || checkIn.template.templateSchema || []
            }} 
            answers={dj} 
            isClient={true} 
          />
        ) : (
          <div className="space-y-8 pb-20">
            <Section title="Overall Experience" subtitle="Client's general thoughts on the past week." icon="mood">
              <InfoField label="Overall Week" value={dj.overallWeek} />
              <InfoField label="Primary Context" value={dj.contextChips} isChips={true} />
              <InfoField label="Plan Alignment" value={dj.matchPlan} />
              <InfoField label="Consistency" value={dj.consistency} />
              <InfoField label="Mental Health" value={dj.mentalHealth} />
              <InfoField label="Weekly Notes" value={dj.weekNotes} fullWidth={true} />
            </Section>

            <Section title="Body & Progress" subtitle="Physical updates and measurements." icon="straighten">
              <InfoField label="Current Weight" value={dj.weight ? `${dj.weight} kg` : null} />
              <InfoField label="Average Weight" value={dj.avgWeight ? `${dj.avgWeight} kg` : null} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
                <InfoField label="Waist" value={dj.waist ? `${dj.waist}cm` : null} />
                <InfoField label="Hips" value={dj.hips ? `${dj.hips}cm` : null} />
                <InfoField label="Chest" value={dj.chest ? `${dj.chest}cm` : null} />
              </div>
              <div className="md:col-span-2">
                <InfoField label="Body Perception" value={dj.bodyPerception} />
              </div>
              <InfoField label="Satisfaction" value={dj.satisfaction} />
              <InfoField label="Biggest Change" value={dj.biggestChangeArea} />
              
              {/* Progress Photos Preview */}
              <div className="md:col-span-2 space-y-4 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Progress Photos</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['photoFront', 'photoSide', 'photoBack'].map(pos => (
                    <div key={pos} className="aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group">
                      {dj[pos] ? (
                        <img src={dj[pos]} alt={pos} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center">
                          <Camera className="w-10 h-10 mb-2 opacity-30" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{pos.replace('photo', '')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Nutrition Compliance" subtitle="Tracking and dietary adherence." icon="restaurant">
              <InfoField label="Adherence Level" value={dj.nutritionAdherence} />
              <InfoField label="Calorie Target" value={dj.hitCalories} />
              <InfoField label="Protein Target" value={dj.hitProtein} />
              <InfoField label="Hardest Meal" value={dj.hardestMeal} />
              <InfoField label="Obstacles" value={dj.adherenceObstacles} isChips={true} fullWidth={true} />
              <InfoField label="Nutrition Notes" value={dj.foodNotes || dj.digestiveIssues} fullWidth={true} />
            </Section>

            {/* Coach Feedback - If Available */}
            {checkIn.reviewed_at && (
              <div className="bg-emerald-500 dark:bg-emerald-900/30 rounded-[32px] p-8 md:p-10 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">psychology</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">Coach Feedback</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Personalized Assessment</p>
                      </div>
                    </div>
                    <div className="text-lg font-medium leading-relaxed italic bg-white/10 dark:bg-slate-900/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                      "{checkIn.coach_notes || 'Excellent work this week! Keep pushing the intensity and maintain your consistency.'}"
                    </div>
                  </div>
                  <div className="w-full md:w-72 space-y-4">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Next Week Focus</p>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-lg flex items-center gap-4 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Flag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{checkIn.next_week_focus || 'Consistency'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
