import {requireAdmin} from '@/lib/auth'
import {fmtDate,fmtTime} from '@/lib/format'
import {checkIn} from '../../actions'
import CameraScan from '@/components/CameraScan'
const MSG={ok:['Valid. Admit entry ✓','text-win'],used:['Already used. Do not admit','text-live'],void:['Ticket voided. Do not admit','text-live'],invalid:['Code not found','text-live']}
export default async function CheckIn({searchParams}){
  const {sb}=await requireAdmin();const {r,code}=searchParams
  const {data:t}=code?await sb.from('tickets').select('*, tournaments(name,starts_at), ticket_tiers(name)').eq('code',code).maybeSingle():{data:null}
  return <><h1 className="mb-6 text-5xl font-extrabold">Gate check-in</h1>
    <form action={checkIn} className="flex max-w-md gap-2"><input id="code" name="code" autoFocus required placeholder="Scan or type ticket code" className="input font-mono uppercase"/><button className="btn">Check in</button></form>
    <CameraScan inputId="code"/>
    <p className="mt-2 text-xs text-muted">USB/Bluetooth barcode scanners type the code and press Enter automatically.</p>
    {r&&<div className="panel mt-6 max-w-md"><p className={`font-display text-3xl font-extrabold uppercase ${MSG[r][1]}`}>{MSG[r][0]}</p>
      {t&&<div className="mt-3 text-sm text-neutral-300"><b>{t.ticket_tiers?.name}</b> · {t.holder_name}<br/>{t.tournaments?.name} · {fmtDate(t.tournaments?.starts_at)} {fmtTime(t.tournaments?.starts_at)}<br/><span className="font-mono text-accent">{t.code}</span>{t.checked_in_at&&<><br/>Checked in {fmtDate(t.checked_in_at)} {fmtTime(t.checked_in_at)}</>}</div>}</div>}</>
}
