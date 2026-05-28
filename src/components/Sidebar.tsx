import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';

import {
  LayoutDashboard,
  CheckCircle2,
  Calendar as CalendarIcon,
  Users,
  ClipboardCheck,
  MessageSquare,
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  BarChart3,
  Settings,
  ShieldCheck,
  ArrowUpCircle,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Zap } from 'lucide-react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

// Persisted desktop collapse state — keeps the sidebar in the same state
// across reloads so the layout never surprises the user.
const COLLAPSE_KEY = 'sidebar:collapsed';

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps & { isOpen?: boolean, onClose?: () => void }) {
  const { profile } = useProfile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const [unreadCount, setUnreadCount] = useState(0);

  // Desktop collapse is a deliberate click toggle (like the CRM-AI sidebar),
  // NOT hover — hover-expand made the layout jump every time the cursor
  // crossed the rail. As a real flex item the sidebar pushes the content and
  // animates its width, so collapsing/expanding is smooth and predictable.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const data = await fetchWithAuth(`/messages/unread-count?t=${new Date().getTime()}`);
        if (data && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      } catch (e) {
        console.error('[Sidebar] Error fetching unread count:', e);
      }
    };
    fetchUnread();
    // Pausa el polling cuando la pestana esta oculta y refresca al volver.
    const tick = () => { if (!document.hidden) fetchUnread(); };
    const interval = setInterval(tick, 15000);
    const onVisible = () => { if (!document.hidden) fetchUnread(); };

    // Listen for manual updates (when marking as read)
    window.addEventListener('updateUnreadCount', fetchUnread);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('updateUnreadCount', fetchUnread);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  const menuGroups = [
    {
      title: t('sidebar_core'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'tasks', label: t('tasks'), icon: CheckCircle2 },
        { id: 'calendar', label: t('calendar'), icon: CalendarIcon },
      ]
    },
    {
      title: t('sidebar_automation'),
      items: [
        { id: 'automations', label: t('automations'), icon: Zap },
      ]
    },
    {
      title: t('sidebar_work'),
      items: [
        { id: 'clients', label: t('clients'), icon: Users },
        { id: 'check-ins', label: t('checkins'), icon: ClipboardCheck },
        { id: 'onboarding', label: t('onboarding'), icon: ShieldCheck },
        { id: 'messages', label: t('messages'), icon: MessageSquare },
        { id: 'client-billing', label: t('client_billing', { defaultValue: 'Cobros' }), icon: CreditCard },
      ]
    },
    {
      title: t('sidebar_programming'),
      items: [
        { id: 'planning', label: t('planning'), icon: Zap },
        { id: 'nutrition', label: t('nutrition'), icon: UtensilsCrossed },
        { id: 'training', label: t('training'), icon: Dumbbell },
      ]
    },
    {
      title: t('sidebar_library'),
      items: [
        { id: 'library', label: t('foods'), icon: BookOpen },
        { id: 'exercises', label: t('exercises'), icon: Dumbbell },
      ]
    },
    {
      title: t('sidebar_insights'),
      items: [
        { id: 'analytics', label: t('analytics'), icon: BarChart3 },
        { id: 'subscriptions', label: t('upgrade_plan', { defaultValue: 'Mejorar plan' }), icon: ArrowUpCircle },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  // ¿Esta `item.id` activo? Algunas vistas hijas se cuentan como su padre.
  const isActive = (id: string) =>
    currentView === id ||
    (id === 'planning' && ['planning-detail'].includes(currentView)) ||
    (id === 'calendar' && ['create-task'].includes(currentView)) ||
    (id === 'training' && ['assign-program', 'workout-editor', 'exercise-edit'].includes(currentView)) ||
    (id === 'exercises' && ['exercise-create'].includes(currentView)) ||
    (id === 'subscriptions' && ['subscriptions'].includes(currentView));

  /**
   * Cuerpo del sidebar. `expanded` decide ancho + visibilidad de labels.
   * - `mobile`  → overlay movil: siempre expandido, con boton de cerrar.
   * - desktop   → expanded = !collapsed, con boton de plegar/desplegar.
   * El contenedor es un flex item normal (no overlay) que anima su ancho:
   * el contenido principal se reajusta de forma fluida, sin saltos.
   */
  const renderSidebar = (expanded: boolean, mobile: boolean) => (
    <div
      className={`flex flex-col bg-white border-r border-slate-200 overflow-hidden transition-[width] duration-300 ease-in-out ${
        expanded ? 'w-64' : 'w-20'
      } ${mobile ? 'h-full' : 'h-screen'}`}
    >
      {/* Header: avatar + (nombre si expandido) + boton toggle */}
      <div className={`h-16 flex items-center border-b border-slate-100 shrink-0 ${expanded ? 'px-4' : 'justify-center px-0'}`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="rounded-full h-10 w-10 border border-emerald-500/30 bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: profile?.avatar_url
                    ? `url("${profile.avatar_url}")`
                    : 'url("https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop")'
                }}
              />
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-slate-900 text-sm font-bold truncate">
                  {profile?.full_name || 'Nutritionist'}
                </h1>
                <p className="text-slate-500 text-xs truncate">
                  {profile?.professional_title || 'Expert Coach'}
                </p>
              </div>
            </div>
            {mobile ? (
              onClose && (
                <button
                  onClick={onClose}
                  className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )
            ) : (
              <button
                onClick={toggleCollapsed}
                title={isEs ? 'Contraer menú' : 'Collapse menu'}
                className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          // Colapsado (solo desktop): el avatar es el propio boton de expandir.
          <button
            onClick={toggleCollapsed}
            title={isEs ? 'Expandir menú' : 'Expand menu'}
            className="group relative w-10 h-10 flex items-center justify-center"
          >
            <div
              className="rounded-full h-10 w-10 border border-emerald-500/30 bg-cover bg-center group-hover:opacity-0 transition-opacity"
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url("${profile.avatar_url}")`
                  : 'url("https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop")'
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 group-hover:bg-slate-100 transition-all">
              <PanelLeftOpen className="w-5 h-5" />
            </span>
          </button>
        )}
      </div>

      <nav className={`flex-1 py-4 flex flex-col gap-5 overflow-y-auto overflow-x-hidden scrollbar-hide ${expanded ? 'px-3' : 'px-2'}`}>
        {menuGroups.map((group) => (
          <div key={group.title}>
            {expanded ? (
              <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {group.title}
              </h3>
            ) : (
              // Colapsado: un separador fino en lugar del titulo de grupo.
              <div className="mx-2 mb-2 h-px bg-slate-100" />
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onClose) onClose();
                    }}
                    title={!expanded ? item.label : undefined}
                    className={`relative flex items-center rounded-lg transition-colors group ${
                      expanded ? 'gap-3 px-3 py-2 w-full justify-start' : 'justify-center w-10 h-10 mx-auto'
                    } ${active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="relative shrink-0">
                      <item.icon className={`w-[18px] h-[18px] ${
                        active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
                      }`} />
                      {/* Badge de no-leidos: en modo colapsado se muestra como
                          un punto pequeno sobre el icono de mensajes. */}
                      {item.id === 'messages' && unreadCount > 0 && !expanded && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-white" />
                      )}
                    </div>
                    {expanded && (
                      <>
                        <span className={`text-sm flex-1 text-left truncate ${active ? 'font-bold' : 'font-medium'}`}>
                          {item.label}
                        </span>
                        {item.id === 'messages' && unreadCount > 0 && (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold shadow-lg shadow-emerald-500/40 animate-in zoom-in-50 duration-300">
                            {unreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — flex item real del layout: empuja el contenido y
          anima su ancho al plegar/desplegar (sin saltos). El estado de
          colapso se controla con click y se persiste en localStorage. */}
      <div className="hidden lg:block sticky top-0 shrink-0 z-40">
        {renderSidebar(!collapsed, false)}
      </div>

      {/* Mobile Sidebar Overlay — siempre expandido */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 shadow-2xl"
            >
              {renderSidebar(true, true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
