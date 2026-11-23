import Link from 'next/link'
import {redirect} from 'next/navigation'
import {supabaseServer} from '@/lib/supabase/server'
import {supabaseAdmin} from '@/lib/supabase/admin'
import JoinTeamForm from '@/components/JoinTeamForm'
import {fmtDate} from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({params}){
  return {title: 'Join Team Roster · Esports Africa'}
}

export default async function JoinPage({params}){
  const token = params.token
  const db = supabaseAdmin()

  // Fetch invite with tournament & registration info
  const {data:inv} = await db.from('registration_members')
    .select('*, registrations(*, tournaments(*))')
    .eq('invite_token', token)
    .maybeSingle()

  if(!inv || !inv.registrations){
    return (
      <div className="wrap max-w-lg py-20 text-center">
        <h1 className="text-4xl font-extrabold text-live">Invalid or Expired Invite</h1>
        <p className="mt-3 text-neutral-400">This team invite link is invalid, expired, or has already been revoked by the team captain.</p>
        <Link href="/tournaments" className="btn btn-ghost mt-6 inline-block">Browse Tournaments</Link>
      </div>
    )
  }

  const reg = inv.registrations
  const tourney = reg.tournaments
  const sb = supabaseServer()
  const {data:{user}} = await sb.auth.getUser()

  // If not signed in, show sign-in prompt
  if(!user){
    return (
      <div className="wrap max-w-lg py-16">
        <div className="panel border-accent text-center">
          <span className="badge badge-open">Team Invite</span>
          <h1 className="my-2 text-3xl font-extrabold">{reg.team_name}</h1>
          <p className="text-sm text-muted">You’ve been invited to join the roster for <b>{tourney.name}</b> ({tourney.game}).</p>
          <div className="my-4 border-y border-line py-3 text-xs text-neutral-400">
            Role: <b className="uppercase text-white">{inv.role}</b> · Event Date: <b className="text-white">{fmtDate(tourney.starts_at)}</b>
          </div>
          <p className="mb-5 text-sm text-neutral-300">Please sign in or create an account to accept your roster spot.</p>
          <div className="flex flex-col gap-2">
            <Link href={`/login?next=/join/${token}`} className="btn w-full">Sign In to Accept</Link>
            <Link href={`/signup?next=/join/${token}`} className="btn btn-ghost w-full">Create an Account</Link>
          </div>
        </div>
      </div>
    )
  }

  // If already accepted by this user
  if(inv.status === 'accepted' && inv.user_id === user.id){
    redirect('/account/registrations')
  }

  // Check if user has already accepted another team for this same tournament
  const {data:existing} = await db.from('registration_members')
    .select('id, registrations(tournament_id, team_name, status)')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  const conflict = (existing||[]).find(e => 
    e.registrations?.tournament_id === tourney.id &&
    !['rejected', 'withdrawn'].includes(e.registrations?.status)
  )

  if(conflict){
    return (
      <div className="wrap max-w-lg py-16">
        <div className="panel border-live text-center">
          <span className="badge badge-live">Fair-play Conflict</span>
          <h1 className="my-2 text-3xl font-extrabold">Already Registered</h1>
          <p className="text-neutral-300">
            You are already confirmed on the roster for <b>{conflict.registrations?.team_name}</b> in <b>{tourney.name}</b>.
          </p>
          <p className="mt-2 text-xs text-muted">A player cannot be on two active rosters for the same tournament.</p>
          <Link href="/account/registrations" className="btn mt-6 inline-block">Go to My Dashboard</Link>
        </div>
      </div>
    )
  }

  // Get user profile for gamertag default
  const {data:profile} = await sb.from('profiles').select('gamertag, country').eq('id', user.id).maybeSingle()

  return (
    <div className="wrap max-w-lg py-16">
      <div className="panel">
        <div className="mb-4">
          <span className="badge badge-open">Roster Invite</span>
          <h1 className="mt-2 text-3xl font-extrabold">{reg.team_name}</h1>
          <p className="text-sm text-muted">Tournament: <b>{tourney.name}</b> ({tourney.game})</p>
          <p className="text-xs text-neutral-400 mt-1">Invited position: <b className="uppercase text-accent">{inv.role}</b></p>
        </div>

        <JoinTeamForm
          token={token}
          teamName={reg.team_name}
          tournamentName={tourney.name}
          defaultGamertag={profile?.gamertag||''}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
