import { Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
        
        <div className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

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
    </div>
  );
}
