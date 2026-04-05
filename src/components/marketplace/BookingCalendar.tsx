import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore, startOfDay, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface BookingCalendarProps {
  onSelectDateTime: (date: Date, time: string) => void;
}

const AVAILABLE_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ onSelectDateTime }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = startOfDay(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    if (!isBefore(newDate, startOfWeek(today, { weekStartsOn: 0 }))) {
      setCurrentDate(newDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelectDateTime(selectedDate, time);
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const isPast = isBefore(day, today);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, today);

      days.push(
        <div 
          key={i} 
          onClick={() => {
            if (!isPast) {
              setSelectedDate(day);
              if (selectedTime) onSelectDateTime(day, selectedTime);
            }
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${
            isPast ? 'opacity-30 cursor-not-allowed' : 
            isSelected ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]' : 
            'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-lime-400/30'
          }`}
        >
          <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-black/70' : 'text-slate-400'}`}>
            {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
          </span>
          <span className={`text-xl font-bold ${isSelected ? 'text-black' : isToday ? 'text-lime-400' : 'text-white'}`}>
            {format(day, 'd')}
          </span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={prevWeek}
            disabled={isBefore(subWeeks(currentDate, 1), startOfWeek(today, { weekStartsOn: 0 }))}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextWeek}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {renderDays()}
      </div>

      {/* Times Grid */}
      {selectedDate && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-lime-400" />
            <h4 className="font-medium text-sm text-slate-300">Horários Disponíveis</h4>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
            {AVAILABLE_TIMES.map(time => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTime === time 
                    ? 'bg-lime-400 text-black shadow-[0_0_10px_rgba(163,230,53,0.3)]' 
                    : 'bg-white/5 border border-white/10 hover:border-lime-400/50 text-slate-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-lime-400/10 border border-lime-400/20 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-xs text-lime-400 font-medium mb-1">Horário Selecionado</p>
            <p className="font-bold text-white">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
