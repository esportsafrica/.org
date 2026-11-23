import Reveal from './Reveal'
import Match from './Match'
export default function ResultsTicker({matches}){
  if(!matches.length)return <p className="text-muted">Results will appear here as matches are played.</p>
  return <div className="flex gap-3.5 overflow-x-auto pb-2">{matches.map((m,i)=><Reveal key={m.id} delay={i*70} className="shrink-0"><Match m={m} compact/></Reveal>)}</div>
}
