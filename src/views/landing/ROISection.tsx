import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Calculadora interactiva de ROI: el visitante mueve dos sliders (clientes
 * activos y tarifa por cliente/mes) y ve en vivo cuanto factura, cuanto
 * tiempo ahorra al mes y cual es el "retorno" sobre el precio del plan
 * Scale de NutriFit. Es el bloque mas "wow": numeros reales calculados en
 * el navegador y proyectados sobre la situacion concreta del coach.
 */
const HOURS_SAVED_PER_CLIENT_MONTH = 3.5; // media de horas que NutriFit ahorra por cliente y mes
const NUTRIFIT_PRICE_MONTH = 79;          // plan Scale (referencia)

export default function ROISection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const [clients, setClients] = useState(20);
  const [tariff, setTariff] = useState(80);

  const numbers = useMemo(() => {
    const revenue = clients * tariff;
    const hoursSaved = clients * HOURS_SAVED_PER_CLIENT_MONTH;
    const hourlyValue = tariff;             // proxy: una hora cuesta lo mismo que el cliente medio
    const moneyValueOfTime = hoursSaved * hourlyValue;
    const roi = NUTRIFIT_PRICE_MONTH > 0 ? Math.round((moneyValueOfTime / NUTRIFIT_PRICE_MONTH) * 10) / 10 : 0;
    return { revenue, hoursSaved, moneyValueOfTime, roi };
  }, [clients, tariff]);

  const fmt = (n: number) => n.toLocaleString(isEs ? 'es-ES' : 'en-US');

  return (
    <section className="px-4 py-32">
      <div className="max-w-5xl mx-auto bg-black text-white rounded-[32px] p-8 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)]">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">
            {isEs ? 'Calculadora de ROI' : 'ROI calculator'}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium leading-tight tracking-tight"
          >
            {isEs ? 'Cuánto te devuelve NutriFit cada mes.' : 'How much NutriFit returns each month.'}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Inputs */}
          <div className="space-y-8">
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label htmlFor="roi-clients" className="text-xs font-bold uppercase tracking-widest text-white/60">
                  {isEs ? 'Clientes activos' : 'Active clients'}
                </label>
                <span className="text-3xl font-medium tabular-nums">{clients}</span>
              </div>
              <input
                id="roi-clients"
                type="range"
                min={5}
                max={80}
                step={1}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1 tabular-nums">
                <span>5</span><span>80</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label htmlFor="roi-tariff" className="text-xs font-bold uppercase tracking-widest text-white/60">
                  {isEs ? 'Tarifa cliente / mes' : 'Tariff per client / month'}
                </label>
                <span className="text-3xl font-medium tabular-nums">{tariff}€</span>
              </div>
              <input
                id="roi-tariff"
                type="range"
                min={30}
                max={200}
                step={5}
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1 tabular-nums">
                <span>30€</span><span>200€</span>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">
                {isEs ? 'Facturación / mes' : 'Revenue / month'}
              </div>
              <div className="text-3xl font-medium tabular-nums">{fmt(numbers.revenue)}€</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">
                {isEs ? 'Horas ahorradas / mes' : 'Hours saved / month'}
              </div>
              <div className="text-3xl font-medium tabular-nums">{fmt(Math.round(numbers.hoursSaved))} h</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">
                {isEs ? 'Valor del tiempo recuperado' : 'Value of recovered time'}
              </div>
              <div className="text-3xl font-medium tabular-nums">{fmt(Math.round(numbers.moneyValueOfTime))}€</div>
            </div>
            <div className="bg-emerald-500/15 border border-emerald-400/30 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold mb-2">
                {isEs ? 'ROI vs. plan Scale' : 'ROI vs. Scale plan'}
              </div>
              <div className="text-3xl font-medium tabular-nums text-emerald-300">×{numbers.roi}</div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/40 mt-10 text-center max-w-2xl mx-auto">
          {isEs
            ? `Cálculo orientativo: ${HOURS_SAVED_PER_CLIENT_MONTH} h ahorradas por cliente y mes, valoradas a tu tarifa, frente al precio mensual del plan Scale (${NUTRIFIT_PRICE_MONTH}€). Resultados reales varían según tu flujo de trabajo.`
            : `Indicative figures: ${HOURS_SAVED_PER_CLIENT_MONTH} h saved per client per month, valued at your tariff, against the Scale plan’s monthly price (€${NUTRIFIT_PRICE_MONTH}). Actual results vary with your workflow.`}
        </p>
      </div>
    </section>
  );
}
