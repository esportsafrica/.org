'use client'
import {useRef, useEffect} from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import {useGSAP} from '@gsap/react'
import Countdown from './Countdown'
import {kes, fmtDate, fmtTime} from '@/lib/format'

gsap.registerPlugin(useGSAP)

export default function Hero({t}){
  const root = useRef(null)
  const glow = useRef(null)

  // Fluid typography entrance with GSAP spring
  const {contextSafe} = useGSAP(()=>{
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', ()=>{
      gsap.from('.h-word', {
        yPercent: 110,
        duration: 0.75,
        ease: 'elastic.out(1, 0.75)',
        stagger: 0.08
      })
      gsap.from('.h-in', {
        autoAlpha: 0,
        y: 14,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.3
      })
    })
    mm.add('(prefers-reduced-motion: reduce)', ()=>{
      gsap.from('.h-word', {
        autoAlpha: 0,
        duration: 0.3,
        stagger: 0.04
      })
      gsap.from('.h-in', {
        autoAlpha: 0,
        duration: 0.3,
        delay: 0.15
      })
    })
    return () => mm.revert()
  }, {scope: root})

  // Smooth pointer tracking for glowing ambient light
  const onMove = contextSafe(e => {
    if(!matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return
    const r = root.current.getBoundingClientRect()
    gsap.to(glow.current, {
      x: e.clientX - r.left - 300,
      y: e.clientY - r.top - 300,
      duration: 1.2,
      ease: 'power3.out',
      overwrite: 'auto'
    })
  })

  // Subtle parallax on scroll
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const handleScroll = () => {
      if(!glow.current) return
      const scrolled = window.scrollY
      glow.current.style.transform = `translate3d(0, ${scrolled * 0.08}px, 0)`
    }
    window.addEventListener('scroll', handleScroll, {passive: true})
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const words = (t?.name || 'Esports Africa').split(' ')
  const accent = Math.min(2, words.length - 1)

  return (
    <header 
      ref={root} 
      onPointerMove={onMove} 
      className="relative overflow-hidden border-b border-line bg-gradient-to-br from-[#1a1800] via-[#0f0e08] to-bg py-12 sm:py-16 md:py-20"
    >
      <div 
        ref={glow} 
        aria-hidden="true" 
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-3xl will-change-transform"
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -right-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-accent/8 blur-3xl"
      />
      
      <div className="wrap relative">
        <div className="tag h-in">
          <i className="h-2 w-2 animate-pulse rounded-full bg-live"/>
          {t ? `Upcoming · ${t.game}` : 'Esports across Africa'}
        </div>

        <h1 className="my-4 text-[clamp(36px,8.5vw,110px)] font-extrabold break-words">
          {words.map((w, i) => (
            <span key={i} className="mr-[.22em] inline-block overflow-hidden align-top">
              <span className={`h-word inline-block ${i === accent ? 'text-accent' : ''}`}>{w}</span>
            </span>
          ))}
        </h1>

        {t ? (
          <>
            <div className="h-in"><Countdown to={t.starts_at}/></div>
            
            <div className="h-in mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 sm:gap-x-9 gap-y-3">
              {[
                ['Date', fmtDate(t.starts_at)],
                ['Tip-off', fmtTime(t.starts_at)],
                ['Venue', t.venue || 'Online'],
                ['Registration', kes(t.entry_fee_kes)]
              ].map(([k, v]) => (
                <div key={k}>
                  <small className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-muted">{k}</small>
                  <b className="font-display text-lg sm:text-2xl uppercase text-white">{v}</b>
                </div>
              ))}
            </div>

            <p className="h-in mb-6 font-display text-2xl sm:text-3xl font-extrabold uppercase">
              Prize pool <span className="text-accent">{kes(t.prize_pool_kes)}</span>
            </p>

            <div className="h-in flex flex-col sm:flex-row gap-3">
              <Link href={`/tournaments/${t.slug}`} className="btn text-center">
                Register · {kes(t.entry_fee_kes)}
              </Link>
              <Link href="/tickets" className="btn btn-ghost text-center">
                Spectator tickets
              </Link>
            </div>
          </>
        ) : (
          <p className="h-in text-neutral-400">Tournaments will appear here once published.</p>
        )}
      </div>
    </header>
  )
}
