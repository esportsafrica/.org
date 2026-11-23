-- Run AFTER 002_accounts.sql.
-- 1. orders: refunds + checkout holds
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending','paid','failed','refunded'));
alter table public.orders add column if not exists expires_at timestamptz;
-- 2. registrations: approval time, check-in, age/guardian, terms
alter table public.registrations add column if not exists approved_at timestamptz, add column if not exists checked_in boolean not null default false,
  add column if not exists dob date, add column if not exists guardian_name text, add column if not exists guardian_phone text, add column if not exists accepted_terms boolean not null default false;
alter table public.tournaments add column if not exists reminded_at timestamptz;
drop policy if exists reg_insert on public.registrations;
create policy reg_insert on public.registrations for insert with check (
  user_id=auth.uid() and status='pending' and paid=false and accepted_terms=true and dob is not null
  and (dob<=current_date-interval '18 years' or (guardian_name is not null and guardian_phone is not null))
  and exists(select 1 from public.tournaments t where t.id=tournament_id and t.status='open'));
-- 3. storage: only signed-in users, into their own folder; images only; size caps
drop policy if exists "anyone uploads logos" on storage.objects;
create policy "users upload own logos" on storage.objects for insert to authenticated with check (bucket_id='logos' and (storage.foldername(name))[1]=auth.uid()::text);
update storage.buckets set file_size_limit=2097152, allowed_mime_types=array['image/png','image/jpeg','image/webp','image/gif'] where id='logos';
update storage.buckets set file_size_limit=5242880, allowed_mime_types=array['image/png','image/jpeg','image/webp','image/gif'] where id='posters';
-- 4. rate limiting (used by API routes through the service role)
create table if not exists public.rate_limits(key text primary key, count int not null, reset_at timestamptz not null);
alter table public.rate_limits enable row level security;
create or replace function public.rate_limit(p_key text,p_limit int,p_window int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int; begin
  insert into rate_limits(key,count,reset_at) values(p_key,1,now()+make_interval(secs=>p_window))
  on conflict (key) do update set count=case when rate_limits.reset_at<now() then 1 else rate_limits.count+1 end,
    reset_at=case when rate_limits.reset_at<now() then now()+make_interval(secs=>p_window) else rate_limits.reset_at end
  returning count into n;
  return n<=p_limit; end $$;
revoke all on function public.rate_limit(text,int,int) from public,anon,authenticated; grant execute on function public.rate_limit(text,int,int) to service_role;
-- 5. atomic ticket reservation: locks tiers, counts unexpired pending orders as held stock
create or replace function public.place_order(p_user uuid,p_name text,p_email text,p_phone text,p_method text,p_promo text,p_items jsonb,p_reference text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare i jsonb; t public.ticket_tiers; held int; q int; sub int:=0; lines jsonb:='[]'; pct int:=0; disc int; tot int;
begin
  for i in select * from jsonb_array_elements(p_items) loop
    q:=(i->>'qty')::int; if q<1 or q>10 then raise exception 'bad_qty'; end if;
    select * into t from public.ticket_tiers where id=(i->>'tier_id')::uuid and active for update;
    if not found then raise exception 'unavailable'; end if;
    select coalesce(sum((x->>'qty')::int),0) into held from public.orders o, jsonb_array_elements(o.items) x
      where o.status='pending' and o.expires_at>now() and x->>'tier_id'=t.id::text;
    if t.capacity-t.sold-held<q then raise exception 'sold_out:%',t.name; end if;
    sub:=sub+t.price_kes*q; lines:=lines||jsonb_build_object('tier_id',t.id,'name',t.name,'qty',q,'price',t.price_kes);
  end loop;
  if coalesce(p_promo,'')<>'' then select pc.percent into pct from public.promo_codes pc where pc.code=upper(p_promo) and pc.active; pct:=coalesce(pct,0); end if;
  disc:=round(sub*pct/100.0); tot:=sub-disc;
  insert into public.orders(reference,user_id,name,email,phone,method,subtotal,discount,total,promo_code,items,expires_at)
    values(p_reference,p_user,p_name,p_email,p_phone,p_method,sub,disc,tot,nullif(upper(coalesce(p_promo,'')),''),lines,now()+interval '15 minutes');
  return jsonb_build_object('reference',p_reference,'total',tot,'subtotal',sub,'discount',disc);
end $$;
revoke all on function public.place_order(uuid,text,text,text,text,text,jsonb,text) from public,anon,authenticated; grant execute on function public.place_order(uuid,text,text,text,text,text,jsonb,text) to service_role;
-- 6. audit log, sponsors, news, contact messages
create table if not exists public.audit_log(id uuid primary key default gen_random_uuid(), actor uuid, action text not null, entity text, entity_id text, detail jsonb default '{}', created_at timestamptz default now());
create table if not exists public.sponsors(id uuid primary key default gen_random_uuid(), name text not null, logo_url text, url text, sort int default 0);
create table if not exists public.posts(id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, body text not null, cover_url text, published boolean default false, created_at timestamptz default now());
create table if not exists public.messages(id uuid primary key default gen_random_uuid(), name text, email text not null, body text not null, created_at timestamptz default now());
alter table public.audit_log enable row level security; alter table public.sponsors enable row level security; alter table public.posts enable row level security; alter table public.messages enable row level security;
create policy audit_admin on public.audit_log for all using (public.is_admin()) with check (public.is_admin());
create policy sponsors_read on public.sponsors for select using (true);
create policy sponsors_admin on public.sponsors for all using (public.is_admin()) with check (public.is_admin());
create policy posts_read on public.posts for select using (published or public.is_admin());
create policy posts_admin on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy messages_admin on public.messages for all using (public.is_admin()) with check (public.is_admin());
