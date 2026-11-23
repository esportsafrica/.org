import Link from 'next/link'
import {redirect} from 'next/navigation'
import {supabaseServer} from '@/lib/supabase/server'
import {signOutUser} from './actions'

export const dynamic='force-dynamic'

const ACCOUNT_LINKS = [
  ['/account','Overview'],
  ['/account/registrations','My registrations'],
  ['/account/tickets','My tickets'],
  ['/account/profile','Profile']
]

export default async function AccountLayout({children}){
  const sb=supabaseServer()
  const {data:{user}}=await sb.auth.getUser()
  if(!user)redirect('/login')

  return (
    <div className="wrap grid gap-6 md:gap-8 py-6 sm:py-8 md:grid-cols-[200px_1fr]">
      <aside className="space-y-3 md:sticky md:top-20 md:self-start">
        <div className="hidden md:block">
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>

        {/* Responsive horizontal scrollable tabs on mobile, vertical stack on desktop */}
        <div className="flex md:flex-col overflow-x-auto no-scrollbar touch-scroll gap-2 pb-2 md:pb-0">
          {ACCOUNT_LINKS.map(([h,t]) => (
            <Link
              key={h}
              href={h}
              className="shrink-0 rounded-sm border border-line bg-surface/50 px-3 py-1.5 font-display text-sm md:text-[15px] font-bold uppercase tracking-wider text-neutral-300 transition-colors duration-150 hover:border-accent hover:bg-surface hover:text-white md:border-transparent md:bg-transparent"
            >
              {t}
            </Link>
          ))}
          <form action={signOutUser} className="shrink-0 md:pt-2">
            <button className="rounded-sm border border-transparent px-3 py-1.5 text-xs md:text-sm text-muted hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  )
}
