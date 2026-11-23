'use client'
import {useRef,useState} from 'react'
import Link from 'next/link'
import {supabaseBrowser} from '@/lib/supabase/client'
import {kes} from '@/lib/format'
import useFocusTrap from './useFocusTrap'

const COUNTRIES=['Kenya','Nigeria','South Africa','Egypt','Morocco','Ghana','Tanzania','Uganda','Rwanda','Ethiopia','Senegal','Other']
const ageOf=d=>d?Math.floor((Date.now()-new Date(d))/31557600000):null

export default function RegisterModal({t,userId,defaults={}}){
  const allowedFormat = t.entry_type || 'solo'
  const initialType = allowedFormat === 'team' ? 'team' : 'solo'
  const [open,setOpen]=useState(false)
  const [type,setType]=useState(initialType)
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')
  const [doneData,setDoneData]=useState(null)
  const [dob,setDob]=useState('')
  const [copied,setCopied]=useState(false)

  const ref=useRef(null)
  useFocusTrap(ref,open,()=>setOpen(false))

  const closed=t.status!=='open'
  const minor=ageOf(dob)!==null&&ageOf(dob)<18

  async function submit(e){
    e.preventDefault()
    setBusy(true)
    setErr('')
    const f=new FormData(e.currentTarget)
    const sb=supabaseBrowser()
    let logo_url=null

    try{
      const file=f.get('logo')
      if(file&&file.size){
        if(file.size>2e6)throw new Error('Logo must be under 2 MB')
        const path=`${userId}/${t.slug}-${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g,'_')}`
        const up=await sb.storage.from('logos').upload(path,file)
        if(up.error)throw new Error('Logo upload failed. Use a PNG, JPG or WebP under 2 MB.')
        logo_url=sb.storage.from('logos').getPublicUrl(path).data.publicUrl
      }

      const gamertag=String(f.get('gamertag')).trim()
      if(!gamertag)throw new Error('Please provide your gamertag.')

      const teamName=type==='team'?String(f.get('team_name')).trim():null
      if(type==='team'&&!teamName)throw new Error('Please enter your team name.')

      // Insert registration
      const {data:reg,error:regError}=await sb.from('registrations').insert({
        tournament_id:t.id,
        user_id:userId,
        type,
        team_name:teamName,
        country:f.get('country'),
        gamertags:[gamertag],
        discord:f.get('discord')||null,
        contact_email:f.get('email'),
        logo_url,
        dob:f.get('dob'),
        guardian_name:minor?f.get('guardian_name'):null,
        guardian_phone:minor?f.get('guardian_phone'):null,
        accepted_terms:f.get('terms')==='on',
        ready:type==='solo'
      }).select('id').single()

      if(regError){
        throw new Error(
          regError.code==='23505'?'You’re already registered for this tournament.'
          :regError.message.includes('full')?'Sorry, this tournament is full.'
          :regError.code==='42501'?'Registration is closed, or the form is incomplete.'
          :regError.message
        )
      }

      let inviteUrl = null

      // If team, register captain into registration_members
      if(type==='team'){
        const captainToken='cap_'+crypto.randomUUID().replace(/-/g,'')
        await sb.from('registration_members').insert({
          registration_id:reg.id,
          user_id:userId,
          role:'captain',
          status:'accepted',
          gamertag,
          invite_token:captainToken,
          dob:f.get('dob'),
          guardian_name:minor?f.get('guardian_name'):null,
          guardian_phone:minor?f.get('guardian_phone'):null,
          accepted_terms:true,
          joined_at:new Date().toISOString()
        })

        // Also pre-create first invite token for shareable link
        const invToken='inv_'+crypto.randomUUID().replace(/-/g,'')
        await sb.from('registration_members').insert({
          registration_id:reg.id,
          role:'starter',
          status:'invited',
          invite_token:invToken
        })
        inviteUrl=`${window.location.origin}/join/${invToken}`
      }

      fetch('/api/notify-registration',{method:'POST',body:JSON.stringify({tournament_id:t.id})}).catch(()=>{})
      setDoneData({type,teamName,inviteUrl,regId:reg.id})
    }catch(x){
      setErr(x.message||'Something went wrong')
    }finally{
      setBusy(false)
    }
  }

  function copyInvite(){
    if(!doneData?.inviteUrl)return
    navigator.clipboard.writeText(doneData.inviteUrl)
    setCopied(true)
    setTimeout(()=>setCopied(false),2500)
  }

  if(!userId)return <Link href={`/login?next=/tournaments/${t.slug}`} className="btn">Sign in to register</Link>

  return <>
    <button className="btn" disabled={closed} onClick={()=>{setOpen(true);setDoneData(null)}}>
      {closed?'Registration closed':`Register · ${kes(t.entry_fee_kes)}`}
    </button>
    {open&&<div className="fixed inset-0 z-40 grid place-items-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" onClick={()=>setOpen(false)}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="reg-title" className="modal-in max-h-[92vh] w-full max-w-lg overflow-y-auto border border-line bg-surface p-4 sm:p-6 my-auto" onClick={e=>e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 id="reg-title" className="text-3xl">{doneData?'Registration Received':'Register'}</h3>
          <button aria-label="Close" onClick={()=>setOpen(false)} className="text-2xl leading-none text-muted">×</button>
        </div>

        {doneData ? (
          <div className="space-y-4">
            {doneData.type==='team' ? (
              <>
                <p className="text-neutral-300">
                  Team <b>{doneData.teamName}</b> registered! You are confirmed as the <b>Captain</b>.
                </p>
                <div className="border border-line bg-black/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">Roster Requirements</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    This event requires <b>{t.min_roster_size}</b> to <b>{t.max_roster_size}</b> players. Share your invite link below with your teammates:
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input readOnly value={doneData.inviteUrl||''} className="input truncate text-xs"/>
                    <button type="button" onClick={copyInvite} className="btn btn-sm shrink-0">
                      {copied?'Copied ✓':'Copy Link'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  You can manage your roster, invite more players, and track approval in your dashboard.
                </p>
              </>
            ) : (
              <p className="text-neutral-300">
                Solo entry received for <b>{t.name}</b>. Track it in your account. Once the organisers approve it you can pay the {kes(t.entry_fee_kes)} entry fee there (within 72 hours of approval).
              </p>
            )}
            <div className="pt-2">
              <Link href="/account/registrations" className="btn w-full text-center">
                Go to My Registrations
              </Link>
            </div>
          </div>
        ) : (
        <form onSubmit={submit} className="space-y-4">
          {/* Format selection if tournament allows both */}
          {allowedFormat==='both' ? (
            <div className="flex gap-2">
              {['solo','team'].map(x=>(
                <button
                  type="button"
                  key={x}
                  onClick={()=>setType(x)}
                  aria-pressed={type===x}
                  className={`flex-1 rounded-sm border py-2 font-display font-bold uppercase tracking-wider transition-colors duration-150 ${type===x?'border-accent bg-accent text-black':'border-line'}`}
                >
                  {x==='solo'?'Solo player':'Team'}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-line bg-black/30 px-3 py-2 text-xs uppercase tracking-wider text-muted">
              Format: <b className="text-white">{allowedFormat==='team'?`Team (${t.min_roster_size}-${t.max_roster_size} players)`:'Solo (1v1)'}</b>
            </div>
          )}

          {type==='team' && (
            <div>
              <label className="lbl" htmlFor="tn">Team Name</label>
              <input id="tn" name="team_name" required placeholder="e.g. Apex Predators" className="input"/>
            </div>
          )}

          <div>
            <label className="lbl" htmlFor="gt">{type==='team'?'Captain Gamertag':'Your Gamertag'}</label>
            <input id="gt" name="gamertag" required defaultValue={defaults.gamertag} placeholder="e.g. KingSlayer" className="input"/>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="lbl" htmlFor="co">Country</label>
              <select id="co" name="country" defaultValue={defaults.country||'Kenya'} className="input">
                {COUNTRIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl" htmlFor="dc">Discord ID</label>
              <input id="dc" name="discord" defaultValue={defaults.discord} placeholder="username#1234" className="input"/>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="lbl" htmlFor="em">Contact Email</label>
              <input id="em" type="email" name="email" required defaultValue={defaults.email} className="input"/>
            </div>
            <div>
              <label className="lbl" htmlFor="db">Date of birth ({type==='team'?'captain':'player'})</label>
              <input id="db" type="date" name="dob" required max={new Date().toISOString().slice(0,10)} value={dob} onChange={e=>setDob(e.target.value)} className="input"/>
            </div>
          </div>

          {minor&&<div className="space-y-3 border border-accent p-3">
            <p className="text-sm text-accent">Players under 18 need a parent or guardian’s consent.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="guardian_name" required placeholder="Guardian full name" aria-label="Guardian full name" className="input"/>
              <input name="guardian_phone" required placeholder="Guardian phone" aria-label="Guardian phone" className="input"/>
            </div>
          </div>}

          <div>
            <label className="lbl" htmlFor="lg">Team Logo (optional · PNG/JPG/WebP, max 2 MB)</label>
            <input id="lg" type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="input"/>
          </div>

          <label className="flex items-start gap-2 text-sm text-neutral-300">
            <input type="checkbox" name="terms" required className="mt-1"/>
            <span>I agree to the <Link href="/legal/terms" target="_blank" className="text-accent underline">Terms</Link> and <Link href="/legal/privacy" target="_blank" className="text-accent underline">Privacy Policy</Link>{minor&&', and my guardian consents'}.</span>
          </label>

          {err&&<p role="alert" className="text-sm text-live">{err}</p>}

          <button className="btn w-full" disabled={busy}>
            {busy?'Submitting…':type==='team'?'Create Team & Register':'Submit Solo Registration'}
          </button>
        </form>)}
      </div></div>}
  </>
}
