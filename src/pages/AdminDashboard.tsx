import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, DollarSign, Loader2, TrendingUp, UserPlus, Activity, Plus, FileText, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { getDashboardData, getStatusMeta, type DashboardData } from '../lib/adminApi';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    getDashboardData()
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o dashboard.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="marketplace-shell min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-10">
        <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-white/10 bg-[#0a0a0a]/80 px-8 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 md:pl-0 flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                Olá, {data?.context.profile.full_name.split(' ')[0] ?? 'Gestor'}
                <span className="flex items-center gap-1.5 rounded-full bg-lime-400/10 px-2.5 py-1 text-xs font-medium text-lime-400 border border-lime-400/20">
                  <Activity className="h-3 w-3 animate-pulse" /> Tempo Real
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Resumo online • {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Link
              to={data ? `/b/${data.context.shop.slug}` : '/marketplace'}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-lime-300"
            >
              Ver página pública
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
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
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.15)]">
                  <Plus className="h-4 w-4" /> Novo Agendamento
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10">
                  <FileText className="h-4 w-4 text-sky-400" /> Comissões
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10">
                  <ArrowUpRight className="h-4 w-4 text-purple-400" /> Impulsionar
                </button>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <DollarSign className="h-20 w-20 text-lime-400" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/20">
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
                      <span>Meta diária: R$ 1.500</span>
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 border border-sky-400/20">
                        <CalendarIcon className="h-6 w-6 text-sky-400" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400">Agendamentos hoje</p>
                    <h3 className="mt-1 text-3xl font-black text-white">
                      {data.appointmentsToday} <span className="text-xl font-medium text-slate-500">/ {data.appointmentsCapacity || '24'}</span>
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Ocupação da agenda</span>
                      <span className="text-sky-400">{(data.appointmentsToday / (data.appointmentsCapacity || 24) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/50">
                      <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${Math.min(100, (data.appointmentsToday / (data.appointmentsCapacity || 24) * 100))}%` }} />
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/10 border border-purple-400/20">
                        <UserPlus className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400">Novos clientes semana</p>
                    <h3 className="mt-1 text-3xl font-black text-white">{data.newCustomersToday * 3 + 2}</h3>
                    <p className="mt-4 text-xs text-purple-400 font-medium">Clientes retidos: 89%</p>
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

              {/* Table/List */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between bg-black/20">
                  <div>
                    <h3 className="text-lg font-bold">Próximos atendimentos</h3>
                    <p className="text-sm text-slate-400">Controle em tempo real da portaria.</p>
                  </div>
                  <Link
                    to="/admin/calendar"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    Abrir Agenda (Visual)
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-black/40 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Horário</th>
                        <th className="px-6 py-4 font-semibold">Cliente</th>
                        <th className="px-6 py-4 font-semibold">Serviço</th>
                        <th className="px-6 py-4 font-semibold">Profissional</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Valor</th>
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
                            className="border-b border-white/5 transition-colors hover:bg-white/[0.03] group"
                          >
                            <td className="px-6 py-5">
                              <span className="font-bold text-white group-hover:text-lime-300 transition-colors">
                                {appointment.startTime}
                              </span>
                              <span className="text-xs text-slate-500 ml-1">às {appointment.endTime}</span>
                            </td>
                            <td className="px-6 py-5 font-medium text-white">{appointment.customerName}</td>
                            <td className="px-6 py-5 text-slate-400">{appointment.serviceName}</td>
                            <td className="px-6 py-5 text-slate-300">
                              <span className="inline-flex items-center gap-1.5">
                                <div className="h-5 w-5 bg-lime-400/20 text-lime-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {appointment.barberName.charAt(0)}
                                </div>
                                {appointment.barberName}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getStatusMeta(appointment.status)} bg-opacity-10 backdrop-blur-sm`}>
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
          ) : null}
        </div>
      </main>
    </div>
  );
};
