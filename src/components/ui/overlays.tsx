import type { ReactNode } from 'react'
import * as RTooltip from '@radix-ui/react-tooltip'
import * as RPopover from '@radix-ui/react-popover'
import * as RDialog from '@radix-ui/react-dialog'
import * as RDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/cn'

/* ---------------- Tooltip ---------------- */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={250} skipDelayDuration={80}>
      {children}
    </RTooltip.Provider>
  )
}

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  if (!content) return <>{children}</>
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={5}
          className="z-50 max-w-xs rounded-[var(--radius-sm)] border border-border-strong bg-surface px-2 py-1 text-[11.5px] text-text shadow-[var(--shadow-lg)] animate-in"
        >
          {content}
          <RTooltip.Arrow className="fill-[var(--surface)]" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  )
}

/* ---------------- Popover ---------------- */
export function Popover({
  trigger,
  children,
  align = 'end',
  className,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 rounded-[var(--radius-lg)] border border-border-strong bg-surface p-3 shadow-[var(--shadow-lg)] animate-in',
            className,
          )}
        >
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  )
}

/* ---------------- Dialog ---------------- */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <RDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-[var(--radius-lg)] border border-border-strong bg-surface shadow-[var(--shadow-lg)] animate-in',
            className,
          )}
        >
          <div className="border-b border-border px-5 py-3.5">
            <RDialog.Title className="text-[14px] font-semibold text-text">{title}</RDialog.Title>
            {description && (
              <RDialog.Description className="mt-1 text-[12px] text-text-muted">
                {description}
              </RDialog.Description>
            )}
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

/* ---------------- DropdownMenu ---------------- */
export const Dropdown = RDropdown.Root
export const DropdownTrigger = RDropdown.Trigger

export function DropdownContent({
  children,
  align = 'end',
}: {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  return (
    <RDropdown.Portal>
      <RDropdown.Content
        align={align}
        sideOffset={6}
        className="z-50 min-w-[180px] rounded-[var(--radius-md)] border border-border-strong bg-surface p-1 shadow-[var(--shadow-lg)] animate-in"
      >
        {children}
      </RDropdown.Content>
    </RDropdown.Portal>
  )
}

export function DropdownItem({
  children,
  onSelect,
  danger,
}: {
  children: ReactNode
  onSelect?: () => void
  danger?: boolean
}) {
  return (
    <RDropdown.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[12.5px] outline-none',
        'data-[highlighted]:bg-surface-2',
        danger ? 'text-neg' : 'text-text',
      )}
    >
      {children}
    </RDropdown.Item>
  )
}

export function DropdownSeparator() {
  return <RDropdown.Separator className="my-1 h-px bg-border" />
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <RDropdown.Label className="px-2 py-1 text-[10.5px] font-medium uppercase tracking-wide text-text-subtle">
      {children}
    </RDropdown.Label>
  )
}
