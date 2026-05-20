import { X, Calendar, Repeat } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Google Calendar-style confirmation: when the user edits or deletes one
// occurrence of a recurring event, they pick whether the action applies to
// that single instance or the entire series.

interface Props {
  open: boolean;
  mode: 'edit' | 'delete';
  onClose: () => void;
  onPick: (scope: 'instance' | 'series') => void;
}

export default function RecurrenceScopeDialog({ open, mode, onClose, onPick }: Props) {
  const { t } = useLanguage();
  if (!open) return null;

  const title = mode === 'delete'
    ? t('delete_recurring_title', { defaultValue: '¿Borrar evento recurrente?' })
    : t('edit_recurring_title',   { defaultValue: '¿Editar evento recurrente?' });

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => { onPick('instance'); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-left"
          >
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {t('only_this_event', { defaultValue: 'Solo este evento' })}
              </p>
              <p className="text-xs text-slate-500">
                {t('only_this_event_desc', { defaultValue: 'No afecta al resto de la serie.' })}
              </p>
            </div>
          </button>
          <button
            onClick={() => { onPick('series'); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-left"
          >
            <Repeat className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {t('all_events_in_series', { defaultValue: 'Toda la serie' })}
              </p>
              <p className="text-xs text-slate-500">
                {t('all_events_in_series_desc', { defaultValue: 'Se aplica a todas las ocurrencias.' })}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
