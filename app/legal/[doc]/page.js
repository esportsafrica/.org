import {notFound} from 'next/navigation'
import {LEGAL} from '@/lib/legal'
export function generateStaticParams(){return Object.keys(LEGAL).map(doc=>({doc}))}
export function generateMetadata({params}){return{title:`${LEGAL[params.doc]?.title||'Legal'} · Esports Africa`}}
export default function Legal({params}){
  const d=LEGAL[params.doc];if(!d)notFound()
  return <article className="wrap max-w-3xl py-12"><h1 className="mb-2 text-[clamp(40px,7vw,72px)] font-extrabold">{d.title}</h1><p className="mb-8 text-xs text-muted">Last updated: [date]. Draft pending legal review.</p>
    {d.body.map(([h,t])=><section key={h} className="mb-6"><h2 className="mb-1 text-2xl text-accent">{h}</h2><p className="text-neutral-300">{t}</p></section>)}</article>
}
