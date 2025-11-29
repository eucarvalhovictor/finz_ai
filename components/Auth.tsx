import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { WalletIcon } from './icons/Icons';
import AnimatedBackground from './AnimatedBackground';
import { AppConfig, AuthMode } from '../types';

interface AuthComponentProps {
    appConfig?: AppConfig | null;
    defaultMode?: AuthMode;
    navigate: (path: string) => void; // NOVO: Prop para navegação
}

const AuthComponent: React.FC<AuthComponentProps> = ({ appConfig, defaultMode = 'login', navigate }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Reage a mudanças na URL (via prop defaultMode) para resetar o estado do formulário
  useEffect(() => {
      setIsLogin(defaultMode === 'login');
      setIsForgotPasswordMode(false);
      setError(null);
      setMessage(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
  }, [defaultMode]);


  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (!firstName) {
            throw new Error('O campo "Nome" é obrigatório.');
        }
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName || null
                }
            }
        });
        if (error) throw error;
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmação.');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
      });
      if (error) throw error;
      setMessage('Link de recuperação de senha enviado! Verifique seu e-mail.');
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: 'login' | 'signup' | 'forgotPassword') => {
      if (mode === 'login') {
          navigate('/login');
      } else if (mode === 'signup') {
          navigate('/signup');
      } else if (mode === 'forgotPassword') {
          // Forgot password é um estado interno, não uma rota separada
          setError(null);
          setMessage(null);
          setEmail('');
          setPassword('');
          setIsLogin(false);
          setIsForgotPasswordMode(true);
      }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          {appConfig?.site_logo ? (
              <img src={appConfig.site_logo} alt="Logo" className="h-12 w-12 object-contain mx-auto" />
          ) : (
              <WalletIcon className="h-12 w-12 text-brand-primary mx-auto" />
          )}
          <h1 className="text-3xl font-bold text-text-primary mt-4">Bem-Vindo ao Finz.</h1>
          <p className="text-text-secondary mt-2">
            {isForgotPasswordMode ? 'Recupere sua senha.' : (isLogin ? 'Faça login para acessar seu dashboard.' : 'Crie sua conta para começar.')}
          </p>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border">
          {isForgotPasswordMode ? (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
                  E-mail
                </label>
                <input
                  className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full disabled:opacity-50 transition-colors"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </div>
              <p className="text-center text-text-secondary text-sm mt-6">
                Lembrou da senha?
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-brand-primary hover:text-brand-secondary ml-1"
                >
                  Faça login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleAuth}>
            {!isLogin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="firstName">
                            Nome
                        </label>
                        <input
                            className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            id="firstName" type="text" placeholder="Seu nome"
                            value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                        />
                    </div>
                     <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="lastName">
                            Sobrenome
                        </label>
                        <input
                            className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            id="lastName" type="text" placeholder="Opcional"
                            value={lastName} onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
            )}
            <div className="mb-4">
              <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
                E-mail
              </label>
              <input
                className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
                Senha
              </label>
              <input
                className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
                 <div className="mb-6">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="confirmPassword">
                        Confirmar Senha
                    </label>
                    <input
                        className="w-full px-4 py-3 text-text-primary bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        id="confirmPassword" type="password" placeholder="********"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    />
                </div>
            )}
            {isLogin && (
                <div className="text-right mb-4">
                    <button
                        type="button"
                        onClick={() => switchMode('forgotPassword')}
                        className="font-bold text-text-secondary hover:text-brand-primary text-sm"
                    >
                        Esqueceu sua senha?
                    </button>
                </div>
            )}
            <div className="flex items-center justify-between">
              <button
                className="bg-brand-primary hover:bg-brand-secondary text-black font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full disabled:opacity-50 transition-colors"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </button>
            </div>
          </form>
          )}

          {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}
          {message && <p className="mt-4 text-center text-green-400 text-sm">{message}</p>}

          {!isForgotPasswordMode && (
            <p className="text-center text-text-secondary text-sm mt-6">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                className="font-bold text-brand-primary hover:text-brand-secondary ml-1"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
