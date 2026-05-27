import { useLanguage } from '../../context/LanguageContext';

interface AboutPageProps {
  onBack: () => void;
  onDemo: () => void;
}

/**
 * Pagina "Sobre nosotros": mision, valores y equipo. Los datos del equipo
 * van como placeholder de iniciales sobre gradiente — listos para sustituir
 * por las fotos y los nombres reales.
 */
export default function AboutPage({ onBack, onDemo }: AboutPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const values = isEs
    ? [
        { t: 'Producto antes que ruido', d: 'Cada decisión se toma para que tu día de coaching sea más sencillo, no para llenar una landing.' },
        { t: 'Datos del coach', d: 'Tus clientes son tuyos. Nada de algoritmos opacos ni de venderlos a terceros.' },
        { t: 'Calidad europea', d: 'Infraestructura en la UE, soporte cercano y cumplimiento serio del RGPD.' },
      ]
    : [
        { t: 'Product over noise', d: 'Every decision is taken to make your coaching day easier, not to fill a landing page.' },
        { t: 'Coach-owned data', d: 'Your clients are yours. No opaque algorithms and no selling data to third parties.' },
        { t: 'European quality', d: 'EU-hosted infrastructure, close support and serious GDPR compliance.' },
      ];

  const team = [
    { initials: 'F1', gradient: 'from-indigo-500 via-purple-500 to-pink-500', roleEs: '[Placeholder] Producto', roleEn: '[Placeholder] Product' },
    { initials: 'F2', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', roleEs: '[Placeholder] Ingeniería', roleEn: '[Placeholder] Engineering' },
    { initials: 'F3', gradient: 'from-amber-500 via-orange-500 to-rose-500', roleEs: '[Placeholder] Diseño', roleEn: '[Placeholder] Design' },
    { initials: 'F4', gradient: 'from-sky-500 via-blue-500 to-indigo-500', roleEs: '[Placeholder] Cliente', roleEn: '[Placeholder] Customer' },
  ];

  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
        {isEs ? 'Sobre NutriFit' : 'About NutriFit'}
      </p>
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
        {isEs ? 'Hecho por coaches\npara coaches.' : 'Made by coaches\nfor coaches.'}
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-20 whitespace-pre-line">
        {isEs
          ? 'Construimos NutriFit porque vivimos la frustración en primera persona: planes en hojas de cálculo, mensajes en WhatsApp y un follow-up que se cae con tres clientes.\n\nNuestra misión es darte un sistema profesional sin la complejidad de los grandes ERPs.'
          : 'We built NutriFit because we lived the frustration first-hand: plans on spreadsheets, messages on WhatsApp and follow-up that collapses with three clients.\n\nOur mission is to give you a professional system without the complexity of huge ERPs.'}
      </p>

      <h2 className="text-2xl font-medium tracking-tight mb-8">{isEs ? 'Lo que nos guía' : 'What guides us'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 text-center">
        {values.map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-7">
            <h3 className="text-lg font-medium mb-2">{v.t}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{v.d}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-medium tracking-tight mb-8">{isEs ? 'Equipo' : 'Team'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {team.map((m, i) => (
          <div key={i} className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-sm font-bold mb-3`}>
              {m.initials}
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              {isEs ? m.roleEs : m.roleEn}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-black text-white rounded-3xl p-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
          {isEs ? '¿Quieres saber más?' : 'Want to know more?'}
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-6">
          {isEs ? 'Te enseñamos la plataforma en 30 minutos.' : 'We’ll show you the platform in 30 minutes.'}
        </h2>
        <button
          onClick={onDemo}
          className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
        >
          {isEs ? 'Reservar demo' : 'Book demo'}
        </button>
      </div>
    </div>
  );
}
