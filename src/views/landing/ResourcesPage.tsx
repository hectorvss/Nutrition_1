import { ChevronLeft, BookOpen, FileText, Headphones, Newspaper } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ResourcesPageProps {
  onBack: () => void;
}

/**
 * Hub de recursos: guias, articulos, documentacion y contacto. El contenido
 * de cada tarjeta es placeholder — listo para enlazar a articulos reales
 * cuando se publiquen.
 */
export default function ResourcesPage({ onBack }: ResourcesPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const groups = [
    {
      Icon: BookOpen,
      labelEs: 'Guías',
      labelEn: 'Guides',
      itemsEs: [
        'Cómo configurar tu primer mes con la plataforma',
        'Plantillas de planes que funcionan en la práctica',
        'Diseño de check-ins semanales eficaces',
      ],
      itemsEn: [
        'How to set up your first month on the platform',
        'Plan templates that work in real practice',
        'Designing effective weekly check-ins',
      ],
    },
    {
      Icon: FileText,
      labelEs: 'Artículos',
      labelEn: 'Articles',
      itemsEs: [
        'Adherencia: la métrica que importa de verdad',
        'Cómo escalar a 40 clientes sin perder calidad',
        'Errores comunes al planificar macros',
      ],
      itemsEn: [
        'Adherence: the metric that actually matters',
        'Scaling to 40 clients without losing quality',
        'Common mistakes when planning macros',
      ],
    },
    {
      Icon: Headphones,
      labelEs: 'Casos de éxito',
      labelEn: 'Customer stories',
      itemsEs: [
        'De WhatsApp a sistema profesional en 3 semanas',
        'Cómo un equipo de 5 coaches estandariza calidad',
        'Doblar facturación sin doblar horas',
      ],
      itemsEn: [
        'From WhatsApp to a professional system in 3 weeks',
        'How a 5-coach team standardises quality',
        'Doubling revenue without doubling hours',
      ],
    },
    {
      Icon: Newspaper,
      labelEs: 'Documentación',
      labelEn: 'Documentation',
      itemsEs: [
        'Primeros pasos para coaches',
        'Configuración de automatizaciones',
        'API y exportaciones de datos',
      ],
      itemsEn: [
        'Getting started for coaches',
        'Setting up automations',
        'API and data exports',
      ],
    },
  ];

  return (
    <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-10"
      >
        <ChevronLeft className="w-4 h-4" />
        {isEs ? 'Volver a inicio' : 'Back to home'}
      </button>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
        {isEs ? 'Recursos' : 'Resources'}
      </p>
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
        {isEs ? 'Aprende, configura, crece.' : 'Learn, set up, grow.'}
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mb-16">
        {isEs
          ? 'Guías, artículos y documentación para sacar el máximo a la plataforma.'
          : 'Guides, articles and documentation to get the most out of the platform.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(({ Icon, labelEs, labelEn, itemsEs, itemsEn }, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-medium tracking-tight">{isEs ? labelEs : labelEn}</h2>
            </div>
            <ul className="space-y-3">
              {(isEs ? itemsEs : itemsEn).map((item, j) => (
                <li key={j} className="text-sm text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                  <span>{item}</span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest">
                    {isEs ? 'Próximamente' : 'Soon'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-12">
        {isEs
          ? '¿Te falta algún tema? Escríbenos y lo añadiremos al calendario editorial.'
          : 'Missing a topic? Write to us and we’ll add it to the editorial calendar.'}
      </p>
    </div>
  );
}
