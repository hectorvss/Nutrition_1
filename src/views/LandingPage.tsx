import { useState } from "react";
import { motion } from "motion/react";
import { Search, Paperclip, ImageIcon, Play, X, Instagram, Linkedin } from "lucide-react";
import Pricing from "../components/Pricing";

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing'>('home');

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* Floating Navigation Header */}
      <div className="fixed top-8 left-0 w-full px-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          <nav className="backdrop-blur-md bg-white/40 border border-white/20 pl-2 pr-8 py-2 rounded-full flex items-center gap-8 shadow-sm">
            <button 
              onClick={() => setCurrentPage('home')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg cursor-pointer border-none"
            ></button>
            <div className="flex gap-8">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`text-lg font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${currentPage === 'home' ? 'text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Product
              </button>
              <button 
                onClick={() => setCurrentPage('pricing')}
                className={`text-lg font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${currentPage === 'pricing' ? 'text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Pricing
              </button>
            </div>
          </nav>
        </div>

        <div className="flex gap-4 pointer-events-auto items-center">
          <button 
            onClick={onLogin}
            className="text-gray-400 hover:text-black font-medium text-lg transition-colors bg-transparent border-none cursor-pointer px-4 py-2"
          >
            Log In
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-black text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/5 active:scale-95 cursor-pointer border-none"
          >
            Create Account
          </button>
        </div>
      </div>

      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <header className="pt-32 pb-32 text-center px-4 relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-medium mb-8 leading-tight"
            >
              Manage Clients <br /> Without Chaos.
            </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-gray-500 max-w-2xl mx-auto mb-4 text-lg">
            Client management, nutrition planning, progress tracking, and follow-up — all in one system built for nutrition and fitness professionals.
          </p>
          
          <div className="flex items-center bg-gray-100 rounded-full px-6 py-3 text-base shadow-sm">
            <span className="text-gray-500 mr-4">Ready to scale your coaching?</span>
            <button 
              onClick={onGetStarted}
              className="bg-black text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors cursor-pointer border-none"
            >
              Start Free
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            Want a personalized walkthrough? <a href="#" className="underline font-medium text-black">Book a Demo →</a>
          </p>
        </motion.div>
        {/* Floating Mac Browser Mockup - Placeholder for Video */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 max-w-5xl mx-auto relative px-4"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/20 w-full aspect-video overflow-hidden flex flex-col">
            <div className="bg-white/50 border-b border-gray-100/20 px-6 py-4 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="mx-auto bg-gray-100/50 rounded-xl px-4 py-1.5 text-xs text-gray-400 font-medium flex items-center gap-2 w-1/3">
                <Search className="w-3 h-3" />
                nutrifit.pro/app
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50/10">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-black/10" />
              </div>
            </div>
          </div>
        </motion.div>      
          
        {/* Trailer Play Button */}
        <div className="mt-8 flex justify-center">
          <button className="bg-white/80 backdrop-blur-md border border-gray-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg hover:bg-white transition-all group cursor-pointer">
            <div className="bg-black text-white rounded-full p-1.5 group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <span className="font-medium text-sm">Watch the product tour</span>
          </button>
        </div>
      </header>

      <main className="space-y-40 mb-40">
        {/* Client Management Section */}
        <section className="max-w-6xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-[72px] md:leading-[92px] font-medium mb-2">NutriFit is for <br /> Client Management</h2>
            <p className="text-gray-500 mb-12">Everything in one place, so you can focus on coaching</p>
            
            <div className="flex justify-center gap-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            </div>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              <span className="font-bold">Manage every client</span> from one clear system — plans, progress, reviews, communication, and follow-up.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center items-center h-[700px] gradient-bg-writing rounded-3xl overflow-hidden w-full max-w-[1104px] mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          >
            {/* Mac Browser Mockup Placeholder for Video */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/20 w-full max-w-5xl aspect-video overflow-hidden relative z-10 mx-4 flex flex-col">
              <div className="bg-white/50 border-b border-gray-100/20 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/50 rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-2 w-1/3">
                  nutrifit.pro/dashboard
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-50/10">
                <Play className="w-12 h-12 text-black/10" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Nutrition Planning Section */}
        <section className="max-w-6xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-[72px] md:leading-[92px] font-medium mb-2">NutriFit is for <br /> Nutrition Planning</h2>
            <p className="text-gray-500 mb-12">Powerful planning tools for professional results</p>
            
            <div className="flex justify-center gap-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            </div>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              <span className="font-bold">Build structured nutrition plans</span> faster, with clearer workflows and less manual work.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center items-center h-[700px] gradient-bg-learning rounded-3xl overflow-hidden w-full max-w-[1104px] mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          >
            {/* Mac Browser Mockup Placeholder for Video */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/20 w-full max-w-5xl aspect-video overflow-hidden relative z-10 mx-4 flex flex-col">
              <div className="bg-white/50 border-b border-gray-100/20 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/50 rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-2 w-1/3">
                  nutrifit.pro/plans
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-50/10">
                <Play className="w-12 h-12 text-black/10" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Progress Tracking Section */}
        <section className="max-w-6xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-[72px] md:leading-[92px] font-medium mb-2">NutriFit is for <br /> Progress Tracking</h2>
            <p className="text-gray-500 mb-12">Visual data to prove your coaching works</p>
            
            <div className="flex justify-center gap-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            </div>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              <span className="font-bold">Monitor physical progress</span>, adherence, and client evolution with more clarity.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center items-center h-[700px] gradient-bg-planning rounded-3xl overflow-hidden w-full max-w-[1104px] mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          >
            {/* Mac Browser Mockup Placeholder for Video */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/20 w-full max-w-5xl aspect-video overflow-hidden relative z-10 mx-4 flex flex-col">
              <div className="bg-white/50 border-b border-gray-100/20 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/50 rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-2 w-1/3">
                  nutrifit.pro/tracking
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-50/10">
                <Play className="w-12 h-12 text-black/10" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Proactive Follow-Up Section */}
        <section className="max-w-6xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-[72px] md:leading-[92px] font-medium mb-2">NutriFit is for <br /> Proactive Follow-Up</h2>
            <p className="text-gray-500 mb-12">Retention through smart alerts</p>
            
            <div className="flex justify-center gap-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            </div>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              <span className="font-bold">Spot missed check-ins</span>, inactivity, and risk signals early — before clients disengage.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center items-center h-[700px] gradient-bg-shopping rounded-3xl overflow-hidden w-full max-w-[1104px] mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          >
            {/* Mac Browser Mockup Placeholder for Video */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/20 w-full max-w-5xl aspect-video overflow-hidden relative z-10 mx-4 flex flex-col">
              <div className="bg-white/50 border-b border-gray-100/20 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/50 rounded-lg px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-2 w-1/3">
                  nutrifit.pro/alerts
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-50/10">
                <Play className="w-12 h-12 text-black/10" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="py-40 text-center px-4">
          <motion.h2 {...fadeIn} className="text-4xl md:text-[72px] md:leading-[92px] font-medium mb-10 text-black">
            Run your coaching business <br /> without the chaos
          </motion.h2>
          
          <motion.div {...fadeIn} className="flex flex-col items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm text-black">
              <span className="text-gray-500 mr-2">Join 5,000+ elite coaches</span>
              <button 
                onClick={onGetStarted}
                className="bg-black text-white px-4 py-1.5 rounded-full font-medium text-xs hover:bg-gray-800 transition-colors cursor-pointer border-none"
              >
                Start Free Trial
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-8">
              No credit card required. <a href="#" className="underline font-medium text-black">View Pricing Plans →</a>
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">NutriFit v4.0 is in</span>
              <span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-black">Stable Release</span>
            </div>
            <p className="text-[11px] text-gray-400">HIPAA compliant and GDPR ready. Secure data for every client.</p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-32 pb-16 relative overflow-hidden bg-white text-black">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-400">Designed and Built for Professionals</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-6 font-black font-sans">NutriFit Systems Inc.</p>
            <div className="flex gap-6 text-gray-900">
              <X className="w-4 h-4 cursor-pointer hover:text-gray-500 transition-colors" />
              <Instagram className="w-4 h-4 cursor-pointer hover:text-gray-500 transition-colors" />
              <Linkedin className="w-4 h-4 cursor-pointer hover:text-gray-500 transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-gray-100 pt-8">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Careers</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
            </div>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">
                Platform Status: <span className="text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> All Systems Go</span>
              </span>
              <span>v4.0.2</span>
            </div>
          </div>
        </div>
        
        {/* Color Spectrum at Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 spectrum-footer blur-3xl opacity-50 pointer-events-none"></div>
      </footer>
        </>
      ) : (
        <Pricing />
      )}
    </div>
  );
}
