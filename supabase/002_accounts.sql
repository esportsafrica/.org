-- Run AFTER schema.sql and seed.sql. Adds user accounts, tickets, payments linkage.
alter table public.profiles add column if not exists full_name text, add column if not exists phone text, add column if not exists country text, add column if not exists gamertag text, add column if not exists discord text;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name') on conflict (id) do nothing; return new; end $$;
create or replace function public.my_role() returns text language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid() $$;
create policy own_profile_update on public.profiles for update using (id=auth.uid()) with check (id=auth.uid() and role=public.my_role());

-- registrations belong to users
alter table public.registrations add column if not exists user_id uuid references auth.users on delete set null;
alter table public.registrations drop constraint if exists registrations_status_check;
alter table public.registrations add constraint registrations_status_check check (status in ('pending','approved','rejected','withdrawn'));
create unique index if not exists one_reg_per_user on public.registrations(tournament_id,user_id) where user_id is not null and status<>'withdrawn';
drop policy if exists reg_insert on public.registrations;
create policy reg_insert on public.registrations for insert with check (user_id=auth.uid() and status='pending' and paid=false and exists(select 1 from public.tournaments t where t.id=tournament_id and t.status='open'));
create policy reg_own_read on public.registrations for select using (user_id=auth.uid());
create policy reg_own_withdraw on public.registrations for update using (user_id=auth.uid() and status in ('pending','approved') and paid=false) with check (user_id=auth.uid() and status='withdrawn');
create or replace function public.enforce_capacity() returns trigger language plpgsql security definer set search_path=public as $$
declare cap int; n int;
begin select max_teams into cap from public.tournaments where id=new.tournament_id;
  if cap is not null then select count(*) into n from public.registrations where tournament_id=new.tournament_id and status in ('pending','approved');
    if n>=cap then raise exception 'This tournament is full'; end if; end if; return new; end $$;
drop trigger if exists reg_capacity on public.registrations;
create trigger reg_capacity before insert on public.registrations for each row execute function public.enforce_capacity();

-- orders belong to users; individual tickets
alter table public.orders add column if not exists user_id uuid references auth.users on delete set null;
create policy orders_own on public.orders for select using (user_id=auth.uid());
create table if not exists public.tickets(
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders on delete cascade, user_id uuid references auth.users on delete set null,
  tier_id uuid references public.ticket_tiers on delete set null, tournament_id uuid references public.tournaments on delete cascade,
  code text unique not null, holder_name text, status text not null default 'valid' check (status in ('valid','used','void')), checked_in_at timestamptz, created_at timestamptz default now());
alter table public.tickets enable row level security;
create policy tickets_own on public.tickets for select using (user_id=auth.uid());
create policy tickets_admin on public.tickets for all using (public.is_admin()) with check (public.is_admin());
