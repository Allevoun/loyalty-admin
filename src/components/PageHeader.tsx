import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <div className="mb-5">
      {back && (
        <Link
          to={back.to}
          className="mb-1.5 inline-flex items-center gap-1 text-[12px] text-text-muted hover:text-text"
        >
          <span className="text-[14px] leading-none">‹</span> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold tracking-[-0.01em] text-text">{title}</h1>
          {subtitle && <div className="mt-0.5 text-[12.5px] text-text-muted">{subtitle}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
