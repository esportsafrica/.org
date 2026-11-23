import {requireAdmin} from '@/lib/auth'
import {toLocalInput} from '@/lib/format'
import {saveTournament} from '../../../actions'
const F=({l,children,span})=><div className={span?'sm:col-span-2':''}><label className="lbl">{l}</label>{children}</div>
export default async function Edit({params}){
  const {sb}=await requireAdmin();const isNew=params.id==='new'
  const t=isNew?{status:'draft',mode:'LAN',entry_type:'solo',min_roster_size:1,max_roster_size:1,rules:[],prize_tiers:[]}:(await sb.from('tournaments').select('*').eq('id',params.id).single()).data
  return <><h1 className="mb-6 text-5xl font-extrabold">{isNew?'New tournament':'Edit tournament'}</h1>
    <form action={saveTournament} className="panel grid gap-4 sm:grid-cols-2"><input type="hidden" name="id" value={isNew?'':t.id}/><input type="hidden" name="poster_url" value={t.poster_url||''}/>
      <F l="Name"><input name="name" defaultValue={t.name} required className="input"/></F><F l="Slug (URL)"><input name="slug" defaultValue={t.slug} required pattern="[a-z0-9-]+" className="input"/></F>
      <F l="Game"><input name="game" defaultValue={t.game} required className="input"/></F>
      <F l="Status"><select name="status" defaultValue={t.status} className="input">{['draft','open','live','completed'].map(s=><option key={s}>{s}</option>)}</select></F>
      <F l="Entry Format"><select name="entry_type" defaultValue={t.entry_type||'solo'} className="input"><option value="solo">Solo only (e.g. 1v1)</option><option value="team">Team only (Rosters required)</option><option value="both">Both (Solo & Team allowed)</option></select></F>
      <div className="grid grid-cols-2 gap-2"><F l="Min Roster"><input type="number" min="1" name="min_roster_size" defaultValue={t.min_roster_size||1} className="input"/></F><F l="Max Roster (with subs)"><input type="number" min="1" name="max_roster_size" defaultValue={t.max_roster_size||1} className="input"/></F></div>
      <F l="Starts (Nairobi time)"><input type="datetime-local" name="starts_at" defaultValue={toLocalInput(t.starts_at)} required className="input"/></F>
      <F l="Mode"><select name="mode" defaultValue={t.mode} className="input"><option>LAN</option><option>Online</option></select></F>
      <F l="Venue"><input name="venue" defaultValue={t.venue} className="input"/></F><F l="Format"><input name="format" defaultValue={t.format} className="input"/></F>
      <F l="Entry fee (KES)"><input type="number" name="entry_fee_kes" defaultValue={t.entry_fee_kes} className="input"/></F><F l="Prize pool (KES)"><input type="number" name="prize_pool_kes" defaultValue={t.prize_pool_kes} className="input"/></F>
      <F l="Max entries"><input type="number" name="max_teams" defaultValue={t.max_teams} className="input"/></F><F l="Stream embed URL"><input name="stream_url" defaultValue={t.stream_url} placeholder="https://player.twitch.tv/?channel=…&parent=yoursite.com" className="input"/></F>
      <F l="Description" span><textarea name="description" defaultValue={t.description} rows={3} className="input"/></F>
      <F l="Prize tiers: one per line, “Label | percent”" span><textarea name="prize_tiers" defaultValue={(t.prize_tiers||[]).map(p=>`${p.label} | ${p.pct}`).join('\n')} rows={5} className="input"/></F>
      <F l="Rules: one per line, “Title | text”" span><textarea name="rules" defaultValue={(t.rules||[]).map(r=>`${r.title} | ${r.body}`).join('\n')} rows={6} className="input"/></F>
      <F l="Poster image" span>{t.poster_url&&<p className="mb-1 truncate text-xs text-muted">Current: {t.poster_url}</p>}<input type="file" name="poster" accept="image/*" className="input"/></F>
      <div className="sm:col-span-2"><button className="btn">Save tournament</button></div></form></>
}
