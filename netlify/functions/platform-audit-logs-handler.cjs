const { handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const listAuditLogs = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_audit_logs')
    .select('*, actor:profiles!platform_audit_logs_actor_profile_id_fkey(full_name, email), barbershops(name)')
    .order('created_at', { ascending: false })
    .limit(250);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    actor_name: item.actor?.full_name ?? 'Sistema',
    actor_email: item.actor?.email ?? '-',
    shop_name: item.barbershops?.name ?? 'Plataforma',
  }));

  return jsonResponse(200, {
    ok: true,
    items,
    summary: {
      total: items.length,
      modules: Array.from(new Set(items.map((item) => item.module))).length,
      actors: Array.from(new Set(items.map((item) => item.actor_profile_id).filter(Boolean))).length,
    },
  });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listAuditLogs,
    }),
};
