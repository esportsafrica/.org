export const kes=n=>'KSh '+Number(n||0).toLocaleString('en-KE')
const tz='Africa/Nairobi'
export const fmtDate=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:tz})
export const fmtTime=d=>new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:tz}).toUpperCase()
export const toLocalInput=d=>d?new Date(new Date(d).getTime()+3*3600e3).toISOString().slice(0,16):''
export const fromLocalInput=v=>new Date(v+':00+03:00').toISOString()
// Approximate display rates per 1 KES. Update as needed; payouts are always settled in KES.
export const RATES={KES:1,USD:0.0077,NGN:11.6,ZAR:0.14}
export const money=(kesAmount,cur)=>{const v=kesAmount*RATES[cur];return (cur==='KES'?'KSh ':cur+' ')+Math.round(v).toLocaleString('en-US')}
