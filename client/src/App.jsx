import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import { AuthPage, Dashboard } from './pages';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-900 mb-4"></div>
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RootRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullScreenLoader />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/auth/signin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/auth/signin"
        element={
          <PublicOnlyRoute>
            <AuthPage mode="signin" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <PublicOnlyRoute>
            <AuthPage mode="signup" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

