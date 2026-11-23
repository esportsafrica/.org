import {requireAdmin} from '@/lib/auth'
import {kes} from '@/lib/format'
export default async function Dash(){
  const {sb}=await requireAdmin()
  const c=t=>sb.from(t).select('*',{count:'exact',head:true})
  const [t,pend,reg,paid,tiers]=await Promise.all([c('tournaments'),c('registrations').eq('status','pending'),c('registrations'),sb.from('orders').select('total').eq('status','paid'),sb.from('ticket_tiers').select('sold')])
  const revenue=(paid.data||[]).reduce((a,o)=>a+o.total,0),sold=(tiers.data||[]).reduce((a,x)=>a+x.sold,0)
  const S=[['Tournaments',t.count],['Pending registrations',pend.count],['Total registrations',reg.count],['Tickets sold',sold],['Ticket revenue',kes(revenue)]]
  return <><h1 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-extrabold">Dashboard</h1><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{S.map(([k,v])=><div key={k} className="panel"><small className="text-xs uppercase tracking-widest text-muted">{k}</small><p className="font-display text-4xl font-extrabold text-accent">{v??0}</p></div>)}</div></>
}
