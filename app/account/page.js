import Link from 'next/link'
import {supabaseServer} from '@/lib/supabase/server'
import {fmtDate,fmtTime,kes} from '@/lib/format'
export const metadata={title:'My account · Esports Africa'}
export default async function Overview(){
  const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser()
  const [{data:prof},{data:regs},{data:tix}]=await Promise.all([sb.from('profiles').select('full_name').eq('id',user.id).maybeSingle(),
    sb.from('registrations').select('*, tournaments(*)').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('tickets').select('*, tournaments(name,starts_at,venue)').eq('user_id',user.id).eq('status','valid')])
  const active=(regs||[]).filter(r=>['pending','approved'].includes(r.status))
  const todo=active.filter(r=>r.status==='approved'&&!r.paid&&r.tournaments.entry_fee_kes>0)
  const dates=[...active.map(r=>r.tournaments),...(tix||[]).map(t=>t.tournaments)].filter(t=>new Date(t.starts_at)>new Date()).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at))
  const next=dates[0]
  return <><h1 className="mb-1 text-5xl font-extrabold">Hi, {prof?.full_name?.split(' ')[0]||'player'}</h1><p className="mb-6 text-muted">Everything you’ve registered for and bought, in one place.</p>
    {todo.length>0&&<div className="panel mb-5 border-accent"><h3 className="mb-2 text-2xl text-accent">Action needed</h3>{todo.map(r=><p key={r.id} className="text-sm">Your entry to <b>{r.tournaments.name}</b> is approved. <Link href="/account/registrations" className="text-accent underline">Pay {kes(r.tournaments.entry_fee_kes)}</Link> to lock your slot.</p>)}</div>}
    <div className="grid gap-4 sm:grid-cols-3">{[['Active registrations',active.length],['Valid tickets',tix?.length||0],['Next event',next?fmtDate(next.starts_at):'—']].map(([k,v])=><div key={k} className="panel"><small className="text-xs uppercase tracking-widest text-muted">{k}</small><p className="font-display text-4xl font-extrabold text-accent">{v}</p></div>)}</div>
    {next&&<p className="mt-5 text-neutral-300">Up next: <b>{next.name}</b> · {fmtDate(next.starts_at)} · {fmtTime(next.starts_at)}{next.venue?` · ${next.venue}`:''}</p>}
    {!regs?.length&&!tix?.length&&<div className="mt-6 flex gap-3"><Link href="/tournaments" className="btn">Find a tournament</Link><Link href="/tickets" className="btn btn-ghost">Buy tickets</Link></div>}</>
}
