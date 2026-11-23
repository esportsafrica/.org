import {NextResponse} from 'next/server'
import {supabaseServer} from '@/lib/supabase/server'
export async function GET(req){
  const u=new URL(req.url),code=u.searchParams.get('code');let next=u.searchParams.get('next')||'/account'
  if(!next.startsWith('/')||next.startsWith('//'))next='/account'
  if(code)await supabaseServer().auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL(next,u.origin))
}
