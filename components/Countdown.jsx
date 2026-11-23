'use client'
import {useEffect,useState} from 'react'
export default function Countdown({to}){
  const [left,setLeft]=useState(null)
  useEffect(()=>{const t=()=>setLeft(Math.max(0,(new Date(to)-Date.now())/1000));t();const id=setInterval(t,1000);return()=>clearInterval(id)},[to])
  let d=left??0
  return <div className="my-7 flex gap-2.5" aria-label="Countdown to tip-off">{[['Days',86400],['Hrs',3600],['Min',60],['Sec',1]].map(([l,s])=>{const v=Math.floor(d/s);d-=v*s
    return <div key={l} className="min-w-[68px] border border-dashed border-neutral-600 px-3 py-2 text-center"><b className="block font-display text-4xl font-extrabold tabular-nums">{String(v).padStart(2,'0')}</b><small className="text-[11px] uppercase tracking-widest text-muted">{l}</small></div>})}</div>
}
