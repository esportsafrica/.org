'use client'
import {useRef, useState, useEffect} from 'react'
import useFocusTrap from './useFocusTrap'
import {kes} from '@/lib/format'
import gsap from 'gsap'

export default function TicketShop({tiers, user}){
  const [cart, setCart] = useState({})
  const [open, setOpen] = useState(false)
  const [promo, setPromo] = useState('')
  const [pct, setPct] = useState(0)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  const lines = tiers.filter(t => cart[t.id])
  const count = lines.reduce((a, t) => a + cart[t.id], 0)
  const sub = lines.reduce((a, t) => a + t.price_kes * cart[t.id], 0)
  const disc = Math.round(sub * pct / 100)
  const total = sub - disc
  const left = t => t.capacity - t.sold

  const asideRef = useRef(null)
  const cartBtnRef = useRef(null)
  const backdropRef = useRef(null)
  const prevCountRef = useRef(0)

  useFocusTrap(asideRef, open, () => setOpen(false))

  // Apple Design: Spring-driven cart drawer (critically damped, spatial symmetry)
  useEffect(()=>{
    const aside = asideRef.current
    const backdrop = backdropRef.current
    if(!aside) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', ()=>{
      if(open){
        gsap.to(aside, {x: '0%', duration: 0.35, ease: 'power3.out', overwrite: 'auto'})
        if(backdrop) gsap.to(backdrop, {opacity: 1, duration: 0.2, overwrite: 'auto'})
      } else {
        gsap.to(aside, {x: '100%', duration: 0.28, ease: 'power2.in', overwrite: 'auto'})
        if(backdrop) gsap.to(backdrop, {opacity: 0, duration: 0.2, overwrite: 'auto'})
      }
    })
    mm.add('(prefers-reduced-motion: reduce)', ()=>{
      if(open){
        gsap.to(aside, {opacity: 1, duration: 0.15, overwrite: 'auto'})
        if(backdrop) gsap.to(backdrop, {opacity: 1, duration: 0.1, overwrite: 'auto'})
      } else {
        gsap.to(aside, {opacity: 0, duration: 0.12, overwrite: 'auto'})
        if(backdrop) gsap.to(backdrop, {opacity: 0, duration: 0.1, overwrite: 'auto'})
      }
    })
    return ()=>mm.revert()
  }, [open])

  // Apple Design: Spring appearance for floating cart pill when items added
  useEffect(()=>{
    if(count > 0 && prevCountRef.current === 0 && cartBtnRef.current){
      gsap.fromTo(cartBtnRef.current,
        {scale: 0.75, opacity: 0},
        {scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(1.5)'}
      )
    }
    prevCountRef.current = count
  }, [count])

  const set = (t, d) => setCart(c => {
    const q = Math.max(0, Math.min(10, left(t), (c[t.id] || 0) + d))
    const n = {...c}
    q ? n[t.id] = q : delete n[t.id]
    return n
  })

  async function applyPromo(){
    setMsg('')
    const r = await fetch('/api/promo', {method: 'POST', body: JSON.stringify({code: promo})})
    const j = await r.json()
    setPct(j.percent || 0)
    setMsg(j.percent ? `${j.percent}% off applied` : 'Invalid code')
  }

  async function checkout(e){
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const f = Object.fromEntries(new FormData(e.currentTarget))
    const r = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({...f, promo: pct ? promo : '', items: lines.map(t => ({tier_id: t.id, qty: cart[t.id]}))})
    })
    const j = await r.json()
    setBusy(false)
    if(!r.ok) return setMsg(j.error || 'Checkout failed')
    if(j.url) location.href = j.url
    else setDone(j)
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map(t => (
          <div key={t.id} className="panel flex flex-col">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
              {t.tournaments?.name}
            </span>
            <h3 className="my-2 text-3xl">{t.name}</h3>
            <p className="font-display text-4xl font-extrabold">{kes(t.price_kes)}</p>
            <ul className="my-4 flex-1 space-y-1.5 text-sm text-neutral-400">
              {t.perks.map(p => <li key={p}>✓ {p}</li>)}
            </ul>
            <p className="mb-3 text-xs text-muted">{left(t) > 0 ? `${left(t)} left` : 'Sold out'}</p>
            {cart[t.id] ? (
              <div className="flex items-center justify-between">
                <button aria-label="Fewer" className="btn btn-ghost btn-sm" onClick={() => set(t, -1)}>−</button>
                <b className="font-display text-2xl">{cart[t.id]}</b>
                <button aria-label="More" className="btn btn-ghost btn-sm" onClick={() => set(t, 1)}>+</button>
              </div>
            ) : (
              <button className="btn" disabled={left(t) <= 0} onClick={() => { set(t, 1); setOpen(true) }}>
                Add to cart
              </button>
            )}
          </div>
        ))}
      </div>

      {!tiers.length && <p className="text-muted">Tickets are not on sale yet.</p>}

      {count > 0 && (
        <button
          ref={cartBtnRef}
          onClick={() => setOpen(true)}
          className="btn fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-6 z-20 shadow-2xl text-xs sm:text-sm py-2 px-4 sm:py-3 sm:px-6"
        >
          Cart · {count} · {kes(total)}
        </button>
      )}

      {/* Dimming Scrim Backdrop */}
      <div
        ref={backdropRef}
        onClick={() => setOpen(false)}
        style={{opacity: 0}}
        className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-xs ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      />

      {/* Translucent Sheet Drawer */}
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        aria-hidden={!open}
        inert={!open ? '' : undefined}
        style={{transform: 'translateX(100%)'}}
        className="fixed right-0 top-0 z-40 flex h-full w-full max-w-full sm:max-w-md flex-col border-l border-line glass p-4 sm:p-6 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-3xl">Your cart</h3>
          <button aria-label="Close" onClick={() => setOpen(false)} className="text-2xl text-muted hover:text-white">×</button>
        </div>

        {done ? (
          <div>
            <p className="mb-2 text-neutral-300">Order <b>{done.reference}</b> created ({kes(done.total)}).</p>
            <p className="text-sm text-muted">{done.note}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {lines.map(t => (
                <div key={t.id} className="row">
                  <span>{t.name} × {cart[t.id]}</span>
                  <b>{kes(t.price_kes * cart[t.id])}</b>
                </div>
              ))}
              {!lines.length && <p className="text-muted">Your cart is empty.</p>}
            </div>

            <div className="my-3 flex gap-2">
              <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Promo code" className="input"/>
              <button type="button" onClick={applyPromo} className="btn btn-ghost btn-sm">Apply</button>
            </div>

            <div className="mb-3 space-y-1 text-sm">
              <div className="row">Subtotal<b>{kes(sub)}</b></div>
              {disc > 0 && <div className="row">Discount<b>−{kes(disc)}</b></div>}
              <div className="row">Total<b className="text-lg text-accent">{kes(total)}</b></div>
            </div>

            {!user ? (
              <a href="/login?next=/tickets" className="btn w-full">Sign in to checkout</a>
            ) : (
              <form onSubmit={checkout} className="space-y-2.5">
                <input name="name" required placeholder="Full name" className="input"/>
                <input name="email" type="email" required placeholder="Email" className="input"/>
                <input name="phone" placeholder="Phone (M-Pesa)" className="input"/>
                <select name="method" className="input">
                  <option value="card">Card</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
                <button className="btn w-full" disabled={busy || !lines.length}>
                  {busy ? 'Processing…' : `Pay ${kes(total)}`}
                </button>
              </form>
            )}
            <p className="mt-2 text-[11px] text-muted">Secure payment by Paystack (cards &amp; M-Pesa).</p>
          </>
        )}
        {msg && <p role="status" className="mt-2 text-sm text-accent">{msg}</p>}
      </aside>
    </>
  )
}
