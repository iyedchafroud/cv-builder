import { useState } from 'react';
import { Moon, Sun, Monitor, LogOut, Trash2, AlertTriangle, X, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi, cvsApi } from '../services/api';

export function Settings() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  async function handleOpenDeleteModal() {
    setShowDeleteModal(true);
    setDeleteError('');
    setLoadingCvs(true);
    try {
      const cvs = await cvsApi.list();
      setCvList(cvs);
    } catch {
      setCvList([]);
    } finally {
      setLoadingCvs(false);
    }
  }

  function handleCloseDeleteModal() {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setDeleteError('');
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await authApi.deleteAccount();
      signOut();
      navigate('/');
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  }

  const themeOptions = [
    { id: 'system', label: 'System Default', icon: Monitor },
    { id: 'light',  label: 'Light',          icon: Sun },
    { id: 'dark',   label: 'Dark',           icon: Moon },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">

      {/* ── Account ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        {/* User row */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-none select-none">
            <span className="text-green-700 dark:text-green-300 font-bold text-sm uppercase">
              {user?.email?.[0] ?? '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Account</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-200 dark:border-red-800/70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium text-sm transition-colors"
          >
            <LogOut className="h-4 w-4 flex-none" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Appearance ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        <p className="px-4 pt-4 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Appearance
        </p>
        <div className="px-3 pb-3 space-y-1.5">
          {themeOptions.map(({ id, label, icon: Icon }) => {
            const isActive = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                {label}
                {isActive && (
                  <span className="ml-auto text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Danger Zone ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-red-200 dark:border-red-900/50 transition-colors">
        <div className="flex items-center gap-2 px-4 pt-4 pb-1">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-none" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            Danger Zone
          </p>
        </div>
        <p className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
          These actions are permanent and cannot be undone.
        </p>
        <div className="px-3 pb-3">
          <button
            onClick={handleOpenDeleteModal}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium text-sm transition-colors"
          >
            <Trash2 className="h-4 w-4 flex-none" />
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Delete Account Modal ─────────────────────────────────── */}
      {showDeleteModal && (
        /*
          z-[60] ensures this sits above the bottom nav (z-50).
          items-center centers the modal on all screen sizes,
          avoiding the nav-bar overlap that happens with items-end.
        */
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="w-full max-w-sm flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 7rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-none">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Account</h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This will{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">permanently delete</span>{' '}
                your account and all associated data. This action{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">cannot be undone</span>.
              </p>

              {/* CV list */}
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  CVs that will be deleted
                </p>

                {loadingCvs ? (
                  <div className="flex items-center justify-center py-5">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : cvList.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">No CVs found.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {cvList.map((cv) => (
                      <li
                        key={cv.id}
                        className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2"
                      >
                        <FileText className="h-3.5 w-3.5 text-red-400 dark:text-red-500 flex-none" />
                        <span className="truncate font-medium">{cv.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {deleteError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {deleteError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-none">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || loadingCvs}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors disabled:opacity-60 disabled:pointer-events-none shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
