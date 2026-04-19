import { useState } from 'react';
import { CheckCircle, Download, FileText, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { Navbar } from './components/Navbar';
import { Button, Input, SaveStatus } from './components/ui';
import { useAuth } from './context/AuthContext';
import { useCV } from './hooks/useCV';
import { generatePDF } from './utils/generatePDF';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar user={user} />
      <main className="pt-20">
        <section className="py-12 px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Build a <span className="text-indigo-400">Professional</span> CV<br/>in Minutes
          </h1>
          <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
            Create a clean, professional CV with structured sections. Download as PDF instantly.
            No complex formatting, just fill in your details.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="px-8 py-3 bg-indigo-600 text-white rounded-xl">Dashboard</Link>
            ) : (
              <>
                <Link to="/auth/signup" className="px-8 py-3 bg-indigo-600 text-white rounded-xl">Get Started</Link>
                <Link to="/auth/signin" className="px-8 py-3 border border-white text-white rounded-xl">Log In</Link>
              </>
            )}
          </div>
        </section>
        <section className="py-10 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
            <div className="bg-slate-800 p-5 rounded-xl text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-sm">Clean Format</h3>
              <p className="text-slate-400 text-xs mt-1">Professional fonts and layout</p>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl text-center">
              <Download className="h-6 w-6 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-sm">Instant PDF</h3>
              <p className="text-slate-400 text-xs mt-1">Download in browser, no watermarks</p>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl text-center">
              <Shield className="h-6 w-6 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-sm">Secure & Saved</h3>
              <p className="text-slate-400 text-xs mt-1">Your data is saved securely</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CVBuilder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="mt-2 text-slate-600">
            {isSignUp ? 'Start building your CV' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

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

          <Button type="submit" className="w-full" isLoading={loading}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            to={isSignUp ? '/auth/signin' : '/auth/signup'}
            className="font-medium text-slate-900 hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data, setData, isLoading, saveStatus } = useCV(Boolean(user));

  function handleDownload() {
    generatePDF(data);
  }

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-slate-900">CV Builder</h1>
            </Link>
            <SaveStatus status={saveStatus} />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1920px] mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 xl:w-5/12 space-y-6 overflow-y-auto h-[calc(100vh-140px)] pr-2 custom-scrollbar">
          <CVForm data={data} onChange={setData} />
        </div>

        <div className="hidden lg:block w-full lg:w-1/2 xl:w-7/12 bg-slate-200 rounded-xl p-8 overflow-y-auto h-[calc(100vh-140px)] flex justify-center shadow-inner">
          <div className="w-[210mm] origin-top scale-[0.8] xl:scale-100 transition-transform">
            <CVPreview data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}
