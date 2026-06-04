import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Honest proof points, but expressed in a way that feels like business impact
 * rather than generic admin counts.
 */
const stats: { valueEs: string; valueEn: string; labelEs: string; labelEn: string; subEs?: string; subEn?: string }[] = [
  {
    valueEs: '8+ h',
    valueEn: '8+ h',
    labelEs: 'ahorradas por semana',
    labelEn: 'saved each week',
    subEs: 'en check-ins, planes y mensajes repetitivos',
    subEn: 'on repetitive check-ins, plans and messages',
  },
  {
    valueEs: '3x',
    valueEn: '3x',
    labelEs: 'más capacidad de clientes',
    labelEn: 'more client capacity',
    subEs: 'sin abrir más horas de agenda',
    subEn: 'without opening more hours',
  },
  {
    valueEs: '14 días',
    valueEn: '14 days',
    labelEs: 'de prueba gratis',
    labelEn: 'free trial',
    subEs: 'sin tarjeta, cancela cuando quieras',
    subEn: 'no card, cancel anytime',
  },
  {
    valueEs: '1 centro',
    valueEn: '1 hub',
    labelEs: 'para planes, chat y progreso',
    labelEn: 'for plans, chat and progress',
    subEs: 'un solo flujo, sin saltar entre herramientas',
    subEn: 'one workflow, no app-hopping',
  },
];

export default function StatsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
          {isEs ? 'En números' : 'By the numbers'}
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-950">
          {isEs ? 'Menos admin. Más coaching real.' : 'Less admin. More real coaching.'}
        </h2>
        <p className="mt-4 text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
          {isEs
            ? 'Automatiza el trabajo repetitivo, centraliza la operativa y recupera horas para atender mejor a cada cliente.'
            : 'Automate repetitive work, centralise your ops and get hours back to coach each client better.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 text-center shadow-[0_24px_70px_-32px_rgba(0,0,0,0.18)]"
          >
            <div className="text-5xl md:text-6xl font-semibold tracking-tight mb-3 text-gray-950">
              {isEs ? s.valueEs : s.valueEn}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500 font-bold leading-snug">
              {isEs ? s.labelEs : s.labelEn}
            </div>
            {(s.subEs || s.subEn) && (
              <div className="text-[11px] text-gray-400 mt-3 leading-snug">
                {isEs ? s.subEs : s.subEn}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6 max-w-3xl mx-auto">
        {isEs
          ? 'Estimaciones basadas en flujos de trabajo típicos de coaching. Tus resultados varían según tu operativa.'
          : 'Estimates based on typical coaching workflows. Your results vary with your operation.'}
      </p>
    </section>
  );
}
