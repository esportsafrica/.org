import {NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {limited} from '@/lib/ratelimit'
import {sendMail,wrap,p} from '@/lib/email'
export async function POST(req){
  if(await limited(req,'contact',3,3600))return NextResponse.json({error:'Too many messages. Try again later.'},{status:429})
  const b=await req.json();const email=String(b.email||''),body=String(b.body||'').slice(0,3000)
  if(!/^\S+@\S+\.\S+$/.test(email)||body.length<5)return NextResponse.json({error:'Enter a valid email and a message.'},{status:400})
  await supabaseAdmin().from('messages').insert({name:String(b.name||'').slice(0,120),email,body})
  await sendMail({to:process.env.CONTACT_EMAIL||'info@esportsafrica.org',subject:`Website message from ${b.name||email}`,html:wrap('New message',p(`From: ${b.name||''} <${email}>`)+p(body))})
  return NextResponse.json({ok:true})
}
