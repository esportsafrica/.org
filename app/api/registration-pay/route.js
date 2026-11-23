import {NextResponse} from 'next/server'
import {supabaseServer} from '@/lib/supabase/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {paystackInit} from '@/lib/paystack'
import {limited} from '@/lib/ratelimit'
const bad=(e,s=400)=>NextResponse.json({error:e},{status:s})
export async function POST(req){
  const sb=supabaseServer(),{data:{user}}=await sb.auth.getUser();if(!user)return bad('Sign in first',401)
  if(await limited(req,'regpay',10,600,user.id))return bad('Too many attempts',429)
  const b=await req.json()
  const {data:r}=await sb.from('registrations').select('*, tournaments(name,entry_fee_kes)').eq('id',b.registration_id).eq('user_id',user.id).maybeSingle()
  if(!r||r.status!=='approved'||r.paid||!r.tournaments.entry_fee_kes)return bad('Nothing to pay for this entry')
  const total=r.tournaments.entry_fee_kes,reference='EF-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase()
  const {error}=await supabaseAdmin().from('orders').insert({reference,user_id:user.id,name:r.team_name||r.gamertags[0],email:user.email,method:b.method,subtotal:total,total,items:[{registration_id:r.id,name:`Entry fee · ${r.tournaments.name}`,qty:1,price:total}]})
  if(error)return bad('Could not start payment',500)
  try{const url=await paystackInit({email:user.email,total,reference,method:b.method,site:process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin,metadata:{registration_id:r.id}})
    return NextResponse.json(url?{reference,url}:{reference,note:'Payments are not enabled yet. The organisers can mark your entry as paid.'})}catch{return bad('Payment provider error',502)}
}
