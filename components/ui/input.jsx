import * as React from 'react'
import {cn} from '@/lib/utils'

/**
 * Input component following shadcn/ui accessibility standards
 * min-h-[44px] and 16px font-size prevent iOS zoom and guarantee WCAG touch target compliance
 */
const Input = React.forwardRef(({className, type, ...props}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex min-h-[44px] w-full rounded-sm border border-line bg-bg px-3 py-2 text-[16px] sm:text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export {Input}
