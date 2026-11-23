'use client'
import {useState} from 'react'
import Link from 'next/link'
import {acceptTeamInvite} from '@/app/account/actions'

const ageOf=d=>d?Math.floor((Date.now()-new Date(d))/31557600000):null

export default function JoinTeamForm({token,teamName,tournamentName,defaultGamertag='',userEmail}){
  const [dob,setDob]=useState('')
  const [busy,setBusy]=useState(false)
  const minor=ageOf(dob)!==null&&ageOf(dob)<18

  return (
    <form action={acceptTeamInvite} onSubmit={()=>setBusy(true)} className="space-y-4">
      <input type="hidden" name="token" value={token}/>
      
      <div>
        <label className="lbl" htmlFor="jt-gt">Your Gamertag</label>
        <input id="jt-gt" name="gamertag" required defaultValue={defaultGamertag} placeholder="e.g. ShadowStriker" className="input"/>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="lbl">Signed in as</label>
          <input disabled value={userEmail} className="input opacity-60"/>
        </div>
        <div>
          <label className="lbl" htmlFor="jt-dob">Date of Birth</label>
          <input id="jt-dob" type="date" name="dob" required max={new Date().toISOString().slice(0,10)} value={dob} onChange={e=>setDob(e.target.value)} className="input"/>
        </div>
      </div>

      {minor&&<div className="space-y-3 border border-accent p-3">
        <p className="text-sm text-accent">Players under 18 require parental or guardian consent to participate.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="guardian_name" required placeholder="Guardian full name" aria-label="Guardian full name" className="input"/>
          <input name="guardian_phone" required placeholder="Guardian phone number" aria-label="Guardian phone" className="input"/>
        </div>
      </div>}

      <label className="flex items-start gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="terms" required className="mt-1"/>
        <span>I agree to the tournament rules, <Link href="/legal/terms" target="_blank" className="text-accent underline">Terms</Link> and <Link href="/legal/privacy" target="_blank" className="text-accent underline">Privacy Policy</Link>{minor&&', and confirm my guardian consents'}.</span>
      </label>

      <button type="submit" disabled={busy} className="btn w-full">
        {busy?'Joining roster…':`Join ${teamName}`}
      </button>
    </form>
  )
}
