import {notFound} from 'next/navigation'
import {getPost} from '@/lib/queries'
import {fmtDate} from '@/lib/format'
export const dynamic='force-dynamic'
export async function generateMetadata({params}){const p=await getPost(params.slug);return{title:p?`${p.title} · Esports Africa`:'News',openGraph:p?.cover_url?{images:[p.cover_url]}:undefined}}
export default async function Post({params}){
  const p=await getPost(params.slug);if(!p)notFound()
  return <article className="wrap max-w-3xl py-12"><p className="text-xs text-muted">{fmtDate(p.created_at)}</p><h1 className="my-3 text-[clamp(40px,7vw,72px)] font-extrabold">{p.title}</h1>
    {p.cover_url&&<img src={p.cover_url} alt="" className="mb-6 w-full"/>}{p.body.split(/\n\s*\n/).map((x,i)=><p key={i} className="mb-4 text-neutral-300">{x}</p>)}</article>
}
