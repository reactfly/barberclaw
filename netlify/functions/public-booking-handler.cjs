const { addMinutesToTime, getPublicAvailability, normalizeTime } = require('./_appointments.cjs');
const {
  createAdminClient,
  getBearerToken,
  jsonResponse,
  parseJsonBody,
} = require('./_supabase.cjs');

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Metodo nao permitido.' }, { Allow: 'POST' });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const payload = parseJsonBody(event);

    const shopId = typeof payload.shopId === 'string' ? payload.shopId.trim() : '';
    const serviceId = typeof payload.serviceId === 'string' ? payload.serviceId.trim() : '';
    const barberId = typeof payload.barberId === 'string' ? payload.barberId.trim() : '';
    const appointmentDate =
      typeof payload.appointmentDate === 'string' ? payload.appointmentDate.trim() : '';
    const startTime = normalizeTime(payload.startTime);
    const customerName =
      typeof payload.customerName === 'string' ? payload.customerName.trim() : '';
    const customerEmail =
      typeof payload.customerEmail === 'string' ? payload.customerEmail.trim() : '';
    const customerPhone =
      typeof payload.customerPhone === 'string' ? payload.customerPhone.trim() : '';
    const notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';

    if (!shopId || !serviceId || !barberId || !appointmentDate || !startTime) {
      throw new Error('Preencha barbearia, servico, profissional, data e horario.');
    }

    if (!customerName || !customerPhone) {
      throw new Error('Informe pelo menos nome e telefone para concluir a reserva.');
    }

    const [{ data: service, error: serviceError }, { data: barber, error: barberError }] =
      await Promise.all([
        supabaseAdmin
          .from('services')
          .select('id, shop_id, name, duration_minutes, is_active')
          .eq('id', serviceId)
          .maybeSingle(),
        supabaseAdmin
          .from('barbers')
          .select('id, shop_id, is_active, name')
          .eq('id', barberId)
          .maybeSingle(),
      ]);

    if (serviceError && serviceError.code !== 'PGRST116') {
      throw serviceError;
    }

    if (barberError && barberError.code !== 'PGRST116') {
      throw barberError;
    }

    if (!service || service.shop_id !== shopId || !service.is_active) {
      throw new Error('O servico selecionado nao esta disponivel para essa barbearia.');
    }

    if (!barber || barber.shop_id !== shopId || !barber.is_active) {
      throw new Error('O profissional selecionado nao esta disponivel para essa barbearia.');
    }

    const availability = await getPublicAvailability({
      supabaseAdmin,
      shopId,
      barberId,
      appointmentDate,
      durationMinutes: service.duration_minutes,
    });

    if (!availability.slots.includes(startTime)) {
      throw new Error(
        availability.message || 'Este horario acabou de ficar indisponivel. Escolha outro.'
      );
    }

    let customerProfileId = null;
    const accessToken = getBearerToken(event.headers);
    if (accessToken) {
      const { data } = await supabaseAdmin.auth.getUser(accessToken);
      customerProfileId = data.user?.id ?? null;
    }

    const endTime = addMinutesToTime(startTime, service.duration_minutes);
    const { data: insertedAppointment, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert({
        shop_id: shopId,
        service_id: serviceId,
        barber_id: barberId,
        customer_profile_id: customerProfileId,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        status: 'pending',
      })
      .select('id, appointment_date, start_time, end_time, status')
      .single();

    if (insertError) {
      throw insertError;
    }

    return jsonResponse(200, {
      ok: true,
      appointment: insertedAppointment,
      barberName: barber.name,
      serviceName: service.name,
      message: 'Reserva criada com sucesso e enviada para confirmacao da barbearia.',
    });
  } catch (error) {
    return jsonResponse(400, {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nao foi possivel concluir o agendamento.',
    });
  }
};

module.exports = { handler };
