import Link from 'next/link'
import SectionHead from '@/components/SectionHead'
import {listPosts} from '@/lib/queries'
import {fmtDate} from '@/lib/format'
export const metadata={title:'News · Esports Africa'}
export const dynamic='force-dynamic'
export default async function News(){
  const posts=await listPosts(30)
  return <div className="wrap py-10"><SectionHead a="Latest" b="news"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map(p=><Link key={p.id} href={`/news/${p.slug}`} className="panel block transition-colors duration-150 hover:border-accent">
    {p.cover_url&&<img src={p.cover_url} alt="" className="mb-3 aspect-video w-full object-cover"/>}<p className="text-xs text-muted">{fmtDate(p.created_at)}</p><h3 className="text-2xl">{p.title}</h3></Link>)}</div>
    {!posts.length&&<p className="text-muted">No news yet.</p>}</div>
}
