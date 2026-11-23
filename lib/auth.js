import {redirect} from 'next/navigation'
import {supabaseServer} from './supabase/server'
/** Server-side gate for every admin page and action. RLS is the second layer. */
export async function requireAdmin(){
  const sb=supabaseServer()
  const {data:{user}}=await sb.auth.getUser()
  if(!user)redirect('/admin/login')
  const {data:p}=await sb.from('profiles').select('role').eq('id',user.id).single()
  if(p?.role!=='admin')redirect('/admin/login?denied=1')
  return {sb,user}
}
