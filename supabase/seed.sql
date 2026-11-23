insert into public.tournaments(slug,name,game,status,starts_at,venue,mode,format,entry_fee_kes,prize_pool_kes,max_teams,description,rules,prize_tiers,poster_url)
values('mombasa-ultra-cup','The Mombasa Ultra Cup','EA FC 27','open','2026-12-26T10:00:00+03:00','Arena Bahari, Nyali, Mombasa','LAN','1v1 · groups into knockout',1500,100000,32,
'EA FC 27 LAN tournament at Arena Bahari, Nyali. Come out, bring energy, let''s pack the arena.',
'[{"title":"Eligibility","body":"Open to players resident in Kenya aged 16+. Players under 18 need guardian consent."},{"title":"Platform & hardware","body":"Matches on organiser-provided consoles. Bring your own controller if you prefer; it will be inspected."},{"title":"Code of conduct","body":"No cheating, abuse or match-fixing. Organiser decisions are final. Late players forfeit after 10 minutes."}]',
'[{"label":"1st place","pct":50},{"label":"2nd place","pct":25},{"label":"3rd place","pct":12},{"label":"MVP bonus","pct":5},{"label":"Fair-play & fan awards","pct":8}]','/poster.jpg')
on conflict (slug) do nothing;
insert into public.ticket_tiers(tournament_id,name,price_kes,perks,capacity)
select id,x.n,x.p,x.k,x.c from public.tournaments, (values
 ('General Admission',500,array['Entry to the arena','Standing and open seating'],300),
 ('VIP Floor Access',2000,array['Front-row seating','Meet the finalists','Complimentary drink'],60),
 ('Weekend Pass',800,array['Full event access','Re-entry allowed'],150)) as x(n,p,k,c)
where slug='mombasa-ultra-cup' and not exists(select 1 from public.ticket_tiers);
insert into public.promo_codes(code,percent) values('ULTRA10',10) on conflict do nothing;
-- After signing up your first user in Supabase Auth, make them admin:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOU@example.com');
