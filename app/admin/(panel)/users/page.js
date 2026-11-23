import {requireAdmin} from '@/lib/auth'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {fmtDate} from '@/lib/format'
import {setRole} from '../../actions'
export default async function Users(){
  const {sb,user}=await requireAdmin()
  const [{data:au},{data:profiles}]=await Promise.all([supabaseAdmin().auth.admin.listUsers({perPage:200}),sb.from('profiles').select('*')])
  const pm=Object.fromEntries((profiles||[]).map(p=>[p.id,p]))
  return <><h1 className="mb-6 text-5xl font-extrabold">Users &amp; admins</h1><div className="overflow-x-auto border border-line"><table className="tbl bg-surface"><thead><tr><th>Email</th><th>Name</th><th>Joined</th><th>Role</th><th/></tr></thead><tbody>
    {(au?.users||[]).map(u=>{const p=pm[u.id];return <tr key={u.id}><td>{u.email}</td><td>{p?.full_name}</td><td>{fmtDate(u.created_at)}</td><td><span className={`badge ${p?.role==='admin'?'badge-up':''}`}>{p?.role||'user'}</span></td>
      <td>{u.id!==user.id&&<form action={setRole}><input type="hidden" name="id" value={u.id}/><button name="role" value={p?.role==='admin'?'user':'admin'} className="btn btn-ghost btn-sm">{p?.role==='admin'?'Remove admin':'Make admin'}</button></form>}</td></tr>})}</tbody></table></div></>
}
