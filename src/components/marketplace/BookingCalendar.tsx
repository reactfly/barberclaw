import React, { useEffect, useState } from 'react';
import { addDays, addWeeks, format, isBefore, isSameDay, startOfDay, startOfWeek, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock3, Loader2, Sparkles } from 'lucide-react';
import { getPublicAvailability } from '../../lib/publicBookingApi';

interface BookingCalendarProps {
  shopId: string;
  barberId: string | null;
  durationMinutes?: number;
  onSelectDateTime: (date: Date, time: string) => void;
}

const TIME_GROUPS = [
  { label: 'Manha', match: (time: string) => Number(time.split(':')[0]) < 12 },
  { label: 'Tarde', match: (time: string) => Number(time.split(':')[0]) >= 12 && Number(time.split(':')[0]) < 18 },
  { label: 'Noite', match: (time: string) => Number(time.split(':')[0]) >= 18 },
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  shopId,
  barberId,
  durationMinutes,
  onSelectDateTime,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimesForDate, setAvailableTimesForDate] = useState<string[]>([]);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [hoursLabel, setHoursLabel] = useState<string | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const today = startOfDay(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => {
    const previousWeek = subWeeks(currentDate, 1);
    if (!isBefore(previousWeek, startOfWeek(today, { weekStartsOn: 0 }))) {
      setCurrentDate(previousWeek);
    }
  };

  useEffect(() => {
    setSelectedTime(null);
    setAvailableTimesForDate([]);
    setAvailabilityMessage('');
    setHoursLabel(null);
  }, [barberId, durationMinutes, shopId]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimesForDate([]);
      setAvailabilityMessage('');
      setHoursLabel(null);
      return;
    }

    if (!shopId || !barberId || !durationMinutes) {
      setAvailableTimesForDate([]);
      setHoursLabel(null);
      setAvailabilityMessage('Escolha um profissional e um servico para ver horarios reais.');
      return;
    }

    let isMounted = true;
    setIsLoadingAvailability(true);
    setAvailabilityMessage('');

    getPublicAvailability({
      shopId,
      barberId,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      durationMinutes,
    })
      .then((availability) => {
        if (!isMounted) {
          return;
        }

        setAvailableTimesForDate(availability.slots);
        setAvailabilityMessage(
          availability.slots.length > 0
            ? ''
            : availability.message || 'Nao encontramos horarios livres para esta data.'
        );
        setHoursLabel(
          availability.opensAt && availability.closesAt
            ? `${availability.opensAt} - ${availability.closesAt}`
            : null
        );
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setAvailableTimesForDate([]);
        setAvailabilityMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar a disponibilidade agora.'
        );
        setHoursLabel(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [barberId, durationMinutes, selectedDate, shopId]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelectDateTime(selectedDate, time);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="marketplace-label text-xs text-slate-500">Agenda semanal</p>
          <h3 className="marketplace-fluid-card mt-1 text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {durationMinutes ? `Servico previsto para ${durationMinutes} min.` : 'Selecione uma data e veja os horarios disponiveis.'}
          </p>
          {hoursLabel ? <p className="mt-1 text-xs text-slate-500">Horario da casa: {hoursLabel}</p> : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevWeek}
            disabled={isBefore(subWeeks(currentDate, 1), startOfWeek(today, { weekStartsOn: 0 }))}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextWeek}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white transition-colors hover:bg-white/[0.08]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-7">
          {Array.from({ length: 7 }, (_, index) => {
          const day = addDays(startDate, index);
          const isPast = isBefore(day, today);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => {
                setSelectedDate(day);
                setSelectedTime(null);
              }}
              className={`min-w-[72px] rounded-2xl border px-3 py-3 text-center transition-all md:min-w-0 ${
                isSelected
                  ? 'border-lime-400/40 bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.18)]'
                  : isPast
                    ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600'
                    : 'border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <span className={`block text-[11px] font-semibold uppercase tracking-[0.18em] ${isSelected ? 'text-black/70' : 'text-slate-500'}`}>
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className={`mt-1 block text-xl font-bold ${isSelected ? 'text-black' : isToday ? 'text-lime-300' : 'text-white'}`}>
                {format(day, 'd')}
              </span>
            </button>
          );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-8 space-y-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-lime-300" />
            <h4 className="marketplace-label text-sm text-slate-300">
              Horarios para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h4>
          </div>

          {isLoadingAvailability ? (
            <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-lime-300" />
              Buscando disponibilidade em tempo real...
            </div>
          ) : availableTimesForDate.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-400">
              {availabilityMessage || 'Nao encontramos horarios livres para esta data. Escolha outro dia para continuar.'}
            </div>
          ) : (
            <div className="space-y-4">
              {TIME_GROUPS.map((group) => {
                const times = availableTimesForDate.filter(group.match);
                if (times.length === 0) return null;

                return (
                  <div key={group.label}>
                    <p className="marketplace-label mb-3 text-xs text-slate-500">{group.label}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {times.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                            selectedTime === time
                              ? 'border-lime-400/40 bg-lime-400 text-black'
                              : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-lime-400/30 hover:bg-white/[0.06]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="mt-8 rounded-[24px] border border-lime-400/20 bg-lime-400/10 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/15">
              <Sparkles className="h-4 w-4 text-lime-300" />
            </div>
            <div>
              <p className="marketplace-label text-xs text-lime-300">Reserva selecionada</p>
              <p className="mt-1 text-base font-semibold text-white">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} as {selectedTime}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {durationMinutes ? `Bloqueio previsto de ${durationMinutes} min para este atendimento.` : 'Horario pronto para confirmacao na proxima etapa.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
