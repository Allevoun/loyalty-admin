import type { ReactNode } from 'react'
import * as RTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string
  onValueChange: (v: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <RTabs.Root value={value} onValueChange={onValueChange} className={className}>
      {children}
    </RTabs.Root>
  )
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <RTabs.List
      className={cn('flex items-center gap-1 border-b border-border', className)}
    >
      {children}
    </RTabs.List>
  )
}

export function TabTrigger({
  value,
  children,
  count,
}: {
  value: string
  children: ReactNode
  count?: number
}) {
  return (
    <RTabs.Trigger
      value={value}
      className={cn(
        'relative -mb-px flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-[12.5px] font-medium text-text-muted transition-colors',
        'hover:text-text',
        'data-[state=active]:border-primary data-[state=active]:text-text',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      )}
    >
      {children}
      {count != null && (
        <span className="rounded-full bg-surface-3 px-1.5 text-[10.5px] tabular-nums text-text-muted">
          {count.toLocaleString('ru-RU')}
        </span>
      )}
    </RTabs.Trigger>
  )
}

export function TabContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RTabs.Content value={value} className="focus-visible:outline-none">
      {children}
    </RTabs.Content>
  )
}
