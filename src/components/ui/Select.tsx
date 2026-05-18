import React, {
  useState, useRef, useEffect, useCallback,
  ReactNode, isValidElement, Children
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: any;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  /** Controlled value. Omit for uncontrolled usage. */
  value?: any;
  /** Change handler. Optional for uncontrolled / read-only selects. */
  onChange?: (value: any) => void;
  /** Accepts native <option> children — drop-in replacement for <select>. */
  children?: ReactNode;
  /** Alternative to children: pass an explicit options array. */
  options?: SelectOption[];
  /** Classes for the trigger button (sizing / colours from the call site). */
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

interface Coords {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

/**
 * Fully styled dropdown that replaces the native <select>.
 * The open list is real DOM rendered through a portal, so it is themeable
 * (light/dark), never clipped by parent overflow, and flips up when there is
 * no room below.
 */
export default function Select({
  value, onChange, children, options,
  className = '', disabled = false, placeholder, ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Build the option list from explicit `options` or from <option> children.
  const opts: SelectOption[] = options ?? Children.toArray(children)
    .filter(isValidElement)
    .map((el: any) => {
      const p = el.props || {};
      const optValue = p.value !== undefined ? p.value : p.children;
      return { value: optValue, label: p.children ?? p.value, disabled: !!p.disabled };
    });

  // Uncontrolled fallback: when no `value` prop is supplied, keep the
  // selection in internal state (defaults to the first option).
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<any>(opts[0]?.value);
  const currentValue = isControlled ? value : internalValue;

  const commit = (v: any) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const selected = opts.find(o => String(o.value) === String(currentValue));

  const updateCoords = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const estHeight = 288; // matches max-h-72
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < Math.min(estHeight, 240) && r.top > spaceBelow;
    setCoords({
      top: openUp ? undefined : r.bottom + 6,
      bottom: openUp ? window.innerHeight - r.top + 6 : undefined,
      left: r.left,
      width: r.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const reposition = () => updateCoords();
    const onPointerDown = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, updateCoords]);

  return (
    <>
      <button
        {...rest}
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className={`inline-flex items-center justify-between gap-2 text-left ${className} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>
          {selected ? selected.label : (placeholder || '')}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            left: coords.left,
            minWidth: coords.width,
          }}
          className="z-[9999] max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 p-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {opts.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-400">—</div>
          )}
          {opts.map((o, i) => {
            const isSelected = String(o.value) === String(currentValue);
            return (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return;
                  commit(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  o.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
