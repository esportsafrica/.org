import * as React from 'react'
import {cn} from '@/lib/utils'

/**
 * Alert component following shadcn/ui compound patterns
 */
const alertVariants = ({variant = 'default', className = ''} = {}) => {
  const base = 'relative w-full rounded-sm border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground'
  
  const variants = {
    default: 'bg-surface border-line text-foreground',
    destructive: 'border-live/50 text-live bg-live/10 [&>svg]:text-live',
    warning: 'border-accent/50 text-accent bg-accent/10 [&>svg]:text-accent',
    success: 'border-win/50 text-win bg-win/10 [&>svg]:text-win',
  }

  return cn(base, variants[variant] || variants.default, className)
}

const Alert = React.forwardRef(({className, variant = 'default', ...props}, ref) => (
  <div
    ref={ref}
    role="alert"
    className={alertVariants({variant, className})}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef(({className, ...props}, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-display font-bold uppercase tracking-wider text-sm leading-none', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef(({className, ...props}, ref) => (
  <div
    ref={ref}
    className={cn('text-xs sm:text-sm text-neutral-300 [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export {Alert, AlertTitle, AlertDescription}
