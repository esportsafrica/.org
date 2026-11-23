import {STEPS} from '@/lib/progress.mjs'
export default function Stepper({index}){
  return <ol className="flex items-center gap-1 overflow-x-auto py-2" aria-label="Registration progress">{STEPS.map((s,i)=><li key={s} className="flex items-center gap-1">
    <span className={`flex items-center gap-1.5 whitespace-nowrap font-display text-xs font-bold uppercase tracking-widest ${i<=index?'text-accent':'text-neutral-600'}`}><i className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] not-italic ${i<=index?'border-accent bg-accent text-black':'border-neutral-700'}`}>{i<index?'✓':i+1}</i>{s}</span>
    {i<STEPS.length-1&&<span className={`mx-1 h-px w-5 ${i<index?'bg-accent':'bg-neutral-700'}`}/>}</li>)}</ol>
}
