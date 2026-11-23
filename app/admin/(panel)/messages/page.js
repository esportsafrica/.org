import {requireAdmin} from '@/lib/auth'
import {fmtDate} from '@/lib/format'
export default async function Messages(){
  const {sb}=await requireAdmin();const {data}=await sb.from('messages').select('*').order('created_at',{ascending:false}).limit(100)
  return <><h1 className="mb-6 text-5xl font-extrabold">Messages</h1><div className="space-y-3">{(data||[]).map(m=><div key={m.id} className="panel"><p className="text-sm text-muted">{m.name} · <a className="text-accent" href={`mailto:${m.email}`}>{m.email}</a> · {fmtDate(m.created_at)}</p><p className="mt-2 whitespace-pre-wrap">{m.body}</p></div>)}{!data?.length&&<p className="text-muted">No messages.</p>}</div></>
}
