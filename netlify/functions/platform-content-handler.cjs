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

const listContent = async ({ supabaseAdmin }) => {
  const { data, error } = await supabaseAdmin
    .from('platform_content')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return jsonResponse(200, {
    ok: true,
    items: data ?? [],
    summary: {
      total: (data ?? []).length,
      published: (data ?? []).filter((item) => item.status === 'published').length,
      drafts: (data ?? []).filter((item) => item.status === 'draft').length,
    },
  });
};

const createContent = async ({ supabaseAdmin, profile }, body, event) => {
  const title = String(body.title || '').trim();
  const slug = normalizeSlug(body.slug || title);

  if (!title || !slug) {
    throw createHttpError(400, 'Informe titulo e slug validos para o conteudo.');
  }

  const payload = {
    slug,
    title,
    excerpt: String(body.excerpt || '').trim() || null,
    body: body.body && typeof body.body === 'object' ? body.body : {},
    content_type: String(body.contentType || 'page').trim() || 'page',
    status: String(body.status || 'draft').trim() || 'draft',
    seo_title: String(body.seoTitle || '').trim() || null,
    seo_description: String(body.seoDescription || '').trim() || null,
    cover_image_url: String(body.coverImageUrl || '').trim() || null,
    published_at: body.publishedAt ? new Date(body.publishedAt).toISOString() : null,
    created_by: profile.id,
    updated_by: profile.id,
  };

  const { data, error } = await supabaseAdmin.from('platform_content').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    module: 'content',
    action: 'create',
    targetType: 'platform_content',
    targetId: data.id,
    summary: `Conteudo ${data.title} criado no super admin.`,
    metadata: { slug: data.slug, status: data.status, contentType: data.content_type },
  });

  return jsonResponse(201, { ok: true, item: data });
};

const updateContent = async ({ supabaseAdmin, profile }, body, event) => {
  const id = String(body.id || '').trim();
  if (!id) {
    throw createHttpError(400, 'Informe o id do conteudo para atualizar.');
  }

  const updates = { updated_by: profile.id };
  if (body.slug !== undefined) updates.slug = normalizeSlug(body.slug);
  if (body.title !== undefined) updates.title = String(body.title || '').trim();
  if (body.excerpt !== undefined) updates.excerpt = String(body.excerpt || '').trim() || null;
  if (body.body !== undefined) updates.body = body.body && typeof body.body === 'object' ? body.body : {};
  if (body.contentType !== undefined) updates.content_type = String(body.contentType || '').trim();
  if (body.status !== undefined) updates.status = String(body.status || '').trim();
  if (body.seoTitle !== undefined) updates.seo_title = String(body.seoTitle || '').trim() || null;
  if (body.seoDescription !== undefined) updates.seo_description = String(body.seoDescription || '').trim() || null;
  if (body.coverImageUrl !== undefined) updates.cover_image_url = String(body.coverImageUrl || '').trim() || null;
  if (body.publishedAt !== undefined) updates.published_at = body.publishedAt ? new Date(body.publishedAt).toISOString() : null;

  const { data, error } = await supabaseAdmin.from('platform_content').update(updates).eq('id', id).select('*').single();
  if (error) {
    throw error;
  }

  await appendAuditLog(supabaseAdmin, event, {
    actorProfileId: profile.id,
    module: 'content',
    action: 'update',
    targetType: 'platform_content',
    targetId: id,
    summary: `Conteudo ${data.title} atualizado no super admin.`,
    metadata: updates,
  });

  return jsonResponse(200, { ok: true, item: data });
};

module.exports = {
  handler: async (event) =>
    handleRoute(event, {
      GET: listContent,
      POST: createContent,
      PATCH: updateContent,
    }),
};
