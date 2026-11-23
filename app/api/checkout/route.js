import {NextResponse} from 'next/server'
import {supabaseServer} from '@/lib/supabase/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {paystackInit} from '@/lib/paystack'
import {limited} from '@/lib/ratelimit'
import {markPaid} from '@/lib/orders'
const bad=(error,s=400)=>NextResponse.json({error},{status:s})
export async function POST(req){
  const {data:{user}}=await supabaseServer().auth.getUser();if(!user)return bad('Please sign in to buy tickets',401)
  if(await limited(req,'checkout',10,600,user.id))return bad('Too many attempts. Try again shortly.',429)
  const b=await req.json()
  const items=(b.items||[]).filter(i=>i.qty>0&&i.qty<=10).map(i=>({tier_id:i.tier_id,qty:i.qty}));if(!items.length)return bad('Cart is empty')
  const reference='EA-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase()
  // Atomic in Postgres: locks the tiers, counts held (pending, unexpired) stock, prices from the DB, 15-minute hold.
  const {data:o,error}=await supabaseAdmin().rpc('place_order',{p_user:user.id,p_name:String(b.name||'').slice(0,120),p_email:user.email,p_phone:b.phone?String(b.phone).slice(0,30):null,p_method:b.method==='mpesa'?'mpesa':'card',p_promo:b.promo||'',p_items:items,p_reference:reference})
  if(error){const m=error.message||'';return bad(m.includes('sold_out')?`${m.split('sold_out:')[1]||'That ticket'} is sold out or being held by other buyers. Try again in a few minutes.`:'Ticket unavailable',409)}
  if(o.total===0){await markPaid(reference);return NextResponse.json({reference,total:0,url:'/tickets/success?reference='+reference})}
  try{const url=await paystackInit({email:user.email,total:o.total,reference,method:b.method,site:process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin,metadata:{name:b.name,phone:b.phone}})
    return NextResponse.json(url?{reference,total:o.total,url}:{reference,total:o.total,note:'Order saved and your tickets are held for 15 minutes. Online payment is not enabled yet; the organisers can confirm it manually.'})}catch{return bad('Payment provider error',502)}
}
