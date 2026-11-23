import Reveal from './Reveal'
export default function Standings({groups}){
  if(!groups.length)return <p className="text-muted">Group stage not started.</p>
  return <div className="grid gap-5 md:grid-cols-2">{groups.map(([k,rows],gi)=><Reveal key={k} delay={gi*70}>
    <h3 className="mb-2.5 text-[22px] text-muted">Group {k}</h3>
    <div className="overflow-x-auto border border-line"><table className="w-full min-w-[460px] bg-surface text-center">
      <thead><tr className="font-display text-[13px] uppercase tracking-widest text-muted">{['#','Team','P','W','D','L','GD','Pts'].map((h,i)=><th key={h} className={`border-b border-line px-3 py-2.5 ${i===1?'text-left':''}`}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={r.t} className={i<2?'shadow-[inset_3px_0_#f7d000]':''}><td className="border-b border-line px-3 py-2.5">{i+1}</td><td className="border-b border-line px-3 py-2.5 text-left">{r.t}</td>
        {[r.p,r.w,r.d,r.l].map((v,j)=><td key={j} className="border-b border-line px-3 py-2.5">{v}</td>)}<td className="border-b border-line px-3 py-2.5">{r.gd>0?'+':''}{r.gd}</td><td className="border-b border-line px-3 py-2.5 font-display text-xl font-extrabold text-accent">{r.pts}</td></tr>)}</tbody></table></div></Reveal>)}</div>
}
