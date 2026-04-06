const { appendAuditLog, createHttpError, handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const listTickets = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_tickets')
    .select('*, barbershops(name), requester:profiles!platform_tickets_requester_profile_id_fkey(full_name, email), owner:profiles!platform_tickets_owner_admin_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    shop_name: item.barbershops?.name ?? 'Plataforma',
    requester_name: item.requester?.full_name ?? 'Sem identificacao',
    requester_email: item.requester?.email ?? '-',
    owner_name: item.owner?.full_name ?? 'Fila aberta',
  }));

  return jsonResponse(200, {
    ok: true,
    items,
    summary: {
      total: items.length,
      critical: items.filter((item) => item.priority === 'critical').length,
      open: items.filter((item) => item.status === 'open').length,
    },
  });
};

const createTicket = async ({ supabaseAdmin, profile }, body, event) => {
  const subject = String(body.subject || '').trim();
  const description = String(body.description || '').trim();

  if (!subject || !description) {
    throw createHttpError(400, 'Informe assunto e descricao para abrir o ticket.');
  }

  const payload = {
    requester_profile_id: String(body.requesterProfileId || '').trim() || profile.id,
    shop_id: String(body.shopId || '').trim() || null,
    owner_admin_id: String(body.ownerAdminId || '').trim() || null,
    subject,
    description,
    status: String(body.status || 'open').trim() || 'open',
    priority: String(body.priority || 'medium').trim() || 'medium',
    channel: String(body.channel || 'admin_panel').trim() || 'admin_panel',
    tags: Array.isArray(body.tags) ? body.tags : [],
    sla_due_at: body.slaDueAt ? new Date(body.slaDueAt).toISOString() : null,
    metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
  };

  const { data, error } = await supabaseAdmin.from('platform_tickets').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    shopId: data.shop_id,
    module: 'tickets',
    action: 'create',
    targetType: 'platform_ticket',
    targetId: data.id,
    summary: `Ticket ${data.subject} criado no super admin.`,
    metadata: { priority: data.priority, status: data.status },
  });

  return jsonResponse(201, { ok: true, item: data });
};

const updateTicket = async ({ supabaseAdmin, profile }, body, event) => {
  const id = String(body.id || '').trim();
  if (!id) {
    throw createHttpError(400, 'Informe o id do ticket para atualizar.');
  }

  const updates = {};
  if (body.subject !== undefined) updates.subject = String(body.subject || '').trim();
  if (body.description !== undefined) updates.description = String(body.description || '').trim();
  if (body.status !== undefined) updates.status = String(body.status || '').trim();
  if (body.priority !== undefined) updates.priority = String(body.priority || '').trim();
  if (body.ownerAdminId !== undefined) updates.owner_admin_id = String(body.ownerAdminId || '').trim() || null;
  if (body.channel !== undefined) updates.channel = String(body.channel || '').trim() || 'admin_panel';
  if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
  if (body.slaDueAt !== undefined) updates.sla_due_at = body.slaDueAt ? new Date(body.slaDueAt).toISOString() : null;
  if (body.resolvedAt !== undefined) updates.resolved_at = body.resolvedAt ? new Date(body.resolvedAt).toISOString() : null;
  if (body.metadata !== undefined) updates.metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

  const { data, error } = await supabaseAdmin.from('platform_tickets').update(updates).eq('id', id).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    shopId: data.shop_id,
    module: 'tickets',
    action: 'update',
    targetType: 'platform_ticket',
    targetId: id,
    summary: `Ticket ${id} atualizado no super admin.`,
    metadata: updates,
  });

  return jsonResponse(200, { ok: true, item: data });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listTickets,
      POST: createTicket,
      PATCH: updateTicket,
    }),
};
