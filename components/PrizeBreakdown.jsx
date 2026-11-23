'use client'
import {useState} from 'react'
import {money} from '@/lib/format'
export default function PrizeBreakdown({pool,tiers}){
  const [cur,setCur]=useState('KES')
  return <div><div className="mb-4 flex flex-wrap gap-2">{['KES','USD','NGN','ZAR'].map(c=><button key={c} onClick={()=>setCur(c)} className={`rounded-sm border px-3 py-1 font-display text-sm font-bold uppercase tracking-wider transition-[transform,background-color,color,border-color] duration-[160ms] ease-out active:scale-[.97] ${cur===c?'border-accent bg-accent text-black':'border-line text-neutral-300'}`}>{c}</button>)}</div>
    <div className="space-y-3">{tiers.map(t=><div key={t.label}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{t.label}</span><span className="font-display text-lg font-bold text-accent">{money(pool*t.pct/100,cur)}</span></div>
      <div className="h-1.5 bg-line"><div className="h-full bg-accent" style={{width:`${t.pct}%`}}/></div></div>)}</div>
    <p className="mt-3 text-xs text-muted">Totals shown at approximate exchange rates. Payouts are settled in KES.</p></div>
}
