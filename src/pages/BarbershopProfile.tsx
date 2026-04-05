import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Scissors, Calendar, User, CheckCircle2 } from 'lucide-react';
import { BookingCalendar } from '../components/marketplace/BookingCalendar';

const MOCK_SERVICES = [
  { id: 's1', name: 'Corte Clássico', price: 45, duration: 30, description: 'Corte na tesoura ou máquina com acabamento.' },
  { id: 's2', name: 'Barba Terapia', price: 35, duration: 30, description: 'Toalha quente, massagem facial e alinhamento.' },
  { id: 's3', name: 'Combo: Cabelo + Barba', price: 70, duration: 60, description: 'O pacote completo para o seu visual.' },
  { id: 's4', name: 'Visagismo IA', price: 90, duration: 45, description: 'Análise facial com IA para descobrir seu corte ideal.' },
];

const MOCK_BARBERS = [
  { id: 'b1', name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/150?u=carlos' },
  { id: 'b2', name: 'Rafael Mendes', avatar: 'https://i.pravatar.cc/150?u=rafael' },
  { id: 'b3', name: 'Qualquer Profissional', avatar: '' },
];

export const BarbershopProfile: React.FC = () => {
  const { slug } = useParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{date: Date, time: string} | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); // 1: Service, 2: Barber & Time, 3: Success

  // Mock data based on slug
  const shopName = slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Barbearia';

  const handleNextStep = () => {
    if (bookingStep < 3) setBookingStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans pb-24">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative">
        <img 
          src="https://picsum.photos/seed/barbercover/1200/400" 
          alt="Cover" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
        
        <Link to="/" className="absolute top-6 left-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-4 border-[#0a0a0a] overflow-hidden flex-shrink-0">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${shopName}&backgroundColor=a3e635&textColor=000`} alt="Logo" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{shopName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">4.9</span>
                <span>(128 avaliações)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Av. Paulista, 1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Flow */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
          {bookingStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-lime-400" />
                Escolha o Serviço
              </h2>
              <div className="grid gap-4">
                {MOCK_SERVICES.map(service => (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedService === service.id 
                        ? 'border-lime-400 bg-lime-400/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <span className="font-bold text-lime-400">R$ {service.price}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{service.description}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="w-3 h-3" /> {service.duration} min
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  disabled={!selectedService}
                  onClick={handleNextStep}
                  className="bg-lime-400 text-black px-8 py-3 rounded-full font-bold hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="animate-fade-in">
              <button onClick={() => setBookingStep(1)} className="text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-lime-400" />
                Escolha o Profissional
              </h2>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-8">
                {MOCK_BARBERS.map(barber => (
                  <div 
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber.id)}
                    className={`flex flex-col items-center gap-2 min-w-[100px] p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedBarber === barber.id 
                        ? 'border-lime-400 bg-lime-400/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    {barber.avatar ? (
                      <img src={barber.avatar} alt={barber.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-center">{barber.name}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lime-400" />
                Data e Hora
              </h2>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <BookingCalendar onSelectDateTime={(date, time) => setSelectedDateTime({date, time})} />
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  disabled={!selectedBarber || !selectedDateTime}
                  onClick={handleNextStep}
                  className="bg-lime-400 text-black px-8 py-3 rounded-full font-bold hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="animate-fade-in text-center py-12">
              <div className="w-20 h-20 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-lime-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Agendamento Confirmado!</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Seu horário foi reservado com sucesso. Enviamos os detalhes para o seu WhatsApp.
              </p>
              <Link to="/">
                <button className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                  Voltar para o Início
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
