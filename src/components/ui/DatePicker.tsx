import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Selector de fecha CUSTOM con la UI del SaaS (no el picker nativo del
// navegador, que no se puede estilar y no cuadra con el diseño). El panel usa
// position:fixed calculado desde el botón para que NUNCA lo recorte el overflow
// de un modal con scroll; se abre hacia arriba o hacia abajo según el hueco.

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromISO = (s?: string | null): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface DatePickerProps {
  value?: string | null;           // 'YYYY-MM-DD'
  onChange: (v: string) => void;   // emite 'YYYY-MM-DD' ('' al limpiar)
  min?: string | null;             // 'YYYY-MM-DD' — fechas anteriores deshabilitadas
  placeholder?: string;
  className?: string;              // clases del botón (por defecto estilo input del SaaS)
  allowClear?: boolean;
}

export default function DatePicker({ value, onChange, min, placeholder, className, allowClear = true }: DatePickerProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const locale = isEs ? 'es-ES' : 'en-US';

  const selected = fromISO(value);
  const minDate = fromISO(min);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => selected || new Date());
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Al abrir, encuadra el mes en la fecha seleccionada (o hoy).
  useEffect(() => { if (open) setView(selected || new Date()); /* eslint-disable-line */ }, [open]);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, 280);
    const left = Math.min(r.left, window.innerWidth - width - 8);
    const panelH = 360;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openUp = spaceBelow < panelH && r.top - 8 > spaceBelow;
    const top = openUp ? Math.max(8, r.top - 4 - panelH) : r.bottom + 4;
    setCoords({ top, left: Math.max(8, left), width });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && panelRef.current?.contains(target)) return;
      place();
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  // Cabeceras de día (lunes primero, acorde a calendarios ES/EU).
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i); // 1 ene 2024 = lunes
    const s = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Celdas del mes: rellena hasta 42 (6 semanas) desde el lunes anterior.
  const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // 0 = lunes
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startOffset);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const today = new Date();
  const label = selected
    ? selected.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const monthLabel = view.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const pick = (d: Date) => { onChange(toISO(d)); setOpen(false); };
  const isDisabled = (d: Date) => (minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false);

  const defaultBtn = 'w-full flex items-center justify-between gap-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm py-2.5 px-3 text-left transition outline-none';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={className || `${defaultBtn} ${open ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'} ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
      >
        <span className="truncate">{label || placeholder || (isEs ? 'Elegir fecha' : 'Pick a date')}</span>
        <CalendarIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
      </button>

      {open && coords && (
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 70 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 select-none"
        >
          {/* Cabecera: mes + navegación */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{monthLabel}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabecera de días */}
          <div className="grid grid-cols-7 mb-1">
            {weekdays.map((w, i) => (
              <div key={i} className="text-center text-[11px] font-bold text-slate-400 py-1">{w}</div>
            ))}
          </div>

          {/* Rejilla de días */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === view.getMonth();
              const isSel = selected && sameDay(d, selected);
              const isToday = sameDay(d, today);
              const disabled = isDisabled(d);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  className={`h-9 rounded-lg text-sm font-medium transition flex items-center justify-center
                    ${isSel
                      ? 'bg-emerald-500 text-white font-bold shadow-sm'
                      : disabled
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        : inMonth
                          ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                    ${!isSel && isToday ? 'ring-1 ring-emerald-400/70' : ''}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Pie: limpiar / hoy */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {allowClear ? (
              <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition">
                {isEs ? 'Limpiar' : 'Clear'}
              </button>
            ) : <span />}
            <button type="button"
              onClick={() => { const t = new Date(); if (!isDisabled(t)) pick(t); else setView(t); }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {isEs ? 'Hoy' : 'Today'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
