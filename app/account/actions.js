'use server'
import crypto from 'crypto'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {supabaseServer} from '@/lib/supabase/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import {sendMail,wrap,p,btn,site} from '@/lib/email'

async function me(){const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser();if(!user)redirect('/login');return {sb,user}}

export async function updateProfile(fd){
  const {sb,user}=await me()
  await sb.from('profiles').update({full_name:fd.get('full_name'),phone:fd.get('phone'),country:fd.get('country'),gamertag:fd.get('gamertag'),discord:fd.get('discord')}).eq('id',user.id)
  revalidatePath('/account','layout');redirect('/account/profile?saved=1')
}

export async function withdrawRegistration(fd){
  const {sb,user}=await me();const regId=fd.get('id')
  await sb.from('registrations').update({status:'withdrawn'}).eq('id',regId).eq('user_id',user.id)
  revalidatePath('/account','layout')
}

export async function signOutUser(){await supabaseServer().auth.signOut();redirect('/')}

export async function deleteAccount(fd){
  const {user}=await me();if(fd.get('confirm')!=='DELETE')redirect('/account/profile?err=confirm')
  const db=supabaseAdmin()
  await db.from('orders').update({name:'deleted',email:'deleted',phone:null,user_id:null}).eq('user_id',user.id)
  await db.from('tickets').update({status:'void',holder_name:null,user_id:null}).eq('user_id',user.id)
  await db.from('registration_members').delete().eq('user_id',user.id)
  await db.from('registrations').delete().eq('user_id',user.id)
  await db.auth.admin.deleteUser(user.id)
  await supabaseServer().auth.signOut();redirect('/?deleted=1')
}

/** Create Team Invite Link / Send Teammate Email */
export async function createTeamInvite(fd){
  const {sb,user}=await me()
  const regId=fd.get('registration_id'),role=fd.get('role')||'starter',email=String(fd.get('email')||'').trim().toLowerCase()
  
  // Verify captain & not locked
  const {data:reg}=await sb.from('registrations').select('id,team_name,roster_locked,tournament_id,tournaments(name,max_roster_size)').eq('id',regId).eq('user_id',user.id).single()
  if(!reg)throw new Error('Registration not found or unauthorized')
  if(reg.roster_locked)throw new Error('Roster is locked. Contact tournament organizers for substitutions.')

  // Check capacity
  const {count}=await sb.from('registration_members').select('*',{count:'exact',head:true}).eq('registration_id',regId).neq('status','declined')
  const maxCap=reg.tournaments?.max_roster_size||5
  if((count||0)>=maxCap)throw new Error(`Team roster capacity reached (maximum ${maxCap} players).`)

  const token='inv_'+crypto.randomBytes(16).toString('hex')
  const {error}=await sb.from('registration_members').insert({
    registration_id:regId,
    role,
    status:'invited',
    invite_token:token,
    invite_email:email||null
  })
  if(error)throw new Error(error.message)

  if(email){
    const joinUrl=`${site()}/join/${token}`
    await sendMail({
      to:email,
      subject:`Team invite: Join ${reg.team_name} for ${reg.tournaments.name}`,
      html:wrap('Tournament Roster Invite',
        p(`You have been invited to join <b>${reg.team_name}</b> as a ${role} for <b>${reg.tournaments.name}</b>.`)+
        p('Sign in to your Esports Africa account and accept the invite to confirm your spot.')+
        btn(joinUrl,'Accept Invite & Join Roster'))
    })
  }

  revalidatePath('/account/registrations')
  return {ok:true,token}
}

/** Captain removes an invited or accepted member from unlocked roster */
export async function removeTeamMember(fd){
  const {sb,user}=await me()
  const memberId=fd.get('member_id'),regId=fd.get('registration_id')

  const {data:reg}=await sb.from('registrations').select('id,roster_locked').eq('id',regId).eq('user_id',user.id).single()
  if(!reg||reg.roster_locked)throw new Error('Cannot remove members: roster is locked or unauthorized.')

  // Captain cannot remove self via this action
  const {data:m}=await sb.from('registration_members').select('role,gamertag').eq('id',memberId).eq('registration_id',regId).single()
  if(m?.role==='captain')throw new Error('Captain cannot be removed. Transfer captaincy or withdraw the team.')

  await sb.from('registration_members').delete().eq('id',memberId).eq('registration_id',regId)

  // Sync gamertags array on registration
  const {data:remaining}=await sb.from('registration_members').select('gamertag').eq('registration_id',regId).eq('status','accepted')
  const tags=(remaining||[]).map(x=>x.gamertag).filter(Boolean)
  await sb.from('registrations').update({gamertags:tags}).eq('id',regId)

  revalidatePath('/account/registrations')
}

/** Captain marks team as ready once min roster is satisfied */
export async function submitRosterReady(fd){
  const {sb,user}=await me()
  const regId=fd.get('registration_id')

  const {data:reg}=await sb.from('registrations').select('id,ready,tournaments(min_roster_size)').eq('id',regId).eq('user_id',user.id).single()
  if(!reg)throw new Error('Registration not found')

  const {count}=await sb.from('registration_members').select('*',{count:'exact',head:true}).eq('registration_id',regId).eq('status','accepted')
  const min=reg.tournaments?.min_roster_size||1
  if((count||0)<min)throw new Error(`Need at least ${min} confirmed team members before submitting (currently have ${count||0}).`)

  await sb.from('registrations').update({ready:true}).eq('id',regId)
  revalidatePath('/account/registrations')
}

/** Teammate accepts invite via token */
export async function acceptTeamInvite(fd){
  const {sb,user}=await me()
  const token=fd.get('token'),gamertag=String(fd.get('gamertag')||'').trim()
  const dob=fd.get('dob'),terms=fd.get('terms')==='on'
  const guardian_name=fd.get('guardian_name')||null,guardian_phone=fd.get('guardian_phone')||null

  if(!gamertag)throw new Error('Please enter your gamertag.')
  if(!dob)throw new Error('Please enter your date of birth.')
  if(!terms)throw new Error('You must accept the terms.')

  // Fetch invite
  const db=supabaseAdmin()
  const {data:inv}=await db.from('registration_members').select('*, registrations(*, tournaments(*))').eq('invite_token',token).maybeSingle()
  if(!inv)throw new Error('Invite not found or expired.')
  if(inv.status==='accepted'&&inv.user_id===user.id)redirect('/account/registrations')

  const tournamentId=inv.registrations?.tournament_id
  if(!tournamentId)throw new Error('Invalid tournament association.')

  // Fair play check: player cannot be on two accepted rosters in the same tournament
  const {data:existing}=await db.from('registration_members').select('id,registrations(status)').eq('user_id',user.id).eq('status','accepted')
  const conflict=(existing||[]).some(e=>e.registrations?.tournament_id===tournamentId&&!['rejected','withdrawn'].includes(e.registrations?.status))
  if(conflict)throw new Error('You are already registered on another active team for this tournament.')

  // Update invite to accepted
  const {error:updateErr}=await db.from('registration_members').update({
    user_id:user.id,
    status:'accepted',
    gamertag,
    dob,
    guardian_name,
    guardian_phone,
    accepted_terms:true,
    joined_at:new Date().toISOString()
  }).eq('id',inv.id)

  if(updateErr)throw new Error(updateErr.message)

  // Sync team's gamertags on registrations table
  const {data:allAccepted}=await db.from('registration_members').select('gamertag').eq('registration_id',inv.registration_id).eq('status','accepted')
  const allTags=[...new Set((allAccepted||[]).map(x=>x.gamertag).filter(Boolean))]
  await db.from('registrations').update({gamertags:allTags}).eq('id',inv.registration_id)

  // Notify captain
  if(inv.registrations?.contact_email){
    await sendMail({
      to:inv.registrations.contact_email,
      subject:`Teammate joined · ${inv.registrations.team_name}`,
      html:wrap('Roster Update',
        p(`<b>${gamertag}</b> has accepted the invite and joined your roster for <b>${inv.registrations.tournaments?.name}</b>.`)+
        btn(`${site()}/account/registrations`,'View Roster'))
    })
  }

  revalidatePath('/account/registrations')
  redirect('/account/registrations?joined=1')
}

/** Looking For Team (LFT) board actions */
export async function postLFT(fd){
  const {sb,user}=await me()
  const tid=fd.get('tournament_id'),gamertag=fd.get('gamertag'),discord=fd.get('discord')||null
  const role_pref=fd.get('role_preference')||'Any',bio=fd.get('bio')||'',country=fd.get('country')||'Kenya'

  await sb.from('lft_posts').upsert({
    tournament_id:tid,
    user_id:user.id,
    gamertag,
    discord,
    country,
    role_preference:role_pref,
    bio,
    status:'active'
  })
  revalidatePath(`/tournaments`)
}

export async function deleteLFT(fd){
  const {sb,user}=await me()
  await sb.from('lft_posts').delete().eq('id',fd.get('id')).eq('user_id',user.id)
  revalidatePath('/tournaments')
}
