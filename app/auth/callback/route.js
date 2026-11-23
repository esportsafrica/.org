import {NextResponse} from 'next/server'
import {supabaseServer} from '@/lib/supabase/server'

export async function GET(req){
  const u = new URL(req.url)
  const code = u.searchParams.get('code')
  const token_hash = u.searchParams.get('token_hash')
  const type = u.searchParams.get('type')
  const error_desc = u.searchParams.get('error_description')

  let next = u.searchParams.get('next') || '/account'
  if(!next.startsWith('/') || next.startsWith('//')) next = '/account'

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || u.origin

  if(error_desc){
    return NextResponse.redirect(`${siteOrigin}/login?err=${encodeURIComponent(error_desc)}`)
  }

  const sb = supabaseServer()

  // 1. PKCE Code (Google OAuth or Modern Magic Link)
  if(code){
    const {error} = await sb.auth.exchangeCodeForSession(code)
    if(error){
      return NextResponse.redirect(`${siteOrigin}/login?err=${encodeURIComponent(error.message)}`)
    }
  }

  // 2. Token Hash (Classic Email Magic Link / Confirmation)
  if(token_hash && type){
    const {error} = await sb.auth.verifyOtp({token_hash, type})
    if(error){
      return NextResponse.redirect(`${siteOrigin}/login?err=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(new URL(next, siteOrigin))
}
