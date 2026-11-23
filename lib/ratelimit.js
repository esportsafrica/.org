import {supabaseAdmin} from './supabase/admin'
/** DB-backed fixed-window limiter. Returns true when the caller is OVER the limit. */
export async function limited(req,name,limit,windowSec,extra=''){
  const ip=(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown'
  const {data}=await supabaseAdmin().rpc('rate_limit',{p_key:`${name}:${ip}:${extra}`,p_limit:limit,p_window:windowSec})
  return data===false
}
