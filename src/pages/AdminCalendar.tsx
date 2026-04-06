import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Loader2, MinusCircle, Plus } from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminSidebar } from '../components/saas/AdminSidebar';
import {
  createAppointment,
  createBlockedSlot,
  getCalendarData,
  getStatusMeta,
  updateAppointmentStatus,
  type AdminAppointment,
  type AdminBarber,
  type AdminBlockedSlot,
  type AdminService,
  type AppointmentStatus,
  type CalendarData,
} from '../lib/adminApi';

interface AppointmentFormState {
  appointmentDate: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  barberId: string;
  notes: string;
}

interface BlockFormState {
  blockedDate: string;
  startTime: string;
  endTime: string;
  barberId: string;
  reason: string;
}

const DEFAULT_APPOINTMENT_FORM: AppointmentFormState = {
  appointmentDate: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  serviceId: '',
  barberId: '',
  notes: '',
};

const DEFAULT_BLOCK_FORM: BlockFormState = {
  blockedDate: format(new Date(), 'yyyy-MM-dd'),
  startTime: '12:00',
  endTime: '13:00',
  barberId: '',
  reason: '',
};

const slotTimesFromHours = (openTime: string, closeTime: string) => {
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  const start = openHour * 60 + openMinute;
  const end = closeHour * 60 + closeMinute;
  const slots: string[] = [];

  for (let current = start; current < end; current += 30) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }

  return slots;
};

const appointmentDurationSlots = (appointment: AdminAppointment) => {
  const [startHour, startMinute] = appointment.start_time.split(':').map(Number);
  const [endHour, endMinute] = appointment.end_time.split(':').map(Number);
  const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  return Math.max(1, Math.ceil(durationMinutes / 30));
};

export const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>(DEFAULT_APPOINTMENT_FORM);
  const [blockForm, setBlockForm] = useState<BlockFormState>(DEFAULT_BLOCK_FORM);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const dateLabel = format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const currentDateKey = format(currentDate, 'yyyy-MM-dd');

  const load = async (dateKey = currentDateKey) => {
    const result = await getCalendarData(dateKey);
    setData(result);
  };

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    load()
      .catch((error) => {
        if (isMounted) {
          setFeedback(error instanceof Error ? error.message : 'Nao foi possivel carregar a agenda.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentDateKey]);

  useEffect(() => {
    setAppointmentForm((current) => ({ ...current, appointmentDate: currentDateKey }));
    setBlockForm((current) => ({ ...current, blockedDate: currentDateKey }));
  }, [currentDateKey]);

  const slots = useMemo(() => {
    const dayHours = data?.businessHours.find(
      (entry) => entry.day_of_week === currentDate.getDay() && entry.is_open && entry.opens_at && entry.closes_at
    );

    if (!dayHours?.opens_at || !dayHours.closes_at) {
      return slotTimesFromHours('09:00', '19:00');
    }

    return slotTimesFromHours(dayHours.opens_at.slice(0, 5), dayHours.closes_at.slice(0, 5));
  }, [currentDate, data]);

  const appointmentsByBarber = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>();
    for (const barber of data?.barbers ?? []) {
      map.set(barber.id, []);
    }
    for (const appointment of data?.appointments ?? []) {
      const key = appointment.barber_id ?? 'unassigned';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(appointment);
    }
    return map;
  }, [data]);

  const blockedByBarber = useMemo(() => {
    const map = new Map<string, AdminBlockedSlot[]>();
    for (const blocked of data?.blockedSlots ?? []) {
      const key = blocked.barber_id ?? 'unassigned';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(blocked);
    }
    return map;
  }, [data]);

  const serviceMap = useMemo(
    () => new Map((data?.services ?? []).map((service) => [service.id, service])),
    [data]
  );

  const barberColumns: Array<AdminBarber | { id: 'unassigned'; name: string }> = useMemo(() => {
    const barbers = data?.barbers ?? [];
    return barbers.length > 0 ? barbers : [{ id: 'unassigned', name: 'Sem profissional' }];
  }, [data]);

  const refreshWithFeedback = async (message: string) => {
    await load();
    setFeedback(message);
  };

  const submitAppointment = async () => {
    setIsSavingAppointment(true);
    setFeedback('');

    try {
      await createAppointment(appointmentForm);
      setAppointmentModalOpen(false);
      setAppointmentForm((current) => ({ ...DEFAULT_APPOINTMENT_FORM, appointmentDate: current.appointmentDate }));
      await refreshWithFeedback('Agendamento criado com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel criar o agendamento.');
    } finally {
      setIsSavingAppointment(false);
    }
  };

  const submitBlock = async () => {
    setIsSavingBlock(true);
    setFeedback('');

    try {
      await createBlockedSlot(blockForm);
      setBlockModalOpen(false);
      setBlockForm((current) => ({ ...DEFAULT_BLOCK_FORM, blockedDate: current.blockedDate, barberId: current.barberId }));
      await refreshWithFeedback('Horario bloqueado com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel bloquear o horario.');
    } finally {
      setIsSavingBlock(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      await refreshWithFeedback('Status atualizado com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel atualizar o status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <header className="shrink-0 border-b border-white/10 bg-[#0a0a0a]/50 px-4 py-6 backdrop-blur-md md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="pl-12 md:pl-0">
              <h2 className="text-2xl font-bold">Agenda</h2>
              <p className="text-sm text-slate-400">Gerencie atendimentos, horarios bloqueados e disponibilidade</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-1">
                <button type="button" onClick={() => setCurrentDate((date) => subDays(date, 1))} className="rounded-md p-2 hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setCurrentDate(new Date())} className="rounded-md px-4 py-2 text-sm font-medium hover:bg-white/10">
                  Hoje
                </button>
                <button type="button" onClick={() => setCurrentDate((date) => addDays(date, 1))} className="rounded-md p-2 hover:bg-white/10">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h3 className="min-w-[220px] text-center text-lg font-bold capitalize sm:text-left">{dateLabel}</h3>
              <div className="flex gap-3">
                <button type="button" onClick={() => setBlockModalOpen(true)} className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/5">
                  <MinusCircle className="h-4 w-4" /> Bloquear
                </button>
                <button type="button" onClick={() => setAppointmentModalOpen(true)} className="flex items-center justify-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-black hover:bg-lime-500">
                  <Plus className="h-4 w-4" /> Novo Agendamento
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="min-w-[700px] rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="flex border-b border-white/10 bg-black/20">
                  <div className="flex w-24 shrink-0 items-center justify-center border-r border-white/10">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  {barberColumns.map((barber) => (
                    <div key={barber.id} className="flex-1 border-r border-white/10 p-4 text-center font-bold last:border-r-0">
                      {barber.name}
                    </div>
                  ))}
                </div>

                <div className="relative overflow-y-auto">
                  {slots.map((slot) => (
                    <div key={slot} className="flex h-20 border-b border-white/5">
                      <div className="flex w-24 shrink-0 items-start justify-center border-r border-white/10 p-2 text-xs font-medium text-slate-500">
                        {slot}
                      </div>
                      {barberColumns.map((barber) => {
                        const key = barber.id;
                        const appointment = (appointmentsByBarber.get(key) ?? []).find(
                          (item) => item.start_time.slice(0, 5) === slot
                        );
                        const blocked = (blockedByBarber.get(key) ?? []).find(
                          (item) => item.start_time.slice(0, 5) === slot
                        );

                        return (
                          <div key={`${key}-${slot}`} className="relative flex-1 border-r border-white/10 p-1 last:border-r-0">
                            {appointment ? (
                              <div
                                className={`absolute inset-x-2 top-2 z-10 rounded-xl border p-3 shadow-lg ${
                                  getStatusMeta(appointment.status)
                                }`}
                                style={{ height: `calc(${appointmentDurationSlots(appointment) * 100}% - 16px)` }}
                              >
                                <p className="truncate text-sm font-bold">{appointment.customer_name}</p>
                                <p className="truncate text-xs opacity-80">
                                  {appointment.service_id ? serviceMap.get(appointment.service_id)?.name ?? 'Servico' : 'Servico'}
                                </p>
                              </div>
                            ) : blocked ? (
                              <div className="absolute inset-x-2 top-2 z-10 rounded-xl border border-zinc-500/40 bg-zinc-700/20 p-3 text-zinc-300 shadow-lg">
                                <p className="truncate text-sm font-bold">Bloqueado</p>
                                <p className="truncate text-xs opacity-80">{blocked.reason ?? 'Horario indisponivel'}</p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-4">
                {feedback ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'border-lime-400/40 bg-lime-400/10 text-lime-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
                    {feedback}
                  </div>
                ) : null}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-bold">Atendimentos do dia</h3>
                  <div className="mt-4 space-y-3">
                    {(data?.appointments ?? []).length === 0 ? (
                      <p className="text-sm text-slate-400">Nenhum agendamento nesta data.</p>
                    ) : (
                      data?.appointments.map((appointment) => (
                        <div key={appointment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{appointment.customer_name}</p>
                              <p className="mt-1 text-sm text-slate-400">
                                {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                              </p>
                              <p className="mt-2 text-sm text-slate-300">
                                {appointment.service_id ? serviceMap.get(appointment.service_id)?.name ?? 'Servico' : 'Servico livre'}
                              </p>
                            </div>
                            <select
                              value={appointment.status}
                              onChange={(event) => {
                                void handleStatusChange(appointment.id, event.target.value as AppointmentStatus);
                              }}
                              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                              <option value="no_show">no_show</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {appointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-6 text-xl font-bold">Novo agendamento</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="date" value={appointmentForm.appointmentDate} onChange={(event) => setAppointmentForm((current) => ({ ...current, appointmentDate: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                <input type="time" value={appointmentForm.startTime} onChange={(event) => setAppointmentForm((current) => ({ ...current, startTime: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
              </div>
              <input value={appointmentForm.customerName} onChange={(event) => setAppointmentForm((current) => ({ ...current, customerName: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Nome do cliente" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={appointmentForm.customerPhone} onChange={(event) => setAppointmentForm((current) => ({ ...current, customerPhone: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Telefone" />
                <input value={appointmentForm.customerEmail} onChange={(event) => setAppointmentForm((current) => ({ ...current, customerEmail: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Email" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={appointmentForm.serviceId} onChange={(event) => setAppointmentForm((current) => ({ ...current, serviceId: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none">
                  <option value="">Selecione o servico</option>
                  {(data?.services ?? []).map((service: AdminService) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
                <select value={appointmentForm.barberId} onChange={(event) => setAppointmentForm((current) => ({ ...current, barberId: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none">
                  <option value="">Selecione o profissional</option>
                  {(data?.barbers ?? []).map((barber: AdminBarber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea value={appointmentForm.notes} onChange={(event) => setAppointmentForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Observacoes" />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setAppointmentModalOpen(false)} className="rounded-full px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={() => { void submitAppointment(); }} disabled={isSavingAppointment} className="rounded-full bg-lime-400 px-6 py-2 font-bold text-black hover:bg-lime-500 disabled:opacity-60">
                {isSavingAppointment ? 'Salvando...' : 'Salvar agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-6 text-xl font-bold">Bloquear horario</h3>
            <div className="space-y-4">
              <input type="date" value={blockForm.blockedDate} onChange={(event) => setBlockForm((current) => ({ ...current, blockedDate: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
              <select value={blockForm.barberId} onChange={(event) => setBlockForm((current) => ({ ...current, barberId: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none">
                <option value="">Todos / sem profissional</option>
                {(data?.barbers ?? []).map((barber: AdminBarber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="time" value={blockForm.startTime} onChange={(event) => setBlockForm((current) => ({ ...current, startTime: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
                <input type="time" value={blockForm.endTime} onChange={(event) => setBlockForm((current) => ({ ...current, endTime: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" />
              </div>
              <textarea value={blockForm.reason} onChange={(event) => setBlockForm((current) => ({ ...current, reason: event.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-lime-400 focus:outline-none" placeholder="Motivo do bloqueio" />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setBlockModalOpen(false)} className="rounded-full px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={() => { void submitBlock(); }} disabled={isSavingBlock} className="rounded-full bg-lime-400 px-6 py-2 font-bold text-black hover:bg-lime-500 disabled:opacity-60">
                {isSavingBlock ? 'Salvando...' : 'Bloquear horario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
