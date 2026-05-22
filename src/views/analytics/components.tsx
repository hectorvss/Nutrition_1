import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/* ============================================================================
 * Componentes compartidos de Analytics — sistema de diseño.
 *
 * Estilo: minimalista, inspirado en los dashboards de Stripe y Shopify.
 * Dos tarjetas canónicas:
 *   · StatCard  → KPIs de un solo dato (número / porcentaje / texto).
 *   · ChartCard → KPIs con gráfica.
 * Más un SectionHeader para clasificar los KPIs por categorías.
 *
 * Reglas: tarjetas blancas, bordes redondeados (rounded-2xl), borde sutil,
 * sin sombras pesadas, mucho aire, una sola jerarquía visual clara.
 * No dupliques estas piezas en las pestañas — impórtalas siempre desde aquí.
 * ========================================================================== */

/* --- StatCard: KPI de un solo dato ----------------------------------------- */
/**
 * Tarjeta de un KPI numérico. Props (compatibles con el uso existente):
 *  - title       etiqueta del KPI
 *  - value       valor principal (número, %, texto)
 *  - unit        unidad opcional mostrada en gris junto al valor
 *  - change      texto del delta (ej. "+12%", "Por encima"); si está vacío no se muestra
 *  - isPositive  pinta el delta en verde (true) o rojo (false)
 *  - isNeutral   pinta el delta en gris (tiene prioridad sobre isPositive)
 *  - icon        icono lucide; se renderiza pequeño y sutil
 *  - iconColor   clase de color de texto para el icono (ej. "text-emerald-600")
 *  - changeLabel leyenda gris junto al delta (ej. "vs período anterior")
 *  - hint        texto de ayuda; muestra un icono de info con tooltip nativo
 */
export function StatCard({
  title, value, unit, change, isPositive, isNeutral,
  icon, iconColor = 'text-slate-400', changeLabel = '', hint,
}: any) {
  const { t } = useLanguage();
  const showDelta = change !== undefined && change !== null && change !== '';
  const DeltaIcon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
  const deltaTone = isNeutral
    ? 'text-slate-500'
    : isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/70 p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]">
      {/* Cabecera: etiqueta + icono sutil */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[13px] font-medium text-slate-500 leading-snug truncate">{title}</p>
          {hint && (
            <span title={hint} className="shrink-0 text-slate-300 hover:text-slate-400 cursor-help">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 flex items-center justify-center ${iconColor} [&>svg]:w-[18px] [&>svg]:h-[18px]`}>
            {icon}
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mt-3.5 flex items-baseline gap-1.5">
        <span className="text-[28px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {/* Delta + leyenda comparativa */}
      {showDelta && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${deltaTone}`}>
            <DeltaIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            {change}
          </span>
          <span className="text-xs text-slate-400">{changeLabel || t('vs_last_month')}</span>
        </div>
      )}
    </div>
  );
}

/* --- ChartCard: KPI con gráfica -------------------------------------------- */
/**
 * Contenedor canónico para cualquier gráfica. Pasa la gráfica (recharts u
 * otra) como children. `legend` y `action` se alinean a la derecha del título.
 */
export function ChartCard({
  title, subtitle, legend, action, children, className = '',
}: {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200/70 p-6 transition-all duration-200 hover:border-slate-300 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {(legend || action) && (
          <div className="flex items-center gap-3 shrink-0">{legend}{action}</div>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

/* --- SectionHeader: clasificador de categorías ----------------------------- */
/** Encabezado de categoría — agrupa los KPIs en bloques claros. */
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline gap-3 pt-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400 shrink-0">{title}</h2>
      {subtitle && <span className="text-xs text-slate-400 font-normal truncate">{subtitle}</span>}
      <div className="h-px bg-slate-200/70 flex-1" />
    </div>
  );
}

/** Leyenda compacta para cabeceras de ChartCard (punto de color + texto). */
export function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.color }} />
          {it.label}
        </span>
      ))}
    </>
  );
}

/** Estado vacío coherente para una gráfica sin datos. */
export function EmptyChart({ label, height = 240 }: { label: string; height?: number }) {
  return (
    <div
      className="w-full flex items-center justify-center text-sm text-slate-400 rounded-xl bg-slate-50/60"
      style={{ height }}
    >
      {label}
    </div>
  );
}

/* --- Helpers de detalle (restilizados) ------------------------------------- */

/** Barra de progreso etiquetada. */
export function ProgressBar({ label, value, percentage, color }: any) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900 tabular-nums">{value}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Fila de la tabla de retención por cohorte. */
export function CohortRow({ cohort, data }: any) {
  return (
    <tr>
      <td className="py-3 text-left pl-4 font-medium text-slate-900 text-sm">{cohort}</td>
      {data.map((val: any, i: number) => (
        <td key={i} className="py-3">
          {val !== null ? (
            <div className={`inline-block min-w-[44px] px-2.5 py-1 rounded-lg text-white text-xs font-semibold tabular-nums ${
              val >= 95 ? 'bg-emerald-600' :
              val >= 90 ? 'bg-emerald-500' :
              val >= 85 ? 'bg-emerald-400' : 'bg-emerald-300'
            }`}>
              {val}%
            </div>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
      ))}
    </tr>
  );
}

/** Fila de cliente con déficit (lista de "Top Deficit Clients"). */
export function DeficitClient({ name, deficit, severity }: any) {
  const { t } = useLanguage();
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
      severity === 'high' ? 'bg-red-50/70 border-red-100' : 'bg-white border-slate-100 hover:bg-slate-50'
    }`}>
      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
        {String(name || 'C').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 truncate">{name}</h4>
        <p className={`text-xs font-medium ${severity === 'high' ? 'text-red-500' : 'text-slate-400'}`}>{deficit}</p>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
        severity === 'high' ? 'bg-red-100 text-red-600'
          : severity === 'med' ? 'bg-amber-100 text-amber-600'
          : 'bg-slate-100 text-slate-500'
      }`}>
        {severity === 'high' ? t('analytics_high') : severity === 'med' ? t('analytics_med') : t('analytics_low')}
      </span>
    </div>
  );
}

/** Item de la leyenda de un gráfico de distribución (donut). */
export function DistributionItem({ color, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
        <span className="text-sm text-slate-600 truncate">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}

/** Fila de frecuencia (label + % + barra). */
export function FrequencyItem({ label, percentage, color }: any) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 tabular-nums">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Leyenda suelta (compatibilidad). */
export function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-slate-500">{label}</span>
    </div>
  );
}
