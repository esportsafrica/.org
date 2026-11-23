'use client'
import {useEffect} from 'react'
export default function Error({error,reset}){
  useEffect(()=>{console.error(error)},[error]) // wire Sentry here (Sentry.captureException) if you add it
  return <div className="wrap py-24"><div className="tag">Something broke</div><h1 className="my-3 text-[clamp(44px,8vw,88px)] font-extrabold">Technical <span className="text-accent">foul</span></h1><p className="mb-6 text-neutral-400">Please try again. If it keeps happening, contact info@esportsafrica.org.</p><button onClick={reset} className="btn">Try again</button></div>
}
