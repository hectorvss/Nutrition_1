import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api';
import { ArrowLeft, Mail, Lock, Loader2, ChevronRight, ShieldCheck, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';

export default function Login({ onBackToLanding, initialMode }: { onBackToLanding?: () => void; initialMode?: 'login' | 'signup' }) {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA challenge step (shown after password when the account has MFA enabled).
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const { login } = useAuth();
  const isSuccessMessage = error === t('login_reset_email_sent', { defaultValue: 'Si el email existe, recibirás un enlace para restablecer la contraseña.' });

  // Showcase del panel derecho: alterna capturas reales del SaaS — la pantalla
  // de asignar un plan de nutrición y la de asignar un plan de entrenamiento a
  // los clientes — con un cross-fade cada 5s. La captura se sirve en el idioma
  // actual de la interfaz (ES/EN).
  const lang = language === 'en' ? 'en' : 'es';
  const isEs = lang === 'es';
  // Capturas PROFUNDAS y características del SaaS (no las listas de nivel
  // superior): el plan de comidas montado, el plan de entreno por días, la
  // ficha 360º del cliente, la analítica de negocio y el editor visual de
  // automatizaciones. Servidas en el idioma actual.
  const showcase = [
    { src: `/landing/deep-nutrition-plan-${lang}.png`, label: isEs ? 'Plan de nutrición' : 'Nutrition plan' },
    { src: `/landing/deep-training-${lang}.png`,       label: isEs ? 'Plan de entrenamiento' : 'Training plan' },
    { src: `/landing/deep-client-${lang}.png`,         label: isEs ? 'Ficha de cliente' : 'Client profile' },
    { src: `/landing/deep-analytics-${lang}.png`,      label: isEs ? 'Analítica' : 'Analytics' },
    { src: `/landing/deep-workflow-${lang}.png`,       label: isEs ? 'Automatizaciones' : 'Automations' },
  ];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % showcase.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Establishes a real supabase-js session in the browser (needed for MFA),
  // then completes login — challenging for a 2FA code first if required.
  const finishAuth = async (accessToken: string, refreshToken: string | undefined, userData: any, allowMfa: boolean) => {
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
    if (allowMfa) {
      try {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
          setPendingUser(userData);
          setMfaRequired(true);
          setLoading(false);
          return;
        }
      } catch { /* no MFA configured — continue */ }
    }
    login(accessToken, userData);
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: factorsData, error: fErr } = await supabase.auth.mfa.listFactors();
      if (fErr) throw fErr;
      const totp = (factorsData?.totp || []).find((f: any) => f.status === 'verified');
      if (!totp) throw new Error(t('mfa_no_factor', { defaultValue: 'No 2FA factor found for this account.' }));
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: ch.id, code: mfaCode.trim() });
      if (vErr) throw vErr;
      const { data: sess } = await supabase.auth.getSession();
      login(sess?.session?.access_token || '', pendingUser);
    } catch (err: any) {
      setError(err.message || t('mfa_invalid_code', { defaultValue: 'Código inválido' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';

      const payload: any = { email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('login_auth_failed'));
      }

      if (isLogin) {
        await finishAuth(data.token, data.refresh_token, data.user, true);
      } else {
        // After successful signup, auto-login the new account (no MFA on a brand-new account).
        if (data.token && data.user && data.refresh_token) {
          await finishAuth(data.token, data.refresh_token, data.user, false);
        } else {
          // Backend did not return a session: log in with the same credentials.
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginResponse.json();
          if (!loginResponse.ok) {
            throw new Error(loginData.error || t('login_auth_failed'));
          }
          await finishAuth(loginData.token, loginData.refresh_token, loginData.user, false);
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('login_enter_email', { defaultValue: 'Introduce tu email primero.' }));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('login_auth_failed'));
      }
      setError(t('login_reset_email_sent', { defaultValue: 'Si el email existe, recibirás un enlace para restablecer la contraseña.' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body text-black flex overflow-hidden relative">
      {onBackToLanding && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBackToLanding}
          className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center cursor-pointer border border-slate-100 z-[100] group"
          title={t('back_to_home')}
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
            {mfaRequired
              ? t('mfa_title', { defaultValue: 'Verificación en dos pasos' })
              : (isLogin ? t('login_welcome') : t('login_create'))}
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            {mfaRequired
              ? t('mfa_subtitle', { defaultValue: 'Introduce el código de 6 dígitos de tu app de autenticación.' })
              : (isLogin ? t('login_subtitle') : t('login_subtitle_signup'))}
          </p>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-2xl mb-6 text-xs font-bold text-center border ${
                  isSuccessMessage
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {mfaRequired ? (
          <form onSubmit={handleVerifyMfa} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                {t('mfa_code_label', { defaultValue: 'Código de verificación' })}
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all text-sm tracking-[0.4em] font-bold"
                  placeholder="000000"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || mfaCode.length < 6}
              className="w-full py-4 bg-black text-white font-bold rounded-full shadow-lg shadow-black/5 hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 group cursor-pointer border-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{t('mfa_verify', { defaultValue: 'Verificar' })}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }}
              className="w-full text-[11px] font-bold text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
            >
              {t('mfa_back', { defaultValue: 'Volver' })}
            </button>
          </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                {t('login_email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                  placeholder={t('email_placeholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {t('login_password')}
                </label>
                {isLogin && (
                  <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50">
                    {t('login_forgot')}
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
                  <span>{isLogin ? t('login_signin') : t('login_signup')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
          )}

          {!mfaRequired && (
          <div className="mt-8 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              {isLogin ? t('login_no_account') : t('login_has_account')}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 font-bold text-black hover:underline cursor-pointer bg-transparent border-none"
              >
                {isLogin ? t('login_join') : t('login_signin_instead')}
              </button>
            </p>
          </div>
          )}
        </motion.div>
        
        {/* Footer info at left bottom */}
        <div className="absolute bottom-8 left-0 w-full text-center lg:text-left lg:px-20 opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Nuly © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right side: la TARJETA COMPLETA (chrome con los 3 puntos + URL y la
          captura embebida dentro) es lo que transiciona como una sola unidad.
          Fondo totalmente blanco; la tarjeta sólo lleva una sombra suave y
          difusa — sin panel de color ni línea dura. */}
      <div className="hidden lg:flex w-[55%] bg-white relative items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={showcase[slide].src}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl aspect-video overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(15,23,42,0.04),0_40px_90px_-25px_rgba(15,23,42,0.22)]"
            >
              <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="mx-auto bg-gray-100/70 rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-medium w-1/2 text-center flex items-center justify-center gap-1.5 truncate">
                  <Search className="w-2.5 h-2.5" />
                  nuly.app/login
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden bg-white">
                <img
                  src={showcase[slide].src}
                  alt={showcase[slide].label}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-slate-700 text-xs font-bold tracking-wide shadow-sm">
                    {showcase[slide].label}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Indicadores de slide (fuera de la tarjeta para que persistan) */}
          <div className="mt-5 flex justify-center gap-1.5">
            {showcase.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? 'w-5 bg-slate-700' : 'w-1.5 bg-slate-300'}`} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
