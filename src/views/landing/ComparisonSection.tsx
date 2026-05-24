import { motion } from 'motion/react';
import { Check, X as XIcon, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Comparativa vs. el "stack improvisado" (WhatsApp + Excel + Drive) que usa
 * la mayoria de coaches al empezar. Solo confronta capacidades reales — sin
 * mencionar marcas competidoras directamente.
 */
const rows = [
  { es: 'Portal personalizado para cada cliente', en: 'Personalised portal per client', nf: true, manual: false },
  { es: 'Planes de nutrición y entreno reutilizables', en: 'Reusable nutrition & training plans', nf: true, manual: 'partial' as const },
  { es: 'Check-ins estructurados con histórico', en: 'Structured check-ins with history', nf: true, manual: 'partial' as const },
  { es: 'Mensajería 1-a-1 con notificaciones push', en: '1-on-1 messaging with push notifications', nf: true, manual: 'partial' as const },
  { es: 'Alertas automáticas de adherencia', en: 'Automatic adherence alerts', nf: true, manual: false },
  { es: 'Cobros recurrentes integrados (Stripe)', en: 'Integrated recurring billing (Stripe)', nf: true, manual: false },
  { es: 'Analíticas de progreso por cliente', en: 'Per-client progress analytics', nf: true, manual: false },
  { es: 'Datos seguros en infraestructura UE', en: 'Secure data on EU infrastructure', nf: true, manual: false },
  { es: 'Aislamiento real entre coaches y clientes', en: 'Real isolation between coaches and clients', nf: true, manual: false },
];

const Cell = ({ value }: { value: true | false | 'partial' }) => {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === 'partial') return <Minus className="w-4 h-4 text-amber-500 mx-auto" />;
  return <XIcon className="w-4 h-4 text-gray-300 mx-auto" />;
};

export default function ComparisonSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Por qué NutriFit' : 'Why NutriFit'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight"
        >
          {isEs ? 'Frente a WhatsApp + Excel + Drive.' : 'Versus WhatsApp + Excel + Drive.'}
        </motion.h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 px-6 py-4 w-1/2">
                {isEs ? 'Capacidad' : 'Capability'}
              </th>
              <th className="text-center text-xs font-bold uppercase tracking-widest text-black px-6 py-4">NutriFit</th>
              <th className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 px-6 py-4">
                {isEs ? 'Hazlo manual' : 'DIY stack'}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-4 text-gray-700">{isEs ? r.es : r.en}</td>
                <td className="px-6 py-4"><Cell value={r.nf} /></td>
                <td className="px-6 py-4"><Cell value={r.manual} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> {isEs ? 'Incluido' : 'Included'}</span>
        <span className="inline-flex items-center gap-1.5"><Minus className="w-3 h-3 text-amber-500" /> {isEs ? 'Parcial / manual' : 'Partial / manual'}</span>
        <span className="inline-flex items-center gap-1.5"><XIcon className="w-3 h-3 text-gray-300" /> {isEs ? 'No disponible' : 'Not available'}</span>
      </div>
    </section>
  );
}
