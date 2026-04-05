import React, { useState } from 'react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { Plus, Edit2, Trash2, Percent } from 'lucide-react';

const MOCK_STAFF = [
  { id: 1, name: 'Carlos Silva', role: 'Barbeiro Sênior', commission: 50, status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=carlos' },
  { id: 2, name: 'Rafael Mendes', role: 'Barbeiro', commission: 40, status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=rafael' },
  { id: 3, name: 'Lucas Almeida', role: 'Barbeiro Aprendiz', commission: 30, status: 'Férias', avatar: 'https://i.pravatar.cc/150?u=lucas' },
];

export const AdminStaff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold">Equipe & Barbeiros</h2>
            <p className="text-sm text-slate-400">Gerencie seus profissionais e comissões</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Barbeiro
          </button>
        </header>

        <div className="p-8">
          {/* Staff List */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400 bg-black/20">
                  <th className="p-4 font-medium">Profissional</th>
                  <th className="p-4 font-medium">Cargo</th>
                  <th className="p-4 font-medium">Comissão</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {MOCK_STAFF.map((staff) => (
                  <tr key={staff.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-bold">{staff.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{staff.role}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-lime-400 font-medium bg-lime-400/10 w-fit px-2 py-1 rounded-md">
                        <Percent className="w-3 h-3" /> {staff.commission}%
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        staff.status === 'Ativo' ? 'bg-lime-400/20 text-lime-400' : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold mb-6">Adicionar Novo Profissional</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="Ex: João Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email (para login)</label>
                <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="joao@barberflow.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cargo</label>
                  <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="Barbeiro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Comissão (%)</label>
                  <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="50" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-lime-400 text-black px-6 py-2 rounded-full font-bold hover:bg-lime-500 transition-colors"
              >
                Salvar Profissional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
