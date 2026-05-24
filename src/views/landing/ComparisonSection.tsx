import { motion } from 'motion/react';
import { Check, X as XIcon, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Comparativa frente a las alternativas reales que usan los coaches:
 * Excel, WhatsApp y CRMs genericos (Trello / Notion / HubSpot...). No
 * mencionamos marcas competidoras directas — solo categorias de herramienta.
 * El visitante ve a un golpe de vista por que NutriFit es la unica que
 * cubre todo el flujo.
 */
type Cell = true | false | 'partial';

const rows: { es: string; en: string; excel: Cell; whatsapp: Cell; crm: Cell; nutrifit: Cell }[] = [
  { es: 'Portal personalizado para cada cliente',          en: 'Personalised portal per client',                  excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Planes de nutrición con macros automáticos',      en: 'Nutrition plans with automatic macros',           excel: 'partial', whatsapp: false,    crm: false,     nutrifit: true },
  { es: 'Planes de entreno con bloques y progresión',      en: 'Training plans with blocks and progression',      excel: 'partial', whatsapp: false,    crm: false,     nutrifit: true },
  { es: 'Recetas detalladas reutilizables',                en: 'Reusable, detailed recipes',                      excel: false,    whatsapp: false,    crm: false,     nutrifit: true },
  { es: 'Check-ins semanales estructurados',               en: 'Structured weekly check-ins',                     excel: 'partial', whatsapp: 'partial', crm: 'partial', nutrifit: true },
  { es: 'Mensajería 1-a-1 con histórico',                  en: '1-on-1 messaging with history',                   excel: false,    whatsapp: true,     crm: 'partial', nutrifit: true },
  { es: 'Notificaciones push (web + móvil)',               en: 'Push notifications (web + mobile)',               excel: false,    whatsapp: true,     crm: 'partial', nutrifit: true },
  { es: 'Alertas automáticas de adherencia',               en: 'Automatic adherence alerts',                      excel: false,    whatsapp: false,    crm: false,     nutrifit: true },
  { es: 'Workflow Builder visual',                         en: 'Visual workflow builder',                         excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Calendario sincronizado (Google)',                en: 'Synchronised calendar (Google)',                  excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Cobros recurrentes (Stripe) integrados',          en: 'Integrated recurring billing (Stripe)',           excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Analíticas de progreso por cliente',              en: 'Per-client progress analytics',                   excel: 'partial', whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Aislamiento real coach ↔ cliente',                en: 'Real coach ↔ client isolation',                   excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Datos cifrados en infraestructura UE',            en: 'Encrypted data on EU infrastructure',             excel: false,    whatsapp: false,    crm: 'partial', nutrifit: true },
  { es: 'Bilingüe ES/EN listo para usar',                  en: 'Bilingual ES/EN out of the box',                  excel: 'partial', whatsapp: true,     crm: 'partial', nutrifit: true },
];

const cellRender = (v: Cell) => {
  if (v === true)      return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (v === 'partial') return <Minus className="w-4 h-4 text-amber-500 mx-auto" />;
  return <XIcon className="w-4 h-4 text-gray-300 mx-auto" />;
};

/** Resumen por columna: porcentaje de filas cubiertas (full = 1, partial = 0.5). */
function coverage(getter: (r: typeof rows[number]) => Cell): number {
  const score = rows.reduce((acc, r) => {
    const v = getter(r);
    return acc + (v === true ? 1 : v === 'partial' ? 0.5 : 0);
  }, 0);
  return Math.round((score / rows.length) * 100);
}

export default function ComparisonSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const excelCov   = coverage((r) => r.excel);
  const whatsCov   = coverage((r) => r.whatsapp);
  const crmCov     = coverage((r) => r.crm);
  const nfCov      = coverage((r) => r.nutrifit);

  const columns: { key: 'excel' | 'whatsapp' | 'crm' | 'nutrifit'; label: string; coverage: number; highlight?: boolean }[] = [
    { key: 'excel',    label: isEs ? 'Excel / Sheets' : 'Excel / Sheets', coverage: excelCov },
    { key: 'whatsapp', label: 'WhatsApp',                                  coverage: whatsCov },
    { key: 'crm',      label: isEs ? 'CRM genérico'   : 'Generic CRM',    coverage: crmCov },
    { key: 'nutrifit', label: 'NutriFit',                                  coverage: nfCov, highlight: true },
  ];

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Comparativa' : 'Comparison'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight"
        >
          {isEs ? 'NutriFit frente a lo que usas ahora.' : 'NutriFit vs. what you use today.'}
        </motion.h2>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
          {isEs
            ? '15 capacidades clave del día a día de un coach, comparadas con las tres alternativas más habituales.'
            : '15 day-to-day capabilities for a coach, compared against the three most common alternatives.'}
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 px-6 py-5 w-2/5">
                {isEs ? 'Capacidad' : 'Capability'}
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`text-center px-4 py-5 ${c.highlight ? 'bg-black text-white' : 'text-gray-500'}`}
                >
                  <div className={`text-xs font-bold uppercase tracking-widest ${c.highlight ? 'text-white' : ''}`}>{c.label}</div>
                  <div className={`mt-1 text-[10px] tabular-nums ${c.highlight ? 'text-white/60' : 'text-gray-400'}`}>
                    {c.coverage}%
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-3.5 text-gray-700">{isEs ? r.es : r.en}</td>
                <td className="px-4 py-3.5">{cellRender(r.excel)}</td>
                <td className="px-4 py-3.5">{cellRender(r.whatsapp)}</td>
                <td className="px-4 py-3.5">{cellRender(r.crm)}</td>
                <td className="px-4 py-3.5 bg-black/[0.03]">{cellRender(r.nutrifit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> {isEs ? 'Incluido' : 'Included'}</span>
        <span className="inline-flex items-center gap-1.5"><Minus className="w-3 h-3 text-amber-500" /> {isEs ? 'Parcial / manual' : 'Partial / manual'}</span>
        <span className="inline-flex items-center gap-1.5"><XIcon className="w-3 h-3 text-gray-300" /> {isEs ? 'No disponible' : 'Not available'}</span>
      </div>
    </section>
  );
}
