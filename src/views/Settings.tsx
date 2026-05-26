import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { 
  User, 
  Lock, 
  CreditCard, 
  Share2, 
  Palette, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  BadgeCheck,
  Smartphone,
  Monitor,
  Laptop,
  LogOut,
  Download,
  Plus,
  Heart,
  Eye,
  EyeOff,
  ShieldCheck,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Type,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useIntegrations } from '../context/IntegrationsContext';
import { useBilling } from '../context/BillingContext';
import { Globe, X, Bell } from 'lucide-react';
import { supabase } from '../supabase';
import { enablePush, disablePush, isPushEnabled, pushSupported } from '../push';
import AppearanceSettings from './settings/AppearanceSettings';

type SettingsTab = 'general' | 'profile' | 'security' | 'billing' | 'integrations' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { t } = useLanguage();
  const { logout, user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  // Filter tabs by role. Manager-only panels (profile editor, billing,
  // integrations, security/2FA/sessions) all hit /manager/* endpoints and
  // 403 for clients; hide them instead of letting the client land on a
  // broken screen. Clients keep the panels that genuinely apply to them:
  // language preference and appearance (dark mode, theme color).
  const allTabs = [
    { id: 'general', label: t('general'), icon: Smartphone, clientSafe: true },
    { id: 'profile', label: t('profile_details'), icon: User, clientSafe: false },
    { id: 'security', label: t('security'), icon: Lock, clientSafe: false },
    { id: 'billing', label: t('billing'), icon: CreditCard, clientSafe: false },
    { id: 'integrations', label: t('integrations'), icon: Share2, clientSafe: false },
    { id: 'appearance', label: t('appearance'), icon: Palette, clientSafe: true },
  ];
  const tabs = isClient ? allTabs.filter(t => t.clientSafe) : allTabs;

  // Defensive: if a deep-link or stale state lands us on a manager-only tab
  // while logged in as a client, snap back to General.
  useEffect(() => {
    if (isClient && !tabs.some(t => t.id === activeTab)) setActiveTab('general');
  }, [isClient, activeTab, tabs]);

  const renderTabContent = () => {
    // Belt and braces — never instantiate manager-only panels for clients.
    if (isClient && activeTab !== 'general' && activeTab !== 'appearance') {
      return <GeneralSettings />;
    }
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('settings_header')}</h1>
        <p className="text-slate-500 text-sm">{t('settings_desc')}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm border border-slate-200 text-emerald-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('sign_out')}
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('language_region')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('configure_language_format', { defaultValue: 'Configure your preferred language and regional formats.' })}</p>
          </div>
          <Smartphone className="w-10 h-10 text-slate-200" />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">{t('select_language')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  language === 'es'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇪🇸</span>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${language === 'es' ? 'text-emerald-700' : 'text-slate-900'}`}>{t('spanish')}</p>
                    <p className="text-xs text-slate-500">{t('spanish_spain')}</p>
                  </div>
                </div>
                {language === 'es' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${language === 'en' ? 'text-emerald-700' : 'text-slate-900'}`}>{t('english')}</p>
                    <p className="text-xs text-slate-500">{t('english_us_uk')}</p>
                  </div>
                </div>
                {language === 'en' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            {t('language_drives_formats', { defaultValue: 'El idioma seleccionado también determina el formato de fechas y números. La hora se muestra en la zona horaria de tu dispositivo.' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>({
    full_name: '',
    professional_title: '',
    bio: '',
    phone_number: '',
    address: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    avatar_url: '',
    // Extended public-profile fields surfaced to clients via the
    // "Ver perfil del coach" modal in the chat header.
    years_experience: '',
    specialties: '',
    certifications: '',
    education: '',
    languages_spoken: '',
    philosophy: '',
    website_url: '',
    achievements: '',
    services_offered: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchWithAuth('/manager/profile');
        if (data) {
          // Array fields come back as string[] from the API; turn them
          // into comma-separated strings for the textarea-style inputs.
          const arrToStr = (v: any) => Array.isArray(v) ? v.join(', ') : (v || '');
          setProfile((prev: any) => ({
            ...prev,
            ...data,
            full_name: data.full_name || '',
            professional_title: data.professional_title || '',
            bio: data.bio || '',
            phone_number: data.phone_number || '',
            address: data.address || '',
            linkedin_url: data.linkedin_url || '',
            twitter_url: data.twitter_url || '',
            instagram_url: data.instagram_url || '',
            avatar_url: data.avatar_url || '',
            language: data.language || 'es',
            years_experience: data.years_experience ?? '',
            specialties: arrToStr(data.specialties),
            certifications: arrToStr(data.certifications),
            education: data.education || '',
            languages_spoken: arrToStr(data.languages_spoken),
            philosophy: data.philosophy || '',
            website_url: data.website_url || '',
            achievements: arrToStr(data.achievements),
            services_offered: arrToStr(data.services_offered),
          }));
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(t('failed_load_profile_data'));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const { setProfile: setGlobalProfile } = useProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError(t('please_upload_image_file'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t('image_size_less_than_2mb'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Convert to base64 for immediate preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update local state first for instant feedback if desired
        setProfile((prev: any) => ({ ...prev, avatar_url: base64String }));

        // 2. Send to backend
        const response = await fetchWithAuth('/manager/profile', {
          method: 'POST',
          body: JSON.stringify({ ...profile, avatar_url: base64String })
        });
        
        if (response) {
          // Update global context immediately with server data
          setGlobalProfile({
            full_name: response.full_name || profile.full_name,
            professional_title: response.professional_title || profile.professional_title,
            avatar_url: response.avatar_url || base64String
          });
          setSuccess(true);
        }
        setTimeout(() => setSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(t('failed_update_profile_photo'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (overrides?: Partial<any>) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    // Merge overrides explicitly so callers don't depend on the (possibly stale)
    // `profile` state value captured by an earlier closure.
    const payload = { ...profile, ...(overrides || {}) };
    try {
      const response = await fetchWithAuth('/manager/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response) {
        // Update global context immediately
        setGlobalProfile({
          full_name: response.full_name || payload.full_name,
          professional_title: response.professional_title || payload.professional_title,
          avatar_url: response.avatar_url ?? payload.avatar_url
        });
        setSuccess(true);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || t('failed_save_profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
          {t('profile_saved')}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('personal_details')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('personal_details_desc')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative">
              {profile.avatar_url ? (
                <div
                  className="w-24 h-24 rounded-full bg-slate-100 bg-center bg-cover border-4 border-white shadow-sm"
                  style={{ backgroundImage: `url(${profile.avatar_url})` }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center text-emerald-500 font-bold text-3xl">
                  {(profile.full_name || profile.name || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white shadow-sm hover:bg-emerald-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('profile_photo')}</h3>
              <p className="text-xs text-slate-500 mb-3">{t('profile_photo_desc', { defaultValue: 'This will be displayed on your profile.' })}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {t('change')}
                </button>
                <button
                  onClick={() => {
                    setProfile((p: any) => ({ ...p, avatar_url: '' }));
                    handleSave({ avatar_url: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('full_name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                <input 
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                  placeholder={t('full_name_placeholder')} 
                  type="text" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('professional_title')}</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                <input 
                  name="professional_title"
                  value={profile.professional_title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                  placeholder={t('professional_title_placeholder')} 
                  type="text" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('bio')}</label>
            <textarea 
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow min-h-[100px]" 
              placeholder={t('bio_placeholder')}
            />
            <p className="text-xs text-slate-500 mt-1.5 text-right">{Math.max(0, 500 - (profile.bio?.length || 0))} {t('characters_left')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('contact_info')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('contact_info_desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email_address')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
              <input 
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" 
                type="email" 
                value={user?.email || ''}
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{t('email_not_changeable', { defaultValue: 'Email cannot be changed here.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone_number')}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
              <input 
                name="phone_number"
                value={profile.phone_number}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('professional_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
              <input 
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                type="text" 
                placeholder={t('address_placeholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('social_profiles')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('social_profiles_desc')}</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#0077b5]/10 flex items-center justify-center">
              <span className="font-bold text-[#0077b5] text-lg">in</span>
            </div>
            <div className="flex-1">
              <input 
                name="linkedin_url"
                value={profile.linkedin_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                placeholder={t('linkedin_placeholder')} 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center">
              <span className="font-bold text-[#1DA1F2] text-lg">tw</span>
            </div>
            <div className="flex-1">
              <input 
                name="twitter_url"
                value={profile.twitter_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                placeholder={t('twitter_placeholder')} 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-pink-100 flex items-center justify-center">
              <span className="font-bold text-pink-600 text-lg">ig</span>
            </div>
            <div className="flex-1">
              <input
                name="instagram_url"
                value={profile.instagram_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
                placeholder={t('instagram_placeholder')}
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600">language</span>
            </div>
            <div className="flex-1">
              <input
                name="website_url"
                value={profile.website_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
                placeholder="https://tu-web.com"
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Public coach profile — surfaced to your clients via the
          "Ver perfil del coach" modal in the chat. */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('public_profile_title', { defaultValue: 'Perfil público' })}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('public_profile_desc', { defaultValue: 'Lo que tus clientes verán en su portal. Cuanto más completes, mejor te conocerán.' })}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('years_experience', { defaultValue: 'Años de experiencia' })}</label>
            <input
              name="years_experience"
              type="number"
              min={0}
              max={99}
              value={profile.years_experience}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('specialties', { defaultValue: 'Especialidades' })}</label>
            <input
              name="specialties"
              value={profile.specialties}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder={t('specialties_placeholder', { defaultValue: 'Pérdida de peso, hipertrofia, deporte de resistencia…' })}
            />
            <p className="text-xs text-slate-400 mt-1">{t('csv_hint', { defaultValue: 'Separa con comas.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('services_offered', { defaultValue: 'Servicios que ofreces' })}</label>
            <input
              name="services_offered"
              value={profile.services_offered}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder={t('services_placeholder', { defaultValue: 'Planes de nutrición, seguimiento semanal, asesoría online…' })}
            />
            <p className="text-xs text-slate-400 mt-1">{t('csv_hint', { defaultValue: 'Separa con comas.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('certifications', { defaultValue: 'Certificaciones' })}</label>
            <input
              name="certifications"
              value={profile.certifications}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder={t('certifications_placeholder', { defaultValue: 'CSCS, ISAK Nivel 1, Precision Nutrition…' })}
            />
            <p className="text-xs text-slate-400 mt-1">{t('csv_hint', { defaultValue: 'Separa con comas.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('education', { defaultValue: 'Formación' })}</label>
            <textarea
              name="education"
              value={profile.education}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow resize-y"
              placeholder={t('education_placeholder', { defaultValue: 'Grado en CCAFD, Universidad X (2020). Máster en Nutrición Deportiva, Universidad Y (2022).' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('achievements', { defaultValue: 'Logros' })}</label>
            <input
              name="achievements"
              value={profile.achievements}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder={t('achievements_placeholder', { defaultValue: 'Coach del año 2024, ponente en X congreso…' })}
            />
            <p className="text-xs text-slate-400 mt-1">{t('csv_hint', { defaultValue: 'Separa con comas.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('languages_spoken', { defaultValue: 'Idiomas que hablas' })}</label>
            <input
              name="languages_spoken"
              value={profile.languages_spoken}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow"
              placeholder={t('languages_placeholder', { defaultValue: 'Español, Inglés, Catalán' })}
            />
            <p className="text-xs text-slate-400 mt-1">{t('csv_hint', { defaultValue: 'Separa con comas.' })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('philosophy', { defaultValue: 'Filosofía / Enfoque' })}</label>
            <textarea
              name="philosophy"
              value={profile.philosophy}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow resize-y"
              placeholder={t('philosophy_placeholder', { defaultValue: 'Mi enfoque combina la evidencia científica con un acompañamiento humano para hacer sostenibles los cambios.' })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 pb-8">
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          {t('discard_changes')}
        </button>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-sm shadow-emerald-500/30 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? t('saving', { defaultValue: 'Saving...' }) : t('save_profile')}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  // Active TOTP enrolment in progress: { factorId, qr, secret } shown in a modal.
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaModalError, setMfaModalError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Reads the real MFA state from Supabase (verified TOTP factor = 2FA on).
  const refreshMfaState = async () => {
    try {
      const { data, error: fErr } = await supabase.auth.mfa.listFactors();
      if (fErr) return;
      const verified = (data?.totp || []).find((f: any) => f.status === 'verified');
      setMfaEnabled(!!verified);
      setMfaFactorId(verified ? verified.id : null);
    } catch { /* no browser session — leave as-is */ }
  };

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        const [sessionsData, historyData] = await Promise.all([
          fetchWithAuth('/manager/security/sessions'),
          fetchWithAuth('/manager/security/history')
        ]);
        setSessions(sessionsData || []);
        setHistory(historyData || []);
      } catch (err) {
        console.error('Error loading security data:', err);
      }
    };
    loadSecurityData();
    refreshMfaState();
  }, []);

  // Start TOTP enrolment: ask Supabase for a new factor + QR.
  const handleEnableMfa = async () => {
    setMfaModalError(null);
    setMfaBusy(true);
    try {
      // Clean up any leftover unverified factor before creating a new one.
      // listFactors().totp can omit unverified factors, so also scan `.all`.
      const { data: existing } = await supabase.auth.mfa.listFactors();
      const allFactors = [
        ...((existing as any)?.all || []),
        ...((existing?.totp as any[]) || []),
      ];
      const seen = new Set<string>();
      for (const f of allFactors) {
        if (!f?.id || seen.has(f.id)) continue;
        seen.add(f.id);
        if (f.status === 'unverified') {
          try { await supabase.auth.mfa.unenroll({ factorId: f.id }); } catch { /* ignore */ }
        }
      }
      // A unique friendly name avoids the "factor with friendly name '' already
      // exists" collision even if a stale factor could not be removed.
      const { data, error: eErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator ${Date.now()}`,
      });
      if (eErr) throw eErr;
      setEnrollData({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setMfaCode('');
    } catch (err: any) {
      setMfaModalError(err.message || t('mfa_enroll_failed', { defaultValue: 'No se pudo iniciar el 2FA. Vuelve a iniciar sesión e inténtalo de nuevo.' }));
      setEnrollData({ factorId: '', qr: '', secret: '' }); // open modal to show the error
    } finally {
      setMfaBusy(false);
    }
  };

  // Close the modal and discard the pending (unverified) factor so it does
  // not linger and block the next enrolment attempt.
  const handleCancelEnroll = async () => {
    const fid = enrollData?.factorId;
    setEnrollData(null);
    setMfaCode('');
    setMfaModalError(null);
    if (fid) {
      try { await supabase.auth.mfa.unenroll({ factorId: fid }); } catch { /* ignore */ }
    }
  };

  // Confirm enrolment: verify the 6-digit code against the new factor.
  const handleVerifyEnroll = async () => {
    if (!enrollData?.factorId) return;
    setMfaModalError(null);
    setMfaBusy(true);
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId, challengeId: ch.id, code: mfaCode.trim()
      });
      if (vErr) throw vErr;
      await fetchWithAuth('/manager/security/2fa/toggle', {
        method: 'POST', body: JSON.stringify({ enabled: true })
      }).catch(() => {});
      setEnrollData(null);
      setMfaCode('');
      await refreshMfaState();
    } catch (err: any) {
      setMfaModalError(err.message || t('mfa_invalid_code', { defaultValue: 'Código inválido' }));
    } finally {
      setMfaBusy(false);
    }
  };

  // Disable 2FA: remove the verified TOTP factor.
  const handleDisableMfa = async () => {
    if (!mfaFactorId) return;
    if (!confirm(t('mfa_disable_confirm', { defaultValue: '¿Desactivar la verificación en dos pasos?' }))) return;
    setMfaBusy(true);
    try {
      const { error: uErr } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
      if (uErr) throw uErr;
      await fetchWithAuth('/manager/security/2fa/toggle', {
        method: 'POST', body: JSON.stringify({ enabled: false })
      }).catch(() => {});
      await refreshMfaState();
    } catch (err: any) {
      setError(err.message || t('mfa_disable_failed', { defaultValue: 'No se pudo desactivar el 2FA' }));
    } finally {
      setMfaBusy(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setError(t('current_password_required', { defaultValue: 'Introduce tu contraseña actual' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwords_dont_match', { defaultValue: 'Las contraseñas no coinciden' }));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('password_min_length', { defaultValue: 'La contraseña debe tener al menos 8 caracteres' }));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('password_must_differ', { defaultValue: 'La nueva contraseña debe ser distinta' }));
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await fetchWithAuth('/manager/update-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t('password_update_failed', { defaultValue: 'Error al actualizar la contraseña' }));
    } finally {
      setUpdating(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await fetchWithAuth(`/manager/security/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error revoking session:', err);
    }
  };

  // Global sign-out: revokes every session on the server, then logs out locally.
  const handleLogoutEverywhere = async () => {
    if (!confirm(t('logout_all_confirm', { defaultValue: '¿Cerrar la sesión en todos los dispositivos?' }))) return;
    try {
      await fetchWithAuth('/manager/security/sessions/revoke-all', { method: 'POST' });
      await supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.error('Error signing out everywhere:', err);
    } finally {
      logout();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
          <BadgeCheck className="w-5 h-5" />
          {t('password_updated')}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('change_password')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('security_desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('current_password', { defaultValue: 'Contraseña actual' })}</label>
            <div className="relative">
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('new_password')}</label>
            <div className="relative">
              <input 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                placeholder="••••••••" 
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('confirm_password')}</label>
            <div className="relative">
              <input 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                placeholder="••••••••" 
                type={showCurrentPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleUpdatePassword}
            disabled={updating}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors flex items-center gap-2"
          >
            {updating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {updating ? t('updating', { defaultValue: 'Actualizando...' }) : t('update_password')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('two_factor')}</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-lg">{t('two_factor_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {mfaEnabled && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> {t('mfa_active', { defaultValue: 'Activo' })}
              </span>
            )}
            {mfaEnabled ? (
              <button
                onClick={handleDisableMfa}
                disabled={mfaBusy}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {t('mfa_disable', { defaultValue: 'Desactivar' })}
              </button>
            ) : (
              <button
                onClick={handleEnableMfa}
                disabled={mfaBusy}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                {t('mfa_enable', { defaultValue: 'Activar' })}
              </button>
            )}
          </div>
        </div>
      </div>

      {enrollData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{t('mfa_setup_title', { defaultValue: 'Configurar verificación en dos pasos' })}</h3>
              <button onClick={handleCancelEnroll} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {enrollData.qr && (
                <>
                  <p className="text-sm text-slate-500">{t('mfa_setup_step1', { defaultValue: 'Escanea este código QR con tu app de autenticación (Google Authenticator, Authy…).' })}</p>
                  <div className="flex justify-center">
                    <img src={enrollData.qr} alt="2FA QR" className="w-48 h-48 rounded-lg border border-slate-100" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('mfa_manual_key', { defaultValue: 'O introduce esta clave manualmente' })}</p>
                    <p className="text-sm font-mono font-bold text-slate-700 break-all">{enrollData.secret}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('mfa_enter_code', { defaultValue: 'Introduce el código de 6 dígitos' })}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center tracking-[0.4em] font-bold text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      placeholder="000000"
                    />
                  </div>
                </>
              )}
              {mfaModalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{mfaModalError}</div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleCancelEnroll}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                {t('cancel', { defaultValue: 'Cancelar' })}
              </button>
              {enrollData.qr && (
                <button
                  onClick={handleVerifyEnroll}
                  disabled={mfaBusy || mfaCode.length < 6}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {mfaBusy && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {t('mfa_activate', { defaultValue: 'Activar 2FA' })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('active_sessions')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('sessions_desc')}</p>
          </div>
          <button
            onClick={handleLogoutEverywhere}
            className="text-red-500 text-sm font-semibold hover:text-red-600 transition-colors border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg"
          >
            {t('logout_all')}
          </button>
        </div>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${session.is_current ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                  {session.device_name?.toLowerCase().includes('phone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{session.device_name}</h3>
                    {session.is_current && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">{t('active_now')}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.location || t('unknown_location')} • {session.browser || 'Browser'} • {session.ip_address || '---'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!session.is_current && (
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                    title={t('revoke_session')}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('login_history')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('login_history_desc')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('device')}</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('location')}</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('date')}</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-slate-900 font-medium">{item.device || t('unknown_device')}</td>
                  <td className="py-3 px-2 text-sm text-slate-500">{item.location || t('unknown_location')}</td>
                  <td className="py-3 px-2 text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// Stripe price ids per tier (same catalogue as the public Pricing page).
const BILLING_PRICE_MAP: Record<string, { monthly: string; annual: string }> = {
  professional: { monthly: 'price_1TCN9vCR4WvolxlpwC33dk8J', annual: 'price_1TCf4PCR4Wvolxlp3MoDzi0J' },
  scale:        { monthly: 'price_1TCNAHCR4WvolxlpwpLRfmwX', annual: 'price_1TCf52CR4WvolxlpcMMLOVpv' },
  unlimited:    { monthly: 'price_1TCNAcCR4WvolxlptLzNYdsz', annual: 'price_1TCf5cCR4WvolxlpWGhpOgnI' },
};
const BILLING_PLANS = [
  { tier: 'professional', monthlyPrice: 39, desc: 'Hasta 20 clientes activos', popular: false },
  { tier: 'scale',        monthlyPrice: 79, desc: 'Hasta 60 clientes activos', popular: true },
  { tier: 'unlimited',    monthlyPrice: 99, desc: 'Clientes ilimitados', popular: false },
];

function BillingSettings() {
  const { t, language } = useLanguage();
  const isEs = language === 'es';
  const { user } = useAuth();
  const { status: billingStatus, refresh: refreshBilling } = useBilling();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  // Start a Stripe Checkout session for the chosen tier and redirect to it.
  const handleSubscribe = async (tier: string) => {
    setSubscribing(tier);
    setError(null);
    try {
      const priceId = isAnnual ? BILLING_PRICE_MAP[tier].annual : BILLING_PRICE_MAP[tier].monthly;
      const data = await fetchWithAuth('/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId, userId: user?.id, userEmail: user?.email }),
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError(t('billing_unavailable', { defaultValue: 'La gestión de facturación no está disponible.' }));
        setSubscribing(null);
      }
    } catch (err: any) {
      setError(err?.message || t('billing_unavailable', { defaultValue: 'La gestión de facturación no está disponible.' }));
      setSubscribing(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/manager/billing');
        setBilling(data);
      } catch (err) {
        console.error('Error loading billing:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const r = await fetchWithAuth('/manager/billing/portal', { method: 'POST' });
      if (r?.url) {
        window.location.href = r.url;
      } else {
        setError(t('billing_unavailable', { defaultValue: 'La gestión de facturación no está disponible.' }));
      }
    } catch (err: any) {
      setError(err?.message || t('billing_unavailable', { defaultValue: 'La gestión de facturación no está disponible.' }));
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sub = billing?.subscription;
  const invoices: any[] = billing?.invoices || [];
  const pm = billing?.paymentMethod;
  const statusActive = sub?.status === 'active' || sub?.status === 'trialing';
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : '—';

  // Only accounts with a real Stripe subscription can use the Stripe Billing
  // Portal. Trial / never-paid accounts (no stripe_customer_id) must instead
  // pick a plan via in-app Checkout — sending them to the portal 404s.
  const hasStripeSub = Boolean(billingStatus?.hasStripeSubscription);
  const currentTier: string = billingStatus?.tier || sub?.plan_tier || 'trial';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Acceso a la pantalla completa de suscripciones (mismo modulo que
          el sidebar "Mejorar plan"). Navega via CustomEvent porque
          BillingSettings se renderiza anidado y no recibe setCurrentView. */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'subscriptions' }))}
        className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 hover:from-amber-100 hover:to-orange-100 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('view_all_plans', { defaultValue: 'Ver planes y comparativa completa' })}</h3>
            <p className="text-xs text-slate-500">{t('view_all_plans_desc', { defaultValue: 'Compara features, mira tu uso y mejora de plan.' })}</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-amber-500 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
      </button>

      {/* Current Plan */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('current_plan')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('manage_subscription')}</p>
          </div>
          {sub && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <span className={`w-2 h-2 rounded-full ${statusActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {sub.status || t('active')}
            </div>
          )}
        </div>
        {hasStripeSub ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 rounded-xl p-6 border border-slate-100">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-slate-900 capitalize">{t(`plan_${currentTier}`, { defaultValue: currentTier })}</h3>
              <p className="text-xs text-slate-400 mt-2">{t('renews_on', { date: fmtDate(billingStatus?.currentPeriodEnd || sub?.current_period_end) })}</p>
            </div>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {portalLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {portalLoading ? t('saving') : (isEs ? 'Gestionar suscripción' : 'Manage subscription')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-medium text-slate-600">
              {currentTier === 'trial'
                ? (isEs
                    ? 'Estás en el periodo de prueba. Elige un plan para continuar sin interrupciones:'
                    : "You're on the free trial. Pick a plan to keep going without interruptions:")
                : `${t('no_active_subscription', { defaultValue: 'No tienes una suscripción activa.' })} ${t('choose_plan_below', { defaultValue: 'Elige un plan para empezar:' })}`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>{t('billing_monthly', { defaultValue: 'Mensual' })}</span>
              <button
                type="button"
                onClick={() => setIsAnnual(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isAnnual ? 'bg-slate-900' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isAnnual ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                {t('billing_annual', { defaultValue: 'Anual' })} <span className="text-emerald-600 font-semibold">−20%</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BILLING_PLANS.map(plan => {
                const price = isAnnual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
                return (
                  <div
                    key={plan.tier}
                    className={`relative rounded-xl border p-5 flex flex-col transition-shadow hover:shadow-sm ${plan.popular ? 'border-slate-300' : 'border-slate-200'}`}
                  >
                    {plan.popular && (
                      <span className="self-start text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mb-2">
                        {t('billing_popular', { defaultValue: 'Popular' })}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 capitalize">{t(`plan_${plan.tier}`, { defaultValue: plan.tier })}</h3>
                    <div className="mt-2 mb-1">
                      <span className="text-3xl font-bold text-slate-900">{price}€</span>
                      <span className="text-sm text-slate-400">/{t('billing_month', { defaultValue: 'mes' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{t(`plan_${plan.tier}_desc`, { defaultValue: plan.desc })}</p>
                    <button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={!!subscribing}
                      className={`mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 ${plan.popular ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {subscribing === plan.tier && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                      {t('billing_subscribe', { defaultValue: 'Suscribirme' })}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Plan Usage — live counters against the limits of the current tier */}
      {billingStatus && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('plan_usage', { defaultValue: 'Uso del plan' })}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('plan_usage_desc', { defaultValue: 'Consumo actual frente a los límites de tu plan.' })}</p>
            </div>
            <button
              onClick={() => refreshBilling()}
              className="text-emerald-600 text-xs font-semibold hover:underline"
            >
              {t('refresh', { defaultValue: 'Actualizar' })}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: 'activeClients',     label: t('active_clients_label',     { defaultValue: 'Clientes activos' }) },
              { key: 'monthlyMessages',   label: t('monthly_messages_label',   { defaultValue: 'Mensajes este mes' }) },
              { key: 'activeAutomations', label: t('active_automations_label', { defaultValue: 'Automatizaciones activas' }) },
              { key: 'activeAlerts',      label: t('active_alerts_label',      { defaultValue: 'Alertas activas' }) },
              { key: 'storageGB',         label: t('storage_label',            { defaultValue: 'Almacenamiento (GB)' }) },
            ] as const).map(row => {
              const used = (billingStatus.usage as any)[row.key] ?? 0;
              const limit = (billingStatus.limits as any)[row.key];
              const pct = limit == null ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
              const isUnlimited = limit == null;
              const danger = !isUnlimited && pct >= 90;
              const warn = !isUnlimited && pct >= 70 && pct < 90;
              return (
                <div key={row.key} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm font-bold text-slate-900">
                      {used}{isUnlimited ? ` / ${t('unlimited', { defaultValue: 'Ilimitado' })}` : ` / ${limit}`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isUnlimited ? 'bg-emerald-300' : danger ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: isUnlimited ? '100%' : `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('payment_method')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('update_billing')}</p>
          </div>
        </div>
        {pm ? (
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-sm capitalize">{pm.brand} •••• {pm.last4}</span>
                <p className="text-xs text-slate-500 mt-0.5">{t('expiry', { date: `${pm.expMonth}/${pm.expYear}` })}</p>
              </div>
            </div>
            <button onClick={openPortal} disabled={portalLoading} className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 hover:underline disabled:opacity-50">
              {t('update')}
            </button>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-500">
            {t('no_payment_method', { defaultValue: 'No hay método de pago registrado.' })}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('billing_history')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('billing_history_desc')}</p>
          </div>
        </div>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">{t('invoice_date')}</th>
                  <th className="px-4 py-3">{t('amount')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">{t('invoice')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{fmtDate(inv.date)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{inv.amount.toFixed(2)} {inv.currency}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {inv.pdf ? (
                        <a href={inv.pdf} target="_blank" rel="noopener noreferrer" className="inline-block p-1.5 text-slate-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-emerald-50">
                          <Download className="w-5 h-5" />
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-500">
            {t('no_invoices', { defaultValue: 'Todavía no hay facturas.' })}
          </div>
        )}
      </div>
    </div>
  );
}


function IntegrationsSettings() {
  const { integrations, saveIntegrations, isSaving } = useIntegrations();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localIntegrations, setLocalIntegrations] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchWithAuth('/manager/settings');
        setSettings(data);
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (integrations) {
      setLocalIntegrations(integrations);
    }
  }, [integrations]);

  const handleTogglePreference = (key: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notification_prefs: {
        ...settings.notification_prefs,
        [key]: !settings.notification_prefs[key]
      }
    });
  };

  const handleSaveGeneralSettings = async () => {
    setSaving(true);
    try {
      await fetchWithAuth('/manager/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      await saveIntegrations(localIntegrations);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving integrations:', err);
    }
  };

  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  // Web Push: per-device subscription state.
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    isPushEnabled().then(setPushOn);
  }, []);

  const handleTogglePush = async () => {
    setPushBusy(true);
    setPushMsg(null);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
      } else {
        const r = await enablePush();
        if (r.ok) {
          setPushOn(true);
        } else {
          const map: Record<string, string> = {
            unsupported: t('push_unsupported', { defaultValue: 'Este navegador no admite notificaciones push.' }),
            denied: t('push_denied', { defaultValue: 'Permiso de notificaciones denegado.' }),
            not_configured: t('push_not_configured', { defaultValue: 'Las notificaciones push no están configuradas en el servidor.' }),
          };
          setPushMsg(map[r.error || ''] || t('push_error', { defaultValue: 'No se pudieron activar las notificaciones.' }));
        }
      }
    } finally {
      setPushBusy(false);
    }
  };

  const runIntegrationAction = async (key: string, endpoint: string, okText: string) => {
    setTesting(key);
    setTestMsg(null);
    try {
      const r = await fetchWithAuth(endpoint, { method: 'POST' });
      const ok = r?.success !== false;
      setTestMsg({ ok, text: ok ? okText : (r?.message || t('error_loading_data')) });
    } catch (err: any) {
      setTestMsg({ ok: false, text: err?.message || t('error_loading_data') });
    } finally {
      setTesting(null);
      setTimeout(() => setTestMsg(null), 6000);
    }
  };

  if (loading || !settings || !localIntegrations) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <BadgeCheck className="w-5 h-5" />
          {t('settings_saved', { defaultValue: '¡Configuración guardada correctamente!' })}
        </div>
      )}

      {/* Google Calendar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('google_calendar')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('google_calendar_desc')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <img alt="Google Calendar" className="w-7 h-7 object-contain" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('connection_status')}</p>
              <p className="text-xs text-slate-500 mt-1">
                {localIntegrations.google_calendar_enabled ? t('sync_active') : t('not_connected')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                checked={localIntegrations.google_calendar_enabled} 
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, google_calendar_enabled: e.target.checked })}
                className="sr-only peer" 
                type="checkbox" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('google_api_key')}</label>
              <input 
                value={localIntegrations.google_calendar_api_key || ''}
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, google_calendar_api_key: e.target.value })}
                type="password"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="AIza..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('google_calendar_id')}</label>
              <input
                value={localIntegrations.google_calendar_id || ''}
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, google_calendar_id: e.target.value })}
                type="text"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none"
                placeholder="example@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('google_service_account', { defaultValue: 'Cuenta de servicio (JSON)' })}</label>
            <textarea
              value={localIntegrations.google_service_account
                ? (typeof localIntegrations.google_service_account === 'string'
                    ? localIntegrations.google_service_account
                    : JSON.stringify(localIntegrations.google_service_account, null, 2))
                : ''}
              onChange={(e) => setLocalIntegrations({ ...localIntegrations, google_service_account: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 outline-none resize-none"
              placeholder='{ "type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..." }'
            />
            <p className="text-xs text-slate-400 mt-1">
              {t('google_service_account_hint', { defaultValue: 'Pega el JSON de la cuenta de servicio de Google Cloud. Es lo que permite crear eventos — comparte tu calendario con el client_email de la cuenta de servicio.' })}
            </p>
          </div>

          <div className="flex justify-end pt-2 gap-2 items-center">
            {testMsg && (
              <span className={`text-xs font-bold mr-auto ${testMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{testMsg.text}</span>
            )}
            <button
              onClick={() => runIntegrationAction('gcal-sync', '/manager/integrations/google-calendar/sync-all', t('settings_saved', { defaultValue: 'OK' }))}
              disabled={testing !== null}
              style={{
                color: 'var(--brand-primary)',
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, white)'
              }}
              className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border hover:brightness-95 disabled:opacity-50"
            >
              <Share2 className="w-3 h-3" />
              {testing === 'gcal-sync' ? t('saving') : t('sync_existing')}
            </button>
            <button
              onClick={() => runIntegrationAction('gcal-test', '/manager/integrations/google-calendar/test', t('connected_stripe', { defaultValue: 'OK' }))}
              disabled={testing !== null}
              style={{
                color: 'var(--brand-primary)',
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, white)'
              }}
              className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border hover:brightness-95 disabled:opacity-50"
            >
              {testing === 'gcal-test' ? t('saving') : t('test_connection')}
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('stripe_payments')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('stripe_payments_desc')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            {/* Official Stripe "S" mark — same treatment as the Google Calendar logo above */}
            <svg viewBox="0 0 32 32" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
              <rect width="32" height="32" rx="6" fill="#635BFF" />
              <path
                fill="#FFFFFF"
                d="M14.36 12.5c0-.72.6-1 1.6-1 1.43 0 3.24.43 4.67 1.2v-4.3a12.4 12.4 0 0 0-4.67-.86c-3.82 0-6.36 2-6.36 5.34 0 5.21 7.17 4.38 7.17 6.63 0 .85-.74 1.13-1.79 1.13-1.56 0-3.55-.64-5.13-1.5v4.36c1.75.75 3.52 1.07 5.13 1.07 3.91 0 6.6-1.94 6.6-5.32 0-5.62-7.22-4.62-7.22-6.75Z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('stripe_status')}</p>
              <p className="text-xs text-slate-500 mt-1">
                {localIntegrations.stripe_enabled ? t('connected_stripe') : t('not_connected')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                checked={localIntegrations.stripe_enabled} 
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, stripe_enabled: e.target.checked })}
                className="sr-only peer" 
                type="checkbox" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('publishable_key')}</label>
              <input 
                value={localIntegrations.stripe_publishable_key || ''}
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, stripe_publishable_key: e.target.value })}
                type="text"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="pk_test_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('secret_key')}</label>
              <input
                value={localIntegrations.stripe_secret_key || ''}
                onChange={(e) => setLocalIntegrations({ ...localIntegrations, stripe_secret_key: e.target.value })}
                type="password"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none"
                placeholder="sk_test_..."
              />
            </div>
          </div>

          {/* Action footer — mirrors the Google Calendar card so both
              integrations share the same layout and button style. */}
          <div className="flex justify-end pt-2 gap-2 items-center">
            <button
              onClick={() => runIntegrationAction('stripe-test', '/manager/integrations/stripe/test', t('connected_stripe', { defaultValue: 'OK' }))}
              disabled={testing !== null}
              style={{
                color: 'var(--brand-primary)',
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, white)'
              }}
              className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border hover:brightness-95 disabled:opacity-50"
            >
              {testing === 'stripe-test' ? t('saving') : t('test_stripe')}
            </button>
          </div>
        </div>
      </div>

      {/* Global save — applies to all integration cards above. Uses the same
          prominent filled style as "Save Notification Preferences" below so
          both primary save actions in Settings share one visual language. */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveIntegrations}
          disabled={isSaving}
          style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
          className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:brightness-95 flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isSaving ? t('saving') : t('save_all_integrations')}
        </button>
      </div>

      {/* Notifications Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('notification_preferences')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('notification_prefs_desc')}</p>
          </div>
          {pushSupported() && (
            <button
              onClick={handleTogglePush}
              disabled={pushBusy}
              // Same tonal chip family as the Integrations action buttons
              // (Test Stripe, Test Google Calendar, …) — uses the user's
              // theme color via --brand-primary instead of black/emerald.
              style={{
                color: 'var(--brand-primary)',
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
                borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, white)'
              }}
              className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border hover:brightness-95 disabled:opacity-50 shrink-0"
            >
              {pushBusy
                ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Bell className="w-3 h-3" />}
              {pushOn
                ? t('push_enabled_device', { defaultValue: 'Push activado en este dispositivo' })
                : t('enable_push_device', { defaultValue: 'Activar push en este dispositivo' })}
            </button>
          )}
        </div>
        {pushMsg && <div className="mb-4 text-xs font-semibold text-red-600">{pushMsg}</div>}
        <div className="mb-6" />
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 bg-slate-50 px-4 rounded-t-lg items-center">
            <div className="md:col-span-9 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t('event_type')}</div>
            <div className="md:col-span-3 text-center font-semibold text-xs text-slate-500 uppercase tracking-wider">{t('push')}</div>
          </div>
          {[
            { id: 'new_client_check_ins', title: t('checkins'), desc: t('new_client_check_ins_desc') },
            { id: 'new_messages', title: t('messages'), desc: t('new_messages_desc') },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 px-4 items-center">
              <div className="md:col-span-9">
                <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <div className="md:col-span-3 flex justify-center">
                <input
                  type="checkbox"
                  checked={settings.notification_prefs?.[`${item.id}_push`] ?? true}
                  onChange={() => handleTogglePreference(`${item.id}_push`)}
                  className="w-5 h-5 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSaveGeneralSettings}
          disabled={saving}
          // Identical style to "Save All Integrations" above — both primary
          // save buttons in Settings now share one brand-driven look.
          style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
          className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm hover:brightness-95 flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? t('saving') : t('save_notification_prefs')}
        </button>
      </div>
    </div>
  );
}


