import Link from 'next/link'
import Hero from '@/components/Hero'
import FeaturedTournament from '@/components/FeaturedTournament'
import ResultsTicker from '@/components/ResultsTicker'
import SectionHead from '@/components/SectionHead'
import Reveal from '@/components/Reveal'
import {getFeatured,recentMatches,listSponsors} from '@/lib/queries'
export const dynamic='force-dynamic'
export default async function Home(){
  const [t,matches,sponsors]=await Promise.all([getFeatured(),recentMatches(6),listSponsors()])
  return <>
    <Hero t={t}/>
    {t&&<section className="section"><div className="wrap"><SectionHead a="Next" b="tournament"><Link href="/tournaments" className="btn btn-ghost">All tournaments</Link></SectionHead><Reveal><FeaturedTournament t={t} priority/></Reveal></div></section>}
    <section className="section"><div className="wrap"><SectionHead a="Live &amp; recent" b="results"><Link href="/live" className="btn btn-ghost">Full live center</Link></SectionHead><ResultsTicker matches={matches}/></div></section>
    {sponsors.length>0&&<Reveal className="wrap flex flex-wrap items-center justify-around gap-8 py-10">{sponsors.map(s=>{const img=s.logo_url?<img src={s.logo_url} alt={s.name} className="h-10 w-auto max-w-[160px] object-contain opacity-60 grayscale transition-opacity duration-200 hover:opacity-100"/>:<span className="font-display text-2xl font-extrabold uppercase tracking-[.12em] text-neutral-600">{s.name}</span>;return s.url?<a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{img}</a>:<span key={s.id}>{img}</span>})}</Reveal>}
  </>
}
