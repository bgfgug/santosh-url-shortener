
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/hooks';
import { ErrorProvider, useSystemError } from './shared/errorContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`text-sm font-bold transition-all px-4 py-2 rounded-xl ${
        isActive 
          ? 'text-indigo-600 bg-indigo-50' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
           <span className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
           </span>
           Shortenly
        </Link>
        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/dashboard">Links</NavLink>
              <NavLink to="/analytics">Insights</NavLink>
              <NavLink to="/profile">Settings</NavLink>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            
            <button 
              onClick={() => logout()}
              className="group flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-sm bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl"
            >
              <span className="hidden sm:inline">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        )}
      </nav>
      {/* Mobile Nav */}
      {user && (
        <div className="sm:hidden bg-white border-b border-slate-100 flex justify-around p-2">
          <NavLink to="/dashboard">Links</NavLink>
          <NavLink to="/analytics">Insights</NavLink>
          <NavLink to="/profile">Settings</NavLink>
        </div>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const MainRouter: React.FC = () => {
  const { notifySystemError } = useSystemError();

  useEffect(() => {
    // Listener for system errors caught by Axios interceptor
    const handleSystemError = (event: any) => {
      notifySystemError({ message: event.detail.message });
    };

    window.addEventListener('app:system_error', handleSystemError);
    return () => window.removeEventListener('app:system_error', handleSystemError);
  }, [notifySystemError]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/analytics" 
          element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ErrorProvider>
  );
};

export default App;
