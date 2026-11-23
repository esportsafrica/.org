import {supabaseServer} from '@/lib/supabase/server'
import PasswordForm from '@/components/PasswordForm'
import {updateProfile,deleteAccount} from '../actions'
export const metadata={title:'Profile · Esports Africa'}
const COUNTRIES=['Kenya','Nigeria','South Africa','Egypt','Morocco','Ghana','Tanzania','Uganda','Rwanda','Ethiopia','Senegal','Other']
export default async function Profile({searchParams}){
  const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser();const {data:p}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle()
  const F=({l,n,...r})=><div><label className="lbl">{l}</label><input name={n} defaultValue={p?.[n]||''} className="input" {...r}/></div>
  return <><h1 className="mb-6 text-5xl font-extrabold">Profile</h1>
    <form action={updateProfile} className="panel grid gap-4 sm:grid-cols-2"><F l="Full name" n="full_name" required/><F l="Phone (M-Pesa)" n="phone"/><F l="Main gamertag" n="gamertag"/><F l="Discord ID" n="discord"/>
      <div><label className="lbl">Country</label><select name="country" defaultValue={p?.country||'Kenya'} className="input">{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="flex items-end gap-3"><button className="btn">Save profile</button>{searchParams.saved&&<span role="status" className="text-sm text-win">Saved ✓</span>}</div></form>
    <h2 className="mb-3 mt-10 text-3xl">Security</h2><div className="panel"><p className="mb-3 text-sm text-muted">Signed in as {user.email}</p><PasswordForm/></div>
    <h2 className="mb-3 mt-10 text-3xl">Your data</h2><div className="panel space-y-4"><p className="text-sm text-neutral-400">Download everything we hold about you, or delete your account. Deleting removes your registrations, voids unused tickets, and strips personal details from payment records (we keep amounts for accounting).</p>
      <a href="/api/account/export" className="btn btn-ghost btn-sm">Download my data</a>
      <form action={deleteAccount} className="flex flex-wrap items-end gap-2"><div><label className="lbl" htmlFor="cf">Type DELETE to confirm</label><input id="cf" name="confirm" className="input w-48" autoComplete="off"/></div><button className="btn btn-ghost btn-sm text-live">Delete my account</button>{searchParams.err&&<span role="alert" className="text-sm text-live">Type DELETE exactly.</span>}</form></div></>
}
