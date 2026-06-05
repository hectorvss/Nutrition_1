import { motion } from 'motion/react';
import { Clock, TrendingUp, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const stats = [
  {
    icon: Clock,
    accent: 'emerald',
    numEs: '8+',
    unitEs: 'h / semana',
    numEn: '8+',
    unitEn: 'h / week',
    labelEs: 'recuperadas en admin',
    labelEn: 'saved on admin',
    subEs: 'check-ins, planes y mensajes automatizados',
    subEn: 'automated check-ins, plans and messages',
  },
  {
    icon: TrendingUp,
    accent: 'blue',
    numEs: '3×',
    unitEs: 'más clientes',
    numEn: '3×',
    unitEn: 'more clients',
    labelEs: 'sin ampliar tu agenda',
    labelEn: 'without extra hours',
    subEs: 'escala tu negocio sin trabajar más',
    subEn: 'grow your business, not your workload',
  },
  {
    icon: ShieldCheck,
    accent: 'violet',
    numEs: '14',
    unitEs: 'días gratis',
    numEn: '14',
    unitEn: 'day trial',
    labelEs: 'sin tarjeta de crédito',
    labelEn: 'no credit card needed',
    subEs: 'cancela en cualquier momento',
    subEn: 'cancel anytime, no strings',
  },
  {
    icon: LayoutDashboard,
    accent: 'amber',
    numEs: 'Todo',
    unitEs: 'en uno',
    numEn: 'All',
    unitEn: 'in one',
    labelEs: 'planes, chat y progreso',
    labelEn: 'plans, chat and progress',
    subEs: 'un solo flujo, sin saltar entre apps',
    subEn: 'one workflow, no app-hopping',
  },
];

const ACCENT: Record<string, { bg: string; icon: string; num: string; unit: string }> = {
  emerald: { bg: 'bg-gray-100', icon: 'text-gray-500', num: 'text-gray-950', unit: 'text-gray-500' },
  blue:    { bg: 'bg-gray-100', icon: 'text-gray-500', num: 'text-gray-950', unit: 'text-gray-500' },
  violet:  { bg: 'bg-gray-100', icon: 'text-gray-500', num: 'text-gray-950', unit: 'text-gray-500' },
  amber:   { bg: 'bg-gray-100', icon: 'text-gray-500', num: 'text-gray-950', unit: 'text-gray-500' },
};

export default function StatsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
          {isEs ? 'En números' : 'By the numbers'}
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-950">
          {isEs ? 'Menos admin. Más coaching real.' : 'Less admin. More real coaching.'}
        </h2>
        <p className="mt-4 text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
          {isEs
            ? 'Automatiza el trabajo repetitivo, centraliza tu operativa y recupera horas para atender mejor a cada cliente.'
            : 'Automate repetitive work, centralise your ops and get hours back to coach each client better.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const a = ACCENT[s.accent];
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.5, ease: 'easeOut' }}
              className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col gap-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.14)] hover:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.2)] transition-shadow duration-300"
            >
              {/* Icon badge */}
              <div className={`w-10 h-10 rounded-2xl ${a.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${a.icon}`} />
              </div>

              {/* Number + unit */}
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold tracking-tight leading-none ${a.num}`}>
                  {isEs ? s.numEs : s.numEn}
                </span>
                <span className={`text-sm font-semibold ${a.unit} leading-tight`}>
                  {isEs ? s.unitEs : s.unitEn}
                </span>
              </div>

              {/* Label + sub */}
              <div>
                <p className="text-sm font-bold text-gray-900 leading-snug">
                  {isEs ? s.labelEs : s.labelEn}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">
                  {isEs ? s.subEs : s.subEn}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6 max-w-3xl mx-auto">
        {isEs
          ? 'Estimaciones basadas en flujos de trabajo típicos de coaching. Tus resultados varían según tu operativa.'
          : 'Estimates based on typical coaching workflows. Your results vary with your operation.'}
      </p>
    </section>
  );
}
