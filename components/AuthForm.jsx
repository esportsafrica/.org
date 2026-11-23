'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter,useSearchParams} from 'next/navigation'
import {supabaseBrowser} from '@/lib/supabase/client'

const safe=n=>n&&n.startsWith('/')&&!n.startsWith('//')?n:'/account'

export default function AuthForm({mode='login'}){
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safe(searchParams.get('next'))
  
  const [method, setMethod] = useState('magic') // 'magic' | 'password'
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [tok, setTok] = useState('')
  
  const turnstileSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(()=>{
    if(!turnstileSite) return
    window.__ts = setTok
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    s.async = true
    document.body.appendChild(s)
    return () => s.remove()
  },[turnstileSite])

  const getCallbackUrl = () => {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
  }

  // Google OAuth Sign In
  async function signInWithGoogle(){
    setBusy(true)
    setErr('')
    setInfo('')
    const sb = supabaseBrowser()
    const {error} = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getCallbackUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if(error){
      setErr(error.message)
      setBusy(false)
    }
  }

  // Form submit for Magic Link or Password
  async function handleSubmit(e){
    e.preventDefault()
    setBusy(true)
    setErr('')
    setInfo('')
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email')||'').trim()
    const password = f.get('password')
    const fullName = f.get('full_name')
    const sb = supabaseBrowser()
    const cb = getCallbackUrl()

    try{
      if(method === 'magic'){
        // Passwordless Magic Link (no codes needed)
        const {error} = await sb.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: cb,
            captchaToken: tok || undefined,
            data: fullName ? {full_name: fullName} : undefined
          }
        })
        if(error) throw error
        setInfo(`We've sent a magic link to ${email}. Click the link in your email to sign in instantly (no code or password needed).`)
      } else {
        // Password method
        if(mode === 'login'){
          const {error} = await sb.auth.signInWithPassword({
            email,
            password,
            options: {captchaToken: tok || undefined}
          })
          if(error) throw error
          router.push(next)
          router.refresh()
        } else if(mode === 'signup'){
          const {data, error} = await sb.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: cb,
              captchaToken: tok || undefined,
              data: {full_name: fullName}
            }
          })
          if(error) throw error
          if(data.session){
            router.push(next)
            router.refresh()
          } else {
            setInfo(`Account created! We've sent a sign-in link to ${email}. Click it to verify and access your account.`)
          }
        }
      }
    }catch(x){
      setErr(x.message || 'Authentication failed. Please try again.')
    }finally{
      setBusy(false)
    }
  }

  // Password reset request
  async function handleReset(e){
    e.preventDefault()
    setBusy(true)
    setErr('')
    setInfo('')
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email')||'').trim()
    const sb = supabaseBrowser()
    const cb = `${window.location.origin}/auth/callback?next=/account/profile`

    const {error} = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: cb,
      captchaToken: tok || undefined
    })
    setBusy(false)
    if(error){
      setErr(error.message)
    } else {
      setInfo('If an account exists with that email, a password reset link has been sent.')
    }
  }

  if(mode === 'forgot'){
    return (
      <form onSubmit={handleReset} className="panel w-full max-w-sm space-y-4">
        <h1 className="text-4xl">Reset <span className="text-accent">Password</span></h1>
        <p className="text-xs text-muted">We will send a password reset link directly to your email.</p>
        <div>
          <label className="lbl">Email</label>
          <input name="email" type="email" required className="input" autoComplete="email"/>
        </div>
        {err && <p role="alert" className="text-sm text-live">{err}</p>}
        {info && <p role="status" className="text-sm text-win">{info}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
        <div className="text-center text-sm">
          <Link href={`/login?next=${next}`} className="text-muted hover:text-white">Back to Sign in</Link>
        </div>
      </form>
    )
  }

  const title = mode === 'signup' ? 'Create Account' : 'Sign In'

  return (
    <div className="panel w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="mt-1 text-xs text-neutral-400">
          Sign in to manage tournament entries, rosters, and tickets.
        </p>
      </div>

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
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line"/></div>
        <span className="relative bg-surface px-2 text-[11px] uppercase tracking-wider text-muted">Or with email</span>
      </div>

      {/* Method Tabs: Magic Link vs Password */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={()=>setMethod('magic')}
          className={`flex-1 rounded-sm border py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${method==='magic'?'border-accent bg-accent text-black':'border-line text-neutral-400'}`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={()=>setMethod('password')}
          className={`flex-1 rounded-sm border py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${method==='password'?'border-accent bg-accent text-black':'border-line text-neutral-400'}`}
        >
          Password
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="lbl">Full Name</label>
            <input name="full_name" required className="input" autoComplete="name" placeholder="John Doe"/>
          </div>
        )}

        <div>
          <label className="lbl">Email Address</label>
          <input name="email" type="email" required className="input" autoComplete="email" placeholder="you@example.com"/>
        </div>

        {method === 'password' && (
          <div>
            <div className="flex justify-between items-center">
              <label className="lbl">Password</label>
              {mode === 'login' && (
                <Link href="/forgot-password" className="text-xs text-muted hover:text-white">Forgot?</Link>
              )}
            </div>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="input"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
        )}

        {method === 'magic' && (
          <p className="text-xs text-muted">
            We will email you a passwordless sign-in link. No password or verification codes needed.
          </p>
        )}

        {turnstileSite && <div className="cf-turnstile" data-sitekey={turnstileSite} data-callback="__ts"/>}

        {err && <p role="alert" className="text-sm text-live">{err}</p>}
        {info && (
          <div role="status" className="rounded-sm border border-win bg-win/10 p-3 text-xs leading-relaxed text-win">
            {info}
          </div>
        )}

        <button className="btn w-full" disabled={busy}>
          {busy ? 'Please wait…' : method === 'magic' ? 'Send Magic Link' : title}
        </button>

        <div className="flex justify-between text-xs text-muted pt-1">
          {mode === 'login' ? (
            <>
              <span>Don't have an account?</span>
              <Link href={`/signup?next=${next}`} className="text-accent underline">Create account</Link>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <Link href={`/login?next=${next}`} className="text-accent underline">Sign in</Link>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
