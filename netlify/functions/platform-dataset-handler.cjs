const { handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const loadDataset = async ({ supabaseAdmin, profile }) => {
  const [profiles, shops, barbers, services, appointments, reviews] = await Promise.all([
    supabaseAdmin.from('profiles').select('id,email,full_name,role,is_active,updated_at').order('full_name', { ascending: true }),
    supabaseAdmin.from('barbershops').select('id,owner_id,name,slug,city,state,is_active,is_featured,is_premium').order('name', { ascending: true }),
    supabaseAdmin.from('barbers').select('*').order('name', { ascending: true }),
    supabaseAdmin.from('services').select('*').order('name', { ascending: true }),
    supabaseAdmin.from('appointments').select('*').order('created_at', { ascending: false }).limit(2000),
    supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false }).limit(2000),
  ]);

  const failed = [profiles, shops, barbers, services, appointments, reviews].find((result) => result.error);
  if (failed && failed.error) {
    throw failed.error;
  }

  return jsonResponse(200, {
    ok: true,
    context: {
      profile,
      shop: null,
      availableShops: [],
      isPlatformAdmin: true,
      membershipRole: null,
      canManageShop: true,
    },
    dataset: {
      profiles: profiles.data || [],
      shops: shops.data || [],
      barbers: barbers.data || [],
      services: services.data || [],
      appointments: appointments.data || [],
      reviews: reviews.data || [],
    },
  });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: loadDataset,
    }),
};
