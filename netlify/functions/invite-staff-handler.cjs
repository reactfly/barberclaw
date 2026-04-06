const {
  createAdminClient,
  getManagerContext,
  getSiteUrl,
  jsonResponse,
  parseJsonBody,
  verifySessionToken,
  waitForProfile,
} = require('./_supabase.cjs');

const ALLOWED_MEMBERSHIP_ROLES = new Set(['manager', 'barber', 'assistant']);

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Metodo nao permitido.' }, { Allow: 'POST' });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const payload = parseJsonBody(event);
    const { user } = await verifySessionToken(supabaseAdmin, event.headers);

    const shopId = typeof payload.shopId === 'string' ? payload.shopId.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const fullName =
      typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    const membershipRole =
      typeof payload.membershipRole === 'string' ? payload.membershipRole.trim() : 'barber';
    const roleLabel =
      typeof payload.roleLabel === 'string' ? payload.roleLabel.trim() : '';
    const specialty =
      typeof payload.specialty === 'string' ? payload.specialty.trim() : '';
    const experienceLabel =
      typeof payload.experienceLabel === 'string' ? payload.experienceLabel.trim() : '';
    const avatarUrl =
      typeof payload.avatarUrl === 'string' ? payload.avatarUrl.trim() : '';
    const createBarberProfile = Boolean(payload.createBarberProfile);
    const redirectTo =
      typeof payload.redirectTo === 'string' && payload.redirectTo.trim()
        ? payload.redirectTo.trim()
        : getSiteUrl(event.headers, '/admin');
    const commissionRate = Number.parseFloat(String(payload.commissionRate ?? '0'));

    if (!shopId) {
      throw new Error('Barbearia nao informada para o convite.');
    }

    if (!email) {
      throw new Error('Informe o email do colaborador.');
    }

    if (!fullName) {
      throw new Error('Informe o nome completo do colaborador.');
    }

    if (!ALLOWED_MEMBERSHIP_ROLES.has(membershipRole)) {
      throw new Error('Selecione um cargo valido para o colaborador.');
    }

    if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      throw new Error('A comissao precisa ficar entre 0 e 100.');
    }

    const managerContext = await getManagerContext(supabaseAdmin, user.id, shopId);
    if (!managerContext.canManageShop) {
      return jsonResponse(403, {
        ok: false,
        error: 'Sua conta nao tem permissao para convidar equipe nesta barbearia.',
      });
    }

    let invitedUserId = null;
    let inviteSent = false;

    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      throw existingProfileError;
    }

    if (existingProfile) {
      invitedUserId = existingProfile.id;
    } else {
      const { data: invitedUserResponse, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
            role: 'staff',
          },
          redirectTo,
        });

      if (inviteError) {
        throw inviteError;
      }

      invitedUserId = invitedUserResponse.user?.id ?? null;
      inviteSent = true;
    }

    if (!invitedUserId) {
      throw new Error('Nao foi possivel identificar o usuario convidado.');
    }

    const invitedProfile = await waitForProfile(supabaseAdmin, invitedUserId);
    if (!invitedProfile) {
      throw new Error('O perfil do colaborador ainda nao ficou disponivel no banco. Tente novamente.');
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        role: 'staff',
        primary_barbershop_id: invitedProfile.primary_barbershop_id || shopId,
      })
      .eq('id', invitedUserId);

    if (updateProfileError) {
      throw updateProfileError;
    }

    const membershipRecord = {
      shop_id: shopId,
      profile_id: invitedUserId,
      role: membershipRole,
      display_name: fullName,
      specialty: specialty || null,
      avatar_url: avatarUrl || null,
      commission_rate: commissionRate,
      is_active: true,
    };

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('barbershop_memberships')
      .upsert(membershipRecord, { onConflict: 'shop_id,profile_id' })
      .select('id')
      .single();

    if (membershipError) {
      throw membershipError;
    }

    if (createBarberProfile) {
      const { data: existingBarber, error: existingBarberError } = await supabaseAdmin
        .from('barbers')
        .select('id')
        .eq('shop_id', shopId)
        .eq('profile_id', invitedUserId)
        .maybeSingle();

      if (existingBarberError && existingBarberError.code !== 'PGRST116') {
        throw existingBarberError;
      }

      const barberPayload = {
        shop_id: shopId,
        membership_id: membership.id,
        profile_id: invitedUserId,
        name: fullName,
        role_label: roleLabel || (membershipRole === 'manager' ? 'Gerente' : 'Barbeiro'),
        specialty: specialty || null,
        experience_label: experienceLabel || null,
        avatar_url: avatarUrl || null,
        is_active: true,
      };

      if (existingBarber) {
        const { error: updateBarberError } = await supabaseAdmin
          .from('barbers')
          .update(barberPayload)
          .eq('id', existingBarber.id)
          .eq('shop_id', shopId);

        if (updateBarberError) {
          throw updateBarberError;
        }
      } else {
        const { error: insertBarberError } = await supabaseAdmin.from('barbers').insert(barberPayload);
        if (insertBarberError) {
          throw insertBarberError;
        }
      }
    }

    return jsonResponse(200, {
      ok: true,
      inviteSent,
      userId: invitedUserId,
      message: inviteSent
        ? 'Convite enviado e equipe sincronizada com sucesso.'
        : 'Colaborador existente vinculado a equipe com sucesso.',
    });
  } catch (error) {
    return jsonResponse(400, {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nao foi possivel convidar o colaborador.',
    });
  }
};

module.exports = { handler };
