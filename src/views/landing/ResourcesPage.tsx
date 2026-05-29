import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, FileText, Headphones, Newspaper, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { articlesByCategory, findArticle, type CategoryId } from './resources';
import ResourceArticle from './resources/ResourceArticle';

interface ResourcesPageProps {
  onBack: () => void;
}

/**
 * Hub de recursos — ahora 100% funcional. Lista las 4 categorías con sus
 * artículos reales; al hacer clic en uno se abre el lector "notepad"
 * (ResourceArticle) con contenido bilingüe, capturas del producto con marco
 * de gradiente y callouts. El estado del artículo abierto vive aquí.
 */
const CATEGORIES: { id: CategoryId; Icon: typeof BookOpen; es: string; en: string; gradient: string }[] = [
  { id: 'guides',   Icon: BookOpen,  es: 'Guías',          en: 'Guides',         gradient: 'gradient-bg-writing' },
  { id: 'articles', Icon: FileText,  es: 'Artículos',      en: 'Articles',       gradient: 'gradient-bg-learning' },
  { id: 'stories',  Icon: Headphones,es: 'Casos de éxito', en: 'Customer stories', gradient: 'gradient-bg-planning' },
  { id: 'docs',     Icon: Newspaper, es: 'Documentación',  en: 'Documentation',  gradient: 'gradient-bg-privacy' },
];

export default function ResourcesPage({ onBack }: ResourcesPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId ? findArticle(openId) : undefined;

  // Vista de artículo abierto.
  if (open) {
    const cat = CATEGORIES.find((c) => c.id === open.category);
    return (
      <ResourceArticle
        article={open}
        onBack={() => setOpenId(null)}
        categoryLabel={cat ? (isEs ? cat.es : cat.en) : ''}
      />
    );
  }

  // Índice de recursos.
  return (
    <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
        {isEs ? 'Recursos' : 'Resources'}
      </p>
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
        {isEs ? 'Aprende, configura, crece.' : 'Learn, set up, grow.'}
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
        {isEs
          ? 'Guías, artículos y documentación para sacar el máximo a la plataforma.'
          : 'Guides, articles and documentation to get the most out of the platform.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {CATEGORIES.map(({ id, Icon, es, en, gradient }) => {
          const items = articlesByCategory(id);
          return (
            <div key={id} className="bg-white border border-gray-100 rounded-3xl p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-11 h-11 rounded-2xl ${gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-black/70" />
                </div>
                <h2 className="text-xl font-medium tracking-tight">{isEs ? es : en}</h2>
                <span className="ml-auto text-[11px] font-bold text-gray-300">{items.length}</span>
              </div>
              <ul className="space-y-1">
                {items.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => { setOpenId(a.id); window.scrollTo({ top: 0 }); }}
                      className="group w-full flex items-center gap-3 text-left py-3 border-b border-gray-100 last:border-b-0 hover:px-2 transition-all rounded-lg hover:bg-gray-50/60"
                    >
                      <span className="flex-1 text-sm text-gray-800 group-hover:text-black font-medium leading-snug">
                        {isEs ? a.es.title : a.en.title}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-300 shrink-0">
                        <Clock className="w-3 h-3" /> {a.readMin}′
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-gray-400 mt-12"
      >
        {isEs
          ? '¿Te falta algún tema? Escríbenos y lo añadimos al calendario editorial.'
          : 'Missing a topic? Write to us and we’ll add it to the editorial calendar.'}
      </motion.p>
    </div>
  );
}
