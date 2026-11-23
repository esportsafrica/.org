import Link from 'next/link'
import {supabaseServer} from '@/lib/supabase/server'
import Stepper from '@/components/Stepper'
import Match from '@/components/Match'
import PayButton from '@/components/PayButton'
import TeamRosterManager from '@/components/TeamRosterManager'
import {stepIndex,myMatches,myRecord,myStanding} from '@/lib/progress.mjs'
import {kes,fmtDate} from '@/lib/format'
import {withdrawRegistration} from '../actions'

export const metadata={title:'My registrations · Esports Africa'}

export default async function Regs({searchParams}){
  const sb=supabaseServer()
  const {data:{user}}=await sb.auth.getUser()

  // 1. Fetch registrations where user is captain
  const {data:captainRegs}=await sb.from('registrations')
    .select('*, tournaments(*), registration_members(*)')
    .eq('user_id',user.id)
    .order('created_at',{ascending:false})

  // 2. Fetch memberships where user is an accepted member
  const {data:memberships}=await sb.from('registration_members')
    .select('*, registrations(*, tournaments(*), registration_members(*))')
    .eq('user_id',user.id)
    .eq('status','accepted')

  // Merge and dedup by registration id
  const regMap=new Map()
  for(const r of captainRegs||[]){
    regMap.set(r.id, r)
  }
  for(const m of memberships||[]){
    if(m.registrations && !regMap.has(m.registrations.id)){
      regMap.set(m.registrations.id, m.registrations)
    }
  }

  const regs = Array.from(regMap.values()).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))

  const ids=[...new Set(regs.map(r=>r.tournament_id))]
  const {data:ms}=ids.length?await sb.from('matches').select('*').in('tournament_id',ids).order('starts_at'):{data:[]}

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">My Registrations</h1>
        {searchParams?.joined && (
          <span className="badge badge-open">Joined Team Successfully ✓</span>
        )}
      </div>

      <div className="space-y-5">
        {regs.map(r => {
          const t = r.tournaments
          const isCaptain = r.user_id === user.id
          const myMemberRow = (r.registration_members||[]).find(m => m.user_id === user.id)
          const all = (ms||[]).filter(m => m.tournament_id === t.id)
          const mine = myMatches(r, all)
          const rec = myRecord(r, all)
          const st = myStanding(r, all)
          const idx = stepIndex(r, t)

          return (
            <article key={r.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/tournaments/${t.slug}`} className="font-display text-3xl font-bold uppercase hover:text-accent">
                      {t.name}
                    </Link>
                    <span className="badge">{r.type==='team'?'Team':'Solo'}</span>
                    {r.type==='team' && (
                      <span className={`badge ${isCaptain?'badge-open':'badge-up'}`}>
                        {isCaptain?'Captain':'Teammate'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {r.team_name || r.gamertags[0]} · {fmtDate(t.starts_at)} · {t.venue||'Online'}
                  </p>
                  {!isCaptain && myMemberRow && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Playing as: <b className="text-white">{myMemberRow.gamertag}</b> ({myMemberRow.role})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${r.status==='approved'?'badge-open':r.status==='rejected'?'badge-live':r.status==='pending'?'badge-up':''}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              {idx >= 0 && <Stepper index={idx}/>}

              {r.status === 'rejected' && (
                <p className="mt-2 text-sm text-neutral-400">
                  This entry wasn’t accepted. Contact the organisers if you think this is a mistake.
                </p>
              )}

              {/* Fee payment (only Captain or Solo player pays) */}
              {r.status === 'approved' && !r.paid && t.entry_fee_kes > 0 && (
                <div className="mt-3 space-y-1.5">
                  {isCaptain ? (
                    <>
                      <PayButton id={r.id} amount={kes(t.entry_fee_kes)}/>
                      {r.approved_at && (
                        <p className="text-xs text-accent">
                          Pay by {fmtDate(new Date(new Date(r.approved_at).getTime()+72*3600e3))} or your slot is released.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="rounded-sm border border-line bg-black/30 p-2.5 text-xs text-muted">
                      Entry fee of {kes(t.entry_fee_kes)} will be finalized by your team captain.
                    </p>
                  )}
                </div>
              )}

              {r.checked_in && <p className="mt-2 text-sm text-win">Checked in for match day ✓</p>}
              {r.status === 'approved' && r.paid && <p className="mt-2 text-sm text-win">Entry fee paid ✓. Team is confirmed.</p>}

              {/* Team roster view */}
              {r.type === 'team' && (
                <TeamRosterManager
                  reg={r}
                  isCaptain={isCaptain}
                  currentUserId={user.id}
                />
              )}

              {/* Record & Matches */}
              {(mine.length > 0 || st) && (
                <div className="mt-4 border-t border-line pt-4">
                  <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>Record <b className="text-accent">{rec.w}W {rec.d}D {rec.l}L</b></span>
                    {st && <span>Group {st.group}: <b className="text-accent">{st.pos}/{st.of}</b> · {st.pts} pts</span>}
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {mine.map(m => (
                      <div key={m.id} className="shrink-0">
                        <Match m={m} compact/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.paid && r.status === 'approved' && (
                <p className="mt-3 text-xs text-muted">
                  Need to withdraw after paying? Contact the organisers for a refund.
                </p>
              )}

              {isCaptain && ['pending','approved'].includes(r.status) && !r.paid && (
                <form action={withdrawRegistration} className="mt-3">
                  <input type="hidden" name="id" value={r.id}/>
                  <button className="text-sm text-muted underline hover:text-white">
                    Withdraw entry
                  </button>
                </form>
              )}
            </article>
          )
        })}
      </div>

      {!regs?.length && (
        <>
          <p className="mb-4 text-muted">You haven’t registered for a tournament or joined a team yet.</p>
          <Link href="/tournaments" className="btn">Browse tournaments</Link>
        </>
      )}
    </>
  )
}
