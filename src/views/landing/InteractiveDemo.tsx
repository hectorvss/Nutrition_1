import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ClipboardCheck,
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Flame,
  Dumbbell,
  Bell,
  ArrowUpRight,
  MousePointerClick,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Demo interactiva en vivo embebida en la landing.
 *
 * Es un mini-dashboard FALSO (sin backend, sin datos reales) que el
 * visitante puede tocar sin registrarse: cambiar de vista en el menu
 * lateral, seleccionar un cliente, mover los macros de un plan y marcar
 * check-ins como revisados. Es el elemento diferencial / "wow": en vez
 * de mirar capturas, interactua con el producto en 5 segundos.
 *
 * Todo el estado vive aqui en memoria. Cero llamadas de red. Cuando el
 * visitante hace clic en cualquier CTA, va a registro.
 */

type DemoView = 'dashboard' | 'clients' | 'nutrition' | 'checkins';

interface InteractiveDemoProps {
  onGetStarted?: () => void;
}

const DEMO_CLIENTS = [
  { id: 'c1', name: 'Laura M.', initials: 'LM', goal: { es: 'Pérdida de grasa', en: 'Fat loss' }, adherence: 92, trend: 'up' as const, color: 'from-rose-400 to-pink-500' },
  { id: 'c2', name: 'Carlos R.', initials: 'CR', goal: { es: 'Hipertrofia', en: 'Hypertrophy' }, adherence: 78, trend: 'up' as const, color: 'from-indigo-400 to-blue-500' },
  { id: 'c3', name: 'Nuria P.', initials: 'NP', goal: { es: 'Recomposición', en: 'Recomp' }, adherence: 64, trend: 'down' as const, color: 'from-amber-400 to-orange-500' },
  { id: 'c4', name: 'Diego S.', initials: 'DS', goal: { es: 'Mantenimiento', en: 'Maintenance' }, adherence: 88, trend: 'up' as const, color: 'from-emerald-400 to-teal-500' },
];

export default function InteractiveDemo({ onGetStarted }: InteractiveDemoProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const [view, setView] = useState<DemoView>('dashboard');
  const [selectedClient, setSelectedClient] = useState('c1');
  const [protein, setProtein] = useState(180);
  const [carbs, setCarbs] = useState(220);
  const [fats, setFats] = useState(70);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  const kcal = protein * 4 + carbs * 4 + fats * 9;
  const totalG = protein + carbs + fats;
  const pPct = Math.round((protein / totalG) * 100);
  const cPct = Math.round((carbs / totalG) * 100);
  const fPct = 100 - pPct - cPct;

  const navItems: { key: DemoView; Icon: typeof Users; es: string; en: string }[] = [
    { key: 'dashboard', Icon: LayoutDashboard, es: 'Inicio',    en: 'Home' },
    { key: 'clients',   Icon: Users,           es: 'Clientes',  en: 'Clients' },
    { key: 'nutrition', Icon: Utensils,        es: 'Nutrición', en: 'Nutrition' },
    { key: 'checkins',  Icon: ClipboardCheck,  es: 'Check-ins', en: 'Check-ins' },
  ];

  const client = DEMO_CLIENTS.find((c) => c.id === selectedClient) || DEMO_CLIENTS[0];

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3 inline-flex items-center gap-2">
            <MousePointerClick className="w-3.5 h-3.5" />
            {isEs ? 'Demo en vivo · sin registro' : 'Live demo · no sign-up'}
          </p>
          <h2 className="text-2xl md:text-4xl font-medium leading-tight tracking-tight">
            {isEs ? 'Pruébalo ahora mismo.' : 'Try it right now.'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            {isEs
              ? 'Esto es el producto real, no un vídeo. Cambia de sección, selecciona un cliente, mueve los macros. Toca lo que quieras.'
              : 'This is the real product, not a video. Switch sections, pick a client, drag the macros. Touch anything.'}
          </p>
        </div>

        {/* Browser chrome */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)] overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="mx-auto bg-white border border-gray-100 rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-2 w-1/2 max-w-xs justify-center">
              <Search className="w-3 h-3" />
              nutrifit.pro/app
            </div>
          </div>

          <div className="flex min-h-[440px]">
            {/* Sidebar */}
            <aside className="w-16 md:w-52 border-r border-gray-100 bg-gray-50/40 py-4 px-2 md:px-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 px-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                <span className="text-sm font-bold tracking-tight">NutriFit</span>
              </div>
              <nav className="space-y-1">
                {navItems.map(({ key, Icon, es, en }) => {
                  const active = view === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setView(key)}
                      className={`w-full flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="hidden md:inline">{isEs ? es : en}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main panel */}
            <div className="flex-1 p-5 md:p-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ---------- DASHBOARD ---------- */}
                  {view === 'dashboard' && (
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-1">
                        {isEs ? 'Buenos días, coach' : 'Good morning, coach'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        {isEs ? '4 clientes activos · 2 check-ins pendientes' : '4 active clients · 2 pending check-ins'}
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: isEs ? 'Clientes activos' : 'Active clients', value: '4', Icon: Users, tone: 'text-indigo-500 bg-indigo-50' },
                          { label: isEs ? 'Adherencia media' : 'Avg adherence', value: '80%', Icon: Flame, tone: 'text-emerald-500 bg-emerald-50' },
                          { label: isEs ? 'Sesiones / semana' : 'Sessions / week', value: '17', Icon: Dumbbell, tone: 'text-amber-500 bg-amber-50' },
                          { label: isEs ? 'En riesgo' : 'At risk', value: '1', Icon: Bell, tone: 'text-rose-500 bg-rose-50' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.tone}`}>
                              <s.Icon className="w-4 h-4" />
                            </div>
                            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                        <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800">
                          {isEs
                            ? 'Nuria P. ha bajado su adherencia 2 semanas seguidas. Quizá toca un mensaje.'
                            : 'Nuria P.’s adherence dropped two weeks running. Might be time for a nudge.'}
                        </p>
                        <button onClick={() => setView('clients')} className="ml-auto text-xs font-bold text-emerald-700 hover:underline whitespace-nowrap">
                          {isEs ? 'Ver' : 'View'} →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------- CLIENTS ---------- */}
                  {view === 'clients' && (
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-1">{isEs ? 'Tus clientes' : 'Your clients'}</h3>
                      <p className="text-sm text-gray-500 mb-6">{isEs ? 'Toca un cliente para verlo' : 'Tap a client to preview'}</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          {DEMO_CLIENTS.map((c) => {
                            const active = c.id === selectedClient;
                            return (
                              <button
                                key={c.id}
                                onClick={() => setSelectedClient(c.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                                  active ? 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200' : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                  {c.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{c.name}</p>
                                  <p className="text-[11px] text-gray-400">{isEs ? c.goal.es : c.goal.en}</p>
                                </div>
                                <span className={`text-xs font-bold tabular-nums ${c.adherence >= 80 ? 'text-emerald-600' : c.adherence >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {c.adherence}%
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Mini detalle del cliente seleccionado */}
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white border border-gray-100 rounded-2xl p-5"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${client.color} flex items-center justify-center text-white text-sm font-bold`}>
                              {client.initials}
                            </div>
                            <div>
                              <p className="font-bold tracking-tight">{client.name}</p>
                              <p className="text-xs text-gray-400">{isEs ? client.goal.es : client.goal.en}</p>
                            </div>
                            <div className={`ml-auto flex items-center gap-1 text-xs font-bold ${client.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {client.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {client.adherence}%
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                <span>{isEs ? 'Adherencia' : 'Adherence'}</span><span>{client.adherence}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className={`h-full rounded-full ${client.adherence >= 80 ? 'bg-emerald-500' : client.adherence >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${client.adherence}%` }} />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {[
                                { l: isEs ? 'Peso' : 'Weight', v: '72,4 kg' },
                                { l: isEs ? 'Sesiones' : 'Sessions', v: '4/4' },
                                { l: 'Check-in', v: isEs ? 'Hoy' : 'Today' },
                              ].map((x, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
                                  <p className="text-sm font-bold">{x.v}</p>
                                  <p className="text-[10px] text-gray-400">{x.l}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* ---------- NUTRITION ---------- */}
                  {view === 'nutrition' && (
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-1">{isEs ? 'Plan de nutrición' : 'Nutrition plan'}</h3>
                      <p className="text-sm text-gray-500 mb-6">{isEs ? 'Mueve los macros y mira cómo se recalcula todo' : 'Drag the macros and watch everything recompute'}</p>
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-5">
                          <MacroSlider label={isEs ? 'Proteína' : 'Protein'} value={protein} min={80} max={300} color="#10b981" onChange={setProtein} unit="g" />
                          <MacroSlider label={isEs ? 'Carbohidratos' : 'Carbs'} value={carbs} min={50} max={500} color="#3b82f6" onChange={setCarbs} unit="g" />
                          <MacroSlider label={isEs ? 'Grasas' : 'Fats'} value={fats} min={30} max={150} color="#f59e0b" onChange={setFats} unit="g" />
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-center">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{isEs ? 'Total diario' : 'Daily total'}</p>
                          <p className="text-5xl font-bold tabular-nums tracking-tight">{kcal.toLocaleString(isEs ? 'es-ES' : 'en-US')}</p>
                          <p className="text-sm text-gray-400 mb-5">kcal</p>
                          <div className="flex h-3 rounded-full overflow-hidden mb-3">
                            <div style={{ width: `${pPct}%`, background: '#10b981' }} />
                            <div style={{ width: `${cPct}%`, background: '#3b82f6' }} />
                            <div style={{ width: `${fPct}%`, background: '#f59e0b' }} />
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-emerald-600">{pPct}% P</span>
                            <span className="text-blue-500">{cPct}% C</span>
                            <span className="text-amber-500">{fPct}% G</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------- CHECK-INS ---------- */}
                  {view === 'checkins' && (
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-1">{isEs ? 'Check-ins de la semana' : 'This week’s check-ins'}</h3>
                      <p className="text-sm text-gray-500 mb-6">{isEs ? 'Márcalos como revisados con un clic' : 'Mark them reviewed with one click'}</p>
                      <div className="space-y-2.5">
                        {DEMO_CLIENTS.map((c) => {
                          const done = reviewed[c.id];
                          return (
                            <div key={c.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                {c.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {done
                                    ? (isEs ? 'Revisado · feedback enviado' : 'Reviewed · feedback sent')
                                    : (isEs ? 'Pendiente de revisar' : 'Pending review')}
                                </p>
                              </div>
                              <button
                                onClick={() => setReviewed((r) => ({ ...r, [c.id]: !r[c.id] }))}
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors ${
                                  done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {done ? (isEs ? 'Revisado' : 'Reviewed') : (isEs ? 'Revisar' : 'Review')}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CTA bajo la demo */}
        <div className="text-center mt-8">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            {isEs ? 'Crea tu cuenta y úsalo de verdad' : 'Create your account and use it for real'}
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-gray-400 mt-3">{isEs ? '14 días gratis. Sin tarjeta.' : '14 days free. No card.'}</p>
        </div>
      </div>
    </div>
  );
}

function MacroSlider({
  label,
  value,
  min,
  max,
  color,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  unit: string;
  onChange: (n: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-lg font-bold tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)` }}
        className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-1.5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:shadow-md"
      />
    </div>
  );
}
