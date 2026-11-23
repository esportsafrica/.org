'use client'
import {useRef} from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import {useGSAP} from '@gsap/react'
import Countdown from './Countdown'
import {kes,fmtDate,fmtTime} from '@/lib/format'
gsap.registerPlugin(useGSAP)
export default function Hero({t}){
  const root=useRef(),glow=useRef()
  const {contextSafe}=useGSAP(()=>{
    const mm=gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      gsap.from('.h-word',{yPercent:110,duration:.8,ease:'power4.out',stagger:.08})
      gsap.from('.h-in',{autoAlpha:0,y:16,duration:.6,ease:'power3.out',stagger:.07,delay:.35})
    })
    return()=>mm.revert()
  },{scope:root})
  const onMove=contextSafe(e=>{
    if(!matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return
    const r=root.current.getBoundingClientRect()
    gsap.to(glow.current,{x:e.clientX-r.left-300,y:e.clientY-r.top-300,duration:1.2,ease:'power3.out',overwrite:'auto'})
  })
  const words=(t?.name||'Esports Africa').split(' ')
  const accent=Math.min(2,words.length-1)
  return <header ref={root} onPointerMove={onMove} className="relative overflow-hidden border-b border-line bg-gradient-to-br from-[#17160a] to-bg py-16 sm:py-20">
    <div ref={glow} aria-hidden className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-3xl"/>
    <div className="wrap relative">
      <div className="tag h-in"><i className="h-2 w-2 animate-pulse rounded-full bg-live"/>{t?`Upcoming · ${t.game}`:'Esports across Africa'}</div>
      <h1 className="my-4 text-[clamp(52px,10vw,120px)] font-extrabold">{words.map((w,i)=><span key={i} className="mr-[.25em] inline-block overflow-hidden align-top"><span className={`h-word inline-block ${i===accent?'text-accent':''}`}>{w}</span></span>)}</h1>
      {t?<>
        <div className="h-in"><Countdown to={t.starts_at}/></div>
        <div className="h-in mb-6 flex flex-wrap gap-x-9 gap-y-3">{[['Date',fmtDate(t.starts_at)],['Tip-off',fmtTime(t.starts_at)],['Venue',t.venue||'Online'],['Registration',kes(t.entry_fee_kes)]].map(([k,v])=><div key={k}><small className="block text-[11px] uppercase tracking-widest text-muted">{k}</small><b className="font-display text-2xl uppercase">{v}</b></div>)}</div>
        <p className="h-in mb-6 font-display text-3xl font-extrabold uppercase">Prize pool <span className="text-accent">{kes(t.prize_pool_kes)}</span></p>
        <div className="h-in flex flex-wrap gap-3"><Link href={`/tournaments/${t.slug}`} className="btn">Register · {kes(t.entry_fee_kes)}</Link><Link href="/tickets" className="btn btn-ghost">Spectator tickets</Link></div>
      </>:<p className="h-in text-neutral-400">Tournaments will appear here once published.</p>}
    </div></header>
}
