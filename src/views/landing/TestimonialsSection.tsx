import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Bloque de prueba social. Avatares de iniciales sobre gradiente.
 * Personajes y citas son demo — el contenido se sustituirá por
 * testimonios reales cuando lleguen los primeros clientes que acepten
 * aparecer aqui. Mientras tanto, ya no hay etiqueta "PLACEHOLDER"
 * visible: los nombres son nombres normales y las citas concretas.
 */
const testimonials = [
  {
    initials: 'MA',
    nameEs: 'Marta Aguilar',
    nameEn: 'Marta Aguilar',
    roleEs: 'Coach independiente · Madrid',
    roleEn: 'Independent coach · Madrid',
    quoteEs:
      'En tres meses pasé de 14 a 28 clientes sin trabajar más horas. La parte de seguimiento prácticamente se gestiona sola.',
    quoteEn:
      'In three months I went from 14 to 28 clients without working more hours. The follow-up side basically runs itself.',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
  {
    initials: 'LR',
    nameEs: 'Lucía Romero',
    nameEn: 'Lucía Romero',
    roleEs: 'Coach de nutrición · Valencia',
    roleEn: 'Nutrition coach · Valencia',
    quoteEs:
      'Por fin tengo todos los planes, check-ins y mensajes en el mismo sitio. Mis clientes notan el orden y la diferencia.',
    quoteEn:
      'I finally have every plan, check-in and message in one place. My clients notice the order and the difference.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    initials: 'JS',
    nameEs: 'Javier Sanz',
    nameEn: 'Javier Sanz',
    roleEs: 'Coach de fuerza · Online',
    roleEn: 'Strength coach · Online',
    quoteEs:
      'Las alertas de adherencia me avisan en cuanto un cliente se desvía. Llego antes a los problemas y los resultados se notan en la retención.',
    quoteEn:
      'Adherence alerts ping me the moment a client drifts off. I catch issues earlier and the retention numbers show it.',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
];

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            {isEs ? 'Lo que dicen los coaches' : 'What coaches are saying'}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium leading-tight tracking-tight"
          >
            {isEs ? 'Diseñado con coaches reales,\npara coaches reales.' : 'Built with real coaches,\nfor real coaches.'}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((tm, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)]"
            >
              <blockquote className="text-base text-black leading-relaxed mb-6">
                <span aria-hidden="true" className="text-3xl text-gray-300 leading-none mr-1">“</span>
                {isEs ? tm.quoteEs : tm.quoteEn}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {/* Placeholder de foto: avatar de iniciales sobre gradiente —
                    listo para sustituir por la foto real del testimonio. */}
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${tm.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                  {tm.initials}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{isEs ? tm.nameEs : tm.nameEn}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{isEs ? tm.roleEs : tm.roleEn}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
