import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  show: boolean;
  form: { full_name: string; phone: string; gender: string; age: string; goal: string };
  setForm: (f: any) => void;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  t: Function;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  show,
  form,
  setForm,
  isSaving,
  error,
  onClose,
  onSave,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('edit_profile')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">{t('full_name', { defaultValue: 'Full name' })}</label>
            <input
              value={form.full_name}
              onChange={e => setForm((f: any) => ({ ...f, full_name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">{t('phone', { defaultValue: 'Phone' })}</label>
            <input
              value={form.phone}
              onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">{t('gender', { defaultValue: 'Gender' })}</label>
              <input
                value={form.gender}
                onChange={e => setForm((f: any) => ({ ...f, gender: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">{t('age', { defaultValue: 'Age' })}</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">{t('goal', { defaultValue: 'Goal' })}</label>
            <input
              value={form.goal}
              onChange={e => setForm((f: any) => ({ ...f, goal: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 py-2.5 font-bold bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
