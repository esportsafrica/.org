'use client'
import {useState,useEffect} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

const LINKS = [
  ['/','Home'],
  ['/tournaments','Tournaments'],
  ['/live','Live'],
  ['/tickets','Tickets'],
  ['/rankings','Rankings'],
  ['/news','News']
]

export default function Navbar({user,role}){
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer when route changes
  useEffect(()=>{
    setMobileOpen(false)
  },[pathname])

  // Prevent background scrolling when mobile drawer is open
  useEffect(()=>{
    if(mobileOpen){
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  },[mobileOpen])

  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-black/95 backdrop-blur-md pt-safe">
      <div className="wrap flex h-[64px] items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wide"
        >
          <img src="/logo.png" alt="Esports Africa" width="30" height="34" className="h-[32px] sm:h-[36px] w-auto"/>
          <span>Esports <b className="text-accent">Africa</b></span>
        </Link>

        {/* Desktop Navigation Links */}
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

        {/* Desktop Right Side CTA */}
        <div className="hidden md:flex items-center gap-3">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="rounded-sm border border-neutral-700 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-neutral-300 hover:border-white hover:text-white"
            >
              Admin Panel
            </Link>
          )}

          <Link
            href={user ? '/account' : '/login'}
            className="btn btn-sm"
          >
            {user ? 'My Account' : 'Sign In'}
          </Link>
        </div>

        {/* Mobile Actions: Account icon + Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={user ? '/account' : '/login'}
            className="flex min-h-[40px] items-center rounded-sm border border-line bg-surface px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent"
          >
            {user ? 'Account' : 'Sign In'}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-sm border border-line bg-surface text-neutral-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[calc(64px+env(safe-area-inset-top,0px))] z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex max-h-[calc(100vh-64px-env(safe-area-inset-top,0px))] flex-col border-b border-line bg-surface px-5 py-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto overscroll-contain"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              {LINKS.map(([href, label]) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-between rounded-sm px-4 py-3 font-display text-lg font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-accent text-black' : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-2">
                      {label === 'Live' && <i className={`h-2 w-2 animate-pulse rounded-full ${isActive ? 'bg-black' : 'bg-live'}`}/>}
                      {label}
                    </span>
                    <span className="text-xs opacity-60">→</span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 border-t border-line/60 pt-6 space-y-3">
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center rounded-sm border border-accent bg-accent/10 py-3 font-display text-sm font-bold uppercase tracking-wider text-accent"
                >
                  Admin Command Center
                </Link>
              )}

              <Link
                href={user ? '/account' : '/login'}
                className="btn w-full text-center"
              >
                {user ? 'My Account Dashboard' : 'Sign In / Register'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
