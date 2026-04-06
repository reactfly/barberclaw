begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'platform_billing_cycle') then
    create type public.platform_billing_cycle as enum ('monthly', 'quarterly', 'yearly', 'custom');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_transaction_kind') then
    create type public.platform_transaction_kind as enum ('appointment', 'subscription', 'payout', 'refund', 'adjustment');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_transaction_status') then
    create type public.platform_transaction_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded', 'chargeback', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_ticket_status') then
    create type public.platform_ticket_status as enum ('open', 'pending', 'resolved', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_ticket_priority') then
    create type public.platform_ticket_priority as enum ('low', 'medium', 'high', 'critical');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_notification_channel') then
    create type public.platform_notification_channel as enum ('email', 'sms', 'push', 'whatsapp', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_notification_status') then
    create type public.platform_notification_status as enum ('draft', 'queued', 'sent', 'failed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_content_type') then
    create type public.platform_content_type as enum ('page', 'banner', 'faq', 'legal', 'post', 'announcement');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_content_status') then
    create type public.platform_content_status as enum ('draft', 'published', 'archived');
  end if;
end
$$;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
      and profile.is_active = true
  );
$$;

create table if not exists public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  billing_cycle public.platform_billing_cycle not null default 'monthly',
  price_cents integer not null check (price_cents >= 0),
  currency_code text not null default 'BRL',
  trial_days integer not null default 0 check (trial_days >= 0),
  max_barbers integer check (max_barbers is null or max_barbers >= 0),
  max_locations integer check (max_locations is null or max_locations >= 0),
  max_bookings_per_month integer check (max_bookings_per_month is null or max_bookings_per_month >= 0),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_transactions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.barbershops (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  plan_id uuid references public.platform_plans (id) on delete set null,
  transaction_kind public.platform_transaction_kind not null default 'appointment',
  gateway text,
  external_reference text,
  payment_method text not null default 'manual',
  gross_amount numeric(10, 2) not null check (gross_amount >= 0),
  fee_amount numeric(10, 2) not null default 0 check (fee_amount >= 0),
  net_amount numeric(10, 2) not null default 0 check (net_amount >= 0),
  currency_code text not null default 'BRL',
  status public.platform_transaction_status not null default 'pending',
  processed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid references public.profiles (id) on delete set null,
  shop_id uuid references public.barbershops (id) on delete set null,
  owner_admin_id uuid references public.profiles (id) on delete set null,
  subject text not null,
  description text not null,
  status public.platform_ticket_status not null default 'open',
  priority public.platform_ticket_priority not null default 'medium',
  channel text not null default 'admin_panel',
  tags text[] not null default '{}',
  sla_due_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_notifications (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.barbershops (id) on delete set null,
  target_profile_id uuid references public.profiles (id) on delete set null,
  channel public.platform_notification_channel not null default 'system',
  template_key text not null,
  audience_type text not null default 'custom',
  trigger_type text not null default 'manual',
  subject text,
  body text,
  status public.platform_notification_status not null default 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  last_error text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  content_type public.platform_content_type not null default 'page',
  status public.platform_content_status not null default 'draft',
  seo_title text,
  seo_description text,
  cover_image_url text,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  shop_id uuid references public.barbershops (id) on delete set null,
  module text not null,
  action text not null,
  target_type text not null,
  target_id text,
  summary text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_platform_plans_active on public.platform_plans (is_active, sort_order);
create index if not exists idx_platform_transactions_shop_status on public.platform_transactions (shop_id, status, created_at desc);
create index if not exists idx_platform_transactions_kind on public.platform_transactions (transaction_kind, created_at desc);
create index if not exists idx_platform_tickets_status_priority on public.platform_tickets (status, priority, created_at desc);
create index if not exists idx_platform_notifications_status_channel on public.platform_notifications (status, channel, created_at desc);
create index if not exists idx_platform_content_status_type on public.platform_content (status, content_type, created_at desc);
create index if not exists idx_platform_audit_logs_module_created_at on public.platform_audit_logs (module, created_at desc);
create index if not exists idx_platform_audit_logs_actor on public.platform_audit_logs (actor_profile_id, created_at desc);

drop trigger if exists set_platform_plans_updated_at on public.platform_plans;
create trigger set_platform_plans_updated_at
before update on public.platform_plans
for each row execute function private.set_updated_at();

drop trigger if exists set_platform_transactions_updated_at on public.platform_transactions;
create trigger set_platform_transactions_updated_at
before update on public.platform_transactions
for each row execute function private.set_updated_at();

drop trigger if exists set_platform_tickets_updated_at on public.platform_tickets;
create trigger set_platform_tickets_updated_at
before update on public.platform_tickets
for each row execute function private.set_updated_at();

drop trigger if exists set_platform_notifications_updated_at on public.platform_notifications;
create trigger set_platform_notifications_updated_at
before update on public.platform_notifications
for each row execute function private.set_updated_at();

drop trigger if exists set_platform_content_updated_at on public.platform_content;
create trigger set_platform_content_updated_at
before update on public.platform_content
for each row execute function private.set_updated_at();

alter table public.platform_plans enable row level security;
alter table public.platform_transactions enable row level security;
alter table public.platform_tickets enable row level security;
alter table public.platform_notifications enable row level security;
alter table public.platform_content enable row level security;
alter table public.platform_audit_logs enable row level security;

drop policy if exists "platform_plans_admin_all" on public.platform_plans;
create policy "platform_plans_admin_all"
on public.platform_plans
for all
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

drop policy if exists "platform_transactions_admin_all" on public.platform_transactions;
create policy "platform_transactions_admin_all"
on public.platform_transactions
for all
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

drop policy if exists "platform_tickets_admin_all" on public.platform_tickets;
create policy "platform_tickets_admin_all"
on public.platform_tickets
for all
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

drop policy if exists "platform_notifications_admin_all" on public.platform_notifications;
create policy "platform_notifications_admin_all"
on public.platform_notifications
for all
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

drop policy if exists "platform_content_admin_all" on public.platform_content;
create policy "platform_content_admin_all"
on public.platform_content
for all
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

drop policy if exists "platform_audit_logs_admin_select" on public.platform_audit_logs;
create policy "platform_audit_logs_admin_select"
on public.platform_audit_logs
for select
to authenticated
using (private.is_platform_admin());

drop policy if exists "platform_audit_logs_admin_insert" on public.platform_audit_logs;
create policy "platform_audit_logs_admin_insert"
on public.platform_audit_logs
for insert
to authenticated
with check (private.is_platform_admin());

insert into public.platform_plans (
  name,
  slug,
  description,
  billing_cycle,
  price_cents,
  trial_days,
  max_barbers,
  max_locations,
  max_bookings_per_month,
  features,
  is_active,
  sort_order
)
values
  (
    'Starter',
    'starter',
    'Plano base para barbearias em fase inicial.',
    'monthly',
    9900,
    14,
    3,
    1,
    200,
    '["agenda","marketplace","clientes","servicos"]'::jsonb,
    true,
    0
  ),
  (
    'Growth Premium',
    'growth-premium',
    'Plano com destaque, growth tools e operacao ampliada.',
    'monthly',
    24900,
    14,
    12,
    3,
    1200,
    '["agenda","marketplace","clientes","servicos","destaque","campanhas","analytics"]'::jsonb,
    true,
    1
  ),
  (
    'Enterprise',
    'enterprise',
    'Plano corporativo para operacoes multiunidade e suporte prioritario.',
    'yearly',
    249000,
    30,
    100,
    20,
    null,
    '["agenda","marketplace","clientes","servicos","destaque","campanhas","analytics","api","suporte-prioritario"]'::jsonb,
    true,
    2
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  billing_cycle = excluded.billing_cycle,
  price_cents = excluded.price_cents,
  trial_days = excluded.trial_days,
  max_barbers = excluded.max_barbers,
  max_locations = excluded.max_locations,
  max_bookings_per_month = excluded.max_bookings_per_month,
  features = excluded.features,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

commit;
