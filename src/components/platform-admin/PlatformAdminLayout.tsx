import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Command, LogOut, Menu, Search, Sparkles, X } from 'lucide-react';
import { PLATFORM_MODULES, getPlatformModuleHref } from '../../data/platformAdmin';
import type { PlatformCommandItem } from '../../lib/platformAdminApi';
import { signOutCurrentUser, type ProfileRecord } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { platformIconMap } from './iconMap';

interface PlatformAdminLayoutProps {
  profile: ProfileRecord;
  title: string;
  subtitle: string;
  commands: PlatformCommandItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({
  profile,
  title,
  subtitle,
  commands,
  children,
  actions,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setIsSearchActive(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const groupedModules = useMemo(() => {
    const grouped = new Map<string, typeof PLATFORM_MODULES>();
    for (const module of PLATFORM_MODULES) {
      const current = grouped.get(module.group) ?? [];
      current.push(module);
      grouped.set(module.group, current);
    }
    return Array.from(grouped.entries());
  }, []);

  const featuredModules = useMemo(
    () => PLATFORM_MODULES.filter((module) => ['overview', 'barbershops', 'bookings', 'support'].includes(module.slug)).slice(0, 4),
    [],
  );

  const quickResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands.slice(0, 6);
    }

    return commands
      .filter((item) => `${item.label} ${item.caption} ${item.category}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [commands, query]);

  const showSearchResults = isSearchActive && (quickResults.length > 0 || query.trim().length > 0);

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleNavigateFromSearch = () => {
    setIsSearchActive(false);
    setQuery('');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-5 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="marketplace-kicker text-[11px] text-cyan-200/70">Platform Control</p>
            <h1 className="marketplace-fluid-section mt-2 text-white">BarberClaw OS</h1>
            <p className="mt-2 max-w-[18rem] text-sm text-slate-400">Controle global da marketplace com operacao, receita, seguranca e crescimento em um unico fluxo.</p>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-2xl border border-white/10 p-2 text-slate-300 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {featuredModules.map((module) => {
            const Icon = platformIconMap[module.icon];
            const href = getPlatformModuleHref(module.slug);
            const active = location.pathname === href;

            return (
              <Link
                key={module.slug}
                to={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded-2xl border px-3 py-3 transition-all',
                  active
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]',
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {module.shortLabel}
                </div>
                <div className="mt-2 text-xs text-slate-500">{module.group}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {groupedModules.map(([group, items]) => (
          <section key={group} className="mb-6 last:mb-0">
            <p className="marketplace-label mb-3 px-2 text-[10px] text-slate-500">{group}</p>
            <div className="space-y-1.5">
              {items.map((module) => {
                const Icon = platformIconMap[module.icon];
                const href = getPlatformModuleHref(module.slug);
                const active = location.pathname === href;

                return (
                  <Link
                    key={module.slug}
                    to={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'group flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all',
                      active
                        ? 'border-cyan-400/30 bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
                        : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white',
                    )}
                  >
                    <div className={cn('mt-0.5 rounded-xl border p-2', active ? 'border-cyan-300/20 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]')}>
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{module.shortLabel}</div>
                        <ChevronRight className={cn('h-4 w-4 shrink-0 transition', active ? 'text-cyan-200' : 'text-slate-600 group-hover:text-slate-300')} />
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{module.primaryAction}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-4 marketplace-safe-bottom md:pb-4">
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <div className="font-semibold text-white">{profile.full_name}</div>
          <div className="text-xs text-slate-400">{profile.email ?? 'super-admin@barberclaw'}</div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Encerrar sessao
        </button>
      </div>
    </div>
  );

  return (
    <div className="marketplace-shell min-h-screen bg-[#050505] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(163,230,53,0.12),_transparent_26%)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-[296px] shrink-0 border-r border-white/10 bg-[#05070d]/95 backdrop-blur xl:block">
          <SidebarContent />
        </aside>

        {isOpen ? (
          <div className="fixed inset-0 z-50 xl:hidden">
            <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[88vw] max-w-[320px] border-r border-white/10 bg-[#05070d] shadow-2xl shadow-black/50">
              <SidebarContent />
            </aside>
          </div>
        ) : null}

        <main className="relative flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070d]/90 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-white xl:hidden"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
                        <Sparkles className="h-3.5 w-3.5" />
                        Super Admin Marketplace
                      </div>
                      <h2 className="marketplace-fluid-title mt-2 text-white">{title}</h2>
                      <p className="mt-2 max-w-3xl text-sm text-slate-400">{subtitle}</p>
                    </div>
                  </div>

                  <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right sm:block">
                    <div className="text-sm font-semibold text-white">{profile.full_name}</div>
                    <div className="text-xs text-slate-400">{profile.email ?? 'super-admin@barberclaw'}</div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div ref={searchRef} className="relative">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onFocus={() => setIsSearchActive(true)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setIsSearchActive(false);
                          }
                        }}
                        placeholder="Buscar modulos, barbearias, admins e acoes"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white outline-none transition focus:border-cyan-400/40"
                      />
                      {query ? (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            setIsSearchActive(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:flex">
                          <Command className="h-3 w-3" />
                          buscar
                        </div>
                      )}
                    </div>

                    {showSearchResults ? (
                      <div className="animate-slide-in-top absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[28px] border border-white/10 bg-[#05070d]/95 shadow-2xl shadow-black/50 backdrop-blur">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">Atalhos encontrados</div>
                            <div className="text-xs text-slate-500">Navegacao rapida para modulos e operacoes frequentes.</div>
                          </div>
                          <button type="button" onClick={() => setIsSearchActive(false)} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto">
                          {quickResults.length > 0 ? (
                            quickResults.map((result) => (
                              <Link
                                key={result.id}
                                to={result.href}
                                onClick={handleNavigateFromSearch}
                                className="flex items-start justify-between gap-4 border-b border-white/5 px-4 py-3 text-sm transition hover:bg-white/5 last:border-b-0"
                              >
                                <div className="min-w-0">
                                  <div className="font-semibold text-white">{result.label}</div>
                                  <div className="text-xs text-slate-500">{result.caption}</div>
                                </div>
                                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                  {result.category}
                                </span>
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-sm text-slate-500">Nenhum resultado encontrado para essa busca.</div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {actions ? <div className="flex-1 sm:flex-none">{actions}</div> : null}
                    <button type="button" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:border-white/20 hover:text-white">
                      <Bell className="h-4 w-4" />
                    </button>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {commands.length} atalhos indexados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
