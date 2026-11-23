-- Run AFTER 003_hardening.sql.
-- Adds tournament format settings, real teams with member invites, fair-play constraints, and LFT board.

-- 1. Tournament format settings
alter table public.tournaments
  add column if not exists entry_type text not null default 'solo' check (entry_type in ('solo','team','both')),
  add column if not exists min_roster_size int not null default 1 check (min_roster_size >= 1),
  add column if not exists max_roster_size int not null default 1 check (max_roster_size >= min_roster_size);

-- 2. Team registration controls
alter table public.registrations
  add column if not exists roster_locked boolean not null default false,
  add column if not exists ready boolean not null default false;

-- 3. Registration members (team rosters & invite workflow)
create table if not exists public.registration_members (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  role text not null default 'starter' check (role in ('captain','starter','sub')),
  status text not null default 'invited' check (status in ('invited','accepted','declined')),
  gamertag text,
  invite_token text unique not null,
  invite_email text,
  dob date,
  guardian_name text,
  guardian_phone text,
  accepted_terms boolean not null default false,
  created_at timestamptz default now(),
  joined_at timestamptz
);

-- Index for fast token lookups and user roster queries
create index if not exists idx_reg_members_token on public.registration_members(invite_token);
create index if not exists idx_reg_members_user on public.registration_members(user_id);
create index if not exists idx_reg_members_reg on public.registration_members(registration_id);

-- 4. Looking For Team (LFT) Board
create table if not exists public.lft_posts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  gamertag text not null,
  discord text,
  country text not null default 'Kenya',
  role_preference text,
  bio text,
  status text not null default 'active' check (status in ('active','recruited','closed')),
  created_at timestamptz default now()
);

create index if not exists idx_lft_tournament on public.lft_posts(tournament_id, status);

-- 5. Fair-Play Rules & Triggers

-- A. Auto-lock roster on approval
create or replace function public.on_registration_status_change() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.status = 'approved' and (old.status is null or old.status <> 'approved') then
    new.roster_locked := true;
  end if;
  return new;
end $$;

drop trigger if exists trg_lock_roster on public.registrations;
create trigger trg_lock_roster
before update of status on public.registrations
for each row execute function public.on_registration_status_change();

-- B. One-tournament-one-team integrity:
-- Ensure a player (user_id) cannot be accepted in two different active registrations for the same tournament.
create or replace function public.enforce_single_team_per_tournament() returns trigger
language plpgsql security definer set search_path=public as $$
declare
  target_tournament uuid;
  conflict_count int;
begin
  -- Only validate when a user is linked and status is accepted
  if new.user_id is not null and new.status = 'accepted' then
    select tournament_id into target_tournament from public.registrations where id = new.registration_id;

    select count(*) into conflict_count
    from public.registration_members rm
    join public.registrations r on r.id = rm.registration_id
    where r.tournament_id = target_tournament
      and rm.user_id = new.user_id
      and rm.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and rm.status = 'accepted'
      and r.status not in ('rejected', 'withdrawn');

    if conflict_count > 0 then
      raise exception 'Player is already accepted on another roster in this tournament.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_check_single_team on public.registration_members;
create trigger trg_check_single_team
before insert or update on public.registration_members
for each row execute function public.enforce_single_team_per_tournament();

-- 6. Row Level Security Policies

alter table public.registration_members enable row level security;
alter table public.lft_posts enable row level security;

-- Updated registrations SELECT:
-- Visible to registration captain OR any accepted roster member OR admin
drop policy if exists reg_own_read on public.registrations;
create policy reg_own_read on public.registrations for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.registration_members rm
    where rm.registration_id = public.registrations.id
      and rm.user_id = auth.uid()
      and rm.status = 'accepted'
  )
  or public.is_admin()
);

-- registration_members policies:
-- Read: Admins, or captain of the team, or member themselves
create policy members_read on public.registration_members for select using (
  public.is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from public.registrations r
    where r.id = registration_id and r.user_id = auth.uid()
  )
);

-- Captain can manage members as long as roster is not locked
create policy captain_insert_members on public.registration_members for insert with check (
  public.is_admin()
  or exists (
    select 1 from public.registrations r
    where r.id = registration_id
      and r.user_id = auth.uid()
      and r.roster_locked = false
  )
);

create policy captain_update_members on public.registration_members for update using (
  public.is_admin()
  or (
    -- Captain can manage roles/removals if unlocked
    exists (
      select 1 from public.registrations r
      where r.id = registration_id
        and r.user_id = auth.uid()
        and r.roster_locked = false
    )
  )
  or (
    -- Member can accept/decline their own invite
    user_id = auth.uid()
  )
);

create policy captain_delete_members on public.registration_members for delete using (
  public.is_admin()
  or exists (
    select 1 from public.registrations r
    where r.id = registration_id
      and r.user_id = auth.uid()
      and r.roster_locked = false
  )
);

-- LFT policies
create policy lft_read on public.lft_posts for select using (true);
create policy lft_insert on public.lft_posts for insert with check (user_id = auth.uid());
create policy lft_update on public.lft_posts for update using (user_id = auth.uid() or public.is_admin());
create policy lft_delete on public.lft_posts for delete using (user_id = auth.uid() or public.is_admin());

-- 7. Automatic Admin role assignment for info@esportsafrica.org
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    case when lower(new.email) = 'info@esportsafrica.org' then 'admin' else 'user' end
  )
  on conflict (id) do update set
    role = case when lower(new.email) = 'info@esportsafrica.org' then 'admin' else profiles.role end;
  return new;
end $$;

-- Promote existing account if already signed up
update public.profiles set role='admin'
where id in (select id from auth.users where lower(email)='info@esportsafrica.org');

