'use client'
import {useState} from 'react'
export default function ContactForm(){
  const [s,setS]=useState(''),[bad,setBad]=useState(false)
  async function go(e){e.preventDefault();const f=e.currentTarget,r=await fetch('/api/contact',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(f)))}),j=await r.json();setBad(!r.ok);setS(r.ok?'Thanks. We’ll get back to you soon.':j.error);if(r.ok)f.reset()}
  return <form onSubmit={go} className="panel max-w-xl space-y-4"><div><label className="lbl" htmlFor="n">Name</label><input id="n" name="name" className="input"/></div><div><label className="lbl" htmlFor="e">Email</label><input id="e" name="email" type="email" required className="input"/></div><div><label className="lbl" htmlFor="m">Message</label><textarea id="m" name="body" required rows={5} className="input"/></div>
    <button className="btn">Send message</button>{s&&<p role="status" className={`text-sm ${bad?'text-live':'text-win'}`}>{s}</p>}</form>
}
