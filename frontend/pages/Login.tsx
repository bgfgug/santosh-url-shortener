
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import ErrorMessage from '../shared/components/ErrorMessage';
import FormInput from '../shared/components/FormInput';
import { parseApiError, getFieldErrors, validateEmail } from '../shared/utils';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = (location.state as any)?.message;

  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      email: touched.email ? (validateEmail(email) || undefined) : undefined,
      password: touched.password ? (password.length === 0 ? "Password is required" : undefined) : undefined
    }));
  }, [email, password, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });
    
    const emailErr = validateEmail(email);
    const passErr = password.length === 0 ? "Password is required" : null;

    if (emailErr || passErr) return;

    setLoading(true);
    setApiErrors([]);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setApiErrors(parseApiError(err));
      const backendFieldErrors = getFieldErrors(err);
      setFieldErrors(prev => ({ ...prev, ...backendFieldErrors }));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !validateEmail(email) && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Welcome Back</h2>
        
        {successMsg && !apiErrors.length && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md text-sm animate-in fade-in">
            {successMsg}
          </div>
        )}

        <ErrorMessage messages={apiErrors} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            onClear={() => { setEmail(''); setTouched(prev => ({ ...prev, email: false })); }}
            error={fieldErrors.email}
            placeholder="name@example.com"
            disabled={loading}
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            onClear={() => { setPassword(''); setTouched(prev => ({ ...prev, password: false })); }}
            error={fieldErrors.password}
            placeholder="••••••••"
            disabled={loading}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading || !isFormValid}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600 text-sm">
          Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline transition-all">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
