import crypto from 'crypto'
import {supabaseAdmin} from './supabase/admin'
import {sendMail,wrap,p,btn,site} from './email'
const code=()=>'EA-'+crypto.randomBytes(5).toString('hex').toUpperCase()
/** Idempotent: marks an order paid once, then fulfils it (entry fee → registration.paid, tickets → issued codes). */
export async function markPaid(reference){
  const db=supabaseAdmin()
  const {data:o}=await db.from('orders').select('*').eq('reference',reference).maybeSingle()
  if(!o||o.status==='paid')return o
  const {data:won}=await db.from('orders').update({status:'paid'}).eq('id',o.id).neq('status','paid').select().maybeSingle()
  if(!won)return o // another request fulfilled it first
  for(const i of o.items){
    if(i.registration_id){await db.from('registrations').update({paid:true}).eq('id',i.registration_id);continue}
    const {data:tier}=await db.from('ticket_tiers').select('tournament_id').eq('id',i.tier_id).single()
    await db.rpc('increment_sold',{tier:i.tier_id,qty:i.qty})
    await db.from('tickets').insert(Array.from({length:i.qty},()=>({order_id:o.id,user_id:o.user_id,tier_id:i.tier_id,tournament_id:tier.tournament_id,code:code(),holder_name:o.name})))
  }
  await sendMail({to:o.email,subject:`Payment confirmed · ${o.reference}`,html:wrap('Payment confirmed',p(`Thanks ${o.name||''}. We received your payment of KSh ${o.total.toLocaleString()} (ref ${o.reference}).`)+btn(`${site()}/account`,'Open my account'))})
  return won
}
