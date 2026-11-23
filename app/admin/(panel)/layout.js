import Link from 'next/link'
import {requireAdmin} from '@/lib/auth'
import {signOut} from '../actions'
export const dynamic='force-dynamic'
export default async function AdminLayout({children}){
  const {user}=await requireAdmin()
  return <div className="wrap grid gap-8 py-8 md:grid-cols-[200px_1fr]">
    <aside className="space-y-1 md:sticky md:top-20 md:self-start"><p className="mb-3 truncate text-xs text-muted">{user.email}</p>
      {[['/admin','Dashboard'],['/admin/tournaments','Tournaments'],['/admin/registrations','Registrations'],['/admin/matches','Matches & scores'],['/admin/tickets','Tickets & orders'],['/admin/checkin','Gate check-in'],['/admin/users','Users & admins'],['/admin/posts','News'],['/admin/sponsors','Sponsors'],['/admin/messages','Messages'],['/admin/audit','Audit log']].map(([h,t])=><Link key={h} href={h} className="block rounded-sm px-3 py-2 font-display text-[15px] font-bold uppercase tracking-wider text-neutral-300 transition-colors duration-150 hover:bg-surface hover:text-white">{t}</Link>)}
      <form action={signOut}><button className="px-3 py-2 text-sm text-muted hover:text-white">Sign out</button></form></aside>
    <section className="min-w-0">{children}</section></div>
}
