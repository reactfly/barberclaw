import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, ShieldAlert, TrendingUp } from 'lucide-react';
import { PlatformAdminLayout } from '../../components/platform-admin/PlatformAdminLayout';
import { getPlatformDashboardData, type PlatformAlert, type PlatformDashboardData, type PlatformMetricCard } from '../../lib/platformAdminApi';

const toneMap: Record<PlatformMetricCard['tone'], string> = {
  lime: 'from-lime-400/25 to-lime-400/5',
  sky: 'from-sky-400/25 to-sky-400/5',
  amber: 'from-amber-400/25 to-amber-400/5',
  rose: 'from-rose-400/25 to-rose-400/5',
  violet: 'from-violet-400/25 to-violet-400/5',
  cyan: 'from-cyan-400/25 to-cyan-400/5',
};

const alertTone: Record<PlatformAlert['severity'], string> = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
};

export const PlatformAdminDashboard: React.FC = () => {
  const [data, setData] = useState<PlatformDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    getPlatformDashboardData()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((error) => {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o super admin.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const chartMax = useMemo(() => Math.max(...(data?.trend.map((item) => item.revenue) ?? [1])), [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-red-200">
        {errorMessage || 'Nao foi possivel carregar o super admin.'}
      </div>
    );
  }

  return (
    <PlatformAdminLayout
      profile={data.context.profile}
      title="Centro de controle da marketplace"
      subtitle="Visao executiva de operacao, crescimento, financeiro e seguranca em um unico painel global."
      commands={data.commands}
      actions={
        <Link to="/admin/barbershops" className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 sm:w-auto">
          Nova barbearia
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30">
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
            <div>
              <p className="marketplace-kicker text-[11px] text-cyan-200/70">Visao executiva</p>
              <h3 className="marketplace-fluid-section mt-2 text-white">Marketplace sob controle</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Use este cockpit para acompanhar saude da rede, identificar risco operacional e acelerar a expansao das unidades.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Resumo do turno</div>
              <div className="mt-4 space-y-3">
                {data.alerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{alert.severity}</div>
                    <div className="mt-2 text-base font-black text-white">{alert.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.metrics.map((metric) => (
            <article key={metric.id} className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${toneMap[metric.tone]} p-5 shadow-2xl shadow-black/20`}>
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-300">{metric.label}</div>
              <div className="marketplace-fluid-card mt-3 text-white">{metric.value}</div>
              <div className="mt-2 text-sm font-semibold text-white/90">{metric.delta}</div>
              <p className="mt-3 text-sm text-slate-300/80">{metric.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
          <div className="rounded-[30px] border border-white/10 bg-[#070b11] p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">KPIs em tempo real</p>
                <h3 className="mt-2 text-2xl font-black text-white">Receita, agenda e retencao</h3>
              </div>
              <TrendingUp className="h-6 w-6 text-cyan-300" />
            </div>

            <div className="scrollbar-hide mt-6 grid grid-flow-col auto-cols-[minmax(112px,1fr)] gap-3 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-6 xl:overflow-visible xl:pb-0">
              {data.trend.map((point) => (
                <div key={point.label} className="min-w-[112px] rounded-[24px] border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex h-36 items-end justify-center rounded-[20px] border border-white/5 bg-black/20 p-3 sm:h-44 xl:h-52">
                    <div
                      className="w-full rounded-2xl bg-gradient-to-t from-cyan-400 via-sky-300 to-lime-300"
                      style={{ height: `${Math.max((point.revenue / chartMax) * 100, 10)}%` }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{point.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{point.bookings} ag.</div>
                    <div className="text-xs text-slate-400">{point.retention}% ret.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {data.spotlight.map((item) => (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Spotlight</div>
                <h4 className="mt-3 text-xl font-black text-white">{item.title}</h4>
                <div className="mt-3 text-2xl font-black text-cyan-200">{item.value}</div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.helper}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#070b11] shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Ranking da rede</p>
                <h3 className="mt-2 text-2xl font-black text-white">Melhores barbearias</h3>
              </div>
              <Link to="/admin/barbershops" className="text-sm font-semibold text-cyan-200 transition hover:text-white">
                Ver todas
              </Link>
            </div>

            <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
              {data.rankings.map((row) => (
                <article key={row.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-white">{row.name}</div>
                      <div className="text-sm text-slate-400">{row.city}</div>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                      {row.rating ? row.rating.toFixed(1) : '-'} nota
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Agenda</div>
                      <div className="mt-2 font-semibold text-white">{row.bookings}</div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Receita</div>
                      <div className="mt-2 font-semibold text-white">{row.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Barbearia</th>
                    <th className="px-6 py-4">Cidade</th>
                    <th className="px-6 py-4 text-right">Agenda</th>
                    <th className="px-6 py-4 text-right">Receita</th>
                    <th className="px-6 py-4 text-right">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.map((row) => (
                    <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <td className="px-6 py-4 font-semibold text-white">{row.name}</td>
                      <td className="px-6 py-4 text-slate-400">{row.city}</td>
                      <td className="px-6 py-4 text-right">{row.bookings}</td>
                      <td className="px-6 py-4 text-right">{row.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-6 py-4 text-right text-cyan-200">{row.rating ? row.rating.toFixed(1) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <article key={alert.id} className={`rounded-[28px] border p-5 shadow-xl shadow-black/20 ${alertTone[alert.severity]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {alert.severity}
                    </div>
                    <h4 className="mt-3 text-xl font-black text-white">{alert.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-current/80">{alert.description}</p>
                  </div>
                </div>
                <Link to={alert.actionHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-cyan-200">
                  {alert.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PlatformAdminLayout>
  );
};
