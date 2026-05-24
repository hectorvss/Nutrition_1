import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import {
  ArrowLeft,
  MessageSquare,
  Edit,
  Copy,
  Key,
  User,
  Calendar,
  Dumbbell,
  ChevronRight,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useCalendar } from '../context/CalendarContext';
import { useLanguage } from '../context/LanguageContext';

import InformationTab from './client/InformationTab';
import NutritionTab from './client/NutritionTab';
import TrainingTab from './client/TrainingTab';
import PlanningTab from './client/PlanningTab';
import MindsetTab from './client/MindsetTab';
import InsightsTab from './client/InsightsTab';
import DeleteClientModal from './client/DeleteClientModal';
import PasswordResetModal from './client/PasswordResetModal';
import EditProfileModal from './client/EditProfileModal';
import { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonText } from '../components/ui/Skeleton';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

type Tab = 'Information' | 'Nutrition' | 'Training' | 'Planning' | 'Mindset';

export default function ClientDetail({ clientId, onBack, onNavigate }: ClientDetailProps) {
  const { t, language } = useLanguage();
  const { clients, deleteClient, reloadClients } = useClient();
  const { events: calendarEvents } = useCalendar();

  const [activeTab, setActiveTab] = useState<Tab>('Information');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // ─── Delete modal state ──────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [accessExpiration, setAccessExpiration] = useState('');
  const [savingExpiration, setSavingExpiration] = useState(false);

  // ─── Password reveal / reset state ───────────────────────────────────────
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPasswordResetConfirm, setShowPasswordResetConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ─── Edit profile modal state ────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', gender: '', age: '', goal: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setStatsError(null);
      try {
        const data = await fetchWithAuth(`/manager/clients/${clientId}/profile-stats`);
        setStats(data);
        if (data?.accessExpiration) {
          setAccessExpiration(String(data.accessExpiration).split('T')[0]);
        }
      } catch (error) {
        console.error('Error fetching client stats:', error);
        setStatsError(t('error_loading_data'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [clientId]);

  const handleConfirmDelete = async () => {
    if (!client || deleteConfirmText !== client.name) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClient(String(clientId));
      onBack();
    } catch {
      setDeleteError(t('delete_client_error'));
      setIsDeleting(false);
    }
  };

  const handleSaveExpiration = async (value: string) => {
    setSavingExpiration(true);
    try {
      await fetchWithAuth(`/manager/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ access_expiration: value || null })
      });
    } catch (error) {
      console.error('Error saving access expiration:', error);
    } finally {
      setSavingExpiration(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    setEditError(null);
    try {
      await fetchWithAuth(`/manager/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: editForm.full_name,
          phone: editForm.phone,
          gender: editForm.gender,
          age: editForm.age,
          goal: editForm.goal,
        }),
      });
      await reloadClients();
      setShowEditModal(false);
    } catch (e: any) {
      setEditError(e?.message || t('server_error', { defaultValue: 'Server error' }));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    setPasswordError(null);
    try {
      const resp = await fetchWithAuth(`/manager/clients/${clientId}/reset-password`, { method: 'POST' });
      if (resp?.password) {
        setRevealedPassword(resp.password);
        setShowPasswordResetConfirm(false);
      } else {
        setPasswordError(t('server_error', { defaultValue: 'Server error' }));
      }
    } catch (e: any) {
      setPasswordError(e?.message || t('server_error', { defaultValue: 'Server error' }));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUpdateWorkoutLog = async (logId: string, updatedData: any) => {
    try {
      await fetchWithAuth(`/manager/clients/${clientId}/workout-logs/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedData)
      });
      // Refresh stats to show updated volume/PRs
      const data = await fetchWithAuth(`/manager/clients/${clientId}/profile-stats`);
      setStats(data);
    } catch (error) {
      console.error('Error updating workout log:', error);
    }
  };

  // Find the exact client object, or fallback if something went wrong
  const client = clients.find(c => c.id === clientId as any) || {
    name: t('unknown_client'),
    avatar: '',
    weight: '--',
    goal: '--',
    age: '--',
    location: '--',
    gender: '--',
    status: 'Active',
    progress: 0
  };

  const onboardingAnswers = (stats as any)?.onboardingAnswers || {};
  const displayGender = onboardingAnswers.genero || onboardingAnswers.gender || (client as any).gender || t('unknown');
  const displayAge = onboardingAnswers.edad || onboardingAnswers.age || (client as any).age || '--';
  const displayLocation = onboardingAnswers.localizacion || onboardingAnswers.location || (client as any).location || t('unknown');
  const displayPlan = (client as any).planFamilyLabel || (client as any).plan || t('no_plan');
  const joinDate = (client as any).created_at ? new Date((client as any).created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

  return (
    <>
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            <button onClick={onBack} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              {t('clients')}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-bold">{client.name}</span>
          </div>

          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-cover bg-center ring-4 ring-emerald-50 dark:ring-emerald-900/20 shadow-sm" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{client.name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    client.status === 'Archived'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      : client.status === 'Pending'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                  }`}>
                    {client.status === 'Archived' ? t('archived') : client.status === 'Pending' ? t('pending') : t('active')}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium uppercase tracking-tight text-[10px] font-black">
                  {displayGender}, {displayAge} years • {displayLocation}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{displayPlan}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('joined')} {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-auto gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate?.('messages', { clientId })}
                  className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('message', { defaultValue: 'Message' })}
                </button>
                <button
                  onClick={() => {
                    setEditForm({
                      full_name: client.name && client.name !== t('unknown_client') ? client.name : '',
                      phone: (client as any).phone || (client as any).phone_number || '',
                      gender: (client as any).gender && (client as any).gender !== '--' ? (client as any).gender : '',
                      age: (client as any).age && (client as any).age !== '--' ? String((client as any).age) : '',
                      goal: (client as any).goal && (client as any).goal !== '--' ? (client as any).goal : '',
                    });
                    setEditError(null);
                    setShowEditModal(true);
                  }}
                  className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm font-bold"
                >
                  <Edit className="w-4 h-4" />
                  {t('edit_profile')}
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <div
                  onClick={() => (client as any).email && navigator.clipboard.writeText((client as any).email)}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                  title={t('copy_email')}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{(client as any).email || t('no_email')}</span>
                  </div>
                  <Copy className="w-3 h-3 text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                      {revealedPassword || '••••••••'}
                    </span>
                  </div>
                  {revealedPassword ? (
                    <button
                      onClick={() => navigator.clipboard.writeText(revealedPassword)}
                      title={t('copy_password')}
                      className="text-slate-300 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setPasswordError(null); setShowPasswordResetConfirm(true); }}
                      title={t('reset_password', { defaultValue: 'Reset password' })}
                      className="text-slate-300 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-hide">
            {(['Information', 'Nutrition', 'Training', 'Planning', 'Mindset'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 text-sm font-bold transition-all relative ${
                  activeTab === tab
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'Information' && t('information')}
                {tab === 'Nutrition' && t('nutrition')}
                {tab === 'Training' && t('training')}
                {tab === 'Planning' && t('planning')}
                {tab === 'Mindset' && t('mindset')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {statsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{statsError}</span>
            </div>
          )}

          {activeTab === 'Information' && (
            <InformationTab clientId={clientId} t={t} />
          )}
          {/* While profile-stats is loading, the Nutrition/Training/Mindset
              tabs would internally show a full-content spinner that hides the
              tab bar layout. Render a layout-matching skeleton instead so the
              tabs stay visible and the page does not jump. */}
          {activeTab === 'Nutrition' && (
            isLoading ? (
              <div className="space-y-6" aria-hidden="true">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <SkeletonCircle size={40} />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                    <Skeleton className="h-5 w-48" />
                    <SkeletonBlock height={260} />
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <SkeletonText lines={4} />
                  </div>
                </div>
              </div>
            ) : (
              <NutritionTab stats={stats} isLoading={isLoading} t={t} />
            )
          )}
          {activeTab === 'Training' && (
            isLoading ? (
              <div className="space-y-6" aria-hidden="true">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                      <SkeletonCircle size={40} />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                  <Skeleton className="h-5 w-56" />
                  <SkeletonBlock height={260} />
                </div>
              </div>
            ) : (
              <TrainingTab
                stats={stats}
                isLoading={isLoading}
                t={t}
                clientId={clientId}
                onUpdateWorkoutLog={handleUpdateWorkoutLog}
              />
            )
          )}
          {activeTab === 'Planning' && (
            <PlanningTab clientId={clientId} t={t} onNavigate={onNavigate} />
          )}
          {activeTab === 'Mindset' && (
            isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <SkeletonBlock height={64} />
                  </div>
                ))}
              </div>
            ) : (
              <MindsetTab stats={stats} t={t} />
            )
          )}

          {/* Global Insights Section */}
          <InsightsTab
            clientId={clientId}
            calendarEvents={calendarEvents}
            language={language}
            stats={stats}
            t={t}
            accessExpiration={accessExpiration}
            savingExpiration={savingExpiration}
            setAccessExpiration={setAccessExpiration}
            onSaveExpiration={handleSaveExpiration}
            onShowDeleteModal={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
          />
        </div>
      </div>
    </div>

    <DeleteClientModal
      show={showDeleteModal}
      clientName={client.name}
      confirmText={deleteConfirmText}
      setConfirmText={setDeleteConfirmText}
      isDeleting={isDeleting}
      error={deleteError}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleConfirmDelete}
      t={t}
    />

    <PasswordResetModal
      show={showPasswordResetConfirm}
      isResetting={isResettingPassword}
      error={passwordError}
      onClose={() => setShowPasswordResetConfirm(false)}
      onConfirm={handleResetPassword}
      t={t}
    />

    <EditProfileModal
      show={showEditModal}
      form={editForm}
      setForm={setEditForm}
      isSaving={isSavingEdit}
      error={editError}
      onClose={() => setShowEditModal(false)}
      onSave={handleSaveEdit}
      t={t}
    />
    </>
  );
}
