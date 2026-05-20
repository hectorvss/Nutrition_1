import React from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteClientModalProps {
  show: boolean;
  clientName: string;
  confirmText: string;
  setConfirmText: (v: string) => void;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
  t: Function;
}

const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  show,
  clientName,
  confirmText,
  setConfirmText,
  isDeleting,
  error,
  onClose,
  onConfirm,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('delete_client')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
            <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">⚠ {t('action_cannot_be_undone')}</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {t('all_client_data_deleted_prefix')} <span className="font-bold">{clientName}</span> {t('all_client_data_deleted_suffix')}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
              {t('type')} <span className="text-red-600">{clientName}</span> {t('to_confirm_suffix')}
            </label>
            <input
              autoFocus
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && confirmText === clientName) onConfirm(); }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder={clientName}
            />
            {error && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText !== clientName || isDeleting}
              className="flex-1 py-2.5 font-bold bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('deleting')}
                </>
              ) : (
                <><Trash2 className="w-4 h-4" /> {t('delete_permanently')}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientModal;
