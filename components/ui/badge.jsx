import * as React from 'react'
import {cn} from '@/lib/utils'

/**
 * Badge component following shadcn/ui variant system
 */
const badgeVariants = ({
  variant = 'default',
  className = '',
} = {}) => {
  const base =
    'inline-flex items-center rounded-sm border px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

  const variants = {
    default: 'border-line bg-surface text-neutral-300',
    secondary: 'border-line/60 bg-secondary text-secondary-foreground',
    destructive: 'border-live bg-live text-white',
    live: 'border-live bg-live text-white animate-pulse',
    win: 'border-win text-win bg-win/10',
    accent: 'border-accent text-accent bg-accent/10',
    outline: 'border-line text-neutral-400',
  }

  return cn(base, variants[variant] || variants.default, className)
}

function Badge({className, variant = 'default', ...props}) {
  return (
    <div className={badgeVariants({variant, className})} {...props} />
  )
}

export {Badge, badgeVariants}
