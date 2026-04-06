import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, Sparkles, X } from 'lucide-react';
import { PLATFORM_MODULES } from '../../data/platformAdmin';
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const groupedModules = useMemo(() => {
    const grouped = new Map<string, typeof PLATFORM_MODULES>();
    for (const module of PLATFORM_MODULES) {
      const current = grouped.get(module.group) ?? [];
      current.push(module);
      grouped.set(module.group, current);
    }
    return Array.from(grouped.entries());
  }, []);

  const quickResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands.slice(0, 8);
    }
    return commands.filter((item) => `${item.label} ${item.caption} ${item.category}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [commands, query]);

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Platform Control</p>
            <h1 className="mt-2 text-2xl font-black text-white">BarberClaw OS</h1>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-2xl border border-white/10 p-2 text-slate-300 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {groupedModules.map(([group, items]) => (
          <div key={group} className="mb-6">
            <p className="mb-3 px-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">{group}</p>
            <div className="space-y-1.5">
              {items.map((module) => {
                const Icon = platformIconMap[module.icon];
                const href = module.slug === 'overview' ? '/admin' : `/admin/${module.slug}`;
                const active = location.pathname === href;
                return (
                  <Link
                    key={module.slug}
                    to={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-3 transition-all',
                      active ? 'bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <div>
                      <div className="text-sm font-semibold">{module.shortLabel}</div>
                      <div className="text-[11px] text-slate-500">{module.primaryAction}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
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
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-[#05070d]/95 backdrop-blur md:block">
          <SidebarContent />
        </aside>

        {isOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-80 border-r border-white/10 bg-[#05070d] shadow-2xl shadow-black/50">
              <SidebarContent />
            </aside>
          </div>
        ) : null}

        <main className="relative flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070d]/88 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setIsOpen(true)} className="mt-1 rounded-2xl border border-white/10 p-2 text-white md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
                    <Sparkles className="h-3.5 w-3.5" />
                    Super Admin Marketplace
                  </div>
                  <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-[280px] flex-1 lg:w-[360px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar modulos, barbearias e administradores"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  />
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-3xl border border-white/10 bg-[#05070d]/95 shadow-2xl shadow-black/50 backdrop-blur">
                    {quickResults.map((result) => (
                      <Link key={result.id} to={result.href} className="flex items-start justify-between gap-4 border-b border-white/5 px-4 py-3 text-sm transition hover:bg-white/5">
                        <div>
                          <div className="font-semibold text-white">{result.label}</div>
                          <div className="text-xs text-slate-500">{result.caption}</div>
                        </div>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">{result.category}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {actions}
                  <button type="button" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300">
                    <Bell className="h-4 w-4" />
                  </button>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <div className="font-semibold text-white">{profile.full_name}</div>
                    <div className="text-xs text-slate-400">{profile.email ?? 'super-admin@barberclaw'}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
