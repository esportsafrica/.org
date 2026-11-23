import TicketShop from '@/components/TicketShop'
import SectionHead from '@/components/SectionHead'
import {getTiers} from '@/lib/queries'
import {supabaseServer} from '@/lib/supabase/server'
export const metadata={title:'Tickets · Esports Africa'}
export const dynamic='force-dynamic'
export default async function Tickets(){
  const {data:{user}}=await supabaseServer().auth.getUser()
  return <div className="wrap py-10"><SectionHead a="Spectator" b="tickets"/><TicketShop tiers={await getTiers()} user={!!user}/></div>
}
