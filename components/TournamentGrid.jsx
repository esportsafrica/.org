'use client'
import {useState} from 'react'
import FeaturedTournament from './FeaturedTournament'
export default function TournamentGrid({items}){
  const games=['All',...new Set(items.map(t=>t.game))]
  const [g,setG]=useState('All')
  const list=items.filter(t=>g==='All'||t.game===g)
  return <>
    {games.length>2&&<div className="mb-6 flex flex-wrap gap-2">{games.map(x=><button key={x} onClick={()=>setG(x)} className={`rounded-sm border px-3.5 py-1.5 font-display text-sm font-bold uppercase tracking-wider transition-[transform,background-color,color,border-color] duration-[160ms] ease-out active:scale-[.97] ${g===x?'border-accent bg-accent text-black':'border-line text-neutral-300 hover:border-accent'}`}>{x}</button>)}</div>}
    <div className="grid gap-5">{list.map((t,i)=><FeaturedTournament key={t.id} t={t} priority={i===0}/>)}</div>
    {!list.length&&<p className="text-muted">No tournaments published yet.</p>}
  </>
}
