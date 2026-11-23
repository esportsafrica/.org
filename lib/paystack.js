/** Initialise a Paystack transaction. Returns the hosted checkout URL, or null when no key is configured. */
export async function paystackInit({email,total,reference,method,site,metadata}){
  const key=process.env.PAYSTACK_SECRET_KEY;if(!key)return null
  const r=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({email,amount:total*100,currency:'KES',reference,callback_url:`${site}/tickets/success`,channels:method==='mpesa'?['mobile_money']:['card'],metadata})})
  const j=await r.json();if(!j.status)throw new Error('Payment provider error');return j.data.authorization_url
}
export async function paystackVerify(reference){
  const key=process.env.PAYSTACK_SECRET_KEY;if(!key)return null
  const r=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${key}`},cache:'no-store'})
  const j=await r.json();return j.status?j.data:null
}
