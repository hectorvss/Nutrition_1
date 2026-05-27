import { Sparkles, Wrench, ShieldCheck, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ChangelogPageProps {
  onBack: () => void;
}

type EntryType = 'new' | 'improvement' | 'fix' | 'security';

const TYPE_META: Record<EntryType, { Icon: any; labelEs: string; labelEn: string; color: string }> = {
  new:         { Icon: Plus,        labelEs: 'Nuevo',     labelEn: 'New',          color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  improvement: { Icon: Sparkles,    labelEs: 'Mejora',    labelEn: 'Improvement',  color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  fix:         { Icon: Wrench,      labelEs: 'Arreglo',   labelEn: 'Fix',          color: 'bg-amber-50 text-amber-700 border-amber-100' },
  security:    { Icon: ShieldCheck, labelEs: 'Seguridad', labelEn: 'Security',     color: 'bg-rose-50 text-rose-700 border-rose-100' },
};

const entries: { date: string; items: { type: EntryType; es: string; en: string }[] }[] = [
  {
    date: '2026-05',
    items: [
      { type: 'new', es: 'Landing rediseñada con secciones de soluciones, recursos, FAQ y demo guiada.', en: 'Landing redesigned with solutions, resources, FAQ and guided demo sections.' },
      { type: 'new', es: 'Biblioteca de 40+ recetas detalladas (ES/EN) con micronutrientes y alérgenos.', en: '40+ detailed recipes (ES/EN) with micronutrients and allergens.' },
      { type: 'improvement', es: 'Botón "Guardar" funcional en la ficha de receta del portal cliente.', en: 'Working "Save" button on the client portal recipe view.' },
      { type: 'security', es: 'Validación estricta de cursores de paginación para evitar inyección PostgREST.', en: 'Strict pagination cursor validation to prevent PostgREST injection.' },
    ],
  },
  {
    date: '2026-04',
    items: [
      { type: 'new', es: 'Workflow Builder visual: triggers, condiciones y acciones drag-and-drop.', en: 'Visual Workflow Builder: drag-and-drop triggers, conditions and actions.' },
      { type: 'new', es: 'Suscripciones recurrentes con Stripe y portal de cliente integrado.', en: 'Recurring subscriptions with Stripe and integrated customer portal.' },
      { type: 'improvement', es: 'Sidebar plegable estilo CRM-AI sin saltos de layout.', en: 'CRM-AI-style collapsible sidebar with no layout jumps.' },
    ],
  },
  {
    date: '2026-03',
    items: [
      { type: 'new', es: 'Portal del cliente con dashboard, planes, check-ins y progreso.', en: 'Client portal with dashboard, plans, check-ins and progress.' },
      { type: 'new', es: 'Plantillas de check-ins personalizables con dependencias entre preguntas.', en: 'Customisable check-in templates with question dependencies.' },
      { type: 'improvement', es: 'Soporte completo bilingüe ES/EN, formatos de fecha y número incluidos.', en: 'Full bilingual ES/EN support, including date and number formats.' },
    ],
  },
];

export default function ChangelogPage({ onBack }: ChangelogPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Changelog</p>
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
        {isEs ? 'Lo último que hemos enviado.' : 'What we shipped lately.'}
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
        {isEs
          ? 'Actualizamos NutriFit casi cada semana. Aquí va el rastro público de lo que cambia.'
          : 'We ship NutriFit almost weekly. This is the public trail of what changes.'}
      </p>

      <div className="space-y-12 text-center">
        {entries.map((entry) => (
          <div key={entry.date}>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">{entry.date}</h2>
            <div className="space-y-3">
              {entry.items.map((it, j) => {
                const meta = TYPE_META[it.type];
                const Icon = meta.Icon;
                return (
                  <div key={j} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1 ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                      {isEs ? meta.labelEs : meta.labelEn}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{isEs ? it.es : it.en}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
