import React, { useMemo } from 'react';
import Select from './Select';

interface TimeSelectProps {
  /** Controlled "HH:MM" string. */
  value: string;
  onChange: (value: string) => void;
  /** Granularity of generated options, in minutes. Defaults to 15. */
  stepMinutes?: number;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Drop-in replacement for `<input type="time">` that uses the shared
 * `<Select>` so it shares the SaaS look (chevron, focus ring, dark mode,
 * panel rendered via portal). Generates "HH:MM" options at `stepMinutes`
 * granularity. If `value` doesn't fall on a generated slot (e.g. legacy
 * data like "09:17"), the value is preserved as an extra option so it's
 * still selectable and visible — no silent data loss.
 */
export default function TimeSelect({
  value,
  onChange,
  stepMinutes = 15,
  className = '',
  disabled = false,
  ...rest
}: TimeSelectProps) {
  const options = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const list: { value: string; label: string }[] = [];
    for (let m = 0; m < 24 * 60; m += stepMinutes) {
      const hh = pad(Math.floor(m / 60));
      const mm = pad(m % 60);
      const v = `${hh}:${mm}`;
      list.push({ value: v, label: v });
    }
    // Preserve odd legacy values by injecting them into the sorted list.
    if (value && !list.some(o => o.value === value)) {
      list.push({ value, label: value });
      list.sort((a, b) => a.value.localeCompare(b.value));
    }
    return list;
  }, [stepMinutes, value]);

  return (
    <Select
      {...rest}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      className={className}
    />
  );
}
