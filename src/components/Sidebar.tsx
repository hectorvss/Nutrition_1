import React from 'react';
import { useProfile } from '../context/ProfileContext';

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
  Settings 
} from 'lucide-react';
import { Zap } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps & { isOpen?: boolean, onClose?: () => void }) {
  const { profile } = useProfile();
  const menuGroups = [
    {
      title: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
      ]
    },
    {
      title: 'Automation',
      items: [
        { id: 'automations', label: 'Automations', icon: Zap },
      ]
    },
    {
      title: 'Work',
      items: [
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'check-ins', label: 'Check-ins', icon: ClipboardCheck },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
      ]
    },
    {
      title: 'Programming',
      items: [
        { id: 'planning', label: 'Planning', icon: Zap },
        { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
        { id: 'training', label: 'Training', icon: Dumbbell },
      ]
    },
    {
      title: 'Library',
      items: [
        { id: 'library', label: 'Foods & Recipes', icon: BookOpen },
        { id: 'exercises', label: 'Exercises', icon: Dumbbell },
      ]
    },
    {
      title: 'Insights',
      items: [
        { id: 'onboarding', label: 'Onboarding', icon: ClipboardCheck },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.title}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                    (currentView === item.id || 
                     (item.id === 'calendar' && ['create-task'].includes(currentView)) ||
                     (item.id === 'training' && ['assign-program', 'workout-editor', 'exercise-edit'].includes(currentView)) ||
                     (item.id === 'exercises' && ['exercise-create'].includes(currentView)))
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${
                    (currentView === item.id || 
                     (item.id === 'calendar' && ['create-task'].includes(currentView)) ||
                     (item.id === 'training' && ['assign-program', 'workout-editor', 'exercise-edit'].includes(currentView)) ||
                     (item.id === 'exercises' && ['exercise-create'].includes(currentView)))
                     ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
                  }`} />
                  <span className={`text-sm ${currentView === item.id ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
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
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
