'use client'
import {useState} from 'react'
import {Input} from '@/components/ui/input'
import {Alert, AlertTitle, AlertDescription} from '@/components/ui/alert'

export default function ContactForm(){
  const [s, setS] = useState('')
  const [bad, setBad] = useState(false)
  const [busy, setBusy] = useState(false)

  async function go(e){
    e.preventDefault()
    setBusy(true)
    const f = e.currentTarget
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(f))),
      })
      const j = await r.json()
      setBad(!r.ok)
      setS(r.ok ? 'Thanks! We will get back to you soon.' : j.error || 'Failed to send message.')
      if (r.ok) f.reset()
    } catch {
      setBad(true)
      setS('Failed to submit message. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={go} className="panel max-w-xl space-y-4">
      <div>
        <label className="lbl" htmlFor="n">Your Name</label>
        <Input id="n" name="name" placeholder="Full name or gamertag" required />
      </div>

      <div>
        <label className="lbl" htmlFor="e">Email Address</label>
        <Input id="e" name="email" type="email" placeholder="contact@example.com" required />
      </div>

      <div>
        <label className="lbl" htmlFor="m">Message</label>
        <textarea
          id="m"
          name="body"
          required
          rows={5}
          placeholder="How can we help you?"
          className="w-full rounded-sm border border-line bg-bg px-3 py-2 text-[16px] sm:text-sm text-foreground outline-none transition-colors duration-150 ease-out focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <button className="btn w-full sm:w-auto" disabled={busy}>
        {busy ? 'Sending…' : 'Send Message'}
      </button>

      {s && (
        <Alert variant={bad ? 'destructive' : 'success'}>
          <AlertTitle>{bad ? 'Error' : 'Message Sent'}</AlertTitle>
          <AlertDescription>{s}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}
