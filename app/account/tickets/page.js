import Link from 'next/link'
import QRCode from 'qrcode'
import {supabaseServer} from '@/lib/supabase/server'
import {fmtDate,fmtTime,kes} from '@/lib/format'
export const metadata={title:'My tickets · Esports Africa'}
export default async function Tickets(){
  const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser()
  const [{data:tix},{data:orders}]=await Promise.all([sb.from('tickets').select('*, tournaments(name,starts_at,venue), ticket_tiers(name)').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false})])
  const qr=await Promise.all((tix||[]).map(t=>QRCode.toDataURL(t.code,{margin:1,width:200})))
  return <><h1 className="mb-6 text-5xl font-extrabold">My tickets</h1>
    <div className="grid gap-4 sm:grid-cols-2">{(tix||[]).map((t,i)=><div key={t.id} className={`panel flex gap-4 ${t.status!=='valid'?'opacity-60':''}`}>
      <img src={qr[i]} alt={`QR code for ticket ${t.code}`} width={112} height={112} className="h-28 w-28 shrink-0 bg-white"/>
      <div className="min-w-0"><span className={`badge ${t.status==='valid'?'badge-open':''}`}>{t.status}</span><h3 className="mt-1.5 text-2xl">{t.ticket_tiers?.name}</h3><p className="truncate text-sm">{t.tournaments?.name}</p>
        <p className="text-xs text-muted">{fmtDate(t.tournaments?.starts_at)} · {fmtTime(t.tournaments?.starts_at)}<br/>{t.tournaments?.venue}</p><p className="mt-1 font-mono text-sm text-accent">{t.code}</p></div></div>)}</div>
    {!tix?.length&&<><p className="mb-4 text-muted">No tickets yet. Tickets appear here as soon as payment is confirmed.</p><Link href="/tickets" className="btn">Buy tickets</Link></>}
    {orders?.length>0&&<><h2 className="mb-2 mt-10 text-3xl">Order history</h2><div className="overflow-x-auto border border-line"><table className="tbl bg-surface"><thead><tr><th>Reference</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.reference}</td><td>{o.items.map(i=>`${i.name} × ${i.qty}`).join(', ')}</td><td>{kes(o.total)}</td><td><span className={`badge ${o.status==='paid'?'badge-open':''}`}>{o.status}</span></td><td>{fmtDate(o.created_at)}</td></tr>)}</tbody></table></div></>}</>
}
