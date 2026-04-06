begin;

create extension if not exists pgcrypto;

create schema if not exists private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('customer', 'owner', 'admin', 'staff');
  end if;

  if not exists (select 1 from pg_type where typname = 'membership_role') then
    create type public.membership_role as enum ('owner', 'manager', 'barber', 'assistant');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'published', 'hidden');
  end if;
end
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function private.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text not null,
  role public.app_role not null default 'customer',
  phone text,
  avatar_url text,
  primary_barbershop_id uuid,
  onboarding_completed boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.barbershops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  phone text,
  whatsapp text,
  instagram_handle text,
  document_number text,
  postal_code text,
  address_line text not null,
  neighborhood text,
  city text not null,
  state text not null,
  country_code text not null default 'BR',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_premium boolean not null default false,
  subscription_status text not null default 'trialing',
  trial_ends_at timestamptz not null default (timezone('utc', now()) + interval '3 days'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint barbershops_owner_slug_unique unique (owner_id, slug)
);

alter table public.profiles
  add constraint profiles_primary_barbershop_id_fkey
  foreign key (primary_barbershop_id)
  references public.barbershops (id)
  on delete set null;

create table if not exists public.barbershop_memberships (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null,
  display_name text,
  specialty text,
  bio text,
  avatar_url text,
  commission_rate numeric(5, 2) not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint barbershop_memberships_shop_profile_unique unique (shop_id, profile_id)
);

create or replace function private.is_shop_member(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.barbershop_memberships membership
    where membership.shop_id = target_shop_id
      and membership.profile_id = auth.uid()
      and membership.is_active = true
  );
$$;

create or replace function private.can_manage_shop(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.barbershop_memberships membership
    where membership.shop_id = target_shop_id
      and membership.profile_id = auth.uid()
      and membership.is_active = true
      and membership.role in ('owner', 'manager')
  );
$$;

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_open boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_hours_shop_day_unique unique (shop_id, day_of_week),
  constraint business_hours_time_range_check check (
    is_open = false or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  badge text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  membership_id uuid references public.barbershop_memberships (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  role_label text,
  specialty text,
  experience_label text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  barber_id uuid references public.barbers (id) on delete set null,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  notes text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appointments_time_range_check check (start_time < end_time)
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  barber_id uuid references public.barbers (id) on delete cascade,
  blocked_date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint blocked_slots_time_range_check check (start_time < end_time)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.barbershops (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_role text,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  avatar_url text,
  status public.review_status not null default 'published',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_barbershops_owner_id on public.barbershops (owner_id);
create index if not exists idx_barbershops_active on public.barbershops (is_active);
create index if not exists idx_barbershop_memberships_profile on public.barbershop_memberships (profile_id);
create index if not exists idx_services_shop_id on public.services (shop_id);
create index if not exists idx_barbers_shop_id on public.barbers (shop_id);
create index if not exists idx_appointments_shop_date on public.appointments (shop_id, appointment_date);
create index if not exists idx_appointments_customer_profile on public.appointments (customer_profile_id);
create index if not exists idx_blocked_slots_shop_date on public.blocked_slots (shop_id, blocked_date);
create index if not exists idx_reviews_shop_status on public.reviews (shop_id, status);

create unique index if not exists idx_appointments_unique_barber_slot
  on public.appointments (barber_id, appointment_date, start_time)
  where barber_id is not null and status in ('pending', 'confirmed');

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_role text := lower(coalesce(new.raw_user_meta_data ->> 'role', 'customer'));
  profile_role public.app_role := case
    when requested_role = 'owner' then 'owner'
    else 'customer'
  end;
  computed_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(computed_name, split_part(coalesce(new.email, ''), '@', 1), 'usuario'),
    profile_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name;

  return new;
end;
$$;

create or replace function private.handle_new_barbershop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.barbershop_memberships (shop_id, profile_id, role, is_active)
  values (new.id, new.owner_id, 'owner', true)
  on conflict (shop_id, profile_id) do update
    set role = 'owner',
        is_active = true;

  update public.profiles
    set primary_barbershop_id = coalesce(primary_barbershop_id, new.id)
  where id = new.owner_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists set_barbershops_updated_at on public.barbershops;
create trigger set_barbershops_updated_at
before update on public.barbershops
for each row execute function private.set_updated_at();

drop trigger if exists set_barbershop_memberships_updated_at on public.barbershop_memberships;
create trigger set_barbershop_memberships_updated_at
before update on public.barbershop_memberships
for each row execute function private.set_updated_at();

drop trigger if exists set_business_hours_updated_at on public.business_hours;
create trigger set_business_hours_updated_at
before update on public.business_hours
for each row execute function private.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function private.set_updated_at();

drop trigger if exists set_barbers_updated_at on public.barbers;
create trigger set_barbers_updated_at
before update on public.barbers
for each row execute function private.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function private.set_updated_at();

drop trigger if exists set_blocked_slots_updated_at on public.blocked_slots;
create trigger set_blocked_slots_updated_at
before update on public.blocked_slots
for each row execute function private.set_updated_at();

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function private.set_updated_at();

drop trigger if exists on_barbershop_created on public.barbershops;
create trigger on_barbershop_created
after insert on public.barbershops
for each row execute function private.handle_new_barbershop();

alter table public.profiles enable row level security;
alter table public.barbershops enable row level security;
alter table public.barbershop_memberships enable row level security;
alter table public.business_hours enable row level security;
alter table public.services enable row level security;
alter table public.barbers enable row level security;
alter table public.appointments enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "barbershops_public_read_active" on public.barbershops;
create policy "barbershops_public_read_active"
on public.barbershops
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "barbershops_insert_owner" on public.barbershops;
create policy "barbershops_insert_owner"
on public.barbershops
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "barbershops_manage_members" on public.barbershops;
create policy "barbershops_manage_members"
on public.barbershops
for update
to authenticated
using (private.can_manage_shop(id))
with check (private.can_manage_shop(id));

drop policy if exists "memberships_select_related" on public.barbershop_memberships;
create policy "memberships_select_related"
on public.barbershop_memberships
for select
to authenticated
using (profile_id = auth.uid() or private.can_manage_shop(shop_id));

drop policy if exists "memberships_manage_shop" on public.barbershop_memberships;
create policy "memberships_manage_shop"
on public.barbershop_memberships
for all
to authenticated
using (private.can_manage_shop(shop_id))
with check (private.can_manage_shop(shop_id));

drop policy if exists "business_hours_public_read" on public.business_hours;
create policy "business_hours_public_read"
on public.business_hours
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.barbershops shop
    where shop.id = business_hours.shop_id
      and shop.is_active = true
  )
);

drop policy if exists "business_hours_manage_shop" on public.business_hours;
create policy "business_hours_manage_shop"
on public.business_hours
for all
to authenticated
using (private.can_manage_shop(shop_id))
with check (private.can_manage_shop(shop_id));

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
on public.services
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.barbershops shop
    where shop.id = services.shop_id
      and shop.is_active = true
  )
);

drop policy if exists "services_manage_shop" on public.services;
create policy "services_manage_shop"
on public.services
for all
to authenticated
using (private.can_manage_shop(shop_id))
with check (private.can_manage_shop(shop_id));

drop policy if exists "barbers_public_read" on public.barbers;
create policy "barbers_public_read"
on public.barbers
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.barbershops shop
    where shop.id = barbers.shop_id
      and shop.is_active = true
  )
);

drop policy if exists "barbers_manage_shop" on public.barbers;
create policy "barbers_manage_shop"
on public.barbers
for all
to authenticated
using (private.can_manage_shop(shop_id))
with check (private.can_manage_shop(shop_id));

drop policy if exists "appointments_select_related" on public.appointments;
create policy "appointments_select_related"
on public.appointments
for select
to authenticated
using (customer_profile_id = auth.uid() or private.is_shop_member(shop_id));

drop policy if exists "appointments_insert_customer_or_staff" on public.appointments;
create policy "appointments_insert_customer_or_staff"
on public.appointments
for insert
to authenticated
with check (
  customer_profile_id = auth.uid()
  or private.is_shop_member(shop_id)
);

drop policy if exists "appointments_update_related" on public.appointments;
create policy "appointments_update_related"
on public.appointments
for update
to authenticated
using (customer_profile_id = auth.uid() or private.is_shop_member(shop_id))
with check (customer_profile_id = auth.uid() or private.is_shop_member(shop_id));

drop policy if exists "blocked_slots_staff_only" on public.blocked_slots;
create policy "blocked_slots_staff_only"
on public.blocked_slots
for all
to authenticated
using (private.is_shop_member(shop_id))
with check (private.is_shop_member(shop_id));

drop policy if exists "reviews_public_read_published" on public.reviews;
create policy "reviews_public_read_published"
on public.reviews
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "reviews_insert_customer" on public.reviews;
create policy "reviews_insert_customer"
on public.reviews
for insert
to authenticated
with check (customer_profile_id = auth.uid());

drop policy if exists "reviews_update_related" on public.reviews;
create policy "reviews_update_related"
on public.reviews
for update
to authenticated
using (customer_profile_id = auth.uid() or private.can_manage_shop(shop_id))
with check (customer_profile_id = auth.uid() or private.can_manage_shop(shop_id));

commit;
