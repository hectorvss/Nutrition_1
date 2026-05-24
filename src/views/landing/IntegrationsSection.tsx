import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Bloque "Integraciones": logos reales de las plataformas con las que la app
 * realmente trabaja. Los SVG vienen del CDN publico de Simple Icons, lo que
 * garantiza el mark oficial de cada marca y un peso minimo.
 */
const integrations: { name: string; slug: string; color?: string; description: string }[] = [
  { name: 'Stripe', slug: 'stripe', color: '635BFF', description: 'Pagos y suscripciones' },
  { name: 'Supabase', slug: 'supabase', color: '3FCF8E', description: 'Datos seguros y en tiempo real' },
  { name: 'Google Calendar', slug: 'googlecalendar', color: '4285F4', description: 'Sincronización de citas' },
];

export default function IntegrationsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Funciona con las herramientas que ya usas' : 'Works with the tools you already use'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs ? 'Integraciones que ahorran horas cada semana.' : 'Integrations that save hours every week.'}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((it, i) => (
          <motion.div
            key={it.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="h-14 w-14 mb-5 flex items-center justify-center">
              <img
                src={`https://cdn.simpleicons.org/${it.slug}${it.color ? `/${it.color}` : ''}`}
                alt={it.name}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
            </div>
            <h3 className="text-base font-medium mb-1">{it.name}</h3>
            <p className="text-xs text-gray-500">{it.description}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-10">
        {isEs
          ? '¿Necesitas otra integración? Cuéntanoslo y la priorizamos.'
          : 'Need another integration? Tell us and we will prioritise it.'}
      </p>
    </section>
  );
}
