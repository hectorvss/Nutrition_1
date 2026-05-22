import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X, Plus } from 'lucide-react';

interface ComboBoxProps {
  /** string for single mode, string[] for multiple mode. */
  value: string | string[];
  onChange: (value: any) => void;
  /** Suggestion pool (existing values from the database). */
  options: string[];
  multiple?: boolean;
  placeholder?: string;
  /** Classes for the trigger container — keeps styling at the call site. */
  className?: string;
  /** Allow committing values that are not already in `options`. */
  allowCreate?: boolean;
  createLabel?: string;
}

interface Coords { top?: number; bottom?: number; left: number; width: number; }

/**
 * A dropdown that lets the user pick from existing values or type a new one.
 * Supports single-select and multi-select (chips). The open list is rendered
 * through a portal so it is never clipped by parent overflow.
 */
export default function ComboBox({
  value, onChange, options, multiple = false,
  placeholder = '', className = '', allowCreate = true, createLabel = 'Create',
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedArr: string[] = multiple
    ? (Array.isArray(value) ? value : [])
    : (value ? [value as string] : []);

  const norm = (s: string) => s.trim().toLowerCase();
  const filtered = options.filter(o => {
    if (multiple && selectedArr.some(s => norm(s) === norm(o))) return false;
    return query ? norm(o).includes(norm(query)) : true;
  });
  const queryIsNew = !!query.trim()
    && !options.some(o => norm(o) === norm(query))
    && !selectedArr.some(s => norm(s) === norm(query));

  const updateCoords = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const estHeight = 288;
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
      setQuery('');
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } };
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

  const pick = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (multiple) {
      if (!selectedArr.some(s => norm(s) === norm(clean))) {
        onChange([...selectedArr, clean]);
      }
      setQuery('');
      inputRef.current?.focus();
    } else {
      onChange(clean);
      setOpen(false);
      setQuery('');
    }
  };

  const removeChip = (val: string) => {
    onChange(selectedArr.filter(s => s !== val));
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim() && (allowCreate || options.some(o => norm(o) === norm(query)))) {
        pick(query);
      } else if (filtered.length > 0) {
        pick(filtered[0]);
      }
    } else if (e.key === 'Backspace' && !query && multiple && selectedArr.length) {
      removeChip(selectedArr[selectedArr.length - 1]);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => { if (!open) { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); } }}
        className={`${className} flex items-center flex-wrap gap-1.5 cursor-text`}
      >
        {multiple && selectedArr.map(chip => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-1 rounded-lg"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(chip); }}
              className="hover:text-emerald-900 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={open ? query : (multiple ? '' : (value as string) || '')}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder={multiple && selectedArr.length ? '' : placeholder}
          className="flex-1 min-w-[60px] bg-transparent outline-none border-none p-0 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <ChevronDown className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          style={{ position: 'fixed', top: coords.top, bottom: coords.bottom, left: coords.left, minWidth: coords.width }}
          className="z-[9999] max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 p-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {allowCreate && queryIsNew && (
            <button
              type="button"
              onClick={() => pick(query)}
              className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">{createLabel} "{query.trim()}"</span>
            </button>
          )}
          {filtered.length === 0 && !queryIsNew && (
            <div className="px-3 py-2 text-sm text-slate-400">—</div>
          )}
          {filtered.map((o, i) => {
            const isSelected = !multiple && norm(o) === norm((value as string) || '');
            return (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => pick(o)}
                className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{o}</span>
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
