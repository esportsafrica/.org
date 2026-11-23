'use client'
import {useEffect,useRef} from 'react'
/** animation-on-scroll skill: IntersectionObserver adds .animate once (once=true). */
export default function Reveal({as:Tag='div',delay=0,className='',children,...p}){
  const ref=useRef(null)
  useEffect(()=>{const el=ref.current
    const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add('animate');io.disconnect()}},{threshold:.15,rootMargin:'0px 0px -8% 0px'})
    io.observe(el);return()=>io.disconnect()},[])
  return <Tag ref={ref} className={`aos ${className}`} style={{'--d':`${Math.min(delay,300)+100}ms`}} {...p}>{children}</Tag>
}
