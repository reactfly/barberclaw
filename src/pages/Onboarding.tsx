import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Store, Clock, Scissors, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else navigate('/admin');
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-lime-400" />
          <h1 className="text-xl font-bold tracking-tight">
            Barber<span className="text-lime-400 font-normal">Flow</span>
          </h1>
        </div>
        <div className="text-sm font-medium text-slate-400">
          Passo {step} de 4
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-lime-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="w-12 h-12 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-6">
                  <Store className="w-6 h-6 text-lime-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Dados da Barbearia</h2>
                <p className="text-slate-400 mb-8">Vamos começar com as informações básicas do seu negócio.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Barbearia</label>
                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="Ex: Navalha de Ouro" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">CNPJ / CPF</label>
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="00.000.000/0000-00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp</label>
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Endereço Completo</label>
                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" placeholder="Rua, Número, Bairro, Cidade - UF" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Horário de Funcionamento</h2>
                <p className="text-slate-400 mb-8">Defina os dias e horários que sua barbearia está aberta.</p>
                
                <div className="space-y-3">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, idx) => (
                    <div key={day} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked={idx !== 6} className="w-5 h-5 accent-lime-400 rounded" />
                        <span className="font-medium">{day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="time" defaultValue="09:00" className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-lime-400" disabled={idx === 6} />
                        <span className="text-slate-500">até</span>
                        <input type="time" defaultValue="19:00" className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-lime-400" disabled={idx === 6} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <div className="w-12 h-12 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-6">
                  <Scissors className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Serviços Iniciais</h2>
                <p className="text-slate-400 mb-8">Adicione os principais serviços que você oferece. Você poderá adicionar mais depois.</p>
                
                <div className="space-y-4">
                  {[
                    { name: 'Corte Clássico', price: '45,00', duration: '30' },
                    { name: 'Barba', price: '35,00', duration: '30' },
                    { name: 'Combo (Corte + Barba)', price: '70,00', duration: '60' }
                  ].map((service, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 rounded-xl bg-black/30 border border-white/5 items-center">
                      <div className="col-span-12 md:col-span-6">
                        <input type="text" defaultValue={service.name} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-400" />
                      </div>
                      <div className="col-span-6 md:col-span-3 relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">R$</span>
                        <input type="text" defaultValue={service.price} className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-lime-400" />
                      </div>
                      <div className="col-span-6 md:col-span-3 relative">
                        <input type="text" defaultValue={service.duration} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-400" />
                        <span className="absolute right-3 top-2 text-slate-500 text-sm">min</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 border border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-white/40 transition-colors font-medium text-sm">
                    + Adicionar outro serviço
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-6">
                  <CreditCard className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Escolha seu Plano</h2>
                <p className="text-slate-400 mb-8">Selecione o plano ideal para o tamanho do seu negócio.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pro Plan */}
                  <div className="relative p-6 rounded-2xl border-2 border-lime-400 bg-lime-400/5 cursor-pointer">
                    <div className="absolute top-0 right-0 bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                      RECOMENDADO
                    </div>
                    <h3 className="text-xl font-bold mb-1">Plano PRO</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">R$ 99</span>
                      <span className="text-slate-400 text-sm">/mês</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Até 5 barbeiros</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Agendamentos ilimitados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Lembretes via WhatsApp</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Visagismo IA (100/mês)</li>
                    </ul>
                    <div className="w-full text-center py-2 bg-lime-400 text-black font-bold rounded-lg">
                      Selecionado
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/30 cursor-pointer transition-colors">
                    <h3 className="text-xl font-bold mb-1">Plano PREMIUM</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">R$ 199</span>
                      <span className="text-slate-400 text-sm">/mês</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Barbeiros ilimitados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Múltiplas unidades</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Relatórios financeiros avançados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Visagismo IA Ilimitado</li>
                    </ul>
                    <div className="w-full text-center py-2 border border-white/20 text-white font-bold rounded-lg">
                      Selecionar
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/10">
              <button 
                onClick={handlePrev}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowLeft className="w-5 h-5" /> Voltar
              </button>
              
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-lime-400 text-black px-8 py-3 rounded-full font-bold hover:bg-lime-500 transition-colors"
              >
                {step === 4 ? 'Finalizar e Acessar Painel' : 'Próximo Passo'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
