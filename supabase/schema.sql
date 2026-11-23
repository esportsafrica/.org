-- Esports Africa schema. Run in Supabase SQL editor (once), then seed.sql.
create extension if not exists pgcrypto;

create table public.profiles(id uuid primary key references auth.users on delete cascade, role text not null default 'user' check (role in ('user','admin')));
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create table public.tournaments(
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, game text not null,
  status text not null default 'draft' check (status in ('draft','open','live','completed')),
  starts_at timestamptz not null, venue text, mode text default 'LAN' check (mode in ('LAN','Online')), format text,
  entry_fee_kes int not null default 0, prize_pool_kes int not null default 0, max_teams int,
  description text, rules jsonb not null default '[]', prize_tiers jsonb not null default '[]',
  poster_url text, stream_url text, created_at timestamptz default now());

create table public.registrations(
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments on delete cascade,
  type text not null check (type in ('solo','team')), team_name text, country text not null,
  gamertags text[] not null, discord text, contact_email text not null, logo_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  paid boolean not null default false, created_at timestamptz default now());

create table public.matches(
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments on delete cascade,
  stage text not null check (stage in ('group','quarter','semi','final')), group_label text,
  team_a text not null, team_b text not null, score_a int, score_b int,
  status text not null default 'upcoming' check (status in ('upcoming','live','final')), starts_at timestamptz, created_at timestamptz default now());

create table public.ticket_tiers(
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments on delete cascade,
  name text not null, price_kes int not null, perks text[] not null default '{}', capacity int not null default 100,
  sold int not null default 0, active boolean not null default true);

create table public.promo_codes(code text primary key, percent int not null check (percent between 1 and 100), active boolean not null default true);

create table public.orders(
  id uuid primary key default gen_random_uuid(), reference text unique not null, name text, email text not null, phone text,
  method text, subtotal int not null, discount int not null default 0, total int not null, promo_code text,
  status text not null default 'pending' check (status in ('pending','paid','failed')), items jsonb not null, created_at timestamptz default now());

-- Row level security
alter table public.profiles enable row level security; alter table public.tournaments enable row level security;
alter table public.registrations enable row level security; alter table public.matches enable row level security;
alter table public.ticket_tiers enable row level security; alter table public.promo_codes enable row level security; alter table public.orders enable row level security;

create policy own_profile on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy admin_profiles on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy t_read on public.tournaments for select using (status<>'draft' or public.is_admin());
create policy m_read on public.matches for select using (public.is_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.status<>'draft'));
create policy tt_read on public.ticket_tiers for select using (public.is_admin() or (active and exists(select 1 from public.tournaments t where t.id=tournament_id and t.status<>'draft')));
create policy reg_insert on public.registrations for insert with check (status='pending' and paid=false and exists(select 1 from public.tournaments t where t.id=tournament_id and t.status='open'));
-- admins can do everything; promo_codes and orders are admin-only (checkout uses the service role)
create policy admin_t on public.tournaments for all using (public.is_admin()) with check (public.is_admin());
create policy admin_r on public.registrations for all using (public.is_admin()) with check (public.is_admin());
create policy admin_m on public.matches for all using (public.is_admin()) with check (public.is_admin());
create policy admin_tt on public.ticket_tiers for all using (public.is_admin()) with check (public.is_admin());
create policy admin_p on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());
create policy admin_o on public.orders for all using (public.is_admin()) with check (public.is_admin());

create function public.increment_sold(tier uuid, qty int) returns void language sql security definer set search_path=public as
$$ update public.ticket_tiers set sold=sold+qty where id=tier $$;
revoke all on function public.increment_sold(uuid,int) from public, anon, authenticated;
grant execute on function public.increment_sold(uuid,int) to service_role;

-- Storage
insert into storage.buckets(id,name,public) values('posters','posters',true),('logos','logos',true) on conflict do nothing;
create policy "public read media" on storage.objects for select using (bucket_id in ('posters','logos'));
create policy "anyone uploads logos" on storage.objects for insert with check (bucket_id='logos');
create policy "admin manages posters" on storage.objects for all using (bucket_id='posters' and public.is_admin()) with check (bucket_id='posters' and public.is_admin());

-- Realtime for live scores
alter publication supabase_realtime add table public.matches;
