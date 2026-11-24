'use client'
import * as React from 'react'
import {cn} from '@/lib/utils'

const TabsContext = React.createContext({
  value: '',
  onValueChange: () => {},
})

/**
 * Tabs compound component following shadcn/ui accessibility patterns
 */
function Tabs({value: controlledValue, defaultValue, onValueChange, className, children, ...props}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback((newValue) => {
    if (!isControlled) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }, [isControlled, onValueChange])

  return (
    <TabsContext.Provider value={{value, onValueChange: handleValueChange}}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({className, ...props}, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      'inline-flex h-11 items-center justify-start rounded-sm border border-line bg-surface p-1 text-muted-foreground overflow-x-auto no-scrollbar',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({className, value, disabled, ...props}, ref) => {
  const context = React.useContext(TabsContext)
  const isSelected = context.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-xs px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none touch-manipulation',
        isSelected
          ? 'bg-accent text-black shadow-sm'
          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]',
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(({className, value, ...props}, ref) => {
  const context = React.useContext(TabsContext)
  if (context.value !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = 'TabsContent'

export {Tabs, TabsList, TabsTrigger, TabsContent}
