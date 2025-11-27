
import React, { useState } from 'react';
import { Wallet, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-100 dark:border-slate-800 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Wallet size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Bem-vindo</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          Gerencie suas finanças pessoais com simplicidade e inteligência.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3.5 px-4 rounded-xl transition-all shadow-sm group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={20} />
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google Logo" 
                  className="w-5 h-5"
                />
                <span>Continuar com Google</span>
              </>
            )}
          </button>
        </div>
        
        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
          Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </div>
  );
};
