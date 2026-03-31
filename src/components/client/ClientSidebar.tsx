import React, { useState, useEffect } from 'react';
import { ClientView } from '../../ClientApp';
import { fetchWithAuth } from '../../api';

interface ClientSidebarProps {
  currentView: ClientView;
  onNavigate: (view: ClientView) => void;
  isOpen: boolean;
  onClose: () => void;
  showOnboardingReminder?: boolean;
  onOpenOnboarding?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Today', icon: 'calendar_today' },
  { id: 'check-ins', label: 'Check-ins', icon: 'how_to_reg' },
  { id: 'messages', label: 'Messages', icon: 'chat_bubble' },
  { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
  { id: 'training', label: 'Training', icon: 'fitness_center' },
  { id: 'roadmap', label: 'Roadmap', icon: 'map' },
  { id: 'progress', label: 'Progress', icon: 'trending_up' },
];

export default function ClientSidebar({ currentView, onNavigate, isOpen, onClose, showOnboardingReminder, onOpenOnboarding }: ClientSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await fetchWithAuth(`/messages/unread-count?t=${new Date().getTime()}`);
        setUnreadCount(data?.unreadCount || 0);
      } catch (e) {
        // ignore silently
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#112116] border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#17cf54]/10 flex items-center justify-center text-[#17cf54]">
              <span className="material-symbols-outlined font-bold">spa</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Lumina</span>
          </div>
          <button 
            className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>


        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ClientView)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#17cf54]/10 text-[#17cf54] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'messages' && unreadCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#17cf54] text-white text-[10px] font-bold shadow-md shadow-[#17cf54]/30">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              currentView === 'settings'
                ? 'bg-[#17cf54]/10 text-[#17cf54] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
