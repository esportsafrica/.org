'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
export default function CookieNotice(){
  const [show,setShow]=useState(false)
  useEffect(()=>{try{if(!localStorage.getItem('ea-notice'))setShow(true)}catch{}},[])
  if(!show)return null
  return <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-4 border border-line bg-surface p-4 text-sm shadow-lg">
    <p className="text-neutral-300">We only use essential cookies (to keep you signed in) and privacy-friendly analytics. <Link href="/legal/privacy" className="text-accent underline">Privacy policy</Link></p>
    <button className="btn btn-sm shrink-0" onClick={()=>{try{localStorage.setItem('ea-notice','1')}catch{};setShow(false)}}>OK</button></div>
}
