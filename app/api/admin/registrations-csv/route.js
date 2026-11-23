import {requireAdmin} from '@/lib/auth'
export async function GET(){
  const {sb}=await requireAdmin()
  const {data}=await sb.from('registrations').select('*, tournaments(name)').order('created_at',{ascending:false})
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`
  const rows=[['Tournament','Type','Team','Gamertags','Country','Discord','Email','Status','Paid','Registered'],...(data||[]).map(r=>[r.tournaments?.name,r.type,r.team_name,r.gamertags.join(' / '),r.country,r.discord,r.contact_email,r.status,r.paid,r.created_at])]
  return new Response(rows.map(r=>r.map(q).join(',')).join('\n'),{headers:{'Content-Type':'text/csv','Content-Disposition':'attachment; filename="registrations.csv"'}})
}
