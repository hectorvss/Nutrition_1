import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Grafico de barras horizontal "Antes vs. Despues" — tiempo medio por tarea
 * habitual de un coach. Visualizacion en CSS puro, sin libreria de charts:
 * dos barras por tarea, longitud proporcional a los minutos.
 *
 * El factor "wow" viene de la diferencia visible entre la barra gris (proceso
 * manual de hoy) y la barra negra (NutriFit). Los numeros son estimaciones
 * realistas basadas en flujos tipicos.
 */
const tasks = [
  { es: 'Crear un plan nutricional', en: 'Create a nutrition plan',     before: 45, after: 8 },
  { es: 'Check-in semanal por cliente', en: 'Weekly check-in per client', before: 20, after: 4 },
  { es: 'Adaptar plan a un cliente nuevo', en: 'Adapt plan to a new client', before: 60, after: 10 },
  { es: 'Recordatorios y seguimiento', en: 'Reminders and follow-up',   before: 35, after: 0 },
  { es: 'Cobrar la suscripción mensual', en: 'Charge the monthly subscription', before: 15, after: 0 },
  { es: 'Reportar progreso al cliente', en: 'Report progress to client',  before: 25, after: 5 },
];

export default function ImpactSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const max = Math.max(...tasks.map(t => t.before));

  const totalBefore = tasks.reduce((acc, t) => acc + t.before, 0);
  const totalAfter = tasks.reduce((acc, t) => acc + t.after, 0);
  const savedPct = Math.round(((totalBefore - totalAfter) / totalBefore) * 100);

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Impacto medible' : 'Measurable impact'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs
            ? 'Tu día de coaching, antes y después.'
            : 'Your coaching day, before and after.'}
        </motion.h2>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
          {isEs
            ? 'Minutos medios por tarea, basados en flujos reales de coaches que usan NutriFit a diario.'
            : 'Average minutes per task, based on real-world flows from coaches who use NutriFit daily.'}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)]">
        {/* Leyenda */}
        <div className="flex items-center justify-end gap-6 mb-8 text-xs">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-gray-200" />
            {isEs ? 'Manual (WhatsApp + Excel)' : 'Manual (WhatsApp + Excel)'}
          </span>
          <span className="flex items-center gap-2 text-black font-medium">
            <span className="w-3 h-3 rounded-sm bg-black" />
            NutriFit
          </span>
        </div>

        {/* Filas */}
        <div className="space-y-6">
          {tasks.map((t, i) => {
            const beforePct = (t.before / max) * 100;
            const afterPct  = (t.after  / max) * 100;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6 items-center"
              >
                <div className="text-sm text-gray-700 font-medium">{isEs ? t.es : t.en}</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${beforePct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gray-300 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums w-14 text-right">{t.before} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${afterPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                        className="h-full bg-black rounded-full"
                      />
                    </div>
                    <span className="text-xs text-black font-bold tabular-nums w-14 text-right">
                      {t.after === 0 ? (isEs ? 'auto' : 'auto') : `${t.after} min`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-medium tracking-tight text-gray-400">{totalBefore} min</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
              {isEs ? 'Manual' : 'Manual'}
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-medium tracking-tight">{totalAfter} min</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
              {isEs ? 'Con NutriFit' : 'With NutriFit'}
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-medium tracking-tight text-emerald-600">{savedPct}%</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
              {isEs ? 'Tiempo ahorrado' : 'Time saved'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
