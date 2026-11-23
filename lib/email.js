const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
export const site=()=>process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'
export const wrap=(title,body)=>`<div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:28px;max-width:560px"><h2 style="color:#f7d000;text-transform:uppercase;margin:0 0 14px">${esc(title)}</h2>${body}<p style="color:#888;font-size:12px;margin-top:24px">Esports Africa · esportsafrica.org</p></div>`
export const p=t=>`<p style="line-height:1.5">${esc(t)}</p>`
export const btn=(href,label)=>`<p><a href="${href}" style="background:#f7d000;color:#000;padding:10px 18px;text-decoration:none;font-weight:bold">${esc(label)}</a></p>`
/** Resend. Silently no-ops when RESEND_API_KEY isn't set, so the app works without email configured. */
export async function sendMail({to,subject,html}){
  const k=process.env.RESEND_API_KEY;if(!k||!to)return false
  try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${k}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM||'Esports Africa <onboarding@resend.dev>',to,subject,html})});return r.ok}catch{return false}
}
