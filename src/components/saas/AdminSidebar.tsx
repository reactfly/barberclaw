import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Scissors, 
  Settings, 
  LogOut
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/calendar', icon: CalendarIcon, label: 'Agenda' },
    { path: '/admin/customers', icon: Users, label: 'Clientes' },
    { path: '/admin/staff', icon: Scissors, label: 'Equipe & Serviços' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">
          Barber<span className="text-lime-400 font-normal">Flow</span>
          <span className="text-[10px] uppercase tracking-wider bg-lime-400/20 text-lime-400 ml-2 px-2 py-0.5 rounded-sm">PRO</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                active 
                  ? 'bg-lime-400/10 text-lime-400' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" /> Sair
        </Link>
      </div>
    </aside>
  );
};
