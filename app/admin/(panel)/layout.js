import Link from 'next/link'
import {requireAdmin} from '@/lib/auth'
import {signOut} from '../actions'

export const dynamic='force-dynamic'

const ADMIN_LINKS = [
  ['/admin','Dashboard'],
  ['/admin/tournaments','Tournaments'],
  ['/admin/registrations','Registrations'],
  ['/admin/matches','Matches & scores'],
  ['/admin/tickets','Tickets & orders'],
  ['/admin/checkin','Gate check-in'],
  ['/admin/users','Users & admins'],
  ['/admin/posts','News'],
  ['/admin/sponsors','Sponsors'],
  ['/admin/messages','Messages'],
  ['/admin/audit','Audit log']
]

export default async function AdminLayout({children}){
  const {user}=await requireAdmin()

  return (
    <div className="wrap grid gap-6 md:gap-8 py-6 sm:py-8 md:grid-cols-[200px_1fr]">
      <aside className="space-y-3 md:sticky md:top-20 md:self-start">
        <div className="hidden md:block">
          <span className="badge badge-accent mb-2 inline-block font-bold text-black">Admin Mode</span>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>

        {/* Responsive horizontal pill strip on mobile, vertical navigation on desktop */}
        <div className="flex md:flex-col overflow-x-auto no-scrollbar touch-scroll gap-1.5 pb-2 md:pb-0">
          {ADMIN_LINKS.map(([h,t]) => (
            <Link
              key={h}
              href={h}
              className="shrink-0 rounded-sm border border-line bg-surface/50 px-3 py-1.5 font-display text-xs sm:text-sm md:text-[15px] font-bold uppercase tracking-wider text-neutral-300 transition-colors duration-150 hover:border-accent hover:bg-surface hover:text-white md:border-transparent md:bg-transparent"
            >
              {t}
            </Link>
          ))}
          <form action={signOut} className="shrink-0 md:pt-2">
            <button className="rounded-sm border border-transparent px-3 py-1.5 text-xs text-muted hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  )
}
