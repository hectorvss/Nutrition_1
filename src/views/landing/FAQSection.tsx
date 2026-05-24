import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Acordeon de preguntas frecuentes. Cubre las dudas reales de un coach que
 * se plantea probar la plataforma: precio, datos, idiomas, dispositivos y
 * cancelacion.
 */
export default function FAQSection() {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const [open, setOpen] = useState<number | null>(0);

  const faqs: { q: string; a: string }[] = isEs
    ? [
        {
          q: '¿Hay prueba gratis? ¿Necesito tarjeta?',
          a: 'Sí. Tienes 14 días gratis con acceso completo a la plataforma. No pedimos tarjeta para empezar y puedes cancelar cuando quieras antes de que termine la prueba.',
        },
        {
          q: '¿Mis clientes también tienen acceso?',
          a: 'Sí. Cada cliente tiene su propio portal con su plan, sus check-ins, su mensajería contigo y su progreso. Tú gestionas todo desde el panel de coach.',
        },
        {
          q: '¿En qué idiomas está disponible?',
          a: 'Español e inglés, tanto el portal del coach como el del cliente. Cada usuario elige su idioma y los formatos de fecha y número se adaptan.',
        },
        {
          q: '¿Funciona en móvil?',
          a: 'Sí. El portal del cliente está pensado en mobile-first y el del coach se adapta a tableta y móvil para gestión en movimiento. Notificaciones push incluidas.',
        },
        {
          q: '¿Quién es el dueño de los datos?',
          a: 'Tú y tus clientes. Los datos se almacenan en infraestructura europea con cifrado en tránsito y en reposo. Puedes exportarlos o solicitarlos en cualquier momento.',
        },
        {
          q: '¿Puedo cancelar cuando quiera?',
          a: 'Sí, sin permanencia. Cancelas desde Ajustes → Facturación con un clic. Mantienes el acceso hasta el final del periodo ya pagado.',
        },
      ]
    : [
        {
          q: 'Is there a free trial? Do I need a card?',
          a: 'Yes. You get 14 days free with full access to the platform. No card required to start and you can cancel any time before the trial ends.',
        },
        {
          q: 'Do my clients also get access?',
          a: 'Yes. Every client has their own portal with their plan, check-ins, messaging with you and progress. You manage everything from the coach dashboard.',
        },
        {
          q: 'Which languages are supported?',
          a: 'Spanish and English, both for the coach and the client portal. Each user picks their language and date/number formats adapt accordingly.',
        },
        {
          q: 'Does it work on mobile?',
          a: 'Yes. The client portal is mobile-first and the coach portal adapts to tablet and phone for on-the-go management. Push notifications included.',
        },
        {
          q: 'Who owns the data?',
          a: 'You and your clients. Data lives on European infrastructure with encryption in transit and at rest. You can export or request it any time.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes, no commitment. Cancel from Settings → Billing in one click. You keep access until the end of the paid period.',
        },
      ];

  return (
    <section className="px-4 py-32 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">FAQ</p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-medium leading-tight tracking-tight"
        >
          {isEs ? 'Lo que la gente nos pregunta antes de empezar.' : 'What people ask before they start.'}
        </motion.h2>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/60 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-base">{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
