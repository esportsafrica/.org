import {redirect} from 'next/navigation'
import {supabaseServer} from './supabase/server'
import {supabaseAdmin} from './supabase/admin'

const ADMIN_EMAILS = [
  'info@esportsafrica.org',
  (process.env.ADMIN_EMAIL || '').toLowerCase()
].filter(Boolean)

/** Server-side gate for every admin page and action. RLS is the second layer. */
export async function requireAdmin(){
  const sb = supabaseServer()
  const {data:{user}} = await sb.auth.getUser()
  if(!user) redirect('/admin/login')

  const userEmail = (user.email || '').toLowerCase()
  let {data:p} = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle()

  // Auto-promote designated admin email so login works immediately
  if(p?.role !== 'admin' && ADMIN_EMAILS.includes(userEmail)){
    const db = supabaseAdmin()
    await db.from('profiles').upsert({id: user.id, role: 'admin'})
    const refreshed = await db.from('profiles').select('role').eq('id', user.id).single()
    p = refreshed.data
  }

  if(p?.role !== 'admin') redirect(`/admin/login?denied=1&email=${encodeURIComponent(user.email || '')}`)
  return {sb, user}
}
