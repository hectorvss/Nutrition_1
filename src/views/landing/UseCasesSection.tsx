import { motion } from 'motion/react';
import { User, Stethoscope, Users, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * "Para quien es" — 4 perfiles de uso. Ayuda al visitante a identificarse en
 * segundos y entender que NutriFit le encaja sin tener que leer la pagina entera.
 */
const cases = [
  {
    Icon: User,
    titleEs: 'Coach independiente',
    titleEn: 'Independent coach',
    descEs: 'Empiezas a tener más clientes de los que puedes seguir por WhatsApp. Centraliza, automatiza y crece sin perder calidad.',
    descEn: 'You have more clients than WhatsApp can handle. Centralise, automate and grow without losing quality.',
  },
  {
    Icon: Stethoscope,
    titleEs: 'Nutricionista clínico',
    titleEn: 'Clinical nutritionist',
    descEs: 'Planes detallados, check-ins estructurados y trazabilidad clínica de cada paciente con datos seguros.',
    descEn: 'Detailed plans, structured check-ins and clinical traceability for each patient with secure data.',
  },
  {
    Icon: Users,
    titleEs: 'Equipo de coaches',
    titleEn: 'Coaching team',
    descEs: 'Comparte plantillas entre coaches, mantén un estándar de calidad y métricas globales en tiempo real.',
    descEn: 'Share templates across coaches, hold a quality standard and see live team metrics.',
  },
  {
    Icon: Building2,
    titleEs: 'Gimnasio o centro',
    titleEn: 'Gym or wellness centre',
    descEs: 'Da a tus socios un canal directo con sus profesionales, planes a medida y seguimiento dentro de tu marca.',
    descEn: 'Give members a direct channel with their professionals, tailored plans and follow-up under your brand.',
  },
];

export default function UseCasesSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Para quién' : 'Who it’s for'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs ? 'Diseñado para cualquier nivel de práctica.' : 'Built for every level of practice.'}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cases.map(({ Icon, titleEs, titleEn, descEs, descEn }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-11 h-11 rounded-2xl bg-black/5 flex items-center justify-center mb-5">
              <Icon className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-lg font-medium mb-2 tracking-tight">{isEs ? titleEs : titleEn}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{isEs ? descEs : descEn}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
