import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'default' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-text hover:bg-primary-hover border border-transparent shadow-[var(--shadow)]',
  default:
    'bg-surface text-text hover:bg-surface-2 border border-border-strong shadow-[var(--shadow)]',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text border border-transparent',
  subtle: 'bg-surface-2 text-text hover:bg-surface-3 border border-transparent',
  danger: 'bg-neg text-white hover:opacity-90 border border-transparent',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-8 px-3 text-[13px] gap-2 rounded-[var(--radius-md)]',
  icon: 'h-8 w-8 justify-center rounded-[var(--radius-md)]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center font-medium select-none whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
