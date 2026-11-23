'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter,useSearchParams} from 'next/navigation'
import {supabaseBrowser} from '@/lib/supabase/client'
const safe=n=>n&&n.startsWith('/')&&!n.startsWith('//')?n:'/account'
export default function AuthForm({mode}){
  const r=useRouter(),next=safe(useSearchParams().get('next')),[err,setErr]=useState(''),[info,setInfo]=useState(''),[busy,setBusy]=useState(false),[tok,setTok]=useState(''),site=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  // Optional Cloudflare Turnstile (enable CAPTCHA protection in Supabase Auth too)
  useEffect(()=>{if(!site)return;window.__ts=setTok;const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js';s.async=true;document.body.appendChild(s);return()=>s.remove()},[site])
  async function go(e){
    e.preventDefault();setBusy(true);setErr('');setInfo('');const f=new FormData(e.currentTarget),sb=supabaseBrowser(),cb=`${location.origin}/auth/callback?next=`
    let error
    if(mode==='login'){({error}=await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('password'),options:{captchaToken:tok||undefined}}));if(!error){r.push(next);r.refresh()}}
    if(mode==='signup'){const x=await sb.auth.signUp({email:f.get('email'),password:f.get('password'),options:{captchaToken:tok||undefined,data:{full_name:f.get('full_name')},emailRedirectTo:cb+encodeURIComponent(next)}});error=x.error
      if(!error){if(x.data.session){r.push(next);r.refresh()}else setInfo('Check your email to confirm your account, then sign in.')}}
    if(mode==='forgot'){({error}=await sb.auth.resetPasswordForEmail(f.get('email'),{redirectTo:cb+'/account/profile',captchaToken:tok||undefined}));if(!error)setInfo('If that email exists, a reset link is on its way.')}
    if(error)setErr(error.message);setBusy(false)
  }
  const T={login:'Sign in',signup:'Create account',forgot:'Reset password'}[mode]
  return <form onSubmit={go} className="panel w-full max-w-sm space-y-4"><h1 className="text-4xl">{T}</h1>
    {mode==='signup'&&<div><label className="lbl">Full name</label><input name="full_name" required className="input" autoComplete="name"/></div>}
    <div><label className="lbl">Email</label><input name="email" type="email" required className="input" autoComplete="email"/></div>
    {mode!=='forgot'&&<div><label className="lbl">Password</label><input name="password" type="password" required minLength={8} className="input" autoComplete={mode==='login'?'current-password':'new-password'}/></div>}
    {site&&<div className="cf-turnstile" data-sitekey={site} data-callback="__ts"/>}
    {err&&<p role="alert" className="text-sm text-live">{err}</p>}{info&&<p role="status" className="text-sm text-win">{info}</p>}
    <button className="btn w-full" disabled={busy}>{busy?'Please wait…':T}</button>
    <div className="flex justify-between text-sm text-muted">{mode==='login'?<><Link href={`/signup?next=${next}`} className="hover:text-white">Create account</Link><Link href="/forgot-password" className="hover:text-white">Forgot password?</Link></>:<Link href={`/login?next=${next}`} className="hover:text-white">Back to sign in</Link>}</div></form>
}
