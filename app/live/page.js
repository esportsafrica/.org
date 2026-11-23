import Link from 'next/link'
import Standings from '@/components/Standings'
import Bracket from '@/components/Bracket'
import SectionHead from '@/components/SectionHead'
import Reveal from '@/components/Reveal'
import LiveRefresh from '@/components/LiveRefresh'
import {listTournaments,getMatches,standings} from '@/lib/queries'
export const metadata={title:'Live · Esports Africa'}
export const dynamic='force-dynamic'
export default async function Live({searchParams}){
  const ts=await listTournaments()
  const t=ts.find(x=>x.slug===searchParams.t)||ts.find(x=>x.status==='live')||ts.find(x=>x.status==='open')||ts[0]
  if(!t)return <div className="wrap py-20 text-muted">No tournaments yet.</div>
  const matches=await getMatches(t.id)
  return <div className="wrap py-10"><LiveRefresh tournamentId={t.id}/>
    <Reveal><div className="tag">{t.status==='live'&&<i className="h-2 w-2 animate-pulse rounded-full bg-live"/>}Live tournament center · {t.game}</div>
      <h1 className="mt-2.5 text-[clamp(44px,8vw,88px)] font-extrabold">{t.name}</h1></Reveal>
    {ts.length>1&&<div className="mt-4 flex flex-wrap gap-2">{ts.map(x=><Link key={x.id} href={`/live?t=${x.slug}`} className={`rounded-sm border px-3.5 py-1.5 font-display text-sm font-bold uppercase tracking-wider ${x.id===t.id?'border-accent bg-accent text-black':'border-line text-neutral-300'}`}>{x.name}</Link>)}</div>}
    <Reveal className="relative my-6 aspect-video overflow-hidden border border-line bg-surface">
      {t.stream_url?<iframe src={t.stream_url} title={`${t.name} live stream`} allowFullScreen className="absolute inset-0 h-full w-full"/>:<div className="grid h-full place-items-center border border-dashed border-neutral-600 text-center"><div><h3 className="text-3xl">Stream starts at tip-off</h3><p className="mt-1.5 text-muted">Check back on match day</p></div></div>}</Reveal>
    <SectionHead a="Group" b="stage"/><Standings groups={standings(matches)}/>
    <div className="mt-10"><SectionHead a="Knockout" b="bracket"/><Bracket matches={matches.filter(m=>m.stage!=='group')}/></div>
  </div>
}
