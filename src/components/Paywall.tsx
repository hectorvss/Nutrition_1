import { Lock } from 'lucide-react';
import Pricing from './Pricing';
import { useLanguage } from '../context/LanguageContext';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';

// Full-screen paywall shown when the trial has expired (or the paid subscription
// entered a blocking state). It reuses the existing Pricing grid so the UI is
// identical to the landing page — proven layout, maximum conversion.
export default function Paywall() {
  const { language } = useLanguage();
  const { status } = useBilling();
  const { logout } = useAuth();
  const isEs = language === 'es';

  const trialExpired = status?.tier === 'trial';
  const title = trialExpired
    ? (isEs ? 'Tu prueba gratuita ha terminado' : 'Your free trial has ended')
    : (isEs ? 'Tu suscripción no está activa' : 'Your subscription is not active');
  const subtitle = trialExpired
    ? (isEs
      ? 'Elige un plan para seguir usando la plataforma — todos tus datos están intactos.'
      : 'Pick a plan to keep using the platform — all your data is intact.')
    : (isEs
      ? 'Renueva tu plan para volver a usar todas las funciones.'
      : 'Renew your plan to regain full access.');

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">{title}</h1>
              <p className="text-sm text-on-surface-variant">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-on-surface-variant hover:text-primary underline"
          >
            {isEs ? 'Cerrar sesión' : 'Log out'}
          </button>
        </div>
        <Pricing />
      </div>
    </div>
  );
}
