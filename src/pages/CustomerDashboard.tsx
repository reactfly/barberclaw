import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Image as ImageIcon, Scissors, LogOut, Loader2, Star, CreditCard } from 'lucide-react';
import { getCurrentSessionContext, signOutCurrentUser, type ProfileRecord } from '../lib/auth';

export const CustomerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const context = await getCurrentSessionContext();
        if (context?.profile && isMounted) {
          setProfile(context.profile);
        }
      } catch {
        // Handle error
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await signOutCurrentUser();
      navigate('/login');
    } catch {
      // 
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="marketplace-shell min-h-screen bg-[#050505] text-slate-100 font-sans pb-10">
      <header className="border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400">
              <Scissors className="h-5 w-5 text-black" />
            </div>
            <span className="marketplace-display text-xl font-bold tracking-tight text-white">
              Barber<span className="font-normal text-lime-400">Flow</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="text-sm font-medium text-lime-400 hover:text-lime-300">
              Explorar Barbearias
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="marketplace-fluid-title text-white">Bem-vindo, {profile.full_name}</h1>
            <p className="marketplace-copy mt-2 text-slate-400">Gerencie seus agendamentos, pontos e histórico.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Menu Lateral / Resumo */}
          <div className="flex flex-col gap-6 md:col-span-1">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/20 text-2xl font-bold text-lime-400">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{profile.full_name}</h3>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Barbearia Principal</span>
                  <span className="font-medium text-white">{profile.primary_barbershop_id ? 'Vinculado' : 'Nenhuma'}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-400">Cliente desde</span>
                  <span className="font-medium text-white">{new Date(profile.created_at || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.15),transparent_50%)] p-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                <h3 className="font-bold text-white">Programa de Pontos</h3>
              </div>
              <p className="mt-4 text-3xl font-black text-lime-400">450 <span className="text-base font-normal text-slate-400">pts</span></p>
              <p className="mt-2 text-sm text-slate-300">Você está a 50 pontos de um corte gratuito!</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/50">
                <div className="h-full w-[90%] bg-lime-400" />
              </div>
            </div>
          </div>

          {/* Área Principal de Conteúdo */}
          <div className="flex flex-col gap-6 md:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Próximos Agendamentos</h3>
                <Link to="/marketplace" className="text-sm font-medium text-lime-400 hover:text-lime-300">Novo Agendamento</Link>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-lime-400/10">
                      <span className="text-xs font-bold uppercase text-lime-400">Nov</span>
                      <span className="text-lg font-black text-lime-300">12</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Corte Degradê + Barba</h4>
                      <p className="inline-flex items-center gap-1 text-sm text-slate-400">
                        <Calendar className="h-3 w-3" /> 14:30 com <span className="text-slate-300">Marcão</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="rounded-full border border-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/5">Reagendar</button>
                     <button className="rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/20">Cancelar</button>
                  </div>
                </div>

                <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 py-8 text-slate-500">
                  <p>Fim dos agendamentos futuros.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ImageIcon className="h-5 w-5 text-sky-400" />
                  <h3 className="font-bold text-white">Galeria de Cortes</h3>
                </div>
                <p className="mb-4 text-sm text-slate-400">Salve fotos dos seus cortes preferidos para mostrar ao barbeiro na próxima visita.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-xl bg-zinc-900" />
                  <div className="aspect-square rounded-xl bg-zinc-900" />
                  <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-white/20 bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer text-slate-500 text-2xl">+</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <h3 className="font-bold text-white">Histórico e Pagamentos</h3>
                </div>
                <p className="mb-4 text-sm text-slate-400">Consulte seus últimos cortes realizados e métodos de pagamentos cadastrados.</p>
                <Link to="#" className="text-sm font-medium text-white hover:underline">Ver histórico completo &rarr;</Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
