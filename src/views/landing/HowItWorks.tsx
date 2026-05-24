import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Seccion "Como funciona": 3 pasos secuenciales (Conecta -> Planifica -> Sigue).
 * Mantiene la estetica minimalista negro/blanco de la landing.
 */
export default function HowItWorks() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const steps: { n: string; title: string; desc: string }[] = isEs
    ? [
        {
          n: '01',
          title: 'Importa o crea tu base de clientes',
          desc: 'Da de alta a tus clientes con su perfil, objetivo y datos antropométricos. Cada uno tiene su propio portal y todo queda centralizado en un solo lugar.',
        },
        {
          n: '02',
          title: 'Diseña planes a su medida',
          desc: 'Crea planes de nutrición y entrenamiento con plantillas reutilizables. Adapta cada plan al cliente con un par de clics y publícalo al instante en su app.',
        },
        {
          n: '03',
          title: 'Sigue el progreso sin perder un detalle',
          desc: 'Check-ins semanales, métricas de adherencia, alertas automáticas y mensajería integrada. Tú decides cuándo intervenir; la plataforma te avisa cuando hace falta.',
        },
      ]
    : [
        {
          n: '01',
          title: 'Import or create your client base',
          desc: 'Onboard clients with their profile, goal and body data. Each one gets their own portal and everything stays centralised in one place.',
        },
        {
          n: '02',
          title: 'Design tailored plans',
          desc: 'Build nutrition and training plans with reusable templates. Adapt each plan to the client in a couple of clicks and publish to their app instantly.',
        },
        {
          n: '03',
          title: 'Track progress without missing a beat',
          desc: 'Weekly check-ins, adherence metrics, automatic alerts and built-in messaging. You decide when to intervene; the platform pings you when needed.',
        },
      ];

  return (
    <section className="px-4 py-32 max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isEs ? 'Cómo funciona' : 'How it works'}
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-medium leading-tight tracking-tight max-w-3xl mx-auto"
        >
          {isEs ? 'De cero clientes a un sistema que se gestiona solo.' : 'From zero clients to a system that runs itself.'}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] transition-shadow"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{s.n}</div>
            <h3 className="text-xl font-medium mb-3 tracking-tight">{s.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
