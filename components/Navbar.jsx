'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
const L=[['/','Home'],['/tournaments','Tournaments'],['/live','Live'],['/tickets','Tickets'],['/rankings','Rankings'],['/news','News']]
export default function Navbar({user,role}){
  const p=usePathname()
  return <nav className="sticky top-0 z-20 border-b border-line bg-black"><div className="wrap flex h-[60px] items-center gap-6">
    <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-2xl font-extrabold uppercase"><img src="/logo.png" alt="" width="30" height="34" className="h-[34px] w-auto"/><span className="hidden sm:inline">Esports <b className="text-accent">Africa</b></span></Link>
    <div className="ml-auto flex gap-5 overflow-x-auto">{L.map(([h,t])=>{const on=h==='/'?p==='/':p.startsWith(h)
      return <Link key={h} href={h} className={`flex items-center gap-1.5 border-b-2 py-1.5 font-display text-[15px] font-bold uppercase tracking-widest transition-colors duration-150 ease-out ${on?'border-accent text-white':'border-transparent text-neutral-400 hover:text-white'}`}>{t==='Live'&&<i className="h-2 w-2 animate-pulse rounded-full bg-live"/>}{t}</Link>})}<Link href={user?'/account':'/login'} className="flex items-center border-b-2 border-transparent py-1.5 font-display text-[15px] font-bold uppercase tracking-widest text-accent">{user?'Account':'Sign in'}</Link>{role==='admin'&&<Link href="/admin" className="flex items-center border-b-2 border-transparent py-1.5 font-display text-[15px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white">Admin</Link>}</div></div></nav>
}
