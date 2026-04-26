import { useState } from 'react';
import { Download, Monitor, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { BottomNav } from './components/BottomNav';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { Settings } from './components/Settings';
import { Button, Input, SaveStatus } from './components/ui';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useCV } from './hooks/useCV';
import { generatePDF } from './utils/generatePDF';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { theme, setTheme } = useTheme();
  const isSignUp = mode === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await signUp({ name, email, password });
      } else {
        await signIn({ email, password });
      }

      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong');
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-sm transition-colors">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CV Builder ✏️</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-500 dark:text-red-400">{error}</div>}

            {isSignUp && (
              <Input
                id="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                required
              />
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />

            {isSignUp && (
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
              />
            )}

            <Button type="submit" className="w-full mt-6" isLoading={loading}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link
              to={isSignUp ? '/auth/signin' : '/auth/signup'}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer with version and theme toggle */}
      <div className="py-6 flex flex-col items-center space-y-4">
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 transition-colors">
          <button
            onClick={() => setTheme('system')}
            className={`p-2 rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">v1.0.0</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, setData, isLoading, saveStatus } = useCV(Boolean(user));
  const [activeTab, setActiveTab] = useState('forms');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await generatePDF(data);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-900 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors pb-16">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">CV Builder ✏️</h1>
          <SaveStatus status={saveStatus} />
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {/* Forms Tab */}
        <div className={activeTab === 'forms' ? 'block pb-6' : 'hidden'}>
          <CVForm data={data} onChange={setData} />
        </div>

        {/* Preview Tab */}
        <div className={activeTab === 'preview' ? 'block flex flex-col h-full' : 'hidden'}>
          <div className="p-4 flex justify-center sticky top-14 z-10 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
            <Button variant="primary" className="w-full max-w-sm" onClick={handleDownload} isLoading={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <div className="p-4 flex justify-center overflow-auto pb-10">
            <div className="w-[210mm] max-w-full origin-top scale-[0.45] sm:scale-[0.6] md:scale-[0.8] transition-transform">
              <CVPreview data={data} />
            </div>
          </div>
        </div>

        {/* Settings Tab */}
        <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
          <Settings />
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
