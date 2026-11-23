'use client'
import {useState} from 'react'
import {supabaseBrowser} from '@/lib/supabase/client'
export default function PasswordForm(){
  const [m,setM]=useState(''),[bad,setBad]=useState(false)
  async function go(e){e.preventDefault();const p=new FormData(e.currentTarget).get('password');const {error}=await supabaseBrowser().auth.updateUser({password:p});setBad(!!error);setM(error?error.message:'Password updated.');if(!error)e.currentTarget.reset()}
  return <form onSubmit={go} className="flex flex-wrap items-end gap-2"><div><label className="lbl">New password</label><input name="password" type="password" minLength={8} required className="input w-64" autoComplete="new-password"/></div><button className="btn btn-sm">Update</button>{m&&<span role="status" className={`text-sm ${bad?'text-live':'text-win'}`}>{m}</span>}</form>
}
