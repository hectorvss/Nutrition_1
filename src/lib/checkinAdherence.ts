// Cálculo único de adherencia al check-in semanal, compartido entre
// ClientDashboard y ClientCheckIns para que ambas pantallas muestren
// SIEMPRE el mismo número.
//
// Regla: nº de DÍAS ÚNICOS con check-in en las últimas 4 semanas, sobre 4
// (un check-in por semana = 100%). Se deduplica por día para que dos
// check-ins el mismo día no inflen el porcentaje, y se usa `date` con
// fallback a `created_at`.

interface CheckInLike {
  date?: string | null;
  created_at?: string | null;
}

export function computeCheckinAdherence(checkIns: CheckInLike[] | null | undefined): number {
  const list = checkIns || [];
  if (list.length === 0) return 0;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const uniqueDays = new Set<string>();
  for (const c of list) {
    const raw = c?.date || c?.created_at;
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    if (d >= fourWeeksAgo) {
      uniqueDays.add(d.toISOString().split('T')[0]);
    }
  }

  return Math.min(100, Math.round((uniqueDays.size / 4) * 100));
}
