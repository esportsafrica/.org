import './globals.css'
import Link from 'next/link'
import {Barlow_Condensed,Inter} from 'next/font/google'
import {Analytics} from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import CookieNotice from '@/components/CookieNotice'
import {supabaseServer} from '@/lib/supabase/server'
const display=Barlow_Condensed({subsets:['latin'],weight:['600','700','800'],variable:'--font-display'})
const body=Inter({subsets:['latin'],variable:'--font-body'})
const site=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'
export const metadata={metadataBase:new URL(site),title:{default:'Esports Africa',template:'%s'},description:'Competitive gaming tournaments across Africa. Register, follow live brackets and get tickets.',
  openGraph:{title:'Esports Africa',description:'Competitive gaming tournaments across Africa.',url:site,siteName:'Esports Africa',images:['/poster.jpg'],type:'website'},twitter:{card:'summary_large_image'}}
export default async function RootLayout({children}){
  let user=null,role=null
  if(process.env.NEXT_PUBLIC_SUPABASE_URL){const sb=supabaseServer();const {data}=await sb.auth.getUser();user=data.user;if(user){const {data:p}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();role=p?.role}}
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent focus:p-2 focus:text-black">Skip to content</a><Navbar user={!!user} role={role}/><main id="main">{children}</main>
    <footer className="wrap mt-10 flex flex-wrap items-start justify-between gap-6 border-t border-line py-9 text-sm text-muted"><div><b className="font-display text-lg uppercase text-white">Esports Africa</b><p>info@esportsafrica.org · esportsafrica.org</p><p>© {new Date().getFullYear()} Esports Africa</p></div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">{[['/about','About'],['/faq','FAQ'],['/contact','Contact'],['/legal/terms','Terms'],['/legal/privacy','Privacy'],['/legal/refunds','Refunds'],['/legal/cookies','Cookies']].map(([h,t])=><Link key={h} href={h} className="hover:text-white">{t}</Link>)}</nav></footer>
    <CookieNotice/><Analytics/></body></html>
}
