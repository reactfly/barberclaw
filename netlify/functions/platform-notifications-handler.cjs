const { appendAuditLog, createHttpError, handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const listNotifications = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_notifications')
    .select('*, barbershops(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    shop_name: item.barbershops?.name ?? 'Rede inteira',
    target_name: item.profiles?.full_name ?? 'Publico customizado',
  }));

  return jsonResponse(200, {
    ok: true,
    items,
    summary: {
      total: items.length,
      queued: items.filter((item) => item.status === 'queued').length,
      failed: items.filter((item) => item.status === 'failed').length,
    },
  });
};

const createNotification = async ({ supabaseAdmin, profile }, body, event) => {
  const templateKey = String(body.templateKey || '').trim();
  if (!templateKey) {
    throw createHttpError(400, 'Informe a chave do template da notificacao.');
  }

  const payload = {
    shop_id: String(body.shopId || '').trim() || null,
    target_profile_id: String(body.targetProfileId || '').trim() || null,
    channel: String(body.channel || 'system').trim() || 'system',
    template_key: templateKey,
    audience_type: String(body.audienceType || 'custom').trim() || 'custom',
    trigger_type: String(body.triggerType || 'manual').trim() || 'manual',
    subject: String(body.subject || '').trim() || null,
    body: String(body.body || '').trim() || null,
    status: String(body.status || 'draft').trim() || 'draft',
    scheduled_for: body.scheduledFor ? new Date(body.scheduledFor).toISOString() : null,
    sent_at: body.sentAt ? new Date(body.sentAt).toISOString() : null,
    last_error: String(body.lastError || '').trim() || null,
    provider_reference: String(body.providerReference || '').trim() || null,
    metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    created_by: profile.id,
  };

  const { data, error } = await supabaseAdmin.from('platform_notifications').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    shopId: data.shop_id,
    module: 'notifications',
    action: 'create',
    targetType: 'platform_notification',
    targetId: data.id,
    summary: `Notificacao ${data.template_key} criada no super admin.`,
    metadata: { channel: data.channel, status: data.status },
  });

  return jsonResponse(201, { ok: true, item: data });
};

const updateNotification = async ({ supabaseAdmin, profile }, body, event) => {
  const id = String(body.id || '').trim();
  if (!id) {
    throw createHttpError(400, 'Informe o id da notificacao para atualizar.');
  }

  const updates = {};
  if (body.channel !== undefined) updates.channel = String(body.channel || '').trim();
  if (body.templateKey !== undefined) updates.template_key = String(body.templateKey || '').trim();
  if (body.audienceType !== undefined) updates.audience_type = String(body.audienceType || '').trim();
  if (body.triggerType !== undefined) updates.trigger_type = String(body.triggerType || '').trim();
  if (body.subject !== undefined) updates.subject = String(body.subject || '').trim() || null;
  if (body.body !== undefined) updates.body = String(body.body || '').trim() || null;
  if (body.status !== undefined) updates.status = String(body.status || '').trim();
  if (body.scheduledFor !== undefined) updates.scheduled_for = body.scheduledFor ? new Date(body.scheduledFor).toISOString() : null;
  if (body.sentAt !== undefined) updates.sent_at = body.sentAt ? new Date(body.sentAt).toISOString() : null;
  if (body.lastError !== undefined) updates.last_error = String(body.lastError || '').trim() || null;
  if (body.providerReference !== undefined) updates.provider_reference = String(body.providerReference || '').trim() || null;
  if (body.metadata !== undefined) updates.metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

  const { data, error } = await supabaseAdmin
    .from('platform_notifications')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    shopId: data.shop_id,
    module: 'notifications',
    action: 'update',
    targetType: 'platform_notification',
    targetId: id,
    summary: `Notificacao ${id} atualizada no super admin.`,
    metadata: updates,
  });

  return jsonResponse(200, { ok: true, item: data });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listNotifications,
      POST: createNotification,
      PATCH: updateNotification,
    }),
};
