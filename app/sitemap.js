import {listTournaments,listPosts} from '@/lib/queries'
export const dynamic='force-dynamic'
export default async function sitemap(){
  const s=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000',[ts,ps]=await Promise.all([listTournaments(),listPosts(100)])
  return [...['','/tournaments','/live','/tickets','/rankings','/news','/about','/faq','/contact'].map(p=>({url:s+p})),...ts.map(t=>({url:`${s}/tournaments/${t.slug}`})),...ps.map(p=>({url:`${s}/news/${p.slug}`}))]
}
