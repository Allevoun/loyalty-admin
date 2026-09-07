import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import * as RCheckbox from '@radix-ui/react-checkbox'
import { cn } from '@/lib/cn'

/* ---------------- Field wrapper ---------------- */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      {label && <span className="text-[11.5px] font-medium text-text-muted">{label}</span>}
      {children}
      {hint && <span className="text-[11px] text-text-subtle">{hint}</span>}
    </label>
  )
}

const inputBase =
  'h-8 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-2.5 text-[13px] text-text placeholder:text-text-subtle ' +
  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  ),
)
Input.displayName = 'Input'

/** Нативный select — для простых списков фильтров */
export const NativeSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      inputBase,
      'appearance-none bg-[length:16px] bg-[right_6px_center] bg-no-repeat pr-7',
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238593a6' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
))
NativeSelect.displayName = 'NativeSelect'

/* ---------------- Checkbox ---------------- */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean | 'indeterminate'
  onCheckedChange: (v: boolean) => void
  label?: ReactNode
  className?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 select-none', className)}>
      <RCheckbox.Root
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-strong bg-surface',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        )}
      >
        <RCheckbox.Indicator>
          {checked === 'indeterminate' ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 5.5l2.5 2.5 4.5-6"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      {label && <span className="text-[12.5px] text-text">{label}</span>}
    </label>
  )
}
