'use client'
import {useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {kes, fmtDate, fmtTime} from '@/lib/format'
import {Badge} from '@/components/ui/badge'

const badgeConfig = {
  open: {variant: 'win', label: 'Registration Open'},
  live: {variant: 'live', label: 'Live'},
  completed: {variant: 'outline', label: 'Completed'},
  draft: {variant: 'outline', label: 'Draft'},
}

export default function FeaturedTournament({t, priority}){
  const [ready, setReady] = useState(false)
  const statusBadge = badgeConfig[t.status] || badgeConfig.open

  return (
    <article className="grid border border-line bg-surface md:grid-cols-[minmax(0,380px)_1fr] transition-colors hover:border-neutral-700">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#151515]">
        <div className="absolute inset-0 animate-shim bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,.07)_50%,transparent_70%)] bg-[length:200%_100%]"/>
        {t.poster_url && (
          <Image
            src={t.poster_url}
            alt={`${t.name} poster`}
            fill
            sizes="(min-width:768px) 380px, 100vw"
            priority={priority}
            onLoad={() => setReady(true)}
            className={`object-cover transition-opacity duration-300 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>

      <div className="flex flex-col justify-center p-6 md:p-8">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-display text-sm font-bold uppercase tracking-widest text-accent">
            {t.game}
          </span>
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>

        <h3 className="my-3 text-[clamp(34px,5vw,56px)]">
          {t.name}
        </h3>

        <div className="space-y-1">
          {[
            ['Date & tip-off', `${fmtDate(t.starts_at)} · ${fmtTime(t.starts_at)}`],
            ['Venue', t.venue || 'Online'],
            ['Prize pool', kes(t.prize_pool_kes)],
            ['Registration fee', kes(t.entry_fee_kes)],
          ].map(([k, v]) => (
            <div key={k} className="row">
              {k}
              <b>{v}</b>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/tournaments/${t.slug}`} className="btn">
            {t.status === 'open' ? 'Register Now' : 'View Details'}
          </Link>
          <Link href="/tickets" className="btn btn-ghost">
            Spectator Tickets
          </Link>
        </div>
      </div>
    </article>
  )
}
