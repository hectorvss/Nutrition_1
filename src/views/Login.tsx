import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api';
import { ArrowLeft, Mail, Lock, Loader2, ChevronRight, Play } from 'lucide-react';

export default function Login({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/setup';
      
      const payload: any = { email, password };
      if (!isLogin) {
        payload.role = 'MANAGER';
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        setError('Account created successfully. Please log in.');
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body text-black flex overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 z-50" />
      
      {onBackToLanding && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBackToLanding}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center cursor-pointer border border-slate-100 z-[100] group"
          title="Back to home"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-black transition-colors" />
        </motion.button>
      )}
      
      {/* Left side: Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 md:px-20 relative z-10 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Logo */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.reload()}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md mb-12 cursor-pointer border-none"
          />

          <h1 className="text-3xl font-sans font-medium tracking-tight mb-3">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            {isLogin 
              ? 'Enter your credentials to access your dashboard.' 
              : 'Join high-performance coaches and manage your clients smarter.'}
          </p>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-2xl mb-6 text-xs font-bold text-center border ${
                  error.includes('successfully') 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Password
                </label>
                {isLogin && (
                  <button type="button" className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold rounded-full shadow-lg shadow-black/5 hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 group cursor-pointer border-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 font-bold text-black hover:underline cursor-pointer bg-transparent border-none"
              >
                {isLogin ? 'Join NutriDash Pro' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </motion.div>
        
        {/* Footer info at left bottom */}
        <div className="absolute bottom-8 left-0 w-full text-center lg:text-left lg:px-20 opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            NutriFit Systems Inc. © 2024
          </p>
        </div>
      </div>

      {/* Right side: Inset Mac Browser Mockup */}
      <div className="hidden lg:flex w-[55%] bg-white relative items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-white/20"
        >
          <div className="bg-white/10 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-white/10 rounded-xl px-4 py-1.5 text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2 w-1/3">
              nutrifit.pro/login
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Play className="w-8 h-8 text-white/20" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spectrum at very bottom */}
      <div className="absolute bottom-0 left-0 w-full h-40 spectrum-footer blur-3xl opacity-20 pointer-events-none" />
    </div>
  );
}
