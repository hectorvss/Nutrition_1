import React from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Flag, 
  History, 
  FileText, 
  MoreHorizontal, 
  Camera, 
  Check, 
  X, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Smile,
  AlertTriangle,
  Edit3,
  PieChart,
  Activity,
  Footprints,
  Droplets,
  Stethoscope,
  Mic,
  Paperclip,
  Send,
  Target,
  Moon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CheckInReviewProps {
  clientId: number;
  week: number;
  onBack: () => void;
}

const macroData = [
  { day: 'Mon', calories: 1840, status: 'met' },
  { day: 'Tue', calories: 1860, status: 'met' },
  { day: 'Wed', calories: 1855, status: 'met' },
  { day: 'Thu', calories: 2100, status: 'over' },
  { day: 'Fri', calories: 1830, status: 'met' },
  { day: 'Sat', calories: 1850, status: 'met' },
  { day: 'Sun', calories: 1845, status: 'met' },
];

const stepsData = [
  { day: 'M', steps: 6000 },
  { day: 'T', steps: 8500 },
  { day: 'W', steps: 9200 },
  { day: 'T', steps: 7500 },
  { day: 'F', steps: 7000 },
  { day: 'S', steps: 10000 },
  { day: 'S', steps: 4000 },
];

export default function CheckInReview({ clientId, week, onBack }: CheckInReviewProps) {
  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="hover:text-emerald-600 transition-colors">Check-ins</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">Sarah Jenkins</span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical ID: 8992-B</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-md border-2 border-white" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop")' }}></div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Sarah Jenkins</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <Flag className="w-3 h-3" /> Flagged
              </span>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> Submitted Today, 10:42 AM
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              Week 4 Check-in
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="px-4 py-2.5 rounded-xl border border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <History className="w-4 h-4" />
            View Past Reviews
          </button>
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 bg-white text-sm">
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors bg-white">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Physical Progress */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                Physical Progress
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-600"><Check className="w-3 h-3" /> Lighting</span>
                <span className="w-px h-3 bg-slate-200"></span>
                <span className="flex items-center gap-1.5 text-emerald-600"><Check className="w-3 h-3" /> Posing</span>
                <span className="w-px h-3 bg-slate-200"></span>
                <span className="flex items-center gap-1.5 text-slate-400"><X className="w-3 h-3" /> Background</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Front', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop' },
                { label: 'Side', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop' },
                { label: 'Back', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=600&fit=crop' },
              ].map((img, idx) => (
                <div key={idx} className="group relative aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer">
                  <img src={img.url} alt={img.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wider">
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perimeter Measurements */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
                Perimeter Measurements
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Show Delta</span>
                <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Area</th>
                    <th className="px-6 py-4 text-right">Start</th>
                    <th className="px-6 py-4 text-right">Current</th>
                    <th className="px-6 py-4 text-right">Delta</th>
                    <th className="px-6 py-4 text-right">Goal</th>
                    <th className="px-6 py-4 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { area: 'Waist', start: '82 cm', current: '78 cm', delta: '-4 cm', goal: '75 cm', trend: 'down' },
                    { area: 'Hips', start: '104 cm', current: '101 cm', delta: '-3 cm', goal: '98 cm', trend: 'down' },
                    { area: 'R. Arm', start: '32 cm', current: '31.5 cm', delta: '-0.5 cm', goal: '30 cm', trend: 'flat' },
                    { area: 'L. Thigh', start: '58 cm', current: '56.5 cm', delta: '-1.5 cm', goal: '54 cm', trend: 'down' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{row.area}</td>
                      <td className="px-6 py-4 text-right text-slate-500 font-medium">{row.start}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{row.current}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold bg-emerald-50/30">{row.delta}</td>
                      <td className="px-6 py-4 text-right text-slate-400 font-medium">{row.goal}</td>
                      <td className="px-6 py-4 text-center">
                        {row.trend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-500 mx-auto" /> : <Minus className="w-4 h-4 text-amber-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sensations & Feedback */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Smile className="w-5 h-5 text-emerald-500" />
              Sensations & Feedback
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Smile className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">How are you feeling?</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "Feeling surprisingly energetic this week! The increased carb intake on training days really helped my performance. Sleep has been consistent, around 7-8 hours."
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Any difficulties?</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "Struggled a bit with meal prep on Wednesday due to work. Had to eat out once, but tried to choose the healthiest option available."
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Proposed Changes</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "Could we look at adding a bit more variety to the breakfast options? The oatmeal is great but I'm getting a little bored of it every single day."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calories & Macros */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-500" />
                Calories & Macros
              </h2>
              <button className="text-xs font-bold text-emerald-600 hover:underline uppercase tracking-wider">Show daily logs</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Calories', value: '1850', status: 'Target Met', color: 'text-emerald-600', bg: 'bg-slate-50', border: 'border-slate-100' },
                { label: 'Protein', value: '145g', status: '100%', color: 'text-red-600', bg: 'bg-red-50/50', border: 'border-red-100', barColor: 'bg-red-500' },
                { label: 'Carbs', value: '180g', status: '85%', color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100', barColor: 'bg-amber-500' },
                { label: 'Fats', value: '60g', status: '95%', color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', barColor: 'bg-blue-500' },
              ].map((macro, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${macro.bg} ${macro.border} text-center relative overflow-hidden`}>
                  {macro.barColor && <div className={`absolute bottom-0 left-0 h-1 ${macro.barColor}`} style={{ width: macro.status }} />}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{macro.label}</p>
                  <p className={`text-xl font-bold ${macro.color.includes('slate') ? 'text-slate-900' : macro.color}`}>{macro.value}</p>
                  <p className={`text-[10px] font-bold mt-1 ${macro.color}`}>{macro.status}</p>
                </div>
              ))}
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'over' ? '#f87171' : '#10b981'} fillOpacity={0.2} stroke={entry.status === 'over' ? '#f87171' : '#10b981'} strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Coach Alerts */}
          <div className="bg-red-50 rounded-2xl shadow-sm p-6 border border-red-100">
            <h2 className="text-xs font-bold text-red-800 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Coach Alerts
            </h2>
            <div className="space-y-3">
              {[
                { title: 'Weight Plateau', desc: 'Weight stable for 10 days despite deficit.', icon: Minus, color: 'text-red-600', bg: 'bg-red-100' },
                { title: 'Missed Leg Day', desc: 'Skipped Thursday session reported.', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map((alert, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-red-100 flex gap-3 items-start shadow-sm">
                  <div className={`w-8 h-8 rounded-full ${alert.bg} flex items-center justify-center shrink-0 ${alert.color}`}>
                    <alert.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-emerald-500" />
              Key Metrics
            </h2>
            <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Current Weight</span>
                <span className="text-emerald-600 text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">-0.8kg</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">74.5</span>
                <span className="text-lg text-slate-400 font-bold">kg</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Start: 78kg</span>
                <span>Goal: 70kg</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-slate-400" />
                  Daily Steps
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Avg: 8,200</span>
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepsData}>
                    <Bar dataKey="steps" radius={[2, 2, 0, 0]}>
                      {stepsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={entry.steps >= 8000 ? 1 : 0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-widest">
                {stepsData.map(d => <span key={d.day}>{d.day}</span>)}
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Compliance
            </h2>
            <div className="space-y-6">
              {[
                { label: 'Nutrition', value: 95, color: 'bg-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-600', desc: 'Adhered to macro targets perfectly 6/7 days.' },
                { label: 'Training', value: 80, color: 'bg-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-600', desc: 'Missed Leg Day on Thursday.' },
                { label: 'Hydration', value: 100, color: 'bg-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-600', isHydration: true, desc: 'Hit 3L goal every day.' },
              ].map((item, idx) => (
                <div key={idx} className={`${item.bg} p-4 rounded-xl border ${item.border}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-900">{item.label}</span>
                    <span className={`text-sm font-bold ${item.text}`}>{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }}></div>
                  </div>
                  {item.isHydration && (
                    <div className="flex gap-1.5 mt-3 mb-1">
                      {[1,2,3,4,5].map(i => <Droplets key={i} className="w-4 h-4 text-blue-500 fill-blue-500" />)}
                    </div>
                  )}
                  <p className="text-[10px] font-medium text-slate-500 mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Digestion & Health */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Stethoscope className="w-5 h-5 text-emerald-500" />
              Digestion & Health
            </h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Energy Levels</span>
                    <span className="text-xs font-bold text-emerald-600">8/10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Hunger</span>
                    <span className="text-xs font-bold text-amber-600">High</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium italic">"Peaking post-workout"</p>
                </div>
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signals</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider">
                    Bloating
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                    Regular BM
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    No Reflux
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      4
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Stool Consistency</span>
                      <span className="text-xs font-bold text-slate-700">Normal / Smooth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Assessment */}
        <div className="col-span-1 lg:col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                Coach Assessment
              </h2>
              <button className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm hover:text-emerald-600 transition-colors uppercase tracking-wider">
                Load Template
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 relative">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Internal Notes & Feedback</label>
                  <textarea 
                    className="w-full bg-amber-50/20 border border-amber-100 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[160px] resize-none outline-none" 
                    placeholder="Write your feedback here... e.g. 'Great progress on waist measurements, let's keep the carb cycling for another week...'"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Next Week Focus</label>
                    <div className="relative">
                      <Target className="absolute top-3.5 left-3.5 text-slate-400 w-4 h-4" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none font-medium" 
                        placeholder="e.g. Increase daily steps to 10k" 
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/25 w-4 h-4" type="checkbox" />
                        Send via Email
                      </label>
                      <button className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider">Clarification needed?</button>
                    </div>
                    <button className="w-full py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                      <Send className="w-4 h-4" />
                      Publish Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-8"></div>
    </div>
  );
}
