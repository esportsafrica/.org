'use client'
import {useState} from 'react'
import {useRouter,useSearchParams} from 'next/navigation'
import {supabaseBrowser} from '@/lib/supabase/client'
import {Suspense} from 'react'

function Form(){
  const router = useRouter()
  const q = useSearchParams()
  const [method, setMethod] = useState('magic') // 'magic' | 'password'
  const [err, setErr] = useState(q.get('denied') ? 'This account is not an admin.' : '')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const cb = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/admin`

  async function signInWithGoogle(){
    setBusy(true)
    setErr('')
    setInfo('')
    const {error} = await supabaseBrowser().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: cb,
        queryParams: {prompt: 'select_account'}
      }
    })
    if(error){
      setErr(error.message)
      setBusy(false)
    }
  }

  async function go(e){
    e.preventDefault()
    setBusy(true)
    setErr('')
    setInfo('')
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email')||'').trim()
    const password = f.get('password')
    const sb = supabaseBrowser()

    try{
      if(method === 'magic'){
        const {error} = await sb.auth.signInWithOtp({
          email,
          options: {emailRedirectTo: cb}
        })
        if(error) throw error
        setInfo(`Admin magic link sent to ${email}. Click the link in your email to sign in to the Admin Panel.`)
      } else {
        const {error} = await sb.auth.signInWithPassword({email, password})
        if(error) throw error
        router.push('/admin')
        router.refresh()
      }
    }catch(x){
      setErr(x.message || 'Login failed')
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="panel w-full max-w-sm space-y-4">
      <h1 className="text-4xl">Admin <span className="text-accent">Login</span></h1>
      <p className="text-xs text-neutral-400">Authorized personnel only (e.g. info@esportsafrica.org).</p>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-sm border border-line bg-surface py-2.5 font-display text-sm font-bold tracking-wider text-white transition-colors duration-150 hover:border-neutral-400 hover:bg-[#1f1f1f]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line"/></div>
        <span className="relative bg-surface px-2 text-[11px] uppercase tracking-wider text-muted">Or email</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={()=>setMethod('magic')}
          className={`flex-1 rounded-sm border py-1.5 text-xs font-bold uppercase tracking-wider ${method==='magic'?'border-accent bg-accent text-black':'border-line text-neutral-400'}`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={()=>setMethod('password')}
          className={`flex-1 rounded-sm border py-1.5 text-xs font-bold uppercase tracking-wider ${method==='password'?'border-accent bg-accent text-black':'border-line text-neutral-400'}`}
        >
          Password
        </button>
      </div>

      <form onSubmit={go} className="space-y-4">
        <div>
          <label className="lbl">Admin Email</label>
          <input name="email" type="email" required defaultValue="info@esportsafrica.org" className="input"/>
        </div>

        {method === 'password' && (
          <div>
            <label className="lbl">Password</label>
            <input name="password" type="password" required className="input"/>
          </div>
        )}

        {err && <p role="alert" className="text-sm text-live">{err}</p>}
        {info && <p role="status" className="rounded-sm border border-win bg-win/10 p-2 text-xs text-win">{info}</p>}

        <button className="btn w-full" disabled={busy}>
          {busy ? 'Processing…' : method === 'magic' ? 'Send Admin Magic Link' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default function Login(){
  return (
    <div className="grid min-h-[70vh] place-items-center p-5">
      <Suspense><Form/></Suspense>
    </div>
  )
}
