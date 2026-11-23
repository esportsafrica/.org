import Link from 'next/link'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {paystackVerify} from '@/lib/paystack'
import {markPaid} from '@/lib/orders'
export const dynamic='force-dynamic'
export default async function Success({searchParams}){
  const ref=searchParams.reference||searchParams.trxref
  let o=null
  if(ref){const db=supabaseAdmin();({data:o}=await db.from('orders').select('*').eq('reference',ref).maybeSingle())
    if(o&&o.status!=='paid'){const v=await paystackVerify(ref);if(v?.status==='success'&&v.amount===o.total*100){await markPaid(ref);({data:o}=await db.from('orders').select('*').eq('reference',ref).maybeSingle())}}}
  const paid=o?.status==='paid',entry=o?.items?.some(i=>i.registration_id)
  return <div className="wrap py-20"><div className="tag">{paid?'Payment confirmed':'Payment pending'}</div>
    <h1 className="my-3 text-[clamp(44px,8vw,88px)] font-extrabold">{paid?(entry?'You’re confirmed':'See you at the arena'):'Almost there'}</h1>
    <p className="mb-6 max-w-xl text-neutral-400">{paid?(entry?'Your entry fee is paid and your slot is locked.':'Your tickets are ready, with QR codes in your account.'):'We haven’t received confirmation yet. This page updates once your payment clears; check your account in a minute.'} {ref&&<>Reference <b className="text-white">{ref}</b>.</>}</p>
    <Link href={entry?'/account/registrations':'/account/tickets'} className="btn">{entry?'My registrations':'My tickets'}</Link></div>
}
