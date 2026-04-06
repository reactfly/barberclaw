import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome, Lock, LogIn, Mail, Scissors } from 'lucide-react';
import { AuthBackground } from '../components/auth/AuthBackground';
import { getSupabaseClient } from '../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    setIsLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      const role = String(data.user?.user_metadata?.role ?? '').toUpperCase();
      if (role === 'OWNER' || role === 'ADMIN') {
        navigate('/admin');
        return;
      }

      navigate('/marketplace');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="marketplace-shell relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-slate-100">
      <AuthBackground />

      <header className="relative z-10 border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-md sm:px-6">
        <Link to="/" className="flex w-fit items-center gap-2">
          <Scissors className="h-6 w-6 text-lime-400" />
          <h1 className="marketplace-display text-xl font-bold tracking-tight text-white">
            Barber<span className="font-normal text-lime-400">Flow</span>
          </h1>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <h2 className="marketplace-fluid-title mb-2 text-white">Bem-vindo de volta</h2>
            <p className="marketplace-copy text-slate-300">Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleLogin} className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-12 pr-4 text-white transition-colors focus:border-lime-400 focus:outline-none"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Senha</label>
                <a href="#" className="text-xs text-lime-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-12 pr-4 text-white transition-colors focus:border-lime-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 font-bold text-black transition-colors hover:bg-lime-500"
            >
              <LogIn className="h-5 w-5" /> {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {errorMessage ? (
            <p className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 flex-shrink-0 text-sm text-slate-500">ou continue com</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <button className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10">
            <Chrome className="h-5 w-5" /> Google
          </button>

          <p className="text-center text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-lime-400 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
