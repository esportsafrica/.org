'use client'
import {useState} from 'react'
import {useRouter,useSearchParams} from 'next/navigation'
import {supabaseBrowser} from '@/lib/supabase/client'
import {Suspense} from 'react'
function Form(){
  const r=useRouter(),q=useSearchParams(),[err,setErr]=useState(q.get('denied')?'This account is not an admin.':''),[busy,setBusy]=useState(false)
  async function go(e){e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget)
    const {error}=await supabaseBrowser().auth.signInWithPassword({email:f.get('email'),password:f.get('password')});setBusy(false)
    if(error)return setErr(error.message);r.push('/admin');r.refresh()}
  return <form onSubmit={go} className="panel w-full max-w-sm space-y-4"><h1 className="text-4xl">Admin <span className="text-accent">login</span></h1>
    <div><label className="lbl">Email</label><input name="email" type="email" required className="input"/></div><div><label className="lbl">Password</label><input name="password" type="password" required className="input"/></div>
    {err&&<p role="alert" className="text-sm text-live">{err}</p>}<button className="btn w-full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>
}
export default function Login(){return <div className="grid min-h-[70vh] place-items-center p-5"><Suspense><Form/></Suspense></div>}
