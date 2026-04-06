import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers3 } from 'lucide-react';
import type { PlatformMetricCard, PlatformModuleData, PlatformTableRow } from '../../lib/platformAdminApi';

const toneMap: Record<PlatformMetricCard['tone'], string> = {
  lime: 'from-lime-400/20 to-lime-400/5 text-lime-200',
  sky: 'from-sky-400/20 to-sky-400/5 text-sky-200',
  amber: 'from-amber-400/20 to-amber-400/5 text-amber-200',
  rose: 'from-rose-400/20 to-rose-400/5 text-rose-200',
  violet: 'from-violet-400/20 to-violet-400/5 text-violet-200',
  cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200',
};

const renderValue = (value: PlatformTableRow[string]) => value ?? '-';

export const PlatformAdminModulePage: React.FC<{ data: PlatformModuleData }> = ({ data }) => {
  const visibleRows = data.rows.slice(0, 12);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30">
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div>
            <p className="marketplace-kicker text-[11px] text-cyan-200/70">{data.module.group}</p>
            <h3 className="marketplace-fluid-section mt-2 text-white">{data.module.label}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{data.module.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {data.filters.map((filter) => (
                <span key={filter} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
              <Layers3 className="h-4 w-4" />
              Estrutura do modulo
            </div>
            <div className="mt-4 space-y-3">
              {data.blueprintCards.slice(0, 2).map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <h4 className="text-base font-black text-white">{card.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.metrics.map((metric) => (
          <article key={metric.id} className={`rounded-[26px] border border-white/10 bg-gradient-to-br ${toneMap[metric.tone]} p-5 shadow-xl shadow-black/20`}>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-300">{metric.label}</div>
            <div className="marketplace-fluid-card mt-3 text-white">{metric.value}</div>
            <div className="mt-2 text-sm font-semibold">{metric.delta}</div>
            <p className="mt-3 text-sm text-slate-300/80">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#070b11] shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className="text-xl font-black text-white">{data.tableTitle}</h4>
              <p className="mt-1 text-sm text-slate-400">{data.tableDescription}</p>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{data.rows.length} registros</div>
          </div>

          {data.rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500 sm:px-6">Nenhum dado carregado para este modulo ainda.</div>
          ) : (
            <>
              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {visibleRows.map((row) => (
                  <article key={row.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-black/10">
                    <div className="space-y-3">
                      {data.columns.map((column) => (
                        <div key={column.key} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{column.label}</span>
                          <span className="text-right text-sm text-white">{renderValue(row[column.key])}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    <tr>
                      {data.columns.map((column) => (
                        <th key={column.key} className={`px-6 py-4 ${column.align === 'right' ? 'text-right' : ''}`}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.025]">
                        {data.columns.map((column) => (
                          <td key={column.key} className={`px-6 py-4 ${column.align === 'right' ? 'text-right' : ''}`}>
                            {renderValue(row[column.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {data.blueprintCards.map((card) => (
            <article key={card.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
              <h4 className="text-lg font-black text-white">{card.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
              <div className="mt-4 space-y-2">
                {card.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/5 bg-black/20 px-3 py-2 text-sm text-slate-300">
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-xl font-black text-white">Atalhos de operacao</h4>
            <p className="mt-1 text-sm text-slate-400">Acesso rapido para fluxos recorrentes, consultas e acao taticas.</p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Mobile first + pronto para escala
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.commands.slice(0, 9).map((command) => (
            <Link key={command.id} to={command.href} className="rounded-[22px] border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{command.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{command.caption}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-cyan-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
