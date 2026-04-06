import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Loader2, Search, Star } from 'lucide-react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { AdminShopSwitcher } from '../components/saas/AdminShopSwitcher';
import { getCustomersData, type CustomerSummary } from '../lib/adminApi';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [context, setContext] = useState<Awaited<ReturnType<typeof getCustomersData>>['context'] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getCustomersData()
      .then((result) => {
        if (isMounted) {
          setContext(result.context);
          setCustomers(result.customers);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar os clientes.');
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

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone, customer.lastService]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [customers, query]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0a0a0a]/50 px-8 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="pl-12 md:pl-0">
            <h2 className="text-2xl font-bold">Clientes</h2>
            <p className="text-sm text-slate-400">Historico, recorrencia e reputacao da sua base</p>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : (
            <>
              <AdminShopSwitcher
                context={context}
                onShopChanged={() => {
                  setIsLoading(true);
                  setReloadKey((current) => current + 1);
                }}
              />

              {!context?.shop ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                  <h3 className="text-2xl font-bold text-white">Selecione uma barbearia</h3>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    O administrador global pode alternar entre unidades para analisar a base de clientes de cada operacao.
                  </p>
                </div>
              ) : (
                <>
              <div className="mb-8 flex gap-4">
                <div className="relative flex-1 max-w-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <Search className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-lime-400 focus:outline-none"
                    placeholder="Buscar por nome, email, telefone ou ultimo servico..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
                <table className="min-w-[760px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20 text-sm text-slate-400">
                      <th className="p-4 font-medium">Cliente</th>
                      <th className="p-4 font-medium">Contato</th>
                      <th className="p-4 font-medium">Ultima visita</th>
                      <th className="p-4 font-medium">Total visitas</th>
                      <th className="p-4 font-medium">Ultimo servico</th>
                      <th className="p-4 font-medium">Avaliacao media</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Nenhum cliente encontrado com esse filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-lime-400">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold">{customer.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-slate-300">{customer.phone || 'Nao informado'}</span>
                              <span className="text-xs text-slate-500">{customer.email || 'Nao informado'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="h-4 w-4" /> {customer.lastVisit.split('-').reverse().join('/')}
                            </div>
                          </td>
                          <td className="p-4 font-medium">{customer.totalVisits}</td>
                          <td className="p-4 text-slate-300">{customer.lastService}</td>
                          <td className="p-4">
                            {customer.averageRating ? (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-4 w-4 fill-yellow-400" />
                                <span className="font-bold">{customer.averageRating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">Sem avaliacoes</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
