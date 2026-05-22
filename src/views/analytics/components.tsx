import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/* ============================================================================
 * Componentes compartidos de Analytics.
 * Usados por las tres pestañas (Business / Nutrition / Training). Mantener el
 * mismo estilo visual aquí garantiza que todas las tarjetas y gráficas sean
 * coherentes — no dupliques estos componentes en las pestañas.
 * ========================================================================== */

/** Tarjeta de KPI estándar. Toda métrica de dato debe usar este componente. */
export function StatCard({ title, value, unit, change, isPositive, isNeutral, icon, iconBg, iconColor, showChart, chartColor = 'text-emerald-500', changeLabel = '' }: any) {
  const { t } = useLanguage();
  const resolvedChangeLabel = changeLabel || t('vs_last_month');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 group hover:border-emerald-500/30 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">
            {value} {unit && <span className="text-lg font-normal text-slate-400">{unit}</span>}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      {showChart && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10">
          <svg className={`w-full h-full ${chartColor} fill-current`} viewBox="0 0 100 20">
            <path d="M0 20 L0 15 L10 12 L20 16 L30 10 L40 14 L50 8 L60 12 L70 6 L80 10 L90 4 L100 8 L100 20 Z"></path>
          </svg>
        </div>
      )}
      {(change !== undefined && change !== null && change !== '') && (
        <div className="flex items-center gap-2 relative z-10">
          <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
            isNeutral ? 'text-slate-500 bg-slate-100' :
            isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {!isNeutral && (isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />)}
            {change}
          </span>
          <span className="text-xs text-slate-400">{resolvedChangeLabel}</span>
        </div>
      )}
    </div>
  );
}

/** Barra de progreso etiquetada (label + valor + barra). */
export function ProgressBar({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

/** Fila de la tabla de retención por cohorte. */
export function CohortRow({ cohort, data }: any) {
  return (
    <tr>
      <td className="py-3 text-left pl-4 font-medium text-slate-900">{cohort}</td>
      {data.map((val: any, i: number) => (
        <td key={i} className="py-3">
          {val !== null ? (
            <div className={`inline-block px-3 py-1 rounded text-white font-medium ${
              val >= 95 ? 'bg-emerald-600' :
              val >= 90 ? 'bg-emerald-500' :
              val >= 85 ? 'bg-emerald-400' : 'bg-emerald-300'
            }`}>
              {val}%
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </td>
      ))}
    </tr>
  );
}

/** Item de leyenda (punto de color + etiqueta). */
export function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span className="text-slate-600">{label}</span>
    </div>
  );
}

/** Fila de cliente con déficit (lista de "Top Deficit Clients"). */
export function DeficitClient({ name, deficit, severity }: any) {
  const { t } = useLanguage();
  const severityStyles = {
    high: 'bg-red-50 border-red-100 text-red-500',
    med: 'bg-amber-50 border-amber-100 text-amber-500',
    low: 'bg-slate-50 border-slate-100 text-slate-500'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${severity === 'high' ? severityStyles.high : 'bg-white border-transparent hover:bg-slate-50'} transition-colors`}>
      <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
        {String(name || 'C').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 truncate">{name}</h4>
        <p className={`text-xs font-medium ${severity === 'high' ? 'text-red-500' : 'text-slate-500'}`}>{deficit}</p>
      </div>
      <div className="text-right">
        {severity === 'high' ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : (
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${severity === 'med' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
            {severity === 'med' ? t('analytics_med') : t('analytics_low')}
          </span>
        )}
      </div>
    </div>
  );
}

/** Item de la leyenda de un gráfico de distribución (donut). */
export function DistributionItem({ color, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

/** Fila de frecuencia (label + % + barra) — usada en frecuencia muscular. */
export function FrequencyItem({ label, percentage, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
