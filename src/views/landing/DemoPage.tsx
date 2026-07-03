import { useState, type FormEvent } from 'react';
import { CheckCircle2, Calendar, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DemoPageProps {
  onBack: () => void;
}

// Email destino de las solicitudes de demo. Cuando dispongamos del buzon real
// (p.ej. demo@nuly.app) basta con cambiar esta constante.
const DEMO_INBOX = 'hello@nuly.app';

/**
 * Pagina "Reservar demo": formulario con nombre, email, num. de clientes y
 * mensaje. Al enviar abre el cliente de correo del usuario con un mailto
 * prerrellenado (no requiere backend para empezar). El UX cambia al estado
 * "enviado" para confirmar visualmente.
 */
export default function DemoPage({ onBack }: DemoPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const [form, setForm] = useState({ name: '', email: '', clients: '', message: '' });
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    const subject = encodeURIComponent(
      isEs ? `Demo Nuly · ${form.name}` : `Nuly demo · ${form.name}`,
    );
    const body = encodeURIComponent(
      [
        `${isEs ? 'Nombre' : 'Name'}: ${form.name}`,
        `Email: ${form.email}`,
        `${isEs ? 'Clientes activos' : 'Active clients'}: ${form.clients || '—'}`,
        '',
        form.message || '',
      ].join('\n'),
    );
    window.location.href = `mailto:${DEMO_INBOX}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-4">
        {isEs ? 'Reserva una demo personalizada' : 'Book a personalised demo'}
      </h1>
      <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
        {isEs
          ? '30 minutos. Te enseñamos la plataforma sobre tu caso real y resolvemos cualquier duda antes de probar la prueba gratuita.'
          : '30 minutes. We walk you through the platform against your real case and answer any question before you start the free trial.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
        {[
          { Icon: Calendar, label: isEs ? '30 min, sin compromiso' : '30 min, no commitment' },
          { Icon: Users, label: isEs ? 'En vivo, 1-a-1' : 'Live, 1-on-1' },
          { Icon: Sparkles, label: isEs ? 'Sobre tu caso real' : 'On your real case' },
        ].map(({ Icon, label }, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-center gap-3 text-sm">
            <Icon className="w-4 h-4 text-black" />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">
            {isEs ? '¡Listo! Acabamos de abrir tu cliente de correo' : 'Done! We just opened your email client'}
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {isEs
              ? `Envía el correo prerrellenado a ${DEMO_INBOX} y te respondemos en menos de 24 h.`
              : `Send the pre-filled email to ${DEMO_INBOX} and we'll reply within 24 h.`}
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)] space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                {isEs ? 'Nombre' : 'Name'}
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {isEs ? 'Clientes activos ahora' : 'Active clients today'}
            </label>
            <input
              value={form.clients}
              onChange={(e) => setForm({ ...form, clients: e.target.value })}
              placeholder={isEs ? 'p. ej. 12' : 'e.g. 12'}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {isEs ? '¿Qué quieres resolver?' : 'What do you want to solve?'}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              placeholder={
                isEs
                  ? 'Cuéntanos brevemente cómo gestionas hoy a tus clientes y qué te gustaría mejorar.'
                  : 'Briefly tell us how you manage clients today and what you would like to improve.'
              }
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            {isEs ? 'Reservar demo' : 'Book demo'}
          </button>
          <p className="text-[11px] text-center text-gray-400">
            {isEs ? `Nos puedes escribir directamente a ${DEMO_INBOX}` : `You can also write us directly at ${DEMO_INBOX}`}
          </p>
        </form>
      )}
    </div>
  );
}
