import { useState } from 'react';
import { Moon, Sun, Monitor, LogOut, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { cvsApi } from '../services/api';
import { Button } from './ui';

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

  return (
    <div className="p-4 space-y-6 pb-24">

      {/* Account section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>

        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Appearance section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appearance</h2>
        <div className="space-y-2">
          <button
            onClick={() => setTheme('system')}
            className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
              theme === 'system'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Monitor className="h-5 w-5 mr-3" />
            <span className="font-medium">System Default</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
              theme === 'light'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="h-5 w-5 mr-3" />
            <span className="font-medium">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="h-5 w-5 mr-3" />
            <span className="font-medium">Dark</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-red-200 dark:border-red-900/50 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-none" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Permanent and irreversible actions.
        </p>
        <button
          onClick={handleOpenDeleteModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-none">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Delete Account
                </h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This will <span className="font-semibold text-red-600 dark:text-red-400">permanently delete</span> your
                account and all associated data. This action <span className="font-semibold">cannot be undone</span>.
              </p>

              {/* CV list */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  CVs that will be deleted:
                </p>
                {loadingCvs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : cvList.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No CVs found.</p>
                ) : (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                    {cvList.map((cv) => (
                      <li
                        key={cv.id}
                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400 flex-none" />
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

            {/* Modal footer */}
            <div className="flex gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 disabled:pointer-events-none shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
