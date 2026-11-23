import Link from 'next/link'
import {requireAdmin} from '@/lib/auth'
import {fmtDate,kes} from '@/lib/format'
import {deleteTournament} from '../../actions'
export default async function List(){
  const {sb}=await requireAdmin();const {data}=await sb.from('tournaments').select('*').order('starts_at',{ascending:false})
  return <><div className="mb-6 flex items-center justify-between"><h1 className="text-5xl font-extrabold">Tournaments</h1><Link href="/admin/tournaments/new" className="btn">New tournament</Link></div>
    <div className="overflow-x-auto border border-line"><table className="tbl bg-surface"><thead><tr><th>Name</th><th>Game</th><th>Format</th><th>Status</th><th>Date</th><th>Prize</th><th/></tr></thead><tbody>
      {(data||[]).map(t=><tr key={t.id}><td>{t.name}</td><td>{t.game}</td><td><span className="text-xs uppercase tracking-wider text-accent">{t.entry_type||'solo'}{t.entry_type!=='solo'&&` (${t.min_roster_size}-${t.max_roster_size})`}</span></td><td><span className="badge">{t.status}</span></td><td>{fmtDate(t.starts_at)}</td><td>{kes(t.prize_pool_kes)}</td>
        <td className="flex gap-2"><Link href={`/admin/tournaments/${t.id}`} className="btn btn-ghost btn-sm">Edit</Link><form action={deleteTournament}><input type="hidden" name="id" value={t.id}/><button className="btn btn-ghost btn-sm text-live">Delete</button></form></td></tr>)}</tbody></table></div></>
}
