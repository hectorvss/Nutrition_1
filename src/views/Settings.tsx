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
import { Globe } from 'lucide-react';

type SettingsTab = 'general' | 'profile' | 'security' | 'billing' | 'integrations' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { t } = useLanguage();

  const tabs = [
    { id: 'general', label: t('general'), icon: Smartphone },
    { id: 'profile', label: t('profile_details'), icon: User },
    { id: 'security', label: t('security'), icon: Lock },
    { id: 'billing', label: t('billing'), icon: CreditCard },
    { id: 'integrations', label: t('integrations'), icon: Share2 },
    { id: 'appearance', label: t('appearance'), icon: Palette },
  ];

  const renderTabContent = () => {
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account preferences, appearance, and notifications.</p>
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
              onClick={useAuth().logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
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
            <p className="text-sm text-slate-500 mt-1">Configure your preferred language and regional formats.</p>
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
                    <p className="text-xs text-slate-500">Español de España</p>
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
                    <p className="text-xs text-slate-500">English (US/UK)</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('timezone')}</label>
              <select className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" disabled>
                <option>(GMT+01:00) Madrid, Paris, Berlin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('date_format')}</label>
              <select className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" disabled>
                <option>DD/MM/YYYY</option>
              </select>
            </div>
          </div>
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
    avatar_url: ''
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
            language: data.language || 'es'
          }));
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data.');
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
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.');
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
      setError('Failed to update profile photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetchWithAuth('/manager/profile', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
      
      if (response) {
        // Update global context immediately
        setGlobalProfile({
          full_name: response.full_name || profile.full_name,
          professional_title: response.professional_title || profile.professional_title,
          avatar_url: response.avatar_url || profile.avatar_url
        });
        setSuccess(true);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile.');
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
          Profile saved successfully!
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
          <p className="text-sm text-slate-500 mt-1">Update your photo and personal details here.</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full bg-slate-100 bg-center bg-cover border-4 border-white shadow-sm" 
                style={{ backgroundImage: `url(${profile.avatar_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"})` }}
              />
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
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Photo</h3>
              <p className="text-xs text-slate-500 mb-3">This will be displayed on your profile.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Change
                </button>
                <button 
                  onClick={() => {
                    setProfile((p: any) => ({ ...p, avatar_url: '' }));
                    // Also save immediately to backend to clear it
                    handleSave();
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                <input 
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                  placeholder="e.g. Dr. Sarah Smith" 
                  type="text" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Title</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                <input 
                  name="professional_title"
                  value={profile.professional_title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                  placeholder="e.g. Registered Dietitian" 
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
              placeholder="Write a short bio about yourself..."
            />
            <p className="text-xs text-slate-500 mt-1.5 text-right">{Math.max(0, 500 - (profile.bio?.length || 0))} characters left</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
          <p className="text-sm text-slate-500 mt-1">How clients and colleagues can reach you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
              <input 
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" 
                type="email" 
                value={user?.email || ''}
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
              <input 
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow" 
                type="text" 
                placeholder="Business Street, City, Country"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Social Profiles</h2>
          <p className="text-sm text-slate-500 mt-1">Connect your social media accounts.</p>
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
                placeholder="LinkedIn Profile URL" 
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
                placeholder="Twitter Profile URL" 
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
                placeholder="Instagram Profile URL" 
                type="text" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 pb-8">
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          Discard Changes
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-sm shadow-emerald-500/30 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(true);

  const { logout } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        const [sessionsData, historyData] = await Promise.all([
          fetchWithAuth('/manager/security/sessions'),
          fetchWithAuth('/manager/security/history')
        ]);
        setSessions(sessionsData || []);
        setHistory(historyData || []);
        if (profile) {
          setMfaEnabled(profile.mfa_enabled || false);
        }
      } catch (err) {
        console.error('Error loading security data:', err);
      } finally {
        setLoadingSecurity(false);
      }
    };
    loadSecurityData();
  }, [profile]);

  const handleToggle2FA = async () => {
    try {
      const nextValue = !mfaEnabled;
      await fetchWithAuth('/manager/security/2fa/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled: nextValue })
      });
      setMfaEnabled(nextValue);
    } catch (err) {
      console.error('Error toggling 2FA:', err);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetchWithAuth(`/manager/security/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Error revoking session:', err);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      await fetchWithAuth('/manager/update-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
          <BadgeCheck className="w-5 h-5" />
          Password updated successfully!
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
          <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
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
            {updating ? 'Updating...' : 'Update Password'}
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
              <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-lg">Add an extra layer of security to your account by requiring a code from your authenticator app.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              className="sr-only peer" 
              type="checkbox" 
              checked={mfaEnabled}
              onChange={handleToggle2FA}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Sessions</h2>
            <p className="text-sm text-slate-500 mt-1">Manage devices logged into your account.</p>
          </div>
          <button 
            onClick={logout}
            className="text-red-500 text-sm font-semibold hover:text-red-600 transition-colors border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg"
          >
            Logout from all devices
          </button>
        </div>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${session.is_current ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                  {session.device_name.toLowerCase().includes('phone') || session.device_name.toLowerCase().includes('iphone') ? <Smartphone className="w-5 h-5" /> : 
                   session.device_name.toLowerCase().includes('pc') || session.device_name.toLowerCase().includes('mac') ? <Laptop className="w-5 h-5" /> : 
                   <Monitor className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{session.device_name}</h3>
                    {session.is_current && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.location || 'Unknown Location'} • {session.browser || 'Browser'} • {session.ip_address || '---'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.is_current ? (
                  <div className="text-xs text-emerald-600 font-medium">Active now</div>
                ) : (
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                    title="Revoke session"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">No other active sessions.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Login History</h2>
          <p className="text-sm text-slate-500 mt-1">Recent account activity and login attempts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-2 text-sm text-slate-900 font-medium">{item.device || 'Unknown Device'}</td>
                  <td className="py-3 px-2 text-sm text-slate-500">{item.location || 'Unknown Location'}</td>
                  <td className="py-3 px-2 text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-500">No recent activity detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your subscription details</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-xs font-semibold text-emerald-600 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Active
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 rounded-xl p-6 border border-slate-100">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-slate-900">Professional Plan</h3>
            <p className="text-slate-500 text-sm mt-1">For growing nutrition practices</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">$49</span>
              <span className="text-slate-500 text-sm">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Renews on Oct 24, 2023</p>
          </div>
          <div className="flex items-center">
            <button className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            <p className="text-sm text-slate-500 mt-1">Update your billing information</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
              <img alt="Visa" className="h-4" src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">Visa ending in 1234</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Default</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Expiry 12/2025</p>
            </div>
          </div>
          <button className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 hover:underline">
            Update
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Billing History</h2>
            <p className="text-sm text-slate-500 mt-1">Download your past invoices</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Invoice Date</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { date: 'Sep 24, 2023', plan: 'Professional Plan', amount: '$49.00', status: 'Paid' },
                { date: 'Aug 24, 2023', plan: 'Professional Plan', amount: '$49.00', status: 'Paid' },
                { date: 'Jul 24, 2023', plan: 'Professional Plan', amount: '$49.00', status: 'Paid' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-900">{row.date}</td>
                  <td className="px-4 py-4">{row.plan}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-emerald-50">
                      <Download className="w-5 h-5" />
                    </button>
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

function IntegrationsSettings() {
  const { integrations, saveIntegrations, isSaving, isLoading, error: integrationError } = useIntegrations();
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
    setSuccess(false);
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

  const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalIntegrations((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveIntegrations = async () => {
    try {
      await saveIntegrations(localIntegrations);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Error handled in context
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
          Configuración guardada correctamente!
        </div>
      )}

      {integrationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm text-balance">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[10px]">!</div>
          {integrationError}
        </div>
      )}

      {/* Google Calendar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Google Calendar</h2>
            <p className="text-sm text-slate-500 mt-1">Sincroniza tus citas y horarios con Google Calendar.</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <img alt="Google Calendar" className="w-7 h-7 object-contain" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900 text-sm">Estado de Conexión</p>
              <p className="text-xs text-slate-500 mt-1">
                {localIntegrations.google_calendar_enabled ? 'Sincronización activa' : 'No conectado'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                name="google_calendar_enabled"
                checked={localIntegrations.google_calendar_enabled} 
                onChange={handleIntegrationChange}
                className="sr-only peer" 
                type="checkbox" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Google API Key</label>
              <input 
                name="google_calendar_api_key"
                value={localIntegrations.google_calendar_api_key || ''}
                onChange={handleIntegrationChange}
                type="password"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="Pega tu API Key de Google Cloud"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ID del Calendario</label>
              <input 
                name="google_calendar_id"
                value={localIntegrations.google_calendar_id || ''}
                onChange={handleIntegrationChange}
                type="text"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="ejemplo@gmail.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Stripe Payments</h2>
            <p className="text-sm text-slate-500 mt-1">Conecta tu cuenta para ver tus ingresos y facturación.</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#635BFF] shadow-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900 text-sm">Estado de Stripe</p>
              <p className="text-xs text-slate-500 mt-1">
                {localIntegrations.stripe_enabled ? 'Conectado a Stripe' : 'No conectado'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                name="stripe_enabled"
                checked={localIntegrations.stripe_enabled} 
                onChange={handleIntegrationChange}
                className="sr-only peer" 
                type="checkbox" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Publishable Key</label>
              <input 
                name="stripe_publishable_key"
                value={localIntegrations.stripe_publishable_key || ''}
                onChange={handleIntegrationChange}
                type="text"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="pk_test_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Secret Key</label>
              <input 
                name="stripe_secret_key"
                value={localIntegrations.stripe_secret_key || ''}
                onChange={handleIntegrationChange}
                type="password"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition-shadow outline-none" 
                placeholder="sk_test_..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
           <button 
            onClick={handleSaveIntegrations}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5851e0] text-white font-bold text-sm transition-all shadow-lg shadow-[#635BFF]/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BadgeCheck className="w-4 h-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar Configuración de APIs'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
          <p className="text-sm text-slate-500 mt-1">Choose how and when you want to be notified.</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 bg-slate-50 px-4 rounded-t-lg items-center">
            <div className="md:col-span-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Event Type</div>
            <div className="md:col-span-3 text-center font-semibold text-xs text-slate-500 uppercase tracking-wider">Email</div>
            <div className="md:col-span-3 text-center font-semibold text-xs text-slate-500 uppercase tracking-wider">Push</div>
          </div>
          {[
            { id: 'new_client_check_ins', title: 'New Client Check-ins', desc: 'When a client submits their weekly progress update.' },
            { id: 'new_messages', title: 'New Messages', desc: 'Direct messages from clients.' },
            { id: 'appointment_reminders', title: 'Appointment Reminders', desc: '1 hour before scheduled session.' },
            { id: 'system_updates', title: 'System Updates', desc: 'Product news and platform maintenance.', disabled: true },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 px-4 items-center">
              <div className="md:col-span-6">
                <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <div className="md:col-span-3 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={settings.notification_prefs[`${item.id}_email`]} 
                  onChange={() => handleTogglePreference(`${item.id}_email`)}
                  className="w-5 h-5 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500/20" 
                />
              </div>
              <div className="md:col-span-3 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={settings.notification_prefs[`${item.id}_push`]} 
                  disabled={item.disabled}
                  onChange={() => handleTogglePreference(`${item.id}_push`)}
                  className={`w-5 h-5 ${item.disabled ? 'text-slate-200' : 'text-emerald-500'} border-slate-300 rounded focus:ring-emerald-500/20`} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveGeneralSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-sm shadow-emerald-500/30 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { settings, updateTheme, isLoading } = useTheme();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{t('theme_color')}</h2>
          <p className="text-sm text-slate-500 mt-1">Select a primary color theme for your workspace.</p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-9 gap-4 items-center">
          {[
            { name: 'Soft Green', color: '#10b981' },
            { name: 'Deep Blue', color: '#3b82f6' },
            { name: 'Teal', color: '#0d9488' },
            { name: 'Purple', color: '#8b5cf6' },
            { name: 'Rose', color: '#f43f5e' },
            { name: 'Amber', color: '#f59e0b' },
            { name: 'Slate', color: '#64748b' },
            { name: 'Dark', color: '#0f172a' },
          ].map((theme) => (
            <button 
              key={theme.name} 
              onClick={() => updateTheme({ theme_color: theme.color })}
              className="group flex flex-col items-center gap-2"
            >
              <div 
                className={`w-12 h-12 rounded-full transition-all ${
                  settings.theme_color === theme.color 
                    ? 'ring-4 ring-offset-2 ring-emerald-500/30 ring-offset-white scale-110' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: theme.color }}
              />
              <span className={`text-xs font-medium ${settings.theme_color === theme.color ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                {theme.name}
              </span>
            </button>
          ))}
          <button className="group flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
              <Palette className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-emerald-500 transition-colors">Custom</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Moon className="w-5 h-5 text-slate-400" />
            {t('dark_mode')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Adjust the appearance to reduce eye strain.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            className="sr-only peer" 
            type="checkbox" 
            checked={settings.dark_mode}
            onChange={() => updateTheme({ dark_mode: !settings.dark_mode })}
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  );
}
