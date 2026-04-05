import React, { useState } from 'react';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 09:00 to 19:00
const BARBERS = [
  { id: '1', name: 'Carlos Silva' },
  { id: '2', name: 'Rafael Mendes' },
  { id: '3', name: 'Lucas Almeida' },
];

const MOCK_APPOINTMENTS = [
  { id: '1', barberId: '1', customer: 'João Pedro', service: 'Corte Clássico', time: '10:00', duration: 1, color: 'bg-lime-400/20 border-lime-400/50 text-lime-400' },
  { id: '2', barberId: '2', customer: 'Marcos Silva', service: 'Barba Terapia', time: '11:00', duration: 1, color: 'bg-blue-400/20 border-blue-400/50 text-blue-400' },
  { id: '3', barberId: '1', customer: 'Pedro Alves', service: 'Combo', time: '14:00', duration: 2, color: 'bg-purple-400/20 border-purple-400/50 text-purple-400' },
];

export const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(addDays(currentDate, -1));
  const today = () => setCurrentDate(new Date());

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Agenda</h2>
            <p className="text-sm text-slate-400">Gerencie os horários da sua equipe</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
              <button onClick={prevDay} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={today} className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-md transition-colors">Hoje</button>
              <button onClick={nextDay} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-bold min-w-[200px] text-center">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <button className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-colors">
              <Plus className="w-4 h-4" /> Novo Agendamento
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
            {/* Calendar Header (Barbers) */}
            <div className="flex border-b border-white/10 bg-black/20 shrink-0">
              <div className="w-20 shrink-0 border-r border-white/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              {BARBERS.map(barber => (
                <div key={barber.id} className="flex-1 p-4 text-center border-r border-white/10 last:border-0 font-bold">
                  {barber.name}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto relative">
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b border-white/5 h-24 group">
                  <div className="w-20 shrink-0 border-r border-white/10 flex items-start justify-center p-2 text-xs text-slate-500 font-medium">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                  {BARBERS.map(barber => {
                    // Find appointment for this slot
                    const appointment = MOCK_APPOINTMENTS.find(
                      a => a.barberId === barber.id && a.time === `${hour.toString().padStart(2, '0')}:00`
                    );

                    return (
                      <div key={`${barber.id}-${hour}`} className="flex-1 border-r border-white/10 last:border-0 relative p-1 hover:bg-white/5 transition-colors cursor-pointer">
                        {appointment && (
                          <div 
                            className={`absolute inset-x-2 top-2 rounded-xl p-3 border ${appointment.color} shadow-lg z-10`}
                            style={{ height: `calc(${appointment.duration * 100}% - 16px)` }}
                          >
                            <p className="font-bold text-sm truncate">{appointment.customer}</p>
                            <p className="text-xs opacity-80 truncate">{appointment.service}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
