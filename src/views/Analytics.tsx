import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Heart, 
  Award, 
  UserMinus, 
  UserPlus,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  Utensils,
  Droplets,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Dumbbell,
  ListChecks,
  Gauge
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type AnalyticsTab = 'business' | 'nutrition' | 'training';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('business');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const result = await fetchWithAuth('/manager/analytics');
        setData(result);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm">Business performance and client metrics overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button className="px-4 py-2 rounded-md bg-emerald-50 text-emerald-600 text-sm font-medium">Last 30 Days</button>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600 font-medium">Aug 1, 2023 - Aug 30, 2023</span>
            <ChevronDown className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('business')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'business' 
                ? 'border-emerald-500 text-emerald-600 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Business
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'nutrition' 
                ? 'border-emerald-500 text-emerald-600 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <Utensils className="w-5 h-5" />
            Nutrition
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            className={`pb-3 border-b-2 transition-all text-sm flex items-center gap-2 ${
              activeTab === 'training' 
                ? 'border-emerald-500 text-emerald-600 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            Training
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'business' && <BusinessAnalytics data={data?.business} />}
            {activeTab === 'nutrition' && <NutritionAnalytics data={data?.nutrition} />}
            {activeTab === 'training' && <TrainingAnalytics data={data?.training} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function BusinessAnalytics({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 pt-2">
        <StatCard 
          title="Total Clients" 
          value={data?.totalClients || "0"} 
          change="+12%" 
          isPositive={true} 
          icon={<Users className="w-6 h-6" />} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Monthly Rev" 
          value={data?.revenue >= 1000 ? `$${(data.revenue / 1000).toFixed(1)}k` : `$${data?.revenue || '0'}`} 
          change="+8.5%" 
          isPositive={true} 
          icon={<DollarSign className="w-6 h-6" />} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-600" 
          showChart={true}
        />
        <StatCard 
          title="Retention" 
          value={`${data?.retention || "0"}%`} 
          change={`${data?.retention >= 90 ? '+0.0%' : '-1.2%'}`} 
          isPositive={data?.retention >= 90} 
          icon={<Heart className="w-6 h-6" />} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
        />
        <StatCard 
          title="Avg LTV" 
          value={`$${data?.ltv || "0"}`} 
          change="+5.4%" 
          isPositive={true} 
          icon={<Award className="w-6 h-6" />} 
          iconBg="bg-amber-50" 
          iconColor="text-amber-600" 
        />
        <StatCard 
          title="Churn Rate" 
          value={`${data?.churnRate || "0"}%`} 
          change={data?.churnRate > 5 ? "+1.1%" : "-0.5%"} 
          isPositive={data?.churnRate <= 5} 
          icon={<UserMinus className="w-6 h-6" />} 
          iconBg="bg-red-50" 
          iconColor="text-red-600" 
        />
        <StatCard 
          title="New Leads" 
          value={data?.newLeads || "0"} 
          change="+15%" 
          isPositive={true} 
          icon={<UserPlus className="w-6 h-6" />} 
          iconBg="bg-teal-50" 
          iconColor="text-teal-600" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue vs Renewals</h2>
              <p className="text-sm text-slate-500">Monthly financial performance against client retention.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-slate-600">Renewals</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                const now = new Date();
                const currentMonth = now.getMonth();
                return {
                  month: m,
                  revenue: i <= currentMonth ? (data?.monthlyRevenue?.[i] || 0) : null
                };
              })}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Protocol Compliance</h3>
              <p className="text-xs text-slate-500">Overall coaching delivery quality</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
              (data?.complianceScore || 0) > 80 ? 'bg-emerald-50 text-emerald-600' : 
              (data?.complianceScore || 0) > 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
            }`}>
              {data?.complianceScore || 0}
            </div>
          </div>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            <ProgressBar label="Workout Adherence" value={`${data?.training?.avgCompletion || 0}%`} percentage={data?.training?.avgCompletion || 0} color="bg-emerald-500" />
            <ProgressBar label="Nutrition Consistency" value={`${data?.nutrition?.avgHydration || 0}%`} percentage={data?.nutrition?.avgHydration || 0} color="bg-blue-500" />
            <ProgressBar label="Check-in Reliability" value={`${data?.retention || 0}%`} percentage={data?.retention || 0} color="bg-purple-500" />
          </div>
          <p className="mt-6 text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Composite index of client protocol compliance (last 30 days).
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Retention by Cohort</h3>
            <p className="text-sm text-slate-500">Percentage of clients retained over months since signup.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-50"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-200"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
            </div>
            <span className="text-xs font-medium text-slate-500">More</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="text-xs text-slate-500 font-medium border-b border-slate-100">
                <th className="pb-3 text-left pl-4 font-normal">Cohort</th>
                <th className="pb-3 font-normal">Month 1</th>
                <th className="pb-3 font-normal">Month 2</th>
                <th className="pb-3 font-normal">Month 3</th>
                <th className="pb-3 font-normal">Month 4</th>
                <th className="pb-3 font-normal">Month 5</th>
                <th className="pb-3 font-normal">Month 6</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {data?.cohorts && data.cohorts.length > 0 ? (
                data.cohorts.map((c: any, i: number) => (
                  <CohortRow key={i} cohort={c.cohort} data={c.data} />
                ))
              ) : (
                <CohortRow cohort="No data" data={[null, null, null, null, null, null]} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NutritionAnalytics({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        <StatCard 
          title="Avg. Fruit & Veg" 
          value={data?.avgFruitVeg || "0"} 
          unit="serv/day"
          change="+0.8" 
          isPositive={true} 
          icon={<Utensils className="w-6 h-6" />} 
          iconBg="bg-green-50" 
          iconColor="text-green-600" 
        />
        <StatCard 
          title="Hydration Goal" 
          value={`${data?.avgHydration || "0"}%`} 
          change="+5%" 
          isPositive={true} 
          icon={<Droplets className="w-6 h-6" />} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Alcohol Frequency" 
          value={data?.alcoholAlerts || "0"} 
          unit="alerts"
          change={data?.alcoholAlerts > 5 ? "High" : "Low"} 
          isPositive={data?.alcoholAlerts <= 5} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          iconBg="bg-red-50" 
          iconColor="text-red-600" 
          changeLabel={data?.alcoholAlerts > 0 ? `${data.alcoholAlerts} reports this month` : "No alerts"}
        />
        <StatCard 
          title="Supplements Logged" 
          value={`${data?.supplementAdherence || "0"}%`} 
          change="+12%" 
          isPositive={true} 
          icon={<Pill className="w-6 h-6" />} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
          changeLabel="Adherence rate"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Calorie Intake vs. Goal</h2>
            <p className="text-sm text-slate-500">Average daily calorie consumption across all clients vs target goals.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-500"></span>
              <span className="text-slate-600">Intake</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400"></span>
              <span className="text-slate-600">Goal</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full relative pb-6 border-b border-slate-100 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px bg-slate-50"></div>
            ))}
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 700 300">
            {/* Goal Line */}
            <path 
              d={data?.calories?.goal?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${300 - (v / 3000) * 300}`).join(' ')} 
              fill="none" stroke="#94a3b8" strokeDasharray="5,5" strokeWidth="2"
            />
            {/* Intake Area & Line */}
            <path 
              d={`M0,300 ${data?.calories?.intake?.map((v: number, i: number) => `L${i * 100},${300 - (v / 3000) * 300}`).join(' ')} L${(data?.calories?.intake?.length - 1) * 100},300 Z`} 
              fill="url(#gradientPrimary)" opacity="0.8"
            />
            <path 
              d={data?.calories?.intake?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${300 - (v / 3000) * 300}`).join(' ')} 
              fill="none" stroke="#10b981" strokeWidth="3"
            />
            <defs>
              <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 font-medium px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Micro-nutrient Adequacy</h3>
              <p className="text-sm text-slate-500">Compliance trends for key deficiencies.</p>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <LegendItem color="bg-amber-500" label="Iron" />
              <LegendItem color="bg-blue-500" label="Vit D" />
              <LegendItem color="bg-purple-500" label="Magnesium" />
            </div>
          </div>
          <div className="flex-1 relative min-h-[220px]">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 600 200">
              {[50, 100, 150].map(y => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              ))}
              <path 
                d={data?.nutrition?.microTrends?.iron?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${200 - (v / 100) * 200}`).join(' ')} 
                fill="none" stroke="#f59e0b" strokeLinecap="round" strokeWidth="3"
              />
              <path 
                d={data?.nutrition?.microTrends?.vitD?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${200 - (v / 100) * 200}`).join(' ')} 
                fill="none" stroke="#3b82f6" strokeLinecap="round" strokeWidth="3"
              />
              <path 
                d={data?.nutrition?.microTrends?.magnesium?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${i * 100},${200 - (v / 100) * 200}`).join(' ')} 
                fill="none" stroke="#a855f7" strokeLinecap="round" strokeWidth="3"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 font-medium px-1">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400 font-medium pr-2">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Top Deficit Clients</h3>
            <button className="text-emerald-600 text-xs font-semibold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {data?.nutrition?.topDeficits && data.nutrition.topDeficits.length > 0 ? (
              data.nutrition.topDeficits.map((client: any, idx: number) => (
                <DeficitClient 
                  key={idx}
                  name={client.name}
                  deficit={client.deficit}
                  severity={client.status === 'High Deficit' ? 'high' : 'med'}
                  image={`https://ui-avatars.com/api/?name=${client.name}&background=random`}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-8">No deficit data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainingAnalytics({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        <StatCard 
          title="Avg. Workout Completion %" 
          value={`${data?.avgCompletion || "0"}%`} 
          change="+4%" 
          isPositive={true} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Total Volume Lifted (Weekly)" 
          value={`${(data?.totalVolume / 1000).toFixed(1)}k`} 
          unit="kg"
          change="+12.5%" 
          isPositive={true} 
          icon={<Dumbbell className="w-6 h-6" />} 
          iconBg="bg-orange-50" 
          iconColor="text-orange-600" 
          showChart={true}
          chartColor="text-orange-500"
        />
        <StatCard 
          title="Total Active Programs" 
          value="68" 
          change="+5 New" 
          isPositive={true} 
          icon={<ListChecks className="w-6 h-6" />} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
          changeLabel="this month"
        />
        <StatCard 
          title="Avg. RPE Score" 
          value={data?.avgRPE || "0"} 
          change="0.0" 
          isNeutral={true}
          icon={<Gauge className="w-6 h-6" />} 
          iconBg="bg-red-50" 
          iconColor="text-red-600" 
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Volume vs. Intensity Trends</h2>
            <p className="text-sm text-slate-500">Tracking total volume lifted against average intensity over time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500"></span>
              <span className="text-slate-600">Volume (kg)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-500"></span>
              <span className="text-slate-600">Intensity (RPE)</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full relative pb-6">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px border-dashed border-t border-slate-200"></div>
            ))}
          </div>
          <svg className="absolute inset-0 w-full h-full pb-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="gradientVolume" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            {/* Volume Path */}
            <path 
              className="opacity-50" 
              d={`M0,300 ${data?.volumeTrends?.map((v: number, i: number) => `L${(i / (data.volumeTrends.length - 1)) * 1000},${300 - (v / 60000) * 300}`).join(' ')} L1000,300 Z`} 
              fill="url(#gradientVolume)"
            />
            <path 
              fill="none" 
              d={data?.volumeTrends?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${(i / (data.volumeTrends.length - 1)) * 1000},${300 - (v / 60000) * 300}`).join(' ')} 
              stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
            />
            {/* Intensity Path */}
            <path 
              fill="none" 
              d={data?.intensityTrends?.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'}${(i / (data.intensityTrends.length - 1)) * 1000},${300 - (v / 10) * 300}`).join(' ')} 
              stroke="#3b82f6" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            />
            {data?.volumeTrends?.map((v: number, i: number) => {
              const x = (i / (data.volumeTrends.length - 1)) * 1000;
              const y = 300 - (v / 60000) * 300;
              return <circle key={i} cx={x} cy={y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2"></circle>;
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map(w => (
              <span key={w} className="text-xs text-slate-400 font-medium w-10 text-center">{w}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Training Type Distribution</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-8 h-full">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#3b82f6" strokeDasharray="251.2" strokeDashoffset="125" strokeWidth="12"></circle>
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f59e0b" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="12" transform="rotate(180 50 50)"></circle>
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#a855f7" strokeDasharray="251.2" strokeDashoffset="226" strokeWidth="12" transform="rotate(252 50 50)"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">100%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Breakdown</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <DistributionItem color="bg-blue-500" label="Strength" value="50%" />
              <DistributionItem color="bg-amber-500" label="Cardio" value="30%" />
              <DistributionItem color="bg-purple-500" label="Mobility" value="20%" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Muscle Group Frequency</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col h-full justify-center space-y-4">
            <FrequencyItem label="Legs" percentage={35} color="bg-emerald-500" />
            <FrequencyItem label="Back" percentage={25} color="bg-cyan-500" />
            <FrequencyItem label="Chest" percentage={20} color="bg-rose-500" />
            <FrequencyItem label="Shoulders" percentage={15} color="bg-violet-500" />
            <FrequencyItem label="Arms" percentage={5} color="bg-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, unit, change, isPositive, isNeutral, icon, iconBg, iconColor, showChart, chartColor = "text-emerald-500", changeLabel = "vs last month" }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 group hover:border-emerald-500/30 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">
            {value} {unit && <span className="text-lg font-normal text-slate-400">{unit}</span>}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      {showChart && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10">
          <svg className={`w-full h-full ${chartColor} fill-current`} viewBox="0 0 100 20">
            <path d="M0 20 L0 15 L10 12 L20 16 L30 10 L40 14 L50 8 L60 12 L70 6 L80 10 L90 4 L100 8 L100 20 Z"></path>
          </svg>
        </div>
      )}
      <div className="flex items-center gap-2 relative z-10">
        <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
          isNeutral ? 'text-slate-500 bg-slate-100' :
          isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {!isNeutral && (isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />)}
          {change}
        </span>
        <span className="text-xs text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function CohortRow({ cohort, data }: any) {
  return (
    <tr>
      <td className="py-3 text-left pl-4 font-medium text-slate-900">{cohort}</td>
      {data.map((val: any, i: number) => (
        <td key={i} className="py-3">
          {val !== null ? (
            <div className={`inline-block px-3 py-1 rounded text-white font-medium ${
              val >= 95 ? 'bg-emerald-600' :
              val >= 90 ? 'bg-emerald-500' :
              val >= 85 ? 'bg-emerald-400' : 'bg-emerald-300'
            }`}>
              {val}%
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span className="text-slate-600">{label}</span>
    </div>
  );
}

function DeficitClient({ name, deficit, severity, image }: any) {
  const severityStyles = {
    high: 'bg-red-50 border-red-100 text-red-500',
    med: 'bg-amber-50 border-amber-100 text-amber-500',
    low: 'bg-slate-50 border-slate-100 text-slate-500'
  };
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${severity === 'high' ? severityStyles.high : 'bg-white border-transparent hover:bg-slate-50'} transition-colors`}>
      <div className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}></div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 truncate">{name}</h4>
        <p className={`text-xs font-medium ${severity === 'high' ? 'text-red-500' : 'text-slate-500'}`}>{deficit}</p>
      </div>
      <div className="text-right">
        {severity === 'high' ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : (
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${severity === 'med' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
            {severity === 'med' ? 'Med' : 'Low'}
          </span>
        )}
      </div>
    </div>
  );
}

function DistributionItem({ color, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function FrequencyItem({ label, percentage, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
