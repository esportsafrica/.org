import {standings} from './standings.mjs'
export const STEPS=['Submitted','Approved','Fee paid','Live','Completed']
export function stepIndex(r,t){
  if(r.status==='pending')return 0
  if(r.status!=='approved')return -1
  let i=1;if(r.paid||!t.entry_fee_kes)i=2
  if(i===2&&t.status==='live')i=3
  if(t.status==='completed')i=4
  return i
}
const names=r=>[r.team_name,...r.gamertags].filter(Boolean).map(s=>s.toLowerCase())
export function myMatches(r,ms){const n=names(r);return ms.filter(m=>n.includes(m.team_a.toLowerCase())||n.includes(m.team_b.toLowerCase()))}
export function myRecord(r,ms){
  const n=names(r),rec={w:0,d:0,l:0}
  myMatches(r,ms).filter(m=>m.status==='final'&&m.score_a!=null).forEach(m=>{const a=n.includes(m.team_a.toLowerCase()),[f,g]=a?[m.score_a,m.score_b]:[m.score_b,m.score_a];f>g?rec.w++:f<g?rec.l++:rec.d++})
  return rec
}
export function myStanding(r,ms){
  const n=names(r)
  for(const [g,rows] of standings(ms)){const i=rows.findIndex(x=>n.includes(x.t.toLowerCase()));if(i>=0)return {group:g,pos:i+1,of:rows.length,pts:rows[i].pts}}
  return null
}
