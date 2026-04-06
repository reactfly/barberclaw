const { createAdminClient, jsonResponse, parseJsonBody, verifySessionToken } = require('./_supabase.cjs');

const getHeaderValue = (headers, headerName) => {
  if (!headers || typeof headers !== 'object') {
    return '';
  }

  const target = headerName.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
    }
  }

  return '';
};

const requirePlatformAdmin = async (event) => {
  const supabaseAdmin = createAdminClient();
  const { user } = await verifySessionToken(supabaseAdmin, event.headers);
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    const denialError = new Error('Sua conta nao possui permissao de super admin para este modulo.');
    denialError.statusCode = 403;
    throw denialError;
  }

  return {
    supabaseAdmin,
    user,
    profile,
  };
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const handleRoute = async (event, handlers) => {
  const method = event.httpMethod || 'GET';
  const handler = handlers[method];

  if (!handler) {
    return jsonResponse(405, { ok: false, error: 'Metodo nao permitido.' }, { Allow: Object.keys(handlers).join(', ') });
  }

  try {
    const context = await requirePlatformAdmin(event);
    return await handler(context, parseJsonBody(event), event);
  } catch (error) {
    const statusCode = Number(error?.statusCode || 400);
    return jsonResponse(statusCode, {
      ok: false,
      error: error instanceof Error ? error.message : 'Nao foi possivel processar a requisicao.',
    });
  }
};

const appendAuditLog = async (supabaseAdmin, event, payload) => {
  const forwardedFor = getHeaderValue(event.headers, 'x-forwarded-for');
  const firstIp = forwardedFor.split(',')[0]?.trim() || null;
  const userAgent = getHeaderValue(event.headers, 'user-agent') || null;

  const { error } = await supabaseAdmin.from('platform_audit_logs').insert({
    actor_profile_id: payload.actorProfileId,
    shop_id: payload.shopId || null,
    module: payload.module,
    action: payload.action,
    target_type: payload.targetType,
    target_id: payload.targetId || null,
    summary: payload.summary,
    metadata: payload.metadata || {},
    ip_address: firstIp,
    user_agent: userAgent,
  });

  if (error) {
    throw error;
  }
};

module.exports = {
  appendAuditLog,
  createHttpError,
  handleRoute,
  requirePlatformAdmin,
};
