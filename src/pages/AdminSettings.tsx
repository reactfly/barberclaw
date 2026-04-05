import React from 'react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { Store, CreditCard, Bell, Shield, Palette } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-sm text-slate-400">Gerencie as preferências da sua barbearia</p>
          </div>
          <button className="bg-lime-400 text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-colors">
            Salvar Alterações
          </button>
        </header>

        <div className="p-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="md:col-span-1 flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium text-left">
                <Store className="w-5 h-5" /> Perfil da Loja
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left">
                <Palette className="w-5 h-5" /> Aparência
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left">
                <CreditCard className="w-5 h-5" /> Assinatura
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left">
                <Bell className="w-5 h-5" /> Notificações
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left">
                <Shield className="w-5 h-5" /> Segurança
              </button>
            </div>

            {/* Settings Content */}
            <div className="md:col-span-3 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6">Informações Básicas</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-lime-400 transition-colors">
                      <span className="text-xs text-slate-400 text-center">Upload<br/>Logo</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Barbearia</label>
                      <input type="text" defaultValue="BarberFlow Premium" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Descrição Curta</label>
                    <textarea 
                      rows={3} 
                      defaultValue="A melhor barbearia da região com visagismo IA."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors resize-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Telefone / WhatsApp</label>
                      <input type="text" defaultValue="(11) 99999-9999" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Instagram</label>
                      <input type="text" defaultValue="@barberflow" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6">Endereço</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">CEP</label>
                    <input type="text" defaultValue="01310-100" className="w-full max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Endereço Completo</label>
                    <input type="text" defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
