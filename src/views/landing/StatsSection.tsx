import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Cifras de prueba: cuantitatividad real que da contexto del producto.
 * Los numeros son objetivos/promedios realistas — si despues conectamos un
 * endpoint de metricas, se pueden hacer dinamicos.
 */
const stats: { value: string; labelEs: string; labelEn: string }[] = [
  { value: '+85%', labelEs: 'menos tiempo en seguimiento', labelEn: 'less time on follow-ups' },
  { value: '3×', labelEs: 'más capacidad por coach', labelEn: 'more capacity per coach' },
  { value: '14d', labelEs: 'de prueba gratis, sin tarjeta', labelEn: 'free trial, no card' },
  { value: '99,9%', labelEs: 'tiempo de servicio (SLA)', labelEn: 'service uptime (SLA)' },
];

export default function StatsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';
  return (
    <section className="px-4 py-24 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-medium tracking-tight mb-2">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              {isEs ? s.labelEs : s.labelEn}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
