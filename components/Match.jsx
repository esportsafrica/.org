import {fmtTime} from '@/lib/format'
export default function Match({m,compact}){
  const live=m.status==='live',done=m.score_a!=null&&m.score_b!=null
  const row=(n,s,win)=><div className={`flex justify-between px-3 py-2 font-semibold ${win?'[&>span:last-child]:text-accent':''}`}><span>{n}</span><span className="font-display text-xl font-extrabold">{s??'–'}</span></div>
  return <div className={`border border-line bg-surface ${compact?'min-w-[250px]':'border-l-[3px]'} ${live?'border-l-live':''}`}>
    <div className="flex justify-between px-3 pt-3 text-xs text-muted"><span>{m.starts_at?fmtTime(m.starts_at):''}</span><span className={`badge ${live?'badge-live':m.status==='upcoming'?'badge-up':''}`}>{m.status}</span></div>
    {row(m.team_a,m.score_a,done&&m.score_a>m.score_b)}<div className="border-t border-line"/>{row(m.team_b,m.score_b,done&&m.score_b>m.score_a)}</div>
}
