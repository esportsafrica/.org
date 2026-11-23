'use client'
import {useState} from 'react'
import {postLFT,deleteLFT} from '@/app/account/actions'

export default function LFTBoard({tournamentId,userId,posts=[],userPost,defaultGamertag='',defaultCountry='Kenya',defaultDiscord=''}){
  const [open,setOpen] = useState(false)
  const [busy,setBusy] = useState(false)

  return (
    <div className="panel border-line">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold uppercase">Free Agent Board (LFT)</h3>
          <p className="text-sm text-muted">
            Solo players looking to join a team for this tournament. Captains can recruit directly here.
          </p>
        </div>

        {userId && !userPost && (
          <button
            type="button"
            onClick={()=>setOpen(!open)}
            className="btn btn-ghost btn-sm"
          >
            {open ? 'Cancel' : '+ Post Looking for Team'}
          </button>
        )}
      </div>

      {/* Post Form */}
      {open && !userPost && (
        <form
          action={postLFT}
          onSubmit={()=>setBusy(true)}
          className="mt-4 space-y-3 rounded-sm border border-accent/40 bg-black/40 p-4"
        >
          <input type="hidden" name="tournament_id" value={tournamentId}/>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="lbl">Gamertag</label>
              <input name="gamertag" required defaultValue={defaultGamertag} placeholder="Your gamertag" className="input"/>
            </div>
            <div>
              <label className="lbl">Role / Main</label>
              <input name="role_preference" placeholder="e.g. Duelist, Striker, Support" className="input"/>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="lbl">Discord Username</label>
              <input name="discord" defaultValue={defaultDiscord} placeholder="discord#1234" className="input"/>
            </div>
            <div>
              <label className="lbl">Country</label>
              <input name="country" defaultValue={defaultCountry} className="input"/>
            </div>
          </div>

          <div>
            <label className="lbl">Short Bio / Experience</label>
            <textarea name="bio" rows={2} placeholder="e.g. Ranked Immortal 2 in Valorant, flexible schedule for scrims" className="input"/>
          </div>

          <button type="submit" disabled={busy} className="btn btn-sm">
            {busy ? 'Posting…' : 'Publish LFT Listing'}
          </button>
        </form>
      )}

      {/* User's own active post */}
      {userPost && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-accent bg-accent/10 p-3">
          <div>
            <span className="badge badge-accent text-black font-bold">Your Listing is Active</span>
            <p className="mt-1 text-sm font-bold text-white">
              {userPost.gamertag} {userPost.role_preference && `(${userPost.role_preference})`} · Discord: {userPost.discord||'None'}
            </p>
            {userPost.bio && <p className="text-xs text-neutral-300">{userPost.bio}</p>}
          </div>
          <form action={deleteLFT}>
            <input type="hidden" name="id" value={userPost.id}/>
            <button type="submit" className="text-xs text-live underline">
              Remove Listing
            </button>
          </form>
        </div>
      )}

      {/* List of LFT players */}
      <div className="mt-4 space-y-2">
        {posts.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted">
            No free agents listed yet. If you are looking for a team, post your details above!
          </p>
        ) : (
          posts.map(p => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface p-3">
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-white text-base">{p.gamertag}</b>
                  {p.role_preference && (
                    <span className="badge badge-open text-xs">{p.role_preference}</span>
                  )}
                  <span className="text-xs text-muted">({p.country})</span>
                </div>
                {p.bio && <p className="mt-1 text-xs text-neutral-300">{p.bio}</p>}
              </div>

              {p.discord && (
                <div className="text-right">
                  <span className="text-xs text-muted block">Discord</span>
                  <code className="text-xs text-accent font-mono">{p.discord}</code>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
