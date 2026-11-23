'use client'
import {useState, useEffect, useRef} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import gsap from 'gsap'
import {useGSAP} from '@gsap/react'

gsap.registerPlugin(useGSAP)

const LINKS = [
  ['/','Home'],
  ['/tournaments','Tournaments'],
  ['/live','Live'],
  ['/tickets','Tickets'],
  ['/rankings','Rankings'],
  ['/news','News']
]

export default function Navbar({user, role}){
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerRef = useRef(null)
  const overlayRef = useRef(null)

  // Auto-close on route change
  useEffect(()=>{ 
    setMobileOpen(false) 
  }, [pathname])

  // Lock body scroll when open
  useEffect(()=>{
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Spring-driven drawer animation (Apple Fluid Interfaces: critically damped, interruptible)
  useGSAP(()=>{
    const drawer = drawerRef.current
    const overlay = overlayRef.current
    if(!drawer || !overlay) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', ()=>{
      if(mobileOpen){
        gsap.set(drawer, {display: 'flex'})
        gsap.fromTo(drawer,
          {autoAlpha: 0, y: -20},
          {autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out', overwrite: 'auto'}
        )
        gsap.to(overlay, {autoAlpha: 1, duration: 0.2, overwrite: 'auto'})
      } else {
        gsap.to(drawer, {
          autoAlpha: 0, 
          y: -12, 
          duration: 0.22, 
          ease: 'power2.in', 
          overwrite: 'auto',
          onComplete: ()=>{ gsap.set(drawer, {display: 'none'}) }
        })
        gsap.to(overlay, {autoAlpha: 0, duration: 0.18, overwrite: 'auto'})
      }
    })
    mm.add('(prefers-reduced-motion: reduce)', ()=>{
      if(mobileOpen){
        gsap.set(drawer, {display: 'flex'})
        gsap.to(drawer, {autoAlpha: 1, duration: 0.15, overwrite: 'auto'})
        gsap.to(overlay, {autoAlpha: 1, duration: 0.1, overwrite: 'auto'})
      } else {
        gsap.to(drawer, {
          autoAlpha: 0, 
          duration: 0.12, 
          overwrite: 'auto',
          onComplete: ()=>{ gsap.set(drawer, {display: 'none'}) }
        })
        gsap.to(overlay, {autoAlpha: 0, duration: 0.1, overwrite: 'auto'})
      }
    })
    return ()=>mm.revert()
  }, [mobileOpen])

  return (
    <nav className="sticky top-0 z-30 pt-safe navbar-glass">
      <div className="wrap flex h-[64px] items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wide"
        >
          <img src="/logo.png" alt="Esports Africa" width="30" height="34" className="h-[32px] sm:h-[36px] w-auto"/>
          <span>Esports <b className="text-accent">Africa</b></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {LINKS.map(([href, label]) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 border-b-2 py-1.5 font-display text-[15px] font-bold uppercase tracking-widest transition-colors duration-150 ${isActive ? 'border-accent text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                {label === 'Live' && <i className="h-2 w-2 animate-pulse rounded-full bg-live"/>}
                {label}
              </Link>
            )
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="rounded-sm border border-neutral-700 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-neutral-300 hover:border-white hover:text-white transition-colors duration-150"
            >
              Admin Panel
            </Link>
          )}
          <Link href={user ? '/account' : '/login'} className="btn btn-sm">
            {user ? 'My Account' : 'Sign In'}
          </Link>
        </div>

        {/* Mobile: Account badge + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={user ? '/account' : '/login'}
            className="flex min-h-[40px] items-center rounded-sm border border-line bg-surface px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent active:opacity-70 touch-manipulation"
          >
            {user ? 'Account' : 'Sign In'}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-sm border border-line bg-surface text-neutral-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent active:scale-95 transition-transform duration-150 touch-manipulation"
          >
            <svg
              className={`h-6 w-6 transition-transform duration-200 ease-out ${mobileOpen ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        style={{opacity: 0, visibility: 'hidden'}}
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 top-[calc(64px+env(safe-area-inset-top,0px))] z-40 bg-black/70 backdrop-blur-sm md:hidden"
        aria-hidden="true"
      />

      {/* Mobile Drawer (Translucent glass surface, spring transition) */}
      <div
        ref={drawerRef}
        style={{display: 'none', opacity: 0}}
        onClick={e => e.stopPropagation()}
        className="fixed inset-x-0 top-[calc(64px+env(safe-area-inset-top,0px))] z-50 flex-col border-b border-line glass px-5 py-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] max-h-[calc(100vh-64px-env(safe-area-inset-top,0px))] overflow-y-auto overscroll-contain md:hidden"
      >
        <div className="flex flex-col space-y-1">
          {LINKS.map(([href, label]) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between rounded-sm px-4 py-3 font-display text-lg font-bold uppercase tracking-wider transition-colors active:opacity-70 touch-manipulation ${isActive ? 'bg-accent text-black' : 'text-neutral-200 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="flex items-center gap-2">
                  {label === 'Live' && <i className={`h-2 w-2 animate-pulse rounded-full ${isActive ? 'bg-black' : 'bg-live'}`}/>}
                  {label}
                </span>
                <span className="text-xs opacity-40">→</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 border-t border-line/60 pt-6 space-y-3">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center justify-center rounded-sm border border-accent bg-accent/10 py-3 font-display text-sm font-bold uppercase tracking-wider text-accent active:opacity-70 touch-manipulation"
            >
              Admin Command Center
            </Link>
          )}
          <Link href={user ? '/account' : '/login'} className="btn w-full text-center">
            {user ? 'My Account Dashboard' : 'Sign In / Register'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
