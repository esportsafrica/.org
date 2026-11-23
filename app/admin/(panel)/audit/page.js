import {requireAdmin} from '@/lib/auth'
export default async function Audit(){
  const {sb}=await requireAdmin();const {data}=await sb.from('audit_log').select('*').order('created_at',{ascending:false}).limit(150)
  return <><h1 className="mb-6 text-5xl font-extrabold">Audit log</h1><div className="overflow-x-auto border border-line"><table className="tbl bg-surface"><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Entity</th><th>Detail</th></tr></thead><tbody>
    {(data||[]).map(a=><tr key={a.id}><td className="whitespace-nowrap text-xs">{new Date(a.created_at).toLocaleString('en-GB',{timeZone:'Africa/Nairobi'})}</td><td className="font-mono text-xs">{String(a.actor).slice(0,8)}</td><td>{a.action}</td><td>{a.entity} <span className="font-mono text-xs text-muted">{String(a.entity_id).slice(0,12)}</span></td><td className="text-xs text-muted">{JSON.stringify(a.detail)}</td></tr>)}</tbody></table></div></>
}
