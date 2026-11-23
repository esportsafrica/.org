import {requireAdmin} from '@/lib/auth'
import {toLocalInput} from '@/lib/format'
import {saveMatch,deleteMatch,generateGroups,generateKnockout} from '../../actions'
const STAGES=['group','quarter','semi','final'],ST=['upcoming','live','final']
function Fields({m,tid}){return <>
  <input type="hidden" name="id" value={m?.id||''}/><input type="hidden" name="tournament_id" value={tid}/>
  <select name="stage" defaultValue={m?.stage||'group'} className="input w-28">{STAGES.map(s=><option key={s}>{s}</option>)}</select>
  <input name="group_label" defaultValue={m?.group_label||''} placeholder="Grp" className="input w-16"/>
  <input name="team_a" defaultValue={m?.team_a} required placeholder="Team A" className="input w-40"/><input name="score_a" type="number" defaultValue={m?.score_a??''} className="input w-16"/>
  <input name="score_b" type="number" defaultValue={m?.score_b??''} className="input w-16"/><input name="team_b" defaultValue={m?.team_b} required placeholder="Team B" className="input w-40"/>
  <select name="status" defaultValue={m?.status||'upcoming'} className="input w-28">{ST.map(s=><option key={s}>{s}</option>)}</select>
  <input type="datetime-local" name="starts_at" defaultValue={toLocalInput(m?.starts_at)} className="input w-52"/></>}
export default async function Matches({searchParams}){
  const {sb}=await requireAdmin();const {data:ts}=await sb.from('tournaments').select('id,name').order('starts_at',{ascending:false})
  const tid=searchParams.t||ts?.[0]?.id;const {data:ms}=tid?await sb.from('matches').select('*').eq('tournament_id',tid).order('starts_at',{nullsFirst:false}):{data:[]}
  return <><h1 className="mb-4 text-5xl font-extrabold">Matches &amp; scores</h1>{searchParams.msg&&<p role="status" className="panel mb-4 text-sm text-accent">{searchParams.msg}</p>}
    <form className="mb-5 flex gap-2"><select name="t" defaultValue={tid} className="input max-w-sm">{(ts||[]).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select><button className="btn btn-ghost btn-sm">Open</button></form>
    {tid&&<><div className="space-y-2">{(ms||[]).map(m=><div key={m.id} className="flex flex-wrap items-center gap-2"><form action={saveMatch} className="flex flex-wrap items-center gap-2"><Fields m={m} tid={tid}/><button className="btn btn-sm">Save</button></form>
      <form action={deleteMatch}><input type="hidden" name="id" value={m.id}/><button className="btn btn-ghost btn-sm text-live">Delete</button></form></div>)}</div>
      <h2 className="mb-2 mt-8 text-3xl">Add match</h2><form action={saveMatch} className="flex flex-wrap items-center gap-2"><Fields tid={tid}/><button className="btn btn-sm">Add</button></form>
      <h2 className="mb-2 mt-8 text-3xl">Bracket generator</h2><div className="flex flex-wrap items-end gap-3"><form action={generateGroups} className="flex items-end gap-2"><input type="hidden" name="tournament_id" value={tid}/><div><label className="lbl">Groups</label><input name="groups" type="number" min="1" max="8" defaultValue="2" className="input w-20"/></div><button className="btn btn-sm">Draw groups from approved entries</button></form><form action={generateKnockout}><input type="hidden" name="tournament_id" value={tid}/><button className="btn btn-ghost btn-sm">Seed knockout from standings</button></form></div>
      <p className="mt-3 text-xs text-muted">Saving a score updates the public Live page instantly (Realtime).</p></>}</>
}
