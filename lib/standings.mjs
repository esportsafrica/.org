export function standings(matches){
  const g={}
  matches.filter(m=>m.stage==='group').forEach(m=>{const k=m.group_label||'A';g[k]??={}
    for(const n of [m.team_a,m.team_b])g[k][n]??={t:n,p:0,w:0,d:0,l:0,gd:0,pts:0}
    if(m.status!=='final'||m.score_a==null||m.score_b==null)return
    const a=g[k][m.team_a],b=g[k][m.team_b];a.p++;b.p++;a.gd+=m.score_a-m.score_b;b.gd+=m.score_b-m.score_a
    if(m.score_a>m.score_b){a.w++;b.l++;a.pts+=3}else if(m.score_a<m.score_b){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}})
  return Object.entries(g).sort().map(([k,v])=>[k,Object.values(v).sort((x,y)=>y.pts-x.pts||y.gd-x.gd)])
}
