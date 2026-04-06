const { appendAuditLog, createHttpError, handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const normalizeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const listPlans = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_plans')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  const activeCount = (data ?? []).filter((item) => item.is_active).length;
  return jsonResponse(200, {
    ok: true,
    items: data ?? [],
    summary: {
      total: (data ?? []).length,
      active: activeCount,
      annual: (data ?? []).filter((item) => item.billing_cycle === 'yearly').length,
    },
  });
};

const createPlan = async ({ supabaseAdmin, profile }, body, event) => {
  const name = String(body.name || '').trim();
  const slug = normalizeSlug(body.slug || name);

  if (!name || !slug) {
    throw createHttpError(400, 'Informe nome e slug validos para o plano.');
  }

  const payload = {
    name,
    slug,
    description: String(body.description || '').trim() || null,
    billing_cycle: String(body.billingCycle || 'monthly').trim() || 'monthly',
    price_cents: Number.parseInt(String(body.priceCents ?? '0'), 10) || 0,
    trial_days: Number.parseInt(String(body.trialDays ?? '0'), 10) || 0,
    max_barbers: body.maxBarbers == null || body.maxBarbers === '' ? null : Number.parseInt(String(body.maxBarbers), 10),
    max_locations: body.maxLocations == null || body.maxLocations === '' ? null : Number.parseInt(String(body.maxLocations), 10),
    max_bookings_per_month:
      body.maxBookingsPerMonth == null || body.maxBookingsPerMonth === ''
        ? null
        : Number.parseInt(String(body.maxBookingsPerMonth), 10),
    features: Array.isArray(body.features) ? body.features : [],
    is_active: body.isActive !== false,
    sort_order: Number.parseInt(String(body.sortOrder ?? '0'), 10) || 0,
    created_by: profile.id,
  };

  const { data, error } = await supabaseAdmin.from('platform_plans').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    module: 'plans',
    action: 'create',
    targetType: 'platform_plan',
    targetId: data.id,
    summary: `Plano ${data.name} criado no super admin.`,
    metadata: { billingCycle: data.billing_cycle, priceCents: data.price_cents },
  });

  return jsonResponse(201, { ok: true, item: data });
};

const updatePlan = async ({ supabaseAdmin, profile }, body, event) => {
  const id = String(body.id || '').trim();
  if (!id) {
    throw createHttpError(400, 'Informe o id do plano para atualizar.');
  }

  const updates = {};
  if (body.name !== undefined) updates.name = String(body.name || '').trim();
  if (body.slug !== undefined) updates.slug = normalizeSlug(body.slug);
  if (body.description !== undefined) updates.description = String(body.description || '').trim() || null;
  if (body.billingCycle !== undefined) updates.billing_cycle = String(body.billingCycle || '').trim();
  if (body.priceCents !== undefined) updates.price_cents = Number.parseInt(String(body.priceCents), 10) || 0;
  if (body.trialDays !== undefined) updates.trial_days = Number.parseInt(String(body.trialDays), 10) || 0;
  if (body.maxBarbers !== undefined) updates.max_barbers = body.maxBarbers === '' ? null : Number.parseInt(String(body.maxBarbers), 10);
  if (body.maxLocations !== undefined) updates.max_locations = body.maxLocations === '' ? null : Number.parseInt(String(body.maxLocations), 10);
  if (body.maxBookingsPerMonth !== undefined) updates.max_bookings_per_month = body.maxBookingsPerMonth === '' ? null : Number.parseInt(String(body.maxBookingsPerMonth), 10);
  if (body.features !== undefined) updates.features = Array.isArray(body.features) ? body.features : [];
  if (body.isActive !== undefined) updates.is_active = Boolean(body.isActive);
  if (body.sortOrder !== undefined) updates.sort_order = Number.parseInt(String(body.sortOrder), 10) || 0;

  const { data, error } = await supabaseAdmin.from('platform_plans').update(updates).eq('id', id).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    module: 'plans',
    action: 'update',
    targetType: 'platform_plan',
    targetId: id,
    summary: `Plano ${data.name} atualizado no super admin.`,
    metadata: updates,
  });

  return jsonResponse(200, { ok: true, item: data });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listPlans,
      POST: createPlan,
      PATCH: updatePlan,
    }),
};
