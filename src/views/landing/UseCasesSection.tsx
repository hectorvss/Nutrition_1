import { motion } from 'motion/react';
import { Sprout, TrendingUp, Flame, Rocket } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * "Para quién es" — cuatro etapas del COACH INDEPENDIENTE.
 *
 * Decision de producto: NutriFit hoy esta hecha para coaches que
 * trabajan solos. Vendiamos "4 perfiles" muy diferentes (independiente,
 * clinico, equipo, gimnasio) y eso atrae leads que la app no resuelve.
 * Esta seccion mantiene 4 tarjetas pero todas son sub-perfiles del
 * coach independiente segun su etapa (arranca / crece / saturado / quiere
 * vivir de esto). El visitante se ubica por momento vital, no por
 * categoria de profesional.
 */
const cases = [
  {
    Icon: Sprout,
    titleEs: 'Coach que arranca',
    titleEn: 'Coach starting out',
    descEs: 'De 0 a 10 clientes. Necesitas dar imagen profesional desde el día uno y dejar de improvisar con Excel y WhatsApp.',
    descEn: 'From 0 to 10 clients. You need a professional setup from day one and to stop juggling Excel and WhatsApp.',
  },
  {
    Icon: TrendingUp,
    titleEs: 'Coach en crecimiento',
    titleEn: 'Coach growing',
    descEs: 'De 10 a 25 clientes. Ya no llegas a todo a mano y empiezas a perder seguimiento de los que estaban contigo desde el principio.',
    descEn: '10 to 25 clients. You can no longer handle it all by hand and start losing track of the clients who joined you first.',
  },
  {
    Icon: Flame,
    titleEs: 'Coach saturado',
    titleEn: 'Coach at capacity',
    descEs: 'De 25 a 40 clientes. Las horas no dan más, los fines de semana se han ido y la calidad del servicio empieza a notarse.',
    descEn: '25 to 40 clients. The hours don’t stretch any more, weekends are gone, and service quality is starting to slip.',
  },
  {
    Icon: Rocket,
    titleEs: 'Coach que quiere vivir de esto',
    titleEn: 'Coach going full-time',
    descEs: 'Quieres dejar el otro trabajo. Necesitas cobros recurrentes, retención alta y un sistema que escale sin contratar a nadie.',
    descEn: 'You want to quit the other job. You need recurring billing, high retention, and a system that scales without hiring.',
  },
];

export default function UseCasesSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Para qué momento' : 'For which stage'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs ? 'Pensada para cada etapa del coach independiente.' : 'Built for every stage of the independent coach.'}
        </motion.h2>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
          {isEs
            ? 'Mismos retos, distintas escalas. Encuentra el momento en el que estás.'
            : 'Same problems, different scale. Find the stage you’re in.'}
        </p>
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
