import {requireAdmin} from '@/lib/auth'
import {saveSponsor,deleteSponsor} from '../../actions'
const Form=({s})=><form action={saveSponsor} className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={s?.id||''}/><input name="name" defaultValue={s?.name} required placeholder="Name" className="input w-40"/><input name="url" defaultValue={s?.url||''} placeholder="https://…" className="input w-52"/><input name="sort" type="number" defaultValue={s?.sort??0} className="input w-20"/><input type="file" name="logo" accept="image/*" className="input w-60"/><button className="btn btn-sm">{s?'Save':'Add'}</button></form>
export default async function Sponsors(){
  const {sb}=await requireAdmin();const {data}=await sb.from('sponsors').select('*').order('sort')
  return <><h1 className="mb-6 text-5xl font-extrabold">Sponsors</h1><div className="space-y-2">{(data||[]).map(s=><div key={s.id} className="flex flex-wrap items-center gap-2">{s.logo_url&&<img src={s.logo_url} alt="" className="h-8 w-16 object-contain"/>}<Form s={s}/><form action={deleteSponsor}><input type="hidden" name="id" value={s.id}/><button className="btn btn-ghost btn-sm text-live">Delete</button></form></div>)}</div>
    <h3 className="mb-2 mt-6 text-2xl text-muted">Add sponsor</h3><Form/><p className="mt-3 text-xs text-muted">Shown on the homepage strip, ordered by the number. Use light/white logos on transparent backgrounds.</p></>
}
