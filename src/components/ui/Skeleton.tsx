import type { HTMLAttributes } from 'react';

/* ============================================================================
 * Skeleton — primitivos de carga compartidos por TODA la app.
 *
 * Patrón: mientras se descargan datos, en lugar de un spinner global la
 * pantalla se renderiza completa con bloques grises animados (animate-pulse)
 * en el lugar exacto donde irán los datos. La sensación es de carga rápida
 * y la UI no salta cuando los datos llegan.
 *
 *  · <Skeleton />        Barra básica — para textos / valores cortos.
 *  · <SkeletonBlock />   Bloque grande — para gráficas / áreas.
 *  · <SkeletonCircle />  Círculo — para avatares.
 *  · <SkeletonText />    Varias líneas apiladas — para párrafos.
 *
 * Modo claro y oscuro automáticos. No requieren contexto, son puramente
 * presentacionales — el caller decide cuándo renderizarlos.
 * ========================================================================== */

const BASE = 'bg-slate-200/70 dark:bg-slate-700/40 animate-pulse';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return <div className={`${BASE} rounded-md ${className}`} aria-hidden="true" {...props} />;
}

export function SkeletonBlock({
  height = 240,
  className = '',
  ...props
}: SkeletonProps & { height?: number }) {
  return (
    <div
      className={`w-full ${BASE} rounded-xl ${className}`}
      style={{ height }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  className = '',
  ...props
}: SkeletonProps & { size?: number }) {
  return (
    <div
      className={`${BASE} rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = '',
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${BASE} h-3 rounded-md`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
