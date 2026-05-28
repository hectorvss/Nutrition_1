import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Cifras de prueba. Framing honesto para una etapa temprana: en vez de
 * porcentajes infladados sin respaldo (el "+85%" y el "99,9% SLA"
 * anteriores), metricas concretas y defendibles + una nota al pie que
 * deja claro que son estimaciones sobre flujos tipicos. Si mas adelante
 * conectamos un endpoint de metricas reales, se hacen dinamicas.
 */
const stats: { value: string; labelEs: string; labelEn: string; subEs?: string; subEn?: string }[] = [
  {
    value: '−5 h',
    labelEs: 'por semana en tareas repetitivas',
    labelEn: 'per week on repetitive work',
    subEs: 'check-ins, planes y mensajes automatizados',
    subEn: 'automated check-ins, plans and messages',
  },
  {
    value: '2×',
    labelEs: 'capacidad de clientes',
    labelEn: 'client capacity',
    subEs: 'sin trabajar más horas',
    subEn: 'without working more hours',
  },
  {
    value: '14 días',
    labelEs: 'de prueba gratis',
    labelEn: 'free trial',
    subEs: 'sin tarjeta, cancela cuando quieras',
    subEn: 'no card, cancel anytime',
  },
  {
    value: '100% UE',
    labelEs: 'datos alojados en Europa',
    labelEn: 'data hosted in Europe',
    subEs: 'cifrados y bajo RGPD',
    subEn: 'encrypted and GDPR-ready',
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
        <h2 className="text-2xl md:text-4xl font-medium tracking-tight">
          {isEs ? 'Menos admin, más coaching.' : 'Less admin, more coaching.'}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.12)]"
          >
            <div className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-gray-900">{s.value}</div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold leading-snug">
              {isEs ? s.labelEs : s.labelEn}
            </div>
            {(s.subEs || s.subEn) && (
              <div className="text-[11px] text-gray-400 mt-2 leading-snug">
                {isEs ? s.subEs : s.subEn}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        {isEs
          ? 'Estimaciones basadas en flujos de trabajo típicos de coaching. Tus resultados varían según tu operativa.'
          : 'Estimates based on typical coaching workflows. Your results vary with your operation.'}
      </p>
    </section>
  );
}
