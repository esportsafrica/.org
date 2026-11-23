import Reveal from './Reveal'
import Match from './Match'
const ROUNDS=[['quarter','Quarterfinals'],['semi','Semifinals'],['final','Grand Final']]
export default function Bracket({matches}){
  const cols=ROUNDS.map(([s,n])=>[n,matches.filter(m=>m.stage===s)]).filter(([,m])=>m.length)
  if(!cols.length)return <p className="text-muted">Knockout bracket not set yet.</p>
  return <Reveal className="overflow-x-auto"><div className="grid min-w-[760px] items-stretch gap-7" style={{gridTemplateColumns:`repeat(${cols.length},minmax(0,1fr))`}}>{cols.map(([n,ms])=><div key={n} className="flex flex-col justify-around gap-4">
    <h4 className="font-display text-[13px] font-bold uppercase tracking-[.14em] text-accent">{n}</h4>{ms.map(m=><Match key={m.id} m={m}/>)}</div>)}</div></Reveal>
}
