import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Prueba social reforzada. Avatares de iniciales sobre gradiente.
 * Personajes/citas/métricas son demo — se sustituirán por testimonios
 * reales cuando los primeros clientes acepten aparecer. Cambios para
 * "más fuerza":
 *  - Testimonio destacado grande arriba (hero quote) con métrica.
 *  - Rating de 5 estrellas en cada tarjeta.
 *  - Una métrica de resultado concreta por testimonio (badge), que es lo
 *    que de verdad mueve: el coach ve el número, no solo el elogio.
 *  - Barra de rating agregado bajo el título (4,9/5).
 */
interface Testimonial {
  initials: string;
  name: string;
  roleEs: string;
  roleEn: string;
  quoteEs: string;
  quoteEn: string;
  metricValue: string;
  metricEs: string;
  metricEn: string;
  gradient: string;
}

const featured: Testimonial = {
  initials: 'MA',
  name: 'Marta Aguilar',
  roleEs: 'Coach independiente · Madrid',
  roleEn: 'Independent coach · Madrid',
  quoteEs:
    'Llevaba todo en Excel y WhatsApp y estaba al límite con 14 clientes. En tres meses con NutriFit pasé a 28 sin trabajar más horas — el seguimiento prácticamente se gestiona solo y mis clientes notan que esto va en serio.',
  quoteEn:
    'I ran everything on Excel and WhatsApp and was maxed out at 14 clients. Three months into NutriFit I was at 28 without working more hours — the follow-up runs itself and my clients can tell this is serious.',
  metricValue: '14 → 28',
  metricEs: 'clientes en 3 meses',
  metricEn: 'clients in 3 months',
  gradient: 'from-indigo-500 via-purple-500 to-pink-500',
};

const testimonials: Testimonial[] = [
  {
    initials: 'LR',
    name: 'Lucía Romero',
    roleEs: 'Coach de nutrición · Valencia',
    roleEn: 'Nutrition coach · Valencia',
    quoteEs: 'Por fin tengo planes, check-ins y mensajes en un solo sitio. Mis clientes notan el orden y la diferencia.',
    quoteEn: 'I finally have plans, check-ins and messages in one place. My clients notice the order and the difference.',
    metricValue: '−6 h',
    metricEs: 'por semana en admin',
    metricEn: 'per week on admin',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    initials: 'JS',
    name: 'Javier Sanz',
    roleEs: 'Coach de fuerza · Online',
    roleEn: 'Strength coach · Online',
    quoteEs: 'Las alertas de adherencia me avisan en cuanto un cliente se desvía. Llego antes y la retención lo nota.',
    quoteEn: 'Adherence alerts ping me the moment a client drifts off. I catch it earlier and retention shows it.',
    metricValue: '+22%',
    metricEs: 'retención de clientes',
    metricEn: 'client retention',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    initials: 'CR',
    name: 'Carla Ruiz',
    roleEs: 'Coach de transformación · Sevilla',
    roleEn: 'Transformation coach · Seville',
    quoteEs: 'El portal con mi marca cambió la percepción. Pasé de "la chica del Excel" a un servicio premium de 120 €/mes.',
    quoteEn: 'The branded portal changed how I’m seen. I went from “the Excel girl” to a premium 120 €/mo service.',
    metricValue: '+45%',
    metricEs: 'en tarifa media',
    metricEn: 'in average rate',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
  },
];

function Stars({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label="5 / 5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            {isEs ? 'Lo que dicen los coaches' : 'What coaches are saying'}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium leading-tight tracking-tight whitespace-pre-line"
          >
            {isEs ? 'Diseñado con coaches reales,\npara coaches reales.' : 'Built with real coaches,\nfor real coaches.'}
          </motion.h2>
          {/* Rating agregado */}
          <div className="mt-5 inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
            <Stars />
            <span className="text-sm font-bold text-gray-900">4,9</span>
            <span className="text-xs text-gray-400">{isEs ? 'de valoración media' : 'average rating'}</span>
          </div>
        </div>

        {/* Testimonio destacado */}
        <motion.figure
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.12)] mb-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          <div className="md:col-span-2">
            <Quote className="w-8 h-8 text-emerald-500/30 mb-4" />
            <blockquote className="text-xl md:text-2xl text-gray-900 leading-relaxed font-medium tracking-tight mb-6">
              {isEs ? featured.quoteEs : featured.quoteEn}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${featured.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                {featured.initials}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{featured.name}</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{isEs ? featured.roleEs : featured.roleEn}</p>
              </div>
              <Stars className="ml-2" />
            </figcaption>
          </div>
          {/* Métrica destacada */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 text-center">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {featured.metricValue}
            </div>
            <p className="text-xs text-emerald-700/70 font-medium mt-2 uppercase tracking-widest">
              {isEs ? featured.metricEs : featured.metricEn}
            </p>
          </div>
        </motion.figure>

        {/* Resto de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((tm, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-100 rounded-3xl p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <Stars />
                {/* Badge de métrica de resultado */}
                <span className="inline-flex items-baseline gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 text-[11px] font-bold">
                  {tm.metricValue}
                  <span className="text-emerald-600/60 font-medium normal-case">{isEs ? tm.metricEs : tm.metricEn}</span>
                </span>
              </div>
              <blockquote className="text-[15px] text-gray-800 leading-relaxed mb-6 flex-1">
                {isEs ? tm.quoteEs : tm.quoteEn}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${tm.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                  {tm.initials}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{tm.name}</p>
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
