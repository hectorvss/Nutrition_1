import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Wallet, UserPlus, Calculator } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Calculadora interactiva de ROI.
 *
 * Rediseno (mayo 2026):
 *  - Pasamos de card negra a card blanca, alineada con el resto de la
 *    landing (fondo claro, contraste con sombra y borde sutil). El negro
 *    rompia la armonia.
 *  - 3 sliders editables en vez de 2: clientes activos, tarifa cliente/mes
 *    y **horas dedicadas por cliente/mes**. La constante "3.5h ahorradas"
 *    ya no esta hardcodeada — el visitante calibra su propio caso.
 *  - 4 outputs en vez de 4 (mismo numero) pero ahora incluye "capacidad
 *    extra" (cuantos clientes mas podria atender con el tiempo recuperado),
 *    que es el numero que mas movera al coach que ya esta lleno.
 *
 * Modelo de calculo (transparente y editable desde el codigo):
 *  - savingsRate = 0.7  → NutriFit automatiza el 70% del tiempo
 *                          repetitivo (check-ins, planes, mensajes).
 *  - hoursTotal       = clientes × horasPorCliente
 *  - hoursSaved       = hoursTotal × savingsRate
 *  - hourlyValue      = tarifa / horasPorCliente  (lo que vale una hora
 *                          del coach segun lo que ya factura).
 *  - moneyValueOfTime = hoursSaved × hourlyValue
 *  - extraCapacity    = hoursSaved / horasPorCliente  (clientes adicionales).
 *  - roi              = moneyValueOfTime / 79€  (plan Scale).
 */
const NUTRIFIT_PRICE_MONTH = 79;
const SAVINGS_RATE = 0.7;

export default function ROISection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const [clients, setClients] = useState(20);
  const [tariff, setTariff] = useState(80);
  const [hoursPerClient, setHoursPerClient] = useState(4);

  const numbers = useMemo(() => {
    const revenue = clients * tariff;
    const hoursTotal = clients * hoursPerClient;
    const hoursSaved = hoursTotal * SAVINGS_RATE;
    const hourlyValue = hoursPerClient > 0 ? tariff / hoursPerClient : 0;
    const moneyValueOfTime = hoursSaved * hourlyValue;
    const extraCapacity = hoursPerClient > 0 ? hoursSaved / hoursPerClient : 0;
    const extraRevenue = extraCapacity * tariff;
    const roi = NUTRIFIT_PRICE_MONTH > 0
      ? Math.round((moneyValueOfTime / NUTRIFIT_PRICE_MONTH) * 10) / 10
      : 0;
    return {
      revenue,
      hoursSaved,
      moneyValueOfTime,
      extraCapacity,
      extraRevenue,
      roi,
    };
  }, [clients, tariff, hoursPerClient]);

  const fmt = (n: number) => n.toLocaleString(isEs ? 'es-ES' : 'en-US');

  // Slider re-usable. Tailwind no estiliza directamente el `range`
  // nativo en todos los navegadores, asi que usamos `accent-emerald-500`
  // (Chromium, Firefox modernos) y caemos a un estilo por defecto donde
  // no esta soportado — es UX aceptable sin CSS custom adicional.
  const Slider = ({
    id,
    label,
    value,
    min,
    max,
    step,
    suffix,
    onChange,
  }: {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
    onChange: (n: number) => void;
  }) => (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {label}
        </label>
        <span className="text-3xl font-medium tabular-nums text-gray-900">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );

  return (
    <section className="px-4 py-32">
      <div className="max-w-6xl mx-auto bg-white border border-gray-100 rounded-[32px] p-8 md:p-14 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)]">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 inline-flex items-center gap-2">
            <Calculator className="w-3 h-3" />
            {isEs ? 'Calculadora de ROI' : 'ROI calculator'}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium leading-tight tracking-tight text-gray-900"
          >
            {isEs ? 'Cuánto te devuelve NutriFit cada mes.' : 'How much NutriFit returns each month.'}
          </motion.h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
            {isEs
              ? 'Mueve los tres deslizadores con tu situación real. Los números se recalculan en vivo.'
              : 'Move the three sliders with your real situation. The numbers recalculate live.'}
          </p>
        </div>

        {/* Sliders horizontales arriba (3 columnas a ancho completo) +
            outputs justo debajo (5 KPIs en una fila). Sin layout de dos
            columnas: todo apilado dentro del mismo card sin huecos. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-100">
          <Slider
            id="roi-clients"
            label={isEs ? 'Clientes activos' : 'Active clients'}
            value={clients}
            min={5}
            max={80}
            onChange={setClients}
          />
          <Slider
            id="roi-tariff"
            label={isEs ? 'Tarifa cliente / mes' : 'Tariff per client / month'}
            value={tariff}
            min={30}
            max={250}
            step={5}
            suffix="€"
            onChange={setTariff}
          />
          <Slider
            id="roi-hours"
            label={isEs ? 'Horas cliente / mes' : 'Hours per client / month'}
            value={hoursPerClient}
            min={1}
            max={10}
            onChange={setHoursPerClient}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <OutputCard
            Icon={Wallet}
            label={isEs ? 'Facturación / mes' : 'Revenue / month'}
            value={`${fmt(numbers.revenue)}€`}
            note={isEs ? 'Clientes × tarifa.' : 'Clients × tariff.'}
          />
          <OutputCard
            Icon={Clock}
            label={isEs ? 'Horas recuperadas' : 'Hours recovered'}
            value={`${fmt(Math.round(numbers.hoursSaved))} h`}
            note={isEs ? '70% del tiempo automatizado.' : '70% of time, automated.'}
          />
          <OutputCard
            Icon={Wallet}
            label={isEs ? 'Valor del tiempo' : 'Value of time'}
            value={`${fmt(Math.round(numbers.moneyValueOfTime))}€`}
            note={isEs ? 'Tu tarifa por hora libre.' : 'Your hourly rate.'}
          />
          <OutputCard
            Icon={UserPlus}
            label={isEs ? 'Capacidad extra' : 'Extra capacity'}
            value={`+${Math.floor(numbers.extraCapacity)}`}
            note={
              isEs
                ? `+${fmt(Math.round(numbers.extraRevenue))}€ / mes`
                : `+${fmt(Math.round(numbers.extraRevenue))}€ / mo`
            }
          />
          <OutputCard
            Icon={TrendingUp}
            label={isEs ? 'ROI vs. Scale' : 'ROI vs. Scale'}
            value={`×${numbers.roi}`}
            note={
              isEs
                ? `Sobre ${NUTRIFIT_PRICE_MONTH}€/mes`
                : `Over €${NUTRIFIT_PRICE_MONTH}/mo`
            }
            highlight
          />
        </div>

        <p className="text-[11px] text-gray-400 mt-10 text-center max-w-2xl mx-auto leading-relaxed">
          {isEs
            ? `Cálculo orientativo. Asumimos que NutriFit automatiza el ${Math.round(SAVINGS_RATE * 100)}% del tiempo repetitivo (check-ins, planes, mensajes). Los resultados reales varían según tu flujo de trabajo.`
            : `Indicative figures. We assume NutriFit automates ${Math.round(SAVINGS_RATE * 100)}% of repetitive time (check-ins, plans, messages). Real results vary with your workflow.`}
        </p>
      </div>
    </section>
  );
}

/**
 * Tarjeta de output. `highlight` la usa la fila ROI para destacarla en
 * esmeralda — es el dato que mejor convierte porque cierra el calculo:
 * "por cada euro que pagas, te devuelve X".
 */
function OutputCard({
  Icon,
  label,
  value,
  note,
  highlight,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-6 border ${
        highlight
          ? 'bg-emerald-50/60 border-emerald-200/70 ring-1 ring-emerald-200/40'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            highlight ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-50 text-gray-500'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-emerald-700' : 'text-gray-500'}`}>
          {label}
        </p>
      </div>
      <p
        className={`text-4xl font-medium tabular-nums tracking-tight mb-2 ${
          highlight ? 'text-emerald-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      <p className={`text-xs leading-relaxed ${highlight ? 'text-emerald-700/70' : 'text-gray-400'}`}>
        {note}
      </p>
    </div>
  );
}
