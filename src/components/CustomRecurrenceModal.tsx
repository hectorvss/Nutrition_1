import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Lightweight modal mirroring Google Calendar's "Custom recurrence" dialog.
// Outputs a vanilla iCalendar RRULE string (e.g. "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE")
// plus an optional UNTIL date — the backend already understands these.

type Freq = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const WEEKDAYS: { code: string; labelKey: string; defaultLabel: string }[] = [
  { code: 'MO', labelKey: 'wd_mon', defaultLabel: 'L' },
  { code: 'TU', labelKey: 'wd_tue', defaultLabel: 'M' },
  { code: 'WE', labelKey: 'wd_wed', defaultLabel: 'X' },
  { code: 'TH', labelKey: 'wd_thu', defaultLabel: 'J' },
  { code: 'FR', labelKey: 'wd_fri', defaultLabel: 'V' },
  { code: 'SA', labelKey: 'wd_sat', defaultLabel: 'S' },
  { code: 'SU', labelKey: 'wd_sun', defaultLabel: 'D' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  initialRule?: string | null;
  initialUntil?: string | null;
  anchorDate: string; // YYYY-MM-DD — used to default BYDAY for weekly
  onSave: (rule: string, until: string | null) => void;
}

export default function CustomRecurrenceModal({ open, onClose, initialRule, initialUntil, anchorDate, onSave }: Props) {
  const { t } = useLanguage();
  const [freq, setFreq] = useState<Freq>('WEEKLY');
  const [interval, setInterval] = useState(1);
  const [byDay, setByDay] = useState<string[]>([]);
  const [until, setUntil] = useState('');
  const [endsMode, setEndsMode] = useState<'never' | 'on'>('never');

  // Parse the incoming rule when the modal opens so editing an existing
  // recurring task pre-populates the controls correctly.
  useEffect(() => {
    if (!open) return;
    if (initialRule) {
      const parts = initialRule.split(';').reduce((acc, p) => {
        const [k, v] = p.split('=');
        if (k && v) acc[k.toUpperCase()] = v.toUpperCase();
        return acc;
      }, {} as Record<string, string>);
      if (parts.FREQ === 'DAILY' || parts.FREQ === 'WEEKLY' || parts.FREQ === 'MONTHLY') {
        setFreq(parts.FREQ as Freq);
      }
      setInterval(parts.INTERVAL ? Math.max(1, parseInt(parts.INTERVAL, 10) || 1) : 1);
      setByDay(parts.BYDAY ? parts.BYDAY.split(',').map(s => s.trim()).filter(Boolean) : []);
    } else {
      setFreq('WEEKLY');
      setInterval(1);
      // Pre-select the weekday of the anchor date so "weekly" defaults to a
      // sensible BYDAY rather than the empty set.
      const anchorWd = (() => {
        const d = new Date(`${anchorDate}T00:00:00`);
        if (Number.isNaN(d.getTime())) return [];
        return [WEEKDAYS[(d.getDay() + 6) % 7].code]; // Monday-first index
      })();
      setByDay(anchorWd);
    }
    if (initialUntil) {
      setEndsMode('on');
      setUntil(initialUntil.slice(0, 10));
    } else {
      setEndsMode('never');
      setUntil('');
    }
  }, [open, initialRule, initialUntil, anchorDate]);

  if (!open) return null;

  const toggleDay = (code: string) => {
    setByDay(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const buildRule = (): string => {
    const parts: string[] = [`FREQ=${freq}`];
    if (interval > 1) parts.push(`INTERVAL=${interval}`);
    if (freq === 'WEEKLY' && byDay.length) parts.push(`BYDAY=${byDay.join(',')}`);
    return parts.join(';');
  };

  const handleSave = () => {
    const rule = buildRule();
    let untilIso: string | null = null;
    if (endsMode === 'on' && until) {
      // Store end-of-day so the chosen date is inclusive.
      untilIso = new Date(`${until}T23:59:59`).toISOString();
    }
    onSave(rule, untilIso);
    onClose();
  };

  const summary = (() => {
    const unit = freq === 'DAILY'
      ? (interval > 1 ? t('days', { defaultValue: 'días' }) : t('day', { defaultValue: 'día' }))
      : freq === 'WEEKLY'
        ? (interval > 1 ? t('weeks', { defaultValue: 'semanas' }) : t('week', { defaultValue: 'semana' }))
        : (interval > 1 ? t('months', { defaultValue: 'meses' }) : t('month', { defaultValue: 'mes' }));
    const everyTxt = interval === 1
      ? t('every', { defaultValue: 'Cada' }) + ' ' + unit
      : `${t('every', { defaultValue: 'Cada' })} ${interval} ${unit}`;
    if (freq === 'WEEKLY' && byDay.length) {
      const days = byDay.map(c => WEEKDAYS.find(w => w.code === c)?.defaultLabel || c).join(', ');
      return `${everyTxt} (${days})`;
    }
    return everyTxt;
  })();

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {t('custom_recurrence', { defaultValue: 'Recurrencia personalizada' })}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Frequency + interval */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              {t('repeat_every', { defaultValue: 'Repetir cada' })}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={365}
                value={interval}
                onChange={e => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <select
                value={freq}
                onChange={e => setFreq(e.target.value as Freq)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="DAILY">{interval > 1 ? t('days', { defaultValue: 'días' }) : t('day', { defaultValue: 'día' })}</option>
                <option value="WEEKLY">{interval > 1 ? t('weeks', { defaultValue: 'semanas' }) : t('week', { defaultValue: 'semana' })}</option>
                <option value="MONTHLY">{interval > 1 ? t('months', { defaultValue: 'meses' }) : t('month', { defaultValue: 'mes' })}</option>
              </select>
            </div>
          </div>

          {/* Weekday picker — only relevant for WEEKLY frequency */}
          {freq === 'WEEKLY' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                {t('repeat_on', { defaultValue: 'Repetir en' })}
              </label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map(d => {
                  const active = byDay.includes(d.code);
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => toggleDay(d.code)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-colors ${
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t(d.labelKey, { defaultValue: d.defaultLabel })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ends */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              {t('ends', { defaultValue: 'Termina' })}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={endsMode === 'never'}
                  onChange={() => setEndsMode('never')}
                  className="text-emerald-500"
                />
                <span>{t('never', { defaultValue: 'Nunca' })}</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={endsMode === 'on'}
                  onChange={() => setEndsMode('on')}
                  className="text-emerald-500"
                />
                <span>{t('on', { defaultValue: 'El' })}</span>
                <input
                  type="date"
                  value={until}
                  min={anchorDate}
                  onChange={e => { setUntil(e.target.value); setEndsMode('on'); }}
                  className="rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm py-1.5 px-2 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Live summary so the user can sanity-check the rule */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
            <span className="font-bold uppercase tracking-wide mr-1">{t('summary', { defaultValue: 'Resumen' })}:</span>
            {summary}
            {endsMode === 'on' && until && ` · ${t('until', { defaultValue: 'hasta' })} ${until}`}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            {t('cancel', { defaultValue: 'Cancelar' })}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {t('done', { defaultValue: 'Hecho' })}
          </button>
        </div>
      </div>
    </div>
  );
}
