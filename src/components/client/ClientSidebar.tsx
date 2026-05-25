import React, { useState, useEffect } from 'react';
import { ClientView } from '../../ClientApp';
import { fetchWithAuth } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

interface ClientSidebarProps {
  currentView: ClientView;
  onNavigate: (view: ClientView) => void;
  isOpen: boolean;
  onClose: () => void;
  showOnboardingReminder?: boolean;
  onOpenOnboarding?: () => void;
}

// Persisted desktop collapse state — same pattern as the manager sidebar so
// the client app's layout doesn't surprise the user across reloads.
const COLLAPSE_KEY = 'client-sidebar:collapsed';

export default function ClientSidebar({ currentView, onNavigate, isOpen, onClose, showOnboardingReminder, onOpenOnboarding }: ClientSidebarProps) {
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
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

  const navItems = [
    { id: 'dashboard', label: t('today'), icon: 'calendar_today' },
    { id: 'check-ins', label: t('checkins'), icon: 'how_to_reg' },
    { id: 'messages', label: t('messages'), icon: 'chat_bubble' },
    { id: 'nutrition', label: t('nutrition'), icon: 'restaurant' },
    { id: 'training', label: t('training'), icon: 'fitness_center' },
    { id: 'roadmap', label: t('roadmap'), icon: 'map' },
    { id: 'progress', label: t('progress'), icon: 'trending_up' },
  ];

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const data = await fetchWithAuth(`/messages/unread-count?t=${new Date().getTime()}`);
        if (mounted) setUnreadCount(data?.unreadCount || 0);
      } catch (e) { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [user]);

  const renderSidebar = (expanded: boolean, mobile: boolean) => (
    <aside
      className={`flex flex-col bg-white dark:bg-[#112116] border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-[width] duration-300 ease-in-out ${
        expanded ? 'w-64' : 'w-20'
      } ${mobile ? 'h-full' : 'h-screen'}`}
    >
      <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800 shrink-0 ${expanded ? 'px-4' : 'justify-center px-0'}`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54] shrink-0">
                <span className="material-symbols-outlined font-bold">spa</span>
              </div>
            </div>
            {mobile ? (
              <button onClick={onClose} className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={toggleCollapsed}
                title={isEs ? 'Contraer menú' : 'Collapse menu'}
                className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={toggleCollapsed}
            title={isEs ? 'Expandir menú' : 'Expand menu'}
            className="group relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[#17cf54] group-hover:opacity-0 transition-opacity">
              <span className="material-symbols-outlined font-bold">spa</span>
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <PanelLeftOpen className="w-5 h-5" />
            </span>
          </button>
        )}
      </div>

      <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide ${expanded ? 'px-4 space-y-1' : 'px-2 space-y-1'}`}>
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id as ClientView); if (mobile) onClose(); }}
              title={!expanded ? item.label : undefined}
              className={`relative flex items-center rounded-xl transition-colors ${
                expanded ? 'gap-3 px-4 py-3 w-full' : 'justify-center w-10 h-10 mx-auto'
              } ${active
                ? 'bg-[#17cf54]/10 text-[#17cf54] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="relative shrink-0">
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.id === 'messages' && unreadCount > 0 && !expanded && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#17cf54] ring-2 ring-white dark:ring-[#112116]" />
                )}
              </div>
              {expanded && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#17cf54] text-white text-[10px] font-bold shadow-md shadow-[#17cf54]/30">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-slate-200 dark:border-slate-800 ${expanded ? 'p-4 space-y-1' : 'p-2 space-y-1'}`}>
        {showOnboardingReminder && onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            title={!expanded ? t('complete_setup') : undefined}
            className={`relative flex items-center rounded-xl transition-colors bg-[#17cf54]/10 text-[#17cf54] font-semibold hover:bg-[#17cf54]/20 ${
              expanded ? 'gap-3 px-4 py-3 w-full' : 'justify-center w-10 h-10 mx-auto'
            }`}
          >
            <span className="material-symbols-outlined shrink-0">assignment</span>
            {expanded && (
              <>
                <span className="flex-1 text-left truncate">{t('complete_setup')}</span>
                <span className="w-2 h-2 rounded-full bg-[#17cf54] animate-pulse" />
              </>
            )}
          </button>
        )}
        <button
          onClick={() => { onNavigate('settings'); if (mobile) onClose(); }}
          title={!expanded ? t('settings') : undefined}
          className={`relative flex items-center rounded-xl transition-colors ${
            expanded ? 'gap-3 px-4 py-3 w-full' : 'justify-center w-10 h-10 mx-auto'
          } ${currentView === 'settings'
            ? 'bg-[#17cf54]/10 text-[#17cf54] font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined shrink-0">settings</span>
          {expanded && <span className="flex-1 text-left truncate">{t('settings')}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — flex item that animates its width on collapse/expand */}
      <div className="hidden lg:block sticky top-0 shrink-0 z-40">
        {renderSidebar(!collapsed, false)}
      </div>

      {/* Mobile overlay — always expanded */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 shadow-2xl">
            {renderSidebar(true, true)}
          </div>
        </div>
      )}
    </>
  );
}
