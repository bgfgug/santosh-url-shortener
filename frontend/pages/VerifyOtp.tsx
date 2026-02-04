
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../features/auth/api';
import ErrorMessage from '../shared/components/ErrorMessage';
import { parseApiError } from '../shared/utils';

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email;

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await authApi.verifyOtp({ email, otp_code: otp });
      navigate('/login', { state: { message: 'Account verified! Please login.' } });
    } catch (err: any) {
      setErrors(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const hasError = errors.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 text-center">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Verify Email</h2>
        <p className="text-slate-600 mb-6">We've sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span></p>
        
        <ErrorMessage messages={errors} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            required 
            maxLength={6}
            value={otp}
            autoFocus
            onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                if (errors.length) setErrors([]); // Clear errors as user types
            }}
            className={`
                w-full text-center text-3xl tracking-[1.2rem] px-4 py-3 border rounded-lg outline-none font-mono transition-all
                ${hasError 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                }
            `}
            placeholder="000000"
          />
          
          <button 
            type="submit" 
            disabled={loading || otp.length !== 6}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : 'Verify OTP'}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/signup')}
          className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Entered the wrong email? Start over
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
