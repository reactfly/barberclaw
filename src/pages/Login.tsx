import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, LogIn, Chrome } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email.includes('admin')) {
      navigate('/admin');
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
            <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-400">Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">Senha</label>
                <a href="#" className="text-xs text-lime-400 hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-lime-400 text-black py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors mt-6"
            >
              <LogIn className="w-5 h-5" /> Entrar
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">ou continue com</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-colors mb-6">
            <Chrome className="w-5 h-5" /> Google
          </button>

          <p className="text-center text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-lime-400 hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
