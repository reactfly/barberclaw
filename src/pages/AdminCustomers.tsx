import React from 'react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { Search, UserPlus, Star, Clock } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'João Pedro', email: 'joao@email.com', phone: '(11) 99999-9999', lastVisit: '05/04/2026', totalVisits: 12, rating: 5 },
  { id: 2, name: 'Marcos Silva', email: 'marcos@email.com', phone: '(11) 98888-8888', lastVisit: '01/04/2026', totalVisits: 5, rating: 4 },
  { id: 3, name: 'Lucas Almeida', email: 'lucas@email.com', phone: '(11) 97777-7777', lastVisit: '15/03/2026', totalVisits: 24, rating: 5 },
];

export const AdminCustomers: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold">Clientes</h2>
            <p className="text-sm text-slate-400">Gerencie sua base de clientes e histórico</p>
          </div>
          <button className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-colors">
            <UserPlus className="w-4 h-4" /> Novo Cliente
          </button>
        </header>

        <div className="p-8">
          {/* Search and Filters */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400 transition-colors" 
                placeholder="Buscar por nome, email ou telefone..." 
              />
            </div>
          </div>

          {/* Customers List */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400 bg-black/20">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Contato</th>
                  <th className="p-4 font-medium">Última Visita</th>
                  <th className="p-4 font-medium">Total Visitas</th>
                  <th className="p-4 font-medium">Avaliação Média</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {MOCK_CUSTOMERS.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lime-400">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-bold">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300">{customer.phone}</span>
                        <span className="text-xs text-slate-500">{customer.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" /> {customer.lastVisit}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{customer.totalVisits}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span className="font-bold">{customer.rating}.0</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
