import crypto from 'crypto'
import {NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {markPaid} from '@/lib/orders'
// Paystack dashboard → Settings → Webhooks: https://YOUR-SITE/api/paystack/webhook
export async function POST(req){
  const raw=await req.text()
  const sig=crypto.createHmac('sha512',process.env.PAYSTACK_SECRET_KEY||'').update(raw).digest('hex')
  if(sig!==req.headers.get('x-paystack-signature'))return new NextResponse('invalid',{status:401})
  const ev=JSON.parse(raw);if(ev.event!=='charge.success')return NextResponse.json({ok:true})
  const {data:o}=await supabaseAdmin().from('orders').select('total').eq('reference',ev.data.reference).maybeSingle()
  if(!o||ev.data.amount!==o.total*100)return new NextResponse('mismatch',{status:400})
  await markPaid(ev.data.reference);return NextResponse.json({ok:true})
}
