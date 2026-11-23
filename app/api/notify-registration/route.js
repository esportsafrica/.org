import {NextResponse} from 'next/server'
import {supabaseServer} from '@/lib/supabase/server'
import {limited} from '@/lib/ratelimit'
import {sendMail,wrap,p,btn,site} from '@/lib/email'
export async function POST(req){
  const sb=supabaseServer(),{data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({},{status:401})
  if(await limited(req,'notify',5,600,user.id))return NextResponse.json({},{status:429})
  const {tournament_id}=await req.json()
  const {data:r}=await sb.from('registrations').select('*, tournaments(name)').eq('user_id',user.id).eq('tournament_id',tournament_id).order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(r)await sendMail({to:r.contact_email,subject:`Registration received · ${r.tournaments.name}`,html:wrap('Registration received',p(`We’ve received your entry for ${r.tournaments.name}. The organisers will review it and email you when it’s approved.`)+btn(`${site()}/account/registrations`,'Track my entry'))})
  return NextResponse.json({ok:true})
}
