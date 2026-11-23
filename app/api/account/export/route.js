import {supabaseServer} from '@/lib/supabase/server'
/** GDPR/DPA-style "download my data": everything tied to the signed-in user, as JSON. */
export async function GET(){
  const sb=supabaseServer(),{data:{user}}=await sb.auth.getUser();if(!user)return new Response('Unauthorized',{status:401})
  const [profile,registrations,orders,tickets]=await Promise.all([sb.from('profiles').select('*').eq('id',user.id).maybeSingle(),sb.from('registrations').select('*').eq('user_id',user.id),sb.from('orders').select('*').eq('user_id',user.id),sb.from('tickets').select('*').eq('user_id',user.id)])
  return new Response(JSON.stringify({exported_at:new Date().toISOString(),account:{id:user.id,email:user.email,created_at:user.created_at},profile:profile.data,registrations:registrations.data,orders:orders.data,tickets:tickets.data},null,2),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="my-esports-africa-data.json"'}})
}
