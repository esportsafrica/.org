export default function RulesAccordion({rules}){
  return <div className="border border-line">{rules.map(r=><details key={r.title} className="group border-b border-line last:border-0">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-display text-lg font-bold uppercase tracking-wide">{r.title}<span className="text-accent transition-transform duration-200 ease-out group-open:rotate-45">+</span></summary>
    <p className="px-4 pb-4 text-sm text-neutral-400">{r.body}</p></details>)}</div>
}
