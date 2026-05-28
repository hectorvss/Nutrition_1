import { useEffect, useState } from 'react';

/**
 * Estilo de tooltip de recharts que respeta el modo oscuro. Observa la
 * clase `dark` en <html> con un MutationObserver para recolorear en vivo
 * al cambiar de tema. Compartido por ClientProgress, NutritionTab y
 * TrainingTab para que ninguna gráfica quede con fondo blanco ilegible
 * en dark mode.
 */
export function useChartTooltipStyle() {
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  } as const;
}
