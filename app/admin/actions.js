'use server'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {requireAdmin} from '@/lib/auth'
import {fromLocalInput} from '@/lib/format'
import {supabaseServer} from '@/lib/supabase/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {markPaid} from '@/lib/orders'
import {audit} from '@/lib/audit'
import {standings} from '@/lib/standings.mjs'
import {sendMail,wrap,p,btn,site} from '@/lib/email'
const n=v=>v===''||v==null?null:Number(v)
const lines=s=>String(s||'').split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(a=>a[0])
const ok=(...x)=>x.forEach(v=>revalidatePath(v))
const clean=f=>String(f||'file').replace(/[^\w.-]/g,'_')
async function upload(sb,file,prefix=''){if(!file||!file.size)return null;const path=`${prefix}${Date.now()}-${clean(file.name)}`;const up=await sb.storage.from('posters').upload(path,file);if(up.error)throw new Error(up.error.message);return sb.storage.from('posters').getPublicUrl(path).data.publicUrl}

export async function saveTournament(fd){
  const {sb,user}=await requireAdmin(),id=fd.get('id')
  const poster_url=(await upload(sb,fd.get('poster')))||fd.get('poster_url')||null
  const row={slug:fd.get('slug'),name:fd.get('name'),game:fd.get('game'),status:fd.get('status'),starts_at:fromLocalInput(fd.get('starts_at')),venue:fd.get('venue'),mode:fd.get('mode'),format:fd.get('format'),
    entry_type:fd.get('entry_type')||'solo',min_roster_size:n(fd.get('min_roster_size'))||1,max_roster_size:n(fd.get('max_roster_size'))||1,
    entry_fee_kes:n(fd.get('entry_fee_kes'))||0,prize_pool_kes:n(fd.get('prize_pool_kes'))||0,max_teams:n(fd.get('max_teams')),description:fd.get('description'),stream_url:fd.get('stream_url')||null,poster_url,
    rules:lines(fd.get('rules')).map(([title,...b])=>({title,body:b.join(' | ')})),prize_tiers:lines(fd.get('prize_tiers')).map(([label,pct])=>({label,pct:Number(pct)||0}))}
  const {data,error}=id?await sb.from('tournaments').update(row).eq('id',id).select('id').single():await sb.from('tournaments').insert(row).select('id').single()
  if(error)throw new Error(error.message);await audit(sb,user,id?'update':'create','tournament',data.id,{name:row.name,status:row.status});ok('/','/tournaments','/live','/admin');redirect('/admin/tournaments')
}
export async function deleteTournament(fd){const {sb,user}=await requireAdmin();await sb.from('tournaments').delete().eq('id',fd.get('id'));await audit(sb,user,'delete','tournament',fd.get('id'));ok('/','/tournaments','/admin','/admin/tournaments')}

export async function setRegStatus(fd){
  const {sb,user}=await requireAdmin(),status=fd.get('status'),id=fd.get('id')
  const updates={status,approved_at:status==='approved'?new Date().toISOString():null}
  if(status==='approved')updates.roster_locked=true
  const {data:r}=await sb.from('registrations').update(updates).eq('id',id).select('contact_email,team_name,gamertags,tournaments(name,entry_fee_kes)').single()
  await audit(sb,user,status,'registration',id)
  if(r&&status==='approved')await sendMail({to:r.contact_email,subject:`Approved · ${r.tournaments.name}`,html:wrap('You’re approved',p(`Your entry for ${r.tournaments.name} has been approved.`)+(r.tournaments.entry_fee_kes?p(`Pay the KSh ${r.tournaments.entry_fee_kes.toLocaleString()} entry fee within 72 hours to lock your slot.`):'')+btn(`${site()}/account/registrations`,'Go to my entry'))})
  if(r&&status==='rejected')await sendMail({to:r.contact_email,subject:`Entry update · ${r.tournaments.name}`,html:wrap('Entry not accepted',p(`Unfortunately your entry for ${r.tournaments.name} wasn’t accepted. Reply to this email if you have questions.`))})
  ok('/admin/registrations','/admin','/account/registrations')
}
export async function toggleRosterLock(fd){
  const {sb,user}=await requireAdmin(),id=fd.get('id'),v=fd.get('v')==='true'
  await sb.from('registrations').update({roster_locked:v}).eq('id',id)
  await audit(sb,user,v?'lock_roster':'unlock_roster','registration',id)
  ok('/admin/registrations','/account/registrations')
}
export async function adminSubstituteMember(fd){
  const {sb,user}=await requireAdmin(),memberId=fd.get('member_id'),newRole=fd.get('role'),newGamertag=fd.get('gamertag')
  const updates={}
  if(newRole)updates.role=newRole
  if(newGamertag)updates.gamertag=newGamertag
  await sb.from('registration_members').update(updates).eq('id',memberId)
  await audit(sb,user,'admin_substitute','registration_member',memberId,updates)
  ok('/admin/registrations','/account/registrations')
}
export async function setRegPaid(fd){const {sb,user}=await requireAdmin();await sb.from('registrations').update({paid:fd.get('paid')==='true'}).eq('id',fd.get('id'));await audit(sb,user,'set_paid','registration',fd.get('id'),{paid:fd.get('paid')});ok('/admin/registrations')}
export async function toggleCheckin(fd){const {sb,user}=await requireAdmin();await sb.from('registrations').update({checked_in:fd.get('v')==='true'}).eq('id',fd.get('id'));await audit(sb,user,'player_checkin','registration',fd.get('id'));ok('/admin/registrations','/account/registrations')}
export async function updateRegistration(fd){
  const {sb,user}=await requireAdmin()
  await sb.from('registrations').update({team_name:fd.get('team_name')||null,gamertags:String(fd.get('gamertags')).split(/[\n,]/).map(s=>s.trim()).filter(Boolean),country:fd.get('country'),discord:fd.get('discord')||null,contact_email:fd.get('contact_email')}).eq('id',fd.get('id'))
  await audit(sb,user,'edit','registration',fd.get('id'));ok('/admin/registrations')
}

export async function saveMatch(fd){
  const {sb,user}=await requireAdmin(),id=fd.get('id')
  const row={tournament_id:fd.get('tournament_id'),stage:fd.get('stage'),group_label:fd.get('group_label')||null,team_a:fd.get('team_a'),team_b:fd.get('team_b'),score_a:n(fd.get('score_a')),score_b:n(fd.get('score_b')),status:fd.get('status'),starts_at:fd.get('starts_at')?fromLocalInput(fd.get('starts_at')):null}
  const {error}=id?await sb.from('matches').update(row).eq('id',id):await sb.from('matches').insert(row);if(error)throw new Error(error.message);if(id)await audit(sb,user,'score','match',id,{score:`${row.score_a}-${row.score_b}`,status:row.status});ok('/live','/','/rankings','/admin/matches')
}
export async function deleteMatch(fd){const {sb,user}=await requireAdmin();await sb.from('matches').delete().eq('id',fd.get('id'));await audit(sb,user,'delete','match',fd.get('id'));ok('/live','/admin/matches')}
const back=(t,m)=>redirect(`/admin/matches?t=${t}&msg=${encodeURIComponent(m)}`)
export async function generateGroups(fd){
  const {sb,user}=await requireAdmin(),t=fd.get('tournament_id'),g=Math.max(1,Math.min(8,Number(fd.get('groups'))||2))
  const {count}=await sb.from('matches').select('*',{count:'exact',head:true}).eq('tournament_id',t).eq('stage','group');if(count)back(t,'Group matches already exist. Delete them first.')
  const {data:regs}=await sb.from('registrations').select('team_name,gamertags').eq('tournament_id',t).eq('status','approved')
  const names=(regs||[]).map(r=>r.team_name||r.gamertags[0]);if(names.length<g*2)back(t,`Need at least ${g*2} approved entries (have ${names.length}).`)
  for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
  const groups=Array.from({length:g},()=>[]);names.forEach((x,i)=>groups[i%g].push(x))
  const rows=[];groups.forEach((tm,gi)=>{for(let a=0;a<tm.length;a++)for(let b=a+1;b<tm.length;b++)rows.push({tournament_id:t,stage:'group',group_label:String.fromCharCode(65+gi),team_a:tm[a],team_b:tm[b]})})
  await sb.from('matches').insert(rows);await audit(sb,user,'generate_groups','tournament',t,{groups:g,matches:rows.length});ok('/live','/admin/matches');back(t,`Created ${rows.length} group matches across ${g} groups.`)
}
export async function generateKnockout(fd){
  const {sb,user}=await requireAdmin(),t=fd.get('tournament_id')
  const {data:ms}=await sb.from('matches').select('*').eq('tournament_id',t);if((ms||[]).some(m=>m.stage!=='group'))back(t,'Knockout matches already exist.')
  const gs=standings(ms||[]);if(!gs.length)back(t,'Generate group matches first.')
  const q=Object.fromEntries(gs.map(([k,rows])=>[k,[rows[0]?.t||'TBD',rows[1]?.t||'TBD']]));const A=Object.keys(q),P=(stage,a,b)=>({tournament_id:t,stage,team_a:a,team_b:b})
  let rows
  if(A.length===1)rows=[P('semi',q.A[0],q.A[1]),P('semi','TBD','TBD'),P('final','TBD','TBD')]
  else if(A.length===2)rows=[P('semi',q.A[0],q.B[1]),P('semi',q.B[0],q.A[1]),P('final','TBD','TBD')]
  else if(A.length===4)rows=[P('quarter',q.A[0],q.B[1]),P('quarter',q.C[0],q.D[1]),P('quarter',q.B[0],q.A[1]),P('quarter',q.D[0],q.C[1]),P('semi','TBD','TBD'),P('semi','TBD','TBD'),P('final','TBD','TBD')]
  else back(t,'Automatic seeding supports 1, 2 or 4 groups. Add knockout matches manually.')
  await sb.from('matches').insert(rows);await audit(sb,user,'generate_knockout','tournament',t);ok('/live','/admin/matches');back(t,'Knockout bracket seeded from group standings. Fill later rounds as winners are decided.')
}

export async function saveTier(fd){
  const {sb,user}=await requireAdmin(),id=fd.get('id')
  const row={tournament_id:fd.get('tournament_id'),name:fd.get('name'),price_kes:n(fd.get('price_kes'))||0,capacity:n(fd.get('capacity'))||0,perks:String(fd.get('perks')||'').split(',').map(s=>s.trim()).filter(Boolean),active:fd.get('active')==='on'}
  const {error}=id?await sb.from('ticket_tiers').update(row).eq('id',id):await sb.from('ticket_tiers').insert(row);if(error)throw new Error(error.message);await audit(sb,user,id?'update':'create','ticket_tier',id||row.name);ok('/tickets','/admin/tickets')
}
export async function deleteTier(fd){const {sb,user}=await requireAdmin();await sb.from('ticket_tiers').delete().eq('id',fd.get('id'));await audit(sb,user,'delete','ticket_tier',fd.get('id'));ok('/tickets','/admin/tickets')}
export async function savePromo(fd){const {sb}=await requireAdmin();await sb.from('promo_codes').upsert({code:String(fd.get('code')).toUpperCase(),percent:n(fd.get('percent')),active:fd.get('active')==='on'});ok('/admin/tickets')}
export async function deletePromo(fd){const {sb}=await requireAdmin();await sb.from('promo_codes').delete().eq('code',fd.get('code'));ok('/admin/tickets')}
export async function markOrderPaid(fd){const {sb,user}=await requireAdmin();await markPaid(fd.get('reference'));await audit(sb,user,'mark_paid','order',fd.get('reference'));ok('/admin/tickets','/admin')}
export async function voidTicket(fd){const {sb,user}=await requireAdmin();await sb.from('tickets').update({status:'void'}).eq('id',fd.get('id'));await audit(sb,user,'void','ticket',fd.get('id'));ok('/admin/tickets')}
export async function refundOrder(fd){
  const {sb,user}=await requireAdmin(),ref=fd.get('reference'),db=supabaseAdmin()
  const {data:o}=await db.from('orders').select('*').eq('reference',ref).maybeSingle();if(!o||o.status!=='paid')return
  const key=process.env.PAYSTACK_SECRET_KEY
  if(key&&!ref.startsWith('MANUAL')){const r=await fetch('https://api.paystack.co/refund',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({transaction:ref})});const j=await r.json();if(!j.status)throw new Error('Paystack refund failed: '+(j.message||''))}
  await db.from('orders').update({status:'refunded'}).eq('id',o.id)
  for(const i of o.items){if(i.registration_id)await db.from('registrations').update({paid:false,status:'withdrawn'}).eq('id',i.registration_id);else await db.rpc('increment_sold',{tier:i.tier_id,qty:-i.qty})}
  await db.from('tickets').update({status:'void'}).eq('order_id',o.id)
  await audit(sb,user,'refund','order',ref,{total:o.total})
  await sendMail({to:o.email,subject:`Refund issued · ${ref}`,html:wrap('Refund issued',p(`We’ve refunded KSh ${o.total.toLocaleString()} for order ${ref}. It may take a few days to appear with your bank or M-Pesa.`))})
  ok('/admin/tickets','/admin','/account')
}
export async function checkIn(fd){
  const {sb,user}=await requireAdmin(),code=String(fd.get('code')||'').trim().toUpperCase()
  const {data:t}=await sb.from('tickets').select('id,status').eq('code',code).maybeSingle()
  let r='invalid'
  if(t){if(t.status==='used')r='used';else if(t.status==='void')r='void';else{await sb.from('tickets').update({status:'used',checked_in_at:new Date().toISOString()}).eq('id',t.id);await audit(sb,user,'gate_checkin','ticket',t.id);r='ok'}}
  redirect(`/admin/checkin?r=${r}&code=${encodeURIComponent(code)}`)
}

export async function setRole(fd){
  const {sb,user}=await requireAdmin(),id=fd.get('id'),role=fd.get('role')
  if(id===user.id)return
  await sb.from('profiles').update({role}).eq('id',id);await audit(sb,user,'set_role','user',id,{role});ok('/admin/users')
}
export async function saveSponsor(fd){const {sb,user}=await requireAdmin(),id=fd.get('id');const logo=await upload(sb,fd.get('logo'),'sponsors/');const row={name:fd.get('name'),url:fd.get('url')||null,sort:n(fd.get('sort'))||0,...(logo?{logo_url:logo}:{})};id?await sb.from('sponsors').update(row).eq('id',id):await sb.from('sponsors').insert(row);await audit(sb,user,'save','sponsor',id||row.name);ok('/','/admin/sponsors')}
export async function deleteSponsor(fd){const {sb}=await requireAdmin();await sb.from('sponsors').delete().eq('id',fd.get('id'));ok('/','/admin/sponsors')}
export async function savePost(fd){const {sb,user}=await requireAdmin(),id=fd.get('id');const cover=await upload(sb,fd.get('cover'),'news/');const row={title:fd.get('title'),slug:fd.get('slug'),body:fd.get('body'),published:fd.get('published')==='on',...(cover?{cover_url:cover}:{})};const {error}=id?await sb.from('posts').update(row).eq('id',id):await sb.from('posts').insert(row);if(error)throw new Error(error.message);await audit(sb,user,'save','post',id||row.slug);ok('/news','/admin/posts')}
export async function deletePost(fd){const {sb}=await requireAdmin();await sb.from('posts').delete().eq('id',fd.get('id'));ok('/news','/admin/posts')}
export async function signOut(){await supabaseServer().auth.signOut();redirect('/admin/login')}
