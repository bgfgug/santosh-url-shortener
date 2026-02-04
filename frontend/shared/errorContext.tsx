
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SystemError {
  message: string;
  code?: string;
}

interface ErrorContextType {
  systemError: SystemError | null;
  notifySystemError: (error: SystemError) => void;
  clearSystemError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemError, setSystemError] = useState<SystemError | null>(null);

  const notifySystemError = (error: SystemError) => {
    setSystemError(error);
  };

  const clearSystemError = () => {
    setSystemError(null);
  };

  return (
    <ErrorContext.Provider value={{ systemError, notifySystemError, clearSystemError }}>
      {systemError && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}/></svg>
             </div>
             <div>
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">System Interruption</p>
               <p className="text-sm font-bold">{systemError.message}</p>
             </div>
           </div>
           <button 
             onClick={clearSystemError}
             className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all"
           >
             Acknowledge
           </button>
        </div>
      )}
      {children}
    </ErrorContext.Provider>
  );
};

export const useSystemError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error('useSystemError must be used within ErrorProvider');
  return context;
};
