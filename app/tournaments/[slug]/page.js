import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import Reveal from '@/components/Reveal'
import SectionHead from '@/components/SectionHead'
import PrizeBreakdown from '@/components/PrizeBreakdown'
import RulesAccordion from '@/components/RulesAccordion'
import RegisterModal from '@/components/RegisterModal'
import LFTBoard from '@/components/LFTBoard'
import {getTournament} from '@/lib/queries'
import {supabaseServer} from '@/lib/supabase/server'
import {kes,fmtDate,fmtTime} from '@/lib/format'
import LocalTime from '@/components/LocalTime'

export const dynamic='force-dynamic'

export async function generateMetadata({params}){
  const t=await getTournament(params.slug)
  return{title:t?`${t.name} · Esports Africa`:'Tournament'}
}

export default async function Detail({params}){
  const t=await getTournament(params.slug)
  if(!t)notFound()
  
  const sb=supabaseServer()
  const {data:{user}}=await sb.auth.getUser()
  const {data:p}=user?await sb.from('profiles').select('*').eq('id',user.id).maybeSingle():{data:null}

  const isTeamAllowed = ['team','both'].includes(t.entry_type)
  const formatDesc = t.entry_type === 'team'
    ? `Team (${t.min_roster_size}${t.max_roster_size > t.min_roster_size ? `-${t.max_roster_size}` : ''} players)`
    : t.entry_type === 'both'
    ? `Solo or Team (${t.min_roster_size}-${t.max_roster_size} players)`
    : 'Solo (1v1)'

  let lftPosts = []
  if(isTeamAllowed){
    const {data:posts} = await sb.from('lft_posts')
      .select('*')
      .eq('tournament_id', t.id)
      .eq('status', 'active')
      .order('created_at', {ascending: false})
    lftPosts = posts || []
  }

  const userPost = user ? lftPosts.find(x => x.user_id === user.id) : null

  return (
    <div className="wrap py-10">
      <Reveal className="mb-8 grid gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
        <div className="relative aspect-[4/5] border border-line bg-[#151515]">
          {t.poster_url && <Image src={t.poster_url} alt={`${t.name} poster`} fill sizes="340px" priority className="object-cover"/>}
        </div>
        <div>
          <div className="tag">{t.game} · {t.mode} · {t.entry_type||'solo'}</div>
          <h1 className="my-3 text-[clamp(44px,8vw,88px)] font-extrabold">{t.name}</h1>
          {t.description && <p className="mb-5 max-w-xl text-neutral-400">{t.description}</p>}
          
          {[
            ['Date', fmtDate(t.starts_at)],
            ['Tip-off', fmtTime(t.starts_at)],
            ['Location', t.venue||'Online'],
            ['Structure', t.format||'—'],
            ['Roster Format', formatDesc],
            ['Entry fee', kes(t.entry_fee_kes)],
            ['Max entries', t.max_teams||'Open']
          ].map(([k,v]) => (
            <div key={k} className="row">{k}<b>{v}</b></div>
          ))}
          
          <p className="mt-2 text-xs text-muted">
            Times are East Africa Time (EAT).<LocalTime iso={t.starts_at}/>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <RegisterModal
              t={t}
              userId={user?.id}
              defaults={{gamertag:p?.gamertag, discord:p?.discord, country:p?.country, email:user?.email}}
            />
            <Link href="/tickets" className="btn btn-ghost">Spectator tickets</Link>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <SectionHead a="Prize" b="pool"/>
          <div className="panel">
            <p className="mb-4 font-display text-4xl font-extrabold text-accent">{kes(t.prize_pool_kes)}</p>
            <PrizeBreakdown pool={t.prize_pool_kes} tiers={t.prize_tiers||[]}/>
          </div>
        </div>

        <div>
          <SectionHead a="Rules &amp;" b="eligibility"/>
          <RulesAccordion rules={t.rules||[]}/>
        </div>
      </div>

      {/* Free Agent Board for team tournaments */}
      {isTeamAllowed && (
        <div className="mt-12">
          <SectionHead a="Recruitment &amp;" b="Free Agents"/>
          <LFTBoard
            tournamentId={t.id}
            userId={user?.id}
            posts={lftPosts}
            userPost={userPost}
            defaultGamertag={p?.gamertag||''}
            defaultCountry={p?.country||'Kenya'}
            defaultDiscord={p?.discord||''}
          />
        </div>
      )}
    </div>
  )
}
