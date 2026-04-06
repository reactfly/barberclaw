const { appendAuditLog, createHttpError, handleRoute } = require('./_platform-admin.cjs');
const { jsonResponse } = require('./_supabase.cjs');

const listTransactions = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_transactions')
    .select('*, barbershops(name, city, state)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    shop_name: item.barbershops?.name ?? 'Marketplace',
    shop_location: item.barbershops ? `${item.barbershops.city} - ${item.barbershops.state}` : '-',
  }));

  return jsonResponse(200, {
    ok: true,
    items,
    summary: {
      total: items.length,
      paid: items.filter((item) => item.status === 'paid').length,
      gross: items.reduce((sum, item) => sum + Number(item.gross_amount || 0), 0),
      net: items.reduce((sum, item) => sum + Number(item.net_amount || 0), 0),
    },
  });
};

const createTransaction = async ({ supabaseAdmin, profile }, body, event) => {
  const payload = {
    shop_id: String(body.shopId || '').trim() || null,
    appointment_id: String(body.appointmentId || '').trim() || null,
    customer_profile_id: String(body.customerProfileId || '').trim() || null,
    plan_id: String(body.planId || '').trim() || null,
    transaction_kind: String(body.transactionKind || 'adjustment').trim() || 'adjustment',
    gateway: String(body.gateway || '').trim() || null,
    external_reference: String(body.externalReference || '').trim() || null,
    payment_method: String(body.paymentMethod || 'manual').trim() || 'manual',
    gross_amount: Number.parseFloat(String(body.grossAmount ?? '0')) || 0,
    fee_amount: Number.parseFloat(String(body.feeAmount ?? '0')) || 0,
    net_amount: Number.parseFloat(String(body.netAmount ?? '0')) || 0,
    status: String(body.status || 'pending').trim() || 'pending',
    processed_at: body.processedAt ? new Date(body.processedAt).toISOString() : null,
    metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    created_by: profile.id,
  };

  const { data, error } = await supabaseAdmin.from('platform_transactions').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    shopId: data.shop_id,
    module: 'transactions',
    action: 'create',
    targetType: 'platform_transaction',
    targetId: data.id,
    summary: `Lancamento financeiro ${data.id} criado no super admin.`,
    metadata: { kind: data.transaction_kind, status: data.status, grossAmount: data.gross_amount },
  });

  return jsonResponse(201, { ok: true, item: data });
};

const updateTransaction = async ({ supabaseAdmin, profile }, body, event) => {
  const id = String(body.id || '').trim();
  if (!id) {
    throw createHttpError(400, 'Informe o id da transacao para atualizar.');
  }

  const updates = {};
  if (body.status !== undefined) updates.status = String(body.status || '').trim();
  if (body.gateway !== undefined) updates.gateway = String(body.gateway || '').trim() || null;
  if (body.externalReference !== undefined) updates.external_reference = String(body.externalReference || '').trim() || null;
  if (body.paymentMethod !== undefined) updates.payment_method = String(body.paymentMethod || '').trim() || 'manual';
  if (body.grossAmount !== undefined) updates.gross_amount = Number.parseFloat(String(body.grossAmount)) || 0;
  if (body.feeAmount !== undefined) updates.fee_amount = Number.parseFloat(String(body.feeAmount)) || 0;
  if (body.netAmount !== undefined) updates.net_amount = Number.parseFloat(String(body.netAmount)) || 0;
  if (body.processedAt !== undefined) updates.processed_at = body.processedAt ? new Date(body.processedAt).toISOString() : null;
  if (body.metadata !== undefined) updates.metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

  const { data, error } = await supabaseAdmin
    .from('platform_transactions')
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
    module: 'transactions',
    action: 'update',
    targetType: 'platform_transaction',
    targetId: id,
    summary: `Lancamento financeiro ${id} atualizado.`,
    metadata: updates,
  });

  return jsonResponse(200, { ok: true, item: data });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listTransactions,
      POST: createTransaction,
      PATCH: updateTransaction,
    }),
};
