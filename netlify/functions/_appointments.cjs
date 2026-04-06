const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

const pad = (value) => String(value).padStart(2, '0');

const normalizeTime = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const trimmed = value.trim();
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
};

const timeToMinutes = (value) => {
  const normalized = normalizeTime(value);
  const [hour, minute] = normalized.split(':').map(Number);
  return hour * 60 + minute;
};

const addMinutesToTime = (value, minutes) => {
  const totalMinutes = timeToMinutes(value) + minutes;
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${pad(hour)}:${pad(minute)}:00`;
};

const overlaps = (startA, endA, startB, endB) =>
  timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);

const getNowInTimezone = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}:00`,
  };
};

const buildTimeSlots = (opensAt, closesAt, durationMinutes, stepMinutes = 30) => {
  const startMinutes = timeToMinutes(opensAt);
  const endMinutes = timeToMinutes(closesAt);
  const slots = [];

  for (let current = startMinutes; current + durationMinutes <= endMinutes; current += stepMinutes) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;
    slots.push(`${pad(hour)}:${pad(minute)}:00`);
  }

  return slots;
};

const getPublicAvailability = async ({
  supabaseAdmin,
  shopId,
  barberId,
  appointmentDate,
  durationMinutes,
}) => {
  const dateValue = typeof appointmentDate === 'string' ? appointmentDate.trim() : '';
  const slotDuration = Number.parseInt(String(durationMinutes), 10);

  if (!shopId) {
    throw new Error('Barbearia nao informada.');
  }

  if (!barberId) {
    throw new Error('Profissional nao informado.');
  }

  if (!dateValue) {
    throw new Error('Data do agendamento nao informada.');
  }

  if (Number.isNaN(slotDuration) || slotDuration <= 0) {
    throw new Error('Duracao do servico invalida.');
  }

  const targetDate = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(targetDate.getTime())) {
    throw new Error('Data do agendamento invalida.');
  }

  const weekday = targetDate.getDay();

  const [{ data: shop, error: shopError }, { data: barber, error: barberError }, { data: businessHour, error: hoursError }, { data: appointments, error: appointmentsError }, { data: blockedSlots, error: blockedSlotsError }] =
    await Promise.all([
      supabaseAdmin.from('barbershops').select('id, is_active').eq('id', shopId).maybeSingle(),
      supabaseAdmin
        .from('barbers')
        .select('id, is_active, shop_id')
        .eq('id', barberId)
        .maybeSingle(),
      supabaseAdmin
        .from('business_hours')
        .select('opens_at, closes_at, is_open')
        .eq('shop_id', shopId)
        .eq('day_of_week', weekday)
        .maybeSingle(),
      supabaseAdmin
        .from('appointments')
        .select('barber_id, start_time, end_time, status')
        .eq('shop_id', shopId)
        .eq('appointment_date', dateValue)
        .in('status', ['pending', 'confirmed']),
      supabaseAdmin
        .from('blocked_slots')
        .select('barber_id, start_time, end_time')
        .eq('shop_id', shopId)
        .eq('blocked_date', dateValue),
    ]);

  if (shopError && shopError.code !== 'PGRST116') {
    throw shopError;
  }

  if (barberError && barberError.code !== 'PGRST116') {
    throw barberError;
  }

  if (hoursError && hoursError.code !== 'PGRST116') {
    throw hoursError;
  }

  if (appointmentsError) {
    throw appointmentsError;
  }

  if (blockedSlotsError) {
    throw blockedSlotsError;
  }

  if (!shop || !shop.is_active) {
    return {
      slots: [],
      opensAt: null,
      closesAt: null,
      message: 'Esta barbearia nao esta disponivel para reservas online no momento.',
    };
  }

  if (!barber || !barber.is_active || barber.shop_id !== shopId) {
    return {
      slots: [],
      opensAt: null,
      closesAt: null,
      message: 'O profissional selecionado nao esta disponivel para agendamento.',
    };
  }

  if (!businessHour || !businessHour.is_open || !businessHour.opens_at || !businessHour.closes_at) {
    return {
      slots: [],
      opensAt: null,
      closesAt: null,
      message: 'A barbearia nao abre nesse dia.',
    };
  }

  const now = getNowInTimezone();
  const candidateSlots = buildTimeSlots(
    businessHour.opens_at,
    businessHour.closes_at,
    slotDuration
  );

  const filteredSlots = candidateSlots.filter((startTime) => {
    if (dateValue === now.date && timeToMinutes(startTime) <= timeToMinutes(now.time)) {
      return false;
    }

    const endTime = addMinutesToTime(startTime, slotDuration);
    const hasAppointmentConflict = (appointments || []).some(
      (appointment) =>
        appointment.barber_id === barberId &&
        overlaps(startTime, endTime, appointment.start_time, appointment.end_time)
    );

    if (hasAppointmentConflict) {
      return false;
    }

    const hasBlockedConflict = (blockedSlots || []).some(
      (blockedSlot) =>
        (blockedSlot.barber_id === barberId || blockedSlot.barber_id === null) &&
        overlaps(startTime, endTime, blockedSlot.start_time, blockedSlot.end_time)
    );

    return !hasBlockedConflict;
  });

  return {
    slots: filteredSlots,
    opensAt: businessHour.opens_at,
    closesAt: businessHour.closes_at,
    message:
      filteredSlots.length > 0
        ? ''
        : 'Nao encontramos horarios livres para esta data.',
  };
};

module.exports = {
  addMinutesToTime,
  getPublicAvailability,
  normalizeTime,
};
