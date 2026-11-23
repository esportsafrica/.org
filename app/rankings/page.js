import SectionHead from '@/components/SectionHead'
import {rankings} from '@/lib/queries'
export const metadata={title:'Rankings · Esports Africa'}
export const dynamic='force-dynamic'
export default async function Rankings(){
  const rows=await rankings()
  return <div className="wrap py-10"><SectionHead a="All-time" b="rankings"/><p className="mb-4 text-sm text-muted">Points across all completed matches: 3 for a win, 1 for a draw.</p>
    <div className="overflow-x-auto border border-line"><table className="tbl bg-surface text-center"><thead><tr><th>#</th><th className="!text-left">Team / player</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>
      {rows.map((r,i)=><tr key={r.t} className={i<3?'shadow-[inset_3px_0_#f7d000]':''}><td>{i+1}</td><td className="!text-left">{r.t}</td><td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf-r.ga>0?'+':''}{r.gf-r.ga}</td><td className="font-display text-xl font-extrabold text-accent">{r.pts}</td></tr>)}</tbody></table></div>
    {!rows.length&&<p className="mt-4 text-muted">Rankings appear after the first completed matches.</p>}</div>
}
