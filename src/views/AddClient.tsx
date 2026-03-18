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

interface AddClientProps {
  onBack: () => void;
}

export default function AddClient({ onBack }: AddClientProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCreate = async () => {
    if (!email) {
       setError('Email is required');
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
            profile: {
               // Sticking first mapping in notes for simplicity, full app could expand schema
               notes: `Name: ${firstName} ${lastName}`,
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-[1000px] mx-auto p-6 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
            <button onClick={onBack} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Clients
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-900 font-bold">New Client</span>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Client</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">Add a new client to your practice and set up their access.</p>
          </header>
          
          {error && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                {error}
             </div>
          )}

          <div className="space-y-8">
            {/* Personal Information */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Jane"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Access */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Account Access</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Credentials have been automatically generated.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">Send access details via email</span>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username / Email</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-slate-300 transition-all">
                      <span className="text-sm font-bold text-slate-900 flex-1 truncate">{email || generatedUsername}</span>
                      <button 
                        onClick={() => copyToClipboard(email || generatedUsername)}
                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temporary Password</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-slate-300 transition-all">
                      <span className="text-sm font-bold text-slate-900 flex-1">{tempPassword}</span>
                      <button 
                        onClick={() => copyToClipboard(tempPassword)}
                        className="text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Copy to clipboard"
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
                className="px-8 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
