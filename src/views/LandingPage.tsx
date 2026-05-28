import { useState } from "react";
import { motion } from "motion/react";
import { Search, Play, X, Instagram, Linkedin } from "lucide-react";
import Pricing from "../components/Pricing";
import { useLanguage } from "../context/LanguageContext";
import HowItWorks from "./landing/HowItWorks";
import TestimonialsSection from "./landing/TestimonialsSection";
import FAQSection from "./landing/FAQSection";
import DemoPage from "./landing/DemoPage";
import LegalPage, { type LegalKind } from "./landing/LegalPage";
import StatsSection from "./landing/StatsSection";
import ComparisonSection from "./landing/ComparisonSection";
import FeaturesPage from "./landing/FeaturesPage";
import SolutionsPage from "./landing/SolutionsPage";
import ResourcesPage from "./landing/ResourcesPage";
import AboutPage from "./landing/AboutPage";
import ChangelogPage from "./landing/ChangelogPage";
import ImpactSection from "./landing/ImpactSection";
import ROISection from "./landing/ROISection";

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

// URLs de redes sociales. Como aún no las hemos publicado, quedan como `#`
// para no romper layouts; cuando estén disponibles, reemplazar aquí.
const SOCIAL = {
  x: '#',
  instagram: '#',
  linkedin: '#',
};

type LandingPageKind =
  | 'home'
  | 'pricing'
  | 'demo'
  | 'features'
  | 'solutions'
  | 'resources'
  | 'about'
  | 'changelog'
  | LegalKind;

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language, setLanguage } = useLanguage();
  const isEs = language === 'es';
  const [currentPage, setCurrentPage] = useState<LandingPageKind>('home');

  // Scroll a la sección de features (mockups con capturas reales). Si el
  // usuario está en una sub-página, vuelve a home primero y luego scrollea.
  const scrollToFeatures = () => {
    if (currentPage !== 'home') setCurrentPage('home');
    requestAnimationFrame(() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // Fondo en gradiente diagonal suave: indigo arriba-izquierda → blanco
  // central → rosa abajo-derecha. Los componentes con `bg-white` siguen
  // destacando por contraste.
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-rose-50 min-h-screen font-sans text-black">
      {/* Floating Navigation Header */}
      <div className="fixed top-8 left-0 w-full px-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          <nav className="backdrop-blur-md bg-white/40 border border-white/20 pl-2 pr-6 py-2 rounded-full flex items-center gap-6 shadow-sm">
            <button
              onClick={() => setCurrentPage('home')}
              aria-label="NutriFit"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg cursor-pointer border-none"
            ></button>
            <div className="flex gap-5 md:gap-6 text-[15px] md:text-base">
              {[
                // Etiquetas con mayúscula inicial explícita: los items de
                // navegación de la landing son nombres propios de la sección.
                { key: 'home' as const,       label: isEs ? 'Producto'   : 'Product' },
                { key: 'features' as const,   label: isEs ? 'Funciones'  : 'Features' },
                { key: 'solutions' as const,  label: isEs ? 'Soluciones' : 'Solutions' },
                { key: 'pricing' as const,    label: isEs ? 'Precios'    : 'Pricing' },
                { key: 'resources' as const,  label: isEs ? 'Recursos'   : 'Resources' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCurrentPage(key)}
                  className={`font-medium transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap ${
                    currentPage === key ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex gap-4 pointer-events-auto items-center">
          {/* Selector de idioma ES / EN. El landing arranca en 'es' por
              defecto; aqui el visitante (aun sin login) puede cambiarlo.
              `setLanguage` solo persiste en backend si hay manager logueado;
              para un visitante anonimo cambia el estado en memoria, que es
              justo lo que queremos en la landing publica. */}
          <div className="hidden sm:flex items-center bg-white/40 backdrop-blur-md border border-white/20 rounded-full p-0.5 text-xs font-bold shadow-sm">
            <button
              onClick={() => setLanguage('es')}
              aria-pressed={isEs}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer border-none ${
                isEs ? 'bg-black text-white' : 'bg-transparent text-gray-500 hover:text-black'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-pressed={!isEs}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer border-none ${
                !isEs ? 'bg-black text-white' : 'bg-transparent text-gray-500 hover:text-black'
              }`}
            >
              EN
            </button>
          </div>

          {/* Etiquetas explicitas con mayuscula inicial y sin guion bajo
              (antes salian "log_in" / "create_account" tal cual la clave). */}
          <button
            onClick={onLogin}
            className="text-gray-400 hover:text-black font-medium text-lg transition-colors bg-transparent border-none cursor-pointer px-4 py-2"
          >
            {isEs ? 'Iniciar sesión' : 'Log in'}
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-black text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/5 active:scale-95 cursor-pointer border-none"
          >
            {isEs ? 'Crear cuenta' : 'Create account'}
          </button>
        </div>
      </div>

      {currentPage === 'demo' && <DemoPage onBack={() => setCurrentPage('home')} />}
      {currentPage === 'privacy' && <LegalPage kind="privacy" onBack={() => setCurrentPage('home')} />}
      {currentPage === 'terms' && <LegalPage kind="terms" onBack={() => setCurrentPage('home')} />}
      {currentPage === 'security' && <LegalPage kind="security" onBack={() => setCurrentPage('home')} />}
      {currentPage === 'features' && (
        <FeaturesPage onBack={() => setCurrentPage('home')} onDemo={() => setCurrentPage('demo')} />
      )}
      {currentPage === 'solutions' && (
        <SolutionsPage
          onBack={() => setCurrentPage('home')}
          onDemo={() => setCurrentPage('demo')}
          onStart={() => onGetStarted?.()}
        />
      )}
      {currentPage === 'resources' && <ResourcesPage onBack={() => setCurrentPage('home')} />}
      {currentPage === 'about' && (
        <AboutPage onBack={() => setCurrentPage('home')} onDemo={() => setCurrentPage('demo')} />
      )}
      {currentPage === 'changelog' && <ChangelogPage onBack={() => setCurrentPage('home')} />}

      {currentPage === 'pricing' && <Pricing onGetStarted={onGetStarted} />}

      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <header className="pt-32 pb-32 text-center px-4 relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-medium mb-8 leading-tight tracking-tight"
            >
              {t('landing_hero_line_1')} <br /> {t('landing_hero_line_2')}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-gray-500 max-w-2xl mx-auto mb-4 text-lg">
                {t('landing_hero_description')}
              </p>
              
              <div className="flex items-center bg-gray-100 rounded-full px-6 py-3 text-base shadow-sm">
                <span className="text-gray-500 mr-4 font-medium">{t('landing_ready_to_scale')}</span>
                <button
                  onClick={onGetStarted}
                  className="bg-black text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors cursor-pointer border-none"
                >
                  {t('start_free_trial', { defaultValue: t('start_free') })}
                </button>
              </div>
              <p className="text-xs text-emerald-700 font-semibold tracking-wide uppercase">
                {t('trial_microcopy', { defaultValue: '14 días de prueba gratis — sin tarjeta' })}
              </p>
              
              <p className="text-sm text-gray-500 mt-2">
                {t('landing_personalized_walkthrough')} <button type="button" onClick={() => setCurrentPage('demo')} className="underline font-medium text-black bg-transparent border-none cursor-pointer p-0">{t('book_a_demo')}</button>
              </p>
            </motion.div>
            
            {/* Floating Mac Browser Mockup - Placeholder for Video */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-20 max-w-5xl mx-auto relative px-4"
            >
              {/* Mockup del hero — captura real del dashboard del manager.
                  Generada con scripts/capture-landing-screenshots.mjs. Si
                  hay que regenerar, basta con re-correr ese script. */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/20 w-full aspect-video overflow-hidden flex flex-col">
                <div className="bg-white/50 border-b border-gray-100/20 px-6 py-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="mx-auto bg-gray-100/50 rounded-xl px-4 py-1.5 text-xs text-gray-400 font-medium flex items-center gap-2 w-1/3">
                    <Search className="w-3 h-3" />
                    nutrifit.pro/dashboard
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-white">
                  <img
                    src="/landing/feature-dashboard.png"
                    alt="Dashboard del manager: tareas pendientes, clientes activos y actualizaciones del día"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
              </div>
            </motion.div>      
              
            {/* Tour del producto — lleva a la sección de capturas reales. */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={scrollToFeatures}
                className="bg-white/80 backdrop-blur-md border border-gray-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg hover:bg-white transition-all group cursor-pointer"
              >
                <div className="bg-black text-white rounded-full p-1.5 group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span className="font-medium text-sm">{t('watch_product_tour')}</span>
              </button>
            </div>
          </header>

          {/* Cifras de prueba justo despues del hero. */}
          <StatsSection />

          {/* Gráfico visual "antes vs. después": el factor wow del scroll
              superior, el visitante ve de un golpe la diferencia. */}
          <ImpactSection />

          {/* "Cómo funciona" en 3 pasos da contexto del producto antes del
              recorrido animado. El grid completo de features (FeatureGrid) y
              las integraciones viven en la pagina "Funciones" — aqui solo el
              showcase visual con capturas reales para no diluir el funnel. */}
          <HowItWorks />

          <main id="features" className="space-y-28 md:space-y-36 mb-40 scroll-mt-24">
            {/* 4 secciones de producto, 2 columnas (texto + mockup),
                un único frame por sección. Cuando lleguen las capturas
                reales, pasar `imageSrc` a cada `FeatureSequenceSection`
                con la ruta correspondiente (e.g. `/landing/feature-clients.png`). */}
            <FeatureSequenceSection
              title={[t('landing_feature_intro'), t('client_management')]}
              subtitle={t('landing_client_management_subtitle')}
              highlight={t('landing_client_management_highlight')}
              description={t('landing_client_management_description')}
              gradientClass="gradient-bg-writing"
              url="nutrifit.pro/clients"
              imageSrc="/landing/feature-clients.png"
              imageAlt="Lista de clientes del manager con plan, adherencia y próxima cita"
            />

            <FeatureSequenceSection
              title={[t('landing_feature_intro'), t('nutrition_planning')]}
              subtitle={t('landing_nutrition_planning_subtitle')}
              highlight={t('landing_nutrition_planning_highlight')}
              description={t('landing_nutrition_planning_description')}
              gradientClass="gradient-bg-learning"
              url="nutrifit.pro/nutrition"
              imageSrc="/landing/feature-nutrition.png"
              imageAlt="Planes de nutrición por cliente con objetivo, macros y kcal"
              reverse
            />

            <FeatureSequenceSection
              title={[t('landing_feature_intro'), t('progress_tracking')]}
              subtitle={t('landing_progress_tracking_subtitle')}
              highlight={t('landing_progress_tracking_highlight')}
              description={t('landing_progress_tracking_description')}
              gradientClass="gradient-bg-planning"
              url="nutrifit.pro/analytics"
              imageSrc="/landing/feature-progress.png"
              imageAlt="Panel de analíticas: clientes activos, retención, MRR, ARR y churn rate"
            />

            <FeatureSequenceSection
              title={[t('landing_feature_intro'), t('proactive_follow_up')]}
              subtitle={t('landing_proactive_followup_subtitle')}
              highlight={t('landing_proactive_followup_highlight')}
              description={t('landing_proactive_followup_description')}
              gradientClass="gradient-bg-shopping"
              url="nutrifit.pro/automations"
              imageSrc="/landing/feature-automations.png"
              imageAlt="Workflows de automatización: renovación de plan, check-in semanal, alertas de churn"
              reverse
            />

            {/* Workflow Builder visual — diferencial fuerte: un flujo
                complejo (Churn Radar) con triggers, ramas condicionales y
                múltiples acciones. La captura real demuestra que la
                automatización avanzada existe de verdad. */}
            <FeatureSequenceSection
              title={isEs ? ['Automatización avanzada,', 'sin tocar código'] : ['Advanced automation,', 'zero code']}
              subtitle={isEs
                ? 'Constructor visual de workflows con ramas, condiciones y acciones.'
                : 'A visual workflow builder with branches, conditions and actions.'}
              highlight={isEs ? 'Diseña flujos complejos' : 'Build complex flows'}
              description={isEs
                ? 'arrastrando bloques: detecta riesgo de abandono, reacciona a la adherencia y dispara mensajes, tareas o alertas — todo en automático.'
                : 'by dragging blocks: detect churn risk, react to adherence and fire messages, tasks or alerts — all on autopilot.'}
              gradientClass="gradient-bg-privacy"
              url="nutrifit.pro/automations/workflow"
              imageSrc="/landing/feature-workflow.png"
              imageAlt="Constructor visual de workflows: flujo Churn Radar con triggers, ramas condicionales y múltiples acciones"
            />

            {/* Tras ver el producto: primero la calculadora de ROI (cuanto
                te devuelve — valor concreto), luego la comparativa vs Excel /
                WhatsApp / CRM (por que NutriFit y no lo que ya usas). El bloque
                "para quien es" se movio a la pagina Soluciones, su contexto
                natural. */}
            <ROISection />
            <ComparisonSection />

            {/* Prueba social y resolución de dudas frecuentes antes del CTA
                final, donde el visitante ya tiene contexto suficiente. */}
            <TestimonialsSection />
            <FAQSection />

            {/* Bottom CTA */}
            <section className="py-40 text-center px-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-[72px] md:leading-[92px] font-medium pb-2 mb-10 text-black"
              >
                {t('landing_bottom_title_line_1')} <br /> {t('landing_bottom_title_line_2')}
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm text-black">
                  <span className="text-gray-500 mr-2">{t('landing_join_elite_coaches')}</span>
                  <button 
                    onClick={onGetStarted}
                    className="bg-black text-white px-4 py-1.5 rounded-full font-medium text-xs hover:bg-gray-800 transition-colors cursor-pointer border-none"
                  >
                    {t('start_free_trial')}
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-8">
                  {t('landing_no_credit_card')} <button type="button" onClick={() => setCurrentPage('pricing')} className="underline font-medium text-black bg-transparent border-none cursor-pointer p-0">{t('view_pricing_plans')}</button>
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t('landing_version_status_prefix')}</span>
                  <span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-black">{t('stable_release')}</span>
                </div>
                <p className="text-[11px] text-gray-400">{t('landing_compliance_badge')}</p>
              </motion.div>
            </section>
          </main>
        </>
      )}

      {/* Footer global — visible en TODAS las paginas (home + subpaginas).
          Sin bloque blanco ni espectro multicolor: vive directamente sobre
          el fondo gradiente rosa-indigo de la landing. */}
      <footer className="pt-24 pb-12 relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-400">{t('designed_for_professionals')}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-6 font-black font-sans">NutriFit Systems Inc.</p>
            <div className="flex gap-6 text-gray-400">
              <a
                href={SOCIAL.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-black transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-black transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/5 pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {[
                { key: 'about' as const,     label: isEs ? 'Sobre nosotros' : 'About' },
                { key: 'changelog' as const, label: 'Changelog' },
                { key: 'resources' as const, label: isEs ? 'Recursos' : 'Resources' },
                { key: 'privacy' as const,   label: t('privacy_policy') },
                { key: 'terms' as const,     label: isEs ? 'Términos' : 'Terms' },
                { key: 'security' as const,  label: t('security') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCurrentPage(key)}
                  className="hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0 uppercase tracking-widest"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">
                {t('platform_status')}: <span className="text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {t('all_systems_go')}</span>
              </span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * FeatureSequenceSection — rediseñada (mayo 2026).
 *
 * La versión anterior era `h-[250vh]` con scroll sticky y 4 "screens"
 * placeholder por sección. Resultado: 16 frames vacíos con etiqueta
 * "Module N" y, sobre todo, **el contenido no cabía en una pantalla a
 * 100% de zoom** — el título se cortaba bajo el nav flotante y el
 * mockup quedaba debajo del fold.
 *
 * Esta versión:
 *  - Un único mockup por sección (no rotación de placeholders).
 *  - Layout en 2 columnas (texto izquierda + imagen derecha) en md+,
 *    apilado en móvil. Cabe en una pantalla a 100% sin recortes.
 *  - `imageSrc` opcional: cuando aún no hay captura, se muestra el
 *    chrome del navegador con un Play discreto. Cuando llegue la
 *    imagen real, pasa la URL por `imageSrc` y reemplaza el placeholder.
 */
function FeatureSequenceSection({
  title,
  subtitle,
  highlight,
  description,
  gradientClass,
  url,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  title: string[];
  subtitle: string;
  highlight: string;
  description: string;
  gradientClass: string;
  url: string;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
}) {
  return (
    <section className="px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-10 md:gap-14">
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className={`md:col-span-5 text-center md:text-left ${reverse ? 'md:order-2' : ''}`}
        >
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-4">
            {title[0]} <br className="hidden md:block" /> {title[1]}
          </h2>
          <p className="text-gray-500 mb-6 text-base">{subtitle}</p>
          <p className="text-lg text-gray-800 leading-relaxed">
            <span className="font-bold text-black">{highlight}</span> {description}
          </p>
        </motion.div>

        {/* Mockup — un solo frame por sección. Cuando llegue la captura
            real, pasar `imageSrc` y se renderiza dentro del chrome. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`md:col-span-7 ${reverse ? 'md:order-1' : ''}`}
        >
          <div className={`relative ${gradientClass} rounded-3xl p-4 md:p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 aspect-video overflow-hidden flex flex-col shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
              <div className="bg-white/60 border-b border-gray-100/40 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/50 rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-medium w-1/2 text-center truncate">
                  {url}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-white relative">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={imageAlt || ''}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center border border-black/5">
                    <Play className="w-6 h-6 text-black/15" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

