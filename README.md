# Esports Africa (Next.js 14 + Supabase)

## 1. Supabase (one time)
1. Create a project at supabase.com.
2. SQL editor → run, in order: `supabase/schema.sql`, `supabase/seed.sql`, `supabase/002_accounts.sql`, `supabase/003_hardening.sql`, `supabase/004_teams_and_rosters.sql`.
3. Auth:
   - **Providers:** Email (Enable Magic Link) and Google (add Client ID & Client Secret from Google Cloud Console).
   - **URL Configuration:**
     - Site URL: `https://esportsafrica.org`
     - Redirect URLs: `https://esportsafrica.org/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).
   - Sign up with `info@esportsafrica.org` (automatically granted the admin role).
4. Make that user admin (SQL editor):
   `update public.profiles set role='admin' where id=(select id from auth.users where email='info@esportsafrica.org');`
5. Project settings → API: copy the URL, anon key and service_role key.

## 2. Run
```
cp .env.example .env.local   # fill the values
npm install
npm run dev
```
Admin: http://localhost:3000/admin (login with the user from step 3).

## 3. Payments (Paystack)
Set `PAYSTACK_SECRET_KEY`. In the Paystack dashboard add webhook `https://YOUR-SITE/api/paystack/webhook`.
Cards and M-Pesa (mobile money, KES) are handled through Paystack. Without the key, orders are saved as pending.

## Notes
- Public pages read Supabase through RLS; admin writes pass `requireAdmin()` AND RLS (`is_admin()`).
- `SUPABASE_SERVICE_ROLE_KEY` is used only in API routes (checkout, promo, webhook). Never expose it.
- Live scores update in real time (Realtime is enabled on `matches` by the schema).
- Prize currency conversion rates are in `lib/format.js`.
- Motion: gsap-react (`Hero.jsx`), animation-on-scroll (`Reveal.jsx`), Emil polish rules in `globals.css`/`tailwind.config.js`.

## Accounts, tickets & gate
- Users sign up at `/signup`; `/account` shows registrations (progress, fee payment, matches, group position), tickets (QR codes) and orders.
- Registration and ticket purchase require an account. Entry fees are paid from the account once an entry is approved.
- Paid orders issue one ticket per seat with a unique code. Admin → Gate check-in validates and burns codes.
- Auth emails (confirm, reset) are sent by Supabase. For production, set your own SMTP in Supabase → Auth → SMTP.

## Teams, Rosters & Invites
- **Format controls:** Tournaments set whether they take `solo`, `team`, or `both`, along with `min_roster_size` and `max_roster_size` (e.g. 5 starters + 1 sub).
- **Captain creation:** Registering a team designates the creator as Captain with an initial roster.
- **Invites:** Captains invite players via shareable links (`/join/[token]`) or direct email notification (Resend).
- **Teammate onboarding:** Teammates review tournament details, submit their gamertag, verify age, provide guardian details (if under 18), and join the roster.
- **Fair-play integrity:** Database triggers ensure a player cannot be on two active rosters for the same tournament.
- **Roster locking:** Roster locks automatically on admin approval (`roster_locked`). Admin can grant emergency substitutions or unlock when needed.
- **LFT Board:** Solo free agents can list on the recruitment board (`/tournaments/[slug]`) with role preferences and Discord handles for captains to scout.

## Hardening, email & operations
- **Ticket holds:** checkout reserves stock for 15 minutes atomically in Postgres (`place_order`), so the last ticket can't be sold twice.
- **Rate limits:** promo, checkout, contact and payment endpoints are limited per IP/user (`rate_limit`). Turn on CAPTCHA protection in Supabase Auth and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Turnstile) for sign-up bots.
- **Storage:** logo uploads need sign-in, go in the user's own folder, images only, 2 MB max.
- **Email (Resend):** verify your domain at resend.com, set `RESEND_API_KEY` and `EMAIL_FROM`. Sent: registration received/approved/rejected, payment confirmed, refunds, slot released, match-day reminders. Also set your SMTP in Supabase → Auth for sign-up/reset mails.
- **Cron:** `vercel.json` runs `/api/cron/daily` (releases unpaid slots after 72h, sends reminders). Set `CRON_SECRET`.
- **Admin:** users & roles, audit log, bracket generator, refunds/void tickets, player and gate check-in (camera or scanner), news, sponsors, messages.
- **Tests:** `npm test` (standings, progress, record logic). Manual launch checklist: sign up → register → admin approves → pay → ticket purchase → webhook → QR check-in → refund; and confirm user A cannot read user B's rows.
- **Backups:** enable Supabase daily backups (Pro plan) or PITR before taking real payments; export `registrations`/`orders` as CSV periodically.
- **Deploy:** push to GitHub, import in Vercel, add the env vars, set Supabase Site URL + redirect URLs to the production domain, add the Paystack webhook, and use `https://YOUR-SITE/api/paystack/webhook`.
- **Legal:** `lib/legal.js` holds DRAFT terms/privacy/refund/cookie text with [placeholders]. Have a Kenyan lawyer review them; check VAT/tax and any gaming/lottery rules for prize pools with an accountant/lawyer.
- **Logo:** `public/logo.png` and `app/icon.png` were cropped from your poster. Replace them with the original transparent logo file.
