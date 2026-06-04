import React, { useState } from 'react';
import { fetchWithAuth } from '../api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Copy, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';

interface AddClientProps {
  onBack: () => void;
}

export default function AddClient({ onBack }: AddClientProps) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { reloadClients } = useClient();

  const generateTempPassword = () => 'Nutri' + Math.floor(Math.random() * 9000 + 1000) + '$xp';
  const [tempPassword] = useState(generateTempPassword());

  // Generate a username for display. If names exist, use them, otherwise use the email prefix.
  const generatedUsername = React.useMemo(() => {
    if (firstName || lastName) {
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '') || 'new.user';
    }
    if (email) {
      return email.split('@')[0];
    }
    return 'new.client';
  }, [firstName, lastName, email]);

  const copyToClipboard = async (text: string) => {
    // navigator.clipboard rechaza en contextos no-seguros (http) o sin
    // permiso. Fallback a execCommand y, si todo falla, no romper la UI.
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  const handleCreate = async () => {
    if (!email) {
       setError(t('email_required'));
       return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      setError(t('email_invalid', { defaultValue: 'Introduce un email válido.' }));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
       await fetchWithAuth('/manager/clients', {
         method: 'POST',
         body: JSON.stringify({
            email,
            password: tempPassword,
            send_email: sendEmail,
            profile: {
               full_name: `${firstName} ${lastName}`.trim(),
               phone: phone || undefined,
            }
         })
       });
       await reloadClients();
       onBack();
    } catch (err: any) {
       setError(err.message);
    } finally {
       setLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            <button onClick={onBack} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              {t('clients')}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-bold">{t('new_client_title')}</span>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('new_client_title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">{t('new_client_desc')}</p>
          </header>

          {error && (
             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
                {error}
             </div>
          )}

          <div className="space-y-8">
            {/* Personal Information */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('personal_information')}</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('first_name')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('first_name_placeholder')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('last_name')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('last_name_placeholder')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('email_address')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email_placeholder')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('phone_number')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Access */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('account_access')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{t('credentials_generated')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('send_email_toggle')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sendEmail}
                    onClick={() => setSendEmail(v => !v)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${sendEmail ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${sendEmail ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('username_email')}</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 truncate">{email || generatedUsername}</span>
                      <button
                        onClick={() => copyToClipboard(email || generatedUsername)}
                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                        title={t('copy_to_clipboard')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('temp_password')}</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">{tempPassword}</span>
                      <button 
                        onClick={() => copyToClipboard(tempPassword)}
                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                        title={t('copy_to_clipboard')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                onClick={onBack}
                disabled={loading}
                className="px-8 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? t('creating') : t('create_client')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
