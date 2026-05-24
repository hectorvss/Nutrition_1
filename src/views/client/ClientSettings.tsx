import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchWithAuth } from '../../api';
import EditProfileModal from './EditProfileModal';

/**
 * Client-facing settings page. Intentionally minimal — the manager-side
 * Settings screen (1.7k LOC) calls /manager/* everywhere and 403s for clients,
 * so the client portal renders this stripped-down version instead. Only
 * exposes preferences a client should be able to touch: profile basics,
 * language, dark mode, change password, log out.
 */
export default function ClientSettings() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', gender: '', age: '', goal: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Theme — kept entirely local for clients (no /manager/settings round trip).
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark')
      || localStorage.getItem('client_dark_mode') === '1';
  });

  // Password change state
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchWithAuth('/client/profile');
        if (!mounted) return;
        setProfile(data);
        setEditForm({
          full_name: data?.full_name || '',
          phone: data?.phone || '',
          gender: data?.gender || '',
          age: data?.age ? String(data.age) : '',
          goal: data?.goal || '',
        });
      } catch (err) {
        console.error('client settings: load profile failed', err);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('client_dark_mode', darkMode ? '1' : '0'); } catch { /* SSR-safe */ }
  }, [darkMode]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const payload: any = {
        full_name: editForm.full_name,
        phone: editForm.phone,
        gender: editForm.gender,
        goal: editForm.goal,
      };
      if (editForm.age) {
        const n = parseInt(editForm.age, 10);
        if (!Number.isNaN(n)) payload.age = n;
      }
      const updated = await fetchWithAuth('/client/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setProfile((p: any) => ({ ...(p || {}), ...updated }));
      setShowEdit(false);
    } catch (err: any) {
      setProfileError(err?.message || t('error_loading_data'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!pwNew || pwNew.length < 8) {
      setPwMsg({ kind: 'err', text: t('password_min_length', { defaultValue: 'La contraseña debe tener al menos 8 caracteres.' }) });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ kind: 'err', text: t('password_mismatch', { defaultValue: 'Las contraseñas no coinciden.' }) });
      return;
    }
    setPwSaving(true);
    try {
      await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pwOld, newPassword: pwNew }),
      });
      setPwMsg({ kind: 'ok', text: t('password_changed', { defaultValue: 'Contraseña actualizada.' }) });
      setPwOld(''); setPwNew(''); setPwConfirm('');
    } catch (err: any) {
      setPwMsg({ kind: 'err', text: err?.message || t('error_loading_data') });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
      </header>

      {/* Profile */}
      <section className="bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 dark:text-white">{t('edit_profile', { defaultValue: 'Perfil' })}</h2>
          <button
            onClick={() => setShowEdit(true)}
            disabled={profileLoading}
            className="text-sm font-semibold text-[#17cf54] hover:underline disabled:opacity-50"
          >
            {t('edit')}
          </button>
        </div>
        {profileLoading ? (
          <div className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Row label={t('full_name', { defaultValue: 'Nombre completo' })} value={profile?.full_name} />
            <Row label={t('phone', { defaultValue: 'Teléfono' })} value={profile?.phone} />
            <Row label={t('gender', { defaultValue: 'Género' })} value={profile?.gender} />
            <Row label={t('age', { defaultValue: 'Edad' })} value={profile?.age} />
            <Row label={t('goal', { defaultValue: 'Objetivo' })} value={profile?.goal} />
            <Row label={t('weight', { defaultValue: 'Peso' })} value={profile?.weight ? `${profile.weight} kg` : null} />
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">{t('preferences', { defaultValue: 'Preferencias' })}</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('language', { defaultValue: 'Idioma' })}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('language_desc', { defaultValue: 'Idioma de la interfaz.' })}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${language === 'es' ? 'bg-[#17cf54] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >ES</button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${language === 'en' ? 'bg-[#17cf54] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >EN</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('dark_mode', { defaultValue: 'Modo oscuro' })}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dark_mode_desc', { defaultValue: 'Cambia entre tema claro y oscuro.' })}</p>
          </div>
          <button
            onClick={() => setDarkMode(d => !d)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-[#17cf54]' : 'bg-slate-300 dark:bg-slate-700'}`}
            aria-pressed={darkMode}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </section>

      {/* Change password */}
      <section className="bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-white">{t('change_password', { defaultValue: 'Cambiar contraseña' })}</h2>
        <input
          type="password"
          value={pwOld}
          onChange={(e) => setPwOld(e.target.value)}
          placeholder={t('current_password', { defaultValue: 'Contraseña actual' })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
        />
        <input
          type="password"
          value={pwNew}
          onChange={(e) => setPwNew(e.target.value)}
          placeholder={t('new_password', { defaultValue: 'Nueva contraseña' })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
        />
        <input
          type="password"
          value={pwConfirm}
          onChange={(e) => setPwConfirm(e.target.value)}
          placeholder={t('confirm_password', { defaultValue: 'Confirmar nueva contraseña' })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
        />
        {pwMsg && (
          <p className={`text-xs font-semibold ${pwMsg.kind === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{pwMsg.text}</p>
        )}
        <button
          onClick={handleChangePassword}
          disabled={pwSaving || !pwOld || !pwNew}
          className="px-4 py-2 rounded-lg bg-[#17cf54] hover:bg-[#15b84a] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {pwSaving ? t('saving') : t('change_password', { defaultValue: 'Cambiar contraseña' })}
        </button>
      </section>

      {/* Session */}
      <section className="bg-white dark:bg-[#112116] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">{t('session', { defaultValue: 'Sesión' })}</h2>
        <button
          onClick={logout}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          {t('logout', { defaultValue: 'Cerrar sesión' })}
        </button>
      </section>

      <EditProfileModal
        show={showEdit}
        form={editForm}
        setForm={setEditForm}
        isSaving={savingProfile}
        error={profileError}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveProfile}
        t={t}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm text-slate-900 dark:text-white mt-0.5 truncate">
        {value || <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}
