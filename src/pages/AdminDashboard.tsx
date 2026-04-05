import React from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { 
  Calendar as CalendarIcon, 
  TrendingUp,
  DollarSign,
  UserPlus
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold">Olá, Carlos</h2>
            <p className="text-sm text-slate-400">Resumo de hoje, 5 de Abril</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/b/barber-flow-premium" className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
              Ver página pública
            </Link>
            <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center text-black font-bold">
              C
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-lime-400" />
                </div>
                <span className="flex items-center text-xs font-bold text-lime-400 bg-lime-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12%
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">Faturamento Hoje</p>
              <h3 className="text-3xl font-bold">R$ 845,00</h3>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Agendamentos</p>
              <h3 className="text-3xl font-bold">14 <span className="text-lg text-slate-500 font-normal">/ 20</span></h3>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Novos Clientes</p>
              <h3 className="text-3xl font-bold">3</h3>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <h3 className="text-xl font-bold mb-4">Próximos Atendimentos</h3>
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="p-4 font-medium">Horário</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Serviço</th>
                  <th className="p-4 font-medium">Profissional</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">14:00</td>
                  <td className="p-4">João Pedro</td>
                  <td className="p-4 text-slate-400">Corte Clássico</td>
                  <td className="p-4">Carlos</td>
                  <td className="p-4"><span className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-md text-xs font-bold">Confirmado</span></td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">14:30</td>
                  <td className="p-4">Marcos Silva</td>
                  <td className="p-4 text-slate-400">Barba Terapia</td>
                  <td className="p-4">Rafael</td>
                  <td className="p-4"><span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-md text-xs font-bold">Pendente</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">15:00</td>
                  <td className="p-4">Lucas Almeida</td>
                  <td className="p-4 text-slate-400">Combo: Cabelo + Barba</td>
                  <td className="p-4">Carlos</td>
                  <td className="p-4"><span className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-md text-xs font-bold">Confirmado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
