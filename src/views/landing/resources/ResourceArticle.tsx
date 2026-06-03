import { motion } from 'motion/react';
import { ChevronLeft, Clock, Sparkles, Quote as QuoteIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { Block, ResourceArticle as Article } from './types';

interface Props {
  article: Article;
  onBack: () => void;
  /** Etiqueta de la categoría (ya traducida) para el breadcrumb. */
  categoryLabel: string;
}

/**
 * Lector de artículo estilo "notepad": columna de lectura estrecha, tipografía
 * cuidada, capturas reales del producto con marco de gradiente redondeado,
 * callouts de tip y citas. Es la pieza que hace que Recursos se sienta como
 * una publicación de verdad, no una lista de enlaces.
 */
export default function ResourceArticle({ article, onBack, categoryLabel }: Props) {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const tx = (es?: string, en?: string) => (isEs ? es : en) || es || en || '';

  return (
    <div className="pt-28 pb-24 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Volver */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          {isEs ? 'Volver a Recursos' : 'Back to Resources'}
        </button>

        {/* Cabecera */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">
          {categoryLabel}
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-4"
        >
          {tx(article.es.title, article.en.title)}
        </motion.h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-4">
          {tx(article.es.subtitle, article.en.subtitle)}
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-10 pb-10 border-b border-gray-100">
          <Clock className="w-3.5 h-3.5" />
          {article.readMin} {isEs ? 'min de lectura' : 'min read'}
        </div>

        {/* Cuerpo */}
        <div className="space-y-6">
          {article.blocks.map((b, i) => (
            <div key={i}>
              <BlockView block={b} tx={tx} isEs={isEs} />
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function BlockView({
  block,
  tx,
  isEs,
}: {
  block: Block;
  tx: (es?: string, en?: string) => string;
  isEs: boolean;
}) {
  switch (block.type) {
    case 'h':
      return (
        <h2 className="text-2xl font-medium tracking-tight text-gray-900 pt-4">
          {tx(block.es, block.en)}
        </h2>
      );
    case 'p':
      return <p className="text-[17px] leading-relaxed text-gray-700">{tx(block.es, block.en)}</p>;
    case 'ul':
      return (
        <ul className="space-y-2.5">
          {(isEs ? block.es : block.en).map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-[17px] leading-relaxed text-gray-700">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {(isEs ? block.es : block.en).map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-[17px] leading-relaxed text-gray-700">
              <span className="shrink-0 w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {j + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div className="flex items-start gap-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[15px] leading-relaxed text-emerald-900">{tx(block.es, block.en)}</p>
        </div>
      );
    case 'quote':
      return (
        <figure className="border-l-4 border-emerald-500 pl-5 py-1">
          <QuoteIcon className="w-6 h-6 text-emerald-500/30 mb-2" />
          <blockquote className="text-xl font-medium tracking-tight text-gray-900 leading-snug">
            {tx(block.es, block.en)}
          </blockquote>
          {(block.authorEs || block.authorEn) && (
            <figcaption className="text-sm text-gray-400 mt-3">
              — {tx(block.authorEs, block.authorEn)}
            </figcaption>
          )}
        </figure>
      );
    case 'img':
      return (
        <figure className="my-2">
          {/* Marco de gradiente redondeado alrededor de la captura real. */}
          <div className={`rounded-3xl p-3 md:p-4 ${block.gradient} shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)]`}>
            <div className="rounded-2xl overflow-hidden bg-white border border-white/30">
              <img src={block.src} alt={block.alt} loading="lazy" className="w-full h-auto block" />
            </div>
          </div>
          {(block.es || block.en) && (
            <figcaption className="text-center text-xs text-gray-400 mt-3">
              {tx(block.es, block.en)}
            </figcaption>
          )}
        </figure>
      );
    case 'code':
      return (
        <pre className="bg-slate-900 text-slate-100 rounded-2xl p-5 overflow-x-auto text-sm leading-relaxed">
          <code>{block.content}</code>
        </pre>
      );
    default:
      return null;
  }
}
