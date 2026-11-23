'use client'
import {useState} from 'react'
import {createTeamInvite,removeTeamMember,submitRosterReady} from '@/app/account/actions'

export default function TeamRosterManager({reg,isCaptain,currentUserId}){
  const t = reg.tournaments || {}
  const members = reg.registration_members || []
  const [copyMsg,setCopyMsg] = useState('')
  const [role,setRole] = useState('starter')

  const minRoster = t.min_roster_size || 1
  const maxRoster = t.max_roster_size || 5
  const acceptedMembers = members.filter(m => m.status === 'accepted')
  const pendingInvites = members.filter(m => m.status === 'invited')
  const totalRosterCount = acceptedMembers.length + pendingInvites.length

  const canAddMore = totalRosterCount < maxRoster
  const hasMinRoster = acceptedMembers.length >= minRoster
  const isLocked = reg.roster_locked

  // Find any active shareable invite token for quick copying
  const activeInvite = pendingInvites.find(i => i.invite_token)

  function copyInviteLink(token){
    if(!token) return
    const url = `${window.location.origin}/join/${token}`
    navigator.clipboard.writeText(url)
    setCopyMsg('Link copied!')
    setTimeout(()=>setCopyMsg(''), 2500)
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-display text-lg font-bold uppercase tracking-wider text-white">
          Team Roster ({acceptedMembers.length}/{minRoster} required · max {maxRoster})
        </h4>
        {isLocked ? (
          <span className="badge badge-live">🔒 Roster Locked</span>
        ) : (
          <span className="badge badge-open">Roster Open</span>
        )}
      </div>

      {/* Roster members list */}
      <div className="mt-3 divide-y divide-line/40 rounded-sm border border-line bg-black/30">
        {members.map(m => {
          const isMe = m.user_id === currentUserId
          const isPending = m.status === 'invited'

          return (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-2.5">
                <span className={`badge ${m.role==='captain'?'badge-accent text-black font-bold':m.role==='starter'?'badge-open':'badge-up'}`}>
                  {m.role}
                </span>
                <div>
                  <b className="text-white">
                    {m.gamertag || (m.invite_email ? `Invited: ${m.invite_email}` : 'Pending Invite Link')}
                  </b>
                  {isMe && <span className="ml-2 text-xs text-accent">(You)</span>}
                  {isPending && <p className="text-xs text-muted">Awaiting confirmation…</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPending && isCaptain && !isLocked && m.invite_token && (
                  <button
                    type="button"
                    onClick={()=>copyInviteLink(m.invite_token)}
                    className="btn btn-ghost btn-sm text-xs"
                  >
                    Copy Link
                  </button>
                )}

                {isCaptain && !isLocked && m.role !== 'captain' && (
                  <form action={removeTeamMember}>
                    <input type="hidden" name="registration_id" value={reg.id}/>
                    <input type="hidden" name="member_id" value={m.id}/>
                    <button type="submit" className="text-xs text-live hover:underline">
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {copyMsg && <p className="mt-2 text-xs text-win">{copyMsg}</p>}

      {/* Captain Invite Actions */}
      {isCaptain && !isLocked && (
        <div className="mt-4 space-y-3 rounded-sm border border-dashed border-line p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Invite Teammate</p>
          
          {canAddMore ? (
            <form action={createTeamInvite} className="flex flex-wrap gap-2">
              <input type="hidden" name="registration_id" value={reg.id}/>
              
              <select
                name="role"
                value={role}
                onChange={e=>setRole(e.target.value)}
                className="input max-w-[130px] text-xs"
              >
                <option value="starter">Starter</option>
                <option value="sub">Substitute</option>
              </select>

              <input
                type="email"
                name="email"
                placeholder="Teammate email (or leave blank for link)"
                className="input min-w-[200px] flex-1 text-xs"
              />

              <button type="submit" className="btn btn-sm">
                Generate Invite
              </button>
            </form>
          ) : (
            <p className="text-xs text-muted">Maximum roster limit ({maxRoster}) reached.</p>
          )}

          {activeInvite && (
            <div className="flex items-center justify-between gap-2 border-t border-line/40 pt-2 text-xs text-neutral-300">
              <span className="truncate">Active share link available</span>
              <button
                type="button"
                onClick={()=>copyInviteLink(activeInvite.invite_token)}
                className="btn btn-ghost btn-sm text-xs text-accent"
              >
                Copy Shareable Link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Captain Roster Submit Gate */}
      {isCaptain && !reg.ready && !isLocked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="text-xs text-neutral-400">
            {hasMinRoster ? (
              <span className="text-win">✓ Roster meets minimum size ({minRoster} players).</span>
            ) : (
              <span className="text-live">Need {minRoster - acceptedMembers.length} more confirmed member(s) before submission.</span>
            )}
          </div>
          <form action={submitRosterReady}>
            <input type="hidden" name="registration_id" value={reg.id}/>
            <button
              type="submit"
              disabled={!hasMinRoster}
              className="btn btn-sm"
            >
              Confirm Roster Ready
            </button>
          </form>
        </div>
      )}

      {isLocked && (
        <p className="mt-3 text-xs text-muted">
          Roster is locked. If your team needs an emergency substitution, contact the admin organizers.
        </p>
      )}
    </div>
  )
}
