import {requireAdmin} from '@/lib/auth'
import {fmtDate} from '@/lib/format'
import {setRegStatus,setRegPaid,toggleCheckin,updateRegistration,toggleRosterLock,adminSubstituteMember} from '../../actions'

const age=d=>d?Math.floor((Date.now()-new Date(d))/31557600000):null

export default async function Regs({searchParams}){
  const {sb}=await requireAdmin()
  const {data:ts}=await sb.from('tournaments').select('id,name').order('starts_at',{ascending:false})
  
  let q=sb.from('registrations')
    .select('*, tournaments(name, min_roster_size, max_roster_size), registration_members(*)')
    .order('created_at',{ascending:false})

  if(searchParams.t)q=q.eq('tournament_id',searchParams.t)
  if(searchParams.s)q=q.eq('status',searchParams.s)
  
  const {data}=await q

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">Registrations</h1>
      <a href="/api/admin/registrations-csv" className="btn btn-ghost">Export CSV</a>
    </div>

    <form className="mb-4 flex flex-wrap gap-2">
      <select name="t" defaultValue={searchParams.t||''} className="input max-w-xs">
        <option value="">All tournaments</option>
        {(ts||[]).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select name="s" defaultValue={searchParams.s||''} className="input max-w-[160px]">
        <option value="">Any status</option>
        {['pending','approved','rejected','withdrawn'].map(s=><option key={s}>{s}</option>)}
      </select>
      <button className="btn btn-ghost btn-sm">Filter</button>
    </form>

    <div className="space-y-4">
      {(data||[]).map(r => {
        const members = r.registration_members || []
        const accepted = members.filter(m => m.status === 'accepted')
        const isTeam = r.type === 'team'

        return (
          <div key={r.id} className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <b className="font-display text-2xl uppercase">{r.team_name||r.gamertags[0]}</b>
                  <span className="badge">{isTeam?'Team':'Solo'}</span>
                  {isTeam && (
                    <span className={`badge ${r.roster_locked?'badge-live':'badge-open'}`}>
                      {r.roster_locked?'🔒 Locked':'🔓 Open'}
                    </span>
                  )}
                  <span className={`badge ${r.status==='approved'?'badge-open':r.status==='rejected'?'badge-live':r.status==='pending'?'badge-up':''}`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-sm text-muted">
                  {r.tournaments?.name} · {r.country} · {fmtDate(r.created_at)}
                </p>

                {isTeam ? (
                  <p className="mt-1 text-sm text-neutral-300">
                    Roster: <b>{accepted.length}</b> confirmed / {r.tournaments?.min_roster_size||1} required · Captain: {r.contact_email}
                  </p>
                ) : (
                  <p className="text-sm">{r.gamertags.join(', ')} · {r.contact_email}{r.discord&&` · ${r.discord}`}</p>
                )}

                {r.dob && (
                  <p className="text-xs text-muted">
                    Captain Age: {age(r.dob)}
                    {age(r.dob) < 18 && (
                      <b className="text-accent"> · minor. Guardian: {r.guardian_name} ({r.guardian_phone})</b>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {isTeam && (
                  <form action={toggleRosterLock}>
                    <input type="hidden" name="id" value={r.id}/>
                    <input type="hidden" name="v" value={String(!r.roster_locked)}/>
                    <button className="btn btn-ghost btn-sm">
                      {r.roster_locked ? 'Unlock roster' : 'Lock roster'}
                    </button>
                  </form>
                )}
                <form action={setRegPaid}>
                  <input type="hidden" name="id" value={r.id}/>
                  <input type="hidden" name="paid" value={String(!r.paid)}/>
                  <button className="btn btn-ghost btn-sm">{r.paid?'Paid ✓':'Mark paid'}</button>
                </form>
                {r.status==='approved' && (
                  <form action={toggleCheckin}>
                    <input type="hidden" name="id" value={r.id}/>
                    <input type="hidden" name="v" value={String(!r.checked_in)}/>
                    <button className="btn btn-ghost btn-sm">{r.checked_in?'Checked in ✓':'Check in'}</button>
                  </form>
                )}
                <form action={setRegStatus} className="flex gap-1.5">
                  <input type="hidden" name="id" value={r.id}/>
                  <button name="status" value="approved" className="btn btn-sm">Approve</button>
                  <button name="status" value="rejected" className="btn btn-ghost btn-sm">Reject</button>
                </form>
              </div>
            </div>

            {/* Team Roster Inspector & Emergency Substitutions */}
            {isTeam && members.length > 0 && (
              <details className="mt-3 rounded-sm border border-line/60 bg-black/40 p-3">
                <summary className="cursor-pointer text-sm font-bold uppercase tracking-wider text-accent">
                  Inspect Team Roster ({members.length} members)
                </summary>
                <div className="mt-3 divide-y divide-line/30">
                  {members.map(m => (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
                      <div>
                        <span className={`badge mr-2 ${m.role==='captain'?'badge-accent text-black font-bold':m.role==='starter'?'badge-open':'badge-up'}`}>
                          {m.role}
                        </span>
                        <b className="text-white">{m.gamertag || m.invite_email || 'Unclaimed Invite'}</b>
                        <span className="ml-2 text-muted">({m.status})</span>
                        {m.dob && <span className="ml-2 text-neutral-400">Age: {age(m.dob)}{age(m.dob)<18&&` · Minor (${m.guardian_name})`}</span>}
                      </div>

                      {/* Admin emergency substitution / role toggle */}
                      <form action={adminSubstituteMember} className="flex items-center gap-1.5">
                        <input type="hidden" name="member_id" value={m.id}/>
                        <select name="role" defaultValue={m.role} className="input h-7 py-0 text-xs">
                          <option value="starter">Starter</option>
                          <option value="sub">Sub</option>
                          <option value="captain">Captain</option>
                        </select>
                        <button type="submit" className="btn btn-ghost btn-sm text-[11px]">
                          Save Role
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* General Edit Details */}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted">Edit details</summary>
              <form action={updateRegistration} className="mt-3 grid gap-2 sm:grid-cols-2">
                <input type="hidden" name="id" value={r.id}/>
                <input name="team_name" defaultValue={r.team_name||''} placeholder="Team name" className="input"/>
                <input name="country" defaultValue={r.country} className="input"/>
                <textarea name="gamertags" defaultValue={r.gamertags.join('\n')} rows={3} className="input"/>
                <div className="space-y-2">
                  <input name="discord" defaultValue={r.discord||''} placeholder="Discord" className="input"/>
                  <input name="contact_email" type="email" defaultValue={r.contact_email} className="input"/>
                </div>
                <button className="btn btn-sm sm:w-32">Save</button>
              </form>
            </details>
          </div>
        )
      })}
    </div>

    {!data?.length && <p className="mt-4 text-muted">No registrations match.</p>}
  </>
}
