import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, User, Store } from 'lucide-react';

export const Register: React.FC = () => {
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'OWNER') {
      navigate('/onboarding');
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans flex flex-col">
      <header className="px-6 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <Scissors className="w-6 h-6 text-lime-400" />
          <h1 className="text-xl font-bold tracking-tight">
            Barber<span className="text-lime-400 font-normal">Flow</span>
          </h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Criar Conta</h2>
            <p className="text-slate-400">Junte-se à revolução das barbearias</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                role === 'CUSTOMER' 
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400' 
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Sou Cliente</span>
            </button>
            <button
              onClick={() => setRole('OWNER')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                role === 'OWNER' 
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400' 
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              <Store className="w-6 h-6" />
              <span className="text-sm font-medium">Sou Barbearia</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                  placeholder="João Silva" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="email" 
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                  placeholder="Mínimo 8 caracteres" 
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-lime-400 text-black py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors mt-6"
            >
              {role === 'OWNER' ? 'Continuar para Barbearia' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-lime-400 hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
