import TournamentGrid from '@/components/TournamentGrid'
import SectionHead from '@/components/SectionHead'
import {listTournaments} from '@/lib/queries'
export const metadata={title:'Tournaments · Esports Africa'}
export const dynamic='force-dynamic'
export default async function Tournaments(){
  return <div className="wrap py-10"><SectionHead a="Tournaments &amp;" b="registration"/><TournamentGrid items={await listTournaments()}/></div>
}
