const { getPublicAvailability } = require('./_appointments.cjs');
const { createAdminClient, jsonResponse } = require('./_supabase.cjs');

const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { ok: false, error: 'Metodo nao permitido.' }, { Allow: 'GET' });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const params = event.queryStringParameters || {};

    const availability = await getPublicAvailability({
      supabaseAdmin,
      shopId: params.shopId || '',
      barberId: params.barberId || '',
      appointmentDate: params.date || '',
      durationMinutes: params.durationMinutes || '',
    });

    return jsonResponse(200, {
      ok: true,
      ...availability,
    });
  } catch (error) {
    return jsonResponse(400, {
      ok: false,
      error: error instanceof Error ? error.message : 'Nao foi possivel consultar a disponibilidade.',
    });
  }
};

module.exports = { handler };
