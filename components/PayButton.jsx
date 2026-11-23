'use client'
import {useState} from 'react'
export default function PayButton({id,amount}){
  const [busy,setBusy]=useState(false),[msg,setMsg]=useState('')
  async function go(method){setBusy(true);setMsg('')
    const r=await fetch('/api/registration-pay',{method:'POST',body:JSON.stringify({registration_id:id,method})}),j=await r.json();setBusy(false)
    if(!r.ok)return setMsg(j.error||'Payment failed');if(j.url)location.href=j.url;else setMsg(j.note)}
  return <div className="flex flex-wrap items-center gap-2"><button disabled={busy} onClick={()=>go('card')} className="btn btn-sm">Pay {amount} by card</button><button disabled={busy} onClick={()=>go('mpesa')} className="btn btn-ghost btn-sm">M-Pesa</button>{msg&&<span role="status" className="text-sm text-accent">{msg}</span>}</div>
}
