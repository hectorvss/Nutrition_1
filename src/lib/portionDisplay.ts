/**
 * Conversión de la cantidad interna (multiplicador sobre la porción base)
 * a una etiqueta legible en gramos para el usuario.
 *
 * Modelo de datos: cada item de comida tiene `servingSize` (ej. "100g") y un
 * `quantity` que es un MULTIPLICADOR sobre esa porción base (ej. 0.8 = 80% de
 * la porción base). Los macros se calculan como `calories × quantity`.
 *
 * El usuario NO quiere ver "×0.8 100g" — quiere ver "80 g". Estas utilidades
 * convierten entre representación interna y display, sin tocar la lógica de
 * cálculo de macros (que sigue usando el multiplicador).
 */

/** Parsea el número de gramos de un servingSize como "100g", "150 g", "100G". */
export function parseBaseGrams(servingSize: string | undefined | null): number | null {
  if (!servingSize) return null;
  const m = String(servingSize).match(/^\s*([\d.]+)\s*g\b/i);
  return m ? Number(m[1]) : null;
}

/** Redondeo cosmético: enteros sin decimales, no enteros con 1 decimal. */
function smartRound(n: number): string {
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? r.toFixed(0) : r.toFixed(1);
}

/**
 * Etiqueta legible de la porción aplicada.
 *   formatPortion(0.8, "100g") → "80 g"
 *   formatPortion(1.5, "100g") → "150 g"
 *   formatPortion(2, "1 cup")  → "×2 1 cup"  (fallback si no son gramos)
 */
export function formatPortion(quantity: number, servingSize: string | undefined | null): string {
  const base = parseBaseGrams(servingSize);
  const q = Number(quantity) || 0;
  if (base != null && base > 0) {
    return `${smartRound(q * base)} g`;
  }
  return `×${q} ${servingSize || ''}`.trim();
}

/**
 * Convierte el multiplicador interno a gramos para mostrarlo en un input
 * editable. Devuelve null si el servingSize no es en gramos (el caller
 * debería entonces editar directamente el multiplicador).
 */
export function quantityToGrams(quantity: number, servingSize: string | undefined | null): number | null {
  const base = parseBaseGrams(servingSize);
  if (base == null || base <= 0) return null;
  return Math.round((Number(quantity) || 0) * base * 10) / 10;
}

/**
 * Inverso de quantityToGrams: dado un número de gramos tipeado por el coach,
 * calcula el multiplicador interno. Si la porción no es en gramos, devuelve
 * el número tipeado tal cual (interpretado como multiplicador).
 */
export function gramsToQuantity(grams: number, servingSize: string | undefined | null): number {
  const base = parseBaseGrams(servingSize);
  const g = Number(grams) || 0;
  if (base == null || base <= 0) return g || 1;
  return Math.round((g / base) * 1000) / 1000;
}
