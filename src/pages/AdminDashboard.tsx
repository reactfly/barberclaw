import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  TrendingUp,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { AdminShopSwitcher } from '../components/saas/AdminShopSwitcher';
import { getDashboardData, getStatusMeta, type DashboardData } from '../lib/adminApi';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!isLoading && data) {
      gsap.from('.gsap-stagger-card', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.gsap-action-btn', {
        scale: 0.9,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(1.5)',
      });
    }
  }, [isLoading, data, reloadKey]);

  useEffect(() => {
    let isMounted = true;

    getDashboardData()
      .then((result) => {
        if (isMounted) {
          setData(result);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o dashboard.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return (
    <div className="marketplace-shell min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-10">
        <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-white/10 bg-[#0a0a0a]/80 px-8 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 md:pl-0 flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                Ola, {data?.context.profile.full_name.split(' ')[0] ?? 'Gestor'}
                <span className="flex items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/10 px-2.5 py-1 text-xs font-medium text-lime-400">
                  <Activity className="h-3 w-3 animate-pulse" /> Tempo Real
                </span>
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Resumo online • {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          {data?.context.shop ? (
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              <Link
                to={`/b/${data.context.shop.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-lime-300"
              >
                Ver pagina publica
              </Link>
            </div>
          ) : null}
        </header>

        <div ref={containerRef} className="max-w-7xl space-y-6 p-4 md:p-8">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : data ? (
            <>
              <AdminShopSwitcher
                context={data.context}
                onShopChanged={() => {
                  setIsLoading(true);
                  setReloadKey((current) => current + 1);
                }}
              />

              {/* Trial Banner */}
              {data.context.shop?.subscription_status === 'trialing' && data.context.shop?.trial_ends_at && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-lime-500/10 to-emerald-500/5 border border-lime-400/30 p-5 shadow-[0_0_30px_rgba(163,230,53,0.05)] animate-fade-in-up gsap-stagger-card">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-lime-400/20 flex flex-col items-center justify-center shrink-0 border border-lime-400/30">
                      <ShieldAlert className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lime-400 text-sm mb-0.5">Teste Grátis do Premium Ativo</h4>
                      <p className="text-sm text-slate-300">
                        Restam <strong className="text-white">{Math.max(0, differenceInDays(parseISO(data.context.shop.trial_ends_at), new Date()))} dias</strong> de acesso total liberado antes do primeiro pagamento.
                      </p>
                    </div>
                  </div>
                  <Link to={`/admin`} className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-lime-400 text-black font-bold text-sm hover:scale-[1.02] shadow-[0_0_15px_rgba(163,230,53,0.2)] transition-transform">
                    Garantir Assinatura
                  </Link>
                </div>
              )}

              {!data.context.shop ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
                  <h3 className="text-2xl font-bold text-white">Administrador global ativado</h3>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Sua conta pode cadastrar barbearias e operar o sistema completo. O proximo passo
                    e criar a primeira unidade em Configuracoes para liberar agenda, clientes,
                    equipe e operacao.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/admin/settings"
                      className="rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-lime-300"
                    >
                      Cadastrar primeira barbearia
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/admin/calendar"
                      className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                    >
                      <Plus className="h-4 w-4" /> Novo Agendamento
                    </Link>
                    <Link
                      to="/admin/staff"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4 text-sky-400" /> Equipe e Servicos
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                    >
                      <ArrowUpRight className="h-4 w-4 text-purple-400" /> Barbearias
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                      <div className="absolute right-0 top-0 p-6 opacity-20">
                        <DollarSign className="h-20 w-20 text-lime-400" />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10">
                            <DollarSign className="h-6 w-6 text-lime-400" />
                          </div>
                          <span className="rounded-full bg-lime-400/10 px-2 py-1 text-xs font-bold text-lime-400">
                            <TrendingUp className="mr-1 inline h-3 w-3" /> +12%
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Receita do dia</p>
                        <h3 className="mt-1 text-3xl font-black text-white">
                          {data.revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>Meta diaria: R$ 1.500</span>
                          <span className="text-lime-400">83%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/50">
                          <div className="h-full w-[83%] rounded-full bg-lime-400" />
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10">
                            <CalendarIcon className="h-6 w-6 text-sky-400" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Agendamentos hoje</p>
                        <h3 className="mt-1 text-3xl font-black text-white">
                          {data.appointmentsToday}{' '}
                          <span className="text-xl font-medium text-slate-500">/ {data.appointmentsCapacity || '24'}</span>
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>Ocupacao da agenda</span>
                          <span className="text-sky-400">
                            {(
                              (data.appointmentsToday / (data.appointmentsCapacity || 24)) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/50">
                          <div
                            className="h-full rounded-full bg-sky-400 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (data.appointmentsToday / (data.appointmentsCapacity || 24)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10">
                            <UserPlus className="h-6 w-6 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Novos clientes semana</p>
                        <h3 className="mt-1 text-3xl font-black text-white">{data.newCustomersToday * 3 + 2}</h3>
                        <p className="mt-4 text-xs font-medium text-purple-400">Clientes retidos: 89%</p>
                        <div className="mt-1.5 flex -space-x-2">
                          <img className="h-8 w-8 rounded-full border-2 border-[#0c0c0c]" src="https://i.pravatar.cc/100?img=1" alt="" />
                          <img className="h-8 w-8 rounded-full border-2 border-[#0c0c0c]" src="https://i.pravatar.cc/100?img=2" alt="" />
                          <img className="h-8 w-8 rounded-full border-2 border-[#0c0c0c]" src="https://i.pravatar.cc/100?img=3" alt="" />
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0c0c0c] bg-white/10 text-[10px] font-bold">
                            +12
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-5">
                      <div>
                        <h3 className="text-lg font-bold">Proximos atendimentos</h3>
                        <p className="text-sm text-slate-400">Controle em tempo real da operacao.</p>
                      </div>
                      <Link
                        to="/admin/calendar"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                      >
                        Abrir Agenda
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/5 bg-black/40 text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-4 font-semibold">Horario</th>
                            <th className="px-6 py-4 font-semibold">Cliente</th>
                            <th className="px-6 py-4 font-semibold">Servico</th>
                            <th className="px-6 py-4 font-semibold">Profissional</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {data.upcomingAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                Nenhum agendamento futuro encontrado.
                              </td>
                            </tr>
                          ) : (
                            data.upcomingAppointments.map((appointment) => (
                              <tr
                                key={appointment.id}
                                className="group border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                              >
                                <td className="px-6 py-5">
                                  <span className="font-bold text-white transition-colors group-hover:text-lime-300">
                                    {appointment.startTime}
                                  </span>
                                  <span className="ml-1 text-xs text-slate-500">as {appointment.endTime}</span>
                                </td>
                                <td className="px-6 py-5 font-medium text-white">{appointment.customerName}</td>
                                <td className="px-6 py-5 text-slate-400">{appointment.serviceName}</td>
                                <td className="px-6 py-5 text-slate-300">
                                  <span className="inline-flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400/20 text-[10px] font-bold text-lime-400">
                                      {appointment.barberName.charAt(0)}
                                    </div>
                                    {appointment.barberName}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span
                                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getStatusMeta(appointment.status)} bg-opacity-10 backdrop-blur-sm`}
                                  >
                                    {appointment.status}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right font-black text-lime-300">
                                  {appointment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};
