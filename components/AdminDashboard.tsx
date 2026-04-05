import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';
import { Barber, Appointment } from '../types';
import { Plus, Trash2, Calendar, Clock, X, Lock, Unlock, Cpu, Check } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'agenda' | 'equipe' | 'configuracoes'>('agenda');
  
  // Add Barber Form
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');

  // Schedule Management State
  const [managingScheduleBarber, setManagingScheduleBarber] = useState<Barber | null>(null);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);

  // Settings State
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');
  const [geminiImageModel, setGeminiImageModel] = useState(localStorage.getItem('gemini_image_model') || 'gemini-2.5-flash-image');

  const handleSaveSettings = () => {
    localStorage.setItem('gemini_model', geminiModel);
    localStorage.setItem('gemini_image_model', geminiImageModel);
    alert('Configurações salvas com sucesso!');
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update schedule slots when date or barber changes
  useEffect(() => {
    if (managingScheduleBarber) {
      const slots = backendService.getAdminSlotsStatus(managingScheduleBarber.id, scheduleDate);
      setScheduleSlots(slots);
    }
  }, [managingScheduleBarber, scheduleDate, appointments]); // Re-fetch if appointments change

  const refreshData = () => {
    setBarbers(backendService.getBarbers());
    // Sort appointments by date/time desc
    const apps = backendService.getAppointments().sort((a, b) => {
      return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
    });
    setAppointments(apps);
  };

  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBarberName && newBarberSpecialty) {
      backendService.addBarber(newBarberName, newBarberSpecialty);
      setNewBarberName('');
      setNewBarberSpecialty('');
      refreshData();
    }
  };

  const handleDeleteBarber = (id: string) => {
    if (confirm('Tem certeza que deseja remover este barbeiro?')) {
      backendService.deleteBarber(id);
      refreshData();
    }
  };

  const toggleSlotBlock = (time: string, currentStatus: string) => {
    if (currentStatus === 'booked') {
      alert("Não é possível bloquear um horário que já possui agendamento. Cancele o agendamento primeiro.");
      return;
    }
    
    if (managingScheduleBarber) {
      backendService.toggleSlotBlock(managingScheduleBarber.id, scheduleDate, time);
      // Refresh local slots view
      const updatedSlots = backendService.getAdminSlotsStatus(managingScheduleBarber.id, scheduleDate);
      setScheduleSlots(updatedSlots);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h1 className="text-8xl font-display font-normal tracking-tight text-white">Painel Administrativo</h1>
          <div className="bg-[#1c1c1e] p-1 rounded-full border border-white/5 flex overflow-x-auto max-w-full">
             <button 
               onClick={() => setActiveTab('agenda')}
               className={`px-6 py-2 rounded-full font-bold text-lg transition-all whitespace-nowrap font-sans uppercase tracking-wide ${activeTab === 'agenda' ? 'bg-lime-400 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               Agenda
             </button>
             <button 
               onClick={() => setActiveTab('equipe')}
               className={`px-6 py-2 rounded-full font-bold text-lg transition-all whitespace-nowrap font-sans uppercase tracking-wide ${activeTab === 'equipe' ? 'bg-lime-400 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               Equipe
             </button>
             <button 
               onClick={() => setActiveTab('configuracoes')}
               className={`px-6 py-2 rounded-full font-bold text-lg transition-all whitespace-nowrap font-sans uppercase tracking-wide ${activeTab === 'configuracoes' ? 'bg-lime-400 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               Configurações
             </button>
          </div>
        </div>

        {activeTab === 'agenda' && (
          <div className="bg-[#1c1c1e] rounded-[32px] border border-white/5 p-8 shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 font-sans uppercase tracking-wider">
              <div className="bg-lime-400 p-2 rounded-lg text-black">
                 <Calendar className="w-5 h-5" />
              </div>
              Agendamentos Realizados
            </h2>

            {appointments.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-[#2c2c2e] rounded-2xl">
                <p className="text-slate-500 font-medium font-sans text-xl">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-lg uppercase tracking-widest font-bold font-sans">
                      <th className="pb-4 pl-4">Data/Hora</th>
                      <th className="pb-4">Cliente</th>
                      <th className="pb-4">Contato</th>
                      <th className="pb-4">Barbeiro</th>
                      <th className="pb-4 text-right pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200 text-lg font-sans">
                    {appointments.map((app) => (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-[#2c2c2e] transition-colors group">
                        <td className="py-5 pl-4 font-mono font-medium">
                          <span className="text-lime-400">{new Date(app.date).toLocaleDateString('pt-BR')}</span> 
                          <span className="text-slate-600 mx-2">|</span> 
                          {app.time}
                        </td>
                        <td className="py-5 font-bold text-white">{app.clientName}</td>
                        <td className="py-5 text-slate-400">
                           {app.clientPhone}
                        </td>
                        <td className="py-5">
                          <span className="bg-[#0f1115] px-3 py-1 rounded-full border border-white/10 text-sm font-medium uppercase">
                            {app.barberName}
                          </span>
                        </td>
                        <td className="py-5 text-right pr-4">
                          <span className="text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            CONFIRMADO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipe' && (
          <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
            {/* List */}
            <div className="md:col-span-2 grid gap-4">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-[#1c1c1e] p-5 rounded-[24px] border border-white/5 flex items-center justify-between group hover:border-lime-400/30 transition-all">
                  <div className="flex items-center gap-5">
                    <img src={barber.avatar} alt={barber.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#2c2c2e]" />
                    <div>
                      <h3 className="font-bold text-2xl text-white group-hover:text-lime-400 transition-colors font-sans uppercase">{barber.name}</h3>
                      <p className="text-lg text-slate-400 font-extralight font-sans">{barber.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setManagingScheduleBarber(barber)}
                      className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors tooltip relative group/btn"
                      title="Gerenciar Horários"
                    >
                      <Clock className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Remover Profissional"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Form */}
            <div className="bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 h-fit shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-sans uppercase tracking-wider">
                <div className="bg-lime-400 p-2 rounded-lg text-black">
                   <Plus className="w-5 h-5" />
                </div>
                Novo Profissional
              </h3>
              <form onSubmit={handleAddBarber} className="space-y-5">
                <div>
                  <label className="text-sm text-slate-500 font-bold uppercase tracking-widest block mb-2 font-sans">Nome Completo</label>
                  <input 
                    type="text" 
                    value={newBarberName}
                    onChange={(e) => setNewBarberName(e.target.value)}
                    className="w-full bg-[#0f1115] border border-[#2c2c2e] rounded-xl p-3 text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 font-medium text-xl font-sans"
                    placeholder="Ex: Pedro Santos"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500 font-bold uppercase tracking-widest block mb-2 font-sans">Especialidade</label>
                  <input 
                    type="text" 
                    value={newBarberSpecialty}
                    onChange={(e) => setNewBarberSpecialty(e.target.value)}
                    className="w-full bg-[#0f1115] border border-[#2c2c2e] rounded-xl p-3 text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 font-medium text-xl font-sans"
                    placeholder="Ex: Barba & Freestyle"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white hover:bg-lime-400 text-black font-normal text-2xl py-4 rounded-full transition-all shadow-lg mt-2 font-economica uppercase tracking-wide"
                >
                  Cadastrar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MANAGEMENT MODAL */}
      {managingScheduleBarber && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-[#1c1c1e] w-full max-w-2xl rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="bg-[#2c2c2e] p-6 flex items-center justify-between flex-shrink-0">
                 <div className="flex items-center gap-4">
                    <img src={managingScheduleBarber.avatar} className="w-12 h-12 rounded-full border-2 border-lime-400" />
                    <div>
                       <h3 className="text-white font-bold text-2xl font-sans uppercase">{managingScheduleBarber.name}</h3>
                       <p className="text-slate-400 text-sm font-sans">Gerenciar Disponibilidade</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setManagingScheduleBarber(null)}
                   className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto">
                 
                 {/* Date Selector */}
                 <div className="mb-8">
                    <label className="text-sm text-slate-500 font-bold uppercase tracking-widest block mb-2 font-sans">Selecione a Data</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-[#0f1115] border border-[#2c2c2e] rounded-xl p-4 text-white font-bold text-2xl focus:border-lime-400 focus:outline-none uppercase font-sans"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                 </div>

                 {/* Slots Grid */}
                 <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-sm text-slate-500 font-bold uppercase tracking-widest font-sans">Horários do Dia</label>
                       <div className="flex gap-4 text-xs uppercase font-bold text-slate-500 font-sans">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-lime-400/20 border border-lime-400 rounded-full"></span> Disponível</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500/20 border border-red-500 rounded-full"></span> Bloqueado</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500/20 border border-blue-500 rounded-full"></span> Agendado</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                       {scheduleSlots.map((slot) => (
                          <button
                             key={slot.time}
                             onClick={() => toggleSlotBlock(slot.time, slot.status)}
                             disabled={slot.status === 'booked'}
                             className={`
                                py-3 rounded-xl border font-bold text-lg flex flex-col items-center justify-center gap-1 transition-all font-sans relative overflow-hidden group
                                ${slot.status === 'booked' 
                                   ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 cursor-not-allowed' 
                                   : slot.status === 'blocked'
                                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                      : 'bg-lime-400/5 border-lime-400/30 text-lime-400 hover:bg-lime-400 hover:text-black'
                                }
                             `}
                          >
                             {slot.time}
                             
                             {/* Status Icon */}
                             <span className="text-[10px] uppercase font-black opacity-60">
                                {slot.status === 'booked' && 'Reservado'}
                                {slot.status === 'blocked' && 'Bloqueado'}
                                {slot.status === 'available' && 'Livre'}
                             </span>

                             {/* Hover Icon for Action */}
                             <div className={`absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm ${slot.status === 'booked' ? 'hidden' : ''}`}>
                                {slot.status === 'blocked' ? <Unlock className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}

      {activeTab === 'configuracoes' && (
        <div className="bg-[#1c1c1e] rounded-[32px] border border-white/5 p-8 shadow-2xl animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 font-sans uppercase tracking-wider">
            <div className="bg-lime-400 p-2 rounded-lg text-black">
               <Cpu className="w-5 h-5" />
            </div>
            Configurações de IA (Gemini)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0f1115] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Modelo de Análise (Texto)</h3>
              <p className="text-slate-400 mb-6 text-sm">Selecione o modelo usado para analisar o formato do rosto e sugerir cortes.</p>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiModel === 'gemini-3-flash-preview' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiModel" 
                    value="gemini-3-flash-preview"
                    checked={geminiModel === 'gemini-3-flash-preview'}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 3.0 Flash</div>
                    <div className="text-slate-500 text-sm">Rápido e eficiente (Padrão)</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiModel === 'gemini-3.1-flash-preview' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiModel" 
                    value="gemini-3.1-flash-preview"
                    checked={geminiModel === 'gemini-3.1-flash-preview'}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 3.1 Flash</div>
                    <div className="text-slate-500 text-sm">Mais recente, melhor raciocínio</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiModel === 'gemini-3.1-pro-preview' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiModel" 
                    value="gemini-3.1-pro-preview"
                    checked={geminiModel === 'gemini-3.1-pro-preview'}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 3.1 Pro</div>
                    <div className="text-slate-500 text-sm">Máxima precisão analítica</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-[#0f1115] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Modelo de Geração (Imagem)</h3>
              <p className="text-slate-400 mb-6 text-sm">Selecione o modelo usado para gerar a simulação do corte no rosto do cliente.</p>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiImageModel === 'gemini-2.5-flash-image' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiImageModel" 
                    value="gemini-2.5-flash-image"
                    checked={geminiImageModel === 'gemini-2.5-flash-image'}
                    onChange={(e) => setGeminiImageModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 2.5 Flash Image</div>
                    <div className="text-slate-500 text-sm">Geração rápida (Padrão)</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiImageModel === 'gemini-3.1-flash-image-preview' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiImageModel" 
                    value="gemini-3.1-flash-image-preview"
                    checked={geminiImageModel === 'gemini-3.1-flash-image-preview'}
                    onChange={(e) => setGeminiImageModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 3.1 Flash Image</div>
                    <div className="text-slate-500 text-sm">Alta qualidade e resolução</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${geminiImageModel === 'gemini-3-pro-image-preview' ? 'bg-lime-400/10 border-lime-400' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="geminiImageModel" 
                    value="gemini-3-pro-image-preview"
                    checked={geminiImageModel === 'gemini-3-pro-image-preview'}
                    onChange={(e) => setGeminiImageModel(e.target.value)}
                    className="w-5 h-5 accent-lime-400"
                  />
                  <div>
                    <div className="text-white font-bold">Gemini 3.0 Pro Image</div>
                    <div className="text-slate-500 text-sm">Qualidade profissional</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSaveSettings}
              className="bg-lime-400 text-black px-8 py-4 rounded-full font-bold text-xl hover:bg-lime-300 transition-colors flex items-center gap-2 uppercase tracking-wider"
            >
              <Check className="w-6 h-6" /> Salvar Configurações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};