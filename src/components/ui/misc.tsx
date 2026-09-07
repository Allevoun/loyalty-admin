import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ---------------- Badge ---------------- */
type Tone = 'neutral' | 'pos' | 'neg' | 'warn' | 'info' | 'primary'
const toneMap: Record<Tone, string> = {
  neutral: 'bg-neutral-weak text-text-muted',
  pos: 'bg-pos-weak text-pos',
  neg: 'bg-neg-weak text-neg',
  warn: 'bg-warn-weak text-warn',
  info: 'bg-info-weak text-info',
  primary: 'bg-primary-weak text-primary',
}
export function Badge({
  tone = 'neutral',
  className,
  children,
  dot,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium leading-4 whitespace-nowrap',
        toneMap[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow)]',
        className,
      )}
      {...props}
    />
  )
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 border-b border-border px-4 py-3', className)}
      {...props}
    />
  )
}
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[13px] font-semibold text-text', className)} {...props} />
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />
}

/* ---------------- Spinner ---------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent align-[-2px] animate-spin-slow',
        className,
      )}
      aria-hidden
    />
  )
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-surface-3', className)} />
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  title,
  hint,
  icon,
  action,
}: {
  title: string
  hint?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon && <div className="text-text-subtle">{icon}</div>}
      <div className="text-[13px] font-medium text-text">{title}</div>
      {hint && <div className="max-w-sm text-[12px] text-text-muted">{hint}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ---------------- Kbd ---------------- */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-text-muted">
      {children}
    </kbd>
  )
}

/* ---------------- Stat ---------------- */
export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'pos' | 'neg' | 'warn'
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface-2/50 px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">{label}</div>
      <div
        className={cn(
          'mt-1 text-[18px] font-semibold tabular-nums',
          tone === 'pos' && 'text-pos',
          tone === 'neg' && 'text-neg',
          tone === 'warn' && 'text-warn',
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11.5px] text-text-muted">{sub}</div>}
    </div>
  )
}

/* ---------------- DefinitionList ---------------- */
export function DList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('grid grid-cols-[minmax(0,180px)_1fr] gap-x-4 gap-y-2.5', className)}>{children}</dl>
}
export function DRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-[12px] text-text-muted">{label}</dt>
      <dd className="min-w-0 text-[12.5px] text-text">{children}</dd>
    </>
  )
}
