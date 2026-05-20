import { Clock, Sparkles } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { useLanguage } from '../context/LanguageContext';

interface TrialBannerProps {
  onUpgrade: () => void;
}

// Slim banner shown above the main app while the manager is on the free trial.
// Disappears the moment a paid subscription is active or the trial has already
// expired (the Paywall takes over in the latter case).
export default function TrialBanner({ onUpgrade }: TrialBannerProps) {
  const { status } = useBilling();
  const { language } = useLanguage();
  const isEs = language === 'es';

  if (!status || !status.isTrial || status.accessBlocked) return null;
  const days = status.trialDaysLeft;
  if (days === null) return null;

  const urgent = days <= 3;
  const label = days === 0
    ? (isEs ? 'Tu prueba termina hoy' : 'Your trial ends today')
    : days === 1
      ? (isEs ? 'Te queda 1 día de prueba' : '1 day left in your trial')
      : (isEs ? `Te quedan ${days} días de prueba` : `${days} days left in your trial`);

  return (
    <div className={`w-full flex items-center justify-center gap-3 px-4 py-2 text-sm font-semibold ${
      urgent ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
    }`}>
      {urgent ? <Clock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      <span>{label}</span>
      <button
        onClick={onUpgrade}
        className={`ml-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
          urgent
            ? 'bg-amber-600 text-white hover:bg-amber-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {isEs ? 'Suscribirme ahora' : 'Subscribe now'}
      </button>
    </div>
  );
}
