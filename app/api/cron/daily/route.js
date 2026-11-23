import {NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {sendMail,wrap,p,btn,site} from '@/lib/email'
import {fmtDate,fmtTime} from '@/lib/format'
// Vercel Cron (vercel.json) calls this daily with `Authorization: Bearer $CRON_SECRET`.
export async function GET(req){
  if(!process.env.CRON_SECRET||req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return new NextResponse('Unauthorized',{status:401})
  const db=supabaseAdmin(),now=Date.now(),out={released:0,reminded:0}
  // 1. release approved-but-unpaid slots after 72h
  const {data:stale}=await db.from('registrations').select('id,contact_email,approved_at,tournaments(name,entry_fee_kes)').eq('status','approved').eq('paid',false)
  for(const r of stale||[]){if(!r.tournaments?.entry_fee_kes||!r.approved_at||now-new Date(r.approved_at)<72*3600e3)continue
    await db.from('registrations').update({status:'withdrawn'}).eq('id',r.id);out.released++
    await sendMail({to:r.contact_email,subject:`Slot released · ${r.tournaments.name}`,html:wrap('Slot released',p('Your entry fee wasn’t received within 72 hours of approval, so your slot was released. You can register again if spots remain.'))})}
  // 2. match-day reminders for events starting within 36h
  const {data:ts}=await db.from('tournaments').select('*').in('status',['open','live']).is('reminded_at',null).gt('starts_at',new Date(now).toISOString()).lt('starts_at',new Date(now+36*3600e3).toISOString())
  for(const t of ts||[]){
    const [{data:regs},{data:tix}]=await Promise.all([db.from('registrations').select('contact_email,paid').eq('tournament_id',t.id).eq('status','approved'),db.from('tickets').select('orders(email)').eq('tournament_id',t.id).eq('status','valid')])
    const to=new Set([...(regs||[]).filter(r=>r.paid||!t.entry_fee_kes).map(r=>r.contact_email),...(tix||[]).map(x=>x.orders?.email)].filter(Boolean))
    for(const e of to){await sendMail({to:e,subject:`Reminder: ${t.name} is tomorrow`,html:wrap(t.name,p(`${fmtDate(t.starts_at)} · tip-off ${fmtTime(t.starts_at)} · ${t.venue||'Online'}`)+p('Players: arrive 30 minutes early with your gamertag. Spectators: have your ticket QR ready.')+btn(`${site()}/account`,'Open my account'))});out.reminded++}
    await db.from('tournaments').update({reminded_at:new Date().toISOString()}).eq('id',t.id)}
  return NextResponse.json(out)
}
