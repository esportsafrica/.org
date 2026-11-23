import Link from 'next/link'
export const metadata={title:'About · Esports Africa'}
export default function About(){
  return <div className="wrap max-w-3xl py-12"><div className="tag">About us</div><h1 className="my-3 text-[clamp(44px,8vw,88px)] font-extrabold">Africa’s <span className="text-accent">arena</span></h1>
    <p className="mb-4 text-neutral-300">Esports Africa runs competitive gaming tournaments across the continent, from LAN events to online cups, and gives players, teams and fans one home to register, compete, follow results and get tickets.</p>
    <p className="mb-8 text-neutral-300">Our mission is simple: real pathways for African talent, run professionally and fairly. [Add your story, team and partners here.]</p>
    <div className="flex gap-3"><Link href="/tournaments" className="btn">See tournaments</Link><Link href="/contact" className="btn btn-ghost">Partner with us</Link></div></div>
}
