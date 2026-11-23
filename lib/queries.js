import {supabaseServer} from './supabase/server'
const on=()=>!!process.env.NEXT_PUBLIC_SUPABASE_URL&&!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export async function listTournaments(){if(!on())return[];const{data}=await supabaseServer().from('tournaments').select('*').neq('status','draft').order('starts_at');return data||[]}
export async function getTournament(slug){if(!on())return null;const{data}=await supabaseServer().from('tournaments').select('*').eq('slug',slug).maybeSingle();return data}
export async function getFeatured(){const l=await listTournaments();return l.find(t=>t.status==='live')||l.find(t=>t.status==='open')||l[0]||null}
export async function getMatches(tid){if(!on()||!tid)return[];const{data}=await supabaseServer().from('matches').select('*').eq('tournament_id',tid).order('starts_at',{nullsFirst:false});return data||[]}
export async function recentMatches(n=6){if(!on())return[];const{data}=await supabaseServer().from('matches').select('*').order('starts_at',{ascending:false,nullsFirst:false}).limit(n);return data||[]}
export async function getTiers(){if(!on())return[];const{data}=await supabaseServer().from('ticket_tiers').select('*, tournaments(name,slug)').eq('active',true).order('price_kes');return data||[]}
export {standings} from './standings.mjs'
export async function listSponsors(){if(!on())return[];const{data}=await supabaseServer().from('sponsors').select('*').order('sort');return data||[]}
export async function listPosts(n=20){if(!on())return[];const{data}=await supabaseServer().from('posts').select('*').eq('published',true).order('created_at',{ascending:false}).limit(n);return data||[]}
export async function getPost(slug){if(!on())return null;const{data}=await supabaseServer().from('posts').select('*').eq('slug',slug).eq('published',true).maybeSingle();return data}
export async function rankings(){
  if(!on())return[];const{data}=await supabaseServer().from('matches').select('team_a,team_b,score_a,score_b').eq('status','final')
  const r={};const g=n=>r[n]??={t:n,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}
  for(const m of data||[]){if(m.score_a==null||m.score_b==null||m.team_a==='TBD'||m.team_b==='TBD')continue;const a=g(m.team_a),b=g(m.team_b);a.p++;b.p++;a.gf+=m.score_a;a.ga+=m.score_b;b.gf+=m.score_b;b.ga+=m.score_a
    if(m.score_a>m.score_b){a.w++;b.l++;a.pts+=3}else if(m.score_a<m.score_b){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}}
  return Object.values(r).sort((x,y)=>y.pts-x.pts||(y.gf-y.ga)-(x.gf-x.ga))
}
