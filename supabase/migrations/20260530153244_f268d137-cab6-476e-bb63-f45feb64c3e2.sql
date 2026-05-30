
-- =========================================
-- 1. PROFILES
-- =========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =========================================
-- 2. ROLES
-- =========================================
create type public.app_role as enum ('administrator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- security definer to avoid recursive RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- =========================================
-- 3. AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
-- =========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================
-- 4. CATEGORIES
-- =========================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,
  label text not null,
  sort_order int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.categories to authenticated;
grant update on public.categories to authenticated;
grant all on public.categories to service_role;

alter table public.categories enable row level security;

create policy "Authenticated can view categories"
  on public.categories for select
  to authenticated
  using (true);

create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (public.has_role(auth.uid(), 'administrator'))
  with check (public.has_role(auth.uid(), 'administrator'));

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_touch_updated_at
  before update on public.categories
  for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =========================================
-- 5. SEED CATEGORIES
-- =========================================
insert into public.categories (value, label, sort_order) values
  ('straksafgoerelse', 'Straksafgørelse', 10),
  ('arbejdstager', 'Arbejdstager', 20),
  ('tilstraekkelige_midler', 'Tilstrækkelige midler', 30),
  ('studerende', 'Studerende', 40),
  ('tidsubegraenset_ophold', 'Tidsubegrænset ophold', 50),
  ('eu_familiemedlem', 'EU-familiemedlem', 60),
  ('tredjelandsfamiliemedlem', 'Tredjelandsfamiliemedlem', 70),
  ('selvstaendig_erhvervsdrivende', 'Selvstændig erhvervsdrivende', 80),
  ('eu_vejledning', 'EU-vejledning', 90),
  ('et_g_sekundaer_bevaegelighed', '1G Sekundær bevægelighed', 100),
  ('tub_sekundaer_bevaegelighed', 'TUB Sekundær bevægelighed', 110),
  ('biometri', 'Biometri', 120),
  ('andet', 'Andet', 130);
