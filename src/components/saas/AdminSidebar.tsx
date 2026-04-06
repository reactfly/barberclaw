import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { signOutCurrentUser } from '../../lib/auth';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/calendar', icon: CalendarIcon, label: 'Agenda' },
    { path: '/admin/customers', icon: Users, label: 'Clientes' },
    { path: '/admin/staff', icon: Scissors, label: 'Equipe e Servicos' },
    { path: '/admin/settings', icon: Settings, label: 'Configuracoes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <h1 className="text-xl font-bold tracking-tight">
          Barber<span className="font-normal text-lime-400">Flow</span>
          <span className="ml-2 rounded-sm bg-lime-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">
            PRO
          </span>
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 text-slate-400 hover:text-white md:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-lime-400/10 text-lime-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 text-white shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] md:flex">
        <SidebarContent />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-[#0a0a0a] animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};
