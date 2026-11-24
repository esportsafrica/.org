import * as React from 'react'
import {cn} from '@/lib/utils'

/**
 * Button component following shadcn/ui variants & accessibility patterns
 */
const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className = '',
} = {}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold whitespace-nowrap rounded-sm text-sm transition-[transform,background-color,color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none touch-manipulation will-change-transform'

  const variants = {
    default: 'bg-primary text-primary-foreground border border-primary hover:bg-transparent hover:text-accent',
    accent: 'bg-accent text-black border border-accent hover:bg-transparent hover:text-accent',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive',
    outline: 'border border-line bg-transparent hover:border-white hover:text-white text-neutral-300',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-line',
    ghost: 'hover:bg-white/10 hover:text-white text-neutral-300',
    link: 'text-accent underline-offset-4 hover:underline p-0 h-auto active:scale-100',
  }

  const sizes = {
    default: 'min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base',
    sm: 'min-h-[36px] px-3 py-1 text-xs sm:text-sm',
    lg: 'min-h-[50px] px-8 py-3.5 text-base sm:text-lg',
    icon: 'h-10 w-10 min-h-[40px] p-0',
  }

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)
}

const Button = React.forwardRef(({className, variant = 'default', size = 'default', asChild = false, ...props}, ref) => {
  return (
    <button
      className={buttonVariants({variant, size, className})}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export {Button, buttonVariants}
