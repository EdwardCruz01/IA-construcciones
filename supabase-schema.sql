-- Torre 89 / IA Construcciones
-- Ejecutar en Supabase SQL Editor.
-- Este esquema deja lista la base para formularios, registros, reservas,
-- contador de visitas y seguimiento comercial.

create extension if not exists pgcrypto;

create table if not exists public.web_visits (
  id uuid primary key default gen_random_uuid(),
  page_path text not null default '/',
  session_id text,
  user_agent text,
  referrer text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age integer,
  phone text not null,
  email text,
  country text,
  region text,
  district text,
  interest text not null,
  source_section text,
  message text,
  accepted_terms boolean not null default false,
  status text not null default 'nuevo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  country text,
  occupation text,
  role text not null default 'cliente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  country text,
  occupation text,
  interest text,
  discount_code text,
  source text default 'navbar',
  accepted_terms boolean not null default false,
  status text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  notice_type text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_slug text not null,
  item_title text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_slug)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  product_type text not null,
  product_name text not null,
  unit_type text,
  area_m2 numeric(10,2),
  normal_price numeric(12,2),
  presale_price numeric(12,2),
  currency text not null default 'USD',
  reservation_status text not null default 'solicitada',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotion_clicks (
  id uuid primary key default gen_random_uuid(),
  promotion_key text not null,
  source_section text,
  session_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.section_visits (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  page_path text,
  session_id text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_durations (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  section_key text,
  session_id text,
  duration_seconds integer not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  referrer_name text not null,
  referrer_phone text not null,
  prospect_name text not null,
  prospect_phone text not null,
  interest text not null,
  reward_interest text,
  status text not null default 'nuevo',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_type text not null,
  name text not null,
  description text,
  area_m2 numeric(10,2),
  normal_price numeric(12,2),
  presale_price numeric(12,2),
  currency text not null default 'USD',
  available_units integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.products (product_type, name, description, area_m2, normal_price, presale_price, available_units)
values
  ('departamento', 'Tipo II', 'Departamento Tipo II en Torre 89.', 103.80, 134000.00, 129900.00, 8),
  ('departamento', 'Tipo III', 'Departamento Tipo III en Torre 89.', 113.70, 138000.00, 133900.00, 7),
  ('departamento', 'Tipo IV', 'Departamento Tipo IV en Torre 89.', 208.50, 200000.00, 193900.00, 4),
  ('oficina', 'Oficina Torre 89', 'Oficina en alquiler con servicios incluidos referenciales.', null, null, 800.00, null),
  ('salon_vip', 'Salon VIP Torre 89', 'Espacio para eventos y reuniones privadas.', null, null, 1000.00, null)
on conflict do nothing;

insert into public.notices (title, body, notice_type)
values
  ('Preventa activa', 'Consulta disponibilidad actualizada de departamentos Tipo II, Tipo III y Tipo IV.', 'venta'),
  ('Recorridos 360', 'Los recorridos se iran actualizando segun tipologia, oficina, local y sala VIP.', 'contenido'),
  ('Favoritos en pausa', 'La seccion de favoritos queda preparada para activarse cuando se conecte el modulo comercial.', 'sistema')
on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, country, occupation)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Torre 89'),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'occupation'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    country = excluded.country,
    occupation = excluded.occupation,
    updated_at = now();

  insert into public.registrations (auth_user_id, full_name, phone, email, country, occupation, source, accepted_terms, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Torre 89'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'occupation',
    'auth',
    true,
    'registrado'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.total_web_visits()
returns bigint
language sql
stable
as $$
  select count(*) from public.web_visits;
$$;

create or replace function public.register_web_visit(
  p_page_path text default '/',
  p_session_id text default null,
  p_user_agent text default null,
  p_referrer text default null
)
returns bigint
language plpgsql
security definer
as $$
declare
  total bigint;
begin
  insert into public.web_visits (page_path, session_id, user_agent, referrer)
  values (coalesce(p_page_path, '/'), p_session_id, p_user_agent, p_referrer);

  select count(*) into total from public.web_visits;
  return total;
end;
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.total_web_visits() to anon, authenticated;
grant execute on function public.register_web_visit(text, text, text, text) to anon, authenticated;

alter table public.web_visits enable row level security;
alter table public.leads enable row level security;
alter table public.profiles enable row level security;
alter table public.registrations enable row level security;
alter table public.notices enable row level security;
alter table public.favorites enable row level security;
alter table public.reservations enable row level security;
alter table public.promotion_clicks enable row level security;
alter table public.section_visits enable row level security;
alter table public.session_durations enable row level security;
alter table public.recommendations enable row level security;
alter table public.products enable row level security;

drop policy if exists "public can insert visits" on public.web_visits;
create policy "public can insert visits"
on public.web_visits for insert
to anon, authenticated
with check (true);

drop policy if exists "public can create leads" on public.leads;
create policy "public can create leads"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "public can read active notices" on public.notices;
create policy "public can read active notices"
on public.notices for select
to anon, authenticated
using (is_active = true);

drop policy if exists "users can read own favorites" on public.favorites;
create policy "users can read own favorites"
on public.favorites for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can create own favorites" on public.favorites;
create policy "users can create own favorites"
on public.favorites for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can delete own favorites" on public.favorites;
create policy "users can delete own favorites"
on public.favorites for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "public can register" on public.registrations;
create policy "public can register"
on public.registrations for insert
to anon, authenticated
with check (true);

drop policy if exists "public can request reservation" on public.reservations;
create policy "public can request reservation"
on public.reservations for insert
to anon, authenticated
with check (true);

drop policy if exists "public can track promo clicks" on public.promotion_clicks;
create policy "public can track promo clicks"
on public.promotion_clicks for insert
to anon, authenticated
with check (true);

drop policy if exists "public can track section visits" on public.section_visits;
create policy "public can track section visits"
on public.section_visits for insert
to anon, authenticated
with check (true);

drop policy if exists "public can track session durations" on public.session_durations;
create policy "public can track session durations"
on public.session_durations for insert
to anon, authenticated
with check (true);

drop policy if exists "public can create recommendations" on public.recommendations;
create policy "public can create recommendations"
on public.recommendations for insert
to anon, authenticated
with check (true);

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated can read visits" on public.web_visits;
create policy "authenticated can read visits"
on public.web_visits for select
to authenticated
using (true);

drop policy if exists "authenticated can read section visits" on public.section_visits;
create policy "authenticated can read section visits"
on public.section_visits for select
to authenticated
using (true);

drop policy if exists "authenticated can read session durations" on public.session_durations;
create policy "authenticated can read session durations"
on public.session_durations for select
to authenticated
using (true);

drop policy if exists "authenticated can manage leads" on public.leads;
create policy "authenticated can manage leads"
on public.leads for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can manage registrations" on public.registrations;
create policy "authenticated can manage registrations"
on public.registrations for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can manage reservations" on public.reservations;
create policy "authenticated can manage reservations"
on public.reservations for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can manage recommendations" on public.recommendations;
create policy "authenticated can manage recommendations"
on public.recommendations for all
to authenticated
using (true)
with check (true);
