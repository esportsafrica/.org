import {NextResponse} from 'next/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {limited} from '@/lib/ratelimit'
export async function POST(req){
  if(await limited(req,'promo',15,300))return NextResponse.json({error:'Too many attempts'},{status:429})
  const {code}=await req.json()
  const {data}=await supabaseAdmin().from('promo_codes').select('percent').eq('code',String(code||'').toUpperCase()).eq('active',true).maybeSingle()
  return NextResponse.json({percent:data?.percent||0})
}
