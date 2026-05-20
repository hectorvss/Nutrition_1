import React from 'react';
import { Key, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface PasswordResetModalProps {
  show: boolean;
  isResetting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
  t: Function;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  show,
  isResetting,
  error,
  onClose,
  onConfirm,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('reset_password', { defaultValue: 'Reset password' })}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('reset_password_explain', { defaultValue: 'A new password will be generated for this client. Their current password will stop working. Make sure to share the new password with them.' })}
          </p>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isResetting}
              className="flex-1 py-2.5 font-bold bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {t('reset_password', { defaultValue: 'Reset password' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
