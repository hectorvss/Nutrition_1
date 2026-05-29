// Esquema de contenido del hub de Recursos. Tanto el lector
// (ResourceArticle) como los ficheros de contenido por categoría
// (guides/articles/stories/docs) importan de aquí para no divergir.

export type CategoryId = 'guides' | 'articles' | 'stories' | 'docs';

// Bloques de un artículo. Render en ResourceArticle.tsx.
export type Block =
  | { type: 'p'; es: string; en: string }                                   // párrafo
  | { type: 'h'; es: string; en: string }                                   // subtítulo de sección
  | { type: 'ul'; es: string[]; en: string[] }                              // lista con viñetas
  | { type: 'steps'; es: string[]; en: string[] }                           // lista numerada
  | { type: 'tip'; es: string; en: string }                                 // callout destacado
  | { type: 'quote'; es: string; en: string; authorEs?: string; authorEn?: string } // cita
  | { type: 'img'; src: string; gradient: string; alt: string; es?: string; en?: string } // captura + caption
  | { type: 'code'; lang?: string; content: string };                       // bloque de código

export interface ResourceArticle {
  id: string;
  category: CategoryId;
  /** Minutos de lectura aproximados (mostrado como "X min"). */
  readMin: number;
  es: { title: string; subtitle: string };
  en: { title: string; subtitle: string };
  blocks: Block[];
}

// Clases de gradiente reutilizables para los marcos de imagen (definidas en
// src/index.css). Se exponen como const para autocompletar en el contenido.
export const FRAME_GRADIENTS = [
  'gradient-bg-writing',
  'gradient-bg-learning',
  'gradient-bg-planning',
  'gradient-bg-shopping',
  'gradient-bg-privacy',
] as const;
