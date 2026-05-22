// Contexto compartido de Analytics.
// El endpoint GET /manager/analytics construye este objeto una sola vez con
// los datos ya descargados y la ventana temporal seleccionada, y lo pasa a
// los tres módulos de KPIs ampliados (business / nutrition / training).
//
// Cada módulo recibe el MISMO contexto; puede además descargar datos extra
// que solo él necesite (p. ej. business consulta la API de Stripe).
export interface AnalyticsContext {
  /** ID del manager autenticado. */
  managerId: string;
  /** Momento de la petición. */
  now: Date;
  /** Ventana seleccionada en días (7 | 30 | 90 | 365). */
  windowDays: number;
  /** Inicio de la ventana actual. */
  windowStart: Date;
  /** Inicio de la ventana anterior de igual longitud (para comparativas). */
  prevStart: Date;

  /** Todos los clientes del manager: { id, created_at, status }. */
  allClientData: any[];
  /** IDs de los clientes. */
  clientIds: string[];
  totalClients: number;
  activeClients: number;

  /** Check-ins unificados (legacy + submissions) de la ventana actual+anterior. */
  checkIns: any[];
  /** Todos los check-ins (sólo client_id + date) para cohortes. */
  allCheckIns: any[];
  /** Check-ins dentro de la ventana actual. */
  last30DaysCheckIns: any[];
  /** Check-ins de la ventana anterior. */
  previous30DaysCheckIns: any[];

  /** workout_logs de la ventana: { logged_at, exercises, client_id }. */
  workoutLogs: any[];
  /** training_programs del manager: { data_json }. */
  programs: any[];
  /** nutrition_plans del manager: { data_json, client_id }. */
  nutritionPlans: any[];
  /** Fila de integrations del manager (incluye claves de Stripe). */
  integrations: any;

  recentMessages: any[];
  recentCheckIns: any[];
  recentSubmissions: any[];

  /** Mapa client_id -> nombre completo del cliente (para rankings y listas). */
  clientNames: Record<string, string>;

  /** Nº de segmentos de las series temporales. */
  BUCKETS: number;
  /** Etiquetas de fecha de cada segmento. */
  trendLabels: string[];
  /** Mapea una fecha (YYYY-MM-DD) a su índice de segmento, o -1 si fuera de ventana. */
  bucketIndexOf: (dateStr: string) => number;

  /** Objetos base ya calculados por el endpoint, por si un módulo los necesita. */
  business: Record<string, any>;
  nutrition: Record<string, any>;
  training: Record<string, any>;
}
