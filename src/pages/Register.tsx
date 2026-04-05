import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Scissors, Store, User } from 'lucide-react';
import { AuthBackground } from '../components/auth/AuthBackground';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export const Register: React.FC = () => {
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate(role === 'OWNER' ? '/onboarding' : '/marketplace');
        return;
      }

      setSuccessMessage('Conta criada. Confirme seu email para concluir o cadastro.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel criar a conta.');
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
            <h2 className="marketplace-fluid-title mb-2 text-white">Criar Conta</h2>
            <p className="marketplace-copy text-slate-300">Junte-se a revolucao das barbearias</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                role === 'CUSTOMER'
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Sou Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('OWNER')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                role === 'OWNER'
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              <Store className="h-6 w-6" />
              <span className="text-sm font-medium">Sou Barbearia</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Nome Completo</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-12 pr-4 text-white transition-colors focus:border-lime-400 focus:outline-none"
                  placeholder="Joao Silva"
                />
              </div>
            </div>

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
              <label className="mb-1 block text-sm font-medium text-slate-300">Senha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-12 pr-4 text-white transition-colors focus:border-lime-400 focus:outline-none"
                  placeholder="Minimo 8 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-bold text-black transition-colors hover:bg-lime-500"
            >
              {isLoading
                ? 'Criando conta...'
                : role === 'OWNER'
                  ? 'Continuar para Barbearia'
                  : 'Criar Conta'}
            </button>
          </form>

          {errorMessage ? (
            <p className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mb-4 rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
              {successMessage}
            </p>
          ) : null}

          <p className="text-center text-sm text-slate-400">
            Ja tem uma conta?{' '}
            <Link to="/login" className="font-medium text-lime-400 hover:underline">
              Faca login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
