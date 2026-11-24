import {fmtTime} from '@/lib/format'
import {Badge} from '@/components/ui/badge'

export default function Match({m, compact}){
  const live = m.status === 'live'
  const done = m.score_a != null && m.score_b != null
  const badgeVariant = live ? 'live' : m.status === 'upcoming' ? 'accent' : 'outline'

  const scoreRow = (name, score, isWinner) => (
    <div className={`flex justify-between items-center px-3 py-2 font-semibold ${isWinner ? 'text-accent' : 'text-neutral-200'}`}>
      <span className="truncate pr-2">{name}</span>
      <span className="font-display text-xl font-extrabold shrink-0">{score ?? '–'}</span>
    </div>
  )

  return (
    <div className={`border border-line bg-surface transition-colors hover:border-neutral-700 ${compact ? 'min-w-[250px]' : 'border-l-[3px]'} ${live ? 'border-l-live' : ''}`}>
      <div className="flex justify-between items-center px-3 pt-3 pb-1 text-xs text-muted">
        <span>{m.starts_at ? fmtTime(m.starts_at) : ''}</span>
        <Badge variant={badgeVariant}>
          {m.status}
        </Badge>
      </div>
      {scoreRow(m.team_a, m.score_a, done && m.score_a > m.score_b)}
      <div className="border-t border-line/60" />
      {scoreRow(m.team_b, m.score_b, done && m.score_b > m.score_a)}
    </div>
  )
}
